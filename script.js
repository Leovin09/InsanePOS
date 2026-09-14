/* =======================================================================
   Insane — offline single-file POS + Payroll demo application.
   All data lives in memory (the STATE object) for the duration of the
   browser tab. Use "Export Data" / "Import Data" in the top bar to save
   your work to a JSON file and reload it in a future session.
   ======================================================================= */

/* Bump these together on every release — the version footer (bottom of
   screen) and the "new version available" prompt both read from this. */
const APP_VERSION = '1.0.0';
const APP_BUILD_DATE = '2026-08-10T09:00:00';
/* All dates/times in the app are shown in Philippine time (Asia/Manila,
   UTC+8), regardless of what timezone the device itself is set to — this
   keeps "today"/"yesterday" and every timestamp consistent for a PH-based
   store no matter where the hardware thinks it is. Declared this early
   (before any other code) so boot-time calls that need it never hit a
   temporal-dead-zone error. */
const PH_TZ = 'Asia/Manila';

/* ============================================================
   MINIMAL ICON SET
   Small inline SVGs (stroke-based, currentColor) used in place of
   emoji throughout the nav and toolbar, so icons stay crisp and
   theme-aware at any size instead of relying on the OS emoji font.
   ============================================================ */
const ICONS = {
  dashboard: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 10 4l7 6.5"/><path d="M5 9v7.5h10V9"/><path d="M8 17V12h4v5"/></svg>',
  employees: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="6.5" r="2.7"/><path d="M2.3 16.2c0-2.9 2.3-5.2 5.2-5.2s5.2 2.3 5.2 5.2"/><circle cx="14.5" cy="7" r="2"/><path d="M13 11.3c2 .3 3.6 2 3.9 4.4"/></svg>',
  inventory: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 6.2 10 2.5l7.2 3.7L10 9.9 2.8 6.2Z"/><path d="M2.8 6.2v7.6L10 17.5l7.2-3.7V6.2"/><path d="M10 9.9v7.6"/></svg>',
  payroll: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.3" y="5.3" width="15.4" height="9.4" rx="1.6"/><circle cx="10" cy="10" r="2.1"/><path d="M4.8 8v0M15.2 12v0"/></svg>',
  finance: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 14.5 7.5 9l3 3 6.7-7.5"/><path d="M12.7 4.5h4.5V9"/></svg>',
  reports: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5V9.8M10 16.5V4M15.5 16.5v-6.2"/><path d="M2.5 16.5h15"/></svg>',
  audit: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2.8" width="12" height="14.4" rx="1.5"/><path d="M7 6.3h6M7 9.6h6M7 12.9h3.5"/></svg>',
  settings: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.8v2.1M10 15.1v2.1M17.2 10h-2.1M4.9 10H2.8M15.2 4.8l-1.5 1.5M6.3 13.7l-1.5 1.5M15.2 15.2l-1.5-1.5M6.3 6.3 4.8 4.8"/></svg>',
  newsale: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.3 2.5h9.4v15l-2.1-1.4-1.6 1.4-1.6-1.4-1.6 1.4-1.6-1.4-.9.6Z"/><path d="M7.5 7h5M7.5 10h5"/></svg>',
  history: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2.8h10v14.4H5z"/><path d="M7.4 6.6h5.2M7.4 9.6h5.2M7.4 12.6h3.4"/></svg>',
  clock: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10.8" r="6.8"/><path d="M10 6.5v4.3l2.8 1.8"/><path d="M7.8 2.2h4.4"/></svg>',
  sun: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10" cy="10" r="3.6"/><path d="M10 2.2v2M10 15.8v2M17.8 10h-2M4.2 10h-2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9 4.5 4.5"/></svg>',
  moon: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 12.3A7 7 0 1 1 7.7 3.5a5.6 5.6 0 0 0 8.8 8.8Z"/></svg>',
  warning: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 17.5 16h-15Z"/><path d="M10 8.3v3.4"/><circle cx="10" cy="14.2" r="0.15" fill="currentColor"/></svg>',
  camera: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5h2.6l1-1.8h6.8l1 1.8H17v9.2H3Z"/><circle cx="10" cy="11" r="3"/></svg>',
  trash: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h12M8 5.5V3.8h4v1.7M5.3 5.5l.6 10.7h8.2l.6-10.7"/><path d="M8.3 8.7v5M11.7 8.7v5"/></svg>',
  download: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v9.5M6.3 9.3 10 13l3.7-3.7"/><path d="M3.5 15.5h13"/></svg>',
  upload: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13V3.5M6.3 7.2 10 3.5l3.7 3.7"/><path d="M3.5 15.5h13"/></svg>',
  print: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 7V2.8h9V7"/><rect x="3" y="7" width="14" height="6.5" rx="1"/><path d="M5.5 12.5h9v4.7h-9Z"/></svg>',
  lock: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="9" width="11" height="8" rx="1.3"/><path d="M6.8 9V6.3a3.2 3.2 0 0 1 6.4 0V9"/></svg>',
  unlock: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="9" width="11" height="8" rx="1.3"/><path d="M6.8 9V6.3a3.2 3.2 0 0 1 6.1-1.4"/></svg>',
  edit: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12.9 3.5 16.5 7l-9 9-4 1 1-4Z"/></svg>',
  plate: '<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3.4"/></svg>',
  help: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7.3"/><path d="M7.7 7.8a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1 .8-1 1.6"/><circle cx="10" cy="13.9" r="0.15" fill="currentColor"/></svg>',
  close: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l10 10M15 5 5 15"/></svg>',
  wave: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17c-2-.5-3.5-2.2-3.5-4.3V9.2a1.1 1.1 0 0 1 2.2 0v2.3"/><path d="M4.7 8.4V4.6a1.1 1.1 0 0 1 2.2 0v5.2M6.9 9.5V3.5a1.1 1.1 0 0 1 2.2 0v6.3M9.1 9.9V4.9a1.1 1.1 0 0 1 2.2 0v7.4"/><path d="M11.3 12.5l1.6-1.5a1.1 1.1 0 0 1 1.6 1.6l-2.6 2.7c-1 1-1.7 1.7-3.4 1.7"/></svg>',
  hamburger: '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>',
};
function icon(name, extraStyle){
  const svg = ICONS[name] || '';
  return extraStyle ? svg.replace('<svg ', `<svg style="${extraStyle}" `) : svg;
}
function iconBtn(name){
  return `<span class="icon-wrap">${icon(name)}</span>`;
}

let STATE = null;
let nextId = { emp: 100, prod: 100, att: 1000, sale: 1000, payroll: 1000, audit: 1, expense: 100 };

/* ============================================================
   AUTO-SAVE (real offline persistence)
   Every action that changes STATE eventually re-renders through
   setAdminTab() or setCashierTab(), so those two functions call
   saveState() for us. A handful of spots that don't go through
   either (logout, reset, import) call it explicitly.
   ============================================================ */
const STORAGE_KEY = 'insane.state.v1';
const THEME_KEY = 'insane.theme.v1';
let saveIndicatorTimer = null;
function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({state: STATE, nextId}));
    flashSaveIndicator(true);
  }catch(err){
    // Private/incognito mode, storage disabled, or quota exceeded — the app
    // still works for this tab, it just won't survive a reload.
    console.warn('Insane: could not save data to this device.', err);
    flashSaveIndicator(false);
  }
}
function loadSavedState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return false;
    const parsed = JSON.parse(raw);
    if(!parsed || !parsed.state || !parsed.nextId) return false;
    STATE = normalizeState(parsed.state);
    nextId = normalizeNextId(parsed.nextId);
    return true;
  }catch(err){
    console.warn('Insane: saved data could not be read, starting fresh.', err);
    return false;
  }
}
function flashSaveIndicator(ok){
  const el = document.getElementById('save-indicator');
  if(!el) return;
  el.textContent = ok ? '● Saved on this device' : '● Not saved (storage unavailable)';
  el.className = 'save-indicator ' + (ok ? 'ok' : 'bad') + ' show';
  clearTimeout(saveIndicatorTimer);
  saveIndicatorTimer = setTimeout(()=>{ el.classList.remove('show'); }, 1500);
}

function seedData(){
  return {
    employees: [
      {id:1, username:'admin', password:'admin123', name:'System Administrator', role:'admin', position:'Administrator', salaryType:'monthly', rate:35000, schedule:'Flexible', active:true},
      {id:2, username:'jsantos', password:'pass123', name:'Juan Santos', role:'cashier', position:'Cashier', salaryType:'hourly', rate:75, schedule:'8:00 AM – 5:00 PM', active:true},
      {id:3, username:'mreyes', password:'pass123', name:'Maria Reyes', role:'cashier', position:'Cashier', salaryType:'hourly', rate:75, schedule:'1:00 PM – 10:00 PM', active:true}
    ],
    products: [
      {id:1, name:'Bottled Water 500ml', category:'Beverages', price:20, cost:12, stock:120, lowStock:20},
      {id:2, name:'Instant Noodles', category:'Grocery', price:18, cost:11, stock:80, lowStock:15},
      {id:3, name:'Canned Sardines', category:'Grocery', price:32, cost:22, stock:12, lowStock:15},
      {id:4, name:'White Bread', category:'Bakery', price:65, cost:42, stock:25, lowStock:10},
      {id:5, name:'Soft Drinks 1.5L', category:'Beverages', price:75, cost:52, stock:40, lowStock:12},
      {id:6, name:'Rice 5kg', category:'Grocery', price:290, cost:245, stock:18, lowStock:8},
      {id:7, name:'Cooking Oil 1L', category:'Grocery', price:110, cost:88, stock:6, lowStock:10},
      {id:8, name:'Laundry Soap Bar', category:'Household', price:22, cost:15, stock:60, lowStock:15}
    ],
    attendance: [],
    sales: [],
    payroll: [],
    expenses: [
      {id:1, date: todayStr(), category:'Rent', description:'Monthly store rent', amount:15000},
      {id:2, date: todayStr(), category:'Utilities', description:'Electricity and water', amount:4200}
    ],
    auditLog: [],
    currentUserId: null,
    cart: [],
    paymentMethods: [
      {id:'cash', label:'Cash', enabled:true},
      {id:'card', label:'Card', enabled:true},
      {id:'ewallet', label:'E-Wallet', enabled:true}
    ],
    payMethod: 'cash',
    labels: {
      newSaleBtn: 'New Sale',
      processPaymentBtn: 'Process Payment',
      clockInBtn: 'Clock In',
      clockOutBtn: 'Clock Out'
    },
    uiSettings: {
      accentColor: 'green',
      posShowStock: true,
      posShowCategory: false,
      posShowDiscount: true,
      adminModules: { payroll:true, finance:true, reports:true, audit:true }
    },
    vatEnabled: true,
    vatRate: 12,
    storeName: 'Insane',
    storeLogo: null,
    storeAddress: '',
    storePhone: '',
    currencySymbol: '₱',
    commissionRate: 3,
    overtimeMultiplier: 1.25,
    taxWithholdingRate: 5,
    lowStockDefaultThreshold: 10,
    receiptFooter: 'Thank you for shopping!',
    receiptShowAddress: true,
    receiptPaperWidth: '58mm',
    securitySettings: { autoLogoutMinutes: 0, minPasswordLength: 4 },
    /* Display order of POS categories (sidebar + settings drag list). Kept in
       sync with whatever categories actually exist on products — see
       syncCategoryOrder(). Seeded here in a sensible order for a fresh store. */
    categoryOrder: ['Beverages', 'Bakery', 'Grocery', 'Household']
  };
}

function loadFresh(){
  STATE = seedData();
  nextId = { emp: 100, prod: 100, att: 1000, sale: 1000, payroll: 1000, audit: 1, expense: 100 };
}
if(!loadSavedState()){
  loadFresh();
}

function logAudit(action, detail){
  STATE.auditLog.unshift({
    id: nextId.audit++,
    ts: new Date().toISOString(),
    user: STATE.currentUserId ? findEmployee(STATE.currentUserId).name : 'System',
    action, detail
  });
}

function findEmployee(id){ return STATE.employees.find(e => e.id === id); }
/* Employee roles. Only 'admin' gets the Administrator console — every other
   role shares the same Cashier/POS terminal, so new roles are safe to add
   here without touching access control anywhere else. */
const EMPLOYEE_ROLES = [
  {id:'admin', label:'Administrator', badge:'muted'},
  {id:'supervisor', label:'Supervisor', badge:'warn'},
  {id:'cashier', label:'Cashier', badge:'good'},
  {id:'staff', label:'Staff', badge:'good'},
  {id:'stock_clerk', label:'Stock Clerk', badge:'good'},
];
function roleLabel(roleId){
  const r = EMPLOYEE_ROLES.find(r=>r.id===roleId);
  return r ? r.label : roleId;
}
function roleBadgeHtml(roleId){
  const r = EMPLOYEE_ROLES.find(r=>r.id===roleId) || {label:roleId, badge:'good'};
  return `<span class="badge badge-${r.badge}">${r.label}</span>`;
}
function findProduct(id){ return STATE.products.find(p => p.id === id); }

/* ============================================================
   POS CATEGORIES (kiosk-style sidebar)
   Categories come from whatever's typed into a product's "Category"
   field — there's no separate category table to manage. categoryOrder
   just remembers the *display order* an admin dragged them into, and
   this keeps it in sync whenever products change: known categories
   keep their position, brand-new ones are appended to the end, and
   categories with no products left are dropped.
   ============================================================ */
function syncCategoryOrder(){
  const live = [...new Set(STATE.products.map(p => (p.category||'').trim()).filter(Boolean))];
  if(!Array.isArray(STATE.categoryOrder)) STATE.categoryOrder = [];
  STATE.categoryOrder = STATE.categoryOrder.filter(c => live.includes(c));
  live.forEach(c => { if(!STATE.categoryOrder.includes(c)) STATE.categoryOrder.push(c); });
  return STATE.categoryOrder;
}
function orderedCategories(){ return syncCategoryOrder(); }
/* A small fixed palette so each category reads as a distinct "section"
   (Food vs. Drinks vs. ...), cycling if there are more categories than
   colors. Picked to work in both light and dark theme. */
const CATEGORY_PALETTE = ['#0B6E4F','#B5541B','#1D5FA6','#8B3A9E','#B6862B','#2F8F7B','#C4472B','#5A6BAA'];
function categoryColor(catName){
  const cats = orderedCategories();
  const idx = cats.indexOf(catName);
  return CATEGORY_PALETTE[(idx < 0 ? 0 : idx) % CATEGORY_PALETTE.length];
}

/* ============================================================
   PRODUCT IMAGES
   Uploaded photos are resized/cropped client-side to a fixed square
   (cover-fit, no distortion) and stored as a compact base64 JPEG
   directly on the product record — so they persist through the same
   localStorage save/load path as everything else and need no server,
   keeping the app fully offline.
   ============================================================ */
/* Built-in default logo shown until an admin uploads a custom one under
   Settings → General. Kept as one shared constant instead of three copies. */
const DEFAULT_LOGO = "data:image/png;base64,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";
const PRODUCT_IMAGE_MAX_SIZE = 480;      // stored square size, px
const PRODUCT_IMAGE_JPEG_QUALITY = 0.82;
const PRODUCT_IMAGE_ACCEPTED_TYPES = ['image/jpeg','image/jpg','image/png','image/webp'];
const PRODUCT_IMAGE_MAX_UPLOAD_MB = 12;

function productImageHtml(p, containerClass){
  if(p && p.image){
    return `<div class="${containerClass}"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>`;
  }
  return `<div class="${containerClass} no-image"><span class="img-placeholder-icon">${icon('plate')}</span></div>`;
}

/* Reads a File, crops it to a centered square (cover-fit — the image is
   scaled so its shorter side fills the frame, then the overflow on the
   longer side is cropped away), and hands back a JPEG data URL. Never
   stretches or squashes the source image. */
