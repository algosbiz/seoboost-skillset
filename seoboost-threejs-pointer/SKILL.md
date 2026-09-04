---
name: seoboost-threejs-pointer
description: Use when a SEO Boost project needs 3D/WebGL scenes, immersive interactions, or Awwwards-level 3D visuals (portfolio sites, premium marketing pages, product showcases) — "3D scene", "WebGL", "Three.js", "interactive 3D", "particle effects", "immersive web experience with 3D". Points to the upstream Three.js skill set to install on demand; does NOT bundle the content itself (see note on licensing below).
---

# Three.js — Pointer Skill (tidak divendor, install saat dibutuhkan)

## Kenapa ini cuma pointer, bukan skill lengkap

Repo sumber ([CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills)) **tidak
mencantumkan lisensi** (tidak ada file LICENSE). Tanpa lisensi eksplisit, hak cipta penuh
tetap di penulis asli — publik boleh melihat & memakainya, tapi SEO Boost tidak menyalin
isinya (vendoring) ke repo sendiri tanpa izin eksplisit. Jadi skill ini HANYA menunjuk ke sumbernya,
bukan menyalin kontennya.

## Kapan dipakai

Project SEO Boost yang butuh 3D/immersive: portfolio premium, landing page showcase produk,
interaksi WebGL, particle effects — biasanya masuk kategori yang sama dengan `seoboost-top-design`
(Awwwards-level, immersive). Sebagian besar project SEO Boost (Project E, TenantPOS, CHC, ReIndeks)
adalah dashboard bisnis dan TIDAK butuh ini — jangan dipasang default, hanya saat memang
relevan.

## Cara pakai (install langsung dari sumber, on-demand)

```bash
npx skills add CloudAI-X/threejs-skills
```

Ini akan menawarkan picker interaktif untuk 10 sub-skill yang tersedia di upstream:
- `threejs-fundamentals` — setup scene, camera, renderer dasar
- `threejs-geometry` — bentuk geometris, mesh
- `threejs-materials` — material & shading
- `threejs-lighting` — pencahayaan scene
- `threejs-textures` — tekstur & mapping
- `threejs-animation` — animasi objek 3D
- `threejs-interaction` — interaksi user (drag, click, hover di scene 3D)
- `threejs-loaders` — load model GLTF/OBJ dll.
- `threejs-postprocessing` — efek post-processing (bloom, dof, dll.)
- `threejs-shaders` — custom shader (GLSL)

## Terkait

Untuk arah desain motion/immersive secara keseluruhan (bukan implementasi teknis), lihat
`seoboost-top-design`. Untuk animasi DOM/scroll 2D (bukan 3D/WebGL), lihat `gsap-scrolltrigger`
dan `gsap-core` (official GreenSock; `seoboost-gsap-*` sudah deprecated sejak 2026-08-07).
