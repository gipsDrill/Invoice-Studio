(() => {
  'use strict';

  const enc = new TextEncoder();

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function xmlEscape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function safeFilename(value) {
    return String(value || 'document')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90) || 'document';
  }

  function concatBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      out.set(part, offset);
      offset += part.length;
    }
    return out;
  }

  function u16(value) { return new Uint8Array([value & 255, (value >>> 8) & 255]); }
  function u32(value) { return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]); }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    return {
      dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
      dosDate: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  function createStoredZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const stamp = dosDateTime();
    for (const file of files) {
      const nameBytes = enc.encode(file.name);
      const data = file.data instanceof Uint8Array ? file.data : enc.encode(String(file.data));
      const crc = crc32(data);
      const localHeader = concatBytes([
        u32(0x04034b50), u16(20), u16(0), u16(0), u16(stamp.dosTime), u16(stamp.dosDate),
        u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes
      ]);
      localParts.push(localHeader, data);
      const centralHeader = concatBytes([
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(stamp.dosTime), u16(stamp.dosDate),
        u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0),
        u16(0), u32(0), u32(offset), nameBytes
      ]);
      centralParts.push(centralHeader);
      offset += localHeader.length + data.length;
    }
    const central = concatBytes(centralParts);
    const local = concatBytes(localParts);
    const end = concatBytes([
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(central.length), u32(local.length), u16(0)
    ]);
    return concatBytes([local, central, end]);
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1] || '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function canvasToBytes(canvas, type = 'image/png', quality = 0.98) {
    return dataUrlToBytes(canvas.toDataURL(type, quality));
  }

  function copyComputedStyles(source, clone) {
    if (!(source instanceof Element) || !(clone instanceof Element)) return;
    const computed = getComputedStyle(source);
    let css = '';
    for (const property of computed) css += `${property}:${computed.getPropertyValue(property)};`;
    clone.setAttribute('style', css);
    const sourceChildren = [...source.children];
    const cloneChildren = [...clone.children];
    for (let i = 0; i < sourceChildren.length; i += 1) copyComputedStyles(sourceChildren[i], cloneChildren[i]);
  }

  async function waitForImages(root) {
    const images = [...root.querySelectorAll('img')];
    await Promise.all(images.map(async (image) => {
      if (image.complete) return;
      try { await image.decode(); } catch { await new Promise((resolve) => { image.onload = image.onerror = resolve; }); }
    }));
  }

  async function capturePreview(preview) {
    if (!preview) throw new Error('Preview element is unavailable.');
    if (document.fonts?.ready) await document.fonts.ready;
    const sourceCanvas = preview.matches?.('canvas') ? preview : preview.querySelector?.('canvas.invoice-render-canvas, canvas');
    if (sourceCanvas instanceof HTMLCanvasElement && sourceCanvas.width && sourceCanvas.height) {
      const canvas = document.createElement('canvas');
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sourceCanvas, 0, 0);
      return canvas;
    }
    await waitForImages(preview);

    const width = Math.max(720, preview.scrollWidth || 720);
    const page = preview.querySelector('.doc-page');
    const height = Math.max(1018, page?.scrollHeight || preview.scrollHeight || 1018);
    const clone = preview.cloneNode(true);
    copyComputedStyles(preview, clone);
    clone.removeAttribute('id');
    clone.style.setProperty('width', `${width}px`, 'important');
    clone.style.setProperty('height', `${height}px`, 'important');
    clone.style.setProperty('min-height', `${height}px`, 'important');
    clone.style.setProperty('transform', 'none', 'important');
    clone.style.setProperty('transform-origin', 'top left', 'important');
    clone.style.setProperty('margin', '0', 'important');
    clone.style.setProperty('box-shadow', 'none', 'important');
    clone.style.setProperty('border-radius', '0', 'important');
    clone.style.setProperty('overflow', 'hidden', 'important');
    const clonePage = clone.querySelector('.doc-page');
    if (clonePage) {
      clonePage.style.setProperty('min-height', `${height}px`, 'important');
      clonePage.style.setProperty('height', `${height}px`, 'important');
    }

    const wrapper = document.createElement('div');
    wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    wrapper.style.margin = '0';
    wrapper.style.padding = '0';
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.style.background = '#ffffff';
    wrapper.appendChild(clone);

    const serialized = new XMLSerializer().serializeToString(wrapper);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.decoding = 'async';
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('Could not render the live preview.'));
        image.src = url;
      });
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function splitIntoA4Pages(canvas) {
    const pageHeight = Math.round(canvas.width * (1018 / 720));
    const pages = [];
    for (let y = 0; y < canvas.height; y += pageHeight) {
      const sliceHeight = Math.min(pageHeight, canvas.height - y);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeight;
      const ctx = pageCanvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      pages.push(pageCanvas);
    }
    return pages.length ? pages : [canvas];
  }

  function pdfObject(number, bodyParts) {
    return concatBytes([
      enc.encode(`${number} 0 obj\n`),
      ...(Array.isArray(bodyParts) ? bodyParts : [enc.encode(bodyParts)]),
      enc.encode('\nendobj\n')
    ]);
  }

  function buildImagePdf(images) {
    const objectCount = 2 + images.length * 3;
    const objects = new Array(objectCount + 1);
    const kids = images.map((_, index) => `${3 + index * 3} 0 R`);
    objects[1] = pdfObject(1, `<< /Type /Catalog /Pages 2 0 R >>`);
    objects[2] = pdfObject(2, `<< /Type /Pages /Count ${images.length} /Kids [${kids.join(' ')}] >>`);
    images.forEach((image, index) => {
      const pageObj = 3 + index * 3;
      const imageObj = pageObj + 1;
      const contentObj = pageObj + 2;
      objects[pageObj] = pdfObject(pageObj, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>`);
      objects[imageObj] = pdfObject(imageObj, [
        enc.encode(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`),
        image.bytes,
        enc.encode('\nendstream')
      ]);
      const stream = 'q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ';
      objects[contentObj] = pdfObject(contentObj, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    });
    const header = enc.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const offsets = new Array(objectCount + 1).fill(0);
    const body = [header];
    let offset = header.length;
    for (let i = 1; i <= objectCount; i += 1) {
      offsets[i] = offset;
      body.push(objects[i]);
      offset += objects[i].length;
    }
    const xrefOffset = offset;
    let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objectCount; i += 1) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    body.push(enc.encode(`${xref}trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));
    return concatBytes(body);
  }

  async function exportPdf(data, preview) {
    const captured = await capturePreview(preview);
    const pages = splitIntoA4Pages(captured);
    const images = pages.map((page) => ({ width: page.width, height: page.height, bytes: canvasToBytes(page, 'image/jpeg', 0.985) }));
    const pdf = buildImagePdf(images);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const filename = `${safeFilename(data.filenameBase)}.pdf`;
    downloadBlob(blob, filename);
    return { blob, filename };
  }

  function docxImageParagraph(relId, name, cx, cy, pageBreak = false) {
    return `<w:p><w:pPr><w:jc w:val="center"/>${pageBreak ? '<w:pageBreakBefore/>' : ''}</w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${relId.replace(/\D/g, '') || 1}" name="${xmlEscape(name)}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${xmlEscape(name)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  }

  async function exportDocx(data, preview) {
    const captured = await capturePreview(preview);
    const pages = splitIntoA4Pages(captured);
    const pageImages = pages.map((page) => canvasToBytes(page, 'image/png'));
    const usableWidthInches = 7.77;
    const cx = Math.round(usableWidthInches * 914400);
    const cy = Math.round(cx * (297 / 210));
    const paragraphs = pages.map((_, index) => docxImageParagraph(`rId${index + 1}`, `Invoice page ${index + 1}`, cx, cy, index > 0)).join('');
    const rels = pages.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/invoice-page-${index + 1}.png"/>`).join('');
    const files = [
      { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
      { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
      { name: 'word/_rels/document.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>` },
      { name: 'word/document.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="180" w:right="180" w:bottom="180" w:left="180" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>` }
    ];
    pageImages.forEach((bytes, index) => files.push({ name: `word/media/invoice-page-${index + 1}.png`, data: bytes }));
    const zip = createStoredZip(files);
    const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const filename = `${safeFilename(data.filenameBase)}.docx`;
    downloadBlob(blob, filename);
    return { blob, filename };
  }

  function xlsxCell(ref, value, style = 0, numeric = false) {
    if (numeric && Number.isFinite(Number(value))) return `<c r="${ref}" s="${style}"><v>${Number(value)}</v></c>`;
    return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
  }

  function buildDataSheet(data) {
    const rows = [];
    const push = (cells) => {
      const row = rows.length + 1;
      rows.push(`<row r="${row}">${cells.map((cell, index) => {
        const cfg = typeof cell === 'object' && cell ? cell : { value: cell };
        return xlsxCell(`${String.fromCharCode(65 + index)}${row}`, cfg.value, cfg.style || 0, cfg.numeric);
      }).join('')}</row>`);
    };
    push([{ value: data.title, style: 1 }, '', '', '', data.number]);
    push(['Seller', data.seller.name || '', '', 'Client', data.client.name || '']);
    push([data.issueDateLabel, data.issueDate, data.dueDate ? data.dueDateLabel : '', data.dueDate || '', data.serviceDate || '']);
    push(['']);
    push([{ value: data.itemLabels.description, style: 2 }, { value: data.itemLabels.quantity, style: 2 }, { value: data.itemLabels.unit, style: 2 }, { value: data.itemLabels.rate, style: 2 }, { value: data.itemLabels.amount, style: 2 }]);
    data.items.forEach((item) => push([item.description, { value: item.quantity, numeric: true }, item.unit, { value: item.rate, numeric: true, style: 3 }, { value: item.amount, numeric: true, style: 3 }]));
    push(['']);
    data.totals.forEach((row) => push(['', '', '', row.label, { value: row.raw, numeric: true, style: row.grand ? 4 : 3 }]));
    if (data.notes) push(['Notes', data.notes]);
    if (data.terms) push(['Payment terms', data.terms]);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><cols><col min="1" max="1" width="44" customWidth="1"/><col min="2" max="2" width="16" customWidth="1"/><col min="3" max="3" width="16" customWidth="1"/><col min="4" max="5" width="22" customWidth="1"/></cols><sheetData>${rows.join('')}</sheetData></worksheet>`;
  }

  async function exportXlsx(data, preview) {
    const captured = await capturePreview(preview);
    const pages = splitIntoA4Pages(captured);
    const pageImages = pages.map((page) => canvasToBytes(page, 'image/png'));
    const anchors = pages.map((page, index) => {
      const relId = `rId${index + 1}`;
      const row = index * 62;
      const cx = 720 * 9525;
      const cy = Math.round(720 * (297 / 210) * 9525);
      return `<xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:ext cx="${cx}" cy="${cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${index + 1}" name="Invoice page ${index + 1}"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;
    }).join('');
    const drawingRels = pages.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/invoice-page-${index + 1}.png"/>`).join('');
    const invoiceSheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0" showGridLines="0" zoomScale="80"/></sheetViews><sheetData/><drawing r:id="rId1"/><pageMargins left="0.2" right="0.2" top="0.2" bottom="0.2" header="0" footer="0"/></worksheet>`;
    const dataSheet = buildDataSheet(data);
    const currencyFmt = data.currencyCode === 'GBP' ? '[$£-en-GB]#,##0.00' : data.currencyCode === 'EUR' ? '[$€-x-euro2]#,##0.00' : data.currencyCode === 'PLN' ? '#,##0.00 "zł"' : '[$$-en-US]#,##0.00';
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="${xmlEscape(currencyFmt)}"/></numFmts><fonts count="3"><font><sz val="10"/><name val="Aptos"/></font><font><b/><sz val="18"/><name val="Aptos Display"/></font><font><b/><color rgb="FFFFFFFF"/><name val="Aptos"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4F46E5"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE9EAF3"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="2" fillId="2" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    const files = [
      { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>` },
      { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
      { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Invoice Preview" sheetId="1" r:id="rId1"/><sheet name="Editable Data" sheetId="2" r:id="rId2"/></sheets></workbook>` },
      { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: 'xl/worksheets/sheet1.xml', data: invoiceSheet },
      { name: 'xl/worksheets/_rels/sheet1.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>` },
      { name: 'xl/worksheets/sheet2.xml', data: dataSheet },
      { name: 'xl/drawings/drawing1.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anchors}</xdr:wsDr>` },
      { name: 'xl/drawings/_rels/drawing1.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drawingRels}</Relationships>` },
      { name: 'xl/styles.xml', data: styles }
    ];
    pageImages.forEach((bytes, index) => files.push({ name: `xl/media/invoice-page-${index + 1}.png`, data: bytes }));
    const zip = createStoredZip(files);
    const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `${safeFilename(data.filenameBase)}.xlsx`;
    downloadBlob(blob, filename);
    return { blob, filename };
  }

  window.InvoiceExport = {
    pdf: exportPdf,
    docx: exportDocx,
    xlsx: exportXlsx,
    capturePreview,
    downloadBlob,
    safeFilename
  };
})();
