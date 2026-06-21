// ═══════════════════════════════════════════
//  ZAHRAA POS — Shared Core (Firebase + Auth + UI)
// ═══════════════════════════════════════════

const CFG_KEY = 'zahraa_pos_firebase_config';
const SETTINGS_KEY = 'zahraa_pos_settings';
let db, auth, currentUser = null;

// ─── Firebase Config (مدمج مباشرة) ──────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCG6Yc0iH-rt-PaiRqL_V9Re1z49ZF3OMM",
  authDomain: "zahraa-store-f4c90.firebaseapp.com",
  projectId: "zahraa-store-f4c90"
};

// ─── Firebase Init ───────────────────────
function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  db = firebase.firestore();
  auth = firebase.auth();
  db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
  return true;
}

// ─── Settings ────────────────────────────
function getSettings() {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
}
function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ─── Auth Guard ───────────────────────────
function requireAuth(cb) {
  if (!initFirebase()) { location.href = 'login.html'; return; }
  auth.onAuthStateChanged(user => {
    if (!user) { location.href = 'login.html'; return; }
    currentUser = user;
    renderSidebar();
    applyTheme();
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn && document.body.classList.contains('light')) themeBtn.innerHTML = '<i class="fas fa-moon"></i> تبديل المظهر';
    document.getElementById('sb-user') && (document.getElementById('sb-user').textContent = user.email);
    if (cb) cb(user);
  });
}

// ─── Sidebar ─────────────────────────────
const NAV = [
  { href:'dashboard.html', icon:'fa-gauge',      label:'لوحة التحكم' },
  { href:'pos.html',       icon:'fa-cash-register', label:'الكاشير' },
  { href:'products.html',  icon:'fa-box',         label:'المنتجات' },
  { href:'inventory.html', icon:'fa-warehouse',   label:'المخزون' },
  { href:'customers.html', icon:'fa-users',       label:'العملاء' },
  { href:'active-orders.html', icon:'fa-hourglass-half', label:'الطلبات النشطة' },
  { href:'suppliers.html', icon:'fa-truck',       label:'الموردون' },
  { href:'purchases.html', icon:'fa-cart-arrow-down', label:'المشتريات' },
  { href:'expenses.html',  icon:'fa-money-bill-wave', label:'المصروفات' },
  { href:'reports.html',   icon:'fa-chart-line',  label:'التقارير' },
  { href:'users.html',     icon:'fa-user-shield', label:'المستخدمون' },
  { href:'settings.html',  icon:'fa-gear',        label:'الإعدادات' },
];

function renderSidebar() {
  const el = document.getElementById('sidebar');
  if (!el) return;
  const cur = location.pathname.split('/').pop() || 'dashboard.html';
  const s = getSettings();
  el.innerHTML = `
    <div class="sb-logo">
      <span style="font-size:26px">📸</span>
      <div>
        <div class="sb-name">${s.storeName || 'استوديو الزهراء'}</div>
        <div class="sb-sub">نظام الكاشير</div>
      </div>
    </div>
    <nav class="sb-nav">
      ${NAV.map(n => `
        <a class="sb-link${cur===n.href?' active':''}" href="${n.href}">
          <i class="fas ${n.icon}"></i> ${n.label}
        </a>`).join('')}
    </nav>
    <div class="sb-footer">
      <div class="sb-user-info"><i class="fas fa-circle-user"></i> <span id="sb-user"></span></div>
      <button id="theme-toggle-btn" style="width:100%;padding:7px;border-radius:var(--r);border:1.5px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;font-family:'Cairo',sans-serif;font-size:11px;font-weight:700;transition:all .17s;margin-bottom:5px" onclick="toggleTheme()"><i class="fas fa-circle-half-stroke"></i> تبديل المظهر</button>
      <button class="sb-logout" onclick="doLogout()"><i class="fas fa-right-from-bracket"></i> خروج</button>
    </div>`;
  if (currentUser) document.getElementById('sb-user').textContent = currentUser.email;
}

async function doLogout() {
  await auth.signOut();
  location.href = 'login.html';
}

