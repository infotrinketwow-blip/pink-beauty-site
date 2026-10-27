/**
 * PINK — сервер онлайн-запису (Google Apps Script + Google Таблиця).
 *
 * Аркуш «Записи»   — усі записи (онлайн, від майстринь, закритий час).
 * Аркуш «Майстрині» — id майстрині, ім'я, PIN-код (можна змінювати прямо в таблиці).
 *
 * Розгортання: Розгорнути → Нове розгортання → Вебзастосунок,
 * «Виконувати від імені: я», «Доступ: усі». Скопіюйте URL і вставте на сайт.
 */

var SHEET_BOOKINGS = 'Записи';
var SHEET_STAFF = 'Майстрині';
var COLS = ['id', 'master', 'date', 'start', 'dur', 'kind', 'service', 'name', 'phone', 'note', 'token', 'createdAt'];
var HEAD_UA = ['ID', 'Майстриня', 'Дата', 'Початок (хв)', 'Тривалість (хв)', 'Тип', 'Послуга', "Ім'я", 'Телефон', 'Побажання', 'Код скасування', 'Створено'];
var DEFAULT_STAFF = [['anna', 'Анна', '1111'], ['darina', 'Дарина', '4444'], ['maria', 'Марія', '2222'], ['olena', 'Олена', '3333']];
var OPEN = 600, CLOSE = 1200;

/* ---------- setup (runs automatically on first request) ---------- */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var b = ss.getSheetByName(SHEET_BOOKINGS);
  if (!b) {
    b = ss.insertSheet(SHEET_BOOKINGS);
    b.getRange(1, 1, 1, HEAD_UA.length).setValues([HEAD_UA]).setFontWeight('bold').setBackground('#F3D2DC');
    b.getRange('A:L').setNumberFormat('@');
    b.setFrozenRows(1);
  }
  var s = ss.getSheetByName(SHEET_STAFF);
  if (!s) {
    s = ss.insertSheet(SHEET_STAFF);
    s.getRange('A:C').setNumberFormat('@');
    s.getRange(1, 1, 1, 3).setValues([['ID', "Ім'я", 'PIN']]).setFontWeight('bold').setBackground('#F3D2DC');
    s.getRange(2, 1, DEFAULT_STAFF.length, 3).setValues(DEFAULT_STAFF);
    s.setFrozenRows(1);
  }
  var first = ss.getSheetByName('Аркуш1') || ss.getSheetByName('Sheet1');
  if (first && ss.getSheets().length > 2 && first.getLastRow() === 0) ss.deleteSheet(first);
}

/* ---------- http ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    setup();
    if (p.action === 'busy') return out({ ok: true, busy: busy(p.from || today()) });
    return out({ ok: true, service: 'pink-booking' });
  } catch (err) { return out({ ok: false, error: 'server', message: String(err) }); }
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (x) { return out({ ok: false, error: 'bad_request' }); }
  try {
    setup();
    switch (body.action) {
      case 'book': return out(book(body));
      case 'cancel': return out(cancel(body));
      case 'staff_list': return out(staffOnly(body, function () { return { ok: true, rows: staffList(body) }; }));
      case 'staff_add': return out(staffOnly(body, function () { return staffAdd(body); }));
      case 'staff_delete': return out(staffOnly(body, function () { return staffDelete(body); }));
      case 'change_pin': return out(staffOnly(body, function () { return changePin(body); }));
      default: return out({ ok: false, error: 'bad_request' });
    }
  } catch (err) { return out({ ok: false, error: 'server', message: String(err) }); }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- data helpers ---------- */
function sheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function tz() { return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || 'Europe/Kyiv'; }
function today() { return Utilities.formatDate(new Date(), tz(), 'yyyy-MM-dd'); }
function normDate(v) { return v instanceof Date ? Utilities.formatDate(v, tz(), 'yyyy-MM-dd') : String(v); }

function rows() {
  var sh = sheet(SHEET_BOOKINGS), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLS.length).getValues().map(function (r, i) {
    var o = { _row: i + 2 };
    COLS.forEach(function (c, j) { o[c] = r[j]; });
    o.date = normDate(o.date); o.start = Number(o.start); o.dur = Number(o.dur);
    return o;
  }).filter(function (o) { return o.id; });
}

function busy(from) {
  return rows().filter(function (r) { return r.date >= from; }).map(function (r) {
    return { id: String(r.id), master: String(r.master), date: r.date, start: r.start, dur: r.dur, kind: String(r.kind), service: String(r.service) };
  });
}

function overlaps(master, date, start, dur, exceptId) {
  return rows().some(function (r) {
    return String(r.master) === master && r.date === date && String(r.id) !== exceptId && start < r.start + r.dur && r.start < start + dur;
  });
}

