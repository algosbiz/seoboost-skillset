// ============================================================================
// TEMPLATE — Business Proposal
// Source style: seoboost-formal-docs skill v1.0
// Typical length: 15-30 pages
// ============================================================================

const cover = [
  new Paragraph({ spacing: { before: 1800, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PROPOSAL", size: 56, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<Project / Engagement Title>", size: 28, color: ACCENT, italics: true, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "BUSINESS PROPOSAL", size: 32, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 800 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Version 1.0", size: 22, color: "555555", font: "Arial" })]}),

  new Paragraph({ spacing: { before: 1000, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Prepared for:", size: 18, color: "555555", font: "Arial" })]}),
  new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<Client / Organization Name>", size: 26, bold: true, color: CHARCOAL, font: "Arial" })]}),

  new Paragraph({ spacing: { before: 400, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Prepared by:", size: 18, color: "555555", font: "Arial" })]}),
  new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PT Algo Sea Biz (SEO Boost) — SEO Boost", size: 22, bold: true, color: CHARCOAL, font: "Arial" })]}),

  new Paragraph({ spacing: { before: 400, after: 80 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Confidential — For Authorized Recipients Only", size: 18, color: "777777", italics: true, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 80, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Month YYYY", size: 20, color: "555555", font: "Arial" })]}),
  PB()
];

const tocRows = [
  ["1", "Executive Summary", "1"],
  ["2", "Background & Context", "3"],
  ["3", "Understanding of Requirements", "5"],
  ["4", "Proposed Solution", "7"],
  ["5", "Methodology & Approach", "10"],
  ["6", "Scope of Work", "13"],
  ["7", "Deliverables", "15"],
  ["8", "Timeline & Milestones", "17"],
  ["9", "Investment & Pricing", "19"],
  ["10", "Team & Capabilities", "21"],
  ["11", "Why SEO Boost", "23"],
  ["12", "Terms & Conditions", "25"],
  ["13", "Next Steps", "27"]
];

const toc = [
  new Paragraph({ spacing: { before: 0, after: 240 },
    children: [new TextRun({ text: "Table of Contents", size: 36, bold: true, color: CHARCOAL, font: "Arial" })]}),
  buildTable(["#", "Section", "Page"], tocRows, [800, 7600, 960]),
  PB()
];

const section1 = [
  H1("1", "Executive Summary", true),
  P("[2-3 paragraf yang merangkum: pemahaman SEO Boost terhadap kebutuhan klien, solusi yang ditawarkan, value proposition utama, timeline ringkas, dan investasi keseluruhan.]"),

  H2("Quick Facts"),
  buildMetricCards([
    { label: "DURATION", value: "X months" },
    { label: "TEAM", value: "X people" },
    { label: "PHASES", value: "X phases" },
    { label: "INVESTMENT", value: "Rp X" },
  ]),

  Callout("VALUE PROPOSITION",
    "[One-line statement yang menangkap inti tawaran — apa yang akan klien dapatkan dan mengapa SEO Boost adalah pilihan tepat.]",
    ACCENT)
];

const section2 = [
  H1("2", "Background & Context"),
  H2("2.1 About Your Organization"),
  P("[Pemahaman SEO Boost tentang klien — industry, size, current challenges, strategic context.]"),

  H2("2.2 Market Context"),
  P("[Konteks market atau regulatory yang relevan dengan engagement ini.]"),

  H2("2.3 Why Now"),
  P("[Argumen mengapa engagement ini relevan untuk klien sekarang.]")
];

const section3 = [
  H1("3", "Understanding of Requirements"),
  P("Berdasarkan diskusi dan dokumen yang telah dipertukarkan, SEO Boost memahami kebutuhan klien sebagai berikut:"),
  H2("3.1 Functional Needs"),
  BL("[Need 1]"),
  BL("[Need 2]"),
  H2("3.2 Non-Functional Needs"),
  BL("[Performance, security, compliance, dst.]"),
  H2("3.3 Constraints"),
  BL("[Budget, timeline, technical, regulatory]")
];

const section4 = [
  H1("4", "Proposed Solution"),
  P("[High-level deskripsi solusi yang diusulkan.]"),
  H2("4.1 Solution Architecture"),
  P("[Diagram-level pemaparan arsitektur. Untuk diagram visual, generate via TikZ/Mermaid lalu insert sebagai image.]"),
  H2("4.2 Key Components"),
  buildTable(
    ["Komponen", "Fungsi", "Teknologi"],
    [
      ["Frontend", "[Fungsi]", "Next.js 14"],
      ["Backend", "[Fungsi]", "NestJS / FastAPI"],
      ["Database", "[Fungsi]", "PostgreSQL"]
    ],
    [2400, 4400, 2560]
  )
];

const section5 = [
  H1("5", "Methodology & Approach"),
  P("SEO Boost menggunakan pendekatan iteratif dengan checkpoint reguler:"),
  buildProcessFlow(["DISCOVER", "DESIGN", "BUILD", "VALIDATE", "DEPLOY"]),
  SP(),
  H2("5.1 Discover Phase"),
  P("[Aktivitas, output, durasi.]"),
  H2("5.2 Design Phase"),
  P("[Aktivitas, output, durasi.]"),
  H2("5.3 Build Phase"),
  P("[Aktivitas, output, durasi.]"),
  H2("5.4 Validate Phase"),
  P("[Aktivitas, output, durasi.]"),
  H2("5.5 Deploy Phase"),
  P("[Aktivitas, output, durasi.]")
];

const section6 = [
  H1("6", "Scope of Work"),
  H2("6.1 In-Scope"),
  buildTable(
    ["Module", "Description", "Acceptance"],
    [
      ["Module A", "[Description]", "[Criteria]"],
      ["Module B", "[Description]", "[Criteria]"]
    ],
    [2200, 4360, 2800]
  ),
  H2("6.2 Out-of-Scope"),
  P("Hal-hal berikut TIDAK termasuk dalam scope dan akan menjadi engagement terpisah jika dibutuhkan:"),
  BL("[Out-of-scope item 1]"),
  BL("[Out-of-scope item 2]")
];

const section7 = [
  H1("7", "Deliverables"),
  buildTable(
    ["Phase", "Deliverable", "Format", "Timing"],
    [
      ["Discover", "Discovery report", "DOCX + PDF", "End of Week 2"],
      ["Design", "PRD + UX mockup", "DOCX + Figma", "End of Week 4"],
      ["Build", "Working software", "Repository + demo", "End of Week 12"],
      ["Validate", "UAT report", "DOCX + PDF", "End of Week 14"],
      ["Deploy", "Production deployment", "Live system + runbook", "End of Week 16"]
    ],
    [1700, 3000, 2160, 2500]
  )
];

const section8 = [
  H1("8", "Timeline & Milestones"),
  P("Timeline keseluruhan: [X minggu / bulan] dari kick-off."),
  buildTable(
    ["Milestone", "Target Date", "Owner", "Acceptance"],
    [
      ["Kick-off", "Week 0", "Both", "Signed SOW"],
      ["Discovery complete", "Week 2", "SEO Boost", "Approved discovery report"],
      ["Design sign-off", "Week 4", "Client", "PRD + mockup approved"],
      ["MVP ready", "Week 8", "SEO Boost", "Demo + UAT plan"],
      ["UAT complete", "Week 14", "Client", "UAT report sign-off"],
      ["Go-live", "Week 16", "Both", "Production deployment"]
    ],
    [2400, 1700, 1500, 3760]
  )
];

const section9 = [
  H1("9", "Investment & Pricing"),

  H2("9.1 Investment Summary"),
  buildTable(
    ["Phase", "Effort (man-days)", "Investment (Rp)"],
    [
      ["Discover", "20", "Rp X,XXX,XXX"],
      ["Design", "30", "Rp X,XXX,XXX"],
      ["Build", "60", "Rp X,XXX,XXX"],
      ["Validate", "15", "Rp X,XXX,XXX"],
      ["Deploy", "10", "Rp X,XXX,XXX"],
      [{ text: "TOTAL", bold: true }, { text: "135", bold: true }, { text: "Rp XX,XXX,XXX", bold: true }]
    ],
    [3000, 3000, 3360]
  ),

  H2("9.2 Payment Schedule"),
  buildTable(
    ["Payment", "Trigger", "Amount"],
    [
      ["Down payment (30%)", "Signed SOW", "Rp X,XXX,XXX"],
      ["Milestone 1 (30%)", "Design sign-off", "Rp X,XXX,XXX"],
      ["Milestone 2 (30%)", "MVP ready", "Rp X,XXX,XXX"],
      ["Final (10%)", "Go-live", "Rp X,XXX,XXX"]
    ],
    [2800, 3500, 3060]
  ),

  H2("9.3 What's Included / Excluded"),
  P("Investment di atas mencakup:"),
  BL("Tim SEO Boost sesuai komposisi di Section 10"),
  BL("Tools dan infrastruktur development standar SEO Boost"),
  BL("Dokumentasi (PRD, runbook, UAT report)"),
  BL("Training transfer ke tim klien (1 sesi)"),
  P("Tidak termasuk:"),
  BL("Biaya infrastruktur production (cloud, domain, SSL) — di-billing terpisah ke akun klien"),
  BL("License software pihak ketiga (jika diperlukan) — di-billing at-cost"),
  BL("Travel & expenses untuk on-site visit di luar Bali"),

  Callout("INVESTMENT VALIDITY",
    "Pricing ini berlaku selama 30 hari sejak tanggal proposal. Setelah masa berlaku, perlu re-confirmation.",
    ACCENT)
];

const section10 = [
  H1("10", "Team & Capabilities"),
  P("Tim yang akan menangani engagement ini terdiri dari:"),
  buildTable(
    ["Role", "Allocation", "Background"],
    [
      ["Project Lead", "20%", "[Background]"],
      ["Tech Lead", "50%", "[Background]"],
      ["Frontend Engineer", "100%", "[Background]"],
      ["Backend Engineer", "100%", "[Background]"],
      ["UX Designer", "30%", "[Background]"]
    ],
    [2400, 1800, 5160]
  )
];

const section11 = [
  H1("11", "Why SEO Boost"),
  H2("11.1 Track Record"),
  P("[Project relevan yang sudah dikerjakan SEO Boost.]"),
  H2("11.2 Technical Strengths"),
  BL("Modern stack: Next.js, NestJS, PostgreSQL, AI integration"),
  BL("AI-first approach to development productivity"),
  BL("Strong DevOps and deployment automation"),
  H2("11.3 Local Advantage"),
  P("[Bali presence, timezone alignment, IDR pricing, local context understanding.]")
];

const section12 = [
  H1("12", "Terms & Conditions"),
  H2("12.1 IP & Ownership"),
  P("[Standard IP transfer terms.]"),
  H2("12.2 Confidentiality"),
  P("[Mutual NDA terms.]"),
  H2("12.3 Warranty & Support"),
  P("[Bug fix warranty period, support availability.]"),
  H2("12.4 Change Requests"),
  P("[Process untuk scope change yang muncul setelah SOW signed.]")
];

const section13 = [
  H1("13", "Next Steps"),
  P("Untuk melanjutkan ke fase eksekusi:"),
  NL("Review proposal dan kirim feedback dalam 7 hari kerja"),
  NL("Diskusi clarifikasi (opsional, scheduling via email)"),
  NL("Sign-off SOW based on this proposal"),
  NL("Down payment processing"),
  NL("Kick-off meeting scheduling"),

  Callout("CONTACT",
    "Pertanyaan atau diskusi: <Email Project Lead> | <Phone> | PT Algo Sea Biz",
    CHARCOAL)
];

const closing = [
  PB(),
  new Paragraph({ spacing: { before: 480, after: 240 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Thank You", size: 36, bold: true, color: CHARCOAL, font: "Arial" })] }),
  P("Terima kasih atas kepercayaan kepada PT Algo Sea Biz. Kami siap berdiskusi lebih lanjut dan menjawab pertanyaan apapun terkait proposal ini."),
  SP(),
  new Paragraph({ spacing: { before: 600, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "— End of Proposal —", size: 18, italics: true, color: "777777", font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Proposal <Project> v1.0 | Month YYYY | PT Algo Sea Biz", size: 16, color: "777777", font: "Arial" })]})
];

const doc = new Document({
  creator: "PT Algo Sea Biz",
  title: "Proposal <Project> v1.0",
  description: "Business Proposal",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: CHARCOAL },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: CHARCOAL },
        paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: CHARCOAL },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 },
      children: [
        new TextRun({ text: "PROPOSAL  ", size: 16, bold: true, color: CHARCOAL, font: "Arial" }),
        new TextRun({ text: "│  <Project>  │  Confidential", size: 16, color: "777777", font: "Arial" })
      ]})]}) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
      children: [
        new TextRun({ text: "Page ", size: 16, color: "777777", font: "Arial" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "777777", font: "Arial" }),
        new TextRun({ text: " of ", size: 16, color: "777777", font: "Arial" }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "777777", font: "Arial" })
      ]})]}) },
    children: [
      ...cover, ...toc,
      ...section1, ...section2, ...section3, ...section4, ...section5,
      ...section6, ...section7, ...section8, ...section9, ...section10,
      ...section11, ...section12, ...section13,
      ...closing
    ].flat()
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("./Proposal_<Project>_v1.0.docx", buffer);
  console.log("✓ Proposal generated:", (buffer.length / 1024).toFixed(1), "KB");
});
