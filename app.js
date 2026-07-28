(() => {
  'use strict';

  const STORAGE_KEY = 'invoiceStudioDraftV1';
  const SELLER_KEY = 'invoiceStudioSellerV1';
  const COUNTER_KEY = 'invoiceStudioCounterV1';

  const documentTypes = [
    { id: 'invoice', icon: 'invoice', title: 'Invoice', subtitle: 'A standard invoice for services or products' },
    { id: 'vat', icon: 'vat', title: 'VAT Invoice', subtitle: 'An invoice with VAT and tax details' },
    { id: 'quote', icon: 'quote', title: 'Quote / Estimate', subtitle: 'A professional price proposal before work starts' },
    { id: 'proforma', icon: 'proforma', title: 'Pro Forma', subtitle: 'An informative document issued before payment' },
    { id: 'credit', icon: 'credit', title: 'Credit Note', subtitle: 'A correction or refund against an earlier invoice' },
    { id: 'receipt', icon: 'receipt', title: 'Receipt', subtitle: 'Confirmation that payment has been received' },
    { id: 'deposit', icon: 'deposit', title: 'Deposit Invoice', subtitle: 'Request or record an upfront project payment' },
    { id: 'final', icon: 'final', title: 'Final Invoice', subtitle: 'Close a project after deposits or staged payments' },
    { id: 'commercial', icon: 'commercial', title: 'Commercial Invoice', subtitle: 'Goods and customs details for international trade' },
    { id: 'recurringInvoice', icon: 'recurringInvoice', title: 'Recurring Invoice', subtitle: 'Regular billing for ongoing work or subscriptions' },
    { id: 'interim', icon: 'interim', title: 'Interim Invoice', subtitle: 'Progress billing before a project is fully complete' },
    { id: 'paymentRequest', icon: 'paymentRequest', title: 'Payment Request', subtitle: 'A clear request for an agreed amount to be paid' }
  ];

  const workModes = [
    { id: 'service', icon: 'service', title: 'Services', subtitle: 'One or more completed services' },
    { id: 'hours', icon: 'hours', title: 'Hours & days', subtitle: 'Working time, hourly rates or day rates' },
    { id: 'products', icon: 'products', title: 'Products', subtitle: 'Quantities, unit prices and delivery' },
    { id: 'transport', icon: 'transport', title: 'Transport & mileage', subtitle: 'Routes, mileage, tolls and travel costs' },
    { id: 'project', icon: 'project', title: 'Project / contract', subtitle: 'Milestones, deposits and fixed project fees' },
    { id: 'expenses', icon: 'expenses', title: 'Expenses & reimbursements', subtitle: 'Receipts, purchases and costs billed back' },
    { id: 'recurring', icon: 'recurring', title: 'Recurring work', subtitle: 'Monthly retainers, subscriptions and support' },
    { id: 'blank', icon: 'blank', title: 'Blank document', subtitle: 'Full control with custom line items' },
    { id: 'trades', icon: 'trades', title: 'Construction & trades', subtitle: 'Labour, call-outs, materials and site work' },
    { id: 'creative', icon: 'creative', title: 'Creative & digital', subtitle: 'Design, photography, media and licence fees' },
    { id: 'rental', icon: 'rental', title: 'Rentals & hire', subtitle: 'Equipment, vehicles, periods and delivery fees' },
    { id: 'appointments', icon: 'appointments', title: 'Lessons & appointments', subtitle: 'Sessions, consultations, coaching and tuition' }
  ];

  const billingProfiles = {
    service: { label: 'Service delivery', tagline: 'Professional work and completed services' },
    hours: { label: 'Time billing', tagline: 'Hours, days and time-based rates' },
    products: { label: 'Goods supplied', tagline: 'Products, quantities and unit prices' },
    transport: { label: 'Route & mileage', tagline: 'Journeys, distance and transport costs' },
    project: { label: 'Project milestones', tagline: 'Fixed fees, stages and contract work' },
    expenses: { label: 'Cost recovery', tagline: 'Receipts and reimbursable expenditure' },
    recurring: { label: 'Recurring cycle', tagline: 'Retainers, subscriptions and ongoing support' },
    blank: { label: 'Custom billing', tagline: 'A flexible document with custom line items' },
    trades: { label: 'Trade & site work', tagline: 'Labour, materials, call-outs and installations' },
    creative: { label: 'Creative production', tagline: 'Design, media, usage and licence fees' },
    rental: { label: 'Hire period', tagline: 'Equipment, vehicles and rental duration' },
    appointments: { label: 'Booked sessions', tagline: 'Lessons, consultations and appointments' }
  };

  const templates = [
    { id: 'studio', title: 'Studio', subtitle: 'Layered cards with a luminous accent', thumb: 'thumb-studio' },
    { id: 'minimal', title: 'Minimal', subtitle: 'Pure whitespace and typographic precision', thumb: 'thumb-minimal' },
    { id: 'corporate', title: 'Corporate', subtitle: 'Executive colour bands and structured data', thumb: 'thumb-corporate' },
    { id: 'compact', title: 'Compact', subtitle: 'Dense one-page layout for long documents', thumb: 'thumb-compact' },
    { id: 'editorial', title: 'Editorial', subtitle: 'Magazine-inspired serif composition', thumb: 'thumb-editorial' },
    { id: 'ledger', title: 'Ledger', subtitle: 'Accounting grid with tabular clarity', thumb: 'thumb-ledger' },
    { id: 'bold', title: 'Bold', subtitle: 'Statement colour rail and full-width totals', thumb: 'thumb-bold' },
    { id: 'soft', title: 'Soft', subtitle: 'Warm rounded panels and gentle contrast', thumb: 'thumb-soft' },
    { id: 'monochrome', title: 'Monochrome', subtitle: 'High-contrast black-and-white system', thumb: 'thumb-monochrome' },
    { id: 'split', title: 'Split', subtitle: 'Asymmetric two-tone document architecture', thumb: 'thumb-split' },
    { id: 'classic', title: 'Classic', subtitle: 'Traditional double-rule business stationery', thumb: 'thumb-classic' },
    { id: 'horizon', title: 'Horizon', subtitle: 'Panoramic banner with diagonal geometry', thumb: 'thumb-horizon' }
  ];

  const documentProfiles = {
    invoice: {
      prefix: 'INV', badge: 'PAYMENT DUE', message: 'Standard invoice for completed work or supplied goods.',
      issueLabel: 'Invoice date', dueLabel: 'Payment due', serviceLabel: 'Supply date', fromLabel: 'Supplier', toLabel: 'Bill to',
      itemLabel: 'Service or product', notes: '',
      terms: '', dueDays: 14
    },
    vat: {
      prefix: 'VAT', badge: 'VAT DOCUMENT', message: 'VAT is itemised separately and the supplier VAT number should be shown.',
      issueLabel: 'Tax point', dueLabel: 'Payment due', serviceLabel: 'Supply date', fromLabel: 'VAT supplier', toLabel: 'VAT customer',
      itemLabel: 'Taxable supply', notes: '',
      terms: '', dueDays: 14, vat: true
    },
    quote: {
      prefix: 'QTE', badge: 'NO PAYMENT REQUIRED', message: 'Price proposal only — acceptance is required before work begins.',
      issueLabel: 'Quote date', dueLabel: 'Valid until', serviceLabel: 'Proposed start', fromLabel: 'Prepared by', toLabel: 'Prepared for',
      itemLabel: 'Proposed work', notes: '',
      terms: '', dueDays: 30
    },
    proforma: {
      prefix: 'PRO', badge: 'NOT A TAX INVOICE', message: 'Advance information for payment — replace with a final tax invoice after supply.',
      issueLabel: 'Pro forma date', dueLabel: 'Pay by', serviceLabel: 'Expected supply', fromLabel: 'Supplier', toLabel: 'Customer',
      itemLabel: 'Planned supply', notes: '',
      terms: '', dueDays: 7
    },
    credit: {
      prefix: 'CRN', badge: 'CREDIT ADJUSTMENT', message: 'Credit against a previous invoice — show the original invoice reference.',
      issueLabel: 'Credit date', dueLabel: 'Credit applied by', serviceLabel: 'Original supply date', fromLabel: 'Issued by', toLabel: 'Credited to',
      itemLabel: 'Reason for credit', notes: '',
      terms: '', dueDays: 14
    },
    receipt: {
      prefix: 'RCT', badge: 'PAID', message: 'Confirms that payment has been received in full.',
      issueLabel: 'Receipt date', dueLabel: 'Paid on', serviceLabel: 'Payment for', fromLabel: 'Received by', toLabel: 'Received from',
      itemLabel: 'Payment description', notes: '',
      terms: '', dueDays: 0, paid: true
    },
    deposit: {
      prefix: 'DEP', badge: 'DEPOSIT REQUEST', message: 'Requests an agreed upfront payment before the project or supply begins.',
      issueLabel: 'Request date', dueLabel: 'Deposit due', serviceLabel: 'Project start', fromLabel: 'Supplier', toLabel: 'Customer',
      itemLabel: 'Deposit milestone', notes: '',
      terms: '', dueDays: 7
    },
    final: {
      prefix: 'FIN', badge: 'FINAL BALANCE', message: 'Closes the project and deducts deposits or staged payments already received.',
      issueLabel: 'Final invoice date', dueLabel: 'Final payment due', serviceLabel: 'Completion date', fromLabel: 'Supplier', toLabel: 'Bill to',
      itemLabel: 'Completed stage', notes: '',
      terms: '', dueDays: 7, exampleDeposit: 600
    },
    commercial: {
      prefix: 'COM', badge: 'CUSTOMS DOCUMENT', message: 'Commercial goods document for international shipment and customs valuation.',
      issueLabel: 'Invoice date', dueLabel: 'Payment terms', serviceLabel: 'Dispatch date', fromLabel: 'Exporter', toLabel: 'Consignee',
      itemLabel: 'Goods / commodity details', notes: '',
      terms: '', dueDays: 30, noVat: true
    },
    recurringInvoice: {
      prefix: 'REC', badge: 'RECURRING BILLING', message: 'Regular billing for the stated service period or subscription cycle.',
      issueLabel: 'Billing date', dueLabel: 'Payment due', serviceLabel: 'Billing period', fromLabel: 'Service provider', toLabel: 'Subscriber',
      itemLabel: 'Recurring service', notes: '',
      terms: '', dueDays: 7
    },
    interim: {
      prefix: 'INT', badge: 'PROGRESS PAYMENT', message: 'Interim valuation for work completed to date — not the final project account.',
      issueLabel: 'Valuation date', dueLabel: 'Progress payment due', serviceLabel: 'Work period', fromLabel: 'Contractor', toLabel: 'Client',
      itemLabel: 'Progress stage', notes: '',
      terms: '', dueDays: 14
    },
    paymentRequest: {
      prefix: 'PAY', badge: 'PAYMENT REQUEST', message: 'A direct request for an agreed or outstanding amount to be paid.',
      issueLabel: 'Request date', dueLabel: 'Please pay by', serviceLabel: 'Related service date', fromLabel: 'Requested by', toLabel: 'Requested from',
      itemLabel: 'Amount requested for', notes: '',
      terms: '', dueDays: 7
    }
  };

  const billingSuggestions = {
    service: [
      { description: 'Professional service fee', quantity: 1, unit: 'service', rate: 450 },
      { description: 'Initial consultation and planning', quantity: 2, unit: 'hour', rate: 65 },
      { description: 'Priority delivery / administration', quantity: 1, unit: 'service', rate: 45 }
    ],
    hours: [
      { description: 'Weekday professional services', quantity: 8, unit: 'hour', rate: 28 },
      { description: 'Weekend / out-of-hours services', quantity: 4, unit: 'hour', rate: 36 },
      { description: 'Day-rate assignment', quantity: 1, unit: 'day', rate: 240 },
      { description: 'Night-out allowance', quantity: 1, unit: 'night', rate: 30 }
    ],
    products: [
      { description: 'Custom manufactured item', quantity: 10, unit: 'item', rate: 24.5 },
      { description: 'Packaging and handling', quantity: 1, unit: 'service', rate: 18 },
      { description: 'Delivery charge', quantity: 1, unit: 'service', rate: 15 }
    ],
    transport: [
      { description: 'Business mileage', quantity: 120, unit: 'mile', rate: 0.45 },
      { description: 'Scheduled delivery service', quantity: 1, unit: 'job', rate: 185 },
      { description: 'Tolls and parking', quantity: 1, unit: 'expense', rate: 28.5 },
      { description: 'Waiting time', quantity: 2, unit: 'hour', rate: 32 }
    ],
    project: [
      { description: 'Project discovery and planning', quantity: 1, unit: 'project', rate: 350 },
      { description: 'Implementation milestone', quantity: 1, unit: 'project', rate: 900 },
      { description: 'Final delivery and handover', quantity: 1, unit: 'project', rate: 450 }
    ],
    expenses: [
      { description: 'Hotel accommodation reimbursement', quantity: 1, unit: 'expense', rate: 96.4 },
      { description: 'Rail travel reimbursement', quantity: 1, unit: 'expense', rate: 44 },
      { description: 'Parking and local travel', quantity: 1, unit: 'expense', rate: 18.5 }
    ],
    recurring: [
      { description: 'Monthly service retainer', quantity: 1, unit: 'month', rate: 450 },
      { description: 'Ongoing support package', quantity: 1, unit: 'subscription', rate: 120 },
      { description: 'Additional support hours', quantity: 3, unit: 'hour', rate: 55 }
    ],
    blank: [
      { description: 'Custom line item', quantity: 1, unit: 'item', rate: 100 },
      { description: 'Additional agreed charge', quantity: 1, unit: 'service', rate: 50 }
    ],
    trades: [
      { description: 'Skilled labour', quantity: 6, unit: 'hour', rate: 45 },
      { description: 'Materials supplied', quantity: 1, unit: 'expense', rate: 120 },
      { description: 'Call-out charge', quantity: 1, unit: 'service', rate: 40 },
      { description: 'Waste removal and site clearance', quantity: 1, unit: 'service', rate: 75 }
    ],
    creative: [
      { description: 'Creative concept and design', quantity: 1, unit: 'project', rate: 600 },
      { description: 'Production and editing', quantity: 1, unit: 'day', rate: 380 },
      { description: 'Commercial usage licence', quantity: 1, unit: 'licence', rate: 150 }
    ],
    rental: [
      { description: 'Equipment hire', quantity: 3, unit: 'day', rate: 160 },
      { description: 'Delivery and collection', quantity: 1, unit: 'service', rate: 75 },
      { description: 'Damage waiver', quantity: 1, unit: 'rental', rate: 35 }
    ],
    appointments: [
      { description: 'One-to-one consultation', quantity: 4, unit: 'session', rate: 55 },
      { description: 'Follow-up appointment', quantity: 1, unit: 'visit', rate: 40 },
      { description: 'Preparation materials', quantity: 1, unit: 'item', rate: 18 }
    ]
  };

  const accents = ['#4f46e5', '#176b87', '#20735c', '#7a3e56', '#a35c21', '#222a3a', '#2563eb', '#b4234d'];

  function normalizeHexColour(value) {
    let hex = String(value || '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.split('').map((character) => character + character).join('');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return `#${hex.toLowerCase()}`;
  }

  const languageLabels = {
    en: {
      document: { invoice: 'Invoice', vat: 'VAT Invoice', quote: 'Quote', proforma: 'Pro Forma Invoice', credit: 'Credit Note', receipt: 'Receipt', deposit: 'Deposit Invoice', final: 'Final Invoice', commercial: 'Commercial Invoice', recurringInvoice: 'Recurring Invoice', interim: 'Interim Invoice', paymentRequest: 'Payment Request' },
      number: { invoice: 'Invoice no.', vat: 'Invoice no.', quote: 'Quote no.', proforma: 'Pro forma no.', credit: 'Credit note no.', receipt: 'Receipt no.', deposit: 'Deposit invoice no.', final: 'Final invoice no.', commercial: 'Commercial invoice no.', recurringInvoice: 'Recurring invoice no.', interim: 'Interim invoice no.', paymentRequest: 'Payment request no.' },
      issueDate: 'Issue date', dueDate: 'Due date', serviceDate: 'Service date', from: 'From', to: 'Bill to',
      description: 'Description', quantity: 'Quantity', unit: 'Unit', rate: 'Rate', amount: 'Amount',
      subtotal: 'Subtotal', discount: 'Discount', vat: 'VAT', deposit: 'Deposit paid', amountDue: 'Amount due', total: 'Total', paidTotal: 'Paid total', creditTotal: 'Credit total', quoteTotal: 'Quote total', depositTotal: 'Deposit due', finalTotal: 'Final balance',
      notes: '', terms: '', bank: 'Bank details', signature: 'Authorised signature'
    },
    pl: {
      document: { invoice: 'Faktura', vat: 'Faktura VAT', quote: 'Wycena', proforma: 'Faktura pro forma', credit: 'Faktura korygująca', receipt: 'Rachunek', deposit: 'Faktura zaliczkowa', final: 'Faktura końcowa', commercial: 'Faktura handlowa', recurringInvoice: 'Faktura cykliczna', interim: 'Faktura częściowa', paymentRequest: 'Wezwanie do zapłaty' },
      number: { invoice: 'Numer faktury', vat: 'Numer faktury', quote: 'Numer wyceny', proforma: 'Numer pro forma', credit: 'Numer korekty', receipt: 'Numer rachunku', deposit: 'Numer faktury zaliczkowej', final: 'Numer faktury końcowej', commercial: 'Numer faktury handlowej', recurringInvoice: 'Numer faktury cyklicznej', interim: 'Numer faktury częściowej', paymentRequest: 'Numer wezwania do zapłaty' },
      issueDate: 'Data wystawienia', dueDate: 'Termin płatności', serviceDate: 'Data wykonania', from: 'Wystawca', to: 'Nabywca',
      description: 'Opis', quantity: 'Ilość', unit: 'Jednostka', rate: 'Stawka', amount: 'Suma',
      subtotal: 'Suma netto', discount: 'Rabat', vat: 'VAT', deposit: 'Zapłacona zaliczka', amountDue: 'Do zapłaty', total: 'Razem', paidTotal: 'Zapłacono', creditTotal: 'Wartość korekty', quoteTotal: 'Wartość wyceny', depositTotal: 'Zaliczka do zapłaty', finalTotal: 'Saldo końcowe',
      notes: '', terms: '', bank: 'Dane bankowe', signature: 'Podpis wystawcy'
    }
  };

  function todayIso() {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function addDays(dateString, days) {
    const date = dateString ? new Date(`${dateString}T12:00:00`) : new Date();
    date.setDate(date.getDate() + Number(days || 0));
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function nextDocumentNumber() {
    const year = new Date().getFullYear();
    let counter = Number(localStorage.getItem(COUNTER_KEY) || 1);
    if (!Number.isFinite(counter) || counter < 1) counter = 1;
    return `INV-${year}-${String(counter).padStart(3, '0')}`;
  }

  function defaultState() {
    const issueDate = todayIso();
    return {
      currentStep: 1,
      documentType: 'invoice',
      workMode: 'service',
      country: 'GB',
      currency: 'GBP',
      documentLanguage: 'en',
      invoiceNumber: nextDocumentNumber(),
      issueDate,
      dueDate: addDays(issueDate, 14),
      dueDateEnabled: true,
      serviceDate: issueDate,
      sellerName: '', sellerEmail: '', sellerPhone: '', sellerAddress: '', sellerCompanyNo: '', sellerVatNo: '',
      bankName: '', bankCode: '', bankAccount: '',
      clientName: '', clientEmail: '', clientPhone: '', clientAddress: '', clientVatNo: '', purchaseOrder: '',
      items: [],
      vatEnabled: false,
      vatRate: 20,
      discountType: 'percent',
      discountValue: 0,
      depositPaid: 0,
      template: 'studio',
      accent: '#4f46e5',
      logoData: '',
      logoX: 88,
      logoY: 5,
      logoWidth: 116,
      showBank: false,
      showNotes: false,
      showTerms: false,
      showSignature: false,
      notes: '',
      terms: '',
      previewZoom: 0.86,
      previewZoomManual: false
    };
  }

  let state = loadState();
  state.accent = normalizeHexColour(state.accent) || '#4f46e5';
  // Treat the old starter copy as examples, not saved invoice content.
  if (state.notes === 'Thank you for your business.' || state.notes === 'Thank you for your business. Please quote the invoice number with your payment.') state.notes = '';
  if (state.terms === 'Payment due within 14 days.' || state.terms === 'Payment due within 14 days by bank transfer.') state.terms = '';
  // Remove old demo-only footer content while preserving genuine user-entered details.
  const oldDemoNotes = new Set([
    'VAT is charged at the rate shown in the totals section.',
    'This quotation is based on the scope described below and remains subject to availability.',
    'This pro forma document is issued for payment information only.',
    'Credit issued against the original invoice reference shown on this document.',
    'Payment received with thanks.',
    'This deposit secures the booking and will be deducted from the final invoice.',
    'Final invoice for the completed project. Previous payments are deducted below.',
    'Goods are supplied for commercial export. Country of origin: United Kingdom.',
    'Recurring charge for the service period shown on this invoice.',
    'Interim application for the completed portion of the project.',
    'Please arrange payment using the reference shown above.'
  ]);
  const oldDemoTerms = new Set([
    'Payment due within 14 days. Please use the invoice number as the bank reference.',
    'Quote valid for 30 days. Work starts after written approval.',
    'Goods or services will be confirmed after cleared payment. This is not a tax invoice.',
    'The credit will be refunded or applied to the customer account.',
    'No balance remains due for the items listed below.',
    'Deposit payable within 7 days. Work is scheduled after cleared payment.',
    'Final balance due within 7 days by bank transfer.',
    'Incoterms: DAP. Values shown are for customs and payment purposes.',
    'Payment due within 7 days. The service renews for the next billing cycle unless cancelled.',
    'Payment due within 14 days. Remaining work will be included in later valuations.',
    'Payment is requested by the due date. Contact the sender if any details need clarification.'
  ]);
  if (oldDemoNotes.has(state.notes)) state.notes = '';
  if (oldDemoTerms.has(state.terms)) state.terms = '';
  if (state.bankName === 'Example Bank' && state.bankCode === '20-10-30' && state.bankAccount === '45871236') {
    state.bankName = ''; state.bankCode = ''; state.bankAccount = ''; state.showBank = false;
  }
  if (!state.notes) state.showNotes = false;
  if (!state.terms) state.showTerms = false;
  let saveTimer = null;
  let currentTool = 'hours';
  let previewRenderToken = 0;
  let logoMoveMode = false;
  let logoDragging = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        return {
          ...base,
          ...saved,
          currentStep: 1,
          items: Array.isArray(saved.items) ? saved.items : []
        };
      }
    } catch (error) {
      console.warn('Could not load draft', error);
    }
    try {
      const seller = JSON.parse(localStorage.getItem(SELLER_KEY) || 'null');
      if (seller) Object.assign(base, seller);
    } catch (error) { /* ignore */ }
    return base;
  }

  function saveState(immediate = false) {
    const run = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        $('#saveStatus')?.classList.remove('saving');
        const label = $('#saveStatus');
        if (label) label.lastChild.textContent = ' Saved locally';
      } catch (error) {
        toast('Could not save your data', 'Browser storage may be blocked.', 'error');
      }
    };
    $('#saveStatus')?.classList.add('saving');
    const label = $('#saveStatus');
    if (label) label.lastChild.textContent = ' Saving…';
    clearTimeout(saveTimer);
    if (immediate) run(); else saveTimer = setTimeout(run, 450);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function num(value) {
    const parsed = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function currencyFormatter() {
    const locale = state.documentLanguage === 'pl' ? 'pl-PL' : 'en-GB';
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency: state.currency, minimumFractionDigits: 2 }); }
    catch { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }); }
  }

  function formatMoney(value) { return currencyFormatter().format(num(value)); }

  function formatDate(value) {
    if (!value) return '—';
    const locale = state.documentLanguage === 'pl' ? 'pl-PL' : 'en-GB';
    try { return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)); }
    catch { return value; }
  }

  function labels() {
    if (state.documentLanguage === 'bi') {
      const en = languageLabels.en; const pl = languageLabels.pl;
      return {
        document: Object.fromEntries(Object.keys(en.document).map((key) => [key, `${en.document[key]} / ${pl.document[key]}`])),
        number: Object.fromEntries(Object.keys(en.number).map((key) => [key, `${en.number[key]} / ${pl.number[key]}`])),
        issueDate: 'Issue date / Data wystawienia', dueDate: 'Due date / Termin płatności', serviceDate: 'Service date / Data wykonania', from: 'From / Wystawca', to: 'Bill to / Nabywca',
        description: 'Description / Opis', quantity: 'Qty / Ilość', unit: 'Unit / Jedn.', rate: 'Rate / Stawka', amount: 'Amount / Suma',
        subtotal: 'Subtotal / Suma netto', discount: 'Discount / Rabat', vat: 'VAT', deposit: 'Deposit paid / Zaliczka', amountDue: 'Amount due / Do zapłaty', total: 'Total / Razem', paidTotal: 'Paid total / Zapłacono', creditTotal: 'Credit total / Korekta', quoteTotal: 'Quote total / Wycena', depositTotal: 'Deposit due / Zaliczka', finalTotal: 'Final balance / Saldo końcowe',
        notes: '', terms: '', bank: 'Bank details / Dane bankowe', signature: 'Signature / Podpis'
      };
    }
    return languageLabels[state.documentLanguage] || languageLabels.en;
  }

  function activeDocumentProfile() {
    return documentProfiles[state.documentType] || documentProfiles.invoice;
  }

  function selectedDocumentTitle() {
    return documentTypes.find((type) => type.id === state.documentType)?.title || 'Invoice';
  }

  function selectedWorkModeTitle() {
    return workModes.find((mode) => mode.id === state.workMode)?.title || 'Services';
  }

  function documentSpecificSuggestions() {
    const suggestions = {
      quote: [
        { description: 'Optional project upgrade', quantity: 1, unit: 'service', rate: 175 },
        { description: 'Estimated third-party costs', quantity: 1, unit: 'expense', rate: 80 }
      ],
      proforma: [
        { description: 'Advance payment before supply', quantity: 1, unit: 'service', rate: 500 },
        { description: 'Pre-order goods reservation', quantity: 1, unit: 'item', rate: 250 }
      ],
      credit: [
        { description: 'Credit for returned goods', quantity: 1, unit: 'item', rate: 120 },
        { description: 'Price correction against original invoice', quantity: 1, unit: 'service', rate: 75 },
        { description: 'Refund of overcharged delivery', quantity: 1, unit: 'expense', rate: 25 }
      ],
      receipt: [
        { description: 'Payment received by bank transfer', quantity: 1, unit: 'service', rate: 500 },
        { description: 'Card payment received', quantity: 1, unit: 'service', rate: 150 },
        { description: 'Cash payment received', quantity: 1, unit: 'service', rate: 100 }
      ],
      deposit: [
        { description: 'Project booking deposit — 30%', quantity: 1, unit: 'project', rate: 720 },
        { description: 'Advance for materials', quantity: 1, unit: 'expense', rate: 350 },
        { description: 'Reservation deposit', quantity: 1, unit: 'service', rate: 250 }
      ],
      final: [
        { description: 'Final completion milestone', quantity: 1, unit: 'project', rate: 1200 },
        { description: 'Approved additional work', quantity: 1, unit: 'service', rate: 240 },
        { description: 'Handover and final documentation', quantity: 1, unit: 'service', rate: 150 }
      ],
      commercial: [
        { description: 'Machine components — HS 8483.90 — origin GB', quantity: 20, unit: 'item', rate: 12.5 },
        { description: 'International freight', quantity: 1, unit: 'service', rate: 65 },
        { description: 'Cargo insurance', quantity: 1, unit: 'service', rate: 28 }
      ],
      recurringInvoice: [
        { description: 'Current billing-cycle subscription', quantity: 1, unit: 'subscription', rate: 120 },
        { description: 'Monthly account management', quantity: 1, unit: 'month', rate: 450 }
      ],
      interim: [
        { description: 'Contract works completed to date — 40%', quantity: 1, unit: 'project', rate: 3200 },
        { description: 'Materials delivered to site', quantity: 1, unit: 'expense', rate: 850 },
        { description: 'Approved contract variation', quantity: 1, unit: 'service', rate: 420 }
      ],
      paymentRequest: [
        { description: 'Outstanding invoice balance', quantity: 1, unit: 'service', rate: 540 },
        { description: 'Agreed payment instalment', quantity: 1, unit: 'service', rate: 300 },
        { description: 'Contractual payment now due', quantity: 1, unit: 'service', rate: 750 }
      ]
    };
    return suggestions[state.documentType] || [];
  }

  function getItemSuggestions() {
    const combined = [...documentSpecificSuggestions(), ...(billingSuggestions[state.workMode] || billingSuggestions.service)];
    const seen = new Set();
    return combined.filter((item) => {
      const key = `${item.description}|${item.unit}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 7);
  }

  function renderSelectionSummary() {
    const container = $('#selectionSummary');
    if (!container) return;
    const profile = activeDocumentProfile();
    const billing = billingProfiles[state.workMode] || billingProfiles.service;
    container.innerHTML = `
      <span class="selection-summary-icon">${choiceIcon(documentTypes.find((type) => type.id === state.documentType)?.icon || 'invoice')}</span>
      <div>
        <small>Live example setup</small>
        <strong>${escapeHtml(selectedDocumentTitle())} · ${escapeHtml(selectedWorkModeTitle())}</strong>
        <p>${escapeHtml(profile.message)} ${escapeHtml(billing.tagline)}.</p>
      </div>`;
  }

  function renderItemSuggestions() {
    const select = $('#suggestedItemSelect');
    if (!select) return;
    const suggestions = getItemSuggestions();
    select.innerHTML = `<option value="">Choose a smart item for ${escapeHtml(selectedWorkModeTitle())}…</option>` +
      suggestions.map((item, index) => `<option value="${index}">${escapeHtml(item.description)} · ${escapeHtml(item.unit)} · ${formatMoney(item.rate)}</option>`).join('');
    const hint = $('#suggestedItemHint');
    if (hint) hint.textContent = `${selectedDocumentTitle()} + ${selectedWorkModeTitle()}: ${suggestions.length} relevant suggestions`;
  }

  function itemAmount(item) { return num(item.quantity) * num(item.rate); }

  function calculateTotals() {
    const subtotal = state.items.reduce((sum, item) => sum + itemAmount(item), 0);
    const discount = state.discountType === 'amount' ? Math.min(subtotal, num(state.discountValue)) : Math.min(subtotal, subtotal * num(state.discountValue) / 100);
    const net = Math.max(0, subtotal - discount);
    const vat = state.vatEnabled ? net * num(state.vatRate) / 100 : 0;
    const total = net + vat;
    const amountDue = state.documentType === 'receipt' ? 0 : Math.max(0, total - num(state.depositPaid));
    return { subtotal, discount, net, vat, total, amountDue, deposit: num(state.depositPaid) };
  }

  function docGrandLabel(l = labels()) {
    if (state.documentType === 'receipt') return l.paidTotal;
    if (state.documentType === 'credit') return l.creditTotal;
    if (state.documentType === 'quote' || state.documentType === 'proforma') return l.quoteTotal;
    if (state.documentType === 'deposit') return l.depositTotal;
    if (state.documentType === 'final') return l.finalTotal;
    return l.amountDue;
  }

  function initials(name) {
    return String(name || 'IS').split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  }

  function sellerLines() {
    return [state.sellerAddress, state.sellerEmail, state.sellerPhone, state.sellerCompanyNo ? `Company No: ${state.sellerCompanyNo}` : '', state.sellerVatNo ? `VAT: ${state.sellerVatNo}` : ''].filter(Boolean);
  }

  function clientLines() {
    return [state.clientAddress, state.clientEmail, state.clientPhone, state.clientVatNo ? `VAT: ${state.clientVatNo}` : '', state.purchaseOrder ? `PO / Job: ${state.purchaseOrder}` : ''].filter(Boolean);
  }


  function choiceIcon(name) {
    const paths = {
      invoice: '<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
      vat: '<circle cx="12" cy="12" r="9"/><path d="m8.5 16 7-8M9 8.5h.01M15 15.5h.01"/>',
      quote: '<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5M8 16h7"/>',
      proforma: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><circle cx="11" cy="13" r="3"/><path d="M11 11.5V13l1 1"/>',
      credit: '<path d="M8 7H4v-4"/><path d="M4.5 7.5A8 8 0 1 1 6 17.5"/><path d="M9 12h6M12 9v6"/>',
      receipt: '<path d="M7 3h10v18l-2-1.4L13 21l-2-1.4L9 21l-2-1.4z"/><path d="m9.5 11 1.7 1.7L15 9"/>',
      deposit: '<ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7"/><circle cx="16.5" cy="15.5" r="4.5"/><path d="M16.5 13v5M14 15.5h5"/>',
      final: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m9.5 12 1.7 1.7 3.5-4"/>',
      commercial: '<circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3c2 2.1 3 4.4 3 7s-1 4.9-3 7c-2-2.1-3-4.4-3-7s1-4.9 3-7"/><path d="M15 14h6v7h-6zM18 14v-2"/>',
      recurringInvoice: '<path d="M5 5h14v14H5z"/><path d="M8 3v4M16 3v4M5 9h14"/><path d="M9 14a3 3 0 0 1 5-2M15 12v3h-3"/>',
      interim: '<path d="M4 7h12v12H4z"/><path d="M8 3h12v12"/><path d="M7 11h6M7 15h4"/>',
      paymentRequest: '<path d="M3 12h5l2 3h5l2-2h4"/><path d="M5 12V7h14v6"/><circle cx="12" cy="8.5" r="2"/><path d="M8 20h8"/>',
      service: '<path d="m14.5 6.5 3-3 3 3-3 3"/><path d="m13 8-8.5 8.5a2.1 2.1 0 0 0 3 3L16 11"/><path d="M12 5a5 5 0 0 0 7 7"/>',
      hours: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      products: '<path d="m12 3 8 4-8 4-8-4z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/>',
      transport: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
      project: '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2"/>',
      expenses: '<path d="M7 3h10v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
      recurring: '<path d="M20 7h-5V2"/><path d="M20 7a8 8 0 1 0 1 8"/><path d="M4 17h5v5"/>',
      blank: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M12 11v6M9 14h6"/>',
      trades: '<path d="M4 19h16"/><path d="M6 19v-5a6 6 0 0 1 12 0v5"/><path d="M9 8V5h6v3M12 5V3"/>',
      creative: '<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10z"/><circle cx="7.5" cy="10" r=".7"/><circle cx="9" cy="6.5" r=".7"/><circle cx="13" cy="6" r=".7"/>',
      rental: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M17 12v3M20 12v2"/>',
      appointments: '<path d="M5 4h14v16H5z"/><path d="M8 2v4M16 2v4M5 9h14"/><path d="m9 14 2 2 4-4"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.invoice}</svg>`;
  }

  function renderChoiceGrids() {
    $('#documentTypeGrid').innerHTML = documentTypes.map((type) => `
      <button type="button" class="choice-card ${state.documentType === type.id ? 'selected' : ''}" data-document-type="${type.id}">
        <span class="choice-icon">${choiceIcon(type.icon)}</span><span><strong>${type.title}</strong><small>${type.subtitle}</small></span><span class="choice-check">✓</span>
      </button>`).join('');
    $('#workModeGrid').innerHTML = workModes.map((mode) => `
      <button type="button" class="choice-card ${state.workMode === mode.id ? 'selected' : ''}" data-work-mode="${mode.id}">
        <span class="choice-icon">${choiceIcon(mode.icon)}</span><span><strong>${mode.title}</strong><small>${mode.subtitle}</small></span><span class="choice-check">✓</span>
      </button>`).join('');
  }

  function renderTemplates() {
    const templateAccents = ['#4f46e5','#596579','#176b87','#516177','#7a3e56','#2459a6','#b4234d','#a35c21','#222a3a','#6d43ad','#8a5a35','#0f766e'];
    $('#templateGrid').innerHTML = templates.map((template, index) => `
      <button type="button" class="template-card ${state.template === template.id ? 'selected' : ''}" data-template="${template.id}" aria-pressed="${state.template === template.id}" style="--template-accent:${templateAccents[index]};--thumb-color:${state.accent}">
        <span class="template-thumb ${template.thumb}" style="--thumb-color:${state.accent}"></span>
        <span class="template-meta">
          <span class="template-check" aria-hidden="true">✓</span>
          <span class="template-copy"><strong>${template.title}</strong><small>${template.subtitle}</small></span>
        </span>
      </button>`).join('');
    $('#accentChoices').innerHTML = accents.map((accent) => `<button type="button" aria-label="Choose colour ${accent}" class="accent-choice ${state.accent.toLowerCase() === accent.toLowerCase() ? 'selected' : ''}" data-accent="${accent}" style="background:${accent}"></button>`).join('');
    syncCustomColourControls();
  }

  function syncCustomColourControls() {
    const colour = normalizeHexColour(state.accent) || '#4f46e5';
    const picker = $('#customAccentPicker');
    const hexInput = $('#customAccentHex');
    const swatch = $('#customColourSwatch');
    const panel = $('#customColourPanel');
    if (picker) picker.value = colour;
    if (hexInput) {
      hexInput.value = colour.toUpperCase();
      hexInput.setAttribute('aria-invalid', 'false');
    }
    if (swatch) swatch.style.background = colour;
    if (panel) panel.classList.toggle('selected', !accents.some((accent) => accent.toLowerCase() === colour));
  }

  function applyCustomColour(value, announce = false) {
    const colour = normalizeHexColour(value);
    const input = $('#customAccentHex');
    if (!colour) {
      input?.setAttribute('aria-invalid', 'true');
      if (announce) toast('Check the colour code', 'Use a HEX value such as #4F46E5.', 'error');
      return false;
    }
    state.accent = colour;
    renderTemplates();
    updatePreview();
    saveState();
    if (announce) toast('Custom colour applied', `${colour.toUpperCase()} is now used throughout the document.`);
    return true;
  }

  function unitsOptions(selected = '') {
    const values = ['service', 'job', 'hour', 'day', 'week', 'month', 'item', 'expense', 'mile', 'km', 'night', 'project', 'subscription', 'session', 'visit', 'rental', 'licence'];
    return values.map((value) => `<option value="${value}" ${selected === value ? 'selected' : ''}>${value}</option>`).join('');
  }

  function renderQuickAdd() {
    const container = $('#quickAddForm');
    const configs = {
      service: {
        title: 'Add a service', subtitle: 'Description, quantity and agreed rate.', html: `
          <label class="wide"><span>Service description</span><input id="qaDescription" placeholder="e.g. Website design" /></label>
          <label class="narrow"><span>Quantity</span><input id="qaQuantity" type="number" min="0" step="0.01" value="1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit">${unitsOptions('service')}</select></label>
          <label class="narrow"><span>Rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add item</button>`
      },
      hours: {
        title: 'Add working time', subtitle: 'Paid hours and value are calculated automatically.', html: `
          <label class="wide"><span>Description</span><input id="qaDescription" placeholder="e.g. Driving services" /></label>
          <label class="narrow"><span>Date</span><input id="qaDate" type="date" value="${state.serviceDate}" /></label>
          <label class="narrow"><span>Start</span><input id="qaStart" type="time" value="08:00" /></label>
          <label class="narrow"><span>End</span><input id="qaEnd" type="time" value="17:00" /></label>
          <label class="narrow"><span>Break (min)</span><input id="qaBreak" type="number" min="0" step="5" value="45" /></label>
          <label class="narrow"><span>Hourly rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Calculate & add</button>`
      },
      products: {
        title: 'Add a product', subtitle: 'Quantity multiplied by the unit price.', html: `
          <label class="wide"><span>Product name</span><input id="qaDescription" placeholder="e.g. Printed T-shirts" /></label>
          <label class="narrow"><span>Quantity</span><input id="qaQuantity" type="number" min="0" step="1" value="1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit">${unitsOptions('item')}</select></label>
          <label class="narrow"><span>Unit price</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add item</button>`
      },
      transport: {
        title: 'Add transport or mileage', subtitle: 'Route, distance and additional travel costs.', html: `
          <label class="wide"><span>Route / description</span><input id="qaDescription" placeholder="e.g. Manchester → Birmingham delivery" /></label>
          <label class="narrow"><span>Distance</span><input id="qaQuantity" type="number" min="0" step="0.1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit"><option value="mile">mile</option><option value="km">km</option><option value="job">job</option></select></label>
          <label class="narrow"><span>Rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <label class="narrow"><span>Extra costs</span><input id="qaExtra" type="number" min="0" step="0.01" value="0" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add item</button>`
      },
      project: {
        title: 'Add a project stage', subtitle: 'A fixed fee or the next contract milestone.', html: `
          <label class="wide"><span>Project / milestone</span><input id="qaDescription" placeholder="e.g. Website design — final stage" /></label>
          <label class="narrow"><span>Quantity</span><input id="qaQuantity" type="number" min="0" step="0.01" value="1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit">${unitsOptions('project')}</select></label>
          <label class="narrow"><span>Amount</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add item</button>`
      },
      expenses: {
        title: 'Add an expense or reimbursement', subtitle: 'Record a cost paid on behalf of the client.', html: `
          <label class="wide"><span>Expense description</span><input id="qaDescription" placeholder="e.g. Hotel accommodation" /></label>
          <label class="narrow"><span>Quantity</span><input id="qaQuantity" type="number" min="0" step="0.01" value="1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit">${unitsOptions('expense')}</select></label>
          <label class="narrow"><span>Cost</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add expense</button>`
      },
      recurring: {
        title: 'Add recurring work', subtitle: 'Monthly retainers, subscriptions or ongoing support.', html: `
          <label class="wide"><span>Recurring service</span><input id="qaDescription" placeholder="e.g. Monthly website support" /></label>
          <label class="narrow"><span>Periods</span><input id="qaQuantity" type="number" min="0" step="1" value="1" /></label>
          <label class="narrow"><span>Billing unit</span><select id="qaUnit"><option value="month">month</option><option value="week">week</option><option value="subscription">subscription</option></select></label>
          <label class="narrow"><span>Rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add recurring item</button>`
      },
      trades: {
        title: 'Add construction or trade work', subtitle: 'Labour, call-out charges and materials in one quick entry.', html: `
          <label class="wide"><span>Job description</span><input id="qaDescription" placeholder="e.g. Bathroom repair and pipe replacement" /></label>
          <label class="narrow"><span>Labour hours</span><input id="qaQuantity" type="number" min="0" step="0.25" value="1" /></label>
          <label class="narrow"><span>Hourly rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <label class="narrow"><span>Materials / call-out</span><input id="qaExtra" type="number" min="0" step="0.01" value="0" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add trade work</button>`
      },
      creative: {
        title: 'Add creative or digital work', subtitle: 'Projects, deliverables, production and usage fees.', html: `
          <label class="wide"><span>Deliverable</span><input id="qaDescription" placeholder="e.g. Brand photography and image editing" /></label>
          <label class="narrow"><span>Quantity</span><input id="qaQuantity" type="number" min="0" step="0.5" value="1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit"><option value="project">project</option><option value="day">day</option><option value="hour">hour</option><option value="item">deliverable</option></select></label>
          <label class="narrow"><span>Rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <label class="narrow"><span>Licence / usage fee</span><input id="qaExtra" type="number" min="0" step="0.01" value="0" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add creative work</button>`
      },
      rental: {
        title: 'Add rental or hire', subtitle: 'Hire period, rate and optional delivery or collection fee.', html: `
          <label class="wide"><span>Item being hired</span><input id="qaDescription" placeholder="e.g. Mini excavator hire" /></label>
          <label class="narrow"><span>Duration</span><input id="qaQuantity" type="number" min="0" step="1" value="1" /></label>
          <label class="narrow"><span>Period</span><select id="qaUnit"><option value="day">day</option><option value="week">week</option><option value="month">month</option><option value="rental">rental</option></select></label>
          <label class="narrow"><span>Rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <label class="narrow"><span>Delivery / collection</span><input id="qaExtra" type="number" min="0" step="0.01" value="0" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add hire item</button>`
      },
      appointments: {
        title: 'Add lessons or appointments', subtitle: 'Sessions, consultations, coaching or tuition.', html: `
          <label class="wide"><span>Session description</span><input id="qaDescription" placeholder="e.g. One-to-one English tuition" /></label>
          <label class="narrow"><span>Sessions</span><input id="qaQuantity" type="number" min="0" step="1" value="1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit"><option value="session">session</option><option value="visit">visit</option><option value="hour">hour</option></select></label>
          <label class="narrow"><span>Rate per session</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add session</button>`
      },
      blank: {
        title: 'Add a custom item', subtitle: 'Full control over the description and values.', html: `
          <label class="wide"><span>Description</span><input id="qaDescription" placeholder="Your own line-item description" /></label>
          <label class="narrow"><span>Quantity</span><input id="qaQuantity" type="number" min="0" step="0.01" value="1" /></label>
          <label class="narrow"><span>Unit</span><select id="qaUnit">${unitsOptions('item')}</select></label>
          <label class="narrow"><span>Rate</span><input id="qaRate" type="number" min="0" step="0.01" /></label>
          <button type="button" class="btn btn-primary quick-add-button" data-action="quick-add-item">Add item</button>`
      }
    };
    const config = configs[state.workMode] || configs.service;
    $('#quickAddTitle').textContent = config.title;
    $('#quickAddSubtitle').textContent = config.subtitle;
    container.innerHTML = config.html;
  }

  function renderItems() {
    const body = $('#itemsEditorBody');
    if (!state.items.length) {
      body.innerHTML = `<tr><td class="empty-items" colspan="6">No items yet. Use Smart Draft or add your first item above.</td></tr>`;
      return;
    }
    body.innerHTML = state.items.map((item, index) => `
      <tr data-item-index="${index}">
        <td><input data-item-field="description" value="${escapeHtml(item.description)}" aria-label="Item ${index + 1} description" /></td>
        <td><input data-item-field="quantity" type="number" min="0" step="0.01" value="${num(item.quantity)}" aria-label="Item ${index + 1} quantity" /></td>
        <td><select data-item-field="unit" aria-label="Item ${index + 1} unit">${unitsOptions(item.unit)}</select></td>
        <td><input data-item-field="rate" type="number" min="0" step="0.01" value="${num(item.rate)}" aria-label="Item ${index + 1} rate" /></td>
        <td class="row-total">${formatMoney(itemAmount(item))}</td>
        <td><button type="button" class="remove-item" data-remove-item="${index}" aria-label="Remove item ${index + 1}">×</button></td>
      </tr>`).join('');
  }

  function previewHtml() {
    const l = labels();
    const totals = calculateTotals();
    const title = l.document[state.documentType];
    const logo = state.logoData && /^data:image\//.test(state.logoData) ? `<img src="${state.logoData}" alt="Logo" />` : escapeHtml(initials(state.sellerName));
    const items = state.items.length ? state.items.map((item) => `
      <tr><td class="item-desc"><strong>${escapeHtml(item.description || '—')}</strong></td><td>${escapeHtml(String(num(item.quantity)))}</td><td>${escapeHtml(item.unit || '')}</td><td>${formatMoney(item.rate)}</td><td><strong>${formatMoney(itemAmount(item))}</strong></td></tr>`).join('') : `<tr class="doc-empty-row"><td colspan="5">No items yet</td></tr>`;
    const discountRow = totals.discount > 0 ? `<div class="doc-total-row"><span>${escapeHtml(l.discount)}</span><strong>−${formatMoney(totals.discount)}</strong></div>` : '';
    const vatRow = state.vatEnabled ? `<div class="doc-total-row"><span>${escapeHtml(l.vat)} ${num(state.vatRate)}%</span><strong>${formatMoney(totals.vat)}</strong></div>` : '';
    const depositRow = totals.deposit > 0 ? `<div class="doc-total-row"><span>${escapeHtml(l.deposit)}</span><strong>−${formatMoney(totals.deposit)}</strong></div>` : '';
    const grandValue = state.documentType === 'receipt' ? totals.total : ['quote','proforma','credit'].includes(state.documentType) ? totals.total : totals.amountDue;
    const bankText = [state.bankName, state.bankCode ? `Sort / BIC: ${state.bankCode}` : '', state.bankAccount ? `Account / IBAN: ${state.bankAccount}` : ''].filter(Boolean).join('\n');
    const dueMeta = state.dueDateEnabled ? `<div><span>${escapeHtml(l.dueDate)}</span><strong>${formatDate(state.dueDate)}</strong></div>` : '';
    return `<div class="doc-page">
      <div class="doc-header">
        <div class="doc-brand"><div class="doc-logo">${logo}</div><div><h2>${escapeHtml(state.sellerName || 'Your business')}</h2>${sellerLines().slice(0,3).map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div></div>
        <div class="doc-title"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(l.number[state.documentType])}: <strong>${escapeHtml(state.invoiceNumber || '—')}</strong></p><div class="doc-meta"><div><span>${escapeHtml(l.issueDate)}</span><strong>${formatDate(state.issueDate)}</strong></div>${dueMeta}<div><span>${escapeHtml(l.serviceDate)}</span><strong>${formatDate(state.serviceDate)}</strong></div>${state.purchaseOrder ? `<div><span>PO / Job</span><strong>${escapeHtml(state.purchaseOrder)}</strong></div>` : ''}</div></div>
      </div>
      <div class="doc-parties">
        <div class="doc-party"><span>${escapeHtml(l.from)}</span><h3>${escapeHtml(state.sellerName || '—')}</h3>${sellerLines().map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>
        <div class="doc-party"><span>${escapeHtml(l.to)}</span><h3>${escapeHtml(state.clientName || '—')}</h3>${clientLines().map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>
      </div>
      <table class="doc-items"><thead><tr><th>${escapeHtml(l.description)}</th><th>${escapeHtml(l.quantity)}</th><th>${escapeHtml(l.unit)}</th><th>${escapeHtml(l.rate)}</th><th>${escapeHtml(l.amount)}</th></tr></thead><tbody>${items}</tbody></table>
      <div class="doc-lower">
        <div class="doc-extras">
          ${state.showNotes && state.notes ? `<div class="doc-block"><span>${escapeHtml(l.notes)}</span><p>${escapeHtml(state.notes)}</p></div>` : ''}
          ${state.showTerms && state.terms ? `<div class="doc-block"><span>${escapeHtml(l.terms)}</span><p>${escapeHtml(state.terms)}</p></div>` : ''}
          ${state.showBank && bankText ? `<div class="doc-block"><span>${escapeHtml(l.bank)}</span><p>${escapeHtml(bankText)}</p></div>` : ''}
          ${state.showSignature ? `<div class="doc-signature">${escapeHtml(l.signature)}</div>` : ''}
        </div>
        <div class="doc-totals">
          <div class="doc-total-row"><span>${escapeHtml(l.subtotal)}</span><strong>${formatMoney(totals.subtotal)}</strong></div>
          ${discountRow}${vatRow}${depositRow}
          <div class="doc-total-row grand"><span>${escapeHtml(docGrandLabel(l))}</span><strong>${formatMoney(grandValue)}</strong></div>
        </div>
      </div>
      <div class="doc-footer"><span>Invoice Studio</span><span>${escapeHtml(state.invoiceNumber || '')}</span></div>
    </div>`;
  }

  function applyPreviewFit(baseHeight = 1018) {
    const preview = $('#invoicePreview');
    const stage = $('.preview-stage');
    if (!preview || !stage) return;

    const stageStyles = getComputedStyle(stage);
    const availableWidth = Math.max(280, stage.clientWidth - parseFloat(stageStyles.paddingLeft) - parseFloat(stageStyles.paddingRight));
    const availableHeight = Math.max(360, stage.clientHeight - parseFloat(stageStyles.paddingTop) - parseFloat(stageStyles.paddingBottom));
    const fitZoom = Math.min(availableWidth / 720, availableHeight / baseHeight, 1.05);

    let effectiveZoom = state.previewZoom;
    if (!state.previewZoomManual) {
      effectiveZoom = fitZoom;
    }

    // A zoom saved on a large screen must never open as an unusably cropped mobile preview.
    if (window.matchMedia('(max-width: 1020px)').matches && state.previewZoomManual) {
      effectiveZoom = Math.min(effectiveZoom, Math.max(fitZoom, Math.min(0.68, availableWidth / 720)));
    }

    effectiveZoom = Math.max(.35, Math.min(1.25, effectiveZoom));
    preview.dataset.effectiveZoom = String(effectiveZoom);
    document.documentElement.style.setProperty('--preview-scale', String(effectiveZoom));
    preview.style.marginBottom = `${(1 - effectiveZoom) * -baseHeight}px`;
    stage.classList.toggle('zoom-overflow-x', 720 * effectiveZoom > availableWidth + 1);
    stage.classList.toggle('zoom-overflow-y', baseHeight * effectiveZoom > availableHeight + 1);
    $('#zoomValue').textContent = `${Math.round(effectiveZoom * 100)}%`;
  }

  function updatePreview() {
    const preview = $('#invoicePreview');
    const token = ++previewRenderToken;
    preview.className = `invoice-preview template-${state.template} canvas-preview${logoMoveMode && state.logoData ? ' logo-move-active' : ''}`;
    preview.style.setProperty('--doc-accent', state.accent);
    preview.innerHTML = '<canvas class="invoice-render-canvas" aria-label="Live document preview"></canvas><span class="sr-only">The downloaded PDF, Word and Excel preview use this exact rendered document.</span>';
    const canvas = $('.invoice-render-canvas', preview);
    const model = exportModel();
    Promise.resolve(window.InvoiceRenderer.render(canvas, model)).then(() => {
      if (token !== previewRenderToken) return;
      const baseHeight = Number(canvas.dataset.baseHeight || 1018);
      preview.style.height = `${baseHeight}px`;
      preview.style.minHeight = `${baseHeight}px`;
      preview.dataset.baseHeight = String(baseHeight);
      requestAnimationFrame(() => applyPreviewFit(baseHeight));
    }).catch((error) => console.error('Preview render failed', error));
    updateReview();
  }

  function reviewChecks() {
    return [
      { ok: Boolean(state.sellerName.trim()), title: 'Seller details', good: 'Seller name is complete.', bad: 'Add your business name or full name.', step: 3, severity: 'error' },
      { ok: Boolean(state.clientName.trim()), title: 'Client details', good: 'A client has been selected.', bad: 'Add the document recipient.', step: 3, severity: 'error' },
      { ok: Boolean(state.invoiceNumber.trim()), title: 'Document number', good: 'The document has its own number.', bad: 'Add a unique document number.', step: 3, severity: 'error' },
      { ok: state.items.length > 0, title: 'Line items', good: `${state.items.length} ${state.items.length === 1 ? 'item' : 'items'} in the document.`, bad: 'Add at least one line item.', step: 4, severity: 'error' },
      { ok: !state.vatEnabled || Boolean(state.sellerVatNo.trim()), title: 'VAT number', good: state.vatEnabled ? 'VAT number is present.' : 'VAT is not applied.', bad: 'VAT is enabled, but the seller VAT number is missing.', step: 3, severity: 'warn' },
      { ok: !state.dueDateEnabled || Boolean(state.dueDate), title: 'Due date', good: state.dueDateEnabled ? 'A due date has been set.' : 'Due date intentionally hidden.', bad: 'Set a due date or choose No due date.', step: 3, severity: 'warn' }
    ];
  }

  function updateReview() {
    const checks = reviewChecks();
    const score = Math.round(checks.reduce((sum, check) => sum + (check.ok ? 1 : 0), 0) / checks.length * 100);
    const scoreEl = $('.readiness-score');
    if (scoreEl) scoreEl.style.setProperty('--score', score);
    if ($('#readinessPercent')) $('#readinessPercent').textContent = `${score}%`;
    if ($('#readinessTitle')) $('#readinessTitle').textContent = score === 100 ? 'Everything looks good' : score >= 70 ? 'Almost ready' : 'Complete the essentials';
    if ($('#readinessText')) $('#readinessText').textContent = score === 100 ? 'Your document is ready to download.' : 'Select a warning to fix it quickly.';
    if ($('#checksList')) $('#checksList').innerHTML = checks.map((check) => `
      <button type="button" class="check-item ${check.ok ? 'ok' : check.severity}" data-jump-step="${check.step}"><span>${check.ok ? '✓' : '!'}</span><div><strong>${check.title}</strong><small>${check.ok ? check.good : check.bad}</small></div></button>`).join('');
  }

  function syncStaticInputs() {
    const ids = ['country','currency','documentLanguage','sellerName','sellerEmail','sellerPhone','sellerAddress','sellerCompanyNo','sellerVatNo','bankName','bankCode','bankAccount','clientName','clientEmail','clientPhone','clientAddress','clientVatNo','purchaseOrder','invoiceNumber','issueDate','dueDate','serviceDate','vatEnabled','vatRate','discountType','discountValue','depositPaid','notes','terms','logoX','logoY','logoWidth'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === 'vatEnabled') el.value = String(Boolean(state.vatEnabled));
      else el.value = state[id] ?? '';
    });
    ['showBank','showNotes','showTerms','showSignature'].forEach((id) => { const el = document.getElementById(id); if (el) el.checked = Boolean(state[id]); });
    const dueInput = $('#dueDate');
    if (dueInput) { dueInput.disabled = !state.dueDateEnabled; dueInput.closest('.field')?.classList.toggle('field-disabled', !state.dueDateEnabled); }
    $$('.quick-due-row button').forEach((button) => {
      if (button.dataset.dueDays === 'none') button.classList.toggle('active', !state.dueDateEnabled);
      else if (!state.dueDateEnabled) button.classList.remove('active');
    });
    const fileButton = $('.file-drop button');
    if (fileButton) fileButton.hidden = !state.logoData;
    const controls = $('#logoControls');
    if (controls) controls.hidden = !state.logoData;
    if ($('#logoXValue')) $('#logoXValue').textContent = `${Math.round(num(state.logoX))}%`;
    if ($('#logoYValue')) $('#logoYValue').textContent = `${Math.round(num(state.logoY))}%`;
    if ($('#logoWidthValue')) $('#logoWidthValue').textContent = `${Math.round(num(state.logoWidth))} px`;
    const moveButton = $('#logoMoveButton');
    if (moveButton) {
      moveButton.classList.toggle('active', logoMoveMode && Boolean(state.logoData));
      moveButton.setAttribute('aria-pressed', String(logoMoveMode && Boolean(state.logoData)));
      moveButton.innerHTML = logoMoveMode && state.logoData
        ? '<span aria-hidden="true">✓</span> Finish moving'
        : '<span aria-hidden="true">✥</span> Move on preview';
    }
    updateNumberFieldLabel();
  }

  function updateNumberFieldLabel() {
    const map = { invoice: 'Invoice number', vat: 'VAT invoice number', quote: 'Quote number', proforma: 'Pro forma number', credit: 'Credit note number', receipt: 'Receipt number', deposit: 'Deposit invoice number', final: 'Final invoice number', commercial: 'Commercial invoice number', recurringInvoice: 'Recurring invoice number', interim: 'Interim invoice number', paymentRequest: 'Payment request number' };
    $('#numberFieldLabel').textContent = map[state.documentType] || 'Document number';
    const profile = activeDocumentProfile();
    if ($('#issueDateFieldLabel')) $('#issueDateFieldLabel').textContent = profile.issueLabel || 'Issue date';
    if ($('#dueDateFieldLabel')) $('#dueDateFieldLabel').textContent = profile.dueLabel || 'Due date';
    if ($('#serviceDateFieldLabel')) $('#serviceDateFieldLabel').textContent = profile.serviceLabel || 'Service date';
  }

  function updateStepper(scrollToTop = false) {
    $$('.step-tab').forEach((tab) => {
      const step = Number(tab.dataset.step);
      tab.classList.toggle('active', step === state.currentStep);
      tab.classList.toggle('complete', step < state.currentStep);
    });
    $$('.step-line').forEach((line, index) => line.classList.toggle('complete', index + 1 < state.currentStep));
    $$('.step-panel').forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.panel) === state.currentStep));
    $('#prevStep').disabled = state.currentStep === 1;
    $('#prevStep').style.visibility = state.currentStep === 1 ? 'hidden' : 'visible';
    $('#nextStep').innerHTML = state.currentStep === 5 ? 'Download PDF <span aria-hidden="true">↓</span>' : 'Next <span aria-hidden="true">→</span>';
    const labelsByStep = ['Choose a document type and billing mode', 'Choose a template and visible elements', 'Complete the core details', 'Add items and review the values', 'Review your document and download it'];
    $('#stepActionLabel').textContent = labelsByStep[state.currentStep - 1];
    if (scrollToTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAll() {
    renderChoiceGrids();
    renderSelectionSummary();
    renderTemplates();
    renderQuickAdd();
    renderItems();
    renderItemSuggestions();
    syncStaticInputs();
    updateNumberFieldLabel();
    updateStepper();
    updatePreview();
    renderToolbox();
  }

  function addItem(item) {
    state.items.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, description: item.description || 'Item', quantity: num(item.quantity) || 1, unit: item.unit || 'item', rate: num(item.rate) });
    renderItems();
    updatePreview();
    saveState();
  }

  function addSelectedSuggestion() {
    const selectedValue = $('#suggestedItemSelect')?.value;
    const selectedIndex = selectedValue === '' || selectedValue == null ? -1 : Number(selectedValue);
    const suggestion = getItemSuggestions()[selectedIndex];
    if (!suggestion) {
      toast('Choose a suggestion', 'Select a relevant item from the list first.', 'error');
      return;
    }
    addItem({ ...suggestion });
    renderItemSuggestions();
    toast('Suggested item added', 'You can edit its description, quantity and rate.');
  }

  function quickAddItem() {
    const description = $('#qaDescription')?.value.trim() || '';
    const rate = num($('#qaRate')?.value);
    if (!description) { toast('Add a description', 'A short service or product name is enough.', 'error'); $('#qaDescription')?.focus(); return; }
    if (state.workMode === 'hours') {
      const start = $('#qaStart')?.value; const end = $('#qaEnd')?.value;
      if (!start || !end || rate <= 0) { toast('Check the time and rate', 'Enter a start time, end time and hourly rate.', 'error'); return; }
      const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number);
      let minutes = (eh * 60 + em) - (sh * 60 + sm); if (minutes <= 0) minutes += 1440;
      minutes = Math.max(0, minutes - num($('#qaBreak')?.value));
      const hours = Math.round((minutes / 60) * 100) / 100;
      const date = $('#qaDate')?.value;
      addItem({ description: `${description}${date ? ` — ${formatDate(date)}` : ''} (${start}–${end})`, quantity: hours, unit: 'hour', rate });
    } else if (state.workMode === 'transport') {
      const quantity = num($('#qaQuantity')?.value) || 1; const unit = $('#qaUnit')?.value || 'mile'; const extra = num($('#qaExtra')?.value);
      addItem({ description, quantity, unit, rate });
      if (extra > 0) addItem({ description: `${description} — additional travel costs`, quantity: 1, unit: 'expense', rate: extra });
    } else if (state.workMode === 'trades') {
      const quantity = num($('#qaQuantity')?.value) || 1; const extra = num($('#qaExtra')?.value);
      addItem({ description: `${description} — labour`, quantity, unit: 'hour', rate });
      if (extra > 0) addItem({ description: `${description} — materials / call-out`, quantity: 1, unit: 'expense', rate: extra });
    } else if (state.workMode === 'creative') {
      const quantity = num($('#qaQuantity')?.value) || 1; const unit = $('#qaUnit')?.value || 'project'; const extra = num($('#qaExtra')?.value);
      addItem({ description, quantity, unit, rate });
      if (extra > 0) addItem({ description: `${description} — licence / usage fee`, quantity: 1, unit: 'licence', rate: extra });
    } else if (state.workMode === 'rental') {
      const quantity = num($('#qaQuantity')?.value) || 1; const unit = $('#qaUnit')?.value || 'day'; const extra = num($('#qaExtra')?.value);
      addItem({ description, quantity, unit, rate });
      if (extra > 0) addItem({ description: `${description} — delivery / collection`, quantity: 1, unit: 'service', rate: extra });
    } else {
      addItem({ description, quantity: num($('#qaQuantity')?.value) || 1, unit: $('#qaUnit')?.value || 'item', rate });
    }
    renderQuickAdd();
    toast('Item added', 'The preview and totals have been updated.');
  }

  function parseUnit(text) {
    const t = text.toLowerCase();
    if (/hours?|hrs?|godz/.test(t)) return 'hour';
    if (/days?|dni|dzień/.test(t)) return 'day';
    if (/weeks?|tygod/.test(t)) return 'week';
    if (/months?|monthly|miesiąc/.test(t)) return 'month';
    if (/miles?/.test(t)) return 'mile';
    if (/\bkm\b|kilometr/.test(t)) return 'km';
    if (/night|nocleg/.test(t)) return 'night';
    if (/sessions?|lessons?|appointments?|tuition|coaching/.test(t)) return 'session';
    if (/rental|hire|hired/.test(t)) return 'rental';
    if (/licen[cs]e|usage fee|royalt/.test(t)) return 'licence';
    if (/subscription|retainer|recurring/.test(t)) return 'subscription';
    if (/expense|reimburse|hotel|parking|fuel|train|meal/.test(t)) return 'expense';
    if (/project|projekt/.test(t)) return 'project';
    if (/service|usług/.test(t)) return 'service';
    return 'item';
  }

  function cleanDescription(text, fallback = 'Item') {
    const cleaned = String(text || '')
      .replace(/\b(vat|tax|due|deposit|discount|paid|termin|zaliczka|rabat)\b.*$/i, '')
      .replace(/\b(days?|hours?|hrs?|weeks?|months?|items?|pcs?|miles?|km|night\s*outs?|services?|expenses?|subscriptions?)\b/i, '')
      .replace(/\s+/g, ' ').replace(/^[\s:–—-]+|[\s:–—-]+$/g, '');
    if (!cleaned) return fallback;
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  function smartParse() {
    const input = $('#smartPrompt').value.trim();
    if (!input) { toast('Describe the document', 'Write one plain sentence and we will create a draft.', 'error'); return; }
    const lower = input.toLowerCase();
    const detected = [];

    if (/commercial invoice|customs invoice|export invoice/.test(lower)) { state.documentType = 'commercial'; detected.push('commercial invoice'); }
    else if (/recurring invoice|subscription invoice/.test(lower)) { state.documentType = 'recurringInvoice'; detected.push('recurring invoice'); }
    else if (/interim invoice|progress invoice|stage invoice/.test(lower)) { state.documentType = 'interim'; detected.push('interim invoice'); }
    else if (/payment request|request for payment/.test(lower)) { state.documentType = 'paymentRequest'; detected.push('payment request'); }
    else if (/deposit invoice|invoice for (?:a )?deposit|zaliczkow/.test(lower)) { state.documentType = 'deposit'; detected.push('deposit invoice'); }
    else if (/final invoice|invoice końcow/.test(lower)) { state.documentType = 'final'; detected.push('final invoice'); }
    else if (/pro\s*forma/.test(lower)) { state.documentType = 'proforma'; detected.push('pro forma'); }
    else if (/quote|estimate|wycena/.test(lower)) { state.documentType = 'quote'; detected.push('quote'); }
    else if (/credit note|korekt/.test(lower)) { state.documentType = 'credit'; detected.push('credit note'); }
    else if (/receipt|rachunek/.test(lower)) { state.documentType = 'receipt'; state.dueDateEnabled = false; detected.push('receipt'); }

    if (input.includes('€')) { state.currency = 'EUR'; detected.push('EUR'); }
    else if (/zł|\bpln\b/i.test(input)) { state.currency = 'PLN'; detected.push('PLN'); }
    else if (input.includes('$')) { state.currency = 'USD'; detected.push('USD'); }
    else if (input.includes('£')) { state.currency = 'GBP'; detected.push('GBP'); }

    const vatMatch = lower.match(/(?:vat|tax)\s*(\d+(?:[.,]\d+)?)\s*%/i);
    if (vatMatch) { state.vatEnabled = true; state.vatRate = num(vatMatch[1]); if (state.documentType === 'invoice') state.documentType = 'vat'; detected.push(`VAT ${state.vatRate}%`); }
    if (/no due date|without due date/.test(lower)) { state.dueDateEnabled = false; detected.push('no due date'); }
    const dueMatch = lower.match(/(?:due(?:\s+in)?|payment\s+in|termin)\s*(\d+)\s*(?:days?|dni)/i);
    if (dueMatch) { state.dueDateEnabled = true; state.dueDate = addDays(state.issueDate, Number(dueMatch[1])); detected.push(`due in ${dueMatch[1]} days`); }
    const depositMatch = lower.match(/(?:deposit|zaliczka)(?:\s+[^£€$\d]{0,24})?\s*(?:£|€|\$|zł)?\s*(\d+(?:[.,]\d+)?)/i);
    if (depositMatch && !/%\s*(?:of|z)\s*[£€$\d]/i.test(lower)) { state.depositPaid = num(depositMatch[1]); detected.push(`deposit ${formatMoney(state.depositPaid)}`); }
    const discountMatch = lower.match(/(?:discount|rabat)\s*(\d+(?:[.,]\d+)?)\s*(%|£|€|\$|zł)?/i);
    if (discountMatch) { state.discountType = discountMatch[2] === '%' || !discountMatch[2] ? 'percent' : 'amount'; state.discountValue = num(discountMatch[1]); detected.push(`discount ${discountMatch[1]}${discountMatch[2] || '%'}`); }

    const newItems = [];
    const percentOf = input.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:of|z)\s*(?:£|€|\$|zł)?\s*(\d+(?:[.,]\d+)?)/i);
    if (percentOf && state.documentType === 'deposit') {
      const pct = num(percentOf[1]); const base = num(percentOf[2]);
      newItems.push({ description: `Project deposit (${pct}% of ${formatMoney(base)})`, quantity: 1, unit: 'project', rate: base * pct / 100 });
    }

    const segments = input.split(/\n|;|,|\s+(?:and|plus|oraz)\s+/i).map((part) => part.trim()).filter(Boolean);
    const qtyRatePattern = /^(?:invoice\s+for\s+)?(\d+(?:[.,]\d+)?)\s*([a-ząćęłńóśźż\s&/-]{1,60}?)\s*(?:at|@|x|×|each|po|za)\s*(?:£|€|\$|zł|pln)?\s*(\d+(?:[.,]\d+)?)/i;
    const namedQtyRatePattern = /^(?:invoice\s+for\s+)?(.{2,70}?)\s+(\d+(?:[.,]\d+)?)\s*(miles?|kilomet(?:er|re)s?|km|hours?|hrs?|days?)\s*(?:at|@|x|×|each|po|za)\s*(?:£|€|\$|zł|pln)?\s*(\d+(?:[.,]\d+)?)/i;
    const amountPattern = /^(?:invoice\s+for\s+|reimburse\s+)?(.{2,90}?)\s*(?:£|€|\$|zł|pln)\s*(\d+(?:[.,]\d+)?)/i;

    for (const segment of segments) {
      if (percentOf && /%\s*(?:of|z)\s*(?:£|€|\$|zł|pln)?\s*\d/i.test(segment)) continue;
      if (/\b(vat|tax|due|discount|deposit paid)\b/i.test(segment) && !/(service|product|project|fuel|delivery|work|shirt|night|hotel|train|parking|mileage|support)/i.test(segment)) continue;
      const namedQty = segment.match(namedQtyRatePattern);
      if (namedQty) {
        const unit = parseUnit(namedQty[3]);
        newItems.push({ description: cleanDescription(namedQty[1], unit === 'mile' ? 'Business mileage' : 'Service'), quantity: num(namedQty[2]), unit, rate: num(namedQty[4]) });
        continue;
      }
      const qty = segment.match(qtyRatePattern);
      if (qty) {
        const unitText = qty[2]; const unit = parseUnit(unitText);
        newItems.push({ description: cleanDescription(unitText, unit === 'day' ? 'Work' : unit === 'hour' ? 'Hours worked' : 'Item'), quantity: num(qty[1]), unit, rate: num(qty[3]) });
        continue;
      }
      const amount = segment.match(amountPattern);
      if (amount) {
        const description = cleanDescription(amount[1], 'Service'); const unit = parseUnit(description);
        newItems.push({ description, quantity: 1, unit, rate: num(amount[2]) });
      }
    }

    if (!newItems.length) {
      const oneAmount = input.match(/(?:£|€|\$|zł)\s*(\d+(?:[.,]\d+)?)/);
      if (oneAmount) newItems.push({ description: cleanDescription(input, 'Service'), quantity: 1, unit: parseUnit(input), rate: num(oneAmount[1]) });
    }

    newItems.forEach((item) => state.items.push({ ...item, id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}` }));
    if (/rental|hire|equipment hire|vehicle hire/.test(lower) || newItems.some((item) => item.unit === 'rental')) state.workMode = 'rental';
    else if (/lesson|tuition|tutoring|coaching|appointment|therapy session|consultation session/.test(lower) || newItems.some((item) => ['session','visit'].includes(item.unit))) state.workMode = 'appointments';
    else if (/plumb|electric|repair|installation|construction|builder|call[- ]out|materials|site work/.test(lower)) state.workMode = 'trades';
    else if (/design|photograph|video|editing|branding|copywriting|creative|licen[cs]e|usage fee/.test(lower) || newItems.some((item) => item.unit === 'licence')) state.workMode = 'creative';
    else if (/recurring|monthly|subscription|retainer/.test(lower) || newItems.some((item) => ['month','week','subscription'].includes(item.unit))) state.workMode = 'recurring';
    else if (/reimburse|expense|hotel|parking|train|receipt/.test(lower) || newItems.some((item) => item.unit === 'expense')) state.workMode = 'expenses';
    else if (newItems.some((item) => ['hour','day','night'].includes(item.unit))) state.workMode = 'hours';
    else if (newItems.some((item) => ['mile','km'].includes(item.unit))) state.workMode = 'transport';
    else if (newItems.some((item) => item.unit === 'project')) state.workMode = 'project';
    else if (/shirt|product|item|pcs|goods|parts/.test(lower)) state.workMode = 'products';

    const result = $('#smartResult');
    result.hidden = false;
    result.textContent = newItems.length ? `Added ${newItems.length} ${newItems.length === 1 ? 'item' : 'items'}. Recognised: ${detected.length ? detected.join(', ') : 'descriptions and amounts'}. Everything remains editable.` : 'No clear line items were found. Try “5 days at £220 and fuel £45”.';
    renderAll(); state.currentStep = 4; updateStepper(); saveState();
    toast(newItems.length ? 'Draft created' : 'Try a simpler description', newItems.length ? 'All recognised details remain editable.' : 'Example: “10 products at £18 each and delivery £12”.', newItems.length ? 'success' : 'error');
  }

  function renderToolbox() {
    $('#toolPanels').innerHTML = `
      <section class="tool-panel ${currentTool === 'hours' ? 'active' : ''}" data-tool-panel="hours"><div class="tool-card"><h3>Hours calculator</h3><p>Handles overnight shifts and subtracts an unpaid break.</p><div class="form-grid two-col">
        <label class="field span-2"><span>Description</span><input id="toolHoursDesc" value="Driving services" /></label><label class="field"><span>Start</span><input id="toolHoursStart" type="time" value="08:00" /></label><label class="field"><span>End</span><input id="toolHoursEnd" type="time" value="17:00" /></label><label class="field"><span>Break (min)</span><input id="toolHoursBreak" type="number" value="45" min="0" /></label><label class="field"><span>Hourly rate</span><input id="toolHoursRate" type="number" value="18.50" min="0" step="0.01" /></label></div><div class="tool-result"><span>Paid time and value</span><strong id="toolHoursResult">—</strong></div><button class="btn btn-primary" type="button" data-tool-action="add-hours">Add to document</button></div></section>
      <section class="tool-panel ${currentTool === 'vat' ? 'active' : ''}" data-tool-panel="vat"><div class="tool-card"><h3>Net, VAT and gross</h3><p>Enter a net or gross amount and apply the rate to the document.</p><div class="form-grid two-col"><label class="field"><span>Amount</span><input id="toolVatAmount" type="number" value="100" min="0" step="0.01" /></label><label class="field"><span>Amount is</span><select id="toolVatBasis"><option value="net">net</option><option value="gross">gross</option></select></label><label class="field span-2"><span>VAT rate</span><div class="input-suffix"><input id="toolVatRate" type="number" value="${num(state.vatRate) || 20}" min="0" step="0.01" /><span>%</span></div></label></div><div class="tool-result"><span>Net / VAT / Gross</span><strong id="toolVatResult">—</strong></div><button class="btn btn-primary" type="button" data-tool-action="apply-vat">Apply VAT</button></div></section>
      <section class="tool-panel ${currentTool === 'mileage' ? 'active' : ''}" data-tool-panel="mileage"><div class="tool-card"><h3>Mileage calculator</h3><p>Distance, unit rate and additional travel charges.</p><div class="form-grid two-col"><label class="field span-2"><span>Journey description</span><input id="toolMileageDesc" value="Business mileage" /></label><label class="field"><span>Distance</span><input id="toolMileageDistance" type="number" value="100" min="0" step="0.1" /></label><label class="field"><span>Unit</span><select id="toolMileageUnit"><option value="mile">mile</option><option value="km">km</option></select></label><label class="field"><span>Rate</span><input id="toolMileageRate" type="number" value="0.45" min="0" step="0.01" /></label><label class="field"><span>Extra costs</span><input id="toolMileageExtra" type="number" value="0" min="0" step="0.01" /></label></div><div class="tool-result"><span>Total value</span><strong id="toolMileageResult">—</strong></div><button class="btn btn-primary" type="button" data-tool-action="add-mileage">Add to document</button></div></section>
      <section class="tool-panel ${currentTool === 'adjustment' ? 'active' : ''}" data-tool-panel="adjustment"><div class="tool-card"><h3>Discount and deposit</h3><p>Adjust the document total without adding artificial line items.</p><div class="form-grid two-col"><label class="field"><span>Discount</span><input id="toolDiscountValue" type="number" value="${num(state.discountValue)}" min="0" step="0.01" /></label><label class="field"><span>Type</span><select id="toolDiscountType"><option value="percent" ${state.discountType === 'percent' ? 'selected' : ''}>percent</option><option value="amount" ${state.discountType === 'amount' ? 'selected' : ''}>fixed amount</option></select></label><label class="field span-2"><span>Deposit already paid</span><input id="toolDeposit" type="number" value="${num(state.depositPaid)}" min="0" step="0.01" /></label></div><div class="tool-result"><span>Updated amount due</span><strong id="toolAdjustmentResult">—</strong></div><button class="btn btn-primary" type="button" data-tool-action="apply-adjustment">Apply adjustments</button></div></section>`;
    updateToolResults();
  }

  function updateToolResults() {
    const hStart = $('#toolHoursStart')?.value; const hEnd = $('#toolHoursEnd')?.value;
    if (hStart && hEnd && $('#toolHoursResult')) {
      const [sh, sm] = hStart.split(':').map(Number); const [eh, em] = hEnd.split(':').map(Number); let mins = eh * 60 + em - sh * 60 - num($('#toolHoursBreak')?.value); if (mins <= -num($('#toolHoursBreak')?.value)) mins += 1440; mins = Math.max(0, mins); const hours = Math.round(mins / 60 * 100) / 100; $('#toolHoursResult').textContent = `${hours} h • ${formatMoney(hours * num($('#toolHoursRate')?.value))}`;
    }
    if ($('#toolVatResult')) {
      const amount = num($('#toolVatAmount')?.value); const rate = num($('#toolVatRate')?.value); const basis = $('#toolVatBasis')?.value; const net = basis === 'gross' ? amount / (1 + rate / 100) : amount; const gross = basis === 'gross' ? amount : amount * (1 + rate / 100); $('#toolVatResult').textContent = `${formatMoney(net)} / ${formatMoney(gross - net)} / ${formatMoney(gross)}`;
    }
    if ($('#toolMileageResult')) {
      const total = num($('#toolMileageDistance')?.value) * num($('#toolMileageRate')?.value) + num($('#toolMileageExtra')?.value); $('#toolMileageResult').textContent = formatMoney(total);
    }
    if ($('#toolAdjustmentResult')) {
      const originalDiscountType = state.discountType; const originalDiscount = state.discountValue; const originalDeposit = state.depositPaid;
      state.discountType = $('#toolDiscountType')?.value || state.discountType; state.discountValue = num($('#toolDiscountValue')?.value); state.depositPaid = num($('#toolDeposit')?.value);
      $('#toolAdjustmentResult').textContent = formatMoney(calculateTotals().amountDue);
      state.discountType = originalDiscountType; state.discountValue = originalDiscount; state.depositPaid = originalDeposit;
    }
  }

  function applyToolAction(action) {
    if (action === 'add-hours') {
      const start = $('#toolHoursStart').value; const end = $('#toolHoursEnd').value; const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number); let mins = eh * 60 + em - sh * 60; if (mins <= 0) mins += 1440; mins = Math.max(0, mins - num($('#toolHoursBreak').value)); const hours = Math.round(mins / 60 * 100) / 100;
      addItem({ description: `${$('#toolHoursDesc').value || 'Hours worked'} (${start}–${end})`, quantity: hours, unit: 'hour', rate: num($('#toolHoursRate').value) });
    } else if (action === 'apply-vat') {
      state.vatEnabled = true; state.vatRate = num($('#toolVatRate').value); state.documentType = 'vat';
    } else if (action === 'add-mileage') {
      addItem({ description: $('#toolMileageDesc').value || 'Business mileage', quantity: num($('#toolMileageDistance').value), unit: $('#toolMileageUnit').value, rate: num($('#toolMileageRate').value) });
      const extra = num($('#toolMileageExtra').value); if (extra > 0) addItem({ description: 'Additional travel costs', quantity: 1, unit: 'item', rate: extra });
    } else if (action === 'apply-adjustment') {
      state.discountType = $('#toolDiscountType').value; state.discountValue = num($('#toolDiscountValue').value); state.depositPaid = num($('#toolDeposit').value);
    }
    renderAll(); saveState(); closeToolbox(); toast('Applied', 'The document has been recalculated.');
  }

  function openToolbox() {
    $('#toolboxBackdrop').hidden = false;
    requestAnimationFrame(() => $('#toolbox').classList.add('open'));
    $('#toolbox').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeToolbox() {
    $('#toolbox').classList.remove('open');
    $('#toolbox').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { $('#toolboxBackdrop').hidden = true; }, 280);
  }

  function toast(title, message, type = 'success') {
    const node = document.createElement('div');
    node.className = `toast ${type === 'error' ? 'error' : ''}`;
    node.innerHTML = `<span>${type === 'error' ? '!' : '✓'}</span><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(message)}</small></div>`;
    $('#toastRegion').appendChild(node);
    setTimeout(() => node.classList.add('out'), 3300);
    setTimeout(() => node.remove(), 3600);
  }

  function confirmAction(title, message) {
    return new Promise((resolve) => {
      const fragment = $('#confirmDialogTemplate').content.cloneNode(true);
      const dialog = $('dialog', fragment);
      $('h2', dialog).textContent = title; $('p', dialog).textContent = message;
      document.body.appendChild(dialog);
      dialog.addEventListener('close', () => { resolve(dialog.returnValue === 'confirm'); dialog.remove(); }, { once: true });
      dialog.showModal();
    });
  }

  function exportModel() {
    const l = labels(); const totals = calculateTotals(); const profile = activeDocumentProfile();
    const grandRaw = state.documentType === 'receipt' ? totals.total : ['quote','proforma','credit'].includes(state.documentType) ? totals.total : totals.amountDue;
    const rows = [
      { label: l.subtotal, raw: totals.subtotal, formatted: formatMoney(totals.subtotal) },
      ...(totals.discount > 0 ? [{ label: l.discount, raw: -totals.discount, formatted: `−${formatMoney(totals.discount)}` }] : []),
      ...(state.vatEnabled ? [{ label: `${l.vat} ${num(state.vatRate)}%`, raw: totals.vat, formatted: formatMoney(totals.vat) }] : []),
      ...(totals.deposit > 0 ? [{ label: l.deposit, raw: -totals.deposit, formatted: `−${formatMoney(totals.deposit)}` }] : []),
      { label: docGrandLabel(l), raw: grandRaw, formatted: formatMoney(grandRaw), grand: true }
    ];
    return {
      filenameBase: `${state.invoiceNumber || 'document'}-${state.clientName || 'client'}`,
      title: l.document[state.documentType], numberLabel: l.number[state.documentType], number: state.invoiceNumber || '—',
      issueDateLabel: profile.issueLabel || l.issueDate, dueDateLabel: profile.dueLabel || l.dueDate, serviceDateLabel: profile.serviceLabel || l.serviceDate,
      issueDate: formatDate(state.issueDate), dueDate: state.dueDateEnabled ? formatDate(state.dueDate) : '', serviceDate: formatDate(state.serviceDate),
      fromLabel: profile.fromLabel || l.from, toLabel: profile.toLabel || l.to,
      seller: { name: state.sellerName, lines: sellerLines() }, client: { name: state.clientName, lines: clientLines() },
      items: state.items.map((item) => ({ description: item.description, quantity: num(item.quantity), unit: item.unit, rate: num(item.rate), amount: itemAmount(item), rateFormatted: formatMoney(item.rate), amountFormatted: formatMoney(itemAmount(item)) })),
      totals: rows, notes: state.showNotes ? state.notes : '', terms: state.showTerms ? state.terms : '', notesLabel: l.notes, termsLabel: l.terms,
      bank: state.showBank ? [state.bankName, state.bankCode, state.bankAccount].filter(Boolean).join(' • ') : '',
      showSignature: state.showSignature, signatureLabel: l.signature,
      accent: state.accent, logoData: state.logoData, logoX: num(state.logoX), logoY: num(state.logoY), logoWidth: num(state.logoWidth), currencyCode: state.currency, template: state.template,
      contextBadge: profile.badge, contextMessage: profile.message,
      billingMode: state.workMode,
      billingLabel: (billingProfiles[state.workMode] || billingProfiles.service).label,
      billingTagline: (billingProfiles[state.workMode] || billingProfiles.service).tagline,
      itemLabels: { description: profile.itemLabel || l.description, quantity: l.quantity, unit: l.unit, rate: l.rate, amount: l.amount }
    };
  }

  async function doExport(format) {
    if (!state.items.length) { toast('No line items', 'Add at least one line item before downloading.', 'error'); state.currentStep = 4; updateStepper(); return; }
    const model = exportModel(); const preview = $('#invoicePreview');
    try {
      if (format === 'pdf') await window.InvoiceExport.pdf(model, preview);
      else if (format === 'xlsx') await window.InvoiceExport.xlsx(model, preview);
      else if (format === 'docx') await window.InvoiceExport.docx(model, preview);
      toast('File ready', `${format.toUpperCase()} downloaded.`);
    } catch (error) {
      console.error(error); toast('Export failed', 'Try again or use Print / system PDF.', 'error');
    }
  }

  function loadContextExample(options = {}) {
    const selectedType = state.documentType;
    const selectedMode = state.workMode;
    const currentStep = state.currentStep;
    const branding = {
      logoData: state.logoData,
      logoX: state.logoX,
      logoY: state.logoY,
      logoWidth: state.logoWidth
    };
    const profile = activeDocumentProfile();
    const issueDate = todayIso();
    const templateByDocument = {
      invoice: 'studio', vat: 'corporate', quote: 'editorial', proforma: 'minimal', credit: 'ledger', receipt: 'soft',
      deposit: 'bold', final: 'classic', commercial: 'horizon', recurringInvoice: 'split', interim: 'compact', paymentRequest: 'monochrome'
    };
    const accentByDocument = {
      invoice: '#4f46e5', vat: '#176b87', quote: '#2563eb', proforma: '#7c3aed', credit: '#b4234d', receipt: '#20735c',
      deposit: '#a35c21', final: '#2563eb', commercial: '#176b87', recurringInvoice: '#7a3e56', interim: '#222a3a', paymentRequest: '#b4234d'
    };
    const sellerByMode = {
      service: 'Lumen Business Services Ltd', hours: 'Northline Professional Services Ltd', products: 'Harborough Goods Ltd',
      transport: 'Atlas Transport Services Ltd', project: 'Foundry Projects Ltd', expenses: 'Fieldwork Solutions Ltd',
      recurring: 'Northstar Support Ltd', blank: 'Example Supplier Ltd', trades: 'Summit Trade Services Ltd',
      creative: 'Signal Creative Studio Ltd', rental: 'Westbrook Equipment Hire Ltd', appointments: 'Meridian Learning Ltd'
    };
    const referenceByDocument = {
      credit: 'Original invoice INV-2026-042', commercial: 'Shipment EXP-0726-18', recurringInvoice: 'Billing period JUL-2026',
      interim: 'Contract valuation 03', paymentRequest: 'Agreement REF-1048', final: 'Project completion PC-204',
      deposit: 'Project booking PRJ-204', quote: 'Proposal Q-0726'
    };
    let examples = getItemSuggestions();
    if (['credit','receipt','deposit','commercial','interim','paymentRequest'].includes(selectedType)) examples = documentSpecificSuggestions();
    const exampleItems = examples.slice(0, selectedType === 'paymentRequest' ? 1 : 3).map((item, index) => ({
      ...item, id: `example-${selectedType}-${selectedMode}-${index + 1}`
    }));
    const base = defaultState();
    state = {
      ...base,
      currentStep,
      documentType: selectedType,
      workMode: selectedMode,
      invoiceNumber: `${profile.prefix}-${new Date().getFullYear()}-001`,
      issueDate,
      dueDate: addDays(issueDate, profile.dueDays ?? 14),
      dueDateEnabled: !profile.paid,
      serviceDate: issueDate,
      vatEnabled: Boolean(profile.vat),
      vatRate: 20,
      sellerName: sellerByMode[selectedMode] || sellerByMode.service,
      sellerEmail: 'accounts@example-business.co.uk',
      sellerPhone: '+44 161 555 0148',
      sellerAddress: '18 Market Street\nManchester M1 2AB',
      sellerCompanyNo: '14839201',
      sellerVatNo: profile.vat ? 'GB 412 3456 78' : '',
      bankName: '',
      bankCode: '',
      bankAccount: '',
      clientName: selectedType === 'commercial' ? 'Nordmark Trading GmbH' : 'Acorn Client Ltd',
      clientEmail: selectedType === 'commercial' ? 'imports@nordmark.example' : 'finance@acorn-client.example',
      clientAddress: selectedType === 'commercial' ? 'Hafenstrasse 22\n20457 Hamburg\nGermany' : 'Unit 7, Commerce Park\nBirmingham B24 8HZ',
      clientVatNo: profile.vat ? 'GB 987 6543 21' : '',
      purchaseOrder: referenceByDocument[selectedType] || 'PO-0726-44',
      items: exampleItems,
      depositPaid: num(profile.exampleDeposit),
      template: templateByDocument[selectedType] || 'studio',
      accent: accentByDocument[selectedType] || '#4f46e5',
      ...branding,
      showBank: false,
      showNotes: false,
      showTerms: false,
      notes: '',
      terms: ''
    };
    renderAll();
    saveState(true);
    if (options.announce !== false) toast('Matching example loaded', `${selectedDocumentTitle()} for ${selectedWorkModeTitle()} is ready to edit.`);
  }

  async function newDocument() {
    if (state.items.length || state.sellerName || state.clientName) {
      const confirmed = await confirmAction('Create a new document?', 'The current draft and its local save will be replaced.');
      if (!confirmed) return;
    }
    const sellerFields = {};
    try { Object.assign(sellerFields, JSON.parse(localStorage.getItem(SELLER_KEY) || '{}')); } catch { /* ignore */ }
    state = { ...defaultState(), ...sellerFields };
    renderAll(); saveState(true); toast('New document', 'Start by choosing a document type.');
  }

  function saveSellerProfile() {
    const profile = {};
    ['sellerName','sellerEmail','sellerPhone','sellerAddress','sellerCompanyNo','sellerVatNo','bankName','bankCode','bankAccount'].forEach((key) => { profile[key] = state[key]; });
    localStorage.setItem(SELLER_KEY, JSON.stringify(profile));
    toast('Profile saved', 'Your details will be suggested in the next document.');
  }

  async function pasteClient() {
    let text = '';
    try { text = await navigator.clipboard.readText(); } catch { text = window.prompt('Paste client details:') || ''; }
    if (!text.trim()) return;
    const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean);
    state.clientName = lines.shift() || state.clientName;
    const email = text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] || '';
    const phone = text.match(/(?:\+?\d[\d\s()-]{7,}\d)/)?.[0] || '';
    const vat = text.match(/(?:VAT|NIP)\s*[:#-]?\s*([A-Z]{0,2}[\s\d-]{7,})/i)?.[1]?.trim() || '';
    state.clientEmail = email; state.clientPhone = phone; state.clientVatNo = vat;
    state.clientAddress = lines.filter((line) => !line.includes(email) && !line.includes(phone) && !/VAT|NIP/i.test(line)).join('\n');
    renderAll(); saveState(); toast('Details pasted', 'Check the recognised fields before downloading.');
  }

  function copySummary() {
    const l = labels(); const totals = calculateTotals();
    const lines = [`${l.document[state.documentType]} ${state.invoiceNumber}`, `${l.to}: ${state.clientName || '—'}`, ...state.items.map((item) => `${item.description}: ${num(item.quantity)} × ${formatMoney(item.rate)} = ${formatMoney(itemAmount(item))}`), `${docGrandLabel(l)}: ${formatMoney(state.documentType === 'receipt' ? totals.total : totals.amountDue)}`];
    navigator.clipboard?.writeText(lines.join('\n')).then(() => toast('Copied', 'The summary is ready to paste into an email.')).catch(() => toast('Could not copy', 'Select the text manually in the preview.', 'error'));
  }

  function handleStaticInput(event) {
    const target = event.target;
    if (!target.id || target.closest('#quickAddForm') || target.closest('#toolbox')) return;
    const booleanIds = ['showBank','showNotes','showTerms','showSignature'];
    if (booleanIds.includes(target.id)) state[target.id] = target.checked;
    else if (target.id === 'vatEnabled') state.vatEnabled = target.value === 'true';
    else if (target.id === 'logoUpload') return;
    else if (Object.prototype.hasOwnProperty.call(state, target.id)) state[target.id] = target.type === 'number' ? num(target.value) : target.value;
    else return;

    if (target.id === 'country') {
      if (target.value === 'PL') { state.currency = 'PLN'; state.vatRate = 23; }
      else if (target.value === 'GB') { state.currency = 'GBP'; state.vatRate = 20; }
      syncStaticInputs();
    }
    if (target.id === 'dueDate') state.dueDateEnabled = true;
    if (target.id === 'issueDate') {
      if (state.dueDateEnabled) {
        const active = $$('.quick-due-row button.active').find((button) => button.dataset.dueDays !== 'none');
        const days = active ? Number(active.dataset.dueDays) : 14;
        state.dueDate = addDays(state.issueDate, days);
      }
      state.serviceDate ||= state.issueDate; syncStaticInputs();
    }
    if (target.id === 'documentLanguage' || target.id === 'currency') {
      renderItems();
      renderItemSuggestions();
    }
    updatePreview(); saveState();
  }

  function applyLogoPreset(preset) {
    const positions = {
      left: { x: 12, y: 5 },
      centre: { x: 50, y: 5 },
      right: { x: 88, y: 5 }
    };
    const position = positions[preset];
    if (!position || !state.logoData) return;
    state.logoX = position.x;
    state.logoY = position.y;
    syncStaticInputs();
    updatePreview();
    saveState();
  }

  function setLogoMoveMode(enabled) {
    logoMoveMode = Boolean(enabled && state.logoData);
    logoDragging = false;
    syncStaticInputs();
    updatePreview();
    if (logoMoveMode) toast('Move your logo', 'Drag it anywhere on the live document. Select “Finish moving” when it is in place.');
  }

  function updateLogoFromPointer(event) {
    if (!logoMoveMode || !state.logoData) return;
    const preview = $('#invoicePreview');
    const rect = preview?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    state.logoX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    state.logoY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    syncStaticInputs();
    updatePreview();
  }

  function bindEvents() {
    document.addEventListener('pointermove', (event) => {
      const card = event.target.closest('.choice-card, .template-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
    }, { passive: true });

    document.addEventListener('click', async (event) => {
      const target = event.target.closest('button, [data-action], [data-document-type], [data-work-mode], [data-template], [data-accent], [data-step], [data-due-days], [data-export], [data-jump-step], [data-tool], [data-tool-action], [data-remove-item], [data-zoom], [data-logo-preset]');
      if (!target) return;

      if (target.dataset.documentType) {
        state.documentType = target.dataset.documentType;
        loadContextExample({ announce: false });
        toast('Example ready', `${selectedDocumentTitle()} has been filled with a complete ${selectedWorkModeTitle().toLowerCase()} example.`);
        return;
      }
      if (target.dataset.workMode) {
        state.workMode = target.dataset.workMode;
        loadContextExample({ announce: false });
        toast('Billing style changed', `${selectedWorkModeTitle()} now has matching items and its own document motif.`);
        return;
      }
      if (target.dataset.template) { state.template = target.dataset.template; renderTemplates(); updatePreview(); saveState(); return; }
      if (target.dataset.accent) { state.accent = normalizeHexColour(target.dataset.accent) || '#4f46e5'; renderTemplates(); updatePreview(); saveState(); return; }
      if (target.dataset.logoPreset) { applyLogoPreset(target.dataset.logoPreset); return; }
      if (target.dataset.step) { state.currentStep = Number(target.dataset.step); updateStepper(true); return; }
      if (target.dataset.jumpStep) { state.currentStep = Number(target.dataset.jumpStep); updateStepper(true); return; }
      if (target.dataset.dueDays !== undefined) {
        const value = target.dataset.dueDays;
        $$('.quick-due-row button').forEach((button) => button.classList.toggle('active', button === target));
        if (value === 'none') state.dueDateEnabled = false;
        else { state.dueDateEnabled = true; state.dueDate = addDays(state.issueDate, Number(value)); }
        syncStaticInputs(); updatePreview(); saveState(); return;
      }
      if (target.dataset.removeItem !== undefined) { state.items.splice(Number(target.dataset.removeItem), 1); renderItems(); updatePreview(); saveState(); return; }
      if (target.dataset.export) { await doExport(target.dataset.export); return; }
      if (target.dataset.zoom) {
        const preview = $('#invoicePreview');
        const currentZoom = Number(preview?.dataset.effectiveZoom || state.previewZoom || .86);
        state.previewZoom = Math.max(.35, Math.min(1.25, currentZoom + (target.dataset.zoom === 'in' ? .05 : -.05)));
        state.previewZoomManual = true;
        applyPreviewFit(Number(preview?.dataset.baseHeight || 1018));
        saveState(); return;
      }
      if (target.dataset.tool) { currentTool = target.dataset.tool; $$('.tool-tabs button').forEach((button) => button.classList.toggle('active', button === target)); $$('.tool-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.toolPanel === currentTool)); updateToolResults(); return; }
      if (target.dataset.toolAction) { applyToolAction(target.dataset.toolAction); return; }

      const action = target.dataset.action;
      if (!action) return;
      if (action === 'new-document') await newDocument();
      else if (action === 'go-start') { state.currentStep = 1; updateStepper(true); }
      else if (action === 'quick-add-item') quickAddItem();
      else if (action === 'add-empty-item') addItem({ description: 'New item', quantity: 1, unit: 'item', rate: 0 });
      else if (action === 'clear-items') { if (await confirmAction('Clear all line items?', 'All other document details will stay unchanged.')) { state.items = []; renderItems(); updatePreview(); saveState(); } }
      else if (action === 'smart-generate') smartParse();
      else if (action === 'open-toolbox') openToolbox();
      else if (action === 'close-toolbox') closeToolbox();
      else if (action === 'save-seller') saveSellerProfile();
      else if (action === 'paste-client') await pasteClient();
      else if (action === 'remove-logo') { state.logoData = ''; setLogoMoveMode(false); saveState(); }
      else if (action === 'toggle-logo-move') setLogoMoveMode(!logoMoveMode);
      else if (action === 'apply-custom-colour') applyCustomColour($('#customAccentHex')?.value, true);
      else if (action === 'print-document') window.print();
      else if (action === 'copy-summary') copySummary();
      else if (action === 'toggle-preview') {
        const pane = $('#invoicePreview').closest('.preview-pane');
        const opening = !pane.classList.contains('open');
        pane.classList.toggle('open', opening);
        document.body.classList.toggle('preview-open', opening);
        $$('[data-action="toggle-preview"]').forEach((button) => button.setAttribute('aria-expanded', String(opening)));
        if (opening && window.matchMedia('(max-width: 1020px)').matches) {
          state.previewZoomManual = false;
          pane.scrollTop = 0;
          requestAnimationFrame(() => {
            applyPreviewFit(Number($('#invoicePreview')?.dataset.baseHeight || 1018));
            $('.preview-stage')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          });
        }
      }
    });

    $('#invoiceForm').addEventListener('input', handleStaticInput);
    $('#invoiceForm').addEventListener('change', handleStaticInput);
    $('#customAccentPicker').addEventListener('input', (event) => applyCustomColour(event.target.value));
    $('#customAccentPicker').addEventListener('change', (event) => applyCustomColour(event.target.value, true));
    $('#customAccentHex').addEventListener('input', (event) => {
      const colour = normalizeHexColour(event.target.value);
      event.target.setAttribute('aria-invalid', String(!colour));
      if (colour) applyCustomColour(colour);
    });
    $('#customAccentHex').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyCustomColour(event.currentTarget.value, true);
      }
    });
    $('#suggestedItemSelect').addEventListener('change', () => {
      if ($('#suggestedItemSelect').value !== '') addSelectedSuggestion();
    });
    $('#itemsEditorBody').addEventListener('input', (event) => {
      const input = event.target.closest('[data-item-field]'); if (!input) return;
      const row = input.closest('tr'); const index = Number(row.dataset.itemIndex); const field = input.dataset.itemField;
      state.items[index][field] = input.type === 'number' ? num(input.value) : input.value;
      $('.row-total', row).textContent = formatMoney(itemAmount(state.items[index]));
      updatePreview(); saveState();
    });

    $('#smartPrompt').addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') smartParse(); });
    $$('.example-prompts').forEach((root) => root.addEventListener('click', (event) => { const button = event.target.closest('[data-prompt-example]'); if (button) { $('#smartPrompt').value = button.dataset.promptExample; $('#smartPrompt').focus(); } }));

    $('#logoUpload').addEventListener('change', (event) => {
      const file = event.target.files?.[0]; if (!file) return;
      if (file.size > 2 * 1024 * 1024) { toast('The logo is too large', 'Use a file smaller than 2 MB.', 'error'); return; }
      const reader = new FileReader(); reader.onload = () => { state.logoData = String(reader.result); syncStaticInputs(); updatePreview(); saveState(); toast('Logo added', 'Use “Move on preview” to place it anywhere on the document.'); }; reader.readAsDataURL(file);
    });

    const preview = $('#invoicePreview');
    preview.addEventListener('pointerdown', (event) => {
      if (!logoMoveMode || !state.logoData) return;
      event.preventDefault();
      logoDragging = true;
      preview.setPointerCapture?.(event.pointerId);
      updateLogoFromPointer(event);
    });
    document.addEventListener('pointermove', (event) => {
      if (!logoDragging) return;
      event.preventDefault();
      updateLogoFromPointer(event);
    });
    document.addEventListener('pointerup', () => {
      if (!logoDragging) return;
      logoDragging = false;
      saveState(true);
    });

    $('#prevStep').addEventListener('click', () => { state.currentStep = Math.max(1, state.currentStep - 1); updateStepper(true); });
    $('#nextStep').addEventListener('click', async () => { if (state.currentStep === 5) await doExport('pdf'); else { state.currentStep = Math.min(5, state.currentStep + 1); updateStepper(true); } });

    let previewResizeFrame = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(previewResizeFrame);
      previewResizeFrame = requestAnimationFrame(() => {
        const preview = $('#invoicePreview');
        applyPreviewFit(Number(preview?.dataset.baseHeight || 1018));
      });
    });

    $('#toolboxBackdrop').addEventListener('click', closeToolbox);
    $('#toolPanels').addEventListener('input', updateToolResults);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if ($('#toolbox').classList.contains('open')) closeToolbox();
      const previewPane = $('.preview-pane');
      if (previewPane?.classList.contains('open')) {
        previewPane.classList.remove('open');
        document.body.classList.remove('preview-open');
        $$('[data-action="toggle-preview"]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
      }
    });
  }

  function importPendingCalculatorResult() {
    try {
      const raw = localStorage.getItem('invoiceStudioPendingItemV1');
      if (!raw) return;
      localStorage.removeItem('invoiceStudioPendingItemV1');
      const pending = JSON.parse(raw);
      if (pending?.item) state.items.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, ...pending.item });
      if (pending?.settings) Object.assign(state, pending.settings);
      state.currentStep = 4;
      toast('Calculator result added', 'The result is now an editable invoice item.');
    } catch (error) { console.warn('Could not import calculator result', error); }
  }

  function init() {
    importPendingCalculatorResult();
    renderAll();
    bindEvents();
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  window.InvoiceStudio = {
    getExportModel: () => exportModel(),
    exportDocument: (format) => doExport(format),
    getState: () => JSON.parse(JSON.stringify(state))
  };

  document.addEventListener('DOMContentLoaded', init);
})();

/* v1.11.8 — mobile preview reliability and viewport recovery. */
(() => {
  const mobileQuery = window.matchMedia('(max-width: 1020px)');
  const pane = document.querySelector('.preview-pane');
  const stage = document.querySelector('.preview-stage');
  const preview = document.querySelector('#invoicePreview');
  if (!pane || !stage || !preview) return;

  const refitMobilePreview = () => {
    if (!mobileQuery.matches || !pane.classList.contains('open')) return;
    try {
      state.previewZoomManual = false;
      applyPreviewFit(Number(preview.dataset.baseHeight || 1018));
      stage.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (_) {}
  };

  document.querySelectorAll('[data-action="toggle-preview"]').forEach((button) => {
    button.addEventListener('click', () => {
      window.setTimeout(refitMobilePreview, 40);
      window.setTimeout(refitMobilePreview, 260);
    });
  });

  window.addEventListener('orientationchange', () => window.setTimeout(refitMobilePreview, 220));
  window.visualViewport?.addEventListener('resize', () => window.setTimeout(refitMobilePreview, 80));
})();
