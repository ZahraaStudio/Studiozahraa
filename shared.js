/* ═══════════════════════════════════════════
   shared.js — Zahraa POS Shared Foundation
   Firebase config, CSS injection, utilities
═══════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyCG6Yc0iH-rt-PaiRqL_V9Re1z49ZF3OMM",
  authDomain: "zahraa-store-f4c90.firebaseapp.com",
  databaseURL: "https://zahraa-store-f4c90-default-rtdb.firebaseio.com",
  projectId: "zahraa-store-f4c90",
  storageBucket: "zahraa-store-f4c90.firebasestorage.app",
  messagingSenderId: "885722081307",
  appId: "1:885722081307:web:7c91e0f8b0ea9b8b4df0be"
};

if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db   = firebase.firestore();
const auth = firebase.auth();

/* ── Formatting helpers ── */
function fmt(n) {
  const v = parseFloat(n) || 0;
  return v.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج';
}
function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}
function fmtDateTime(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
       + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

/* ── Toast notification ── */
let _toastTimer = null;
function toast(msg, type) {
  let el = document.getElementById('_shared_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_shared_toast';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(120%);z-index:99999;padding:10px 22px;border-radius:30px;font-family:Cairo,sans-serif;font-size:13px;font-weight:700;transition:transform .3s;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.4)';
    document.body.appendChild(el);
  }
  const colors = {
    ok:   { bg:'#22c55e', color:'#000' },
    warn: { bg:'#f59e0b', color:'#000' },
    err:  { bg:'#ef4444', color:'#fff' },
    info: { bg:'#d4af37', color:'#000' },
  };
  const c = colors[type] || colors.info;
  el.style.background = c.bg;
  el.style.color       = c.color;
  el.textContent       = msg;
  el.style.transform   = 'translateX(-50%) translateY(0)';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.style.transform = 'translateX(-50%) translateY(120%)';
  }, 3200);
}

