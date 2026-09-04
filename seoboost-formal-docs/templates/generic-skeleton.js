// ============================================================================
// TEMPLATE — Generic Formal Document (fallback)
// Source style: seoboost-formal-docs skill v1.0
// Use when: formal doc that doesn't fit PRD/MoM/Proposal/SDD specifically
// Examples: white paper, audiensi document, project charter, post-mortem,
//           feasibility study, RFP/RFQ response, concept note
// ============================================================================

const cover = [
  new Paragraph({ spacing: { before: 1800, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<DOCUMENT TITLE>", size: 56, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<Subtitle / Tagline>", size: 28, color: ACCENT, italics: true, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<DOCUMENT TYPE>", size: 32, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 800 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Version 1.0", size: 22, color: "555555", font: "Arial" })]}),

  new Paragraph({ spacing: { before: 1000, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PT Algo Sea Biz (SEO Boost)", size: 22, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<Distribution: Internal / Confidential / Public>", size: 18, color: "777777", italics: true, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 80, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Month YYYY", size: 20, color: "555555", font: "Arial" })]}),
  PB()
];

// TOC — adjust rows based on actual document structure
const toc = [
  new Paragraph({ spacing: { before: 0, after: 240 },
    children: [new TextRun({ text: "Table of Contents", size: 36, bold: true, color: CHARCOAL, font: "Arial" })]}),
  buildTable(["#", "Section", "Page"], [
    ["1", "<Section Title>", "1"],
    ["2", "<Section Title>", "X"],
    // ...add as needed
  ], [800, 7600, 960]),
  PB()
];

// Section pattern — replicate as needed
const section1 = [
  H1("1", "<Section Title>", true),  // firstPage = true for first H1
  P("[Body paragraph...]"),

  H2("1.1 <Subsection>"),
  P("[Body...]"),
  BL("[Bullet point]"),
  BL("[Bullet point]"),

  H2("1.2 <Subsection>"),
  buildTable(
    ["<Header 1>", "<Header 2>", "<Header 3>"],
    [
      ["<row 1 col 1>", "<row 1 col 2>", "<row 1 col 3>"],
      ["<row 2 col 1>", "<row 2 col 2>", "<row 2 col 3>"]
    ],
    [3120, 3120, 3120]
  ),

  Callout("KEY INSIGHT",
    "<Important statement that deserves emphasis>",
    ACCENT)  // or CHARCOAL for less emphatic
];

// Closing
const closing = [
  PB(),
  new Paragraph({ spacing: { before: 480, after: 240 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<CLOSING SECTION TITLE>", size: 28, bold: true, color: CHARCOAL, font: "Arial" })] }),
  P("[Closing paragraph — disclaimer, thank you, contact info, dst.]"),
  SP(),
  new Paragraph({ spacing: { before: 600, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "— End of Document —", size: 18, italics: true, color: "777777", font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "<Doc Title> v1.0 | Month YYYY | PT Algo Sea Biz", size: 16, color: "777777", font: "Arial" })]})
];

const doc = new Document({
  creator: "PT Algo Sea Biz",
  title: "<Document Title> v1.0",
  description: "<Document Type>",
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
        new TextRun({ text: "<DOC TITLE>  ", size: 16, bold: true, color: CHARCOAL, font: "Arial" }),
        new TextRun({ text: "│  v1.0  │  <Distribution>", size: 16, color: "777777", font: "Arial" })
      ]})]}) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
      children: [
        new TextRun({ text: "Page ", size: 16, color: "777777", font: "Arial" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "777777", font: "Arial" }),
        new TextRun({ text: " of ", size: 16, color: "777777", font: "Arial" }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "777777", font: "Arial" })
      ]})]}) },
    children: [
      ...cover,
      ...toc,
      ...section1,
      // ...sectionN,
      ...closing
    ].flat()
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("./<DocType>_<Project>_v1.0.docx", buffer);
  console.log("✓ Document generated:", (buffer.length / 1024).toFixed(1), "KB");
});
