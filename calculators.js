(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
  const currency = () => $('#toolCurrency').value;
  const money = (value) => new Intl.NumberFormat(currency() === 'PLN' ? 'pl-PL' : 'en-GB', { style: 'currency', currency: currency(), minimumFractionDigits: 2 }).format(num(value));

  function hoursValues() {
    const start = $('#hoursStart').value; const end = $('#hoursEnd').value;
    const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number);
    let minutes = eh * 60 + em - sh * 60;
    if (minutes <= 0) minutes += 1440;
    minutes = Math.max(0, minutes - num($('#hoursBreak').value));
    const hours = Math.round(minutes / 60 * 100) / 100;
    return { hours, value: hours * num($('#hoursRate').value), start, end };
  }

  function vatValues() {
    const amount = num($('#vatAmount').value); const rate = num($('#vatRateTool').value); const basis = $('#vatBasis').value;
    const net = basis === 'gross' ? amount / (1 + rate / 100) : amount;
    const gross = basis === 'gross' ? amount : amount * (1 + rate / 100);
    return { net, vat: gross - net, gross, rate };
  }

  function mileageValues() {
    const distance = num($('#mileageDistance').value); const rate = num($('#mileageRate').value); const extra = num($('#mileageExtra').value);
    return { distance, rate, extra, base: distance * rate, total: distance * rate + extra };
  }

  function adjustmentValues() {
    const subtotal = num($('#adjustSubtotal').value); const discountValue = num($('#adjustDiscount').value); const type = $('#adjustType').value; const deposit = num($('#adjustDeposit').value);
    const discount = type === 'percent' ? subtotal * discountValue / 100 : Math.min(subtotal, discountValue);
    return { subtotal, discountValue, type, deposit, discount, remaining: Math.max(0, subtotal - discount - deposit) };
  }

  function update() {
    const h = hoursValues(); $('#hoursResult').textContent = `${h.hours} h • ${money(h.value)}`;
    const v = vatValues(); $('#vatResult').textContent = `${money(v.net)} / ${money(v.vat)} / ${money(v.gross)}`;
    const m = mileageValues(); $('#mileageResult').textContent = money(m.total);
    const a = adjustmentValues(); $('#adjustResult').textContent = money(a.remaining);
  }

  function toast(title, message) {
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = `<span>✓</span><div><strong>${title}</strong><small>${message}</small></div>`;
    $('#toastRegion').appendChild(node);
    setTimeout(() => node.classList.add('out'), 2600);
    setTimeout(() => node.remove(), 2900);
  }

  function sendToInvoice(kind) {
    let payload;
    if (kind === 'hours') {
      const v = hoursValues();
      payload = { item: { description: `${$('#hoursDescription').value || 'Hours worked'} (${$('#hoursStart').value}–${$('#hoursEnd').value})`, quantity: v.hours, unit: 'hour', rate: num($('#hoursRate').value) }, settings: { currency: currency(), workMode: 'hours' } };
    } else if (kind === 'vat') {
      payload = { settings: { currency: currency(), vatEnabled: true, vatRate: vatValues().rate, documentType: 'vat' } };
    } else if (kind === 'mileage') {
      const v = mileageValues();
      payload = { item: { description: $('#mileageDescription').value || 'Business mileage', quantity: v.distance, unit: $('#mileageUnit').value, rate: v.rate }, settings: { currency: currency(), workMode: 'transport' } };
      if (v.extra > 0) payload.extraItem = { description: 'Additional travel costs', quantity: 1, unit: 'expense', rate: v.extra };
    } else {
      const v = adjustmentValues();
      payload = { settings: { currency: currency(), discountType: v.type, discountValue: v.discountValue, depositPaid: v.deposit } };
    }
    if (payload.extraItem) {
      const draft = JSON.parse(localStorage.getItem('invoiceStudioDraftV1') || '{}');
      draft.items = Array.isArray(draft.items) ? draft.items : [];
      draft.items.push({ id: `${Date.now()}-extra`, ...payload.extraItem });
      localStorage.setItem('invoiceStudioDraftV1', JSON.stringify(draft));
    }
    localStorage.setItem('invoiceStudioPendingItemV1', JSON.stringify(payload));
    location.href = 'index.html';
  }

  async function copy(kind) {
    const text = kind === 'hours' ? $('#hoursResult').textContent : kind === 'vat' ? $('#vatResult').textContent : kind === 'mileage' ? $('#mileageResult').textContent : $('#adjustResult').textContent;
    try { await navigator.clipboard.writeText(text); toast('Copied', 'The calculation is ready to paste.'); }
    catch { toast('Copy unavailable', 'Select the result manually.'); }
  }

  document.addEventListener('input', update);
  document.addEventListener('change', update);
  document.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add]'); if (add) sendToInvoice(add.dataset.add);
    const copyButton = event.target.closest('[data-copy]'); if (copyButton) copy(copyButton.dataset.copy);
  });
  update();
})();