function clean(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function isDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }
function newId() { return 'b' + new Date().getTime().toString(36) + Math.random().toString(36).slice(2, 7); }

function validSlot(b) {
  var start = Number(b.start), dur = Number(b.dur);
  if (!isDate(b.date) || isNaN(start) || isNaN(dur) || dur < 30 || dur > 600) return false;
  if (start < OPEN || start + dur > CLOSE || start % 30 !== 0) return false;
  return staffPins()[String(b.master)] !== undefined;
}

function append(o) {
  var line = COLS.map(function (c) { return o[c] == null ? '' : String(o[c]); });
  sheet(SHEET_BOOKINGS).appendRow(line);
}

/* ---------- client actions ---------- */
function book(b) {
  if (!validSlot(b) || String(b.date) < today()) return { ok: false, error: 'bad_request' };
  var name = clean(b.name, 60), phone = clean(b.phone, 20);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 9) return { ok: false, error: 'bad_request' };
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { ok: false, error: 'busy' };
  try {
    if (overlaps(String(b.master), b.date, Number(b.start), Number(b.dur), '')) return { ok: false, error: 'taken' };
    var o = { id: newId(), master: b.master, date: b.date, start: Number(b.start), dur: Number(b.dur), kind: 'client',
      service: clean(b.service, 40), name: name, phone: phone, note: clean(b.note, 300),
      token: Utilities.getUuid(), createdAt: new Date().toISOString() };
    append(o);
    return { ok: true, id: o.id, token: o.token };
  } finally { lock.releaseLock(); }
}

function cancel(b) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { ok: false, error: 'busy' };
  try {
    var r = rows().filter(function (x) { return String(x.id) === String(b.id); })[0];
    if (!r || !b.token || String(r.token) !== String(b.token)) return { ok: false, error: 'not_found' };
    sheet(SHEET_BOOKINGS).deleteRow(r._row);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/* ---------- staff actions ---------- */
function staffPins() {
  var sh = sheet(SHEET_STAFF), n = sh.getLastRow(), map = {};
  if (n < 2) return map;
  sh.getRange(2, 1, n - 1, 3).getValues().forEach(function (r) { if (r[0]) map[String(r[0]).trim()] = String(r[2]).trim(); });
  return map;
}

function staffOnly(b, fn) {
  var pins = staffPins(), m = String(b.master || '');
  if (!m || pins[m] === undefined || !b.pin || String(b.pin) !== pins[m]) {
    Utilities.sleep(700); // slows down PIN guessing
    return { ok: false, error: 'pin' };
  }
  return fn();
}

function staffList(b) {
  var from = isDate(b.from) ? b.from : today(), to = isDate(b.to) ? b.to : '9999-12-31';
  return rows().filter(function (r) { return String(r.master) === String(b.master) && r.date >= from && r.date <= to; })
    .map(function (r) {
      return { id: String(r.id), master: String(r.master), date: r.date, start: r.start, dur: r.dur, kind: String(r.kind),
        service: String(r.service), name: String(r.name), phone: String(r.phone), note: String(r.note) };
    });
}

function staffAdd(b) {
  var kind = b.kind === 'block' ? 'block' : 'staff';
  if (!validSlot(b)) return { ok: false, error: 'bad_request' };
  if (kind === 'staff' && clean(b.name, 60).length < 1) return { ok: false, error: 'bad_request' };
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { ok: false, error: 'busy' };
  try {
    if (overlaps(String(b.master), b.date, Number(b.start), Number(b.dur), '')) return { ok: false, error: 'taken' };
    var o = { id: newId(), master: b.master, date: b.date, start: Number(b.start), dur: Number(b.dur), kind: kind,
      service: clean(b.service, 40), name: clean(b.name, 60), phone: clean(b.phone, 20), note: clean(b.note, 300),
      token: '', createdAt: new Date().toISOString() };
    append(o);
    return { ok: true, id: o.id };
  } finally { lock.releaseLock(); }
}

function staffDelete(b) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { ok: false, error: 'busy' };
  try {
    var r = rows().filter(function (x) { return String(x.id) === String(b.id) && String(x.master) === String(b.master); })[0];
    if (!r) return { ok: false, error: 'not_found' };
    sheet(SHEET_BOOKINGS).deleteRow(r._row);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function changePin(b) {
  if (!/^\d{4}$/.test(String(b.newPin || ''))) return { ok: false, error: 'bad_request' };
  var sh = sheet(SHEET_STAFF), n = sh.getLastRow();
  var ids = sh.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(b.master)) { sh.getRange(i + 2, 3).setValue(String(b.newPin)); return { ok: true }; }
  }
  return { ok: false, error: 'not_found' };
}
