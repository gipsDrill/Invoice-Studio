# Invoice Studio 1.11.1

A fast, English-language invoice and sales-document builder designed for non-technical users. The live preview is rendered by the same engine used for PDF, Word and Excel exports, so the downloaded document matches the preview.

## What is included

- 12 document types: Invoice, VAT Invoice, Quote / Estimate, Pro Forma, Credit Note, Receipt, Deposit Invoice, Final Invoice, Commercial Invoice, Recurring Invoice, Interim Invoice and Payment Request.
- 12 billing modes: Services, Hours & Days, Products, Transport & Mileage, Project / Contract, Expenses & Reimbursements, Recurring Work, Blank Document, Construction & Trades, Creative & Digital, Rentals & Hire and Lessons & Appointments.
- 12 visually distinct templates: Studio, Minimal, Corporate, Compact, Editorial, Ledger, Bold, Soft, Monochrome, Split, Classic and Horizon.
- 9 accent colours.
- 14 ready-made Smart Draft examples with local parsing.
- Live document preview.
- PDF, Excel XLSX and Word DOCX export.
- Optional due date, VAT, discount and deposit.
- Separate calculator page.
- Local autosave and PWA files.
- Context-aware examples for every combination of document type and billing mode.
- Document-specific headings, date labels, callouts, totals, notes and payment terms in the live preview and exports.
- Smart item suggestions that adapt to the selected document and billing specialisation.
- Free logo placement: drag a custom logo directly on the live document or use precise horizontal, vertical and size controls. The same placement is used in PDF, Word and Excel.
- Custom colour picker with live preview, accessible HEX input and persistent branding across every export.
- Search-ready titles, descriptions, structured application data, crawl rules, indexable product copy and FAQs.

## Run locally

On Windows, double-click `start-local-server.bat` and open the displayed local address. On macOS, run `start-local-server.command`. A simple local web server is recommended because browser security restrictions can affect downloads and PWA features when opening `index.html` directly.

## Main files

- `index.html` — invoice builder
- `app.js` — application logic and Smart Draft
- `invoice-renderer.js` — exact shared preview/export renderer
- `export.js` — PDF, XLSX and DOCX generation
- `calculators.html` / `calculators.js` — standalone calculators
- `styles.css` — full interface and template preview styling

## Version 1.11.1

- Removed the redundant sticky “Amount due” bar from the live preview.
- Preserved document totals, calculations and all export formats.
This build adds unrestricted document colour selection and a complete, portable SEO foundation while preserving the existing workflow, templates, logo controls and pixel-matched exports.

## Version 1.11.2
- The live invoice preview remains fixed beside the editor while the page scrolls on desktop and laptop screens.
- The complete document is automatically scaled to fit the available preview area.
- Mobile and tablet preview behaviour remains unchanged.