/* ── Auth guard ── */
function requireAuth(callback) {
  auth.onAuthStateChanged(user => {
    if (user) {
      callback(user);
    } else {
      /* Show login prompt or redirect */
      document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;font-family:Cairo,sans-serif">
          <div style="background:#141414;border:1px solid #d4af37;border-radius:16px;padding:36px 40px;width:340px;text-align:center">
            <div style="font-size:38px;margin-bottom:12px">🔐</div>
            <h2 style="color:#d4af37;font-size:18px;font-weight:900;margin-bottom:4px">تسجيل الدخول مطلوب</h2>
            <p style="color:#888;font-size:12px;margin-bottom:24px">يجب تسجيل الدخول للوصول إلى هذه الصفحة</p>
            <input id="_auth_email" type="email" placeholder="البريد الإلكتروني"
              style="width:100%;padding:10px 14px;background:#0a0a0a;border:1.5px solid #333;border-radius:8px;color:#fff;font-family:Cairo,sans-serif;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:10px">
            <input id="_auth_pass" type="password" placeholder="كلمة المرور"
              style="width:100%;padding:10px 14px;background:#0a0a0a;border:1.5px solid #333;border-radius:8px;color:#fff;font-family:Cairo,sans-serif;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:16px">
            <button id="_auth_btn" onclick="_doLogin()"
              style="width:100%;padding:11px;background:#d4af37;color:#000;border:none;border-radius:8px;font-family:Cairo,sans-serif;font-weight:900;font-size:14px;cursor:pointer">دخول</button>
            <p id="_auth_err" style="color:#ef4444;font-size:11px;margin-top:10px;display:none"></p>
          </div>
        </div>`;
      window._doLogin = async () => {
        const btn = document.getElementById('_auth_btn');
        btn.textContent = '...'; btn.disabled = true;
        try {
          await auth.signInWithEmailAndPassword(
            document.getElementById('_auth_email').value.trim(),
            document.getElementById('_auth_pass').value
          );
          location.reload();
        } catch(e) {
          const errEl = document.getElementById('_auth_err');
          errEl.style.display = 'block';
          errEl.textContent = 'بيانات الدخول غير صحيحة';
          btn.textContent = 'دخول'; btn.disabled = false;
        }
      };
      document.getElementById('_auth_pass')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') window._doLogin();
      });
    }
  });
}

/* ── CSS injection ── */
function injectSharedCSS() {
  /* Google Font */
  if (!document.querySelector('link[data-zpos-font]')) {
    const lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.dataset.zposFont = '1';
    lnk.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(lnk);
  }

  /* Global styles */
  const style = document.createElement('style');
  style.dataset.zposShared = '1';
  style.textContent = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0d0d; --bg2:#141414; --bg3:#1c1c1c;
  --card:#1a1a1a; --card2:#202020; --card3:#252525;
  --text:#f0f0f0; --text2:#aaa; --text3:#666;
  --border:#2a2a2a; --border2:#383838;
  --gold:#d4af37; --gold2:#f0cc55; --gold-dim:rgba(212,175,55,.12);
  --green:#22c55e; --red:#ef4444; --orange:#f59e0b;
  --blue:#3b82f6; --purple:#a855f7; --cyan:#06b6d4;
  --r:8px; --r2:12px; --r3:18px;
}
html,body{height:100%;font-family:'Cairo',sans-serif;background:var(--bg);color:var(--text);font-size:14px;direction:rtl}
a{color:inherit;text-decoration:none}
button{font-family:'Cairo',sans-serif}

/* ═══ App Shell ═══ */
.app-shell{display:flex;min-height:100vh}
.page-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
.page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border);background:var(--bg2);flex-wrap:wrap;gap:10px;flex-shrink:0}
.page-header h1{font-size:16px;font-weight:900;color:var(--gold);display:flex;align-items:center;gap:8px}
.page-body{flex:1;overflow-y:auto;padding:20px}

/* ═══ Sidebar ═══ */
.zp-sidebar{width:220px;flex-shrink:0;background:var(--bg2);border-left:1px solid var(--border);display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow-y:auto}
.zp-sidebar::-webkit-scrollbar{width:3px}
.zp-sidebar::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.zp-sb-head{padding:16px 14px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px}
.zp-sb-logo{font-size:15px;font-weight:900;color:var(--gold)}
.zp-sb-sub{font-size:10px;color:var(--text3)}
.zp-sb-nav{flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:2px}
.zp-sb-link{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r);color:var(--text2);font-size:12px;font-weight:700;transition:all .15s;cursor:pointer;border:none;background:none;width:100%;text-align:right}
.zp-sb-link:hover{background:var(--card2);color:var(--text)}
.zp-sb-link.active{background:rgba(212,175,55,.12);color:var(--gold)}
.zp-sb-link i{width:16px;text-align:center;font-size:13px;flex-shrink:0}
.zp-sb-sep{height:1px;background:var(--border);margin:6px 8px}
.zp-sb-section{font-size:9.5px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;padding:8px 12px 4px}
.zp-sb-foot{padding:12px 10px;border-top:1px solid var(--border)}
.zp-sb-user{font-size:11px;color:var(--text3);font-weight:700;padding:6px 8px;display:flex;align-items:center;gap:8px}
.zp-sb-logout{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:var(--r);color:var(--red);font-size:11px;font-weight:700;background:rgba(239,68,68,.08);border:none;cursor:pointer;width:100%;margin-top:6px;font-family:Cairo,sans-serif}
.zp-sb-logout:hover{background:rgba(239,68,68,.18)}

/* Mobile sidebar toggle */
.zp-menu-toggle{display:none;background:none;border:none;color:var(--text);font-size:20px;cursor:pointer;padding:4px;margin-left:8px}
@media(max-width:768px){
  .zp-sidebar{position:fixed;top:0;right:-260px;width:250px;height:100vh;z-index:9000;transition:right .28s cubic-bezier(.4,0,.2,1);box-shadow:-4px 0 24px rgba(0,0,0,.5)}
  .zp-sidebar.open{right:0}
  .zp-menu-toggle{display:block}
  .zp-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8999}
  .zp-overlay.show{display:block}
}

/* ═══ Common UI ═══ */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:16px}
.card-title{font-size:11px;color:var(--text3);font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px}
.card-value{font-size:24px;font-weight:900;color:var(--gold)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--r);border:none;font-family:Cairo,sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .18s}
.btn-primary{background:var(--gold);color:#000}
.btn-primary:hover{background:var(--gold2)}
.btn-ghost{background:var(--bg3);color:var(--text2);border:1.5px solid var(--border)}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-sm{padding:6px 12px;font-size:11px}
.btn-danger{background:rgba(239,68,68,.12);color:var(--red);border:1px solid var(--red)}
.btn-danger:hover{background:var(--red);color:#fff}
.btn-success{background:linear-gradient(135deg,#166534,#22c55e);color:#fff}
.search-input{background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--r);color:var(--text);padding:8px 14px;font-family:Cairo,sans-serif;font-size:12px;font-weight:600;outline:none;transition:border-color .18s;width:100%;max-width:300px}
.search-input:focus{border-color:var(--gold)}

/* Spinner */
.spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .7s linear infinite;margin:24px auto}
@keyframes spin{to{transform:rotate(360deg)}}

/* Empty state */
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 16px;color:var(--text3);text-align:center;gap:12px}
.empty-state i{font-size:36px;opacity:.4}
.empty-state p{font-size:13px;font-weight:700}

/* Scrollbar */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:var(--text3)}
`;
  document.head.appendChild(style);

  /* Build sidebar */
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) {
    const currentPage = location.pathname.split('/').pop() || 'dashboard.html';
    const links = [
      { href:'dashboard.html',     icon:'fas fa-gauge',            label:'لوحة التحكم' },
      { href:'active-orders.html', icon:'fas fa-hourglass-half',   label:'الطلبات النشطة' },
      { href:'pos.html',           icon:'fas fa-cash-register',    label:'الكاشير' },
      { sep: true, label: 'إدارة' },
      { href:'customers.html',     icon:'fas fa-users',            label:'العملاء' },
      { href:'inventory.html',     icon:'fas fa-boxes-stacked',    label:'المخزون' },
      { href:'expenses.html',      icon:'fas fa-money-bill-wave',  label:'المصروفات' },
      { sep: true, label: 'النظام' },
      { href:'admin.html',         icon:'fas fa-sliders',          label:'الإدارة' },
    ];

    const navHTML = links.map(l => {
      if (l.sep) return `<div class="zp-sb-sep"></div><div class="zp-sb-section">${l.label}</div>`;
      const isActive = currentPage === l.href;
      return `<a href="${l.href}" class="zp-sb-link ${isActive ? 'active' : ''}"><i class="${l.icon}"></i> ${l.label}</a>`;
    }).join('');

    sidebarEl.innerHTML = `
      <nav class="zp-sidebar" id="zp-sidebar-nav">
        <div class="zp-sb-head">
          <div class="zp-sb-logo">⚡ كاشير الزهراء</div>
          <div class="zp-sb-sub">ZAHRAA STUDIO POS</div>
        </div>
        <div class="zp-sb-nav">${navHTML}</div>
        <div class="zp-sb-foot">
          <div class="zp-sb-user" id="zp-user-email"><i class="fas fa-circle-user"></i> <span>تحميل...</span></div>
          <button class="zp-sb-logout" onclick="firebase.auth().signOut().then(()=>location.href='dashboard.html')">
            <i class="fas fa-right-from-bracket"></i> تسجيل الخروج
          </button>
        </div>
      </nav>
      <div class="zp-overlay" id="zp-overlay" onclick="closeSidebar()"></div>`;

    auth.onAuthStateChanged(u => {
      const el = document.getElementById('zp-user-email');
      if (el && u) el.querySelector('span').textContent = u.email?.split('@')[0] || u.email;
    });
  }

  /* Mobile sidebar helpers */
  window.openSidebar = () => {
    document.getElementById('zp-sidebar-nav')?.classList.add('open');
    document.getElementById('zp-overlay')?.classList.add('show');
  };
  window.closeSidebar = () => {
    document.getElementById('zp-sidebar-nav')?.classList.remove('open');
    document.getElementById('zp-overlay')?.classList.remove('show');
  };
}
