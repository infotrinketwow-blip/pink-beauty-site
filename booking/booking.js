/* PINK — онлайн-запис на сайті.
 * Підключення: <div id="pink-booking" data-api="URL_ВЕБЗАСТОСУНКУ_APPS_SCRIPT"></div>
 *              <script src=".../booking.js" defer></script>
 * Без data-api календар працює в демо-режимі (записи не зберігаються).
 */
(function () {
'use strict';
var root = document.getElementById('pink-booking');
if (!root || root.dataset.ready) return;
root.dataset.ready = '1';
var API = (root.getAttribute('data-api') || '').trim();
var LIVE = /^https:\/\/script\.google(usercontent)?\.com\//.test(API);

/* ---------- styles (scoped to #pink-booking) ---------- */
var css = [
'#pink-booking{--pb-card:#FFF8F8;--pb-card2:#FBEFF1;--pb-ink:#2B0F1C;--pb-muted:#7A5562;--pb-line:rgba(140,47,75,.18);--pb-accent:#8C2F4B;--pb-pink:#E8A3C5;--pb-dark:#141113;--pb-ok:#2F7A55;--pb-warn:#B4532A;',
'--pb-grad:linear-gradient(135deg,#F4CADB 0%,#E39BBC 55%,#D9789F 100%);--pb-disp:"Cormorant Garamond",Georgia,serif;--pb-body:Manrope,system-ui,-apple-system,"Segoe UI",sans-serif;',
'font-family:var(--pb-body);font-size:15px;line-height:1.5;color:var(--pb-ink);text-align:left}',
'#pink-booking *{box-sizing:border-box}',
'#pink-booking button,#pink-booking input,#pink-booking select,#pink-booking textarea{font:inherit;color:inherit;margin:0}',
'#pink-booking button{cursor:pointer}',
'#pink-booking :focus-visible{outline:2px solid var(--pb-accent);outline-offset:2px}',
'#pink-booking .pb-h{font-family:var(--pb-disp);font-weight:500;line-height:1.05;margin:0;letter-spacing:0}',
'#pink-booking em{font-style:italic;color:var(--pb-accent)}',
'#pink-booking .pb-top{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:24px}',
'#pink-booking .pb-mode{display:inline-flex;padding:4px;border-radius:999px;background:var(--pb-dark);border:1px solid rgba(232,163,197,.35)}',
'#pink-booking .pb-mode button{border:0;background:transparent;color:#F6E4E1;padding:.6rem 1.2rem;border-radius:999px;font-size:.9rem;transition:background .3s,color .3s}',
'#pink-booking .pb-mode button[aria-pressed="true"]{background:var(--pb-grad);color:#2B0F1C;font-weight:600;box-shadow:0 0 18px rgba(232,163,197,.45)}',
'#pink-booking .pb-note{margin-bottom:18px;padding:12px 16px;border-radius:16px;background:rgba(255,255,255,.6);border:1px dashed rgba(140,47,75,.35);font-size:.86rem;color:var(--pb-muted)}',
'#pink-booking .pb-note b{color:var(--pb-ink)}',
'#pink-booking .pb-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:28px;align-items:start}',
'#pink-booking .pb-steps{display:flex;flex-direction:column;gap:20px;min-width:0}',
'#pink-booking .pb-step{background:var(--pb-card);border:1px solid var(--pb-line);border-radius:28px;padding:24px clamp(18px,3vw,30px);min-width:0}',
'#pink-booking .pb-step-head{display:flex;align-items:baseline;gap:12px;margin-bottom:16px}',
'#pink-booking .pb-num{font-family:var(--pb-disp);font-style:italic;font-size:1.4rem;color:var(--pb-accent);min-width:1.4rem}',
'#pink-booking .pb-step .pb-h{font-size:1.75rem}',
'#pink-booking .pb-step.is-locked{opacity:.5}',
'#pink-booking .pb-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}',
'#pink-booking .pb-chip{border:1.5px solid rgba(217,120,159,.4);background:#fff;border-radius:999px;padding:.5rem 1rem;font-size:.88rem;transition:box-shadow .25s,background .25s}',
'#pink-booking .pb-chip:hover{box-shadow:0 0 14px rgba(232,163,197,.45)}',
'#pink-booking .pb-chip[aria-pressed="true"]{background:var(--pb-grad);border-color:transparent;font-weight:600;color:#2B0F1C}',
'#pink-booking .pb-svc{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}',
'#pink-booking .pb-svc button{text-align:left;border:1px solid var(--pb-line);background:var(--pb-card2);border-radius:18px;padding:14px 16px;display:flex;flex-direction:column;gap:4px;transition:transform .25s,border-color .25s,box-shadow .25s}',
'#pink-booking .pb-svc button:hover{transform:translateY(-2px);border-color:rgba(217,120,159,.6)}',
'#pink-booking .pb-svc button[aria-pressed="true"]{border-color:var(--pb-accent);box-shadow:0 0 0 1px var(--pb-accent),0 14px 30px -18px rgba(140,47,75,.6);background:#fff}',
'#pink-booking .pb-svc-name{font-family:var(--pb-disp);font-size:1.3rem;line-height:1.15}',
'#pink-booking .pb-svc-meta{display:flex;justify-content:space-between;font-size:.84rem;color:var(--pb-muted);font-variant-numeric:tabular-nums}',
'#pink-booking .pb-svc-meta b{color:var(--pb-accent)}',
'#pink-booking .pb-masters{display:flex;gap:10px;flex-wrap:wrap}',
'#pink-booking .pb-master{display:flex;align-items:center;gap:10px;border:1px solid var(--pb-line);background:var(--pb-card2);border-radius:999px;padding:6px 16px 6px 6px;text-align:left;transition:border-color .25s,box-shadow .25s}',
'#pink-booking .pb-master[aria-pressed="true"]{border-color:var(--pb-accent);background:#fff;box-shadow:0 0 0 1px var(--pb-accent)}',
'#pink-booking .pb-ava{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--pb-grad);font-family:var(--pb-disp);font-size:1.2rem;font-weight:600;color:#2B0F1C;flex:none}',
'#pink-booking .pb-ava.is-any{background:var(--pb-dark);color:var(--pb-pink)}',
'#pink-booking .pb-master small{display:block;font-size:.75rem;color:var(--pb-muted);line-height:1.2}',
'#pink-booking .pb-dates{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin}',
'#pink-booking .pb-date{flex:none;width:64px;padding:10px 0;border-radius:18px;border:1px solid var(--pb-line);background:#fff;display:flex;flex-direction:column;align-items:center;gap:2px;transition:background .25s}',
'#pink-booking .pb-date b{font-family:var(--pb-disp);font-size:1.5rem;font-weight:600;line-height:1}',
'#pink-booking .pb-date small{font-size:.72rem;color:var(--pb-muted);text-transform:uppercase;letter-spacing:.06em}',
'#pink-booking .pb-date[aria-pressed="true"]{background:var(--pb-grad);border-color:transparent}',
'#pink-booking .pb-date:disabled{opacity:.38;cursor:not-allowed;background:transparent}',
'#pink-booking .pb-dot{width:5px;height:5px;border-radius:50%;background:var(--pb-ok)}',
'#pink-booking .pb-dot.is-none{background:transparent}',
'#pink-booking .pb-times{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:8px;margin-top:10px}',
'#pink-booking .pb-time{border:1.5px solid rgba(217,120,159,.45);background:#fff;border-radius:12px;padding:.55rem 0;font-weight:600;font-variant-numeric:tabular-nums;transition:box-shadow .2s,background .2s}',
'#pink-booking .pb-time:hover{box-shadow:0 0 14px rgba(232,163,197,.5)}',
'#pink-booking .pb-time[aria-pressed="true"]{background:var(--pb-accent);border-color:var(--pb-accent);color:#fff}',
'#pink-booking .pb-part{font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:var(--pb-muted);margin:16px 0 0}',
'#pink-booking .pb-empty{padding:18px;border-radius:18px;background:var(--pb-card2);color:var(--pb-muted);font-size:.9rem;margin-top:12px}',
'#pink-booking .pb-summary{position:sticky;top:96px;background:linear-gradient(160deg,#FCF1F3 0%,#F8E1E7 55%,#F3D2DC 100%);border:1px solid rgba(217,120,159,.4);border-radius:28px;padding:26px clamp(18px,3vw,28px);box-shadow:0 30px 60px -36px rgba(140,47,75,.5);min-width:0}',
'#pink-booking .pb-summary>.pb-h{font-size:2rem;font-style:italic;color:var(--pb-accent);padding-bottom:14px;border-bottom:1px solid rgba(140,47,75,.22)}',
'#pink-booking .pb-rows{display:flex;flex-direction:column;gap:2px;margin:12px 0 18px}',
'#pink-booking .pb-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:end;padding:6px 0;font-size:.92rem}',
'#pink-booking .pb-row::after{content:"";grid-column:2;grid-row:1;border-bottom:2px dotted rgba(140,47,75,.25);margin-bottom:.4em}',
'#pink-booking .pb-row span{grid-column:1;grid-row:1;color:var(--pb-muted)}',
'#pink-booking .pb-row b{grid-column:3;grid-row:1;text-align:right;font-weight:600;max-width:22ch}',
'#pink-booking .pb-row.is-empty b{color:rgba(43,15,28,.35);font-weight:500}',
'#pink-booking .pb-field{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}',
'#pink-booking .pb-field label{font-size:.8rem;color:var(--pb-muted);letter-spacing:.02em;margin:0;font-weight:500}',
'#pink-booking .pb-field input,#pink-booking .pb-field select,#pink-booking .pb-field textarea{border:1px solid rgba(140,47,75,.25);background:rgba(255,255,255,.85);border-radius:12px;padding:.7rem .9rem;width:100%;min-width:0;height:auto;font-size:1rem;line-height:1.4}',
'#pink-booking .pb-field textarea{resize:vertical;min-height:64px}',
'#pink-booking .pb-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:999px;padding:.9rem 1.5rem;font-weight:600;background:var(--pb-grad);color:#2B0F1C;box-shadow:0 10px 26px -12px rgba(217,120,159,.9);transition:box-shadow .3s;width:100%}',
'#pink-booking .pb-btn:hover{box-shadow:0 0 24px rgba(232,163,197,.8)}',
'#pink-booking .pb-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}',
'#pink-booking .pb-btn.is-ghost{background:transparent;border:1.5px solid rgba(140,47,75,.4);color:var(--pb-accent);box-shadow:none;width:auto}',
'#pink-booking .pb-btn.is-dark{background:var(--pb-dark);color:#F6E4E1;box-shadow:none}',
'#pink-booking .pb-btn.is-danger{background:transparent;border:1.5px solid rgba(180,83,42,.5);color:var(--pb-warn);box-shadow:none;width:auto}',
'#pink-booking .pb-msg{margin-top:12px;font-size:.88rem;padding:10px 14px;border-radius:12px}',
'#pink-booking .pb-msg.is-ok{background:rgba(47,122,85,.1);color:var(--pb-ok)}',
'#pink-booking .pb-msg.is-err{background:rgba(180,83,42,.1);color:var(--pb-warn)}',
'#pink-booking .pb-mine{margin-top:22px;padding-top:16px;border-top:1px solid rgba(140,47,75,.22)}',
'#pink-booking .pb-mine .pb-h{font-size:1.35rem;margin-bottom:8px}',
'#pink-booking .pb-mine-item{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--pb-line);font-size:.88rem}',
'#pink-booking .pb-mine-item b{display:block;font-family:var(--pb-disp);font-size:1.15rem;font-weight:600}',
'#pink-booking .pb-link{border:0;background:none;color:var(--pb-warn);text-decoration:underline;padding:4px;font-size:.84rem;flex:none}',
'#pink-booking .pb-lock{max-width:520px;margin:0 auto;background:var(--pb-card);border:1px solid var(--pb-line);border-radius:28px;padding:28px clamp(18px,4vw,36px);text-align:center}',
'#pink-booking .pb-lock>.pb-h{font-size:2rem;margin-bottom:6px}',
'#pink-booking .pb-lock .pb-masters{justify-content:center;margin:18px 0}',
'#pink-booking .pb-pin{display:flex;justify-content:center;gap:10px;margin:8px 0 18px}',
'#pink-booking .pb-pin input{width:54px;height:62px;text-align:center;font-family:var(--pb-disp);font-size:2rem;border:1.5px solid rgba(217,120,159,.5);border-radius:14px;background:#fff;padding:0}',
'#pink-booking .pb-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px}',
'#pink-booking .pb-bar .pb-h{font-size:2rem}',
'#pink-booking .pb-nav{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
'#pink-booking .pb-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:.8rem;color:var(--pb-muted);margin-bottom:10px}',
'#pink-booking .pb-legend i{display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:6px;vertical-align:-1px}',
'#pink-booking .pb-scroll{overflow-x:auto;background:var(--pb-card);border:1px solid var(--pb-line);border-radius:28px;padding:10px}',
'#pink-booking .pb-cal{display:grid;grid-template-columns:54px repeat(7,minmax(104px,1fr));min-width:800px}',
'#pink-booking .pb-ch{padding:8px 6px 10px;text-align:center;font-size:.78rem;color:var(--pb-muted);text-transform:uppercase;letter-spacing:.06em}',
'#pink-booking .pb-ch b{display:block;font-family:var(--pb-disp);font-size:1.4rem;color:var(--pb-ink);text-transform:none;letter-spacing:0}',
'#pink-booking .pb-ch.is-today b{color:var(--pb-accent)}',
'#pink-booking .pb-tl div{height:30px;font-size:.72rem;color:var(--pb-muted);text-align:right;padding-right:8px;transform:translateY(-.55em);font-variant-numeric:tabular-nums}',
'#pink-booking .pb-col{position:relative;border-left:1px solid var(--pb-line)}',
'#pink-booking .pb-cell{display:block;width:100%;height:30px;border:0;border-top:1px solid rgba(140,47,75,.07);background:transparent;padding:0}',
'#pink-booking .pb-cell:nth-child(2n+1){border-top-color:rgba(140,47,75,.16)}',
'#pink-booking .pb-cell:hover{background:rgba(232,163,197,.18)}',
'#pink-booking .pb-cell:disabled{cursor:default;background:repeating-linear-gradient(135deg,transparent 0 6px,rgba(140,47,75,.05) 6px 8px)}',
'#pink-booking .pb-ev{position:absolute;left:4px;right:4px;border-radius:10px;padding:5px 8px;font-size:.76rem;line-height:1.25;text-align:left;border:0;overflow:hidden;box-shadow:0 6px 14px -10px rgba(43,15,28,.6)}',
'#pink-booking .pb-ev b{display:block;font-weight:700;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#pink-booking .pb-ev.is-client{background:var(--pb-grad);color:#2B0F1C}',
'#pink-booking .pb-ev.is-staff{background:#F3D2DC;color:#2B0F1C;border:1px solid rgba(140,47,75,.3)}',
'#pink-booking .pb-ev.is-block{background:repeating-linear-gradient(135deg,#E9DCDF 0 8px,#F1E6E8 8px 16px);color:var(--pb-muted)}',
'#pink-booking .pb-ev.is-past{opacity:.55}',
'#pink-booking .pb-loading{opacity:.6;pointer-events:none}',
'.pb-modal{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:16px;background:rgba(20,17,19,.55);backdrop-filter:blur(6px)}',
'.pb-modal-card{width:min(460px,100%);max-height:calc(100% - 32px);overflow:auto;background:#FFF8F8;border-radius:28px;padding:24px;box-shadow:0 40px 80px -30px rgba(0,0,0,.6)}',
'.pb-modal-card>.pb-h{font-size:1.8rem;margin-bottom:12px}',
'#pink-booking .pb-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
'#pink-booking .pb-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:8px}',
'#pink-booking .pb-actions .pb-btn{width:auto}',
'#pink-booking .pb-kv{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:.92rem;margin-bottom:16px}',
'#pink-booking .pb-kv span{color:var(--pb-muted)}',
'#pink-booking .pb-seg{display:flex;gap:6px;margin-bottom:14px}',
'#pink-booking .pb-seg .pb-chip{flex:1}',
'@media (max-width:900px){#pink-booking .pb-grid{grid-template-columns:minmax(0,1fr)}#pink-booking .pb-summary{position:static}}',
'@media (max-width:479px){#pink-booking .pb-svc{grid-template-columns:1fr}#pink-booking .pb-date{width:58px}#pink-booking .pb-row2{grid-template-columns:1fr}#pink-booking .pb-pin input{width:48px;height:56px}#pink-booking .pb-mode button{padding:.55rem .9rem}}',
'@media (prefers-reduced-motion:reduce){#pink-booking *{transition:none!important}}'
].join('\n');
var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

/* ---------- salon data ---------- */
var MASTERS = [
  { id: 'anna', name: 'Анна', role: 'Топ-колористка' },
  { id: 'darina', name: 'Дарина', role: 'Стилістка, укладки' },
  { id: 'maria', name: 'Марія', role: 'Майстриня манікюру' },
  { id: 'olena', name: 'Олена', role: 'Майстриня педикюру' }];
var CATS = [{ id: 'hair', name: 'Волосся' }, { id: 'nails', name: 'Манікюр' }, { id: 'pedi', name: 'Педикюр' }];
var SERVICES = [
  { id: 'cut', cat: 'hair', name: 'Жіноча стрижка', price: 800, dur: 60, m: ['darina', 'anna'] },
  { id: 'tone', cat: 'hair', name: 'Фарбування в один тон', price: 1800, dur: 120, m: ['anna'] },
  { id: 'airtouch', cat: 'hair', name: 'AirTouch / балаяж', price: 3500, dur: 240, m: ['anna'] },
  { id: 'style', cat: 'hair', name: 'Укладка, локони', price: 600, dur: 60, m: ['darina'] },
  { id: 'care', cat: 'hair', name: 'Догляд і відновлення', price: 900, dur: 90, m: ['anna', 'darina'] },
  { id: 'event', cat: 'hair', name: 'Зачіска на подію', price: 1200, dur: 90, m: ['darina'] },
  { id: 'mani', cat: 'nails', name: 'Манікюр з покриттям', price: 650, dur: 90, m: ['maria'] },
  { id: 'french', cat: 'nails', name: 'Френч / омбре', price: 800, dur: 120, m: ['maria'] },
  { id: 'ext', cat: 'nails', name: 'Нарощування', price: 1100, dur: 150, m: ['maria'] },
  { id: 'mani0', cat: 'nails', name: 'Манікюр без покриття', price: 400, dur: 60, m: ['maria', 'olena'] },
  { id: 'remove', cat: 'nails', name: 'Зняття та укріплення', price: 250, dur: 30, m: ['maria'] },
  { id: 'smart', cat: 'pedi', name: 'Педикюр SMART', price: 850, dur: 90, m: ['olena'] },
  { id: 'pedi', cat: 'pedi', name: 'Педикюр з покриттям', price: 1000, dur: 120, m: ['olena'] },
  { id: 'express', cat: 'pedi', name: 'Експрес-покриття', price: 500, dur: 60, m: ['olena', 'maria'] },
  { id: 'spa', cat: 'pedi', name: 'SPA-догляд для стоп', price: 450, dur: 60, m: ['olena'] },
  { id: 'menpedi', cat: 'pedi', name: 'Чоловічий педикюр', price: 900, dur: 90, m: ['olena'] },
  { id: 'cracks', cat: 'pedi', name: 'Обробка тріщин', price: 300, dur: 60, m: ['olena'] }];
var OPEN = 600, CLOSE = 1200, STEP = 30, DAYS_AHEAD = 21, ROW = 30;
var DOW = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
var MON = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

/* ---------- utils ---------- */
function $(s) { return root.querySelector(s) || document.querySelector(s); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function pad(n) { return String(n).padStart(2, '0'); }
function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parse(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
function hm(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function today() { return ymd(new Date()); }
function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function isClosed(s) { return parse(s).getDay() === 0; }
function longDate(s) { var d = parse(s); return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()]; }
function durTxt(m) { return m >= 60 ? (Math.floor(m / 60) + ' год' + (m % 60 ? ' ' + m % 60 + ' хв' : '')) : m + ' хв'; }
function svc(id) { return SERVICES.find(function (s) { return s.id === id; }); }
function master(id) { return MASTERS.find(function (m) { return m.id === id; }); }
function monday(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); }
function price(n) { return n.toLocaleString('uk-UA'); }
function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

/* ---------- API ---------- */
function apiGet(params) {
  var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
  return fetch(API + (API.indexOf('?') < 0 ? '?' : '&') + q, { redirect: 'follow' }).then(function (r) { return r.json(); });
}
function apiPost(body) {
  return fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
    .then(function (r) { return r.json(); });
}

/* ---------- state ---------- */
var S = {
  mode: 'client', cat: 'hair', service: null, master: 'any', date: null, start: null,
  busy: [], mine: (store('pinkBookings') || []), msg: null, loaded: !LIVE, error: false, sending: false,
  draft: { name: '', phone: '', note: '' },
  staff: { who: null, pin: '', pinFor: 'anna', week: ymd(monday(new Date())), rows: [], err: '', loading: false }
};
var demo = [];
function demoSeed() {
  var plan = [[0, 'anna', 660, 120], [0, 'maria', 720, 90], [1, 'darina', 600, 60], [1, 'olena', 780, 120], [1, 'anna', 840, 240], [2, 'maria', 600, 150], [2, 'darina', 900, 90], [3, 'olena', 660, 60], [3, 'anna', 720, 120], [4, 'maria', 840, 90]];
  plan.forEach(function (p, i) { var d = ymd(addDays(new Date(), p[0])); if (!isClosed(d)) demo.push({ id: 'demo' + i, master: p[1], date: d, start: p[2], dur: p[3], kind: 'client', service: '', name: 'Клієнтка (приклад)', phone: '+380 00 000 00 00', note: '' }); });
}

function refresh() {
  if (!LIVE) { S.busy = demo.slice(); render(); return Promise.resolve(); }
  return apiGet({ action: 'busy', from: today() }).then(function (r) {
    if (!r.ok) throw r;
    S.busy = r.busy; S.loaded = true; S.error = false;
    var ids = {}; S.busy.forEach(function (b) { ids[b.id] = 1; });
    S.mine = S.mine.filter(function (x) { return ids[x.id] || x.date < today(); });
    store('pinkBookings', S.mine);
  }).catch(function () { S.error = true; S.loaded = true; }).then(function () { if (!document.querySelector('.pb-modal')) render(); });
}

/* ---------- availability ---------- */
function freeStarts(m, date, dur) {
  if (isClosed(date)) return [];
  var busy = S.busy.filter(function (b) { return b.master === m && b.date === date; });
  var t = date === today() ? nowMin() + 30 : -1, out = [];
  for (var s = OPEN; s + dur <= CLOSE; s += STEP) {
    if (s < t) continue;
    if (busy.some(function (b) { return s < b.start + b.dur && b.start < s + dur; })) continue;
    out.push(s);
  }
  return out;
}
function slotsFor(date) {
  var sv = svc(S.service); if (!sv) return [];
  var ms = S.master === 'any' ? sv.m : [S.master], map = {};
  ms.forEach(function (m) { freeStarts(m, date, sv.dur).forEach(function (s) { if (!(s in map)) map[s] = m; }); });
  return Object.keys(map).map(Number).sort(function (a, b) { return a - b; }).map(function (s) { return [s, map[s]]; });
}

/* ---------- render ---------- */
function render() {
  keepDraft();
  var note = '';
  if (!LIVE) note = '<b>Демо-режим.</b> Календар ще не підключено до таблиці салону, тому записи не зберігаються.';
  else if (S.error) note = '<b>Немає зв\'язку з розкладом.</b> Перевірте інтернет і оновіть сторінку або залиште заявку у формі нижче.';
  else if (!S.loaded) note = 'Завантажуємо вільні віконця…';
  root.innerHTML =
    '<div class="pb-top"><div class="pb-mode" role="group" aria-label="Режим">' +
    '<button type="button" data-mode="client" aria-pressed="' + (S.mode === 'client') + '">Я клієнтка</button>' +
    '<button type="button" data-mode="master" aria-pressed="' + (S.mode === 'master') + '">Я майстриня</button></div></div>' +
    (note ? '<div class="pb-note" role="status">' + note + '</div>' : '') +
    '<div class="pb-body"></div>';
  var body = root.querySelector('.pb-body');
  body.innerHTML = S.mode === 'client' ? clientHTML() : masterHTML();
  if (S.mode === 'master' && !S.staff.who) setTimeout(function () { var f = root.querySelector('#pb-pin0'); if (f && document.activeElement && root.contains(document.activeElement)) f.focus(); }, 30);
}

function row(k, v) { return '<div class="pb-row ' + (v ? '' : 'is-empty') + '"><span>' + k + '</span><b>' + (v ? esc(v) : '—') + '</b></div>'; }

function clientHTML() {
  var sv = svc(S.service), list = SERVICES.filter(function (s) { return s.cat === S.cat; }), dates = [];
  for (var i = 0; i < DAYS_AHEAD; i++) dates.push(ymd(addDays(new Date(), i)));
  if (sv && S.date && S.start != null && !slotsFor(S.date).some(function (x) { return x[0] === S.start; })) S.start = null;
  var slots = sv && S.date ? slotsFor(S.date) : [], ms = sv ? sv.m : [];
  var parts = [['Ранок', OPEN, 720], ['День', 720, 960], ['Вечір', 960, CLOSE]];
  var assigned = S.start != null ? (slots.find(function (x) { return x[0] === S.start; }) || [])[1] : null;
  var chosen = S.master !== 'any' ? S.master : assigned;
  var mine = S.mine.filter(function (x) { return x.date >= today(); }).sort(function (a, b) { return (a.date + hm(a.start)).localeCompare(b.date + hm(b.start)); });
  var ready = sv && S.date && S.start != null && S.loaded && !S.error && !S.sending;
  var h = '<div class="pb-grid"><div class="pb-steps">';
  h += '<section class="pb-step"><div class="pb-step-head"><span class="pb-num">i.</span><div class="pb-h" role="heading" aria-level="3">Послуга</div></div>' +
    '<div class="pb-tabs" role="group" aria-label="Категорія">' + CATS.map(function (c) { return '<button type="button" class="pb-chip" data-cat="' + c.id + '" aria-pressed="' + (S.cat === c.id) + '">' + c.name + '</button>'; }).join('') + '</div>' +
    '<div class="pb-svc">' + list.map(function (s) { return '<button type="button" data-svc="' + s.id + '" aria-pressed="' + (S.service === s.id) + '"><span class="pb-svc-name">' + esc(s.name) + '</span><span class="pb-svc-meta"><span>' + durTxt(s.dur) + '</span><b>від ' + price(s.price) + ' ₴</b></span></button>'; }).join('') + '</div></section>';
  h += '<section class="pb-step ' + (sv ? '' : 'is-locked') + '"><div class="pb-step-head"><span class="pb-num">ii.</span><div class="pb-h" role="heading" aria-level="3">Майстриня</div></div>';
  if (sv) {
    h += '<div class="pb-masters">' + (ms.length > 1 ? '<button type="button" class="pb-master" data-master="any" aria-pressed="' + (S.master === 'any') + '"><span class="pb-ava is-any">✦</span><span>Будь-яка<small>найближчий вільний час</small></span></button>' : '') +
      ms.map(function (id) { var m = master(id); return '<button type="button" class="pb-master" data-master="' + id + '" aria-pressed="' + (S.master === id || ms.length === 1) + '"><span class="pb-ava">' + m.name[0] + '</span><span>' + m.name + '<small>' + m.role + '</small></span></button>'; }).join('') + '</div>';
  } else h += '<div class="pb-empty">Спершу оберіть послугу.</div>';
  h += '</section><section class="pb-step ' + (sv ? '' : 'is-locked') + '"><div class="pb-step-head"><span class="pb-num">iii.</span><div class="pb-h" role="heading" aria-level="3">Дата і час</div></div>';
  if (sv) {
    h += '<div class="pb-dates" role="group" aria-label="Дата" data-lenis-prevent>' + dates.map(function (d) {
      var dt = parse(d), closed = isClosed(d), has = !closed && slotsFor(d).length > 0;
      return '<button type="button" class="pb-date" data-date="' + d + '" aria-pressed="' + (S.date === d) + '" ' + (closed || !has ? 'disabled' : '') + ' aria-label="' + longDate(d) + (closed ? ', вихідний' : has ? '' : ', немає вільного часу') + '"><small>' + DOW[dt.getDay()] + '</small><b>' + dt.getDate() + '</b><span class="pb-dot ' + (has ? '' : 'is-none') + '"></span></button>';
    }).join('') + '</div>';
    if (S.date) {
      h += slots.length ? parts.map(function (p) {
        var xs = slots.filter(function (x) { return x[0] >= p[1] && x[0] < p[2]; });
        return xs.length ? '<p class="pb-part">' + p[0] + '</p><div class="pb-times">' + xs.map(function (x) { return '<button type="button" class="pb-time" data-start="' + x[0] + '" aria-pressed="' + (S.start === x[0]) + '">' + hm(x[0]) + '</button>'; }).join('') + '</div>' : '';
      }).join('') : '<div class="pb-empty">На цей день вільних віконець немає. Оберіть іншу дату.</div>';
    } else h += '<div class="pb-empty">Оберіть дату. Зелена крапка означає, що є вільний час. Неділя вихідний.</div>';
  } else h += '<div class="pb-empty">Спершу оберіть послугу.</div>';
  h += '</section></div>';
  h += '<aside class="pb-summary"><div class="pb-h" role="heading" aria-level="3">Ваш запис</div><div class="pb-rows">' +
    row('Послуга', sv ? sv.name : null) + row('Майстриня', chosen ? master(chosen).name : (sv && S.master === 'any' ? 'будь-яка' : null)) +
    row('Дата', S.date ? longDate(S.date) : null) + row('Час', S.start != null && sv ? hm(S.start) + ' – ' + hm(S.start + sv.dur) : null) +
    row('Вартість', sv ? 'від ' + price(sv.price) + ' ₴' : null) + '</div>' +
    '<form class="pb-form" novalidate>' +
    '<div class="pb-field"><label for="pb-name">Ваше ім\'я</label><input id="pb-name" autocomplete="given-name" maxlength="60" value="' + esc(S.draft.name) + '"></div>' +
    '<div class="pb-field"><label for="pb-phone">Телефон</label><input id="pb-phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="+380" value="' + esc(S.draft.phone) + '"></div>' +
    '<div class="pb-field"><label for="pb-note">Побажання (необов\'язково)</label><textarea id="pb-note" maxlength="300">' + esc(S.draft.note) + '</textarea></div>' +
    '<button class="pb-btn" type="submit" ' + (ready ? '' : 'disabled') + '>' + (S.sending ? 'Записуємо…' : 'Записатися') + '</button></form>' +
    (S.msg ? '<div class="pb-msg ' + (S.msg.ok ? 'is-ok' : 'is-err') + '" role="status">' + esc(S.msg.text) + '</div>' : '') +
    (mine.length ? '<div class="pb-mine"><div class="pb-h" role="heading" aria-level="4">Мої записи</div>' + mine.map(function (x) {
      return '<div class="pb-mine-item"><div><b>' + esc((svc(x.service) || {}).name || 'Запис') + '</b>' + longDate(x.date) + ', ' + hm(x.start) + ' · ' + esc((master(x.master) || {}).name || '') + '</div><button type="button" class="pb-link" data-cancel="' + esc(x.id) + '">Скасувати</button></div>';
    }).join('') + '</div>' : '') + '</aside></div>';
  return h;
}

function masterHTML() {
  var st = S.staff;
  if (!st.who) {
    return '<section class="pb-lock"><div class="pb-h" role="heading" aria-level="3">Розклад <em>майстрині</em></div>' +
      '<p style="color:var(--pb-muted);margin:0">Оберіть себе і введіть свій PIN-код.</p>' +
      '<div class="pb-masters">' + MASTERS.map(function (m) { return '<button type="button" class="pb-master" data-pinfor="' + m.id + '" aria-pressed="' + (st.pinFor === m.id) + '"><span class="pb-ava">' + m.name[0] + '</span><span>' + m.name + '</span></button>'; }).join('') + '</div>' +
      '<form class="pb-pinform"><div class="pb-pin">' + [0, 1, 2, 3].map(function (i) { return '<input id="pb-pin' + i + '" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Цифра ' + (i + 1) + '">'; }).join('') + '</div>' +
      '<button class="pb-btn is-dark" type="submit" ' + (st.loading ? 'disabled' : '') + '>' + (st.loading ? 'Перевіряємо…' : 'Відкрити розклад') + '</button></form>' +
      (st.err ? '<div class="pb-msg is-err" role="alert">' + esc(st.err) + '</div>' : '') +
      (!LIVE ? '<p style="color:var(--pb-muted);font-size:.84rem;margin:14px 0 0">У демо-режимі підходить будь-який PIN.</p>' : '') + '</section>';
  }
  var m = master(st.who), ws = parse(st.week), days = [];
  for (var i = 0; i < 7; i++) days.push(ymd(addDays(ws, i)));
  var tdy = today(), nm = nowMin(), rows = (CLOSE - OPEN) / STEP;
  var mine = st.rows.filter(function (b) { return b.date >= days[0] && b.date <= days[6]; });
  var count = mine.filter(function (b) { return b.kind !== 'block'; }).length;
  var canBack = st.week > ymd(monday(new Date()));
  var h = '<div class="pb-bar ' + (st.loading ? 'pb-loading' : '') + '"><div><div class="pb-h" role="heading" aria-level="3">' + m.name + ', <em>ваш тиждень</em></div><div style="color:var(--pb-muted);font-size:.9rem">' +
    parse(days[0]).getDate() + ' ' + MON[parse(days[0]).getMonth()] + ' – ' + parse(days[6]).getDate() + ' ' + MON[parse(days[6]).getMonth()] + ' · записів: ' + count + (st.loading ? ' · оновлюємо…' : '') + '</div></div>' +
    '<div class="pb-nav"><button class="pb-btn is-ghost" type="button" data-week="-1" ' + (canBack ? '' : 'disabled') + ' aria-label="Попередній тиждень">←</button>' +
    '<button class="pb-btn is-ghost" type="button" data-week="0">Сьогодні</button><button class="pb-btn is-ghost" type="button" data-week="1" aria-label="Наступний тиждень">→</button>' +
    '<button class="pb-btn is-ghost" type="button" data-act="pin">Змінити PIN</button><button class="pb-btn is-ghost" type="button" data-act="logout">Вийти</button></div></div>' +
    '<div class="pb-legend"><span><i style="background:var(--pb-grad)"></i>Онлайн-запис клієнтки</span><span><i style="background:#F3D2DC;border:1px solid rgba(140,47,75,.3)"></i>Записала майстриня</span><span><i style="background:#E9DCDF"></i>Закритий час</span><span>Натисніть на вільну клітинку, щоб додати запис</span></div>' +
    '<div class="pb-scroll" data-lenis-prevent><div class="pb-cal"><div></div>' +
    days.map(function (d) { var dt = parse(d); return '<div class="pb-ch ' + (d === tdy ? 'is-today' : '') + '">' + DOW[dt.getDay()] + '<b>' + dt.getDate() + '</b></div>'; }).join('') +
    '<div class="pb-tl">';
  for (var r = 0; r < rows; r++) h += '<div>' + (r % 2 === 0 ? hm(OPEN + r * STEP) : '') + '</div>';
  h += '</div>';
  days.forEach(function (d) {
    var closed = isClosed(d);
    h += '<div class="pb-col">';
    for (var r = 0; r < rows; r++) { var s = OPEN + r * STEP, past = d < tdy || (d === tdy && s + STEP <= nm); h += '<button type="button" class="pb-cell" data-cell="' + d + '|' + s + '" ' + (closed || past ? 'disabled' : '') + ' aria-label="' + longDate(d) + ' ' + hm(s) + (closed ? ', вихідний' : '') + '"></button>'; }
    mine.filter(function (b) { return b.date === d; }).forEach(function (b) {
      var sv = svc(b.service), past = b.date < tdy || (b.date === tdy && b.start + b.dur <= nm);
      var title = b.kind === 'block' ? (b.note || 'Закритий час') : (b.name || 'Клієнтка');
      h += '<button type="button" class="pb-ev is-' + b.kind + ' ' + (past ? 'is-past' : '') + '" data-ev="' + esc(b.id) + '" style="top:' + ((b.start - OPEN) / STEP * ROW + 1) + 'px;height:' + (b.dur / STEP * ROW - 3) + 'px"><b>' + esc(title) + '</b>' + hm(b.start) + '–' + hm(b.start + b.dur) + (sv && b.dur >= 60 ? '<br>' + esc(sv.name) : '') + '</button>';
    });
    h += '</div>';
  });
  return h + '</div></div>';
}

/* ---------- client actions ---------- */
function keepDraft() {
  var n = root.querySelector('#pb-name');
  if (n) { S.draft.name = n.value; S.draft.phone = root.querySelector('#pb-phone').value; S.draft.note = root.querySelector('#pb-note').value; }
}
function submitClient() {
  keepDraft();
  var sv = svc(S.service); if (!sv || !S.date || S.start == null) return;
  var name = S.draft.name.trim(), phone = S.draft.phone.trim();
  if (name.length < 2) { S.msg = { ok: false, text: "Вкажіть, будь ласка, ім'я." }; return render(); }
  if (phone.replace(/\D/g, '').length < 9) { S.msg = { ok: false, text: 'Перевірте номер телефону: потрібно щонайменше 9 цифр.' }; return render(); }
  var slot = slotsFor(S.date).find(function (x) { return x[0] === S.start; });
  if (!slot) { S.msg = { ok: false, text: 'Цей час щойно зайняли. Оберіть інший.' }; S.start = null; return render(); }
  var req = { action: 'book', master: slot[1], date: S.date, start: S.start, dur: sv.dur, service: sv.id, name: name, phone: phone, note: S.draft.note.trim() };
  S.sending = true; S.msg = null; render();
  var done = function (r) {
    S.sending = false;
    if (r.ok) {
      S.mine.push({ id: r.id, token: r.token, service: sv.id, master: req.master, date: req.date, start: req.start });
      store('pinkBookings', S.mine);
      S.msg = { ok: true, text: 'Готово! ' + master(req.master).name + ' чекає на вас ' + longDate(req.date) + ' о ' + hm(req.start) + '.' + (LIVE ? '' : ' (демо, запис не збережено)') };
      S.start = null; S.draft.note = '';
    } else {
      S.msg = { ok: false, text: r.error === 'taken' ? 'Цей час щойно зайняли. Оберіть інший.' : r.error === 'busy' ? 'Саме зараз хтось записується. Спробуйте ще раз за мить.' : 'Не вдалося записатися. Спробуйте ще раз або залиште заявку у формі нижче.' };
    }
    return refresh();
  };
  if (!LIVE) {
    var id = 'demo' + Date.now();
    demo.push({ id: id, master: req.master, date: req.date, start: req.start, dur: req.dur, kind: 'client', service: req.service, name: req.name, phone: req.phone, note: req.note });
    return done({ ok: true, id: id, token: 'demo' });
  }
  apiPost(req).then(done).catch(function () { done({ ok: false, error: 'network' }); });
}
function cancelMine(id) {
  var x = S.mine.find(function (m) { return m.id === id; }); if (!x) return;
  var fin = function (ok) {
    S.mine = S.mine.filter(function (m) { return m.id !== id; }); store('pinkBookings', S.mine);
    S.msg = ok ? { ok: true, text: 'Запис скасовано.' } : { ok: false, text: 'Не вдалося скасувати. Зателефонуйте в салон.' };
    return refresh();
  };
  if (!LIVE) { demo = demo.filter(function (d) { return d.id !== id; }); return fin(true); }
  apiPost({ action: 'cancel', id: id, token: x.token }).then(function (r) { fin(r.ok || r.error === 'not_found'); }).catch(function () { S.msg = { ok: false, text: 'Немає зв\'язку. Спробуйте ще раз.' }; render(); });
}

/* ---------- master actions ---------- */
function weekRange() { var ws = parse(S.staff.week); return { from: ymd(ws), to: ymd(addDays(ws, 6)) }; }
function staffCall(body) {
  var st = S.staff;
  if (!LIVE) return Promise.resolve(demoStaff(body));
  body.master = st.who || st.pinFor; body.pin = st.pin;
  return apiPost(body);
}
function demoStaff(b) {
  var who = S.staff.who || S.staff.pinFor;
  if (b.action === 'staff_list') return { ok: true, rows: demo.filter(function (d) { return d.master === who; }) };
  if (b.action === 'staff_add') {
    var clash = demo.some(function (d) { return d.master === who && d.date === b.date && b.start < d.start + d.dur && d.start < b.start + b.dur; });
    if (clash) return { ok: false, error: 'taken' };
    demo.push({ id: 'demo' + Date.now(), master: who, date: b.date, start: b.start, dur: b.dur, kind: b.kind, service: b.service, name: b.name, phone: b.phone, note: b.note });
    return { ok: true };
  }
  if (b.action === 'staff_delete') { demo = demo.filter(function (d) { return d.id !== b.id; }); return { ok: true }; }
  return { ok: true };
}
function loadStaff() {
  var st = S.staff, r = weekRange(); st.loading = true; render();
  return staffCall({ action: 'staff_list', from: r.from, to: r.to }).then(function (res) {
    st.loading = false;
    if (!res.ok) { st.who = null; st.pin = ''; st.err = res.error === 'pin' ? 'Неправильний PIN. Спробуйте ще раз.' : 'Не вдалося завантажити розклад.'; }
    else { st.rows = res.rows; st.err = ''; }
    render();
  }).catch(function () { st.loading = false; st.err = 'Немає зв\'язку з розкладом. Спробуйте ще раз.'; if (!st.rows.length) st.who = null; render(); });
}
function unlock() {
  var st = S.staff, pin = [0, 1, 2, 3].map(function (i) { return root.querySelector('#pb-pin' + i).value; }).join('');
  if (!/^\d{4}$/.test(pin)) { st.err = 'Введіть 4 цифри.'; return render(); }
  st.pin = pin; st.who = st.pinFor; st.err = ''; st.rows = [];
  loadStaff();
}

/* ---------- modals ---------- */
var modalRoot = document.createElement('div'); modalRoot.id = 'pink-booking-modal';
document.body.appendChild(modalRoot);
function closeModal() { modalRoot.innerHTML = ''; }
function modal(html) {
  modalRoot.innerHTML = '<div class="pb-modal" role="dialog" aria-modal="true" data-lenis-prevent><div class="pb-modal-card" id="pink-booking-m">' + html + '</div></div>';
  // reuse scoped styles: give the card the widget id-scope via a wrapper class
  var card = modalRoot.querySelector('.pb-modal-card');
  card.setAttribute('data-scope', '1');
  var f = card.querySelector('input,select,button'); if (f) f.focus();
}
// modal content uses the same component classes; extend scope:
st.textContent += '\n' + css.split('\n').filter(function (l) { return l.indexOf('#pink-booking .pb-') === 0; }).map(function (l) { return l.replace(/#pink-booking /g, '#pink-booking-m '); }).join('\n') +
  '\n#pink-booking-m{font-family:Manrope,system-ui,sans-serif;color:#2B0F1C;font-size:15px;line-height:1.5;--pb-card2:#FBEFF1;--pb-muted:#7A5562;--pb-line:rgba(140,47,75,.18);--pb-accent:#8C2F4B;--pb-dark:#141113;--pb-warn:#B4532A;--pb-ok:#2F7A55;--pb-grad:linear-gradient(135deg,#F4CADB 0%,#E39BBC 55%,#D9789F 100%);--pb-disp:"Cormorant Garamond",Georgia,serif}' +
  '\n#pink-booking-m *{box-sizing:border-box}#pink-booking-m button,#pink-booking-m input,#pink-booking-m select{font:inherit;color:inherit;margin:0}#pink-booking-m button{cursor:pointer}#pink-booking-m .pb-h{font-family:var(--pb-disp);font-weight:500;line-height:1.05;margin:0 0 12px;font-size:1.8rem}';

function openAdd(date, start) {
  var who = S.staff.who, list = SERVICES.filter(function (s) { return s.m.indexOf(who) >= 0; }), times = [];
  for (var s = OPEN; s < CLOSE; s += STEP) times.push(s);
  modal('<div class="pb-h">Новий запис</div><p style="margin:-6px 0 14px;color:#7A5562">' + longDate(date) + '</p>' +
    '<div class="pb-seg" role="group"><button type="button" class="pb-chip" data-kind="staff" aria-pressed="true">Клієнтка</button><button type="button" class="pb-chip" data-kind="block" aria-pressed="false">Закрити час</button></div>' +
    '<form class="pb-addform"><div class="pb-cf">' +
    '<div class="pb-field"><label for="pa-name">Ім\'я клієнтки</label><input id="pa-name" maxlength="60"></div>' +
    '<div class="pb-field"><label for="pa-phone">Телефон</label><input id="pa-phone" type="tel" maxlength="20"></div>' +
    '<div class="pb-field"><label for="pa-svc">Послуга</label><select id="pa-svc">' + list.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + ' · ' + durTxt(s.dur) + '</option>'; }).join('') + '<option value="">Інше</option></select></div></div>' +
    '<div class="pb-bf" hidden><div class="pb-field"><label for="pa-note">Причина</label><input id="pa-note" maxlength="40" value="Перерва"></div></div>' +
    '<div class="pb-row2"><div class="pb-field"><label for="pa-start">Початок</label><select id="pa-start">' + times.map(function (t) { return '<option value="' + t + '"' + (t === start ? ' selected' : '') + '>' + hm(t) + '</option>'; }).join('') + '</select></div>' +
    '<div class="pb-field"><label for="pa-dur">Тривалість</label><select id="pa-dur">' + [30, 60, 90, 120, 150, 180, 240, 300].map(function (d) { return '<option value="' + d + '">' + durTxt(d) + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="pb-err"></div><div class="pb-actions"><button type="button" class="pb-btn is-ghost" data-close>Скасувати</button><button type="submit" class="pb-btn">Зберегти</button></div></form>');
  var q = function (s) { return modalRoot.querySelector(s); }, kind = 'staff';
  var syncDur = function () { var s = svc(q('#pa-svc').value); if (s) q('#pa-dur').value = String(s.dur); }; syncDur();
  q('#pa-svc').addEventListener('change', syncDur);
  modalRoot.querySelectorAll('[data-kind]').forEach(function (b) {
    b.addEventListener('click', function () {
      kind = b.dataset.kind;
      modalRoot.querySelectorAll('[data-kind]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      q('.pb-cf').hidden = kind !== 'staff'; q('.pb-bf').hidden = kind !== 'block';
      if (kind === 'block') q('#pa-dur').value = '60'; else syncDur();
    });
  });
  q('.pb-addform').addEventListener('submit', function (e) {
    e.preventDefault();
    var st0 = +q('#pa-start').value, du = +q('#pa-dur').value, err = function (t) { q('.pb-err').innerHTML = '<div class="pb-msg is-err">' + esc(t) + '</div>'; };
    if (st0 + du > CLOSE) return err('Запис має закінчитися до 20:00.');
    var body = { action: 'staff_add', date: date, start: st0, dur: du, kind: kind };
    if (kind === 'staff') { body.name = q('#pa-name').value.trim(); body.phone = q('#pa-phone').value.trim(); body.service = q('#pa-svc').value; if (!body.name) return err("Вкажіть ім'я клієнтки."); }
    else body.note = q('#pa-note').value.trim() || 'Закритий час';
    var btn = q('.pb-addform [type=submit]'); btn.disabled = true; btn.textContent = 'Зберігаємо…';
    staffCall(body).then(function (r) {
      if (r.ok) { closeModal(); loadStaff(); refresh(); return; }
      btn.disabled = false; btn.textContent = 'Зберегти';
      err(r.error === 'taken' ? 'Цей час перетинається з іншим записом.' : r.error === 'pin' ? 'PIN більше не дійсний. Увійдіть знову.' : 'Не вдалося зберегти.');
    }).catch(function () { btn.disabled = false; btn.textContent = 'Зберегти'; err('Немає зв\'язку. Спробуйте ще раз.'); });
  });
}
function openEvent(id) {
  var b = S.staff.rows.find(function (x) { return x.id === id; }); if (!b) return;
  var sv = svc(b.service);
  modal('<div class="pb-h">' + (b.kind === 'block' ? 'Закритий час' : esc(b.name || 'Запис')) + '</div><div class="pb-kv">' +
    '<span>Дата</span><b>' + longDate(b.date) + '</b><span>Час</span><b>' + hm(b.start) + ' – ' + hm(b.start + b.dur) + '</b>' +
    (b.kind !== 'block' ? '<span>Послуга</span><b>' + esc(sv ? sv.name : 'Інше') + '</b><span>Телефон</span><b>' + esc(b.phone || '—') + '</b>' + (b.note ? '<span>Побажання</span><b>' + esc(b.note) + '</b>' : '') + '<span>Джерело</span><b>' + (b.kind === 'client' ? 'Онлайн-запис' : 'Записала майстриня') + '</b>' : '<span>Причина</span><b>' + esc(b.note || '') + '</b>') +
    '</div><div class="pb-err"></div><div class="pb-actions"><button type="button" class="pb-btn is-danger" data-del>' + (b.kind === 'block' ? 'Відкрити час' : 'Скасувати запис') + '</button><button type="button" class="pb-btn is-ghost" data-close>Закрити</button></div>');
  var armed = false, del = modalRoot.querySelector('[data-del]');
  del.addEventListener('click', function () {
    if (!armed) { armed = true; del.textContent = 'Натисніть ще раз, щоб підтвердити'; return; }
    del.disabled = true;
    staffCall({ action: 'staff_delete', id: id }).then(function (r) {
      if (r.ok || r.error === 'not_found') { closeModal(); loadStaff(); refresh(); }
      else { del.disabled = false; modalRoot.querySelector('.pb-err').innerHTML = '<div class="pb-msg is-err">Не вдалося видалити.</div>'; }
    }).catch(function () { del.disabled = false; modalRoot.querySelector('.pb-err').innerHTML = '<div class="pb-msg is-err">Немає зв\'язку.</div>'; });
  });
}
function openChangePin() {
  modal('<div class="pb-h">Новий PIN</div><form class="pb-cpform"><div class="pb-field"><label for="pa-cp">4 цифри</label><input id="pa-cp" inputmode="numeric" maxlength="4" autocomplete="off"></div><div class="pb-err"></div>' +
    '<div class="pb-actions"><button type="button" class="pb-btn is-ghost" data-close>Скасувати</button><button class="pb-btn" type="submit">Зберегти</button></div></form>');
  modalRoot.querySelector('.pb-cpform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = modalRoot.querySelector('#pa-cp').value.trim(), err = modalRoot.querySelector('.pb-err');
    if (!/^\d{4}$/.test(v)) { err.innerHTML = '<div class="pb-msg is-err">PIN має складатися з 4 цифр.</div>'; return; }
    staffCall({ action: 'change_pin', newPin: v }).then(function (r) {
      if (r.ok) { S.staff.pin = v; err.innerHTML = '<div class="pb-msg is-ok">PIN змінено.</div>'; setTimeout(closeModal, 900); }
      else err.innerHTML = '<div class="pb-msg is-err">Не вдалося змінити PIN.</div>';
    }).catch(function () { err.innerHTML = '<div class="pb-msg is-err">Немає зв\'язку.</div>'; });
  });
}

/* ---------- events ---------- */
root.addEventListener('click', function (e) {
  var t = e.target.closest('button'); if (!t || !root.contains(t)) return;
  var d = t.dataset;
  if (d.mode) { S.mode = d.mode; S.msg = null; return render(); }
  if (S.mode === 'client') {
    if (d.cat) { S.cat = d.cat; return render(); }
    if (d.svc) { var s = svc(d.svc); S.service = s.id; S.master = s.m.length > 1 ? 'any' : s.m[0]; S.start = null; S.msg = null; if (S.date && !slotsFor(S.date).length) S.date = null; return render(); }
    if (d.master) { S.master = d.master; S.start = null; return render(); }
    if (d.date) { S.date = d.date; S.start = null; S.msg = null; return render(); }
    if (d.start) { S.start = +d.start; S.msg = null; return render(); }
    if (d.cancel) { if (d.armed !== '1') { t.dataset.armed = '1'; t.textContent = 'Точно скасувати?'; return; } return cancelMine(d.cancel); }
  } else {
    if (d.pinfor) { S.staff.pinFor = d.pinfor; S.staff.err = ''; return render(); }
    if (d.week) { var w = +d.week; S.staff.week = w === 0 ? ymd(monday(new Date())) : ymd(addDays(parse(S.staff.week), 7 * w)); return loadStaff(); }
    if (d.act === 'logout') { S.staff.who = null; S.staff.pin = ''; S.staff.rows = []; return render(); }
    if (d.act === 'pin') return openChangePin();
    if (d.cell) { var p = d.cell.split('|'); return openAdd(p[0], +p[1]); }
    if (d.ev) return openEvent(d.ev);
  }
});
root.addEventListener('submit', function (e) {
  e.preventDefault();
  if (e.target.classList.contains('pb-form')) submitClient();
  if (e.target.classList.contains('pb-pinform')) unlock();
});
root.addEventListener('input', function (e) {
  var m = e.target.id && e.target.id.match(/^pb-pin(\d)$/);
  if (!m) return;
  e.target.value = e.target.value.replace(/\D/g, '').slice(-1);
  var n = root.querySelector('#pb-pin' + (+m[1] + 1));
  if (e.target.value && n) n.focus();
  if (e.target.value && !n) unlock();
});
root.addEventListener('keydown', function (e) {
  var m = e.target.id && e.target.id.match(/^pb-pin(\d)$/);
  if (m && e.key === 'Backspace' && !e.target.value) { var p = root.querySelector('#pb-pin' + (+m[1] - 1)); if (p) p.focus(); }
});
modalRoot.addEventListener('click', function (e) {
  if (e.target.classList.contains('pb-modal') || e.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modalRoot.innerHTML) closeModal(); });
setInterval(function () {
  var a = document.activeElement;
  if (modalRoot.innerHTML || (a && root.contains(a) && /INPUT|TEXTAREA/.test(a.tagName))) return;
  if (S.mode === 'client') refresh(); else if (S.staff.who) loadStaff();
}, 60000);

/* ---------- boot ---------- */
demoSeed();
render();
refresh();
})();