function processProductImageFile(file, onDone){
  if(!PRODUCT_IMAGE_ACCEPTED_TYPES.includes(file.type)){
    showBanner('Please upload a JPG, PNG, or WEBP image.');
    return;
  }
  if(file.size > PRODUCT_IMAGE_MAX_UPLOAD_MB * 1024 * 1024){
    showBanner(`That image is too large. Please use a file under ${PRODUCT_IMAGE_MAX_UPLOAD_MB}MB.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const SIZE = PRODUCT_IMAGE_MAX_SIZE;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(SIZE/img.width, SIZE/img.height);
      const sw = SIZE/scale, sh = SIZE/scale;
      const sx = (img.width - sw)/2, sy = (img.height - sh)/2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE);
      onDone(canvas.toDataURL('image/jpeg', PRODUCT_IMAGE_JPEG_QUALITY));
    };
    img.onerror = () => showBanner('That file could not be read as an image.');
    img.src = e.target.result;
  };
  reader.onerror = () => showBanner('That file could not be read.');
  reader.readAsDataURL(file);
}
function currentUser(){ return findEmployee(STATE.currentUserId); }

function peso(n){
  return (STATE.currencySymbol||'₱') + Number(n||0).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function phDateParts(date){
  const parts = {};
  new Intl.DateTimeFormat('en-CA', {timeZone: PH_TZ, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false})
    .formatToParts(date).forEach(p => { if(p.type!=='literal') parts[p.type]=p.value; });
  return parts;
}
function phDateStr(date){
  const p = phDateParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}
function fmtDate(d){
  const dt = new Date(d);
  return dt.toLocaleDateString('en-PH', {year:'numeric', month:'short', day:'numeric', timeZone: PH_TZ});
}
function fmtDateTime(d){
  const dt = new Date(d);
  return dt.toLocaleString('en-PH', {year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', timeZone: PH_TZ});
}
function todayStr(){ return phDateStr(new Date()); }
function getVatRate(){ return STATE.vatEnabled ? (parseFloat(STATE.vatRate)||0)/100 : 0; }
function vatLabel(){ return STATE.vatEnabled ? `VAT (${STATE.vatRate}%)` : 'VAT (disabled)'; }

/* ============================================================
   UI HELPERS — this app runs inside sandboxed preview frames that
   block window.alert / confirm / prompt, so all of those are
   replaced with in-page equivalents below.
   ============================================================ */
function showBanner(message, type){
  type = type || 'error';
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => { el.remove(); }, 3800);
}
/* ============================================================
   ACTION GUARD
   Stops a rapid double-click (or an impatient triple-click) on a
   Save/Add/Confirm button from running the same commit action more
   than once. Since renders are synchronous, a fast second click can
   otherwise either re-run the handler or land on whatever button
   re-rendered into that same screen position — this closes both.
   Each guarded function gets its own cooldown clock, so clicking
   one guarded button doesn't block an unrelated one right after.
   ============================================================ */
function guardAction(fn){
  let lastCalledAt = 0;
  return function(...args){
    const now = Date.now();
    if(now - lastCalledAt < 300) return;
    lastCalledAt = now;
    return fn.apply(this, args);
  };
}
function showConfirm(message, onYes){
  window.__modalOnClose = null;
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="confirm-overlay">
      <div class="modal" style="max-width:380px;">
        <div class="modal-header"><h3>Please Confirm</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">${icon('close')}</button></div>
        <div class="modal-body"><div class="confirm-body">${message}</div></div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-danger" id="confirm-yes-btn">Yes, Continue</button>
        </div>
      </div>
    </div>`;
  document.getElementById('confirm-yes-btn').onclick = guardAction(() => { closeModal(); onYes(); });
  document.getElementById('confirm-overlay').addEventListener('click', (e)=>{ if(e.target.id==='confirm-overlay') closeModal(); });
}
function showPrompt(title, label, defaultValue, onSubmit, inputType){
  inputType = inputType || 'number';
  window.__modalOnClose = null;
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="prompt-overlay">
      <div class="modal" style="max-width:380px;">
        <div class="modal-header"><h3>${title}</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">${icon('close')}</button></div>
        <div class="modal-body">
          <div class="field"><label>${label}</label><input id="prompt-input" type="${inputType}" ${inputType==='number'?'min="1"':''} value="${defaultValue}"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" id="prompt-ok-btn">OK</button>
        </div>
      </div>
    </div>`;
  document.getElementById('prompt-ok-btn').onclick = guardAction(() => {
    const val = document.getElementById('prompt-input').value;
    closeModal();
    onSubmit(val);
  });
  document.getElementById('prompt-overlay').addEventListener('click', (e)=>{ if(e.target.id==='prompt-overlay') closeModal(); });
  setTimeout(() => { const i = document.getElementById('prompt-input'); if(i) i.focus(); }, 30);
}
let currentTheme = 'light';
const ACCENT_PRESETS = {
  green:  {label:'Green',  light:'#0B6E4F', lightDark:'#054A35', dark:'#2FBE8E', darkDark:'#1F8F6B'},
  blue:   {label:'Blue',   light:'#1D5FBF', lightDark:'#123E80', dark:'#5B9DFF', darkDark:'#3B7BE0'},
  purple: {label:'Purple', light:'#6A3FBF', lightDark:'#472A80', dark:'#B48CFF', darkDark:'#8F63E0'},
  orange: {label:'Orange', light:'#C1601A', lightDark:'#824010', dark:'#FFA55C', darkDark:'#E08A3B'},
  red:    {label:'Red',    light:'#B3261E', lightDark:'#7A1A14', dark:'#F2685C', darkDark:'#D9483C'}
};
function applyAccent(){
  const key = (STATE && STATE.uiSettings && STATE.uiSettings.accentColor) || 'green';
  const preset = ACCENT_PRESETS[key] || ACCENT_PRESETS.green;
  const root = document.documentElement;
  if(currentTheme === 'dark'){
    root.style.setProperty('--primary', preset.dark);
    root.style.setProperty('--primary-dark', preset.darkDark);
    root.style.removeProperty('--sidebar-bg'); // dark mode sidebar stays neutral gray regardless of accent
  } else {
    root.style.setProperty('--primary', preset.light);
    root.style.setProperty('--primary-dark', preset.lightDark);
    root.style.setProperty('--sidebar-bg', preset.lightDark);
  }
}
function applyTheme(theme){
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelectorAll('.theme-toggle-icon').forEach(el => { el.innerHTML = theme === 'dark' ? icon('moon') : icon('sun'); });
  applyAccent();
}
function toggleTheme(){
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  try{ localStorage.setItem(THEME_KEY, currentTheme); }catch(err){}
}

/* ---------------------------- AUTH ---------------------------- */
function handleLogin(){
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const errBox = document.getElementById('login-error');
  const emp = STATE.employees.find(e => e.username === u && e.password === p);
  if(!emp || !emp.active){
    errBox.textContent = !emp ? 'Incorrect username or password.' : 'This account has been deactivated. Contact your administrator.';
    errBox.classList.remove('hidden');
    return;
  }
  errBox.classList.add('hidden');
  STATE.currentUserId = emp.id;
  logAudit('Login', emp.username + ' logged in');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  if(emp.role === 'admin'){ setAdminTab('dashboard'); } else { setCashierTab('dashboard'); }
}
function handleLogout(){
  logAudit('Logout', currentUser().username + ' logged out');
  STATE.currentUserId = null;
  STATE.cart = [];
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  saveState();
}

/* ---------------------------- SIDEBAR / ROUTING ---------------------------- */
function toggleSidebarMobile(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-backdrop').classList.toggle('show');
}
function closeSidebarMobile(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('show');
}
let activeAdminTab = 'dashboard';
let activeCashierTab = 'dashboard';

function renderSidebar(){
  const u = currentUser();
  const sb = document.getElementById('sidebar');
  if(u.role === 'admin'){
    sb.innerHTML = `
      <div class="brand"><div class="mark"><img src="${STATE.storeLogo || DEFAULT_LOGO}" alt="Store logo" class="brand-logo-img"></div><div><b>${STATE.storeName}</b><span>Admin Console</span></div></div>
      <button class="nav-item ${navActive('dashboard')}" onclick="setAdminTab('dashboard')">${iconBtn('dashboard')} Dashboard</button>
      <div class="nav-section-label">Manage</div>
      <button class="nav-item ${navActive('employees')}" onclick="setAdminTab('employees')">${iconBtn('employees')} Employees</button>
      <button class="nav-item ${navActive('inventory')}" onclick="setAdminTab('inventory')">${iconBtn('inventory')} Inventory</button>
      ${STATE.uiSettings.adminModules.payroll ? `<button class="nav-item ${navActive('payroll')}" onclick="setAdminTab('payroll')">${iconBtn('payroll')} Payroll</button>` : ''}
      ${STATE.uiSettings.adminModules.finance ? `<button class="nav-item ${navActive('finance')}" onclick="setAdminTab('finance')">${iconBtn('finance')} Finance</button>` : ''}
      <div class="nav-section-label">Insights</div>
      ${STATE.uiSettings.adminModules.reports ? `<button class="nav-item ${navActive('reports')}" onclick="setAdminTab('reports')">${iconBtn('reports')} Reports</button>` : ''}
      ${STATE.uiSettings.adminModules.audit ? `<button class="nav-item ${navActive('audit')}" onclick="setAdminTab('audit')">${iconBtn('audit')} Audit Log</button>` : ''}
      <div class="nav-section-label">Configuration</div>
      <button class="nav-item ${navActive('settings')}" onclick="setAdminTab('settings')">${iconBtn('settings')} Settings</button>
      <div class="sidebar-footer">
        <div class="user-chip"><span class="dot"></span> ${u.name} · Admin</div>
        <button class="nav-item" onclick="handleLogout()">↩ Log Out</button>
      </div>`;
  } else {
    const status = clockStatusFor(u.id);
    sb.innerHTML = `
      <div class="brand"><div class="mark"><img src="${STATE.storeLogo || DEFAULT_LOGO}" alt="Store logo" class="brand-logo-img"></div><div><b>${STATE.storeName}</b><span>Cashier Terminal</span></div></div>
      <button class="nav-item ${navActiveCashier('dashboard')}" onclick="setCashierTab('dashboard')">${iconBtn('dashboard')} Dashboard</button>
      <button class="nav-item ${navActiveCashier('clock')}" onclick="setCashierTab('clock')">${iconBtn('clock')} Clock In / Out</button>
      <button class="nav-item ${navActiveCashier('sale')}" onclick="setCashierTab('sale')" ${status.clockedIn ? '' : 'disabled style="opacity:.5"'}>${iconBtn('newsale')} ${STATE.labels.newSaleBtn}</button>
      <button class="nav-item ${navActiveCashier('history')}" onclick="setCashierTab('history')">${iconBtn('history')} Sales History</button>
      <div class="sidebar-footer">
        <div class="user-chip"><span class="dot" style="background:${status.clockedIn?'#5FD98F':'#c9c9c9'}"></span> ${u.name} · ${status.clockedIn?'Clocked In':'Clocked Out'}</div>
        <button class="nav-item" onclick="handleLogout()">↩ Log Out</button>
      </div>`;
  }
}
function navActive(tab){ return activeAdminTab===tab ? 'active' : ''; }
function navActiveCashier(tab){ return activeCashierTab===tab ? 'active' : ''; }

function setAdminTab(tab){
  closeSidebarMobile();
  if(tab!=='settings'){ pmDraft = null; resetUnlocked = false; }
  const hideableModuleTabs = ['payroll','finance','reports','audit'];
  if(hideableModuleTabs.includes(tab) && !STATE.uiSettings.adminModules[tab]){
    tab = 'dashboard';
  }
  activeAdminTab = tab;
  renderSidebar();
  const titles = {dashboard:['Dashboard','Overview of your store performance'], employees:['Employee Management','Add, edit, and manage staff records'], inventory:['Inventory Management','Track stock and receive deliveries'], payroll:['Payroll Management','Compute, approve, and release pay'], finance:['Finance','Track expenses and see gross vs. net'], reports:['Reports','Business performance at a glance'], audit:['Audit Log','System activity trail'], settings:['Settings','Configure tax and store preferences']};
  document.getElementById('topbar-title').textContent = titles[tab][0];
  document.getElementById('topbar-sub').textContent = titles[tab][1];
  const c = document.getElementById('content');
  if(tab==='dashboard') c.innerHTML = viewDashboard();
  if(tab==='employees') c.innerHTML = viewEmployees();
  if(tab==='inventory') c.innerHTML = viewInventory();
  if(tab==='payroll') c.innerHTML = viewPayroll();
  if(tab==='finance') c.innerHTML = viewFinance();
  if(tab==='reports') c.innerHTML = viewReports();
  if(tab==='audit') c.innerHTML = viewAudit();
  if(tab==='settings') c.innerHTML = viewSettings();
  animateContentIn(c);
  saveState();
}
function setCashierTab(tab){
  closeSidebarMobile();
  const status = clockStatusFor(currentUser().id);
  if(tab==='sale' && !status.clockedIn){ tab = 'clock'; }
  activeCashierTab = tab;
  renderSidebar();
  const titles = {dashboard:['Dashboard','Your shift and store overview'], clock:['Time Clock','Record your shift attendance'], sale:[STATE.labels.newSaleBtn,'Ring up a transaction'], history:['Sales History','Your recorded transactions']};
  document.getElementById('topbar-title').textContent = titles[tab][0];
  document.getElementById('topbar-sub').textContent = titles[tab][1];
  const c = document.getElementById('content');
  if(tab==='dashboard') c.innerHTML = viewCashierDashboard();
  if(tab==='clock') c.innerHTML = viewClock();
  if(tab==='sale') c.innerHTML = viewSale();
  if(tab==='history') c.innerHTML = viewHistory();
  animateContentIn(c);
  saveState();
}
function animateContentIn(el){
  el.classList.remove('fade-in');
  void el.offsetWidth; // force reflow so the animation restarts on every tab switch
  el.classList.add('fade-in');
}

/* ============================================================
   ADMIN — EMPLOYEES
   ============================================================ */
function viewEmployees(){
  const rows = STATE.employees.map(e => `
    <tr>
      <td><b>${e.name}</b><br><span class="progress-note">@${e.username}</span></td>
      <td>${e.position}</td>
      <td>${roleBadgeHtml(e.role)}</td>
      <td>${e.salaryType==='hourly' ? peso(e.rate)+' /hr' : peso(e.rate)+' /mo'}</td>
      <td>${e.schedule}</td>
      <td>${e.active ? '<span class="badge badge-good">Active</span>' : '<span class="badge badge-bad">Inactive</span>'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEmployeeModal(${e.id})">Edit</button>
        ${e.role!=='admin' ? `<button class="btn ${e.active?'btn-danger':'btn-primary'} btn-sm" onclick="toggleEmployeeActive(${e.id})">${e.active?'Deactivate':'Activate'}</button>` : ''}
        ${e.role!=='admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteEmployee(${e.id})">Delete</button>` : ''}
      </td>
    </tr>`).join('');
  return `
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openEmployeeModal(null)">+ Add Employee</button>
    </div>
    <div class="card">
      <div class="card-body pad0">
        <table>
          <thead><tr><th>Name</th><th>Position</th><th>Role</th><th>Rate</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="7" class="empty-state">No employees yet.</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;
}
function openEmployeeModal(id){
  const e = id ? findEmployee(id) : null;
  const body = `
    <div class="form-grid">
      <div class="field full"><label>Full Name</label><input id="f-name" value="${e?e.name:''}"></div>
      <div class="field"><label>Username</label><input id="f-username" value="${e?e.username:''}" ${e?'':''}></div>
      <div class="field"><label>Password</label><input id="f-password" type="text" value="${e?e.password:''}" placeholder="Set password"></div>
      <div class="field"><label>Role</label>
        <select id="f-role">
          ${EMPLOYEE_ROLES.map(r => `<option value="${r.id}" ${(e?e.role:'cashier')===r.id?'selected':''}>${r.label}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Position</label><input id="f-position" value="${e?e.position:'Cashier'}"></div>
      <div class="field"><label>Salary Type</label>
        <select id="f-salarytype">
          <option value="hourly" ${e&&e.salaryType==='hourly'?'selected':''}>Hourly</option>
          <option value="monthly" ${e&&e.salaryType==='monthly'?'selected':''}>Monthly</option>
        </select>
      </div>
      <div class="field"><label>Rate (₱)</label><input id="f-rate" type="number" min="0" step="0.01" value="${e?e.rate:75}"></div>
      <div class="field"><label>Work Schedule</label><input id="f-schedule" value="${e?e.schedule:'8:00 AM – 5:00 PM'}"></div>
    </div>
    <p class="helptext">Only the <b>Administrator</b> role gets access to the admin console (Inventory, Payroll, Settings, etc). Every other role — Supervisor, Cashier, Staff, Stock Clerk — uses the same cashier/POS terminal.</p>`;
  showModal(e ? 'Edit Employee' : 'Add Employee', body, () => saveEmployee(id));
}
function saveEmployee(id){
  const name = document.getElementById('f-name').value.trim();
  const username = document.getElementById('f-username').value.trim();
  const password = document.getElementById('f-password').value;
  const role = document.getElementById('f-role').value;
  const position = document.getElementById('f-position').value.trim();
  const salaryType = document.getElementById('f-salarytype').value;
  const rate = parseFloat(document.getElementById('f-rate').value) || 0;
  const schedule = document.getElementById('f-schedule').value.trim();
  if(!name || !username || !password){ showBanner('Name, username, and password are required.'); return; }
  const existing = id ? findEmployee(id) : null;
  const passwordChanged = !existing || existing.password !== password;
  const minLen = STATE.securitySettings.minPasswordLength || 4;
  if(passwordChanged && password.length < minLen){ showBanner(`Password must be at least ${minLen} characters.`); return; }
  const dup = STATE.employees.find(e => e.username===username && e.id!==id);
  if(dup){ showBanner('That username is already taken.'); return; }
  if(existing && existing.role==='admin' && role!=='admin'){
    const otherActiveAdmins = STATE.employees.filter(e => e.role==='admin' && e.active && e.id!==id).length;
    if(otherActiveAdmins===0){ showBanner("You can't remove the last active Administrator."); return; }
  }
  if(id){
    const e = findEmployee(id);
    Object.assign(e, {name, username, password, role, position, salaryType, rate, schedule});
    logAudit('Employee Updated', `${name} (${roleLabel(role)})`);
    closeModal();
    setAdminTab('employees');
  } else {
    closeModal();
    showConfirm(`Add "${name}" as ${roleLabel(role)} with username "${username}"?`, () => {
      const e = {id: nextId.emp++, username, password, name, role, position, salaryType, rate, schedule, active:true};
      STATE.employees.push(e);
      logAudit('Employee Added', `${name} (${roleLabel(role)})`);
      showBanner('Employee added.', 'success');
      setAdminTab('employees');
    });
  }
}
function toggleEmployeeActive(id){
  const e = findEmployee(id);
  const willActivate = !e.active;
  showConfirm(`${willActivate?'Activate':'Deactivate'} "${e.name}"? ${willActivate ? 'They will be able to log in again.' : 'They will no longer be able to log in, but their records are kept.'}`, () => {
    e.active = willActivate;
    logAudit(e.active?'Employee Activated':'Employee Deactivated', e.name);
    showBanner(`${e.name} ${e.active?'activated':'deactivated'}.`, 'success');
    setAdminTab('employees');
  });
}
function deleteEmployee(id){
  const e = findEmployee(id);
  const hasHistory = STATE.sales.some(s=>s.employeeId===id) || STATE.attendance.some(a=>a.employeeId===id) || STATE.payroll.some(p=>p.employeeId===id);
  if(hasHistory){
    showBanner(`"${e.name}" has sales, attendance, or payroll history and can't be deleted. Deactivate instead to keep records intact.`);
    return;
  }
  showConfirm(`Delete "${e.name}"? This cannot be undone.`, () => {
    STATE.employees = STATE.employees.filter(x=>x.id!==id);
    logAudit('Employee Deleted', e.name);
    setAdminTab('employees');
  });
}

/* ============================================================
   ADMIN — INVENTORY
   ============================================================ */
let invFilters = { search:'', category:'', status:'', sort:'stock-asc' };
function updateInventoryFilter(patch){
  Object.assign(invFilters, patch);
  const active = document.activeElement;
  const wasSearch = active && active.id === 'inv-search';
  const cursorPos = wasSearch ? active.selectionStart : null;
  setAdminTab('inventory');
  if(wasSearch){
    const el = document.getElementById('inv-search');
    if(el){ el.focus(); el.setSelectionRange(cursorPos, cursorPos); }
  }
}
function resetInventoryFilters(){
  invFilters = { search:'', category:'', status:'', sort:'stock-asc' };
  setAdminTab('inventory');
}
function viewInventory(){
  const low = STATE.products.filter(p => p.trackStock!==false && p.stock <= p.lowStock);

  /* ---- Low stock spotlight: a single always-visible restock checklist,
     worst shortage first, so nothing needs to be hunted for in the table. ---- */
  const lowSorted = low.slice().sort((a,b) => (a.stock/Math.max(a.lowStock,1)) - (b.stock/Math.max(b.lowStock,1)));
  const spotlightRows = lowSorted.map(p => {
    const isOut = p.stock <= 0;
    const pct = p.lowStock>0 ? Math.max(4, Math.min(100, Math.round((p.stock/p.lowStock)*100))) : (isOut?4:100);
    return `
    <div class="lowstock-row ${isOut?'out':''}">
      <div class="ls-stockbar"><span style="width:${pct}%;"></span></div>
      <div class="ls-info" style="flex:1;">
        <b>${p.name}</b>
        <span class="ls-meta">${p.category} · ${isOut ? '<span class="ls-out">Out of stock</span>' : `${p.stock} left · reorder at ${p.lowStock}`}</span>
      </div>
      <button class="btn btn-primary btn-sm" onclick="receiveDelivery(${p.id})">+ Receive</button>
    </div>`;
  }).join('');

  /* ---- Main table: searchable / filterable / sortable for general browsing ---- */
  const categories = [...new Set(STATE.products.map(p=>p.category))].sort();
  let list = STATE.products.slice();
  if(invFilters.search){
    const q = invFilters.search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if(invFilters.category){
    list = list.filter(p => p.category === invFilters.category);
  }
  if(invFilters.status==='low'){ list = list.filter(p => p.trackStock!==false && p.stock <= p.lowStock); }
  else if(invFilters.status==='ok'){ list = list.filter(p => p.trackStock===false || p.stock > p.lowStock); }
  const sorters = {
    'stock-asc': (a,b) => (a.trackStock===false?Infinity:a.stock) - (b.trackStock===false?Infinity:b.stock),
    'stock-desc': (a,b) => (b.trackStock===false?-1:b.stock) - (a.trackStock===false?-1:a.stock),
    'name': (a,b) => a.name.localeCompare(b.name),
    'category': (a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  };
  list.sort(sorters[invFilters.sort] || sorters.name);

  const rows = list.map(p => {
    const isLow = p.trackStock!==false && p.stock<=p.lowStock;
    return `
    <tr class="${isLow?'row-low':''}">
      <td>${p.image
        ? `<div class="inv-thumb" onclick="previewProductImage(${p.id})" title="Click to preview"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>`
        : `<div class="inv-thumb no-image"><span class="img-placeholder-icon">${icon('plate')}</span></div>`}</td>
      <td><b>${p.name}</b></td>
      <td>${p.category}</td>
      <td class="num">${p.trackCost===false ? '<span class="helptext" style="margin:0;">Not tracked</span>' : peso(p.cost||0)}</td>
      <td class="num">${peso(p.price)}</td>
      <td class="num">${p.trackStock===false ? '<span class="helptext" style="margin:0;">Not tracked</span>' : p.stock}</td>
      <td>${p.trackStock===false ? '<span class="badge badge-muted">Not Tracked</span>' : (isLow ? '<span class="badge badge-bad">Low Stock</span>' : '<span class="badge badge-good">OK</span>')}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openProductModal(${p.id})">Edit</button>
        ${p.trackStock!==false ? `<button class="btn btn-outline btn-sm" onclick="receiveDelivery(${p.id})">+ Receive</button>` : ''}
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');

  const categoryOptions = categories.map(c => `<option value="${c}" ${invFilters.category===c?'selected':''}>${c}</option>`).join('');
  const filtersActive = invFilters.search || invFilters.category || invFilters.status;

  return `
    <div class="stat-row">
      <div class="stat"><div class="label">Total SKUs</div><div class="value">${STATE.products.length}</div></div>
      <div class="stat ${low.length?'warn':'good'}"><div class="label">Low Stock Items</div><div class="value">${low.length}</div></div>
      <div class="stat good"><div class="label">Inventory Value</div><div class="value">${peso(STATE.products.reduce((s,p)=>s+(p.trackStock===false?0:p.price*p.stock),0))}</div></div>
    </div>

    ${low.length ? `
    <div class="card lowstock-card">
      <div class="card-header"><h3>${iconBtn('warning')} Needs Restocking (${low.length})</h3></div>
      <div class="lowstock-list">${spotlightRows}</div>
    </div>` : ''}

    <div class="toolbar">
      <input type="text" id="inv-search" placeholder="Search product or category…" value="${invFilters.search}" oninput="updateInventoryFilter({search:this.value})">
      <select onchange="updateInventoryFilter({category:this.value})">
        <option value="">All Categories</option>
        ${categoryOptions}
      </select>
      <select onchange="updateInventoryFilter({status:this.value})">
        <option value="" ${invFilters.status===''?'selected':''}>All Status</option>
        <option value="low" ${invFilters.status==='low'?'selected':''}>Low Stock Only</option>
        <option value="ok" ${invFilters.status==='ok'?'selected':''}>OK Only</option>
      </select>
      <select onchange="updateInventoryFilter({sort:this.value})">
        <option value="stock-asc" ${invFilters.sort==='stock-asc'?'selected':''}>Sort: Stock (Low→High)</option>
        <option value="stock-desc" ${invFilters.sort==='stock-desc'?'selected':''}>Sort: Stock (High→Low)</option>
        <option value="name" ${invFilters.sort==='name'?'selected':''}>Sort: Name (A→Z)</option>
        <option value="category" ${invFilters.sort==='category'?'selected':''}>Sort: Category</option>
      </select>
      ${filtersActive ? `<button class="btn btn-ghost" onclick="resetInventoryFilters()">Clear Filters</button>` : ''}
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openProductModal(null)">+ Add Product</button>
    </div>
    <div class="card"><div class="card-body pad0">
      <table>
        <thead><tr><th>Image</th><th>Product</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="8" class="empty-state">No products match your filters.</td></tr>`}</tbody>
      </table>
    </div></div>`;
}
let pendingProductImage = null;
function openProductModal(id){
  const p = id ? findProduct(id) : null;
  pendingProductImage = p ? (p.image || null) : null;
  const body = `
    <div class="form-grid">
      <div class="field full">
        <label>Product Image</label>
        <div class="image-upload-row">
          <div id="f-pimage-preview">${productImageHtml({image:pendingProductImage, name:p?p.name:'Product'}, 'image-preview')}</div>
          <div class="image-upload-actions">
            <label class="btn btn-outline btn-sm image-upload-btn">
              ${iconBtn('camera')} Upload Image
              <input type="file" id="f-pimage-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display:none;" onchange="handleProductImageSelect(event)">
            </label>
            <button type="button" class="btn btn-outline btn-sm" id="f-pimage-remove-btn" onclick="removeProductImage()" style="${pendingProductImage ? '' : 'display:none;'}">${iconBtn('trash')} Remove Image</button>
            <div class="helptext">JPG, PNG, or WEBP. Automatically cropped to a square — nothing gets stretched.</div>
          </div>
        </div>
      </div>
      <div class="field full"><label>Product Name</label><input id="f-pname" value="${p?p.name:''}"></div>
      <div class="field"><label>Category</label><input id="f-pcat" value="${p?p.category:'Grocery'}"></div>
      <div class="field"><label>Selling Price (₱)</label><input id="f-pprice" type="number" min="0" step="0.01" value="${p?p.price:0}"></div>
      <div class="field full" style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);padding:10px 12px;border-radius:7px;">
        <label style="margin:0;">Track cost for this product</label>
        <label class="switch"><input type="checkbox" id="f-ptrackcost" ${(!p || p.trackCost!==false) ? 'checked' : ''} onchange="toggleProductCostField()"><span class="slider"></span></label>
      </div>
      <div class="field" id="f-pcost-wrap" style="${(!p || p.trackCost!==false) ? '' : 'display:none;'}"><label>Cost Price (₱)</label><input id="f-pcost" type="number" min="0" step="0.01" value="${p?(p.cost||0):0}"></div>
      <div class="field full helptext" id="f-pcost-note" style="margin:-8px 0 0;${(!p || p.trackCost!==false) ? 'display:none;' : ''}">No cost tracked for this item — record its cost separately under Finance → Expenses. It won't count toward Cost of Goods Sold.</div>

      <div class="field full" style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);padding:10px 12px;border-radius:7px;margin-top:8px;">
        <label style="margin:0;">Track stock for this product</label>
        <label class="switch"><input type="checkbox" id="f-ptrackstock" ${(!p || p.trackStock!==false) ? 'checked' : ''} onchange="toggleProductStockField()"><span class="slider"></span></label>
      </div>
      <div class="field" id="f-pstock-wrap" style="${(!p || p.trackStock!==false) ? '' : 'display:none;'}"><label>Current Stock</label><input id="f-pstock" type="number" min="0" value="${p?p.stock:0}"></div>
      <div class="field" id="f-plow-wrap" style="${(!p || p.trackStock!==false) ? '' : 'display:none;'}"><label>Low Stock Threshold</label><input id="f-plow" type="number" min="0" value="${p?p.lowStock:STATE.lowStockDefaultThreshold}"></div>
      <div class="field full helptext" id="f-pstock-note" style="margin:-8px 0 0;${(!p || p.trackStock!==false) ? 'display:none;' : ''}">No stock tracked for this item — it will always be available to sell (e.g. loose rice, sacks weighed at checkout) and won't appear in low-stock alerts.</div>
    </div>`;
  showModal(p ? 'Edit Product' : 'Add Product', body, () => saveProduct(id));
}
function toggleProductCostField(){
  const on = document.getElementById('f-ptrackcost').checked;
  document.getElementById('f-pcost-wrap').style.display = on ? '' : 'none';
  document.getElementById('f-pcost-note').style.display = on ? 'none' : '';
}
function toggleProductStockField(){
  const on = document.getElementById('f-ptrackstock').checked;
  document.getElementById('f-pstock-wrap').style.display = on ? '' : 'none';
  document.getElementById('f-plow-wrap').style.display = on ? '' : 'none';
  document.getElementById('f-pstock-note').style.display = on ? 'none' : '';
}
function handleProductImageSelect(evt){
  const file = evt.target.files[0];
  evt.target.value = '';
  if(!file) return;
  processProductImageFile(file, (dataUrl) => {
    pendingProductImage = dataUrl;
    document.getElementById('f-pimage-preview').innerHTML = productImageHtml({image:pendingProductImage, name:'Product'}, 'image-preview');
    const removeBtn = document.getElementById('f-pimage-remove-btn');
    if(removeBtn) removeBtn.style.display = '';
  });
}
function removeProductImage(){
  pendingProductImage = null;
  document.getElementById('f-pimage-preview').innerHTML = productImageHtml({image:null, name:'Product'}, 'image-preview');
  const removeBtn = document.getElementById('f-pimage-remove-btn');
  if(removeBtn) removeBtn.style.display = 'none';
}
function previewProductImage(id){
  const p = findProduct(id);
  if(!p || !p.image) return;
  showModal(p.name, `<div class="image-preview-large"><img src="${p.image}" alt="${p.name}"></div>`, null, 'Close');
}
function saveProduct(id){
  const name = document.getElementById('f-pname').value.trim();
  const category = document.getElementById('f-pcat').value.trim();
  const trackCost = document.getElementById('f-ptrackcost').checked;
  const trackStock = document.getElementById('f-ptrackstock').checked;
  const cost = trackCost ? (parseFloat(document.getElementById('f-pcost').value) || 0) : 0;
  const price = parseFloat(document.getElementById('f-pprice').value) || 0;
  const stock = trackStock ? (parseInt(document.getElementById('f-pstock').value) || 0) : 0;
  const lowStock = trackStock ? (parseInt(document.getElementById('f-plow').value) || 0) : 0;
  const image = pendingProductImage;
  if(!name){ showBanner('Product name is required.'); return; }
  if(id){
    Object.assign(findProduct(id), {name, category, cost, price, stock, lowStock, image, trackCost, trackStock});
    logAudit('Product Updated', name);
  } else {
    STATE.products.push({id: nextId.prod++, name, category, cost, price, stock, lowStock, image, trackCost, trackStock});
    logAudit('Product Added', name);
  }
  closeModal();
  setAdminTab('inventory');
}
function receiveDelivery(id){
  const p = findProduct(id);
  if(p.trackStock===false){ showBanner('Stock isn\'t tracked for this product.'); return; }
  showPrompt('Receive Delivery', `Quantity received for "${p.name}"`, 10, (qty) => {
    const n = parseInt(qty);
    if(!n || n<=0){ showBanner('Enter a valid quantity.'); return; }
    p.stock += n;
    logAudit('Delivery Received', `${p.name} +${n} units`);
    setAdminTab('inventory');
  });
}
function deleteProduct(id){
  const p = findProduct(id);
  showConfirm(`Delete "${p.name}"? This cannot be undone.`, () => {
    STATE.products = STATE.products.filter(x => x.id !== id);
    logAudit('Product Deleted', p.name);
    setAdminTab('inventory');
  });
}

/* ============================================================
   ADMIN — PAYROLL
   ============================================================ */
function viewPayroll(){
  const rows = STATE.payroll.slice().reverse().map(pr => {
    const emp = findEmployee(pr.employeeId);
    return `<tr>
      <td>${emp?emp.name:'—'}</td>
      <td>${fmtDate(pr.start)} – ${fmtDate(pr.end)}</td>
      <td class="num">${pr.hoursWorked.toFixed(1)}</td>
      <td class="num">${peso(pr.netPay)}</td>
      <td>${statusBadge(pr.status)}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-outline btn-sm" onclick="viewPayslip(${pr.id})">Payslip</button>
        ${pr.status!=='Released' ? `<button class="btn btn-outline btn-sm" onclick="editPayrollModal(${pr.id})">Edit</button>` : ''}
        ${pr.status==='Pending' ? `<button class="btn btn-primary btn-sm" onclick="approvePayroll(${pr.id})">Approve</button>` : ''}
        ${pr.status==='Approved' ? `<button class="btn btn-outline btn-sm" onclick="disapprovePayroll(${pr.id})">Disapprove</button>` : ''}
        ${pr.status==='Approved' ? `<button class="btn btn-primary btn-sm" onclick="releasePayroll(${pr.id})">Release</button>` : ''}
        <button class="btn btn-danger btn-sm" onclick="deletePayroll(${pr.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');
  return `
    <div class="card">
      <div class="card-header"><h3>Generate Payroll</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Employee</label>
            <select id="pr-employee">
              ${STATE.employees.filter(e=>e.role!=='admin').map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Period Start</label><input type="date" id="pr-start" value="${todayStr()}"></div>
          <div class="field"><label>Period End</label><input type="date" id="pr-end" value="${todayStr()}"></div>
          <div class="field"><label>Overtime Hours</label><input type="number" id="pr-ot" min="0" step="0.5" value="0"></div>
          <div class="field"><label>Bonus (₱)</label><input type="number" id="pr-bonus" min="0" step="0.01" value="0"></div>
          <div class="field"><label>Loan Deduction (₱)</label><input type="number" id="pr-loan" min="0" step="0.01" value="0"></div>
        </div>
        <p class="helptext">Hours worked and sales/commission are pulled automatically from Attendance and POS records for the selected period. Tax is withheld at ${STATE.taxWithholdingRate}% of gross pay. Commission is ${STATE.commissionRate}% of the employee's sales for the period. These rates can be changed in Settings.</p>
        <button class="btn btn-primary" onclick="generatePayroll()">Calculate Payroll</button>
      </div>
    </div>
    <div class="card"><div class="card-header"><h3>Payroll Records</h3></div><div class="card-body pad0">
      <table>
        <thead><tr><th>Employee</th><th>Period</th><th>Hours</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="empty-state">No payroll runs yet.</td></tr>`}</tbody>
      </table>
    </div></div>`;
}
function showHelpModal(title, bodyHtml){
  showModal(title, `<div style="max-height:62vh;overflow-y:auto;padding-right:4px;font-size:12.5px;">${bodyHtml}</div>`, null, 'Close');
}
function showCurrentPageHelp(){
  const u = currentUser();
  if(!u) return;
  if(u.role === 'admin'){
    const map = {
      dashboard: showDashboardHelpModal, employees: showEmployeesHelpModal,
      inventory: showInventoryHelpModal, payroll: showPayrollHelpModal,
      finance: showFinanceHelpModal, reports: showReportsHelpModal,
      audit: showAuditHelpModal, settings: showSettingsHelpModal,
    };
    (map[activeAdminTab] || showDashboardHelpModal)();
  } else {
    const map = {
      dashboard: showPosDashboardHelpModal, clock: showClockHelpModal,
      sale: showSaleHelpModal, history: showHistoryHelpModal,
    };
    (map[activeCashierTab] || showPosDashboardHelpModal)();
  }
}
function showDashboardHelpModal(){
  showHelpModal('How the Dashboard Works', `
    <p>This is your live overview of the whole store. Every number here is calculated automatically from real records — nothing is entered manually.</p>
    <p><b>Stat cards</b> — today's sales/transactions, this week's sales, all-time sales, low stock alerts, staff currently clocked in, and pending payroll runs.</p>
    <p><b>Sales — Last 7 Days</b> — a bar per day, with today highlighted, so you can spot trends at a glance.</p>
    <p><b>Top Products This Week</b> — ranked by revenue for the current week.</p>
    <p><b>Recent Sales / Recent Activity</b> — the newest transactions and the newest audit-logged actions, so you can see what's changed without opening the Audit Log.</p>`);
}
function showEmployeesHelpModal(){
  showHelpModal('How Employee Management Works', `
    <p><b>Roles</b> — only <b>Administrator</b> gets access to this admin console. Every other role (Supervisor, Cashier, Staff, Stock Clerk) uses the identical Cashier/POS terminal — the role label is mainly for your own records and payroll reporting.</p>
    <p><b>Adding an employee</b> asks you to confirm before it's created. You'll set their username, password, role, position, pay rate, and schedule.</p>
    <p><b>Deactivate</b> hides an employee from login without deleting their sales/attendance/payroll history — use this over Delete whenever possible. <b>Delete</b> permanently removes the record and can't be undone.</p>
    <p>The Administrator role can't be demoted or removed if they're the last active admin — that's a safety net so you can never lock yourself out.</p>`);
}
function showInventoryHelpModal(){
  showHelpModal('How Inventory Works', `
    <p><b>Needs Restocking</b> — appears automatically whenever a product's stock falls at or below its reorder threshold, worst-first, with a one-tap Receive button.</p>
    <p><b>Search, filter, sort</b> — narrow the table by name/category, status, or sort by stock level.</p>
    <p><b>Product photos</b> — upload a JPG, PNG, or WEBP under Edit/Add Product; it's automatically cropped to a square so nothing gets stretched. Click any thumbnail to preview it full-size.</p>
    <p><b>+ Receive</b> adds stock from a delivery. Editing stock directly (via Edit) overwrites the count — use Receive for day-to-day restocking so the change is clearly a delivery, not a correction.</p>`);
}
function showFinanceHelpModal(){
  showHelpModal('How Finance Works', `
    <p>Tracks business expenses — rent, utilities, supplies, and anything else that isn't inventory purchases already reflected in product cost.</p>
    <p><b>+ Add Expense</b> logs a new one with a category, description, and amount.</p>
    <p><b>Gross vs. Net</b> — Gross is total sales revenue; Net subtracts recorded expenses and released payroll, giving a more realistic picture of profitability.</p>
    <p>VAT collected on sales is shown separately and excluded from revenue, since it's money held for remittance, not income.</p>`);
}
function showReportsHelpModal(){
  showHelpModal('How Reports Works', `
    <p><b>Sales vs. Expenses</b> — switch between Daily (last 7 days), Weekly (last 6 weeks), or Monthly (last 6 months) to spot trends at whatever zoom level you need.</p>
    <p><b>Top Selling Products / Employee Performance</b> — ranked by revenue, all-time.</p>
    <p><b>Low Stock Report</b> — every product currently at or below its reorder threshold.</p>
    <p><b>Commission / Payroll / Attendance Reports</b> — pulled directly from generated payroll runs and attendance records, so they always match what Payroll shows.</p>
    <p>Need a spreadsheet copy of any single page's raw data? Use Settings → Security & Data → Export by Page (CSV).</p>`);
}
function showAuditHelpModal(){
  showHelpModal('How the Audit Log Works', `
    <p>Every meaningful action in Insane is recorded here automatically — logins/logouts, sales (including edits to past sales and who authorized them), inventory and employee changes, payroll actions, settings changes, and data resets.</p>
    <p>Each entry shows <b>when</b> it happened, <b>who</b> did it, and a short <b>detail</b> of what changed. Use the filters to narrow by date, time, or keyword.</p>
    <p>This log can't be edited — it's your permanent record of what happened on this device.</p>`);
}
function showSettingsHelpModal(){
  showHelpModal('How Settings Works', `
    <p><b>General</b> — store name, address, phone, currency symbol.</p>
    <p><b>Tax (VAT)</b> and <b>Payroll</b> — the rates used in checkout tax and payroll calculations. Changing these only affects new sales/payroll runs, not past ones.</p>
    <p><b>Inventory</b> — default low-stock threshold for new products.</p>
    <p><b>POS & Labels</b> — the payment methods shown at checkout, and custom text for key buttons.</p>
    <p><b>Categories</b> — drag to reorder the category sidebar shown in New Sale (Food, Drinks, etc.) — new categories from Inventory show up here automatically.</p>
    <p><b>Appearance & Modules</b> — accent color, what shows on POS product tiles, and which admin sidebar sections are visible.</p>
    <p><b>Security & Data</b> — auto-logout, password rules, storage usage, and all export/import/reset controls.</p>
    <p><b>Receipts</b> — footer message, paper width, and whether your address/phone print on receipts.</p>`);
}
function showPosDashboardHelpModal(){
  showHelpModal('How Your Dashboard Works', `
    <p>This is the first thing you see after logging in — a quick view of your own performance and the store's stock.</p>
    <p><b>Today vs. Yesterday</b> — compares your sales so you can tell at a glance whether you're outperforming your last shift.</p>
    <p><b>Stock by Category</b> and the <b>product table</b> below are store-wide (not just your sales) so you can quickly check what's available before promising something to a customer.</p>`);
}
function showClockHelpModal(){
  showHelpModal('How Time Clock Works', `
    <p>Tap <b>Clock In</b> at the start of your shift and <b>Clock Out</b> at the end. Your hours for the day appear in Today's Attendance below.</p>
    <p>You must be clocked in before <b>New Sale</b> becomes available — this keeps every sale tied to whoever is actually on shift, which is what payroll commission is calculated from.</p>`);
}
function showSaleHelpModal(){
  showHelpModal('How New Sale Works', `
    <p>Pick a category from the sidebar on the left (or search) to browse, then tap a product card to add it — no need to keep an eye on a cart panel while you're choosing items.</p>
    <p>The bar at the bottom shows how many items and how much so far. Tap <b>View Order</b> on it when you're ready to review the order, adjust quantities, apply a discount, or remove items.</p>
    <p>From there, choose a payment method (set up by your admin under Settings → POS & Labels), enter cash tendered if paying Cash, then tap <b>Process Payment</b> to complete the sale and print a receipt.</p>
    <p>An admin can reorder the category sidebar under Settings → Categories — just drag a category by its ⠿ handle.</p>
    <p>Made a mistake after completing a sale? An admin can correct it from Sales History — see the Sales History help for details.</p>`);
}
function showHistoryHelpModal(){
  showHelpModal('How Sales History Works', `
    <p>Lists every sale you've personally processed, most recent first, with your running totals and a breakdown by payment method (handy for reconciling your cash drawer at end of shift).</p>
    <p><b>Correcting a sale</b> — tap Edit on any sale. You'll need an administrator's password to authorize the change. Once verified, you can fix the product, quantity, or payment method — stock adjusts automatically.</p>
    <p>Edited sales are highlighted and show exactly what changed, right in the table, so it's always clear a correction was made — and it's recorded in the Audit Log too.</p>`);
}
function showPayrollHelpModal(){
  const body = `
    <div style="max-height:62vh;overflow-y:auto;padding-right:4px;">
      <h3 style="margin-top:0;font-size:14.5px;">1. Pick an employee and a date range</h3>
      <p class="helptext" style="font-size:12.5px;">Only Administrators are excluded — every other role (Supervisor, Cashier, Staff, Stock Clerk) can appear here.</p>

      <h3 style="font-size:14.5px;">2. Hours &amp; sales are pulled automatically</h3>
      <p class="helptext" style="font-size:12.5px;">Insane totals up that employee's Clock In/Out records and completed POS sales that fall inside the period you chose. You don't enter these by hand — only <b>Overtime Hours</b>, <b>Bonus</b>, and <b>Loan Deduction</b> are manual inputs.</p>

      <h3 style="font-size:14.5px;">3. How each number is calculated</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:10px;">
        <tbody>
          <tr><td style="padding:4px 8px 4px 0;white-space:nowrap;"><b>Regular Pay</b></td><td style="padding:4px 0;">Hourly staff: hours worked × hourly rate. Monthly-salary staff: the full monthly rate, regardless of hours.</td></tr>
          <tr><td style="padding:4px 8px 4px 0;white-space:nowrap;"><b>Overtime Pay</b></td><td style="padding:4px 0;">Overtime hours × hourly rate × the overtime multiplier (Settings → Payroll). Salaried employees don't get overtime pay here.</td></tr>
          <tr><td style="padding:4px 8px 4px 0;white-space:nowrap;"><b>Commission</b></td><td style="padding:4px 0;">This employee's total POS sales for the period × the commission rate (Settings → Payroll).</td></tr>
          <tr><td style="padding:4px 8px 4px 0;white-space:nowrap;"><b>Gross Pay</b></td><td style="padding:4px 0;">Regular Pay + Overtime Pay + Commission + Bonus.</td></tr>
          <tr><td style="padding:4px 8px 4px 0;white-space:nowrap;"><b>Tax Withheld</b></td><td style="padding:4px 0;">Gross Pay × the tax withholding rate (Settings → Payroll).</td></tr>
          <tr><td style="padding:4px 8px 4px 0;white-space:nowrap;"><b>Net Pay</b></td><td style="padding:4px 0;">Gross Pay − Tax Withheld − Loan Deduction. This is the take-home amount.</td></tr>
        </tbody>
      </table>
      <p class="helptext" style="font-size:12.5px;">Changing the rates in Settings only affects payroll you calculate <i>after</i> the change — runs you've already generated keep the rates that were active at the time, so past payslips never change retroactively.</p>

      <h3 style="font-size:14.5px;">4. Status flow</h3>
      <p class="helptext" style="font-size:12.5px;"><b>Pending</b> → just calculated, can still be edited or deleted. <b>Approved</b> → reviewed and signed off; can be edited, sent back to Pending (Disapprove), or moved to Released. <b>Released</b> → marked as actually paid out; can no longer be edited, only deleted if entered in error (deleting does not reverse a real payment).</p>
      <p class="helptext" style="font-size:12.5px;">Use <b>Edit</b> on a Pending or Approved run to correct overtime hours, bonus, or loan deduction if something was calculated wrong — pay recalculates automatically.</p>
    </div>`;
  showModal('How Payroll Works', body, null, 'Close');
}
function statusBadge(s){
  if(s==='Released') return '<span class="badge badge-good">Released</span>';
  if(s==='Approved') return '<span class="badge badge-warn">Approved</span>';
  return '<span class="badge badge-muted">Pending</span>';
}
function generatePayroll(){
  const employeeId = parseInt(document.getElementById('pr-employee').value);
  const start = document.getElementById('pr-start').value;
  const end = document.getElementById('pr-end').value;
  const otHours = parseFloat(document.getElementById('pr-ot').value) || 0;
  const bonus = parseFloat(document.getElementById('pr-bonus').value) || 0;
  const loan = parseFloat(document.getElementById('pr-loan').value) || 0;
  if(!employeeId || !start || !end || start>end){ showBanner('Select a valid employee and period (start must be before end).'); return; }
  const emp = findEmployee(employeeId);

  const periodAtt = STATE.attendance.filter(a => a.employeeId===employeeId && a.date>=start && a.date<=end && a.hoursWorked);
  const hoursWorked = periodAtt.reduce((s,a)=>s+a.hoursWorked,0);

  const periodSales = STATE.sales.filter(s => s.employeeId===employeeId && s.date.slice(0,10)>=start && s.date.slice(0,10)<=end);
  const salesTotal = periodSales.reduce((s,x)=>s+x.total,0);
  const commissionRatePct = parseFloat(STATE.commissionRate)||0;
  const overtimeMultiplier = parseFloat(STATE.overtimeMultiplier)||1;
  const taxRatePct = parseFloat(STATE.taxWithholdingRate)||0;
  const commission = +(salesTotal * (commissionRatePct/100)).toFixed(2);

  const regularPay = emp.salaryType==='hourly' ? +(hoursWorked * emp.rate).toFixed(2) : +(emp.rate).toFixed(2);
  const overtimePay = emp.salaryType==='hourly' ? +(otHours * emp.rate * overtimeMultiplier).toFixed(2) : 0;
  const grossPay = regularPay + overtimePay + commission + bonus;
  const tax = +(grossPay * (taxRatePct/100)).toFixed(2);
  const netPay = +(grossPay - tax - loan).toFixed(2);

  const record = {id: nextId.payroll++, employeeId, start, end, hoursWorked, salesTotal, commission, commissionRatePct, regularPay, overtimePay, overtimeMultiplier, otHours, bonus, tax, taxRatePct, loan, grossPay, netPay, status:'Pending', createdAt:new Date().toISOString()};
  STATE.payroll.push(record);
  logAudit('Payroll Generated', `${emp.name}, ${start} to ${end}`);
  setAdminTab('payroll');
}
function approvePayroll(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  pr.status = 'Approved';
  logAudit('Payroll Approved', `${findEmployee(pr.employeeId).name} — ${peso(pr.netPay)}`);
  setAdminTab('payroll');
}
function releasePayroll(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  pr.status = 'Released';
  logAudit('Payroll Released', `${findEmployee(pr.employeeId).name} — ${peso(pr.netPay)}`);
  setAdminTab('payroll');
}
function disapprovePayroll(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  const emp = findEmployee(pr.employeeId);
  showConfirm(`Move ${emp?emp.name:'this employee'}'s payroll run back to Pending? You'll be able to edit it again before re-approving.`, () => {
    pr.status = 'Pending';
    logAudit('Payroll Disapproved', `${emp?emp.name:'—'} — ${peso(pr.netPay)}`);
    showBanner('Payroll moved back to Pending.', 'success');
    setAdminTab('payroll');
  });
}
function deletePayroll(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  const emp = findEmployee(pr.employeeId);
  const msg = pr.status==='Released'
    ? `This payroll run was already released (paid). Deleting it only removes the record from Insane — it does not reverse an actual payment already made. Delete anyway?`
    : `Delete this ${pr.status.toLowerCase()} payroll run for ${emp?emp.name:'—'} (${peso(pr.netPay)})? This cannot be undone.`;
  showConfirm(msg, () => {
    STATE.payroll = STATE.payroll.filter(p=>p.id!==id);
    logAudit('Payroll Deleted', `${emp?emp.name:'—'} — ${peso(pr.netPay)} (was ${pr.status})`);
    showBanner('Payroll run deleted.', 'success');
    setAdminTab('payroll');
  });
}
function editPayrollModal(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  const emp = findEmployee(pr.employeeId);
  const body = `
    <p class="helptext" style="margin-top:0;">Editing ${emp?emp.name:'—'}'s payroll for ${fmtDate(pr.start)} – ${fmtDate(pr.end)}. Hours worked (${pr.hoursWorked.toFixed(1)}h) and sales commission (${peso(pr.commission)}) reflect actual attendance/POS records from when this run was generated. Adjust overtime, bonus, or the loan deduction below — pay recalculates automatically.</p>
    <div class="form-grid">
      <div class="field"><label>Overtime Hours</label><input id="pr-edit-ot" type="number" min="0" step="0.5" value="${pr.otHours}"></div>
      <div class="field"><label>Bonus (₱)</label><input id="pr-edit-bonus" type="number" min="0" step="0.01" value="${pr.bonus}"></div>
      <div class="field"><label>Loan Deduction (₱)</label><input id="pr-edit-loan" type="number" min="0" step="0.01" value="${pr.loan}"></div>
    </div>`;
  showModal('Edit Payroll', body, () => savePayrollEdit(id));
}
function savePayrollEdit(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  const emp = findEmployee(pr.employeeId);
  const otHours = parseFloat(document.getElementById('pr-edit-ot').value) || 0;
  const bonus = parseFloat(document.getElementById('pr-edit-bonus').value) || 0;
  const loan = parseFloat(document.getElementById('pr-edit-loan').value) || 0;
  const overtimePay = emp.salaryType==='hourly' ? +(otHours * emp.rate * pr.overtimeMultiplier).toFixed(2) : 0;
  const grossPay = +(pr.regularPay + overtimePay + pr.commission + bonus).toFixed(2);
  const tax = +(grossPay * (pr.taxRatePct/100)).toFixed(2);
  const netPay = +(grossPay - tax - loan).toFixed(2);
  Object.assign(pr, {otHours, bonus, loan, overtimePay, grossPay, tax, netPay});
  logAudit('Payroll Edited', `${emp?emp.name:'—'} — ${peso(netPay)}`);
  closeModal();
  showBanner('Payroll updated.', 'success');
  setAdminTab('payroll');
}
function viewPayslip(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  const emp = findEmployee(pr.employeeId);
  const body = `
    <div class="receipt" style="width:100%;">
      <div class="center"><b>${STATE.storeName.toUpperCase()} PAYSLIP</b><br>${statusBadge(pr.status)}</div>
      <div class="dashed"></div>
      <div class="row"><span>Employee</span><span>${emp.name}</span></div>
      <div class="row"><span>Position</span><span>${emp.position}</span></div>
      <div class="row"><span>Period</span><span>${fmtDate(pr.start)} – ${fmtDate(pr.end)}</span></div>
      <div class="dashed"></div>
      <div class="row"><span>Hours Worked</span><span>${pr.hoursWorked.toFixed(1)}</span></div>
      <div class="row"><span>Regular Pay</span><span>${peso(pr.regularPay)}</span></div>
      <div class="row"><span>Overtime (${pr.otHours}h @ ${pr.overtimeMultiplier||1.25}x)</span><span>${peso(pr.overtimePay)}</span></div>
      <div class="row"><span>Commission (${pr.commissionRatePct!=null?pr.commissionRatePct:3}%)</span><span>${peso(pr.commission)}</span></div>
      <div class="row"><span>Bonus</span><span>${peso(pr.bonus)}</span></div>
      <div class="dashed"></div>
      <div class="row"><span>Gross Pay</span><span>${peso(pr.grossPay)}</span></div>
      <div class="row"><span>Tax (${pr.taxRatePct!=null?pr.taxRatePct:5}%)</span><span>-${peso(pr.tax)}</span></div>
      <div class="row"><span>Loan Deduction</span><span>-${peso(pr.loan)}</span></div>
      <div class="dashed"></div>
      <div class="row" style="font-weight:700;font-size:14px;"><span>NET PAY</span><span>${peso(pr.netPay)}</span></div>
    </div>
    <div style="margin-top:14px;text-align:center;">
      <button class="btn btn-primary" onclick="downloadPayslipPDF(${pr.id})">${iconBtn('download')} Download Payslip (PDF)</button>
    </div>`;
  showModal('Payslip', body, null, 'Close');
}
function downloadPayslipPDF(id){
  const pr = STATE.payroll.find(p=>p.id===id);
  const emp = findEmployee(pr.employeeId);
  const win = window.open('', '_blank', 'width=650,height=800');
  if(!win){
    showBanner('Your browser blocked the print window. Allow pop-ups to download the payslip.');
    return;
  }
  const row = (label, value, bold) => `<tr><td style="padding:6px 0;color:#5E7268;">${label}</td><td style="padding:6px 0;text-align:right;font-family:ui-monospace,Consolas,monospace;${bold?'font-weight:700;font-size:15px;':''}">${value}</td></tr>`;
  win.document.write(`
    <html><head><title>Payslip - ${emp.name} - ${fmtDate(pr.start)}</title>
    <style>
      body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1C2B24;max-width:640px;margin:32px auto;padding:0 20px;}
      .header{text-align:center;border-bottom:3px solid #0B6E4F;padding-bottom:16px;margin-bottom:20px;}
      .header h1{margin:0;font-size:22px;color:#054A35;}
      .header p{margin:4px 0 0;color:#5E7268;font-size:13px;}
      .status{display:inline-block;margin-top:8px;padding:4px 12px;border-radius:20px;background:#E6F0EB;color:#054A35;font-size:12px;font-weight:700;}
      table{width:100%;border-collapse:collapse;}
      .section-title{font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#5E7268;margin:20px 0 6px;border-bottom:1px solid #DCE3DF;padding-bottom:4px;}
      .divider{border-top:2px solid #1C2B24;margin:8px 0;}
      .footer{margin-top:30px;padding-top:16px;border-top:1px solid #DCE3DF;font-size:11px;color:#5E7268;text-align:center;}
      @media print{ body{margin:10px auto;} }
    </style></head><body>
      <div class="header">
        <h1>${STATE.storeName}</h1>
        <p>${[STATE.storeAddress, STATE.storePhone].filter(Boolean).join(' · ') || 'Payslip'}</p>
        <div class="status">${pr.status.toUpperCase()}</div>
      </div>
      <table>
        ${row('Employee', emp.name)}
        ${row('Position', emp.position)}
        ${row('Pay Period', `${fmtDate(pr.start)} – ${fmtDate(pr.end)}`)}
        ${row('Hours Worked', pr.hoursWorked.toFixed(1))}
      </table>
      <div class="section-title">Earnings</div>
      <table>
        ${row('Regular Pay', peso(pr.regularPay))}
        ${row(`Overtime (${pr.otHours}h @ ${pr.overtimeMultiplier||1.25}x)`, peso(pr.overtimePay))}
        ${row(`Commission (${pr.commissionRatePct!=null?pr.commissionRatePct:3}%)`, peso(pr.commission))}
        ${row('Bonus', peso(pr.bonus))}
      </table>
      <div class="divider"></div>
      <table>${row('Gross Pay', peso(pr.grossPay), true)}</table>
      <div class="section-title">Deductions</div>
      <table>
        ${row(`Tax Withheld (${pr.taxRatePct!=null?pr.taxRatePct:5}%)`, '-'+peso(pr.tax))}
        ${row('Loan Deduction', '-'+peso(pr.loan))}
      </table>
      <div class="divider"></div>
      <table>${row('NET PAY', peso(pr.netPay), true)}</table>
      <div class="footer">Generated by Insane POS &amp; Payroll on ${fmtDateTime(new Date())}. Use your browser's "Save as PDF" option in the print dialog to download this payslip.</div>
      <div class="no-print" style="text-align:center;margin-top:22px;">
        <button onclick="window.print()" style="background:#0B6E4F;color:#fff;border:none;padding:10px 20px;border-radius:7px;font-size:14px;font-weight:600;cursor:pointer;">Print / Save as PDF</button>
      </div>
      <style>@media print{ .no-print{ display:none; } }</style>
    </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    try{ win.focus(); win.print(); }catch(e){ /* the manual button in the popup still works */ }
  }, 350);
}

/* ============================================================
   ADMIN — FINANCE (Expenses + Gross/Net Financial Summary)
   ============================================================ */
let financeSubTab = 'summary';
function viewFinance(){
  return `
    <div class="tabs">
      <button class="tab ${financeSubTab==='summary'?'active':''}" onclick="setFinanceSubTab('summary')">Financial Summary</button>
      <button class="tab ${financeSubTab==='expenses'?'active':''}" onclick="setFinanceSubTab('expenses')">Expenses</button>
    </div>
    <div id="finance-subview">${financeSubTab==='summary' ? viewFinancialSummary() : viewExpenses()}</div>`;
}
function setFinanceSubTab(tab){
  financeSubTab = tab;
  setAdminTab('finance');
}

function viewExpenses(){
  const rows = STATE.expenses.slice().reverse().map(ex => `
    <tr>
      <td>${fmtDate(ex.date)}</td>
      <td><span class="badge badge-muted">${ex.category}</span></td>
      <td>${ex.description||''}</td>
      <td class="num">${peso(ex.amount)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openExpenseModal(${ex.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteExpense(${ex.id})">Delete</button>
      </td>
    </tr>`).join('');
  const total = STATE.expenses.reduce((s,e)=>s+e.amount,0);
  return `
    <div class="stat-row">
      <div class="stat"><div class="label">Logged Expenses</div><div class="value">${STATE.expenses.length}</div></div>
      <div class="stat warn"><div class="label">Total Expenses (All Time)</div><div class="value">${peso(total)}</div></div>
    </div>
    <div class="toolbar"><div class="spacer"></div><button class="btn btn-primary" onclick="openExpenseModal(null)">+ Add Expense</button></div>
    <div class="card"><div class="card-body pad0">
      <table>
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="empty-state">No expenses logged yet. Add rent, utilities, supplies, and other operating costs here.</td></tr>`}</tbody>
      </table>
    </div></div>`;
}
const EXPENSE_CATEGORIES = ['Rent','Utilities','Supplies','Marketing','Maintenance','Transportation','Fees & Licenses','Other'];
function openExpenseModal(id){
  const ex = id ? STATE.expenses.find(e=>e.id===id) : null;
  const body = `
    <div class="form-grid">
      <div class="field"><label>Date</label><input id="f-exdate" type="date" value="${ex?ex.date:todayStr()}"></div>
      <div class="field"><label>Category</label>
        <select id="f-excat">${EXPENSE_CATEGORIES.map(c=>`<option value="${c}" ${ex&&ex.category===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="field full"><label>Description</label><input id="f-exdesc" value="${ex?ex.description:''}" placeholder="e.g. June electricity bill"></div>
      <div class="field full"><label>Amount (₱)</label><input id="f-examt" type="number" min="0" step="0.01" value="${ex?ex.amount:0}"></div>
    </div>`;
  showModal(ex ? 'Edit Expense' : 'Add Expense', body, () => saveExpense(id));
}
function saveExpense(id){
  const date = document.getElementById('f-exdate').value;
  const category = document.getElementById('f-excat').value;
  const description = document.getElementById('f-exdesc').value.trim();
  const amount = parseFloat(document.getElementById('f-examt').value) || 0;
  if(!date || amount<=0){ showBanner('Enter a valid date and an amount greater than zero.'); return; }
  if(id){
    Object.assign(STATE.expenses.find(e=>e.id===id), {date, category, description, amount});
    logAudit('Expense Updated', `${category} — ${peso(amount)}`);
  } else {
    STATE.expenses.push({id: nextId.expense++, date, category, description, amount});
    logAudit('Expense Added', `${category} — ${peso(amount)}`);
  }
  closeModal();
  setAdminTab('finance');
}
function deleteExpense(id){
  const ex = STATE.expenses.find(e=>e.id===id);
  showConfirm(`Delete this ${ex.category} expense of ${peso(ex.amount)}?`, () => {
    STATE.expenses = STATE.expenses.filter(e=>e.id!==id);
    logAudit('Expense Deleted', `${ex.category} — ${peso(ex.amount)}`);
    setAdminTab('finance');
  });
}

function computeFinancials(start, end){
  const inRange = (d) => (!start || d>=start) && (!end || d<=end);
  const periodSales = STATE.sales.filter(s => inRange(s.date.slice(0,10)));
  const grossRevenue = periodSales.reduce((s,x)=>s + (x.subtotal - x.discount), 0);
  const vatCollected = periodSales.reduce((s,x)=>s + x.tax, 0);
  const cogs = periodSales.reduce((s,x)=> s + x.items.reduce((a,it)=>a + (it.cost||0)*it.qty, 0), 0);
  const grossProfit = grossRevenue - cogs;
  const periodExpenses = STATE.expenses.filter(e => inRange(e.date));
  const operatingExpenses = periodExpenses.reduce((s,x)=>s+x.amount,0);
  const periodPayroll = STATE.payroll.filter(p => p.status==='Released' && inRange(p.end));
  const payrollCost = periodPayroll.reduce((s,x)=>s+x.grossPay,0);
  const totalExpenses = operatingExpenses + payrollCost;
  const netIncome = grossProfit - totalExpenses;
  const byCategory = {};
  periodExpenses.forEach(e => { byCategory[e.category] = (byCategory[e.category]||0) + e.amount; });
  return {grossRevenue, vatCollected, cogs, grossProfit, operatingExpenses, payrollCost, totalExpenses, netIncome, byCategory, txCount: periodSales.length};
}

function viewFinancialSummary(){
  const start = window.__finStart || '';
  const end = window.__finEnd || '';
  const f = computeFinancials(start, end);
  const catRows = Object.entries(f.byCategory).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`<tr><td>${cat}</td><td class="num">${peso(amt)}</td></tr>`).join('');
  return `
    <div class="card">
      <div class="card-header"><h3>Report Period</h3></div>
      <div class="card-body">
        <div class="toolbar">
          <div class="field" style="margin:0;"><label>From</label><input type="date" id="fin-start" value="${start}"></div>
          <div class="field" style="margin:0;"><label>To</label><input type="date" id="fin-end" value="${end}"></div>
          <button class="btn btn-outline" style="margin-top:18px;" onclick="applyFinanceFilter()">Apply</button>
          <button class="btn btn-ghost" style="margin-top:18px;" onclick="clearFinanceFilter()">All Time</button>
          <div class="spacer"></div>
          <button class="btn btn-primary" style="margin-top:18px;" onclick="printFinancialSummary()">${iconBtn('print')} Print for Funding</button>
        </div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat good"><div class="label">Gross Revenue</div><div class="value">${peso(f.grossRevenue)}</div></div>
      <div class="stat"><div class="label">Cost of Goods Sold</div><div class="value">${peso(f.cogs)}</div></div>
      <div class="stat good"><div class="label">Gross Profit</div><div class="value">${peso(f.grossProfit)}</div></div>
      <div class="stat warn"><div class="label">Total Expenses</div><div class="value">${peso(f.totalExpenses)}</div></div>
      <div class="stat ${f.netIncome>=0?'good':'warn'}"><div class="label">Net Income</div><div class="value">${peso(f.netIncome)}</div></div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3>Income Statement</h3></div>
        <div class="card-body" id="income-statement">
          <div class="cart-totals" style="padding:0;">
            <div class="row"><span>Gross Revenue (net of VAT &amp; discounts)</span><span>${peso(f.grossRevenue)}</span></div>
            <div class="row"><span>Less: Cost of Goods Sold</span><span>-${peso(f.cogs)}</span></div>
            <div class="row grand" style="font-size:14px;"><span>Gross Profit</span><span>${peso(f.grossProfit)}</span></div>
            <div class="row" style="margin-top:12px;"><span>Less: Operating Expenses</span><span>-${peso(f.operatingExpenses)}</span></div>
            <div class="row"><span>Less: Payroll Cost (released)</span><span>-${peso(f.payrollCost)}</span></div>
            <div class="row grand"><span>Net Income</span><span>${peso(f.netIncome)}</span></div>
          </div>
          <p class="helptext" style="margin-top:14px;">VAT collected in this period (${peso(f.vatCollected)}) is excluded from revenue — it's held for remittance, not company income. Payroll cost only includes payroll runs marked <b>Released</b>; approve and release payroll first so it's counted here.</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Expenses by Category</h3></div>
        <div class="card-body pad0">
          <table><thead><tr><th>Category</th><th>Amount</th></tr></thead>
          <tbody>${catRows || `<tr><td colspan="2" class="empty-state">No expenses in this period.</td></tr>`}</tbody></table>
        </div>
      </div>
    </div>`;
}
function applyFinanceFilter(){
  window.__finStart = document.getElementById('fin-start').value;
  window.__finEnd = document.getElementById('fin-end').value;
  document.getElementById('finance-subview').innerHTML = viewFinancialSummary();
}
function clearFinanceFilter(){
  window.__finStart = '';
  window.__finEnd = '';
  document.getElementById('finance-subview').innerHTML = viewFinancialSummary();
}
function printFinancialSummary(){
  const start = window.__finStart || '';
  const end = window.__finEnd || '';
  const f = computeFinancials(start, end);
  const periodLabel = (start||end) ? `${start?fmtDate(start):'Beginning'} – ${end?fmtDate(end):'Present'}` : 'All Time';
  const catRows = Object.entries(f.byCategory).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`<tr><td>${cat}</td><td style="text-align:right;">${peso(amt)}</td></tr>`).join('');
  const win = window.open('', '_blank', 'width=650,height=800');
  if(!win){ showBanner('Your browser blocked the print window. Use your browser\'s own print/save option on this page instead.'); return; }
  win.document.write(`
    <html><head><title>Financial Summary — ${periodLabel}</title>
    <style>
      body{font-family:ui-monospace,Consolas,monospace;color:#1C2B24;max-width:520px;margin:30px auto;line-height:1.6;font-size:13.5px;}
      h1{font-size:18px;margin-bottom:0;} .sub{color:#5E7268;margin-top:2px;margin-bottom:20px;}
      table{width:100%;border-collapse:collapse;margin-bottom:18px;}
      td,th{padding:6px 0;border-bottom:1px solid #DCE3DF;}
      .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;}
      .grand{font-weight:700;font-size:15px;border-top:2px solid #1C2B24;border-bottom:none;padding-top:10px;}
    </style></head><body>
      <h1>${STATE.storeName} — Financial Summary</h1>
      <div class="sub">Period: ${periodLabel}</div>
      <div class="row"><span>Gross Revenue</span><span>${peso(f.grossRevenue)}</span></div>
      <div class="row"><span>Less: Cost of Goods Sold</span><span>-${peso(f.cogs)}</span></div>
      <div class="row grand"><span>Gross Profit</span><span>${peso(f.grossProfit)}</span></div>
      <div class="row" style="margin-top:10px;"><span>Less: Operating Expenses</span><span>-${peso(f.operatingExpenses)}</span></div>
      <div class="row"><span>Less: Payroll Cost (released)</span><span>-${peso(f.payrollCost)}</span></div>
      <div class="row grand"><span>Net Income</span><span>${peso(f.netIncome)}</span></div>
      <h3>Expenses by Category</h3>
      <table><thead><tr><th style="text-align:left;">Category</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${catRows||'<tr><td>No expenses recorded</td></tr>'}</tbody></table>
      <p style="color:var(--muted);font-size:11.5px;">VAT collected (${peso(f.vatCollected)}) is held for remittance and excluded from revenue. Generated ${fmtDateTime(new Date())}.</p>
      <div style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="background:#0B6E4F;color:#fff;border:none;padding:10px 20px;border-radius:7px;font-size:14px;font-weight:600;cursor:pointer;">Print / Save as PDF</button></div>
    </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    try{ win.focus(); win.print(); }catch(e){ /* the manual button in the popup still works */ }
  }, 350);
}

/* ============================================================
   ADMIN — SETTINGS (VAT configuration)
   ============================================================ */
let settingsSubTab = 'general';
function viewSettings(){
  return `
    <div class="tabs">
      <button class="tab ${settingsSubTab==='general'?'active':''}" onclick="setSettingsSubTab('general')">General</button>
      <button class="tab ${settingsSubTab==='tax'?'active':''}" onclick="setSettingsSubTab('tax')">Tax (VAT)</button>
      <button class="tab ${settingsSubTab==='payroll'?'active':''}" onclick="setSettingsSubTab('payroll')">Payroll</button>
      <button class="tab ${settingsSubTab==='inventory'?'active':''}" onclick="setSettingsSubTab('inventory')">Inventory</button>
      <button class="tab ${settingsSubTab==='pos'?'active':''}" onclick="setSettingsSubTab('pos')">POS &amp; Labels</button>
      <button class="tab ${settingsSubTab==='categories'?'active':''}" onclick="setSettingsSubTab('categories')">Categories</button>
      <button class="tab ${settingsSubTab==='appearance'?'active':''}" onclick="setSettingsSubTab('appearance')">Appearance &amp; Modules</button>
      <button class="tab ${settingsSubTab==='security'?'active':''}" onclick="setSettingsSubTab('security')">Security &amp; Data</button>
      <button class="tab ${settingsSubTab==='receipts'?'active':''}" onclick="setSettingsSubTab('receipts')">Receipts</button>
    </div>
    <div id="settings-subview">${renderSettingsSubview()}</div>`;
}
function renderSettingsSubview(){
  if(settingsSubTab==='general') return viewSettingsGeneral();
  if(settingsSubTab==='tax') return viewSettingsTax();
  if(settingsSubTab==='payroll') return viewSettingsPayroll();
  if(settingsSubTab==='inventory') return viewSettingsInventory();
  if(settingsSubTab==='pos') return viewSettingsPOS();
  if(settingsSubTab==='categories') return viewSettingsCategories();
  if(settingsSubTab==='appearance') return viewSettingsAppearance();
  if(settingsSubTab==='security') return viewSettingsSecurity();
  if(settingsSubTab==='receipts') return viewSettingsReceipts();
}
function setSettingsSubTab(tab){
  settingsSubTab = tab;
  setAdminTab('settings');
}

/* ---- General: store name, currency, applies across login/sidebar/receipts ---- */
function viewSettingsGeneral(){
  pendingStoreLogo = STATE.storeLogo;
  return `
    <div class="card">
      <div class="card-header"><h3>Store Profile</h3></div>
      <div class="card-body">
        <div class="field full" style="margin-bottom:14px;">
          <label>Store Logo</label>
          <div style="display:flex;align-items:center;gap:14px;margin-top:6px;">
            <div id="logo-preview" style="width:64px;height:64px;border-radius:12px;overflow:hidden;border:1px solid var(--border);flex-shrink:0;background:var(--bg);">
              <img src="${pendingStoreLogo || DEFAULT_LOGO}" alt="Logo preview" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <label class="btn btn-outline btn-sm" style="margin:0;">
                  ${iconBtn('upload')} Upload Logo
                  <input type="file" id="s-logo-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display:none;" onchange="handleLogoSelect(event)">
                </label>
                <button type="button" class="btn btn-outline btn-sm" id="s-logo-remove-btn" onclick="removeLogoPending()" style="${pendingStoreLogo ? '' : 'display:none;'}">${iconBtn('trash')} Reset to Default</button>
              </div>
              <span class="helptext" style="margin:0;">Shown on the login screen and sidebar. Square images work best. Doesn't change the app icon used when installing to your home screen — that comes from the PWA's manifest/icon files.</span>
            </div>
          </div>
        </div>
        <div class="form-grid">
          <div class="field full"><label>Store Name</label><input id="s-storename" value="${STATE.storeName}"></div>
          <div class="field full"><label>Store Address</label><input id="s-storeaddress" value="${STATE.storeAddress||''}" placeholder="e.g. 123 Rizal St., Zamboanga City"></div>
          <div class="field"><label>Store Phone</label><input id="s-storephone" value="${STATE.storePhone||''}" placeholder="e.g. 0917 123 4567"></div>
          <div class="field"><label>Currency Symbol</label><input id="s-currency" value="${STATE.currencySymbol}" maxlength="3"></div>
        </div>
        <p class="helptext">The store name appears on the login screen, sidebar, receipts, payslips, and printed reports. Address and phone are optional and show on receipts when filled in.</p>
        <button class="btn btn-primary" onclick="saveGeneralSettings()">Save General Settings</button>
      </div>
    </div>`;
}
let pendingStoreLogo = null;
function handleLogoSelect(evt){
  const file = evt.target.files[0];
  evt.target.value = '';
  if(!file) return;
  processProductImageFile(file, (dataUrl) => {
    pendingStoreLogo = dataUrl;
    document.getElementById('logo-preview').innerHTML = `<img src="${dataUrl}" alt="Logo preview" style="width:100%;height:100%;object-fit:cover;">`;
    const removeBtn = document.getElementById('s-logo-remove-btn');
    if(removeBtn) removeBtn.style.display = '';
  });
}
function removeLogoPending(){
  pendingStoreLogo = null;
  document.getElementById('logo-preview').innerHTML = `<img src="${DEFAULT_LOGO}" alt="Logo preview" style="width:100%;height:100%;object-fit:cover;">`;
  const removeBtn = document.getElementById('s-logo-remove-btn');
  if(removeBtn) removeBtn.style.display = 'none';
}
function saveGeneralSettings(){
  const name = document.getElementById('s-storename').value.trim();
  const address = document.getElementById('s-storeaddress').value.trim();
  const phone = document.getElementById('s-storephone').value.trim();
  const currency = document.getElementById('s-currency').value.trim();
  if(!name){ showBanner('Store name cannot be empty.'); return; }
  if(!currency){ showBanner('Currency symbol cannot be empty.'); return; }
  STATE.storeName = name;
  STATE.storeAddress = address;
  STATE.storePhone = phone;
  STATE.currencySymbol = currency;
  STATE.storeLogo = pendingStoreLogo;
  renderBranding();
  logAudit('Settings Updated', `Store name/currency changed`);
  showBanner('General settings saved.', 'success');
  setAdminTab('settings');
}

/* ---- Tax: VAT enable/disable + rate ---- */
function viewSettingsTax(){
  return `
    <div class="card">
      <div class="card-header"><h3>Tax Settings</h3></div>
      <div class="card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);margin-bottom:16px;">
          <div>
            <b>VAT</b>
            <div class="helptext" style="margin-top:2px;">${STATE.vatEnabled ? 'VAT is currently applied to every new sale.' : 'VAT is currently removed — new sales are computed with no tax.'}</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="vat-toggle" ${STATE.vatEnabled?'checked':''} onchange="toggleVat(this.checked)">
            <span class="slider"></span>
          </label>
        </div>
        <div class="form-grid">
          <div class="field"><label>VAT Rate (%)</label>
            <input type="number" id="vat-rate" min="0" max="100" step="0.1" value="${STATE.vatRate}" ${STATE.vatEnabled?'':'disabled'}>
          </div>
        </div>
        <p class="helptext">Changing the rate or removing VAT only affects <b>new</b> sales going forward — receipts and reports for past transactions keep the VAT rate that was active when they were made, so your historical records stay accurate.</p>
        <button class="btn btn-primary" onclick="saveVatSettings()">Save Tax Settings</button>
      </div>
    </div>`;
}
function toggleVat(checked){
  const rateInput = document.getElementById('vat-rate');
  if(rateInput) rateInput.disabled = !checked;
}
function saveVatSettings(){
  const enabled = document.getElementById('vat-toggle').checked;
  const rate = parseFloat(document.getElementById('vat-rate').value);
  if(enabled && (isNaN(rate) || rate<0 || rate>100)){ showBanner('Enter a valid VAT rate between 0 and 100.'); return; }
  const wasEnabled = STATE.vatEnabled;
  STATE.vatEnabled = enabled;
  STATE.vatRate = isNaN(rate) ? STATE.vatRate : rate;
  if(enabled && !wasEnabled){ logAudit('VAT Enabled', `Rate set to ${STATE.vatRate}%`); showBanner('VAT has been added back at ' + STATE.vatRate + '%.', 'success'); }
  else if(!enabled && wasEnabled){ logAudit('VAT Removed', 'VAT disabled for new sales'); showBanner('VAT has been removed from new sales.', 'success'); }
  else { logAudit('VAT Rate Updated', `Rate set to ${STATE.vatRate}%`); showBanner('Tax settings saved.', 'success'); }
  setAdminTab('settings');
}

/* ---- Payroll: commission, overtime multiplier, tax withholding ---- */
function viewSettingsPayroll(){
  return `
    <div class="card">
      <div class="card-header"><h3>Payroll Rules</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Commission Rate (%)</label><input id="s-commission" type="number" min="0" max="100" step="0.1" value="${STATE.commissionRate}"></div>
          <div class="field"><label>Overtime Multiplier (×)</label><input id="s-otmult" type="number" min="1" max="5" step="0.05" value="${STATE.overtimeMultiplier}"></div>
          <div class="field"><label>Tax Withholding Rate (%)</label><input id="s-taxwh" type="number" min="0" max="100" step="0.1" value="${STATE.taxWithholdingRate}"></div>
        </div>
        <p class="helptext">These rates apply the next time you click <b>Calculate Payroll</b>. Payroll runs you've already generated keep the rates that were active when they were calculated, so past payslips won't change retroactively.</p>
        <button class="btn btn-primary" onclick="savePayrollSettings()">Save Payroll Rules</button>
      </div>
    </div>`;
}
function savePayrollSettings(){
  const commission = parseFloat(document.getElementById('s-commission').value);
  const otMult = parseFloat(document.getElementById('s-otmult').value);
  const taxwh = parseFloat(document.getElementById('s-taxwh').value);
  if(isNaN(commission) || commission<0 || commission>100){ showBanner('Enter a valid commission rate between 0 and 100.'); return; }
  if(isNaN(otMult) || otMult<1){ showBanner('Overtime multiplier must be 1 or higher.'); return; }
  if(isNaN(taxwh) || taxwh<0 || taxwh>100){ showBanner('Enter a valid tax withholding rate between 0 and 100.'); return; }
  STATE.commissionRate = commission;
  STATE.overtimeMultiplier = otMult;
  STATE.taxWithholdingRate = taxwh;
  logAudit('Settings Updated', `Payroll rules: ${commission}% commission, ${otMult}x OT, ${taxwh}% tax`);
  showBanner('Payroll rules saved.', 'success');
  setAdminTab('settings');
}

/* ---- Inventory: default low-stock threshold ---- */
function viewSettingsInventory(){
  return `
    <div class="card">
      <div class="card-header"><h3>Inventory Defaults</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Default Low Stock Threshold</label><input id="s-lowstock" type="number" min="0" value="${STATE.lowStockDefaultThreshold}"></div>
        </div>
        <p class="helptext">Used to pre-fill the Low Stock Threshold field whenever you add a new product. Existing products keep whatever threshold you set on them individually.</p>
        <button class="btn btn-primary" onclick="saveInventorySettings()">Save Inventory Defaults</button>
      </div>
    </div>`;
}
function saveInventorySettings(){
  const val = parseInt(document.getElementById('s-lowstock').value);
  if(isNaN(val) || val<0){ showBanner('Enter a valid low stock threshold.'); return; }
  STATE.lowStockDefaultThreshold = val;
  logAudit('Settings Updated', `Default low stock threshold set to ${val}`);
  showBanner('Inventory defaults saved.', 'success');
  setAdminTab('settings');
}

/* ---- POS & Labels: customize payment methods and key button text ---- */
let pmDraft = null;
let resetUnlocked = false;
function ensurePmDraft(){
  if(!pmDraft) pmDraft = STATE.paymentMethods.map(m => ({...m}));
}
function syncPmDraftFromDom(){
  if(!pmDraft) return;
  pmDraft.forEach((m,i) => {
    const el = document.getElementById('pm-label-'+i);
    if(el) m.label = el.value;
  });
}
function pmDraftToggle(i){ ensurePmDraft(); syncPmDraftFromDom(); pmDraft[i].enabled = !pmDraft[i].enabled; setAdminTab('settings'); }
function pmDraftMove(i, dir){
  ensurePmDraft(); syncPmDraftFromDom();
  const j = i+dir;
  if(j<0 || j>=pmDraft.length) return;
  [pmDraft[i], pmDraft[j]] = [pmDraft[j], pmDraft[i]];
  setAdminTab('settings');
}
function pmDraftRemove(i){
  ensurePmDraft(); syncPmDraftFromDom();
  if(pmDraft.length<=1){ showBanner('You need at least one payment method.'); return; }
  pmDraft.splice(i,1);
  setAdminTab('settings');
}
function pmDraftAdd(){
  ensurePmDraft(); syncPmDraftFromDom();
  showPrompt('Add Payment Method', 'Name (e.g. GCash, Maya, Utang/Charge)', '', (name) => {
    name = (name||'').trim();
    if(!name){ showBanner('Enter a payment method name.'); return; }
    pmDraft.push({id: 'pm_' + Date.now(), label: name, enabled: true});
    setAdminTab('settings');
  }, 'text');
}
function savePaymentMethods(){
  ensurePmDraft(); syncPmDraftFromDom();
  const cleaned = pmDraft.map(m => ({...m, label:(m.label||'').trim()})).filter(m => m.label);
  if(cleaned.length===0){ showBanner('Add at least one payment method.'); return; }
  if(!cleaned.some(m=>m.enabled)){ showBanner('At least one payment method must be enabled.'); return; }
  STATE.paymentMethods = cleaned;
  if(!cleaned.find(m=>m.id===STATE.payMethod && m.enabled)){
    STATE.payMethod = cleaned.find(m=>m.enabled).id;
  }
  pmDraft = null;
  logAudit('Settings Updated', 'Payment methods updated');
  showBanner('Payment methods saved.', 'success');
  setAdminTab('settings');
}
function viewSettingsPOS(){
  ensurePmDraft();
  const rows = pmDraft.map((m,i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;">
        <button class="btn btn-ghost btn-sm" style="padding:2px 6px;" ${i===0?'disabled':''} onclick="pmDraftMove(${i},-1)" title="Move up">▲</button>
        <button class="btn btn-ghost btn-sm" style="padding:2px 6px;" ${i===pmDraft.length-1?'disabled':''} onclick="pmDraftMove(${i},1)" title="Move down">▼</button>
      </div>
      <input id="pm-label-${i}" value="${m.label}" class="pm-input" style="flex:1;">
      <label class="switch" title="Enabled at checkout">
        <input type="checkbox" ${m.enabled?'checked':''} onchange="pmDraftToggle(${i})">
        <span class="slider"></span>
      </label>
      <button class="btn btn-danger btn-sm" onclick="pmDraftRemove(${i})" title="Delete" style="flex-shrink:0;">${iconBtn('trash')}</button>
    </div>`).join('');
  return `
    <div class="card">
      <div class="card-header"><h3>Payment Methods</h3></div>
      <div class="card-body">
        <p class="helptext" style="margin-top:0;">These appear as buttons at checkout, in the order shown. Rename any of them to match how your store actually gets paid (e.g. "GCash", "Maya", "Utang/Charge"), toggle ones off without deleting them, or add new ones. Disabled methods stay in the list for your reference but won't show up in the POS. Receipts and reports keep the name that was in use at the time of each sale, so renaming won't rewrite history.</p>
        ${rows}
        <div style="margin-top:14px;display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="pmDraftAdd()">+ Add Payment Method</button>
          <div class="spacer"></div>
          <button class="btn btn-primary" onclick="savePaymentMethods()">Save Payment Methods</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Button &amp; Label Text</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>"New Sale" button (cashier menu)</label><input id="s-lbl-newsale" value="${STATE.labels.newSaleBtn}"></div>
          <div class="field"><label>Checkout button</label><input id="s-lbl-pay" value="${STATE.labels.processPaymentBtn}"></div>
          <div class="field"><label>"Clock In" button</label><input id="s-lbl-clockin" value="${STATE.labels.clockInBtn}"></div>
          <div class="field"><label>"Clock Out" button</label><input id="s-lbl-clockout" value="${STATE.labels.clockOutBtn}"></div>
        </div>
        <p class="helptext">Handy if you'd rather cashiers see these in Filipino or your own house style — e.g. "Bayad" instead of "Process Payment".</p>
        <button class="btn btn-primary" onclick="saveLabelSettings()">Save Labels</button>
      </div>
    </div>`;
}
function saveLabelSettings(){
  const newSale = document.getElementById('s-lbl-newsale').value.trim();
  const pay = document.getElementById('s-lbl-pay').value.trim();
  const clockIn = document.getElementById('s-lbl-clockin').value.trim();
  const clockOut = document.getElementById('s-lbl-clockout').value.trim();
  if(!newSale || !pay || !clockIn || !clockOut){ showBanner('Button labels cannot be empty.'); return; }
  STATE.labels = {newSaleBtn:newSale, processPaymentBtn:pay, clockInBtn:clockIn, clockOutBtn:clockOut};
  logAudit('Settings Updated', 'Button labels changed');
  showBanner('Labels saved.', 'success');
  setAdminTab('settings');
}

/* ---- Categories: drag-and-drop display order for the POS sidebar ----
   Uses pointer events (not the desktop-only HTML5 drag API) so this
   actually works with a finger on a touchscreen tablet, not just a mouse. */
let catDrag = null; // { itemEl, listEl }
function viewSettingsCategories(){
  syncCategoryOrder();
  const rows = STATE.categoryOrder.map(c => {
    const count = STATE.products.filter(p=>p.category===c).length;
    return `
    <div class="drag-item" data-cat="${c}">
      <span class="drag-handle" onpointerdown="catPointerDown(event)" title="Drag to reorder">⠿</span>
      <span class="drag-color-dot" style="background:${categoryColor(c)}"></span>
      <span class="drag-label">${c}</span>
      <span class="drag-count">${count} item${count===1?'':'s'}</span>
    </div>`;
  }).join('');
  return `
    <div class="card">
      <div class="card-header"><h3>Category Order</h3></div>
      <div class="card-body">
        <p class="helptext" style="margin-top:0;">This is the order categories appear in down the left side of New Sale, like Food vs. Drinks at a kiosk. Drag a category by its ⠿ handle to reorder it (press and hold, then move up or down) — it saves automatically. Categories come from whatever you type into a product's "Category" field in Inventory; new ones show up here automatically, added to the end.</p>
        <div class="draglist" id="category-draglist">${rows || `<div class="empty-state">Add products with categories in Inventory to manage their order here.</div>`}</div>
      </div>
    </div>`;
}
function catPointerDown(e){
  e.preventDefault();
  const item = e.currentTarget.closest('.drag-item');
  if(!item) return;
  catDrag = { itemEl: item, list: item.parentNode };
  item.classList.add('dragging');
  document.addEventListener('pointermove', catPointerMove);
  document.addEventListener('pointerup', catPointerUp);
}
function catPointerMove(e){
  if(!catDrag) return;
  const { list, itemEl } = catDrag;
  const y = e.clientY;
  for(const el of Array.from(list.children)){
    if(el === itemEl) continue;
    const rect = el.getBoundingClientRect();
    const mid = rect.top + rect.height/2;
    if(y < mid && el.previousElementSibling !== itemEl){
      list.insertBefore(itemEl, el);
      break;
    } else if(y >= mid && el.nextElementSibling !== itemEl){
      list.insertBefore(itemEl, el.nextElementSibling);
      break;
    }
  }
}
function catPointerUp(){
  if(!catDrag) return;
  catDrag.itemEl.classList.remove('dragging');
  const newOrder = Array.from(catDrag.list.children).map(el => el.dataset.cat);
  document.removeEventListener('pointermove', catPointerMove);
  document.removeEventListener('pointerup', catPointerUp);
  catDrag = null;
  const changed = JSON.stringify(newOrder) !== JSON.stringify(STATE.categoryOrder);
  STATE.categoryOrder = newOrder;
  if(changed){
    logAudit('Settings Updated', 'Category display order changed');
    saveState();
  }
}

/* ---- Appearance & Modules: accent color, POS display options, admin nav ---- */
function viewSettingsAppearance(){
  const u = STATE.uiSettings;
  const swatches = Object.entries(ACCENT_PRESETS).map(([key,p]) => `
    <button class="accent-swatch ${u.accentColor===key?'selected':''}" onclick="pickAccentColor('${key}')" title="${p.label}" style="background:${currentTheme==='dark'?p.dark:p.light};"></button>
  `).join('');
  const moduleRow = (key, label, desc) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
      <div><b>${label}</b><div class="helptext" style="margin-top:2px;">${desc}</div></div>
      <label class="switch">
        <input type="checkbox" id="mod-${key}" ${u.adminModules[key]?'checked':''}>
        <span class="slider"></span>
      </label>
    </div>`;
  return `
    <div class="card">
      <div class="card-header"><h3>Accent Color</h3></div>
      <div class="card-body">
        <p class="helptext" style="margin-top:0;">Changes the highlight color used across buttons, badges, and the admin sidebar (light mode).</p>
        <div style="display:flex;gap:10px;">${swatches}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>POS Display</h3></div>
      <div class="card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
          <div><b>Show stock count on product tiles</b><div class="helptext" style="margin-top:2px;">Cashiers see how many units are left under each item.</div></div>
          <label class="switch"><input type="checkbox" id="ui-showstock" ${u.posShowStock?'checked':''}><span class="slider"></span></label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
          <div><b>Show category on product tiles</b><div class="helptext" style="margin-top:2px;">Adds a small category label under the product name.</div></div>
          <label class="switch"><input type="checkbox" id="ui-showcat" ${u.posShowCategory?'checked':''}><span class="slider"></span></label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;">
          <div><b>Allow discounts at checkout</b><div class="helptext" style="margin-top:2px;">Turn off if cashiers shouldn't be able to apply a discount %.</div></div>
          <label class="switch"><input type="checkbox" id="ui-showdiscount" ${u.posShowDiscount?'checked':''}><span class="slider"></span></label>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Admin Modules</h3></div>
      <div class="card-body">
        <p class="helptext" style="margin-top:0;">Hide sidebar sections you don't use, for a leaner admin menu. Dashboard, Employees, Inventory, and Settings always stay visible.</p>
        ${moduleRow('payroll','Payroll','Payroll computation and payslips.')}
        ${moduleRow('finance','Finance','Expenses and gross/net tracking.')}
        ${moduleRow('reports','Reports','Sales and business performance reports.')}
        ${moduleRow('audit','Audit Log','System activity trail.')}
        <button class="btn btn-primary" style="margin-top:14px;" onclick="saveAppearanceSettings()">Save Appearance &amp; Modules</button>
      </div>
    </div>`;
}
function pickAccentColor(key){
  STATE.uiSettings.accentColor = key;
  applyAccent();
  setAdminTab('settings');
}
function saveAppearanceSettings(){
  const modules = {
    payroll: document.getElementById('mod-payroll').checked,
    finance: document.getElementById('mod-finance').checked,
    reports: document.getElementById('mod-reports').checked,
    audit: document.getElementById('mod-audit').checked
  };
  STATE.uiSettings.posShowStock = document.getElementById('ui-showstock').checked;
  STATE.uiSettings.posShowCategory = document.getElementById('ui-showcat').checked;
  STATE.uiSettings.posShowDiscount = document.getElementById('ui-showdiscount').checked;
  STATE.uiSettings.adminModules = modules;
  logAudit('Settings Updated', 'Appearance and module visibility changed');
  showBanner('Appearance settings saved.', 'success');
  setAdminTab('settings');
}

/* ---- Security & Data: auto-logout, password policy, storage usage ---- */
function estimateStorageUsage(){
  let bytes = 0;
  try{ bytes = new Blob([JSON.stringify(STATE)]).size; }catch(err){ bytes = JSON.stringify(STATE).length; }
  return bytes;
}
function formatBytes(bytes){
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(2) + ' MB';
}
function viewSettingsSecurity(){
  const sec = STATE.securitySettings;
  const usageBytes = estimateStorageUsage();
  const usagePct = Math.min(100, Math.round(usageBytes / (5*1024*1024) * 100));
  return `
    <div class="card">
      <div class="card-header"><h3>Session Security</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Auto-logout after inactivity</label>
            <select id="s-autologout">
              <option value="0" ${sec.autoLogoutMinutes===0?'selected':''}>Never</option>
              <option value="5" ${sec.autoLogoutMinutes===5?'selected':''}>5 minutes</option>
              <option value="15" ${sec.autoLogoutMinutes===15?'selected':''}>15 minutes</option>
              <option value="30" ${sec.autoLogoutMinutes===30?'selected':''}>30 minutes</option>
              <option value="60" ${sec.autoLogoutMinutes===60?'selected':''}>60 minutes</option>
            </select>
          </div>
          <div class="field"><label>Minimum password length</label>
            <select id="s-minpwlen">
              <option value="4" ${sec.minPasswordLength===4?'selected':''}>4 characters</option>
              <option value="6" ${sec.minPasswordLength===6?'selected':''}>6 characters</option>
              <option value="8" ${sec.minPasswordLength===8?'selected':''}>8 characters</option>
            </select>
          </div>
        </div>
        <p class="helptext">Auto-logout signs a cashier or admin out after the terminal sits idle — handy for a shared counter. Password length applies the next time an employee account is added or its password is changed.</p>
        <button class="btn btn-primary" onclick="saveSecuritySettings()">Save Security Settings</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Local Storage Usage</h3></div>
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px;">
          <span>Approximate data saved on this device</span><span class="num" style="font-family:var(--mono);">${formatBytes(usageBytes)}</span>
        </div>
        <div style="background:var(--bg);border-radius:5px;height:8px;overflow:hidden;">
          <div style="width:${usagePct}%;height:100%;background:${usagePct>80?'var(--danger)':'var(--primary)'};border-radius:5px;"></div>
        </div>
        <p class="helptext">Most browsers allow roughly 5–10MB of local storage per site. Product photos are the biggest contributor — if you're getting close to the limit, remove images from products that don't need them, or use Export Data to back up and prune older sales history.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Data Management</h3></div>
      <div class="card-body">
        <p class="helptext" style="margin-top:0;">Export downloads a full backup of everything as one JSON file. Import restores from a previously exported JSON file. Resetting data is permanent — a backup downloads automatically the moment before anything is cleared, so you always have a copy.</p>
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:14px;flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="exportData()">${iconBtn('download')} Export Data (Full Backup, JSON)</button>
          <label class="btn btn-outline" style="margin:0;">
            ${iconBtn('upload')} Import Data (JSON)
            <input type="file" accept="application/json" onchange="importData(event)" style="display:none;">
          </label>
          <span class="helptext" style="margin:0;">Use this for full backups and restores — it's what's used automatically before a reset.</span>
        </div>
        ${resetUnlocked ? viewResetControls() : viewResetGate()}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Export by Page (CSV)</h3></div>
      <div class="card-body">
        <p class="helptext" style="margin-top:0;">Download one page's data as a spreadsheet-friendly CSV file — handy for opening in Excel or Google Sheets. CSV is export-only; use the JSON backup above to restore data.</p>
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
          <div class="field" style="margin-bottom:0;min-width:220px;">
            <label>Page to export</label>
            <select id="csv-domain">
              <option value="dashboard">Dashboard Summary (Admin)</option>
              <option value="sales">Sales History (POS)</option>
              <option value="inventory">Inventory / Products</option>
              <option value="employees">Employees</option>
              <option value="payroll">Payroll</option>
              <option value="finance">Finance / Expenses</option>
              <option value="audit">Audit Log</option>
            </select>
          </div>
          <button class="btn btn-outline" onclick="exportDomainCSV(document.getElementById('csv-domain').value)">${iconBtn('download')} Download CSV</button>
        </div>
      </div>
    </div>`;
}
function viewResetGate(){
  return `
    <div>
      <p class="helptext" style="margin-top:0;">Reset options are locked. Confirm the administrator password to unlock them.</p>
      <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
        <div class="field" style="margin-bottom:0;min-width:220px;"><label>Admin Password</label><input type="password" id="s-resetpw" placeholder="Confirm your password"></div>
        <button class="btn btn-outline" onclick="unlockResetOptions()">${iconBtn('lock')} Unlock Reset Options</button>
      </div>
    </div>`;
}
function unlockResetOptions(){
  const pw = document.getElementById('s-resetpw').value;
  const admin = currentUser();
  if(!pw || !admin || admin.password !== pw){ showBanner('Incorrect password.'); return; }
  resetUnlocked = true;
  setAdminTab('settings');
}
function viewResetControls(){
  return `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span class="badge badge-good">${iconBtn('unlock')} Reset options unlocked</span>
        <button class="btn btn-ghost btn-sm" onclick="lockResetOptions()">Lock again</button>
      </div>
      <div class="two-col">
        <div class="card" style="box-shadow:none;">
          <div class="card-header"><h3>Reset POS Data</h3></div>
          <div class="card-body">
            <p class="helptext" style="margin-top:0;">Clears Sales History and Clock In/Out attendance records, and empties any cart in progress. Employees, products, and settings are kept.</p>
            <button class="btn btn-danger" onclick="resetPOSData()">Reset POS Data</button>
          </div>
        </div>
        <div class="card" style="box-shadow:none;">
          <div class="card-header"><h3>Reset by Admin Page</h3></div>
          <div class="card-body">
            <p class="helptext" style="margin-top:0;">Pick which sections to wipe. Your own account is always kept so you don't get locked out.</p>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox" id="reset-employees"> Employees</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox" id="reset-inventory"> Inventory / Products</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox" id="reset-payroll"> Payroll Records</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox" id="reset-finance"> Finance / Expenses</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox" id="reset-audit"> Audit Log</label>
            </div>
            <button class="btn btn-danger" onclick="resetSelectedAdminData()">Reset Selected</button>
          </div>
        </div>
      </div>
    </div>`;
}
function lockResetOptions(){
  resetUnlocked = false;
  setAdminTab('settings');
}
function resetPOSData(){
  showConfirm('This permanently deletes all Sales History and attendance/clock records, and empties any cart in progress. Employees, products, and settings are NOT affected. A backup downloads first. Continue?', () => {
    exportData();
    STATE.sales = [];
    STATE.attendance = [];
    STATE.cart = [];
    logAudit('Data Reset', `POS data (sales & attendance) reset by ${currentUser().name}`);
    resetUnlocked = false;
    showBanner('POS data has been reset. A backup was downloaded first.', 'success');
    setAdminTab('settings');
  });
}
function resetSelectedAdminData(){
  const targets = {
    employees: document.getElementById('reset-employees').checked,
    inventory: document.getElementById('reset-inventory').checked,
    payroll: document.getElementById('reset-payroll').checked,
    finance: document.getElementById('reset-finance').checked,
    audit: document.getElementById('reset-audit').checked,
  };
  const labels = {employees:'Employees', inventory:'Inventory/Products', payroll:'Payroll records', finance:'Finance/Expenses', audit:'Audit Log'};
  const chosen = Object.keys(targets).filter(k => targets[k]);
  if(chosen.length===0){ showBanner('Select at least one page to reset.'); return; }
  const msg = `This permanently deletes data for: ${chosen.map(k=>labels[k]).join(', ')}. A backup downloads first. Continue?`;
  showConfirm(msg, () => {
    exportData();
    const me = currentUser();
    if(targets.employees){ STATE.employees = STATE.employees.filter(e => e.id === me.id); }
    if(targets.inventory){ STATE.products = []; }
    if(targets.payroll){ STATE.payroll = []; }
    if(targets.finance){ STATE.expenses = []; }
    if(targets.audit){ STATE.auditLog = []; }
    logAudit('Data Reset', `Admin data reset: ${chosen.join(', ')}`);
    resetUnlocked = false;
    showBanner('Selected data has been reset. A backup was downloaded first.', 'success');
    setAdminTab('settings');
  });
}
function saveSecuritySettings(){
  const autoLogoutMinutes = parseInt(document.getElementById('s-autologout').value) || 0;
  const minPasswordLength = parseInt(document.getElementById('s-minpwlen').value) || 4;
  STATE.securitySettings = { autoLogoutMinutes, minPasswordLength };
  logAudit('Settings Updated', 'Security settings changed');
  showBanner('Security settings saved.', 'success');
  setAdminTab('settings');
}

/* ---- Receipts: footer message ---- */
function viewSettingsReceipts(){
  return `
    <div class="card">
      <div class="card-header"><h3>Receipt Customization</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field full"><label>Receipt Footer Message</label><input id="s-receiptfooter" value="${STATE.receiptFooter}"></div>
          <div class="field"><label>Printer Paper Width</label>
            <select id="s-paperwidth">
              <option value="58mm" ${STATE.receiptPaperWidth==='58mm'?'selected':''}>58mm (small thermal printer)</option>
              <option value="80mm" ${STATE.receiptPaperWidth==='80mm'?'selected':''}>80mm (standard thermal printer)</option>
            </select>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border);margin-top:6px;">
          <div><b>Show store address/phone on receipt</b><div class="helptext" style="margin-top:2px;">Uses the address and phone set under General.</div></div>
          <label class="switch"><input type="checkbox" id="s-receiptaddress" ${STATE.receiptShowAddress?'checked':''}><span class="slider"></span></label>
        </div>
        <p class="helptext">The footer message is printed on every receipt, right below the total.</p>
        <button class="btn btn-primary" onclick="saveReceiptSettings()">Save Receipt Settings</button>
      </div>
    </div>`;
}
function saveReceiptSettings(){
  const footer = document.getElementById('s-receiptfooter').value.trim();
  if(!footer){ showBanner('Receipt footer message cannot be empty.'); return; }
  STATE.receiptFooter = footer;
  STATE.receiptPaperWidth = document.getElementById('s-paperwidth').value;
  STATE.receiptShowAddress = document.getElementById('s-receiptaddress').checked;
  logAudit('Settings Updated', 'Receipt settings changed');
  showBanner('Receipt settings saved.', 'success');
  setAdminTab('settings');
}

function renderBranding(){
  document.title = STATE.storeName + ' — POS & Payroll';
  const loginName = document.getElementById('login-store-name');
  if(loginName) loginName.textContent = STATE.storeName;
  const loginLogo = document.getElementById('login-logo');
  if(loginLogo) loginLogo.src = STATE.storeLogo || DEFAULT_LOGO;
}

/* ============================================================
   ADMIN — REPORTS
   ============================================================ */
/* ============================================================
   LIGHTWEIGHT INLINE SVG CHARTS
   No external chart library is used so the app keeps working fully
   offline — these just build small self-contained SVG strings.
   ============================================================ */
function renderBarChartSVG(data, opts){
  opts = opts || {};
  const width = opts.width || 560;
  const height = opts.height || 190;
  const padL = 8, padR = 8, padT = 10, padB = 24;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(1, ...data.map(d=>d.value));
  const n = Math.max(1, data.length);
  const gap = data.length > 10 ? 4 : 10;
  const barW = Math.max(4, (chartW - gap*(n-1)) / n);
  let grid = '';
  for(let g=0; g<=3; g++){
    const y = padT + chartH*g/3;
    grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width-padR}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1"/>`;
  }
  const bars = data.map((d,i)=>{
    const x = padL + i*(barW+gap);
    const h = maxVal ? (d.value/maxVal)*chartH : 0;
    const y = padT + (chartH - h);
    const isToday = opts.highlightLast && i===data.length-1;
    const fill = isToday ? 'var(--accent)' : 'var(--primary)';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(h,1).toFixed(1)}" rx="3" fill="${fill}"><title>${d.label}: ${opts.valuePrefix||''}${d.value.toLocaleString()}</title></rect>
      <text x="${(x+barW/2).toFixed(1)}" y="${height-7}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${d.label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" style="display:block;">${grid}${bars}</svg>`;
}

function renderHBarList(data, opts){
  opts = opts || {};
  const maxVal = Math.max(1, ...data.map(d=>d.value));
  if(data.length===0) return `<div class="empty-state">${opts.emptyText||'No data yet.'}</div>`;
  return `<div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;">${data.map(d => {
    const pct = Math.max(3, Math.round((d.value/maxVal)*100));
    return `<div>
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px;">
        <span>${d.label}</span><span class="num" style="font-family:var(--mono);">${opts.valuePrefix||''}${Number(d.value).toLocaleString(undefined,{maximumFractionDigits:2})}</span>
      </div>
      <div style="background:var(--bg);border-radius:5px;height:7px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:var(--primary);border-radius:5px;"></div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

const CHART_PALETTE = ['#0B6E4F','#C98A2C','#1D5FBF','#B3261E','#6A3FBF','#0E8C82','#B5651D','#5E7268'];
function renderDonutChartSVG(data, opts){
  opts = opts || {};
  const size = opts.size || 180;
  const strokeWidth = opts.strokeWidth || 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s,d) => s + d.value, 0) || 1;
  if(data.length === 0 || total === 0){
    return `<div class="empty-state">No data yet.</div>`;
  }
  let offset = 0;
  const segments = data.map((d,i) => {
    const frac = d.value / total;
    const dash = frac * circumference;
    const circle = `<circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${d.color || CHART_PALETTE[i % CHART_PALETTE.length]}" stroke-width="${strokeWidth}" stroke-dasharray="${dash.toFixed(2)} ${(circumference-dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${size/2} ${size/2})"><title>${d.label}: ${d.value.toLocaleString()} (${Math.round(frac*100)}%)</title></circle>`;
    offset += dash;
    return circle;
  }).join('');
  const centerLabel = opts.centerLabel !== undefined ? opts.centerLabel : total.toLocaleString();
  const centerSub = opts.centerSub || '';
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;">
    ${segments}
    <text x="${size/2}" y="${size/2 - (centerSub?6:0)}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--ink)" font-family="var(--mono)">${centerLabel}</text>
    ${centerSub ? `<text x="${size/2}" y="${size/2+16}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${centerSub}</text>` : ''}
  </svg>`;
}
function renderChartLegend(data){
  const total = data.reduce((s,d) => s + d.value, 0) || 1;
  return `<div class="chart-legend">${data.map((d,i) => `
    <div class="legend-row">
      <span class="legend-swatch" style="background:${d.color || CHART_PALETTE[i % CHART_PALETTE.length]}"></span>
      <span class="legend-label">${d.label}</span>
      <span class="legend-value">${d.value.toLocaleString()} <span class="legend-pct">(${Math.round(d.value/total*100)}%)</span></span>
    </div>`).join('')}</div>`;
}

function viewDashboard(){
  const now = new Date();
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(now); d.setDate(d.getDate()-i);
    days.push({key: localDateStr(d), label: i===0 ? 'Today' : d.toLocaleDateString('en-PH',{weekday:'short', timeZone: PH_TZ})});
  }
  const weekKeys = new Set(days.map(d=>d.key));
  const todayKey = days[days.length-1].key;

  const salesByDay = {};
  STATE.sales.forEach(s => {
    const key = localDateStr(new Date(s.date));
    salesByDay[key] = (salesByDay[key]||0) + s.total;
  });
  const chartData = days.map(d => ({label:d.label, value: Math.round(salesByDay[d.key]||0)}));

  const todaySales = STATE.sales.filter(s => localDateStr(new Date(s.date))===todayKey);
  const todayTotal = todaySales.reduce((s,x)=>s+x.total,0);
  const weekSales = STATE.sales.filter(s => weekKeys.has(localDateStr(new Date(s.date))));
  const weekTotal = weekSales.reduce((s,x)=>s+x.total,0);
  const allTimeTotal = STATE.sales.reduce((s,x)=>s+x.total,0);

  const lowStock = STATE.products.filter(p=>p.trackStock!==false && p.stock<=p.lowStock);
  const cashiers = STATE.employees.filter(e=>e.role!=='admin' && e.active);
  const clockedIn = cashiers.filter(e=>clockStatusFor(e.id).clockedIn);
  const pendingPayroll = STATE.payroll.filter(p=>p.status==='Pending').length;

  const salesByProductWeek = {};
  weekSales.forEach(s => s.items.forEach(it => {
    salesByProductWeek[it.name] = (salesByProductWeek[it.name]||0) + it.qty*it.price;
  }));
  const topProductsWeek = Object.entries(salesByProductWeek).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([label,value])=>({label,value}));

  const recentActivity = STATE.auditLog.slice(0,8);
  const recentSales = STATE.sales.slice().reverse().slice(0,6);

  const activityRows = recentActivity.map(a => `
    <div style="display:flex;gap:10px;padding:9px 16px;border-bottom:1px solid var(--border);font-size:12.5px;">
      <div style="color:var(--muted);white-space:nowrap;font-family:var(--mono);font-size:11.5px;padding-top:1px;">${fmtDateTime(a.ts).replace(/, /, ' · ')}</div>
      <div><b>${a.action}</b>${a.detail ? ` — ${a.detail}` : ''}<div style="color:var(--muted);font-size:11px;">${a.user}</div></div>
    </div>`).join('');

  const recentSalesRows = recentSales.map(s => {
    const emp = findEmployee(s.employeeId);
    return `<tr><td>${fmtDateTime(s.date)}</td><td>${emp?emp.name:'—'}</td><td class="num">${s.items.reduce((n,it)=>n+it.qty,0)} item(s)</td><td>${s.paymentMethod}</td><td class="num">${peso(s.total)}</td></tr>`;
  }).join('');

  return `
    <div class="stat-row">
      <div class="stat good"><div class="label">Today's Sales</div><div class="value">${peso(todayTotal)}</div></div>
      <div class="stat"><div class="label">Today's Transactions</div><div class="value">${todaySales.length}</div></div>
      <div class="stat"><div class="label">This Week's Sales</div><div class="value">${peso(weekTotal)}</div></div>
      <div class="stat"><div class="label">All-Time Sales</div><div class="value">${peso(allTimeTotal)}</div></div>
      <div class="stat ${lowStock.length?'warn':'good'}"><div class="label">Low Stock Alerts</div><div class="value">${lowStock.length}</div></div>
      <div class="stat"><div class="label">Staff Clocked In</div><div class="value">${clockedIn.length} / ${cashiers.length}</div></div>
      <div class="stat ${pendingPayroll?'warn':'good'}"><div class="label">Pending Payroll Runs</div><div class="value">${pendingPayroll}</div></div>
    </div>
    <div class="two-col">
      <div class="card"><div class="card-header"><h3>Sales — Last 7 Days</h3></div><div class="card-body">
        ${renderBarChartSVG(chartData, {valuePrefix: STATE.currencySymbol||'₱', highlightLast:true})}
      </div></div>
      <div class="card"><div class="card-header"><h3>Top Products This Week</h3></div><div class="card-body pad0">
        ${renderHBarList(topProductsWeek, {valuePrefix: STATE.currencySymbol||'₱', emptyText:'No sales recorded this week yet.'})}
      </div></div>
    </div>
    <div class="two-col">
      <div class="card"><div class="card-header"><h3>Recent Sales</h3></div><div class="card-body pad0">
        <table><thead><tr><th>Time</th><th>Cashier</th><th>Items</th><th>Payment</th><th>Total</th></tr></thead>
        <tbody>${recentSalesRows || `<tr><td colspan="5" class="empty-state">No sales recorded yet.</td></tr>`}</tbody></table>
      </div></div>
      <div class="card"><div class="card-header"><h3>Recent Activity</h3></div><div class="card-body pad0" style="max-height:320px;overflow-y:auto;">
        ${activityRows || `<div class="empty-state" style="padding:16px;">No activity recorded yet.</div>`}
      </div></div>
    </div>`;
}

function renderDualBarChartSVG(data, opts){
  opts = opts || {};
  const width = opts.width || 640;
  const height = opts.height || 220;
  const padL = 8, padR = 8, padT = 10, padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(1, ...data.map(d=>Math.max(d.a,d.b)));
  const n = Math.max(1, data.length);
  const groupGap = 14;
  const groupW = (chartW - groupGap*(n-1)) / n;
  const barGap = 3;
  const barW = Math.max(3, (groupW - barGap)/2);
  let grid = '';
  for(let g=0; g<=3; g++){
    const y = padT + chartH*g/3;
    grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width-padR}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1"/>`;
  }
  const bars = data.map((d,i) => {
    const gx = padL + i*(groupW+groupGap);
    const ha = maxVal ? (d.a/maxVal)*chartH : 0;
    const hb = maxVal ? (d.b/maxVal)*chartH : 0;
    return `
      <rect x="${gx.toFixed(1)}" y="${(padT+chartH-ha).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(ha,1).toFixed(1)}" rx="2" fill="${opts.aColor||'var(--primary)'}"><title>${opts.aLabel||'A'} — ${d.label}: ${opts.valuePrefix||''}${d.a.toLocaleString()}</title></rect>
      <rect x="${(gx+barW+barGap).toFixed(1)}" y="${(padT+chartH-hb).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(hb,1).toFixed(1)}" rx="2" fill="${opts.bColor||'var(--danger)'}"><title>${opts.bLabel||'B'} — ${d.label}: ${opts.valuePrefix||''}${d.b.toLocaleString()}</title></rect>
      <text x="${(gx+groupW/2).toFixed(1)}" y="${height-8}" text-anchor="middle" font-size="10" fill="var(--muted)">${d.label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;">${grid}${bars}</svg>`;
}
let reportsPeriod = 'daily';
function setReportsPeriod(p){ reportsPeriod = p; setAdminTab('reports'); }
function computeSalesExpenseBuckets(period){
  const now = new Date();
  const buckets = [];
  if(period==='daily'){
    for(let i=6;i>=0;i--){
      const d = new Date(now); d.setDate(d.getDate()-i);
      buckets.push({label: i===0?'Today':d.toLocaleDateString('en-PH',{weekday:'short', timeZone: PH_TZ}),
        test: (dt) => localDateStr(dt) === localDateStr(d)});
    }
  } else if(period==='weekly'){
    for(let i=5;i>=0;i--){
      const end = new Date(now); end.setDate(end.getDate() - i*7);
      const start = new Date(end); start.setDate(start.getDate()-6);
      buckets.push({label: i===0?'This Wk':`${start.getMonth()+1}/${start.getDate()}`,
        test: (dt) => dt >= new Date(start.getFullYear(),start.getMonth(),start.getDate()) && dt <= new Date(end.getFullYear(),end.getMonth(),end.getDate(),23,59,59)});
    }
  } else {
    for(let i=5;i>=0;i--){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      buckets.push({label: d.toLocaleDateString('en-PH',{month:'short', timeZone: PH_TZ}),
        test: (dt) => dt.getFullYear()===d.getFullYear() && dt.getMonth()===d.getMonth()});
    }
  }
  return buckets.map(b => {
    const sales = STATE.sales.filter(s => b.test(new Date(s.date))).reduce((sum,s)=>sum+s.total,0);
    const expenses = STATE.expenses.filter(e => b.test(new Date(e.date+'T00:00:00'))).reduce((sum,e)=>sum+e.amount,0);
    return {label:b.label, a:Math.round(sales), b:Math.round(expenses)};
  });
}
function viewReports(){
  const totalSales = STATE.sales.reduce((s,x)=>s+x.total,0);
  const txCount = STATE.sales.length;
  const invValue = STATE.products.reduce((s,p)=>s+p.price*p.stock,0);
  const lowStock = STATE.products.filter(p=>p.trackStock!==false && p.stock<=p.lowStock);
  const totalPayroll = STATE.payroll.reduce((s,p)=>s+p.netPay,0);
  const totalHours = STATE.attendance.reduce((s,a)=>s+(a.hoursWorked||0),0);
  const periodData = computeSalesExpenseBuckets(reportsPeriod);
  const periodSalesTotal = periodData.reduce((s,d)=>s+d.a,0);
  const periodExpenseTotal = periodData.reduce((s,d)=>s+d.b,0);
  const periodNet = periodSalesTotal - periodExpenseTotal;
  const periodLabel = {daily:'day', weekly:'week', monthly:'month'}[reportsPeriod];

  const salesByProduct = {};
  STATE.sales.forEach(s => s.items.forEach(it => {
    salesByProduct[it.name] = (salesByProduct[it.name]||0) + it.qty*it.price;
  }));
  const topProducts = Object.entries(salesByProduct).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const perfByEmp = {};
  STATE.sales.forEach(s => { perfByEmp[s.employeeId] = (perfByEmp[s.employeeId]||0) + s.total; });
  const perfRows = Object.entries(perfByEmp).sort((a,b)=>b[1]-a[1]).map(([empId,total]) => {
    const e = findEmployee(parseInt(empId));
    return `<tr><td>${e?e.name:'—'}</td><td class="num">${peso(total)}</td></tr>`;
  }).join('');

  const commRows = STATE.payroll.map(pr => `<tr><td>${findEmployee(pr.employeeId).name}</td><td>${fmtDate(pr.start)}–${fmtDate(pr.end)}</td><td class="num">${peso(pr.commission)}</td></tr>`).join('');

  const payrollRows = STATE.payroll.slice().reverse().map(pr => `
    <tr><td>${findEmployee(pr.employeeId).name}</td><td>${fmtDate(pr.start)}–${fmtDate(pr.end)}</td><td class="num">${peso(pr.grossPay)}</td><td class="num">${peso(pr.netPay)}</td><td>${statusBadge(pr.status)}</td></tr>`).join('');

  const hoursByEmp = {};
  STATE.attendance.forEach(a => { if(a.hoursWorked){ hoursByEmp[a.employeeId] = (hoursByEmp[a.employeeId]||0) + a.hoursWorked; } });
  const attRows = Object.entries(hoursByEmp).sort((a,b)=>b[1]-a[1]).map(([empId,hrs]) => {
    const e = findEmployee(parseInt(empId));
    return `<tr><td>${e?e.name:'—'}</td><td class="num">${hrs.toFixed(2)}</td></tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <h3>Sales vs. Expenses</h3>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-sm ${reportsPeriod==='daily'?'btn-primary':'btn-outline'}" onclick="setReportsPeriod('daily')">Daily</button>
          <button class="btn btn-sm ${reportsPeriod==='weekly'?'btn-primary':'btn-outline'}" onclick="setReportsPeriod('weekly')">Weekly</button>
          <button class="btn btn-sm ${reportsPeriod==='monthly'?'btn-primary':'btn-outline'}" onclick="setReportsPeriod('monthly')">Monthly</button>
        </div>
      </div>
      <div class="card-body">
        <div style="display:flex;gap:16px;margin-bottom:10px;font-size:12px;">
          <span><span style="background:var(--primary);display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;"></span>Sales</span>
          <span><span style="background:var(--danger);display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;"></span>Expenses</span>
        </div>
        ${renderDualBarChartSVG(periodData, {aLabel:'Sales', bLabel:'Expenses', aColor:'var(--primary)', bColor:'var(--danger)', valuePrefix:STATE.currencySymbol||'₱'})}
        <div class="stat-row" style="margin-top:14px;margin-bottom:0;">
          <div class="stat good"><div class="label">Sales this ${periodLabel} range</div><div class="value">${peso(periodSalesTotal)}</div></div>
          <div class="stat warn"><div class="label">Expenses this ${periodLabel} range</div><div class="value">${peso(periodExpenseTotal)}</div></div>
          <div class="stat ${periodNet>=0?'good':'warn'}"><div class="label">Net</div><div class="value">${peso(periodNet)}</div></div>
        </div>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat good"><div class="label">Total Sales</div><div class="value">${peso(totalSales)}</div></div>
      <div class="stat"><div class="label">Transactions</div><div class="value">${txCount}</div></div>
      <div class="stat"><div class="label">Inventory Value</div><div class="value">${peso(invValue)}</div></div>
      <div class="stat ${lowStock.length?'warn':'good'}"><div class="label">Low Stock SKUs</div><div class="value">${lowStock.length}</div></div>
      <div class="stat"><div class="label">Payroll Paid Out</div><div class="value">${peso(totalPayroll)}</div></div>
      <div class="stat"><div class="label">Hours Logged</div><div class="value">${totalHours.toFixed(1)}</div></div>
    </div>
    <div class="two-col">
      <div class="card"><div class="card-header"><h3>Top Selling Products</h3></div><div class="card-body pad0">
        <table><thead><tr><th>Product</th><th>Revenue</th></tr></thead>
        <tbody>${topProducts.map(([n,v])=>`<tr><td>${n}</td><td class="num">${peso(v)}</td></tr>`).join('') || `<tr><td colspan="2" class="empty-state">No sales yet.</td></tr>`}</tbody></table>
      </div></div>
      <div class="card"><div class="card-header"><h3>Employee Performance (Sales)</h3></div><div class="card-body pad0">
        <table><thead><tr><th>Employee</th><th>Sales</th></tr></thead>
        <tbody>${perfRows || `<tr><td colspan="2" class="empty-state">No sales yet.</td></tr>`}</tbody></table>
      </div></div>
    </div>
    <div class="two-col">
      <div class="card"><div class="card-header"><h3>Low Stock Report</h3></div><div class="card-body pad0">
        <table><thead><tr><th>Product</th><th>Stock</th><th>Threshold</th></tr></thead>
        <tbody>${lowStock.map(p=>`<tr><td>${p.name}</td><td class="num">${p.stock}</td><td class="num">${p.lowStock}</td></tr>`).join('') || `<tr><td colspan="3" class="empty-state">All stock levels healthy.</td></tr>`}</tbody></table>
      </div></div>
      <div class="card"><div class="card-header"><h3>Commission Report</h3></div><div class="card-body pad0">
        <table><thead><tr><th>Employee</th><th>Period</th><th>Commission</th></tr></thead>
        <tbody>${commRows || `<tr><td colspan="3" class="empty-state">No payroll runs yet.</td></tr>`}</tbody></table>
      </div></div>
    </div>
    <div class="two-col">
      <div class="card"><div class="card-header"><h3>Payroll Report</h3></div><div class="card-body pad0">
        <table><thead><tr><th>Employee</th><th>Period</th><th>Gross</th><th>Net</th><th>Status</th></tr></thead>
        <tbody>${payrollRows || `<tr><td colspan="5" class="empty-state">No payroll runs yet.</td></tr>`}</tbody></table>
      </div></div>
      <div class="card"><div class="card-header"><h3>Attendance Report</h3></div><div class="card-body pad0">
        <table><thead><tr><th>Employee</th><th>Total Hours Logged</th></tr></thead>
        <tbody>${attRows || `<tr><td colspan="2" class="empty-state">No attendance recorded yet.</td></tr>`}</tbody></table>
      </div></div>
    </div>`;
}

function localDateStr(dt){
  return phDateStr(dt);
}
function localTimeStr(dt){
  const p = phDateParts(dt);
  return `${p.hour}:${p.minute}`;
}
function viewAudit(){
  const f = window.__auditFilter || {dateFrom:'', dateTo:'', timeFrom:'', timeTo:'', q:''};
  const filtered = STATE.auditLog.filter(a => {
    const dt = new Date(a.ts);
    const dateStr = localDateStr(dt);
    const timeStr = localTimeStr(dt);
    if(f.dateFrom && dateStr < f.dateFrom) return false;
    if(f.dateTo && dateStr > f.dateTo) return false;
    if(f.timeFrom && timeStr < f.timeFrom) return false;
    if(f.timeTo && timeStr > f.timeTo) return false;
    if(f.q){
      const q = f.q.toLowerCase();
      const hay = (a.user + ' ' + a.action + ' ' + (a.detail||'')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  const rows = filtered.map(a => `
    <tr><td class="progress-note">${fmtDateTime(a.ts)}</td><td>${a.user}</td><td>${a.action}</td><td>${a.detail||''}</td></tr>`).join('');
  const hasFilter = f.dateFrom || f.dateTo || f.timeFrom || f.timeTo || f.q;
  return `
    <div class="card">
      <div class="card-header"><h3>Filter Activity</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Date From</label><input type="date" id="af-datefrom" value="${f.dateFrom}"></div>
          <div class="field"><label>Date To</label><input type="date" id="af-dateto" value="${f.dateTo}"></div>
          <div class="field"><label>Time From</label><input type="time" id="af-timefrom" value="${f.timeFrom}"></div>
          <div class="field"><label>Time To</label><input type="time" id="af-timeto" value="${f.timeTo}"></div>
          <div class="field full"><label>Search (user, action, or detail)</label><input type="text" id="af-q" value="${f.q}" placeholder="e.g. Juan, Sale Completed, Payroll…"></div>
        </div>
        <div class="toolbar" style="margin-top:4px;">
          <button class="btn btn-primary" onclick="applyAuditFilter()">Apply Filter</button>
          <button class="btn btn-ghost" onclick="clearAuditFilter()">Clear Filter</button>
          <div class="spacer"></div>
          <span class="helptext">Showing ${filtered.length} of ${STATE.auditLog.length} entries${hasFilter ? ' (filtered)' : ''}</span>
        </div>
      </div>
    </div>
    <div class="card"><div class="card-body pad0">
    <table><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Detail</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4" class="empty-state">No activity matches this filter.</td></tr>`}</tbody></table>
  </div></div>`;
}
function applyAuditFilter(){
  window.__auditFilter = {
    dateFrom: document.getElementById('af-datefrom').value,
    dateTo: document.getElementById('af-dateto').value,
    timeFrom: document.getElementById('af-timefrom').value,
    timeTo: document.getElementById('af-timeto').value,
    q: document.getElementById('af-q').value.trim()
  };
  setAdminTab('audit');
}
function clearAuditFilter(){
  window.__auditFilter = null;
  setAdminTab('audit');
}

/* ============================================================
   CASHIER — CLOCK IN/OUT
   ============================================================ */
function clockStatusFor(employeeId){
  const open = STATE.attendance.find(a => a.employeeId===employeeId && !a.clockOut);
  return { clockedIn: !!open, record: open };
}
function viewClock(){
  const u = currentUser();
  const status = clockStatusFor(u.id);
  const todays = STATE.attendance.filter(a=>a.employeeId===u.id && a.date===todayStr());
  const rows = todays.slice().reverse().map(a => `
    <tr><td>${a.clockIn}</td><td>${a.clockOut||'—'}</td><td class="num">${a.hoursWorked?a.hoursWorked.toFixed(2):'—'}</td></tr>`).join('');
  return `
    <div class="card">
      <div class="clock-face">
        <div class="time" id="live-clock">--:--:--</div>
        <div class="date">${fmtDate(new Date())}</div>
        <div class="clock-status">
          ${status.clockedIn
            ? `<span class="badge badge-good">Clocked In since ${status.record.clockIn}</span>`
            : `<span class="badge badge-muted">Not Clocked In</span>`}
        </div>
        ${status.clockedIn
          ? `<button class="btn btn-danger" onclick="doClockOut()">${STATE.labels.clockOutBtn}</button>`
          : `<button class="btn btn-primary" onclick="doClockIn()">${STATE.labels.clockInBtn}</button>`}
      </div>
    </div>
    <div class="card"><div class="card-header"><h3>Today's Attendance</h3></div><div class="card-body pad0">
      <table><thead><tr><th>Clock In</th><th>Clock Out</th><th>Hours</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="3" class="empty-state">No attendance recorded today yet.</td></tr>`}</tbody></table>
    </div></div>`;
}
let clockInterval = null;
function tickClock(){
  const el = document.getElementById('live-clock');
  if(el) el.textContent = new Date().toLocaleTimeString('en-PH', {hour12:true, timeZone: PH_TZ});
}
function doClockIn(){
  const u = currentUser();
  const time = new Date().toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit', timeZone: PH_TZ});
  STATE.attendance.push({id: nextId.att++, employeeId:u.id, date: todayStr(), clockIn: time, clockOut:null, hoursWorked:null, clockInTs:Date.now()});
  logAudit('Clock In', u.name + ' at ' + time);
  setCashierTab('clock');
}
function doClockOut(){
  const u = currentUser();
  const status = clockStatusFor(u.id);
  const time = new Date().toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit', timeZone: PH_TZ});
  const hrs = +(((Date.now() - status.record.clockInTs) / 3600000)).toFixed(2);
  status.record.clockOut = time;
  status.record.hoursWorked = hrs > 0 ? hrs : 0.01;
  logAudit('Clock Out', `${u.name} at ${time} (${status.record.hoursWorked}h)`);
  setCashierTab('clock');
}

/* ============================================================
   CASHIER — NEW SALE / POS (kiosk-style: category sidebar + grid,
   order/cart stays hidden behind a floating bar until tapped)
   ============================================================ */
let posSelectedCategory = 'All';
let posSearchQuery = '';

function categorySidebarHtml(){
  const cats = orderedCategories();
  const items = [{name:'All', count: STATE.products.length}]
    .concat(cats.map(c => ({name:c, count: STATE.products.filter(p=>p.category===c).length})));
  return items.map(it => {
    const active = posSelectedCategory === it.name;
    const color = it.name==='All' ? 'var(--muted)' : categoryColor(it.name);
    return `
    <button class="pos-cat-btn ${active?'active':''}" style="--cat-color:${color}" onclick="selectPosCategory('${it.name.replace(/'/g,"\\'")}')">
      <span class="pos-cat-dot"></span>
      <span class="pos-cat-name">${it.name}</span>
      <span class="pos-cat-count">${it.count}</span>
    </button>`;
  }).join('');
}
function productTilesHtml(){
  const showStock = STATE.uiSettings.posShowStock;
  const showCategory = STATE.uiSettings.posShowCategory;
  const q = (posSearchQuery||'').toLowerCase().trim();
  let list = STATE.products;
  if(q){
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  } else if(posSelectedCategory && posSelectedCategory !== 'All'){
    list = list.filter(p => p.category === posSelectedCategory);
  }
  if(list.length===0){
    return `<div class="empty-state">${q ? `No products match "${q}".` : 'No products in this category yet.'}</div>`;
  }
  return list.map(p => {
    const outOfStock = p.trackStock!==false && p.stock<=0;
    return `
    <button class="product-tile" data-pid="${p.id}" ${outOfStock?'disabled':''} onclick="addToCart(${p.id})" style="--cat-color:${categoryColor(p.category)}">
      ${productImageHtml(p, 'ptile-image')}
      <div class="pname">${p.name}</div>
      ${showCategory ? `<div class="pcategory">${p.category}</div>` : ''}
      <div class="pprice">${peso(p.price)}</div>
      ${showStock && p.trackStock!==false ? `<div class="pstock">${p.stock} in stock</div>` : ''}
      <span class="ptile-add">${outOfStock ? 'Out of stock' : '+ Add to Order'}</span>
    </button>`;
  }).join('');
}
function cartBarHtml(){
  const count = STATE.cart.reduce((s,ci)=>s+ci.qty,0);
  const total = cartGrandTotal();
  return `
    <div class="order-bar" id="order-bar">
      <button class="order-bar-btn" ${count===0?'disabled':''} onclick="openOrderModal()">
        <span class="order-bar-count">${count}</span>
        <span class="order-bar-label">${count===0 ? 'Cart is empty — tap a product to start' : (count===1?'1 item in your order':count+' items in your order')}</span>
        <span class="order-bar-total">${peso(total)}</span>
        <span class="order-bar-cta">${count===0?'':'View Order ›'}</span>
      </button>
    </div>`;
}
function viewSale(){
  syncCategoryOrder();
  if(posSelectedCategory!=='All' && !STATE.categoryOrder.includes(posSelectedCategory)) posSelectedCategory = 'All';
  return `
    <div class="pos-layout">
      <div class="pos-categories" id="pos-categories">${categorySidebarHtml()}</div>
      <div class="pos-main">
        <div class="toolbar pos-toolbar"><input type="text" placeholder="Search products…" oninput="posSearch(this.value)" id="prod-search" value="${posSearchQuery}"></div>
        <div class="product-grid" id="product-grid">${productTilesHtml()}</div>
      </div>
    </div>
    ${cartBarHtml()}`;
}
function selectPosCategory(cat){
  posSelectedCategory = cat;
  posSearchQuery = '';
  setCashierTab('sale');
}
function posSearch(v){
  posSearchQuery = v;
  const grid = document.getElementById('product-grid');
  if(grid) grid.innerHTML = productTilesHtml();
}
/* Kept for compatibility with anything still calling the old name. */
function filterProducts(q){ posSearch(q); }

function cartSubtotal(){
  return STATE.cart.reduce((s,ci)=> s + findProduct(ci.productId).price * ci.qty, 0);
}
/* Updates just the floating order bar + the order modal (if open) instead
   of re-rendering the whole POS screen — keeps adding items feel instant
   and never disturbs the category/search the cashier is browsing. */
function refreshCartUI(){
  saveState();
  const bar = document.getElementById('order-bar');
  if(bar) bar.outerHTML = cartBarHtml();
  refreshOrderModal();
}
function addToCart(productId){
  const p = findProduct(productId);
  const existing = STATE.cart.find(ci=>ci.productId===productId);
  const inCartQty = existing ? existing.qty : 0;
  if(p.trackStock!==false && inCartQty+1 > p.stock){ showBanner(`Only ${p.stock} unit(s) of "${p.name}" in stock.`); return; }
  if(existing) existing.qty++; else STATE.cart.push({productId, qty:1});
  refreshCartUI();
  const tile = document.querySelector(`.product-tile[data-pid="${productId}"]`);
  if(tile){
    tile.classList.add('tile-pulse');
    setTimeout(() => tile.classList.remove('tile-pulse'), 350);
  }
}
function changeQty(productId, delta){
  const ci = STATE.cart.find(c=>c.productId===productId);
  const p = findProduct(productId);
  if(!ci) return;
  const newQty = ci.qty + delta;
  if(newQty <= 0){ removeFromCart(productId); return; }
  if(p.trackStock!==false && newQty > p.stock){ showBanner(`Only ${p.stock} unit(s) of "${p.name}" in stock.`); return; }
  ci.qty = newQty;
  refreshCartUI();
}
function removeFromCart(productId){
  STATE.cart = STATE.cart.filter(c=>c.productId!==productId);
  refreshCartUI();
}
function clearCart(){ STATE.cart=[]; STATE.discountPct=0; refreshCartUI(); }
function setDiscount(v){ STATE.discountPct = Math.max(0, Math.min(100, parseFloat(v)||0)); refreshCartUI(); }
function setPayMethod(m){ STATE.payMethod = m; refreshCartUI(); }
function renderChangeDue(){
  const total = cartGrandTotal();
  const tendered = parseFloat(document.getElementById('cash-tendered').value) || 0;
  document.getElementById('change-due').textContent = peso(Math.max(0, tendered-total));
}

/* ---- Order review modal (the "receipt panel", now shown on demand) ---- */
function renderOrderModalBody(){
  const showDiscount = STATE.uiSettings.posShowDiscount;
  const cartRows = STATE.cart.map(ci => {
    const p = findProduct(ci.productId);
    return `<div class="cart-item">
      <div class="ci-name">${p.name}<small>${peso(p.price)} each</small></div>
      <div class="qty-ctrl">
        <button onclick="changeQty(${ci.productId},-1)">−</button>
        <span>${ci.qty}</span>
        <button onclick="changeQty(${ci.productId},1)">+</button>
      </div>
      <div class="num" style="width:70px;">${peso(p.price*ci.qty)}</div>
      <button class="btn btn-ghost btn-sm" onclick="removeFromCart(${ci.productId})">${icon('close')}</button>
    </div>`;
  }).join('');

  const subtotal = cartSubtotal();
  const discountPct = showDiscount ? (STATE.discountPct || 0) : 0;
  const discountAmt = subtotal * discountPct/100;
  const taxable = subtotal - discountAmt;
  const tax = taxable * getVatRate();
  const total = taxable + tax;

  return `
    <div class="cart-header"><b>${STATE.cart.length} item${STATE.cart.length===1?'':'s'} in this order</b>${STATE.cart.length ? `<button class="btn btn-ghost btn-sm" onclick="clearCart()">Clear</button>` : ''}</div>
    <div class="cart-items">${cartRows || `<div class="empty-state">Cart is empty. Close this and tap a product to add it.</div>`}</div>
    <div class="cart-totals">
      <div class="row"><span>Subtotal</span><span>${peso(subtotal)}</span></div>
      ${showDiscount ? `
      <div class="row"><span>Discount %</span><input type="number" min="0" max="100" value="${discountPct}" oninput="setDiscount(this.value)"></div>
      <div class="row"><span>Discount Amount</span><span>-${peso(discountAmt)}</span></div>` : ''}
      <div class="row"><span>${vatLabel()}</span><span>${peso(tax)}</span></div>
      <div class="row grand"><span>Total</span><span>${peso(total)}</span></div>
    </div>
    <div class="pay-methods">
      ${STATE.paymentMethods.filter(m=>m.enabled).map(m=>`<button class="${STATE.payMethod===m.id?'active':''}" onclick="setPayMethod('${m.id}')">${m.label}</button>`).join('')}
    </div>
    ${STATE.payMethod==='cash' ? `
    <div class="cart-totals" style="border-top:none;">
      <div class="row"><span>Cash Tendered</span><input type="number" min="0" step="0.01" id="cash-tendered" oninput="renderChangeDue()"></div>
      <div class="row"><span>Change Due</span><span id="change-due">${peso(0)}</span></div>
    </div>` : ''}
    <div style="padding:4px 0 0;">
      <button class="btn btn-primary btn-block" ${STATE.cart.length===0?'disabled':''} onclick="processPayment(${total.toFixed(2)})">${STATE.labels.processPaymentBtn}</button>
    </div>`;
}
function openOrderModal(){
  if(STATE.cart.length===0) return;
  showModal('Your Order', renderOrderModalBody(), null, 'Close', null);
  const modalEl = document.querySelector('#modal-root .modal');
  if(modalEl) modalEl.dataset.kind = 'order';
}
function refreshOrderModal(){
  const body = document.querySelector('#modal-root .modal[data-kind="order"] .modal-body');
  if(body) body.innerHTML = renderOrderModalBody();
}
function effectiveDiscountPct(){ return STATE.uiSettings.posShowDiscount ? (STATE.discountPct||0) : 0; }
function cartGrandTotal(){
  const subtotal = cartSubtotal();
  const discountAmt = subtotal * effectiveDiscountPct()/100;
  const taxable = subtotal - discountAmt;
  return taxable + taxable*getVatRate();
}
function processPayment(total){
  total = cartGrandTotal();
  if(STATE.cart.length===0) return;
  if(STATE.payMethod==='cash'){
    const tendered = parseFloat(document.getElementById('cash-tendered')?.value) || 0;
    if(tendered < total){ showBanner(`Cash tendered (${peso(tendered)}) is less than the total due (${peso(total)}).`); return; }
  }
  const u = currentUser();
  STATE.cart.forEach(ci => { const prod = findProduct(ci.productId); if(prod.trackStock!==false) prod.stock -= ci.qty; });
  const items = STATE.cart.map(ci => {
    const p = findProduct(ci.productId);
    return {productId:p.id, name:p.name, qty:ci.qty, price:p.price, cost:p.cost||0};
  });
  const subtotal = cartSubtotal();
  const discountAmt = subtotal*effectiveDiscountPct()/100;
  const vatRatePct = STATE.vatEnabled ? (parseFloat(STATE.vatRate)||0) : 0;
  const tax = (subtotal-discountAmt)*getVatRate();
  const methodLabel = (STATE.paymentMethods.find(m=>m.id===STATE.payMethod) || {}).label || STATE.payMethod;
  const sale = {id: nextId.sale++, employeeId:u.id, date: new Date().toISOString(), items, subtotal, discount:discountAmt, tax, vatRatePct, total, paymentMethod: methodLabel};
  STATE.sales.push(sale);
  logAudit('Sale Completed', `${peso(total)} by ${u.name}`);
  STATE.cart = [];
  STATE.discountPct = 0;
  showReceipt(sale);
}
function showReceipt(sale){
  const emp = findEmployee(sale.employeeId);
  const itemsHtml = sale.items.map(it => `<div class="row"><span>${it.name} x${it.qty}</span><span>${peso(it.price*it.qty)}</span></div>`).join('');
  const body = `
    <div class="receipt">
      <div class="center"><b>${STATE.storeName.toUpperCase()} STORE</b><br>Official Receipt${(STATE.receiptShowAddress && (STATE.storeAddress||STATE.storePhone)) ? `<br><span style="font-weight:400;">${[STATE.storeAddress, STATE.storePhone].filter(Boolean).join(' \u00b7 ')}</span>` : ''}</div>
      <div class="dashed"></div>
      <div class="row"><span>Date</span><span>${fmtDateTime(sale.date)}</span></div>
      <div class="row"><span>Cashier</span><span>${emp.name}</span></div>
      <div class="row"><span>Receipt #</span><span>${String(sale.id).padStart(6,'0')}</span></div>
      <div class="dashed"></div>
      ${itemsHtml}
      <div class="dashed"></div>
      <div class="row"><span>Subtotal</span><span>${peso(sale.subtotal)}</span></div>
      <div class="row"><span>Discount</span><span>-${peso(sale.discount)}</span></div>
      <div class="row"><span>VAT ${sale.vatRatePct ? '('+sale.vatRatePct+'%)' : '(n/a)'}</span><span>${peso(sale.tax)}</span></div>
      <div class="row" style="font-weight:700;"><span>TOTAL</span><span>${peso(sale.total)}</span></div>
      <div class="row"><span>Payment</span><span>${sale.paymentMethod}</span></div>
      <div class="dashed"></div>
      <div class="center">${STATE.receiptFooter}</div>
    </div>
    <div id="printable-receipt" style="display:none;"></div>`;
  showModal('Receipt', body, null, 'Done', () => setCashierTab('sale'));
  const footer = document.querySelector('#modal-root .modal-footer');
  if(footer){
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-primary';
    printBtn.innerHTML = iconBtn('print') + ' Print Receipt';
    printBtn.onclick = () => printReceipt(sale);
    footer.insertBefore(printBtn, footer.firstChild);
  }
}
function printReceipt(sale){
  const emp = findEmployee(sale.employeeId);
  const itemsHtml = sale.items.map(it => `<div class="row"><span>${it.name} x${it.qty}</span><span>${peso(it.price*it.qty)}</span></div>`).join('');
  const win = window.open('', '_blank', 'width=380,height=600');
  if(!win){
    showBanner('Your browser blocked the print window. Use your browser\'s own print/save option on this page instead.');
    return;
  }
  const printWidthPx = STATE.receiptPaperWidth === '80mm' ? 380 : 280;
  win.document.write(`
    <html><head><title>Receipt #${String(sale.id).padStart(6,'0')}</title>
    <style>
      body{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;color:#111;width:${printWidthPx}px;margin:20px auto;line-height:1.5;}
      .center{text-align:center;} .dashed{border-top:1px dashed #999;margin:8px 0;}
      .row{display:flex;justify-content:space-between;}
    </style></head><body>
      <div class="center"><b>${STATE.storeName.toUpperCase()} STORE</b><br>Official Receipt${(STATE.receiptShowAddress && (STATE.storeAddress||STATE.storePhone)) ? `<br><span style="font-weight:400;">${[STATE.storeAddress, STATE.storePhone].filter(Boolean).join(' \u00b7 ')}</span>` : ''}</div>
      <div class="dashed"></div>
      <div class="row"><span>Date</span><span>${fmtDateTime(sale.date)}</span></div>
      <div class="row"><span>Cashier</span><span>${emp.name}</span></div>
      <div class="row"><span>Receipt #</span><span>${String(sale.id).padStart(6,'0')}</span></div>
      <div class="dashed"></div>
      ${itemsHtml}
      <div class="dashed"></div>
      <div class="row"><span>Subtotal</span><span>${peso(sale.subtotal)}</span></div>
      <div class="row"><span>Discount</span><span>-${peso(sale.discount)}</span></div>
      <div class="row"><span>VAT ${sale.vatRatePct ? '('+sale.vatRatePct+'%)' : '(n/a)'}</span><span>${peso(sale.tax)}</span></div>
      <div class="row" style="font-weight:700;"><span>TOTAL</span><span>${peso(sale.total)}</span></div>
      <div class="row"><span>Payment</span><span>${sale.paymentMethod}</span></div>
      <div class="dashed"></div>
      <div class="center">${STATE.receiptFooter}</div>
      <div class="no-print center" style="margin-top:16px;"><button onclick="window.print()" style="background:#0B6E4F;color:#fff;border:none;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:600;cursor:pointer;">Print / Save as PDF</button></div>
      <style>@media print{ .no-print{ display:none; } }</style>
    </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    try{ win.focus(); win.print(); }catch(e){ /* the manual button in the popup still works */ }
  }, 350);
}

function viewCashierDashboard(){
  const u = currentUser();
  const status = clockStatusFor(u.id);
  const todayKey = todayStr();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yesterdayKey = phDateStr(yesterday);
  const myTodaySales = STATE.sales.filter(s => s.employeeId===u.id && s.date.slice(0,10)===todayKey);
  const myYesterdaySales = STATE.sales.filter(s => s.employeeId===u.id && s.date.slice(0,10)===yesterdayKey);
  const myTodayTotal = myTodaySales.reduce((sum,s)=>sum+s.total,0);
  const myYesterdayTotal = myYesterdaySales.reduce((sum,s)=>sum+s.total,0);
  const diff = myTodayTotal - myYesterdayTotal;
  const diffPct = myYesterdayTotal > 0 ? Math.round((diff/myYesterdayTotal)*100) : (myTodayTotal>0 ? 100 : 0);
  const isUp = diff >= 0;

  const products = STATE.products.slice();
  const inStock = products.filter(p => p.trackStock===false || p.stock > p.lowStock).length;
  const low = products.filter(p => p.trackStock!==false && p.stock > 0 && p.stock <= p.lowStock).length;
  const out = products.filter(p => p.trackStock!==false && p.stock <= 0).length;
  const trackedProducts = products.filter(p => p.trackStock!==false);
  const totalUnits = trackedProducts.reduce((s,p) => s + Math.max(p.stock,0), 0);

  const byCategory = {};
  trackedProducts.forEach(p => { byCategory[p.category] = (byCategory[p.category]||0) + Math.max(p.stock,0); });
  const categoryData = Object.entries(byCategory)
    .sort((a,b) => b[1]-a[1])
    .map(([label,value]) => ({label, value}));

  const sorted = products.slice().sort((a,b) => {
    if(a.trackStock===false) return 1;
    if(b.trackStock===false) return -1;
    return a.stock - b.stock;
  });
  const rows = sorted.map(p => {
    const pstatus = p.trackStock===false ? '<span class="badge badge-muted">Not Tracked</span>' : (p.stock<=0 ? '<span class="badge badge-bad">Out of Stock</span>' : (p.stock<=p.lowStock ? '<span class="badge badge-bad">Low Stock</span>' : '<span class="badge badge-good">OK</span>'));
    return `<tr data-name="${p.name.toLowerCase()}" data-cat="${p.category.toLowerCase()}">
      <td>${p.image ? `<div class="inv-thumb"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>` : `<div class="inv-thumb no-image"><span class="img-placeholder-icon">${icon('plate')}</span></div>`}</td>
      <td><b>${p.name}</b></td>
      <td>${p.category}</td>
      <td class="num">${p.trackStock===false ? '<span class="helptext" style="margin:0;">Not tracked</span>' : p.stock}</td>
      <td>${pstatus}</td>
    </tr>`;
  }).join('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');

  return `
    <div class="card" style="margin-bottom:18px;">
      <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
        <div>
          <div style="font-size:16px;font-weight:700;">${greeting}, ${u.name.split(' ')[0]} ${icon('wave')}</div>
          <div class="helptext" style="margin-top:2px;">${status.clockedIn ? `You're clocked in — ${myTodaySales.length} sale(s) today, ${peso(myTodayTotal)} so far.` : 'You are not clocked in yet.'}</div>
        </div>
        <div style="display:flex;gap:8px;">
          ${status.clockedIn
            ? `<button class="btn btn-primary" onclick="setCashierTab('sale')">${iconBtn('newsale')} ${STATE.labels.newSaleBtn}</button>`
            : `<button class="btn btn-primary" onclick="setCashierTab('clock')">⏱ ${STATE.labels.clockInBtn}</button>`}
        </div>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat good"><div class="label">Today's Sales</div><div class="value">${peso(myTodayTotal)}</div><div class="helptext" style="margin-top:2px;">${myTodaySales.length} sale(s)</div></div>
      <div class="stat"><div class="label">Yesterday's Sales</div><div class="value">${peso(myYesterdayTotal)}</div><div class="helptext" style="margin-top:2px;">${myYesterdaySales.length} sale(s)</div></div>
      <div class="stat ${isUp?'good':'warn'}"><div class="label">Vs. Yesterday</div><div class="value">${isUp?'▲':'▼'} ${Math.abs(diffPct)}%</div><div class="helptext" style="margin-top:2px;">${isUp?'Outperforming':'Behind'} by ${peso(Math.abs(diff))}</div></div>
    </div>
    <div class="stat-row">
      <div class="stat"><div class="label">Total Products</div><div class="value">${products.length}</div></div>
      <div class="stat good"><div class="label">Well Stocked</div><div class="value">${inStock}</div></div>
      <div class="stat warn"><div class="label">Low Stock</div><div class="value">${low}</div></div>
      <div class="stat ${out?'warn':'good'}"><div class="label">Out of Stock</div><div class="value">${out}</div></div>
    </div>
    <div class="two-col">
      <div class="card"><div class="card-header"><h3>Stock by Category</h3></div><div class="card-body">
        <div class="donut-row">
          ${renderDonutChartSVG(categoryData, {centerLabel: totalUnits.toLocaleString(), centerSub:'units'})}
          ${renderChartLegend(categoryData)}
        </div>
      </div></div>
      <div class="card"><div class="card-header"><h3>Lowest Stock First</h3></div><div class="card-body pad0">
        ${renderHBarList(sorted.slice(0,6).map(p=>({label:p.name, value:p.stock})), {emptyText:'No products yet.'})}
      </div></div>
    </div>
    <div class="toolbar"><input type="text" placeholder="Search products or category…" id="stock-search" oninput="filterStockTable(this.value)"></div>
    <div class="card"><div class="card-body pad0">
      <table id="stock-table">
        <thead><tr><th>Image</th><th>Product</th><th>Category</th><th>Stock</th><th>Status</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="empty-state">No products yet.</td></tr>`}</tbody>
      </table>
    </div></div>`;
}
function filterStockTable(q){
  q = q.toLowerCase();
  document.querySelectorAll('#stock-table tbody tr[data-name]').forEach(row => {
    const match = row.dataset.name.includes(q) || row.dataset.cat.includes(q);
    row.style.display = match ? '' : 'none';
  });
}
function viewHistory(){
  const u = currentUser();
  const mySales = STATE.sales.filter(s=>s.employeeId===u.id).slice().reverse();
  const rows = mySales.map(s => {
    const mainRow = `<tr class="${s.edited?'row-edited':''}">
      <td class="progress-note">${fmtDateTime(s.date)}</td>
      <td>${s.items.length} item(s)</td>
      <td>${s.paymentMethod}${s.edited?' <span class="badge badge-warn" title="This sale was edited by an admin">Edited</span>':''}</td>
      <td class="num">${peso(s.total)}</td>
      <td><button class="btn btn-outline btn-sm" onclick="requestEditSale(${s.id})">Edit</button></td>
    </tr>`;
    const noteRow = s.edited ? `<tr class="row-edited"><td colspan="5" class="edit-note-cell">${icon('edit')} Edited by ${s.editedBy} on ${fmtDateTime(s.editedAt)} — ${s.editNote}</td></tr>` : '';
    return mainRow + noteRow;
  }).join('');
  const total = mySales.reduce((sum,s)=>sum+s.total,0);

  const byMethod = {};
  mySales.forEach(s => {
    if(!byMethod[s.paymentMethod]) byMethod[s.paymentMethod] = {count:0, total:0};
    byMethod[s.paymentMethod].count++;
    byMethod[s.paymentMethod].total += s.total;
  });
  const methodStats = Object.entries(byMethod).map(([method,data]) => `
    <div class="stat"><div class="label">${method}</div><div class="value">${peso(data.total)}</div><div class="helptext" style="margin-top:2px;">${data.count} sale(s)</div></div>
  `).join('');

  return `
    <div class="stat-row">
      <div class="stat good"><div class="label">Your Total Sales</div><div class="value">${peso(total)}</div></div>
      <div class="stat"><div class="label">Transactions</div><div class="value">${mySales.length}</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Sales by Payment Method</h3></div>
      <div class="card-body">
        <div class="stat-row" style="margin-bottom:0;">
          ${methodStats || `<div class="empty-state">No sales recorded yet.</div>`}
        </div>
      </div>
    </div>
    <div class="card"><div class="card-body pad0">
      <table><thead><tr><th>Date</th><th>Items</th><th>Payment</th><th>Total</th><th>Actions</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="5" class="empty-state">No sales recorded yet.</td></tr>`}</tbody></table>
    </div></div>`;
}

/* ---- Admin-authorized sale correction (from Sales History) ---- */
function requestEditSale(saleId){
  showPrompt('Admin Authorization Required', 'This sale can only be edited with an administrator password.', '', (pw) => {
    const admin = STATE.employees.find(e => e.role==='admin' && e.active && e.password===pw);
    if(!admin){ showBanner('Incorrect admin password.'); return; }
    openEditSaleModal(saleId, admin);
  }, 'password');
}
function openEditSaleModal(saleId, admin){
  const sale = STATE.sales.find(s=>s.id===saleId);
  if(!sale) return;
  const methodOptions = STATE.paymentMethods.map(m => `<option value="${m.label}" ${sale.paymentMethod===m.label?'selected':''}>${m.label}</option>`).join('');
  const productOptionsFor = (currentId) => STATE.products.map(p => `<option value="${p.id}" ${p.id===currentId?'selected':''}>${p.name} (${peso(p.price)})</option>`).join('');
  const itemRows = sale.items.map((it,i) => `
    <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:10px;">
      <div class="field" style="flex:2;margin-bottom:0;">
        <label>Product</label>
        <select id="edit-sale-product-${i}">${productOptionsFor(it.productId)}</select>
      </div>
      <div class="field" style="flex:1;margin-bottom:0;">
        <label>Qty</label>
        <input type="number" min="1" value="${it.qty}" id="edit-sale-qty-${i}">
      </div>
    </div>`).join('');
  const body = `
    <p class="helptext" style="margin-top:0;">Authorized by <b>${admin.name}</b>. Change the product, quantity, or payment method below — stock corrects automatically. What changed will be shown on this sale in Sales History, and recorded in the Audit Log.</p>
    <div class="field"><label>Payment Method</label><select id="edit-sale-method">${methodOptions}</select></div>
    <div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px;">${itemRows}</div>`;
  showModal(`Edit Sale #${String(sale.id).padStart(6,'0')}`, body, () => saveSaleEdit(saleId, admin));
}
function saveSaleEdit(saleId, admin){
  const sale = STATE.sales.find(s=>s.id===saleId);
  if(!sale) return;
  const newMethod = document.getElementById('edit-sale-method').value;

  // Read & validate every line's new product + quantity first
  const newItems = [];
  for(let i=0;i<sale.items.length;i++){
    const productSel = document.getElementById(`edit-sale-product-${i}`);
    const qtyInput = document.getElementById(`edit-sale-qty-${i}`);
    const newProductId = parseInt(productSel.value);
    const newQty = parseInt(qtyInput.value);
    if(isNaN(newQty) || newQty < 1){ showBanner('Enter a valid quantity for every item.'); return; }
    const newProduct = findProduct(newProductId);
    if(!newProduct){ showBanner('Selected product could not be found.'); return; }
    newItems.push({productId:newProductId, product:newProduct, qty:newQty});
  }

  // Net stock impact per product: old lines give stock back, new lines take stock
  // (products with stock tracking off are skipped entirely — always available)
  const stockDelta = {};
  sale.items.forEach(it => { const prod = findProduct(it.productId); if(!prod || prod.trackStock===false) return; stockDelta[it.productId] = (stockDelta[it.productId]||0) + it.qty; });
  newItems.forEach(ni => { if(ni.product.trackStock===false) return; stockDelta[ni.productId] = (stockDelta[ni.productId]||0) - ni.qty; });
  for(const pid in stockDelta){
    const product = findProduct(parseInt(pid));
    if(product && (product.stock + stockDelta[pid]) < 0){
      showBanner(`Not enough stock available for "${product.name}" to make this change.`);
      return;
    }
  }
  for(const pid in stockDelta){
    const product = findProduct(parseInt(pid));
    if(product) product.stock += stockDelta[pid];
  }

  // Build a plain-language change summary before overwriting the old items
  const changes = [];
  if(sale.paymentMethod !== newMethod) changes.push(`Payment method: ${sale.paymentMethod} → ${newMethod}`);
  sale.items.forEach((oldIt,i) => {
    const ni = newItems[i];
    if(oldIt.productId !== ni.productId){
      changes.push(`Item ${i+1}: "${oldIt.name}" → "${ni.product.name}"`);
    } else if(oldIt.qty !== ni.qty){
      changes.push(`"${ni.product.name}" quantity: ${oldIt.qty} → ${ni.qty}`);
    }
  });
  const changeSummary = changes.length ? changes.join('; ') : 'No changes were made.';

  sale.items = newItems.map(ni => ({productId:ni.productId, name:ni.product.name, qty:ni.qty, price:ni.product.price, cost:ni.product.cost||0}));
  sale.paymentMethod = newMethod;
  const subtotal = sale.items.reduce((s,it) => s + it.price*it.qty, 0);
  const discountPct = sale.subtotal > 0 ? (sale.discount / sale.subtotal) : 0;
  const discount = +(subtotal * discountPct).toFixed(2);
  const tax = +((subtotal-discount) * (sale.vatRatePct/100)).toFixed(2);
  const total = +(subtotal - discount + tax).toFixed(2);
  Object.assign(sale, {subtotal, discount, tax, total, edited:true, editNote:changeSummary, editedBy:admin.name, editedAt:new Date().toISOString()});

  logAudit('Sale Edited', `Sale #${String(sale.id).padStart(6,'0')} authorized by ${admin.name} — ${changeSummary}`);
  closeModal();
  showBanner('Sale updated.', 'success');
  setCashierTab('history');
}

/* ============================================================
   MODAL HELPER
   ============================================================ */
function showModal(title, bodyHtml, onSave, saveLabel, onClose){
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>${title}</h3><button class="btn btn-ghost btn-sm" onclick="closeModal()">${icon('close')}</button></div>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">${onSave ? 'Cancel' : (saveLabel||'Close')}</button>
          ${onSave ? `<button class="btn btn-primary" id="modal-save-btn">Save</button>` : ''}
        </div>
      </div>
    </div>`;
  if(onSave){
    document.getElementById('modal-save-btn').onclick = guardAction(onSave);
  }
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if(e.target.id==='modal-overlay') closeModal();
  });
  window.__modalOnClose = onClose || null;
}
function closeModal(){
  document.getElementById('modal-root').innerHTML = '';
  if(window.__modalOnClose){ const fn = window.__modalOnClose; window.__modalOnClose=null; fn(); }
}

/* ============================================================
   EXPORT / IMPORT (manual persistence for a fully offline app)
   ============================================================ */
function exportData(){
  const dump = JSON.stringify({state: STATE, nextId}, null, 2);
  const blob = new Blob([dump], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `insane-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---- CSV export, one page/domain at a time ---- */
function csvEscape(v){
  const s = String(v===undefined || v===null ? '' : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
}
function downloadCSV(filename, headers, rows){
  const lines = [headers.map(csvEscape).join(',')];
  rows.forEach(r => lines.push(r.map(csvEscape).join(',')));
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  logAudit('Data Exported', `${filename} (CSV)`);
}
function exportDomainCSV(domain){
  const slug = STATE.storeName.replace(/[^a-z0-9]+/gi,'-').toLowerCase() || 'insane';
  const date = todayStr();
  if(domain==='sales'){
    const headers = ['Date','Employee','Items','Payment Method','Subtotal','Discount','Tax','Total','Edited?'];
    const rows = STATE.sales.map(s => [fmtDateTime(s.date), (findEmployee(s.employeeId)||{}).name||'—',
      s.items.map(it=>`${it.name} x${it.qty}`).join('; '), s.paymentMethod,
      s.subtotal.toFixed(2), s.discount.toFixed(2), s.tax.toFixed(2), s.total.toFixed(2), s.edited?'Yes':'No']);
    downloadCSV(`${slug}-sales-history-${date}.csv`, headers, rows);
  } else if(domain==='inventory'){
    const headers = ['Product Name','Category','Cost','Price','Stock','Low Stock Threshold','Status'];
    const rows = STATE.products.map(p => [p.name, p.category, p.trackCost===false?'Not tracked':(p.cost||0).toFixed(2), p.price.toFixed(2), p.trackStock===false?'Not tracked':p.stock, p.trackStock===false?'':p.lowStock, p.trackStock===false?'Not Tracked':(p.stock<=p.lowStock?'Low Stock':'OK')]);
    downloadCSV(`${slug}-inventory-${date}.csv`, headers, rows);
  } else if(domain==='employees'){
    const headers = ['Name','Username','Role','Position','Salary Type','Rate','Schedule','Status'];
    const rows = STATE.employees.map(e => [e.name, e.username, roleLabel(e.role), e.position, e.salaryType, e.rate, e.schedule, e.active?'Active':'Inactive']);
    downloadCSV(`${slug}-employees-${date}.csv`, headers, rows);
  } else if(domain==='payroll'){
    const headers = ['Employee','Period Start','Period End','Hours Worked','Gross Pay','Tax','Loan Deduction','Net Pay','Status'];
    const rows = STATE.payroll.map(pr => [(findEmployee(pr.employeeId)||{}).name||'—', pr.start, pr.end, pr.hoursWorked.toFixed(1), pr.grossPay.toFixed(2), pr.tax.toFixed(2), pr.loan.toFixed(2), pr.netPay.toFixed(2), pr.status]);
    downloadCSV(`${slug}-payroll-${date}.csv`, headers, rows);
  } else if(domain==='finance'){
    const headers = ['Date','Category','Description','Amount'];
    const rows = STATE.expenses.map(ex => [ex.date, ex.category, ex.description||'', ex.amount.toFixed(2)]);
    downloadCSV(`${slug}-expenses-${date}.csv`, headers, rows);
  } else if(domain==='audit'){
    const headers = ['Timestamp','User','Action','Detail'];
    const rows = STATE.auditLog.map(a => [fmtDateTime(a.ts), a.user, a.action, a.detail||'']);
    downloadCSV(`${slug}-audit-log-${date}.csv`, headers, rows);
  } else if(domain==='dashboard'){
    const totalSales = STATE.sales.reduce((s,x)=>s+x.total,0);
    const invValue = STATE.products.reduce((s,p)=>s+p.price*p.stock,0);
    const lowStock = STATE.products.filter(p=>p.trackStock!==false && p.stock<=p.lowStock).length;
    const clockedIn = STATE.employees.filter(e=>e.role!=='admin' && e.active && clockStatusFor(e.id).clockedIn).length;
    const pendingPayroll = STATE.payroll.filter(p=>p.status==='Pending').length;
    const headers = ['Metric','Value'];
    const rows = [
      ['Total Sales (All-Time)', peso(totalSales)],
      ['Total Transactions', STATE.sales.length],
      ['Inventory Value', peso(invValue)],
      ['Low Stock SKUs', lowStock],
      ['Staff Currently Clocked In', clockedIn],
      ['Pending Payroll Runs', pendingPayroll],
      ['Report Generated', fmtDateTime(new Date())],
    ];
    downloadCSV(`${slug}-dashboard-summary-${date}.csv`, headers, rows);
  }
}
function normalizeState(s){
  const defaults = seedData();
  Object.keys(defaults).forEach(k => { if(s[k] === undefined) s[k] = defaults[k]; });
  // Migrate pre-customization saves: payMethod used to store the literal label
  // ('Cash'/'Card'/'E-Wallet'); the customizable version keys off a stable id.
  const legacyPayMethodIds = {Cash:'cash', Card:'card', 'E-Wallet':'ewallet'};
  if(typeof s.payMethod === 'string' && legacyPayMethodIds[s.payMethod]){
    s.payMethod = legacyPayMethodIds[s.payMethod];
  }
  if(!Array.isArray(s.paymentMethods) || s.paymentMethods.length===0){
    s.paymentMethods = defaults.paymentMethods;
  }
  if(!s.labels){ s.labels = defaults.labels; }
  else { Object.keys(defaults.labels).forEach(k => { if(!s.labels[k]) s.labels[k] = defaults.labels[k]; }); }
  if(!s.uiSettings){ s.uiSettings = defaults.uiSettings; }
  else {
    Object.keys(defaults.uiSettings).forEach(k => { if(s.uiSettings[k] === undefined) s.uiSettings[k] = defaults.uiSettings[k]; });
    if(!s.uiSettings.adminModules){ s.uiSettings.adminModules = defaults.uiSettings.adminModules; }
    else { Object.keys(defaults.uiSettings.adminModules).forEach(k => { if(s.uiSettings.adminModules[k] === undefined) s.uiSettings.adminModules[k] = defaults.uiSettings.adminModules[k]; }); }
  }
  if(!s.securitySettings){ s.securitySettings = defaults.securitySettings; }
  else { Object.keys(defaults.securitySettings).forEach(k => { if(s.securitySettings[k] === undefined) s.securitySettings[k] = defaults.securitySettings[k]; }); }
  if(!Array.isArray(s.categoryOrder)) s.categoryOrder = [];
  return s;
}
function normalizeNextId(n){
  const defaults = { emp: 100, prod: 100, att: 1000, sale: 1000, payroll: 1000, audit: 1, expense: 100 };
  Object.keys(defaults).forEach(k => { if(n[k] === undefined) n[k] = defaults[k]; });
  return n;
}
function importData(evt){
  const file = evt.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      if(!parsed.state || !parsed.nextId) throw new Error('bad file');
      STATE = normalizeState(parsed.state);
      nextId = normalizeNextId(parsed.nextId);
      saveState();
      renderBranding();
      showBanner('Data imported successfully.', 'success');
      enterAppOrLogin();
    } catch(err){
      showBanner('That file could not be read as Insane data.');
    }
  };
  reader.readAsText(file);
  evt.target.value = '';
}

/* Guard the remaining commit buttons that don't route through the
   showModal/showPrompt/showConfirm helpers above. */
saveGeneralSettings = guardAction(saveGeneralSettings);
saveVatSettings = guardAction(saveVatSettings);
savePayrollSettings = guardAction(savePayrollSettings);
saveInventorySettings = guardAction(saveInventorySettings);
savePaymentMethods = guardAction(savePaymentMethods);
saveLabelSettings = guardAction(saveLabelSettings);
saveReceiptSettings = guardAction(saveReceiptSettings);
pmDraftAdd = guardAction(pmDraftAdd);
processPayment = guardAction(processPayment);
generatePayroll = guardAction(generatePayroll);
approvePayroll = guardAction(approvePayroll);
releasePayroll = guardAction(releasePayroll);
saveAppearanceSettings = guardAction(saveAppearanceSettings);
saveSecuritySettings = guardAction(saveSecuritySettings);
unlockResetOptions = guardAction(unlockResetOptions);

/* ---------------------------- boot ---------------------------- */
// Shows the app screen if a session was already active (e.g. restored
// from a saved session across a reload/relaunch) and that account is
// still valid, otherwise falls back to the login screen. Used both on
// startup and after Import Data.
function enterAppOrLogin(){
  const u = STATE.currentUserId ? findEmployee(STATE.currentUserId) : null;
  if(u && u.active){
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    if(u.role==='admin') setAdminTab('dashboard'); else setCashierTab('dashboard');
  } else {
    STATE.currentUserId = null;
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  }
}

renderBranding();
try{
  const savedTheme = localStorage.getItem(THEME_KEY);
  if(savedTheme === 'dark' || savedTheme === 'light') currentTheme = savedTheme;
}catch(err){}
applyTheme(currentTheme);
enterAppOrLogin();
setInterval(tickClock, 1000);
tickClock();

/* ---- Auto-logout on inactivity (Settings > Security & Data) ---- */
let __lastActivityAt = Date.now();
['click','keydown','touchstart','mousemove'].forEach(evt => {
  document.addEventListener(evt, () => { __lastActivityAt = Date.now(); }, {passive:true});
});
setInterval(() => {
  const minutes = STATE.securitySettings.autoLogoutMinutes;
  if(!minutes || !STATE.currentUserId) return;
  if(Date.now() - __lastActivityAt >= minutes*60*1000){
    __lastActivityAt = Date.now();
    handleLogout();
    showBanner('You were signed out after a period of inactivity.');
  }
}, 15000);

// Register service worker for offline/installable support.
// Only works when served over http(s) or localhost — browsers block
// service workers on file:// pages, so this silently no-ops there.
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if(!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
            showUpdateBanner();
          }
        });
      });
    }).catch(() => {});
  });
}
function showUpdateBanner(){
  if(document.getElementById('update-banner')) return;
  const el = document.createElement('div');
  el.id = 'update-banner';
  el.className = 'update-banner';
  el.innerHTML = `<span>A new version of Insane is ready.</span><button onclick="location.reload()">Reload to Update</button>`;
  document.body.appendChild(el);
}
function renderVersionFooter(){
  const el = document.getElementById('version-footer');
  if(!el) return;
  const built = new Date(APP_BUILD_DATE);
  const stamp = fmtDateTime(built);
  el.textContent = `Insane v${APP_VERSION} · Updated ${stamp}`;
}
function initVersionFooterScrollReveal(){
  const footer = document.getElementById('version-footer');
  if(!footer) return;
  const threshold = 24;
  const check = (scrollTop) => { footer.classList.toggle('show', scrollTop > threshold); };
  const contentEl = document.getElementById('content');
  if(contentEl){
    contentEl.addEventListener('scroll', () => check(contentEl.scrollTop), {passive:true});
  }
  window.addEventListener('scroll', () => check(window.scrollY), {passive:true});
}
renderVersionFooter();
initVersionFooterScrollReveal();
document.querySelectorAll('.hamburger-btn').forEach(el => { el.innerHTML = icon('hamburger'); });
document.querySelectorAll('.help-btn').forEach(el => { el.innerHTML = icon('help'); });
