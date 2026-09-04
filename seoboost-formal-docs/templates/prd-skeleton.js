// ============================================================================
// TEMPLATE — PRD (Product Requirement Document)
// Source style: seoboost-formal-docs skill v1.0
// Reference output: PRD Project Project G v1.0 (60 pages)
// ============================================================================
//
// Usage: copy this file as `build.js`, replace placeholder content, run with:
//   cat ../seoboost-formal-docs/helpers.js build.js > build_combined.js
//   node build_combined.js
//
// This template assumes helpers.js has been concatenated above. Required helpers:
// P, H1, H2, H3, H4, BL, NL, Callout, SP, PB, buildTable, buildMetricCards, buildProcessFlow
// ============================================================================

// ----------------------------------------------------------------------------
// COVER PAGE
// ----------------------------------------------------------------------------
const cover = [
  new Paragraph({ spacing: { before: 1800, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PROJECT NAME", size: 56, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "One-line tagline / value prop", size: 28, color: ACCENT, italics: true, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PRODUCT REQUIREMENT DOCUMENT", size: 32, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 800 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Version 1.0", size: 22, color: "555555", font: "Arial" })]}),

  // Optional: 4-pillar metric card hero
  buildMetricCards([
    { label: "PILLAR 1", value: "VALUE A" },
    { label: "PILLAR 2", value: "VALUE B" },
    { label: "PILLAR 3", value: "VALUE C" },
    { label: "PILLAR 4", value: "VALUE D" },
  ]),

  new Paragraph({ spacing: { before: 1000, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Prepared for: PT Algo Sea Biz (SEO Boost)", size: 22, bold: true, color: CHARCOAL, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Internal Document — Confidential", size: 18, color: "777777", italics: true, font: "Arial" })]}),
  new Paragraph({ spacing: { before: 80, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Month YYYY", size: 20, color: "555555", font: "Arial" })]}),
  PB()
];

// ----------------------------------------------------------------------------
// TABLE OF CONTENTS
// ----------------------------------------------------------------------------
const tocRows = [
  ["1", "Executive Summary", "1"],
  ["2", "Strategic Context & Vision", "2"],
  ["3", "Problem Statement & Opportunity", "4"],
  ["4", "Target User & Use Cases", "5"],
  ["5", "Product Concept", "7"],
  ["6", "Architecture Overview", "9"],
  ["7", "Functional Requirements", "12"],
  ["8", "Non-Functional Requirements", "16"],
  ["9", "Data Model", "18"],
  ["10", "API / Integration Contract", "20"],
  ["11", "Tech Stack", "22"],
  ["12", "Security & Compliance", "24"],
  ["13", "UX / UI Specifications", "26"],
  ["14", "MVP Scope & Acceptance", "28"],
  ["15", "Roadmap & Milestones", "30"],
  ["16", "Risks & Mitigations", "32"],
  ["17", "Appendices", "34"]
];

const toc = [
  new Paragraph({ spacing: { before: 0, after: 240 },
    children: [new TextRun({ text: "Table of Contents", size: 36, bold: true, color: CHARCOAL, font: "Arial" })]}),
  buildTable(["#", "Section", "Page"], tocRows, [800, 7600, 960]),
  PB()
];

// ----------------------------------------------------------------------------
// SECTION 1 — EXECUTIVE SUMMARY (firstPage = true)
// ----------------------------------------------------------------------------
const section1 = [
  H1("1", "Executive Summary", true),
  P("[Ringkas 2-3 paragraf: apa product/initiative ini, mengapa sekarang, scope MVP, dan target outcome.]"),

  H2("Product Pillars"),
  buildMetricCards([
    { label: "PILLAR 1", value: "VALUE A" },
    { label: "PILLAR 2", value: "VALUE B" },
    { label: "PILLAR 3", value: "VALUE C" },
    { label: "PILLAR 4", value: "VALUE D" },
  ]),
  P("[Penjelasan singkat keempat pilar.]"),

  H2("Roadmap Strategis"),
  buildTable(
    ["Fase", "Durasi", "Output"],
    [
      ["Phase 0 — Blueprint", "1-2 minggu", "PRD lengkap, mockup, schema"],
      ["Phase 1 — MVP", "4-8 minggu", "Working prototype"],
      ["Phase 2 — Beta", "8-12 minggu", "Beta release, feedback loop"],
    ],
    [2400, 1600, 5360]
  ),

  Callout("CORE STATEMENT",
    "[Single-sentence positioning yang menjelaskan inti produk.]",
    ACCENT)
];

// ----------------------------------------------------------------------------
// SECTION 2-17 — REPLACE WITH ACTUAL CONTENT
// ----------------------------------------------------------------------------
// Pattern for each section:
//
// const sectionN = [
//   H1("N", "Section Title"),
//   H2("N.1 Subsection"),
//   P("Body paragraph..."),
//   buildTable([...], [...], [...]),
//   Callout("LABEL", "..."),
//   ...
// ];
//
// See examples/project-g-prd-v1.0 for full reference.

// ----------------------------------------------------------------------------
// FINAL DISCLAIMER PAGE
// ----------------------------------------------------------------------------
const disclaimer = [
  PB(),
  new Paragraph({ spacing: { before: 480, after: 240 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "DISCLAIMER", size: 28, bold: true, color: CHARCOAL, font: "Arial" })] }),
  P("[Standard disclaimer untuk dokumen formal — biasanya: dokumen ini bersifat internal, tidak boleh didistribusikan tanpa persetujuan, output bukan komitmen kontraktual, dst.]"),
  SP(),
  new Paragraph({ spacing: { before: 600, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "— End of Document —", size: 18, italics: true, color: "777777", font: "Arial" })]}),
  new Paragraph({ spacing: { before: 100, after: 0 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PRD <Project Name> v1.0 | Month YYYY | PT Algo Sea Biz", size: 16, color: "777777", font: "Arial" })]})
];

// ----------------------------------------------------------------------------
// ASSEMBLY
// ----------------------------------------------------------------------------
const doc = new Document({
  creator: "PT Algo Sea Biz",
  title: "PRD <Project Name> v1.0",
  description: "Product Requirement Document",
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
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: "<PROJECT NAME>  ", size: 16, bold: true, color: CHARCOAL, font: "Arial" }),
            new TextRun({ text: "│  PRD v1.0  │  Confidential", size: 16, color: "777777", font: "Arial" })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
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
      ...toc,
      ...section1,
      // ...section2, ...section3, ...etc
      ...disclaimer
    ].flat()
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("./PRD_<ProjectName>_v1.0.docx", buffer);
  console.log("✓ PRD generated:", (buffer.length / 1024).toFixed(1), "KB");
});
