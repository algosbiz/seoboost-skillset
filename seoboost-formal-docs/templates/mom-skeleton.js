// ============================================================================
// TEMPLATE — Minutes of Meeting (MoM)
// Source style: seoboost-formal-docs skill v1.0
// Typical length: 2-6 pages
// ============================================================================
//
// Usage: prepend helpers.js, run:
//   cat ../seoboost-formal-docs/helpers.js build.js > build_combined.js
//   node build_combined.js
// ============================================================================

// ----------------------------------------------------------------------------
// COVER / HEADER PAGE (compact for MoM)
// ----------------------------------------------------------------------------
const cover = [
  new Paragraph({ spacing: { before: 1200, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "MINUTES OF MEETING", size: 40, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<Meeting Topic Title>", size: 26, color: ACCENT, italics: true, font: "Arial" })]}),

  // Meeting metadata
  buildTable(
    ["Field", "Detail"],
    [
      ["Date", "DD Month YYYY"],
      ["Time", "HH:MM – HH:MM WITA"],
      ["Location", "Online (Zoom/Meet) / Office SEO Boost"],
      ["Meeting Type", "Discovery / Status Update / Decision / Review"],
      ["Organizer", "<Name>, PT Algo Sea Biz"],
      ["Note Taker", "<Name>"]
    ],
    [2400, 6960]
  ),

  SP(),
  H3("Attendees"),
  buildTable(
    ["Name", "Role / Organization", "Status"],
    [
      ["<Name 1>", "<Role>, <Org>", "Present"],
      ["<Name 2>", "<Role>, <Org>", "Present"],
      ["<Name 3>", "<Role>, <Org>", "Apologies"]
    ],
    [2800, 4560, 2000]
  ),
  PB()
];

// ----------------------------------------------------------------------------
// SECTION 1 — AGENDA
// ----------------------------------------------------------------------------
const section1 = [
  H1("1", "Agenda", true),
  P("Pertemuan ini diadakan untuk membahas:"),
  NL("[Agenda item 1]"),
  NL("[Agenda item 2]"),
  NL("[Agenda item 3]"),
];

// ----------------------------------------------------------------------------
// SECTION 2 — DISCUSSION SUMMARY
// ----------------------------------------------------------------------------
const section2 = [
  H1("2", "Discussion Summary"),

  H2("2.1 [Topik 1]"),
  P("[Ringkasan diskusi topik pertama. Catat poin-poin kunci, pertanyaan yang muncul, dan respons.]"),
  BL("[Poin diskusi]"),
  BL("[Poin diskusi]"),

  H2("2.2 [Topik 2]"),
  P("[Ringkasan diskusi topik kedua.]"),

  GAP(),
  Callout("KEY INSIGHT",
    "[Single-sentence insight atau temuan paling penting dari diskusi yang perlu di-highlight.]",
    ACCENT),
  GAP()
];

// ----------------------------------------------------------------------------
// SECTION 3 — DECISIONS
// ----------------------------------------------------------------------------
const section3 = [
  H1("3", "Decisions"),
  P("Keputusan yang diambil dalam pertemuan ini:"),

  buildTable(
    ["#", "Decision", "Owner", "Rationale"],
    [
      ["D-1", "[Keputusan 1]", "<Name>", "[Alasan singkat]"],
      ["D-2", "[Keputusan 2]", "<Name>", "[Alasan singkat]"],
    ],
    [600, 4000, 1600, 3160]
  )
];

// ----------------------------------------------------------------------------
// SECTION 4 — ACTION ITEMS
// ----------------------------------------------------------------------------
const section4 = [
  H1("4", "Action Items"),
  P("Tindak lanjut yang disepakati:"),

  buildTable(
    ["#", "Action", "Owner", "Deadline", "Status"],
    [
      ["A-1", "[Action item 1]", "<Name>", "DD Month", "Open"],
      ["A-2", "[Action item 2]", "<Name>", "DD Month", "Open"],
    ],
    [600, 4000, 1500, 1700, 1560]
  ),

  GAP(),
  Callout("NEXT MEETING",
    "Tanggal: [Tanggal] | Topik: [Topik] | Owner agenda: <Name>"),
  GAP()
];

// ----------------------------------------------------------------------------
// SECTION 5 — APPENDICES (optional)
// ----------------------------------------------------------------------------
const section5 = [
  H1("5", "Appendices"),

  H2("Appendix A — References"),
  BL("[Document atau link 1]"),
  BL("[Document atau link 2]"),

  H2("Appendix B — Open Questions"),
  P("Pertanyaan yang belum terjawab dan akan dibahas di pertemuan berikutnya:"),
  BL("[Pertanyaan 1]"),
  BL("[Pertanyaan 2]")
];

// ----------------------------------------------------------------------------
// FOOTER / SIGN-OFF
// ----------------------------------------------------------------------------
const signoff = [
  PB(),
  new Paragraph({ spacing: { before: 480, after: 240 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Sign-Off", size: 28, bold: true, color: CHARCOAL, font: "Arial" })] }),
  P("Minutes ini disiapkan oleh <Note Taker> dan didistribusikan kepada seluruh attendee. Mohon konfirmasi atau koreksi dalam 2 hari kerja setelah distribusi. Setelah masa konfirmasi berakhir, minutes dianggap final."),
  SP(),
  buildTable(
    ["Reviewed By", "Role", "Date / Approval"],
    [
      ["<Name>", "<Role>", "____________________"],
      ["<Name>", "<Role>", "____________________"]
    ],
    [3120, 3120, 3120]
  ),
  SP(),
  new Paragraph({ spacing: { before: 600, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "— End of Minutes —", size: 18, italics: true, color: "777777", font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "MoM <Topic> | DD Month YYYY | PT Algo Sea Biz", size: 16, color: "777777", font: "Arial" })]})
];

// ----------------------------------------------------------------------------
// ASSEMBLY (same boilerplate as PRD; only header text changes)
// ----------------------------------------------------------------------------
const doc = new Document({
  creator: "PT Algo Sea Biz",
  title: "MoM <Topic> — DD Month YYYY",
  description: "Minutes of Meeting",
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
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
                   style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                   style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: "MINUTES OF MEETING  ", size: 16, bold: true, color: CHARCOAL, font: "Arial" }),
            new TextRun({ text: "│  <Topic>  │  Confidential", size: 16, color: "777777", font: "Arial" })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: "Page ", size: 16, color: "777777", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "777777", font: "Arial" }),
            new TextRun({ text: " of ", size: 16, color: "777777", font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "777777", font: "Arial" })
          ]
        })]
      })
    },
    children: [
      ...cover,
      ...section1, ...section2, ...section3, ...section4, ...section5,
      ...signoff
    ].flat()
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("./MoM_<Topic>_<Date>.docx", buffer);
  console.log("✓ MoM generated:", (buffer.length / 1024).toFixed(1), "KB");
});
