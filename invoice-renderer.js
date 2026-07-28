(() => {
  'use strict';

  const BASE_WIDTH = 720;
  const BASE_PAGE_HEIGHT = 1018;
  const DPR = 2;

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function hexToRgb(hex) {
    const clean = String(hex || '#4f46e5').replace('#', '');
    const value = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0').slice(0, 6);
    return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
  }
  function mix(hex, target, amount) {
    const a = hexToRgb(hex); const b = hexToRgb(target);
    const channel = (x, y) => Math.round(x + (y - x) * amount);
    return `rgb(${channel(a.r, b.r)}, ${channel(a.g, b.g)}, ${channel(a.b, b.b)})`;
  }
  function contrastText(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (r * 299 + g * 587 + b * 114) / 1000 > 158 ? '#172033' : '#ffffff';
  }
  function font(ctx, size, weight = 400, family = 'Arial, sans-serif', style = '') {
    ctx.font = `${style ? `${style} ` : ''}${weight} ${size}px ${family}`;
  }
  function pathRoundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
  function fillRoundRect(ctx, x, y, w, h, r, fill, stroke = '', lineWidth = 1) {
    pathRoundRect(ctx, x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }
  function wrapLines(ctx, text, maxWidth, maxLines = 99) {
    const paragraphs = String(text || '').split(/\n/);
    const lines = [];
    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) { lines.push(''); continue; }
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth || !line) line = test;
        else { lines.push(line); line = word; if (lines.length >= maxLines) break; }
      }
      if (lines.length >= maxLines) break;
      if (line) lines.push(line);
      if (lines.length >= maxLines) break;
    }
    if (lines.length > maxLines) lines.length = maxLines;
    if (lines.length === maxLines && ctx.measureText(lines[maxLines - 1]).width > maxWidth) {
      let last = lines[maxLines - 1];
      while (last.length && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last}…`;
    }
    return lines;
  }
  function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
    const lines = wrapLines(ctx, text, maxWidth, options.maxLines || 99);
    ctx.textAlign = options.align || 'left';
    ctx.textBaseline = 'top';
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    return { lines, height: Math.max(lineHeight, lines.length * lineHeight) };
  }
  function drawRule(ctx, x1, y, x2, colour, width = 1) {
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.stroke();
  }
  function drawImageContain(ctx, image, x, y, w, h) {
    const ratio = Math.min(w / image.width, h / image.height);
    const dw = image.width * ratio; const dh = image.height * ratio;
    ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  function templateConfig(id, accent) {
    const base = {
      id, accent, ink: '#20283a', muted: '#687086', line: '#dfe3ec', pale: mix(accent, '#ffffff', .91),
      paper: '#ffffff', margin: 54, family: 'Arial, sans-serif', titleFamily: 'Arial, sans-serif',
      headerHeight: 145, compact: false, rounded: 10
    };
    if (id === 'minimal') return { ...base, ink: '#171717', muted: '#707070', line: '#d4d4d4', pale: '#f7f7f7', margin: 62, titleFamily: 'Georgia, serif', rounded: 0 };
    if (id === 'corporate') return { ...base, headerDark: true, margin: 54, headerHeight: 174, line: '#d7dde8', rounded: 4 };
    if (id === 'compact') return { ...base, compact: true, margin: 42, headerHeight: 124, rounded: 4 };
    if (id === 'editorial') return { ...base, margin: 64, titleFamily: 'Georgia, serif', ink: '#1b1b22', muted: '#6d6972', line: '#d8d4dc', rounded: 0, editorial: true };
    if (id === 'ledger') return { ...base, margin: 48, line: '#bac1ce', pale: '#eef1f5', rounded: 0, ledger: true, compact: true };
    if (id === 'bold') return { ...base, margin: 64, headerHeight: 160, bold: true, rounded: 6 };
    if (id === 'soft') return { ...base, paper: '#fffdfa', pale: mix(accent, '#fff8ef', .86), line: '#eadfd6', margin: 56, rounded: 16, soft: true };
    if (id === 'monochrome') return { ...base, accent: '#111318', ink: '#111318', muted: '#5d616a', line: '#c7cbd2', pale: '#f3f3f1', margin: 58, headerHeight: 158, rounded: 0, monochrome: true };
    if (id === 'split') return { ...base, headerDark: true, split: true, margin: 52, headerHeight: 182, line: '#d8dde6', rounded: 6 };
    if (id === 'classic') return { ...base, classic: true, margin: 62, headerHeight: 184, titleFamily: 'Georgia, serif', family: 'Georgia, serif', ink: '#24211f', muted: '#77706b', line: '#cfc9c2', pale: mix(accent, '#fffdf9', .92), rounded: 0 };
    if (id === 'horizon') return { ...base, headerDark: true, horizon: true, margin: 50, headerHeight: 164, line: '#d5dbe7', rounded: 3 };
    return base;
  }

  function drawPagePersonality(ctx, cfg, W, H) {
    const m = cfg.margin;
    ctx.save();

    if (cfg.id === 'studio') {
      ctx.globalAlpha = .62;
      ctx.fillStyle = cfg.pale;
      ctx.beginPath(); ctx.arc(W + 18, 320, 178, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = mix(cfg.accent, '#ffffff', .78);
      ctx.beginPath(); ctx.arc(W - 34, H - 80, 78, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = cfg.accent; ctx.fillRect(m, H - 57, 42, 3);
    } else if (cfg.id === 'minimal') {
      ctx.globalAlpha = .7;
      drawRuleVertical(ctx, m - 18, 205, H - 54, '#e6e6e6', .7);
      drawRuleVertical(ctx, W - m + 18, 205, H - 54, '#e6e6e6', .7);
      ctx.fillStyle = cfg.ink; ctx.fillRect(m - 21, H - 43, 7, 7);
    } else if (cfg.id === 'corporate') {
      ctx.globalAlpha = .5;
      ctx.fillStyle = cfg.pale; ctx.fillRect(W - 126, 228, 72, H - 310);
      ctx.globalAlpha = .22;
      for (let x = W - 126; x <= W - 54; x += 18) drawRuleVertical(ctx, x, 228, H - 82, cfg.accent, .6);
      for (let y = 228; y < H - 82; y += 22) drawRule(ctx, W - 126, y, W - 54, cfg.accent, .6);
    } else if (cfg.id === 'compact') {
      ctx.globalAlpha = .22;
      for (let y = 155; y < H - 54; y += 18) drawRule(ctx, m, y, W - m, cfg.line, .55);
      ctx.globalAlpha = 1;
      ctx.fillStyle = cfg.accent; ctx.fillRect(W - m - 34, H - 48, 34, 3);
    } else if (cfg.editorial) {
      ctx.globalAlpha = .045;
      ctx.fillStyle = cfg.accent;
      font(ctx, 76, 400, cfg.titleFamily);
      ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('DOCUMENT', W - m, H - 92);
      ctx.globalAlpha = .22;
      drawRuleVertical(ctx, W - m + 16, 205, H - 60, cfg.accent, 1);
    } else if (cfg.ledger) {
      ctx.globalAlpha = .24;
      for (let x = m; x <= W - m; x += 32) drawRuleVertical(ctx, x, cfg.headerHeight, H - 48, cfg.line, .55);
      for (let y = cfg.headerHeight; y < H - 48; y += 24) drawRule(ctx, m, y, W - m, cfg.line, .55);
      ctx.globalAlpha = 1;
      ctx.fillStyle = cfg.accent; ctx.fillRect(m, H - 47, 92, 4);
    } else if (cfg.bold) {
      ctx.globalAlpha = .12;
      ctx.fillStyle = cfg.accent;
      ctx.beginPath(); ctx.arc(W - 16, H - 80, 150, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .24;
      ctx.beginPath(); ctx.arc(W - 16, H - 80, 106, 0, Math.PI * 2); ctx.strokeStyle = cfg.accent; ctx.lineWidth = 2; ctx.stroke();
    } else if (cfg.soft) {
      ctx.globalAlpha = .5;
      ctx.fillStyle = cfg.pale;
      ctx.beginPath(); ctx.arc(W - 25, 280, 118, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff2e8';
      ctx.beginPath(); ctx.arc(30, H - 72, 96, 0, Math.PI * 2); ctx.fill();
    } else if (cfg.monochrome) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#111318';
      ctx.fillRect(m, H - 49, 11, 11);
      ctx.fillRect(W - m - 11, H - 49, 11, 11);
      ctx.globalAlpha = .08;
      ctx.fillRect(W - 126, 242, 68, H - 342);
    } else if (cfg.split) {
      ctx.globalAlpha = .08;
      ctx.fillStyle = cfg.accent; ctx.fillRect(0, cfg.headerHeight, 42, H - cfg.headerHeight);
      ctx.globalAlpha = .15;
      ctx.beginPath(); ctx.moveTo(W - 170, H); ctx.lineTo(W, H - 190); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = cfg.accent; ctx.fillRect(m, H - 51, 68, 3);
    } else if (cfg.classic) {
      ctx.globalAlpha = .86;
      ctx.strokeStyle = cfg.line; ctx.lineWidth = .7; ctx.strokeRect(24, 24, W - 48, H - 48);
      ctx.strokeStyle = cfg.ink; ctx.lineWidth = .45; ctx.strokeRect(29, 29, W - 58, H - 58);
    } else if (cfg.horizon) {
      ctx.globalAlpha = .09;
      ctx.fillStyle = cfg.accent;
      ctx.beginPath(); ctx.moveTo(0, H - 165); ctx.lineTo(W, H - 305); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = .16;
      ctx.beginPath(); ctx.moveTo(0, H - 92); ctx.lineTo(W, H - 232); ctx.lineTo(W, H - 214); ctx.lineTo(0, H - 74); ctx.closePath(); ctx.fill();
    }

    ctx.restore();
  }

  function measureLayout(data, cfg, ctx) {
    const contentWidth = BASE_WIDTH - cfg.margin * 2;
    const descWidth = cfg.compact ? contentWidth * .49 : contentWidth * .52;
    font(ctx, cfg.compact ? 9.3 : 10.3, 400, cfg.family);
    const rows = data.items.map((item) => {
      const lines = wrapLines(ctx, item.description || '—', descWidth - 16, 3);
      return Math.max(cfg.compact ? 31 : 37, lines.length * (cfg.compact ? 13 : 15) + (cfg.compact ? 10 : 14));
    });
    const headerY = cfg.headerHeight + (cfg.editorial || cfg.classic ? 35 : 22);
    const partyHeight = cfg.compact ? 110 : 126;
    const tableHeight = (cfg.compact ? 30 : 36) + rows.reduce((a, b) => a + b, 0);
    const totalsHeight = 34 + data.totals.length * 27 + 12;
    const contextHeight = data.contextMessage ? 58 : 0;
    const billingHeight = data.billingMode ? 48 : 0;
    let extra = 54;
    if (data.notes || data.terms) extra += cfg.compact ? 96 : 125;
    if (data.bank) extra += 48;
    if (data.showSignature) extra += 62;
    const contentBottom = cfg.margin + headerY + partyHeight + contextHeight + billingHeight + 28 + tableHeight + 25 + totalsHeight + extra;
    const pageCount = Math.max(1, Math.ceil(Math.max(BASE_PAGE_HEIGHT, contentBottom - 80) / BASE_PAGE_HEIGHT));
    return { contentWidth, descWidth, rowHeights: rows, height: pageCount * BASE_PAGE_HEIGHT };
  }

  function drawHeader(ctx, data, cfg, W) {
    const m = cfg.margin; const accent = cfg.accent;
    const sellerName = String(data.seller?.name || 'Your business');
    const sellerDetails = (data.seller?.lines || []).slice(0, cfg.compact ? 3 : 4);

    if (cfg.split) {
      const panelW = 270;
      ctx.fillStyle = accent; ctx.fillRect(0, 0, panelW, cfg.headerHeight);
      ctx.fillStyle = mix(accent, '#000000', .18);
      ctx.beginPath(); ctx.moveTo(panelW - 34, 0); ctx.lineTo(panelW + 46, 0); ctx.lineTo(panelW - 10, cfg.headerHeight); ctx.lineTo(panelW - 70, cfg.headerHeight); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f7f9fc'; ctx.fillRect(panelW, 0, W - panelW, cfg.headerHeight);

      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff'; font(ctx, 29, 800, cfg.titleFamily);
      wrapLines(ctx, data.title || 'Invoice', panelW - m - 20, 2).forEach((line, i) => ctx.fillText(line, m, 42 + i * 34));
      ctx.fillStyle = 'rgba(255,255,255,.72)'; font(ctx, 8.8, 750, cfg.family);
      ctx.fillText(String(data.numberLabel || 'Document no.').toUpperCase(), m, 116);
      ctx.fillStyle = '#ffffff'; font(ctx, 14.5, 800, cfg.family); ctx.fillText(data.number || '—', m, 132);

      ctx.textAlign = 'right'; ctx.fillStyle = cfg.ink; font(ctx, 17, 780, cfg.family);
      wrapLines(ctx, sellerName, 300, 2).forEach((line, i) => ctx.fillText(line, W - m, 42 + i * 20));
      ctx.fillStyle = cfg.muted; font(ctx, 9.2, 400, cfg.family);
      sellerDetails.forEach((line, i) => {
        const text = String(line).replace(/\n/g, ', ');
        ctx.fillText(text.length > 52 ? `${text.slice(0, 51)}…` : text, W - m, 88 + i * 14);
      });
      return;
    }

    if (cfg.classic) {
      ctx.fillStyle = cfg.paper; ctx.fillRect(0, 0, W, cfg.headerHeight);
      drawRule(ctx, m, 24, W - m, cfg.ink, 1.4);
      drawRule(ctx, m, 29, W - m, cfg.ink, .55);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = cfg.ink; font(ctx, 16, 700, cfg.family);
      ctx.fillText(sellerName, W / 2, 39);
      ctx.fillStyle = cfg.muted; font(ctx, 8.6, 400, cfg.family);
      const detailLine = sellerDetails.slice(0, 2).join(' • ');
      if (detailLine) ctx.fillText(detailLine.length > 90 ? `${detailLine.slice(0, 89)}…` : detailLine, W / 2, 61);
      ctx.fillStyle = cfg.ink; font(ctx, 31, 400, cfg.titleFamily);
      ctx.fillText(data.title || 'Invoice', W / 2, 92);
      ctx.fillStyle = accent; font(ctx, 8.7, 750, cfg.family);
      ctx.fillText(String(data.numberLabel || 'Document no.').toUpperCase(), W / 2, 132);
      ctx.fillStyle = cfg.ink; font(ctx, 12.5, 700, cfg.family);
      ctx.fillText(data.number || '—', W / 2, 147);
      drawRule(ctx, m, 174, W - m, cfg.ink, .55);
      drawRule(ctx, m, 179, W - m, cfg.ink, 1.4);
      return;
    }

    if (cfg.horizon) {
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 104);
      ctx.fillStyle = mix(accent, '#000000', .22);
      ctx.beginPath(); ctx.moveTo(W - 215, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 104); ctx.lineTo(W - 285, 104); ctx.closePath(); ctx.fill();
      ctx.fillStyle = cfg.pale; ctx.fillRect(0, 104, W, cfg.headerHeight - 104);
      ctx.fillStyle = mix(accent, '#ffffff', .35); ctx.fillRect(0, 104, W, 4);

      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff'; font(ctx, 31, 800, cfg.titleFamily);
      ctx.fillText(data.title || 'Invoice', m, 31);
      ctx.fillStyle = 'rgba(255,255,255,.76)'; font(ctx, 8.8, 750, cfg.family);
      ctx.fillText(String(data.numberLabel || 'Document no.').toUpperCase(), m, 72);
      ctx.fillStyle = '#ffffff'; font(ctx, 14, 800, cfg.family);
      ctx.fillText(data.number || '—', m, 86);

      ctx.textAlign = 'right'; ctx.fillStyle = '#ffffff'; font(ctx, 16, 780, cfg.family);
      ctx.fillText(sellerName, W - m, 29);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; font(ctx, 8.9, 400, cfg.family);
      sellerDetails.slice(0, 3).forEach((line, i) => {
        const text = String(line).replace(/\n/g, ', ');
        ctx.fillText(text.length > 50 ? `${text.slice(0, 49)}…` : text, W - m, 54 + i * 13);
      });
      ctx.textAlign = 'left'; ctx.fillStyle = cfg.muted; font(ctx, 8.4, 700, cfg.family);
      ctx.fillText('CLEAR DOCUMENT • READY TO SEND', m, 127);
      return;
    }

    if (cfg.headerDark) {
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, cfg.headerHeight);
      ctx.fillStyle = mix(accent, '#000000', .18); ctx.fillRect(W - 235, 0, 235, cfg.headerHeight);
    } else if (cfg.bold) {
      ctx.fillStyle = accent; ctx.fillRect(0, 0, 24, BASE_PAGE_HEIGHT);
      ctx.fillStyle = cfg.pale; ctx.fillRect(24, 0, W - 24, cfg.headerHeight);
    } else if (cfg.editorial) {
      ctx.fillStyle = accent; ctx.fillRect(m - 22, 42, 5, 108);
      drawRule(ctx, m, 153, W - m, cfg.line, 1);
    } else if (cfg.ledger) {
      ctx.fillStyle = '#f2f4f7'; ctx.fillRect(0, 0, W, cfg.headerHeight);
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 8);
      drawRule(ctx, 0, cfg.headerHeight, W, '#aeb5c2', 1.2);
    } else if (cfg.soft) {
      ctx.fillStyle = cfg.pale; ctx.fillRect(0, 0, W, cfg.headerHeight + 10);
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 8);
    } else if (cfg.monochrome) {
      ctx.fillStyle = '#111318'; ctx.fillRect(0, 0, W, 13);
      ctx.fillStyle = '#f5f5f2'; ctx.fillRect(W - 205, 13, 205, cfg.headerHeight - 13);
      drawRule(ctx, m, cfg.headerHeight - 5, W - m, '#111318', 2);
    } else if (cfg.id === 'studio') {
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 10);
      ctx.fillStyle = cfg.pale; ctx.fillRect(W - 240, 10, 240, cfg.headerHeight - 10);
    } else {
      ctx.fillStyle = accent; ctx.fillRect(m, 42, 58, 4);
    }

    const light = cfg.headerDark;
    const titleX = cfg.bold ? m + 16 : m;
    const titleY = cfg.compact ? 41 : 48;
    ctx.fillStyle = light ? '#ffffff' : cfg.ink;
    font(ctx, cfg.editorial ? 34 : cfg.monochrome ? 29 : cfg.compact ? 27 : 31, cfg.editorial ? 400 : 750, cfg.titleFamily);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(cfg.monochrome ? String(data.title || 'Invoice').toUpperCase() : (data.title || 'Invoice'), titleX, titleY);
    ctx.fillStyle = light ? 'rgba(255,255,255,.78)' : cfg.muted;
    font(ctx, 9.5, 700, cfg.family);
    ctx.fillText(String(data.numberLabel || 'Document no.').toUpperCase(), titleX, titleY + (cfg.compact ? 40 : 47));
    ctx.fillStyle = light ? '#ffffff' : accent;
    font(ctx, 15, 750, cfg.family);
    ctx.fillText(data.number || '—', titleX, titleY + (cfg.compact ? 55 : 63));

    const sellerX = W - m;
    ctx.textAlign = 'right';
    ctx.fillStyle = light ? '#ffffff' : cfg.ink;
    font(ctx, cfg.compact ? 14 : 16, 750, cfg.family);
    const sellerLines = wrapLines(ctx, sellerName, 245, 2);
    sellerLines.forEach((line, i) => ctx.fillText(line, sellerX, titleY + i * 18));
    ctx.fillStyle = light ? 'rgba(255,255,255,.78)' : cfg.muted;
    font(ctx, 9.2, 400, cfg.family);
    sellerDetails.forEach((line, i) => {
      const text = String(line).replace(/\n/g, ', ');
      ctx.fillText(text.length > 48 ? `${text.slice(0, 47)}…` : text, sellerX, titleY + 42 + i * 14);
    });
  }

  function drawMetaAndParties(ctx, data, cfg, y, W) {
    const m = cfg.margin; const cw = W - m * 2; const gap = cfg.compact ? 14 : 20;
    const metaW = cfg.compact ? 225 : 245; const partyW = cw - metaW - gap;
    const cardFill = cfg.id === 'minimal' || cfg.editorial || cfg.classic || cfg.monochrome ? '' : cfg.soft ? '#ffffff' : '#fbfcff';
    if (cardFill) fillRoundRect(ctx, m, y, partyW, cfg.compact ? 98 : 112, cfg.rounded, cardFill, cfg.line);
    else drawRule(ctx, m, y + (cfg.compact ? 98 : 112), m + partyW, cfg.line);
    if (cardFill) fillRoundRect(ctx, m + partyW + gap, y, metaW, cfg.compact ? 98 : 112, cfg.rounded, cfg.pale, cfg.soft ? cfg.line : '');
    else drawRule(ctx, m + partyW + gap, y + (cfg.compact ? 98 : 112), W - m, cfg.line);

    const px = m + (cardFill ? 16 : 0); const py = y + 14;
    ctx.fillStyle = cfg.muted; font(ctx, 8.5, 750, cfg.family); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(String(data.toLabel || 'Bill to').toUpperCase(), px, py);
    ctx.fillStyle = cfg.ink; font(ctx, cfg.compact ? 13 : 14.5, 750, cfg.family);
    ctx.fillText(data.client?.name || 'Client name', px, py + 18);
    ctx.fillStyle = cfg.muted; font(ctx, cfg.compact ? 8.5 : 9.2, 400, cfg.family);
    let lineY = py + 40;
    (data.client?.lines || []).slice(0, cfg.compact ? 3 : 4).forEach((line) => {
      const wrapped = wrapLines(ctx, String(line), partyW - 32, 2);
      wrapped.forEach((text) => { ctx.fillText(text, px, lineY); lineY += 12.5; });
    });

    const mx = m + partyW + gap + (cardFill ? 14 : 0); const mw = metaW - (cardFill ? 28 : 0);
    const metaRows = [
      [data.issueDateLabel || 'Issue date', data.issueDate || '—'],
      ...(data.dueDate ? [[data.dueDateLabel || 'Due date', data.dueDate]] : []),
      [data.serviceDateLabel || 'Service date', data.serviceDate || '—']
    ];
    metaRows.forEach((row, index) => {
      const ry = py + index * (cfg.compact ? 25 : 27);
      ctx.fillStyle = cfg.muted; font(ctx, 8.4, 600, cfg.family); ctx.textAlign = 'left'; ctx.fillText(row[0], mx, ry);
      ctx.fillStyle = cfg.ink; font(ctx, 9.7, 750, cfg.family); ctx.textAlign = 'right'; ctx.fillText(row[1], mx + mw, ry);
    });
    return y + (cfg.compact ? 98 : 112);
  }

  function drawContextBanner(ctx, data, cfg, y, W) {
    if (!data.contextMessage) return y;
    const m = cfg.margin;
    const width = W - m * 2;
    const height = 46;
    const badge = String(data.contextBadge || 'DOCUMENT').toUpperCase();
    const badgeWidth = clamp(34 + badge.length * 5.2, 94, 158);
    const fill = cfg.monochrome ? '#f2f2ef' : cfg.pale;
    if (cfg.id === 'minimal' || cfg.editorial || cfg.classic) {
      drawRule(ctx, m, y, W - m, cfg.editorial ? cfg.accent : cfg.ink, cfg.editorial ? 2 : 1);
      drawRule(ctx, m, y + height, W - m, cfg.line, .7);
    } else if (cfg.split || cfg.headerDark) {
      fillRoundRect(ctx, m, y, width, height, cfg.rounded ? Math.min(cfg.rounded, 8) : 0, mix(cfg.accent, '#ffffff', .94), cfg.accent, 1.1);
    } else {
      fillRoundRect(ctx, m, y, width, height, cfg.rounded ? Math.min(cfg.rounded, 10) : 0, fill, cfg.line);
    }
    fillRoundRect(ctx, m + 8, y + 8, badgeWidth, 30, cfg.rounded ? 7 : 0, cfg.monochrome ? '#111318' : cfg.accent);
    ctx.fillStyle = cfg.monochrome ? '#ffffff' : contrastText(cfg.accent);
    font(ctx, 8, 800, cfg.family);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, m + 8 + badgeWidth / 2, y + 23);
    ctx.fillStyle = cfg.ink;
    font(ctx, 9, 600, cfg.family);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    drawWrapped(ctx, data.contextMessage, m + badgeWidth + 22, y + 10, width - badgeWidth - 32, 13, { maxLines: 2 });
    return y + height;
  }

  function drawBillingSignature(ctx, data, cfg, y, W) {
    if (!data.billingMode) return y;
    const m = cfg.margin;
    const width = W - m * 2;
    const height = 38;
    const mode = String(data.billingMode);
    const motifX = m + 23;
    const motifY = y + height / 2;
    const accent = cfg.monochrome ? '#111318' : cfg.accent;
    const background = mode === 'blank' ? '#ffffff' : mix(accent, '#ffffff', mode === 'creative' || mode === 'soft' ? .9 : .94);

    ctx.save();
    if (mode === 'blank') {
      ctx.setLineDash([4, 4]);
      pathRoundRect(ctx, m, y, width, height, cfg.rounded ? 8 : 0);
      ctx.strokeStyle = cfg.line; ctx.lineWidth = 1; ctx.stroke();
      ctx.setLineDash([]);
    } else {
      fillRoundRect(ctx, m, y, width, height, cfg.rounded ? Math.min(cfg.rounded, 9) : 0, background, cfg.line);
    }

    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (mode === 'service') {
      ctx.beginPath(); ctx.moveTo(motifX - 8, motifY - 6); ctx.lineTo(motifX + 7, motifY - 6); ctx.moveTo(motifX - 8, motifY); ctx.lineTo(motifX + 3, motifY); ctx.moveTo(motifX - 8, motifY + 6); ctx.lineTo(motifX, motifY + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(motifX + 4, motifY + 4); ctx.lineTo(motifX + 7, motifY + 7); ctx.lineTo(motifX + 12, motifY + 1); ctx.stroke();
    } else if (mode === 'hours') {
      ctx.beginPath(); ctx.arc(motifX, motifY, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(motifX, motifY); ctx.lineTo(motifX, motifY - 5); ctx.moveTo(motifX, motifY); ctx.lineTo(motifX + 5, motifY + 3); ctx.stroke();
    } else if (mode === 'products') {
      ctx.beginPath(); ctx.moveTo(motifX - 9, motifY - 5); ctx.lineTo(motifX, motifY - 10); ctx.lineTo(motifX + 9, motifY - 5); ctx.lineTo(motifX, motifY); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(motifX - 9, motifY - 5); ctx.lineTo(motifX - 9, motifY + 6); ctx.lineTo(motifX, motifY + 11); ctx.lineTo(motifX, motifY); ctx.moveTo(motifX + 9, motifY - 5); ctx.lineTo(motifX + 9, motifY + 6); ctx.lineTo(motifX, motifY + 11); ctx.stroke();
    } else if (mode === 'transport') {
      ctx.beginPath(); ctx.moveTo(motifX - 10, motifY + 6); ctx.bezierCurveTo(motifX - 3, motifY - 9, motifX + 4, motifY + 9, motifX + 11, motifY - 5); ctx.stroke();
      [ [-10, 6], [0, 0], [11, -5] ].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(motifX + dx, motifY + dy, 2.4, 0, Math.PI * 2); ctx.fill(); });
    } else if (mode === 'project') {
      ctx.beginPath(); ctx.moveTo(motifX - 9, motifY); ctx.lineTo(motifX + 9, motifY); ctx.stroke();
      [-9, 0, 9].forEach((dx, index) => { ctx.fillRect(motifX + dx - 2.5, motifY - 2.5 - (index === 1 ? 4 : 0), 5, 5); });
    } else if (mode === 'expenses') {
      ctx.strokeRect(motifX - 7, motifY - 10, 14, 19);
      ctx.beginPath(); ctx.moveTo(motifX - 4, motifY - 5); ctx.lineTo(motifX + 4, motifY - 5); ctx.moveTo(motifX - 4, motifY); ctx.lineTo(motifX + 4, motifY); ctx.moveTo(motifX - 4, motifY + 5); ctx.lineTo(motifX + 1, motifY + 5); ctx.stroke();
    } else if (mode === 'recurring') {
      ctx.beginPath(); ctx.arc(motifX, motifY, 8, -.2, Math.PI * 1.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(motifX - 7, motifY - 6); ctx.lineTo(motifX - 8, motifY); ctx.lineTo(motifX - 2, motifY - 1); ctx.stroke();
      ctx.beginPath(); ctx.arc(motifX, motifY, 8, Math.PI - .2, Math.PI * 2.35); ctx.stroke();
    } else if (mode === 'blank') {
      ctx.setLineDash([2.5, 2.5]); ctx.strokeRect(motifX - 9, motifY - 9, 18, 18); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(motifX - 5, motifY); ctx.lineTo(motifX + 5, motifY); ctx.moveTo(motifX, motifY - 5); ctx.lineTo(motifX, motifY + 5); ctx.stroke();
    } else if (mode === 'trades') {
      for (let i = -10; i <= 5; i += 7) {
        ctx.beginPath(); ctx.moveTo(motifX + i, motifY + 8); ctx.lineTo(motifX + i + 7, motifY - 8); ctx.stroke();
      }
      drawRule(ctx, motifX - 12, motifY + 9, motifX + 12, accent, 1.4);
    } else if (mode === 'creative') {
      ctx.globalAlpha = .85;
      [[-5, -2, 6], [4, -4, 7], [1, 5, 6]].forEach(([dx, dy, radius]) => { ctx.beginPath(); ctx.arc(motifX + dx, motifY + dy, radius, 0, Math.PI * 2); ctx.stroke(); });
      ctx.globalAlpha = 1;
    } else if (mode === 'rental') {
      ctx.beginPath(); ctx.arc(motifX - 5, motifY, 5, 0, Math.PI * 2); ctx.moveTo(motifX, motifY); ctx.lineTo(motifX + 11, motifY); ctx.moveTo(motifX + 6, motifY); ctx.lineTo(motifX + 6, motifY + 4); ctx.moveTo(motifX + 10, motifY); ctx.lineTo(motifX + 10, motifY + 3); ctx.stroke();
    } else if (mode === 'appointments') {
      ctx.strokeRect(motifX - 9, motifY - 8, 18, 17);
      drawRule(ctx, motifX - 9, motifY - 3, motifX + 9, accent, 1.3);
      ctx.fillRect(motifX - 5, motifY + 1, 3, 3); ctx.fillRect(motifX + 2, motifY + 1, 3, 3);
      drawRuleVertical(ctx, motifX - 5, motifY - 11, motifY - 6, accent, 1.7); drawRuleVertical(ctx, motifX + 5, motifY - 11, motifY - 6, accent, 1.7);
    }

    ctx.fillStyle = cfg.muted;
    font(ctx, 7.3, 800, cfg.family);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('BILLING MODE', m + 48, y + 8);
    ctx.fillStyle = cfg.ink;
    font(ctx, 10.3, 750, cfg.family);
    ctx.fillText(String(data.billingLabel || mode), m + 48, y + 19);
    ctx.fillStyle = cfg.muted;
    font(ctx, 8.1, 500, cfg.family);
    ctx.textAlign = 'right';
    ctx.fillText(String(data.billingTagline || '').toUpperCase(), W - m - 12, y + 15);
    ctx.restore();
    return y + height;
  }

  function drawTable(ctx, data, cfg, layout, y, W) {
    const m = cfg.margin; const width = W - m * 2;
    const cols = cfg.compact
      ? [0, width * .49, width * .61, width * .72, width * .86, width]
      : [0, width * .52, width * .64, width * .75, width * .88, width];
    const headerH = cfg.compact ? 30 : 36;
    const headerFill = cfg.monochrome ? '#111318' : cfg.ledger ? '#e8ecf2' : cfg.id === 'minimal' || cfg.editorial || cfg.classic ? '#ffffff' : cfg.headerDark ? cfg.accent : cfg.pale;
    if (cfg.rounded && !cfg.ledger) fillRoundRect(ctx, m, y, width, headerH, Math.min(cfg.rounded, 8), headerFill);
    else { ctx.fillStyle = headerFill; ctx.fillRect(m, y, width, headerH); }
    if (cfg.id === 'minimal' || cfg.editorial || cfg.classic) { drawRule(ctx, m, y, W - m, cfg.ink, 1.25); drawRule(ctx, m, y + headerH, W - m, cfg.ink, 1.25); }
    else if (cfg.ledger) { ctx.strokeStyle = cfg.line; ctx.strokeRect(m, y, width, headerH); }
    else if (cfg.id === 'studio') { ctx.fillStyle = cfg.accent; ctx.fillRect(m, y, width, 3); }
    const labels = [data.itemLabels.description, data.itemLabels.quantity, data.itemLabels.unit, data.itemLabels.rate, data.itemLabels.amount];
    ctx.fillStyle = cfg.monochrome ? '#ffffff' : cfg.headerDark && !cfg.ledger ? contrastText(cfg.accent) : cfg.ink;
    font(ctx, cfg.compact ? 8.2 : 8.7, 750, cfg.family); ctx.textBaseline = 'middle';
    labels.forEach((label, i) => {
      const left = m + cols[i]; const right = m + cols[i + 1];
      ctx.textAlign = i === 0 ? 'left' : 'right';
      ctx.fillText(String(label || '').toUpperCase(), i === 0 ? left + 10 : right - 8, y + headerH / 2);
    });
    let rowY = y + headerH;
    data.items.forEach((item, index) => {
      const rowH = layout.rowHeights[index];
      if (cfg.ledger) {
        ctx.fillStyle = index % 2 ? '#fbfcfe' : '#ffffff'; ctx.fillRect(m, rowY, width, rowH);
        ctx.strokeStyle = cfg.line; ctx.strokeRect(m, rowY, width, rowH);
        for (let i = 1; i < cols.length - 1; i += 1) drawRuleVertical(ctx, m + cols[i], rowY, rowY + rowH, cfg.line, .8);
      } else {
        if ((index % 2 || cfg.compact) && cfg.id !== 'minimal' && cfg.id !== 'editorial' && !cfg.classic && !cfg.monochrome) {
          ctx.fillStyle = cfg.soft ? '#fffaf5' : cfg.horizon ? cfg.pale : cfg.compact ? (index % 2 ? '#f4f6fa' : '#fbfcfe') : '#fafbfe';
          ctx.fillRect(m, rowY, width, rowH);
        }
        if (cfg.bold) { ctx.fillStyle = index % 2 ? cfg.accent : mix(cfg.accent, '#ffffff', .52); ctx.fillRect(m, rowY, 4, rowH); }
        if (cfg.headerDark || cfg.split) {
          for (let i = 1; i < cols.length - 1; i += 1) drawRuleVertical(ctx, m + cols[i], rowY, rowY + rowH, cfg.line, .55);
        }
        drawRule(ctx, m, rowY + rowH, W - m, cfg.line, .75);
      }
      ctx.fillStyle = cfg.ink; font(ctx, cfg.compact ? 8.9 : 9.7, 500, cfg.family); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      const lines = wrapLines(ctx, item.description || '—', cols[1] - cols[0] - 18, 3);
      lines.forEach((line, lineIndex) => ctx.fillText(line, m + 9, rowY + (cfg.compact ? 8 : 10) + lineIndex * (cfg.compact ? 12.5 : 14.5)));
      ctx.textBaseline = 'middle'; font(ctx, cfg.compact ? 8.7 : 9.3, 400, cfg.family);
      const values = [String(item.quantity ?? ''), String(item.unit || ''), item.rateFormatted || '', item.amountFormatted || ''];
      for (let i = 1; i < 5; i += 1) {
        ctx.textAlign = 'right'; ctx.fillText(values[i - 1], m + cols[i + 1] - 8, rowY + rowH / 2);
      }
      rowY += rowH;
    });
    return rowY;
  }

  function drawRuleVertical(ctx, x, y1, y2, colour, width = 1) {
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.stroke();
  }

  function drawTotals(ctx, data, cfg, y, W) {
    const m = cfg.margin;
    let boxW = cfg.compact ? 252 : 275;
    let x = W - m - boxW;
    if (cfg.bold) { boxW = W - m * 2; x = m; }
    else if (cfg.split) x = m;
    else if (cfg.soft || cfg.classic || cfg.editorial) x = (W - boxW) / 2;
    else if (cfg.horizon) { boxW = 320; x = W - m - boxW; }
    const rowH = cfg.compact ? 24 : 27; const totalH = data.totals.length * rowH + 14;
    if (cfg.bold) fillRoundRect(ctx, x, y, boxW, totalH, cfg.rounded, mix(cfg.accent, '#ffffff', .94), cfg.accent, 1.1);
    else if (cfg.id !== 'minimal' && cfg.id !== 'editorial' && !cfg.classic && !cfg.monochrome && !cfg.ledger) fillRoundRect(ctx, x, y, boxW, totalH, cfg.rounded, cfg.soft ? '#ffffff' : '#fbfcff', cfg.line);
    else if (cfg.monochrome) { ctx.strokeStyle = '#111318'; ctx.lineWidth = 1.4; ctx.strokeRect(x, y, boxW, totalH); }
    else if (cfg.classic) { drawRule(ctx, x, y, x + boxW, cfg.ink, 1.1); drawRule(ctx, x, y + totalH, x + boxW, cfg.ink, 1.1); }
    data.totals.forEach((row, index) => {
      const isGrand = Boolean(row.grand); const ry = y + 7 + index * rowH;
      if (isGrand) {
        if (cfg.monochrome) { ctx.fillStyle = '#111318'; ctx.fillRect(x, ry - 3, boxW, rowH); }
        else if (cfg.bold || cfg.headerDark || cfg.id === 'studio') fillRoundRect(ctx, x + 5, ry - 3, boxW - 10, rowH, Math.min(cfg.rounded, 7), cfg.accent);
        else { ctx.fillStyle = cfg.pale; ctx.fillRect(x, ry - 3, boxW, rowH); }
      }
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = isGrand && cfg.monochrome ? '#ffffff' : isGrand && (cfg.bold || cfg.headerDark || cfg.id === 'studio') ? contrastText(cfg.accent) : cfg.muted;
      font(ctx, isGrand ? 9.4 : 8.8, isGrand ? 750 : 500, cfg.family); ctx.fillText(row.label, x + 14, ry + rowH / 2 - 3);
      ctx.textAlign = 'right'; ctx.fillStyle = isGrand && cfg.monochrome ? '#ffffff' : isGrand && (cfg.bold || cfg.headerDark || cfg.id === 'studio') ? contrastText(cfg.accent) : cfg.ink;
      font(ctx, isGrand ? 14 : 10, isGrand ? 800 : 650, cfg.family); ctx.fillText(row.formatted, x + boxW - 14, ry + rowH / 2 - 3);
    });
    return y + totalH;
  }

  function drawFooterBlocks(ctx, data, cfg, y, W) {
    const m = cfg.margin; const width = W - m * 2; const gap = 16;
    if (data.notes || data.terms) {
      const colW = (width - gap) / 2;
      const blocks = [[data.notesLabel || 'Notes', data.notes], [data.termsLabel || 'Payment terms', data.terms]].filter(([, value]) => value);
      blocks.forEach(([label, value], index) => {
        const x = m + index * (colW + gap); const w = blocks.length === 1 ? width : colW;
        if (cfg.id !== 'minimal' && cfg.id !== 'editorial' && !cfg.classic && !cfg.monochrome) fillRoundRect(ctx, x, y, w, 84, cfg.rounded, cfg.soft ? '#fff8f0' : cfg.pale);
        else { drawRule(ctx, x, y, x + w, cfg.monochrome ? '#111318' : cfg.line, cfg.monochrome ? 1.4 : 1); }
        ctx.fillStyle = cfg.muted; font(ctx, 8.3, 750, cfg.family); ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(String(label).toUpperCase(), x + (cfg.rounded ? 13 : 0), y + 12);
        ctx.fillStyle = cfg.ink; font(ctx, 8.9, 400, cfg.family);
        drawWrapped(ctx, value, x + (cfg.rounded ? 13 : 0), y + 29, w - (cfg.rounded ? 26 : 0), 12.5, { maxLines: 4 });
      });
      y += 100;
    }
    if (data.bank) {
      ctx.fillStyle = cfg.muted; font(ctx, 8.3, 750, cfg.family); ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('BANK DETAILS', m, y);
      ctx.fillStyle = cfg.ink; font(ctx, 9.2, 500, cfg.family); ctx.fillText(data.bank, m, y + 17);
      y += 43;
    }
    if (data.showSignature) {
      drawRule(ctx, W - m - 190, y + 34, W - m, cfg.line, 1);
      ctx.fillStyle = cfg.muted; font(ctx, 8.4, 500, cfg.family); ctx.textAlign = 'right'; ctx.fillText(data.signatureLabel || 'Authorised signature', W - m, y + 42);
      y += 65;
    }
    return y;
  }

  async function render(canvas, data) {
    if (!canvas || !data) throw new Error('Canvas and document data are required.');
    const cfg = templateConfig(data.template || 'studio', data.accent || '#4f46e5');
    const measureCanvas = document.createElement('canvas'); const measureCtx = measureCanvas.getContext('2d');
    const layout = measureLayout(data, cfg, measureCtx);
    canvas.width = BASE_WIDTH * DPR;
    canvas.height = layout.height * DPR;
    canvas.style.width = `${BASE_WIDTH}px`;
    canvas.style.height = `${layout.height}px`;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = cfg.paper; ctx.fillRect(0, 0, BASE_WIDTH, layout.height);
    drawPagePersonality(ctx, cfg, BASE_WIDTH, layout.height);
    if (layout.height > BASE_PAGE_HEIGHT) {
      for (let y = BASE_PAGE_HEIGHT; y < layout.height; y += BASE_PAGE_HEIGHT) drawRule(ctx, 0, y, BASE_WIDTH, '#eceff4', 1);
    }
    drawHeader(ctx, data, cfg, BASE_WIDTH);

    let y = cfg.headerHeight + (cfg.editorial || cfg.classic ? 32 : 22);
    y = drawMetaAndParties(ctx, data, cfg, y, BASE_WIDTH);
    if (data.contextMessage) y = drawContextBanner(ctx, data, cfg, y + 12, BASE_WIDTH) + (cfg.compact ? 17 : 21);
    else y += cfg.compact ? 21 : 27;
    if (data.billingMode) y = drawBillingSignature(ctx, data, cfg, y, BASE_WIDTH) + (cfg.compact ? 13 : 17);
    y = drawTable(ctx, data, cfg, layout, y, BASE_WIDTH) + (cfg.compact ? 19 : 24);
    y = drawTotals(ctx, data, cfg, y, BASE_WIDTH) + (cfg.compact ? 23 : 28);
    y = drawFooterBlocks(ctx, data, cfg, y, BASE_WIDTH);

    const footerY = layout.height - 31;
    drawRule(ctx, cfg.margin, footerY - 8, BASE_WIDTH - cfg.margin, cfg.line, .75);
    ctx.fillStyle = cfg.muted; font(ctx, 7.8, 400, cfg.family); ctx.textBaseline = 'top';
    ctx.textAlign = 'left'; ctx.fillText(data.number || '', cfg.margin, footerY);
    ctx.textAlign = 'right'; ctx.fillText('Generated with Invoice Studio', BASE_WIDTH - cfg.margin, footerY);

    if (data.logoData) {
      const image = await loadImage(data.logoData);
      if (image) {
        const boxWidth = Math.max(54, Math.min(220, Number(data.logoWidth) || 116));
        const boxHeight = Math.max(34, Math.min(92, boxWidth * .38));
        const centreX = BASE_WIDTH * Math.max(0, Math.min(100, Number(data.logoX) || 0)) / 100;
        const centreY = layout.height * Math.max(0, Math.min(100, Number(data.logoY) || 0)) / 100;
        const x = Math.max(4, Math.min(BASE_WIDTH - boxWidth - 4, centreX - boxWidth / 2));
        const logoY = Math.max(4, Math.min(layout.height - boxHeight - 4, centreY - boxHeight / 2));
        const inset = Math.max(5, Math.min(10, boxWidth * .06));
        ctx.save();
        ctx.shadowColor = 'rgba(22, 26, 45, .12)';
        ctx.shadowBlur = 9;
        ctx.shadowOffsetY = 3;
        fillRoundRect(ctx, x, logoY, boxWidth, boxHeight, 7, 'rgba(255,255,255,.96)', cfg.line);
        ctx.shadowColor = 'transparent';
        drawImageContain(ctx, image, x + inset, logoY + inset * .72, boxWidth - inset * 2, boxHeight - inset * 1.44);
        ctx.restore();
      }
    }

    canvas.dataset.baseHeight = String(layout.height);
    return canvas;
  }

  window.InvoiceRenderer = { render, BASE_WIDTH, BASE_PAGE_HEIGHT, DPR };
})();
