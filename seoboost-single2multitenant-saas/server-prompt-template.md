# Server-Side Activation Prompt — TEMPLATE

The local agent fills the `<PLACEHOLDER>` slots, then the user pastes the result into the **server-side agent** (the one with shell access to the production VPS). This runs AFTER the migration chain (expand→backfill→contract) has shipped via CI and the app is healthy — but while the app still connects as the **owner** role, so **RLS is enabled-but-not-yet-protecting**. Step B makes RLS real and onboards tenant #2.

> Fill these before sending:
> `<DB_CONTAINER>` postgres container · `<DB>` db name · `<OWNER_ROLE>` migration owner role · `<DB_BIND>` host:port (e.g. 127.0.0.1:54XX) · `<BACKEND_DIR>` backend dir on host · `<APP_CONTAINER>` app container · `<API_HEALTH_URL>` e.g. http://127.0.0.1:PORT/api/docs · `<APP_URL>` public FE url · `<OWNER_EMAIL>` existing tenant owner login (for smoke) · `<T2_EMAIL>`/`<T2_PW>`/`<T2_NAME>`/`<T2_ORG>`/`<T2_SLUG>` new tenant · `<EXPECTED_SALES>` existing tenant's known row count.

---

You are operating on a LIVE production server. The cutover SQL already ran via CI/CD (migrations through the RLS contract; the existing tenant's data is multi-tenant; app is healthy). RLS is **enabled but not yet protecting**, because the app still connects as the owner role `<OWNER_ROLE>`. This Step makes RLS real and onboards tenant #2.

⚠️ This touches LIVE production data. **Verify every step's output before the next. STOP and report on ANY mismatch. DO NOT delete or modify the existing tenant's data.**

Facts to confirm first: DB container `<DB_CONTAINER>`, db `<DB>`, owner role `<OWNER_ROLE>`, bind `<DB_BIND>`, backend dir `<BACKEND_DIR>`, app container `<APP_CONTAINER>`, host `.env` holds `DATABASE_URL` (currently → owner).

## B1 — Set the `app_rls` password (role was created by migration with a placeholder)

```bash
APP_RLS_PW="$(openssl rand -base64 24 | tr -d '/+=' | head -c 28)"; echo "app_rls password = $APP_RLS_PW"   # RECORD THIS
docker exec -i <DB_CONTAINER> psql -U <OWNER_ROLE> -d <DB> -v ON_ERROR_STOP=1 \
  -c "ALTER ROLE app_rls PASSWORD '$APP_RLS_PW';"
```

**Verify (also the first real RLS proof):**
```bash
ORG="$(docker exec -i <DB_CONTAINER> psql -U <OWNER_ROLE> -d <DB> -tAc "SELECT id FROM organization LIMIT 1;")"
docker exec -e PGPASSWORD="$APP_RLS_PW" -i <DB_CONTAINER> psql -U app_rls -d <DB> -tAc \
  "BEGIN; SELECT set_config('app.current_tenant','$ORG',true); SELECT count(*) FROM sales; COMMIT;"   # MUST = <EXPECTED_SALES>
docker exec -e PGPASSWORD="$APP_RLS_PW" -i <DB_CONTAINER> psql -U app_rls -d <DB> -tAc \
  "SELECT count(*) FROM sales;"                                                                        # MUST = 0 (fail-closed)
```
First = `<EXPECTED_SALES>`, second = `0`. Otherwise STOP & report.

## B2 — Repoint the runtime to `app_rls` (this is what makes RLS real)

```bash
cd <BACKEND_DIR>
cp .env .env.bak.$(date +%F-%H%M%S)                                    # backup
OLD_URL="$(grep -E '^DATABASE_URL=' .env | head -n1 | cut -d= -f2-)"
grep -q '^MIGRATION_DATABASE_URL=' .env || echo "MIGRATION_DATABASE_URL=$OLD_URL" >> .env   # owner URL kept for CI DDL
sed -i "s#^DATABASE_URL=.*#DATABASE_URL=postgresql://app_rls:$APP_RLS_PW@<DB_BIND>/<DB>#" .env
grep -E '^(DATABASE_URL|MIGRATION_DATABASE_URL)=' .env                 # DATABASE_URL→app_rls, MIGRATION→owner
```

Now apply the env. **`docker restart` does NOT reload `--env-file` — recreate (or redeploy with `--env-file`):**
```bash
docker rm -f <APP_CONTAINER> && <your run/redeploy command with --env-file .env>
# (if your deploy uses restart-with-env-file, trigger the redeploy step; a bare `docker restart` will NOT pick up the new URL)
sleep 8
```

**Verify:**
```bash
curl -sS -o /dev/null -w "API %{http_code}\n" <API_HEALTH_URL>         # MUST be 200
docker logs <APP_CONTAINER> --tail 30                                   # no DB-connection / role auth errors
```
Then **smoke-login `<OWNER_EMAIL>`** at `<APP_URL>` — the existing tenant must see their data exactly as before.

**Rollback B2** (if the app can't connect / log shows `role "app_rls" ... authentication failed`): the password in `.env` is wrong →
```bash
cp .env.bak.<ts> .env && docker rm -f <APP_CONTAINER> && <redeploy with --env-file .env>
```
then report.

## B3 — Provision tenant #2 (`user`/`organization`/`member` are not RLS'd, so this works under app_rls)

```bash
ls dist/scripts/provision-tenant.js 2>/dev/null || npm run build
docker exec -i <APP_CONTAINER> node dist/scripts/provision-tenant.js \
  --email <T2_EMAIL> --password '<T2_PW>' --name '<T2_NAME>' --org '<T2_ORG>' --slug <T2_SLUG>
```
(Fallback: run from host with `DATABASE_URL`=app_rls + `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` from `.env` if the script isn't in the image.)

**Verify isolation:**
```bash
docker exec -i <DB_CONTAINER> psql -U <OWNER_ROLE> -d <DB> -tAc \
  "SELECT o.name, m.role FROM organization o JOIN member m ON m.\"organizationId\"=o.id JOIN \"user\" u ON u.id=m.\"userId\" WHERE u.email='<T2_EMAIL>';"   # '<T2_ORG>' + owner
T2="$(docker exec -i <DB_CONTAINER> psql -U <OWNER_ROLE> -d <DB> -tAc "SELECT m.\"organizationId\" FROM member m JOIN \"user\" u ON u.id=m.\"userId\" WHERE u.email='<T2_EMAIL>';")"
docker exec -e PGPASSWORD="$APP_RLS_PW" -i <DB_CONTAINER> psql -U app_rls -d <DB> -tAc \
  "BEGIN; SELECT set_config('app.current_tenant','$T2',true); SELECT count(*) FROM sales; COMMIT;"   # MUST = 0 (new tenant, NOT the existing one's data)
```
Then smoke-login tenant #2 → lands in their own empty tenant, not the existing tenant's data.

## Report back
- B1: app_rls password set + recorded? RLS proof (tenant-set sees `<EXPECTED_SALES>`, no-tenant = 0)?
- B2: app healthy (API 200) + existing owner still logs in + sees their data?
- B3: tenant #2 created + isolated (0 rows under their org) + can log in?

**On ANY failure → run that step's rollback + report. DO NOT proceed.**
