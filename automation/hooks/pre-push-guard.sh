#!/usr/bin/env bash
# Iron Law #4 guard. Blok perintah push dari sesi Claude Code tanpa persetujuan operator.
# Hook PreToolUse (matcher: Bash). Baca JSON dari stdin, keluarkan keputusan deny bila
# perintah benar-benar menjalankan push tanpa token persetujuan SEOBOOST_PUSH_OK=1.
# Fail-open: stdin yang bukan JSON valid diloloskan supaya hook tidak membrick sesi.
#
# Revisi 3 Sep 2026, memperbaiki positif palsu yang terukur.
#
# Pola lama `\bgit\b[^\n;|&]{0,200}\bpush\b` mencocokkan ke mana pun di dalam teks
# perintah, termasuk ke badan heredoc. Akibatnya menulis dokumen yang MEMBICARAKAN
# push ikut diblokir. Kejadian nyata: menulis operating prompt yang butir pertamanya
# berbunyi "git push, merge to a production branch" ditolak hook, padahal tidak ada
# perintah git satu pun di situ. Penjaga yang menghalangi pekerjaan yang sah akan
# ditembus orang dengan token, dan token yang dipakai sebagai kebiasaan berhenti
# menjadi persetujuan.
#
# Dua penyaringan menggantikannya, keduanya sengaja bias ke arah memblokir:
#
# 1. Badan heredoc dibuang SEBELUM dicocokkan, TETAPI hanya bila baris pembukanya
#    tidak memanggil penafsir (bash, sh, node, python, eval, dan sejenisnya) pada
#    posisi perintah. `cat > berkas <<EOF` membuang badannya; `bash <<EOF` tidak,
#    sebab badan yang disalurkan ke penafsir memang dijalankan.
#
# 2. Sisanya dipecah menjadi statement, lalu push hanya dihitung bila `git` berdiri
#    di POSISI PERINTAH, sesudah penugasan variabel dan awalan seperti sudo dibuang.
#    Backtick dan $( ikut menjadi pemisah, sebab keduanya menjalankan isinya.
#    Dengan begitu "1. `git push`, merge to ..." di dalam prosa tidak lagi terhitung,
#    sedangkan `git push`, `git -C dir push`, dan `env X=1 git push` tetap terhitung.
set -euo pipefail

payload=$(cat 2>/dev/null || true)

decision=$(printf '%s' "$payload" | node -e '
let d = "";
process.stdin.on("data", c => d += c).on("end", () => {
  let out = "allow";
  try {
    const j = JSON.parse(d);
    const cmd = (j && j.tool_name === "Bash" && j.tool_input && typeof j.tool_input.command === "string")
      ? j.tool_input.command : "";

    const INTERP = /(^|[;|&]|\$\()\s*(?:sudo\s+|env\s+|nohup\s+|time\s+)*(?:\w+=\S*\s+)*(?:bash|sh|zsh|ksh|dash|node|deno|bun|python3?|perl|ruby|eval|xargs)\b/;

    function buangHeredoc(teks) {
      const baris = teks.split("\n");
      const sisa = [];
      let i = 0;
      while (i < baris.length) {
        const b = baris[i];
        sisa.push(b);
        const re = /<<-?\s*([\x27"]?)([A-Za-z_][A-Za-z0-9_]*)\1/g;
        const token = [];
        let m;
        while ((m = re.exec(b)) !== null) token.push(m[2]);
        i++;
        if (token.length === 0 || INTERP.test(b)) continue;
        for (const t of token) {
          while (i < baris.length && baris[i].trim() !== t) i++;
          if (i < baris.length) i++;
        }
      }
      return sisa.join("\n");
    }

    // Subperintah git, bukan sekadar kata "push" di mana pun dalam statement.
    // Tanpa ini `git log --grep=push` ikut diblokir, dan itu terbukti pada uji
    // 3 Sep 2026. Opsi global git dilewati berikut argumennya bila terpisah.
    const OPSI_BERARGUMEN = ["-C", "-c", "--namespace", "--git-dir", "--work-tree", "--exec-path", "--super-prefix"];
    function subperintahGit(s) {
      const tok = s.split(/\s+/).filter(Boolean);
      if (tok[0] !== "git") return null;
      let i = 1;
      while (i < tok.length) {
        const t = tok[i];
        if (t.charAt(0) !== "-") return t;
        i += OPSI_BERARGUMEN.indexOf(t) !== -1 ? 2 : 1;
      }
      return null;
    }

    function pushDiPosisiPerintah(teks) {
      const stmt = teks.split(/\n|;|&&|\|\||\||\(|\)|`|\$\(/);
      for (let s of stmt) {
        s = s.trim();
        s = s.replace(/^(?:sudo\s+|env\s+|nohup\s+|time\s+)*/, "");
        s = s.replace(/^(?:\w+=(?:"[^"]*"|[\x27][^\x27]*[\x27]|\S*)\s+)*/, "");
        if (subperintahGit(s) === "push") return true;
      }
      return false;
    }

    const isPush = pushDiPosisiPerintah(buangHeredoc(cmd));
    const hasToken = cmd.indexOf("SEOBOOST_PUSH_OK=1") !== -1;
    if (isPush && !hasToken) out = "deny";
  } catch (e) { /* fail-open */ }
  process.stdout.write(out);
});' 2>/dev/null || printf 'allow')

if [ "$decision" = "deny" ]; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Iron Law #4 - push butuh persetujuan operator. Setelah operator setuju di percakapan, jalankan ulang perintah dengan awalan SEOBOOST_PUSH_OK=1."}}
JSON
fi
exit 0