// ─── Toast ───────────────────────────────
function toast(msg, type = 'info', ms = 2800) {
  let wrap = document.getElementById('toasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.id='toasts'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  const cls = { ok:'t-ok', err:'t-err', info:'t-info', warn:'t-warn' };
  el.className = 'toast ' + (cls[type] || 't-info');
  el.innerHTML = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// ─── Currency ────────────────────────────
function fmt(n, unit = null) {
  const s = getSettings();
  const u = unit ?? (s.currency || 'ج');
  return (parseFloat(n) || 0).toFixed(2) + ' ' + u;
}

// ─── Date ────────────────────────────────
function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ar-EG') + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

// ─── Modal helpers ────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// ─── Common CSS ──────────────────────────
function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('zahraa_theme', isLight ? 'light' : 'dark');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-circle-half-stroke"></i>';
}
window.toggleTheme = toggleTheme;

function applyTheme() {
  const saved = localStorage.getItem('zahraa_theme');
  if (saved === 'light') {
    document.body.classList.add('light');
  }
}
window.applyTheme = applyTheme;

function injectSharedCSS() {
  const style = document.createElement('style');
  style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
:root{
  --bg:#0c0c15;--bg2:#13132a;--bg3:#1a1a30;
  --card:#20203a;--card2:#27274a;
  --border:#2d2d5a;--border2:#3d3d6a;
  --gold:#d4af37;--gold2:#f0d060;--gold3:#a88520;
  --text:#f1f5f9;--text2:#94a3b8;--text3:#4a5568;
  --green:#22c55e;--red:#ef4444;--orange:#f59e0b;
  --blue:#3b82f6;--purple:#8b5cf6;--cyan:#06b6d4;
  --r:10px;--r2:14px;--sh:0 4px 24px rgba(0,0,0,.5);
  --sw:220px;
}
body.light{
  --bg:#f0f4f8;--bg2:#e8eef5;--bg3:#dde5ef;
  --card:#ffffff;--card2:#f4f7fa;
  --border:#c8d5e3;--border2:#a0b4c8;
  --text:#0f172a;--text2:#334155;--text3:#64748b;
  --sh:0 4px 24px rgba(0,0,0,.12);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;outline:none}
html,body{width:100%;height:100%;font-family:'Cairo',sans-serif;color:var(--text);background:var(--bg);direction:rtl}
/* Layout */
.app-shell{display:flex;height:100vh;overflow:hidden}
/* Sidebar */
#sidebar{width:var(--sw);background:var(--bg2);border-left:1px solid var(--border);
  display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
.sb-logo{display:flex;align-items:center;gap:10px;padding:16px 14px;
  border-bottom:1px solid var(--border)}
.sb-name{font-size:13px;font-weight:900;color:var(--gold)}
.sb-sub{font-size:10px;color:var(--text3)}
.sb-nav{flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:2px}
.sb-link{display:flex;align-items:center;gap:9px;padding:9px 12px;
  border-radius:var(--r);color:var(--text2);text-decoration:none;
  font-size:12px;font-weight:700;transition:all .17s}
.sb-link i{width:16px;text-align:center;font-size:13px}
.sb-link:hover{background:var(--bg3);color:var(--text)}
.sb-link.active{background:rgba(212,175,55,.15);color:var(--gold);border-right:3px solid var(--gold)}
.sb-footer{padding:12px 8px;border-top:1px solid var(--border)}
.sb-user-info{font-size:10px;color:var(--text3);margin-bottom:7px;padding:0 4px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-logout{width:100%;padding:8px;border-radius:var(--r);border:1.5px solid var(--border);
  background:transparent;color:var(--text2);cursor:pointer;
  font-family:'Cairo',sans-serif;font-size:11px;font-weight:700;transition:all .17s}
.sb-logout:hover{border-color:var(--red);color:var(--red)}
/* Page content */
.page-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
.page-header{display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;border-bottom:1px solid var(--border);
  background:var(--bg2);flex-shrink:0}
.page-header h1{font-size:16px;font-weight:900;color:var(--gold)}
.page-body{flex:1;overflow-y:auto;padding:20px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
/* Cards */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:16px}
.card-title{font-size:12px;color:var(--text3);font-weight:700;margin-bottom:4px}
.card-value{font-size:24px;font-weight:900;color:var(--gold)}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px}
/* Buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;
  border-radius:var(--r);border:none;cursor:pointer;
  font-family:'Cairo',sans-serif;font-size:12px;font-weight:700;transition:all .17s}
.btn-primary{background:var(--gold);color:#000}
.btn-primary:hover{background:var(--gold2)}
.btn-danger{background:var(--red);color:#fff}
.btn-danger:hover{opacity:.85}
.btn-ghost{background:transparent;border:1.5px solid var(--border);color:var(--text2)}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-success{background:#052e16;border:1.5px solid var(--green);color:var(--green)}
/* Table */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:var(--bg2);color:var(--text3);font-weight:700;
  padding:10px 12px;text-align:right;border-bottom:1px solid var(--border);white-space:nowrap}
td{padding:10px 12px;border-bottom:1px solid var(--border);color:var(--text);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--bg3)}
/* Forms */
.form-group{margin-bottom:14px}
.form-group label{display:block;font-size:11px;color:var(--text2);font-weight:700;margin-bottom:5px}
.form-control{width:100%;padding:9px 12px;background:var(--bg3);
  border:1.5px solid var(--border);border-radius:var(--r);
  color:var(--text);font-family:'Cairo',sans-serif;font-size:13px;transition:border-color .2s}
.form-control:focus{border-color:var(--gold)}
select.form-control option{background:var(--bg3)}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
/* Modal */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:800;
  display:flex;align-items:center;justify-content:center;padding:16px;
  opacity:0;pointer-events:none;transition:opacity .2s}
.overlay.open{opacity:1;pointer-events:all}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);
  width:100%;max-width:560px;max-height:90vh;overflow-y:auto;
  transform:scale(.95);transition:transform .2s}
.overlay.open .modal{transform:scale(1)}
.modal-lg{max-width:800px}
.modal-header{display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg2);z-index:1}
.modal-header h3{font-size:15px;font-weight:900;color:var(--gold)}
.modal-body{padding:18px}
.modal-footer{padding:12px 18px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-start}
.close-btn{background:none;border:none;color:var(--text3);cursor:pointer;font-size:20px;line-height:1}
.close-btn:hover{color:var(--red)}
/* Badges */
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
.badge-green{background:#052e16;color:var(--green)}
.badge-red{background:#450a0a;color:#fca5a5}
.badge-orange{background:#451a03;color:#fcd34d}
.badge-blue{background:#1e3a5f;color:#93c5fd}
.badge-gray{background:var(--bg3);color:var(--text3)}
/* Search bar */
.search-bar{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.search-input{flex:1;min-width:200px;padding:9px 14px;
  background:var(--bg3);border:1.5px solid var(--border);
  border-radius:var(--r);color:var(--text);font-family:'Cairo',sans-serif;font-size:13px}
.search-input:focus{border-color:var(--gold);outline:none}
/* Toast */
#toasts{position:fixed;bottom:20px;left:20px;z-index:9999;display:flex;flex-direction:column;gap:6px}
.toast{padding:10px 16px;border-radius:10px;font-size:12px;font-weight:700;
  box-shadow:0 4px 20px rgba(0,0,0,.4);animation:tup .25s;color:#fff;max-width:280px}
@keyframes tup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.t-ok{background:#14532d}.t-err{background:#450a0a}.t-info{background:#1e3a5f}.t-warn{background:#451a03}
/* Scrollbar */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
/* Empty state */
.empty-state{text-align:center;padding:60px 20px;color:var(--text3)}
.empty-state i{font-size:48px;margin-bottom:16px;display:block;opacity:.3}
/* Spinner */
.spinner{width:36px;height:36px;border:4px solid var(--border);
  border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;margin:40px auto}
@keyframes spin{to{transform:rotate(360deg)}}
/* Mobile */
@media(max-width:768px){
  #sidebar{position:fixed;right:-220px;top:0;height:100%;z-index:500;transition:right .28s}
  #sidebar.open{right:0}
  .mob-menu-btn{display:flex}
}
`;
  document.head.appendChild(style);
}

// ─── Confirm dialog ───────────────────────
function confirm2(msg) {
  return new Promise(resolve => {
    const d = document.createElement('div');
    d.className = 'overlay open';
    d.innerHTML = `<div class="modal" style="max-width:360px">
      <div class="modal-body" style="text-align:center;padding:30px 20px">
        <i class="fas fa-triangle-exclamation" style="font-size:36px;color:var(--orange);margin-bottom:12px;display:block"></i>
        <p style="font-size:14px;font-weight:700;margin-bottom:20px">${msg}</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-danger" id="cf-yes">تأكيد</button>
          <button class="btn btn-ghost" id="cf-no">إلغاء</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(d);
    d.querySelector('#cf-yes').onclick = () => { d.remove(); resolve(true); };
    d.querySelector('#cf-no').onclick = () => { d.remove(); resolve(false); };
  });
}

// ─── Pagination ───────────────────────────
function paginate(arr, page, size = 20) {
  const total = Math.ceil(arr.length / size);
  return {
    items: arr.slice((page - 1) * size, page * size),
    total,
    page,
    hasPrev: page > 1,
    hasNext: page < total,
  };
}

// ─── Number formatter ─────────────────────
function numFmt(n) {
  return Number(parseFloat(n) || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.initFirebase = initFirebase;
window.requireAuth = requireAuth;
window.getSettings = getSettings;
window.saveSettings = saveSettings;
window.renderSidebar = renderSidebar;
window.doLogout = doLogout;
window.toast = toast;
window.fmt = fmt;
window.fmtDate = fmtDate;
window.openModal = openModal;
window.closeModal = closeModal;
window.injectSharedCSS = injectSharedCSS;
window.confirm2 = confirm2;
window.paginate = paginate;
window.numFmt = numFmt;
window.CFG_KEY = CFG_KEY;
window.SETTINGS_KEY = SETTINGS_KEY;
