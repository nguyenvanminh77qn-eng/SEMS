/* =========================================================
   SEMS – AUTH CORE (dùng chung cho mọi trang trong pages/auth)

   Gồm:
   1. Cấu hình
   2. Kho dữ liệu DEMO (localStorage) + lớp API giả lập  <-- chỗ duy nhất cần thay khi có backend
   3. Phiên đăng nhập + phân quyền theo vai trò (admin / organizer / student)
   4. Thông báo (toast) và hộp thoại "Cần đăng nhập"
   5. Header theo trạng thái đăng nhập + bảo vệ trang

   LƯU Ý: chưa có máy chủ nên mọi thứ lưu ở trình duyệt, mật khẩu chỉ được
   băm sơ sài để demo. Khi có backend, thay thân các hàm trong `api` bằng
   fetch() tới máy chủ; giao diện không cần sửa.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. CẤU HÌNH ---------- */
  var CONFIG = window.SEMS_AUTH_CONFIG = Object.assign({
    demoShowOtp: true,        // true: hiển thị mã OTP trong "hộp thư demo" (vì chưa có máy chủ gửi email). Có backend thì đặt false.
    otpTtlMs: 5 * 60 * 1000,  // mã OTP có hiệu lực 5 phút
    otpMaxTries: 5,           // nhập sai quá 5 lần phải gửi lại mã
    otpResendSec: 60,         // chờ 60 giây mới được gửi lại
    maxLoginFails: 5,         // sai mật khẩu quá 5 lần bị khóa tạm
    lockMs: 30 * 1000,
    latencyMs: 600            // độ trễ giả lập mạng
  }, window.SEMS_AUTH_CONFIG || {});

  // Trang đích sau khi đăng nhập (đường dẫn tính từ pages/auth/): mỗi vai trò vào thẳng trang của mình.
  var ROLE_HOME = {
    admin: '../admin/overview.html',
    organizer: '../organizer/organizer.html',
    student: 'home.html'   // ../student/index.html chỉ tự chuyển sang trang Thông báo nên sinh viên vào trang chủ
  };
  var ROLE_LABEL = { admin: 'Quản trị viên', organizer: 'Người tổ chức', student: 'Sinh viên' };

  var K = {
    users: 'sems_users', session: 'sems_session', otp: 'sems_otp',
    flash: 'sems_flash', next: 'sems_next', lock: 'sems_lock',
    seedVer: 'sems_seed_ver', regOtp: 'sems_reg_otp',
    studentFlag: 'qn_logged_in'   // cờ đăng nhập mà cổng sinh viên (student.js) đang dùng
  };

  /* ---------- tiện ích ---------- */
  function get(k, store) { try { return JSON.parse((store || localStorage).getItem(k)); } catch (e) { return null; } }
  function set(k, v, store) { try { (store || localStorage).setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function del(k, store) { try { (store || localStorage).removeItem(k); } catch (e) { /* bỏ qua */ } }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').trim().toLowerCase(); }
  function uid() { return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  // Băm sơ sài chỉ để không lưu mật khẩu dạng chữ thường trong demo. KHÔNG an toàn thật sự.
  function hash(str) {
    var h1 = 5381, h2 = 52711, s = 'sems:' + str;
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = (h1 * 33) ^ c; h2 = (h2 * 33) ^ c; }
    return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  }
  function fail(code, message, field) { return { ok: false, code: code, message: message, field: field || null }; }

  /* ---------- 2. KHO DỮ LIỆU DEMO ----------
     Ba tài khoản khởi tạo bên dưới chỉ để chạy thử khi chưa có backend (không còn hiển thị trên giao diện).
     Khi có backend: xóa seedUsers() và thay thân các hàm trong `api` bằng fetch(). */
  function seedUsers() {
    return [
      { id: 'u-admin', password: hash('Admin@123'), role: 'admin', fullname: 'Quản trị viên SEMS', email: 'admin@qnu.edu.vn', studentid: '', cls: '', faculty: '', phone: '', gender: 'Khác', avatar: null },
      { id: 'u-org', password: hash('Organizer@123'), role: 'organizer', fullname: 'Phòng Công tác sinh viên', email: 'organizer@qnu.edu.vn', studentid: '', cls: '', faculty: '', phone: '', gender: 'Khác', avatar: null },
      { id: 'u-sv', password: hash('Student@123'), role: 'student', fullname: 'Nguyễn Phương', email: '4751050247@student.qnu.edu.vn', studentid: '4751050247', cls: 'CNTT K47B', faculty: 'Công nghệ thông tin', phone: '0901234567', gender: 'Nam', avatar: null }
    ];
  }
  var SEED_VERSION = 4;   // tăng số này khi đổi tài khoản mẫu để trình duyệt đã lưu bản cũ tự cập nhật
  function users() {
    var u = get(K.users);
    if (!Array.isArray(u) || !u.length) { u = seedUsers(); set(K.users, u); set(K.seedVer, SEED_VERSION); return u; }
    if (get(K.seedVer) !== SEED_VERSION) {
      var seeds = seedUsers(), ids = seeds.map(function (s) { return s.id; });
      u = seeds.concat(u.filter(function (x) { return ids.indexOf(x.id) === -1; }));   // giữ nguyên tài khoản người dùng tự đăng ký
      set(K.users, u); set(K.seedVer, SEED_VERSION);
    }
    return u;
  }
  function saveUsers(u) { return set(K.users, u); }
  function publicUser(u) { var c = Object.assign({}, u); delete c.password; return c; }

  /* ----- API giả lập: mỗi hàm trả về Promise. Thay bằng fetch() khi có backend ----- */
  var api = {
    // POST /auth/login
    login: function (identity, password, remember) {
      return wait(CONFIG.latencyMs).then(function () {
        var lock = get(K.lock) || { count: 0, until: 0 };
        if (Date.now() < lock.until) {
          return fail('locked', 'Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau ' + Math.ceil((lock.until - Date.now()) / 1000) + ' giây.');
        }
        var id = norm(identity);
        var user = users().filter(function (u) { return norm(u.email) === id; })[0];
        if (!user) {
          return failLogin(lock, 'Email này chưa được đăng ký.', 'email');
        }
        if (user.password !== hash(password)) {
          return failLogin(lock, 'Mật khẩu không đúng.', 'password');
        }
        del(K.lock);
        startSession(user, !!remember);
        return { ok: true, user: publicUser(user) };
      });
    },

    // POST /auth/register/send-otp  (gửi mã OTP xác thực email khi đăng ký)
    sendRegisterOtp: function (email) {
      return wait(CONFIG.latencyMs).then(function () {
        if (users().some(function (u) { return norm(u.email) === norm(email); })) return fail('dup', 'Email này đã được đăng ký.', 'email');
        var code = randomOtp();
        set(K.regOtp, { email: norm(email), code: code, exp: Date.now() + CONFIG.otpTtlMs, tries: 0, verified: false }, sessionStorage);
        // Có backend: máy chủ gửi email thật và KHÔNG trả code về cho trình duyệt.
        return { ok: true, email: email, demoCode: CONFIG.demoShowOtp ? code : null };
      });
    },

    // POST /auth/register/verify-otp
    verifyRegisterOtp: function (email, code) {
      return wait(CONFIG.latencyMs / 2).then(function () {
        var o = get(K.regOtp, sessionStorage);
        var chk = checkOtpRecord(o, email, code, function () { del(K.regOtp, sessionStorage); }, function (x) { set(K.regOtp, x, sessionStorage); });
        if (!chk.ok) return chk;
        o.verified = true; set(K.regOtp, o, sessionStorage);
        return { ok: true };
      });
    },

    // POST /auth/register  (đăng ký công khai luôn tạo vai trò sinh viên; admin/organizer do quản trị cấp)
    // Email là định danh đăng nhập và phải được xác thực OTP trước.
    register: function (d) {
      return wait(CONFIG.latencyMs).then(function () {
        var list = users();
        var o = get(K.regOtp, sessionStorage);
        if (!o || !o.verified || o.email !== norm(d.email)) return fail('noverify', 'Email chưa được xác thực OTP. Vui lòng xác thực email trước.', 'email');
        if (list.some(function (u) { return norm(u.email) === norm(d.email); })) return fail('dup', 'Email này đã được đăng ký.', 'email');
        if (d.studentid && list.some(function (u) { return u.studentid && u.studentid === d.studentid; })) return fail('dup', 'Mã sinh viên này đã có tài khoản.', 'studentid');
        var user = {
          id: uid(), password: hash(d.password), role: 'student',
          fullname: d.fullname.trim(), email: d.email.trim(), studentid: d.studentid || '', cls: d.cls || '',
          faculty: d.faculty || '', phone: d.phone || '', gender: d.gender || 'Nam', avatar: null
        };
        list.push(user);
        if (!saveUsers(list)) return fail('storage', 'Không lưu được dữ liệu trên trình duyệt (bộ nhớ đầy hoặc bị chặn).');
        del(K.regOtp, sessionStorage);
        return { ok: true, user: publicUser(user) };
      });
    },

    emailTaken: function (email) {
      return users().some(function (u) { return norm(u.email) === norm(email); });
    },

    // POST /auth/forgot/send-otp
    sendOtp: function (email) {
      return wait(CONFIG.latencyMs).then(function () {
        var user = users().filter(function (u) { return norm(u.email) === norm(email); })[0];
        if (!user) return fail('nomatch', 'Email này chưa được đăng ký tài khoản nào.', 'email');
        var code = randomOtp();
        set(K.otp, { email: norm(user.email), code: code, exp: Date.now() + CONFIG.otpTtlMs, tries: 0 });
        // Có backend: máy chủ gửi email thật và KHÔNG trả code về cho trình duyệt.
        return { ok: true, email: user.email, demoCode: CONFIG.demoShowOtp ? code : null };
      });
    },

    // POST /auth/forgot/verify-otp
    verifyOtp: function (email, code) {
      return wait(CONFIG.latencyMs / 2).then(function () { return checkOtp(email, code); });
    },

    // POST /auth/forgot/reset
    resetPassword: function (email, code, newPassword) {
      return wait(CONFIG.latencyMs).then(function () {
        var chk = checkOtp(email, code);
        if (!chk.ok) return chk;
        var list = users();
        var user = list.filter(function (u) { return norm(u.email) === norm(email); })[0];
        if (!user) return fail('nomatch', 'Không tìm thấy tài khoản.');
        user.password = hash(newPassword);
        saveUsers(list);
        del(K.otp);
        return { ok: true };
      });
    },

    // PUT /me
    updateProfile: function (id, patch) {
      return wait(CONFIG.latencyMs / 2).then(function () {
        var list = users();
        var user = list.filter(function (u) { return u.id === id; })[0];
        if (!user) return fail('nouser', 'Phiên đăng nhập không còn hợp lệ.');
        if (patch.email && list.some(function (u) { return u.id !== id && norm(u.email) === norm(patch.email); })) return fail('dup', 'Email này đã được tài khoản khác sử dụng.', 'email');
        if (patch.studentid && list.some(function (u) { return u.id !== id && u.studentid && u.studentid === patch.studentid; })) return fail('dup', 'Mã sinh viên này đã có tài khoản khác.', 'studentid');
        Object.keys(patch).forEach(function (k) { if (k !== 'id' && k !== 'role' && k !== 'password') user[k] = patch[k]; });
        if (!saveUsers(list)) return fail('storage', 'Không lưu được (bộ nhớ trình duyệt đầy). Thử ảnh nhỏ hơn.');
        return { ok: true, user: publicUser(user) };
      });
    },

    // PUT /me/password
    changePassword: function (id, oldPw, newPw) {
      return wait(CONFIG.latencyMs).then(function () {
        var list = users();
        var user = list.filter(function (u) { return u.id === id; })[0];
        if (!user) return fail('nouser', 'Phiên đăng nhập không còn hợp lệ.');
        if (user.password !== hash(oldPw)) return fail('badpw', 'Mật khẩu cũ không đúng.', 'old');
        user.password = hash(newPw);
        saveUsers(list);
        return { ok: true };
      });
    }
  };

  function failLogin(lock, msg, field) {
    lock.count = (lock.count || 0) + 1;
    if (lock.count >= CONFIG.maxLoginFails) {
      lock = { count: 0, until: Date.now() + CONFIG.lockMs };
      set(K.lock, lock);
      return fail('locked', 'Bạn nhập sai quá ' + CONFIG.maxLoginFails + ' lần. Tài khoản tạm khóa ' + Math.round(CONFIG.lockMs / 1000) + ' giây.');
    }
    set(K.lock, lock);
    var left = CONFIG.maxLoginFails - lock.count;
    return fail('bad', msg + (left <= 2 ? ' Còn ' + left + ' lần thử.' : ''), field);
  }

  function randomOtp() {
    var buf = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    return String(100000 + (buf[0] % 900000));
  }
  // Kiểm tra bản ghi OTP (dùng chung cho đăng ký và quên mật khẩu)
  function checkOtpRecord(o, email, code, drop, save) {
    if (!o || norm(o.email) !== norm(email)) return fail('noOtp', 'Chưa có mã OTP. Hãy bấm "Gửi OTP" trước.', 'otp');
    if (Date.now() > o.exp) { drop(); return fail('expired', 'Mã OTP đã hết hạn. Hãy gửi lại mã mới.', 'otp'); }
    if (o.tries >= CONFIG.otpMaxTries) { drop(); return fail('tooMany', 'Bạn nhập sai quá nhiều lần. Hãy gửi lại mã mới.', 'otp'); }
    if (o.code !== String(code).trim()) {
      o.tries++; save(o);
      return fail('bad', 'Mã OTP không đúng. Còn ' + (CONFIG.otpMaxTries - o.tries) + ' lần thử.', 'otp');
    }
    return { ok: true };
  }
  function checkOtp(email, code) {
    return checkOtpRecord(get(K.otp), email, code, function () { del(K.otp); }, function (x) { set(K.otp, x); });
  }

  /* ---------- 3. PHIÊN ĐĂNG NHẬP & VAI TRÒ ---------- */
  function startSession(user, remember) {
    del(K.session); del(K.session, sessionStorage);
    set(K.session, { id: user.id }, remember ? localStorage : sessionStorage);
    // Đồng bộ với cổng sinh viên (student.js) để vào khu sinh viên không bị hỏi đăng nhập lại
    try { if (user.role === 'student') localStorage.setItem(K.studentFlag, '1'); else localStorage.removeItem(K.studentFlag); } catch (e) { /* bỏ qua */ }
  }
  function endSession() {
    del(K.session); del(K.session, sessionStorage);
    try { localStorage.removeItem(K.studentFlag); } catch (e) { /* bỏ qua */ }
  }
  function flagOn() { try { return localStorage.getItem(K.studentFlag) === '1'; } catch (e) { return false; } }

  function currentUser() {
    var list = users();
    var s = get(K.session, sessionStorage) || get(K.session);
    var user = s ? list.filter(function (u) { return u.id === s.id; })[0] : null;
    if (user && user.role === 'student' && !flagOn()) {   // sinh viên đã đăng xuất ở cổng sinh viên
      endSession();
      return null;
    }
    if (!user && flagOn()) {                              // sinh viên đăng nhập bằng form demo của cổng sinh viên
      user = list.filter(function (u) { return u.id === 'u-sv'; })[0] || null;
      if (user) set(K.session, { id: user.id });
    }
    return user ? publicUser(user) : null;
  }
  function roleHome(user) { return ROLE_HOME[user && user.role] || 'home.html'; }   // khách / vai trò lạ về trang chủ
  function roleLabel(role) { return ROLE_LABEL[role] || 'Người dùng'; }

  // "Quay lại trang đã định vào sau khi đăng nhập". Chỉ nhận: file .html cùng thư mục, hoặc trang trong ../student/ (có thể kèm ?id=...) (chống chuyển hướng bậy)
  var NEXT_RE = /^(\.\.\/student\/)?[\w-]+\.html(\?[\w=&%.-]*)?(#[\w-]*)?$/;
  function saveNext(target) {
    var page = target || (location.pathname.split('/').pop() + location.hash);
    if (NEXT_RE.test(page) && !/^(login|register|forgot-password)\.html/.test(page)) set(K.next, page, sessionStorage);
  }
  function takeNext(role) {
    var n = get(K.next, sessionStorage);
    del(K.next, sessionStorage);
    if (typeof n !== 'string' || !NEXT_RE.test(n)) return null;
    if (n.indexOf('../student/') === 0 && role !== 'student') return null;   // trang sinh viên chỉ dành cho sinh viên
    return n;
  }
  function loginUrl() { saveNext(); return 'login.html'; }

  function logout() {
    endSession();
    flash('success', 'Bạn đã đăng xuất.');
    location.href = 'home.html';
  }

  /* ---------- 4. THÔNG BÁO & HỘP THOẠI ---------- */
  var toastBox = null;
  var TOAST_ICON = { success: '✓', error: '!', info: 'i', warn: '!' };
  function toast(type, message, ms) {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'sems-toasts';
      toastBox.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastBox);
    }
    var el = document.createElement('div');
    el.className = 'sems-toast ' + type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = '<span class="ti" aria-hidden="true">' + (TOAST_ICON[type] || 'i') + '</span><span class="tm">' + esc(message) + '</span><button type="button" class="tx" aria-label="Đóng thông báo">&times;</button>';
    var timer;
    function close() { if (el.classList.contains('out')) return; clearTimeout(timer); el.classList.add('out'); setTimeout(function () { el.remove(); }, 420); }
    el.querySelector('.tx').addEventListener('click', close);
    toastBox.appendChild(el);
    while (toastBox.children.length > 4) toastBox.firstChild.remove();
    timer = setTimeout(close, ms || (type === 'error' ? 6000 : 4200));
    return close;
  }
  // Thông báo hiện ở trang kế tiếp (dùng khi chuyển trang ngay sau một hành động)
  function flash(type, message) { set(K.flash, { type: type, message: message }, sessionStorage); }
  function showFlash() {
    var f = get(K.flash, sessionStorage);
    if (f) { del(K.flash, sessionStorage); toast(f.type, f.message); }
  }

  /* ----- Kiểm tra & hiển thị độ mạnh mật khẩu (dùng chung đăng ký / quên mật khẩu / đổi mật khẩu) ----- */
  function validatePassword(p) {
    if (!p || p.length < 8) return 'Mật khẩu cần ít nhất 8 ký tự';
    if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'Mật khẩu cần gồm cả chữ và số';
    return '';
  }
  function passwordStrength(p) {
    var s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s <= 2 ? { level: 1, label: 'Yếu' } : s === 3 ? { level: 2, label: 'Trung bình' } : { level: 3, label: 'Mạnh' };
  }
  // Gắn thanh độ mạnh ngay dưới ô nhập mật khẩu
  function pwMeter(input) {
    if (!input) return;
    var anchor = input.closest('.pw') || input;
    var box = document.createElement('div');
    box.className = 'pw-meter';
    box.hidden = true;
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<span class="pw-bar"><i></i><i></i><i></i></span><em></em>';
    anchor.insertAdjacentElement('afterend', box);
    var label = box.querySelector('em');
    input.addEventListener('input', function () {
      var v = input.value;
      box.hidden = !v;
      if (!v) return;
      var st = passwordStrength(v);
      box.dataset.level = st.level;
      label.textContent = 'Độ mạnh: ' + st.label;
    });
  }
  // Đưa con trỏ vào ô lỗi đầu tiên để người dùng sửa ngay
  function focusFirstError(scope) {
    var bad = (scope || document).querySelector('input.bad');
    if (bad) bad.focus();
  }

  function setLoading(btn, on, text) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.textContent; btn.textContent = text || 'Đang xử lý...'; btn.disabled = true; btn.classList.add('is-loading'); }
    else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; btn.classList.remove('is-loading'); }
  }

  // Hộp thoại "Bạn cần đăng nhập"
  function requireLogin(message, target) {
    if (document.querySelector('.sems-modal-bg')) return;
    saveNext(target);
    var opener = document.activeElement;
    var bg = document.createElement('div');
    bg.className = 'sems-modal-bg';
    bg.innerHTML =
      '<div class="sems-modal" role="dialog" aria-modal="true" aria-labelledby="smTitle">' +
      '<div class="sm-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>' +
      '<h2 id="smTitle">Bạn cần đăng nhập</h2>' +
      '<p>' + esc(message || 'Vui lòng đăng nhập để xem chi tiết và đăng ký tham gia sự kiện.') + '</p>' +
      '<div class="sm-act"><a class="sm-btn pri" href="login.html">Đăng nhập</a><a class="sm-btn" href="register.html">Đăng ký tài khoản</a></div>' +
      '<button type="button" class="sm-close" aria-label="Đóng">&times;</button></div>';
    document.body.appendChild(bg);
    var focusable = bg.querySelectorAll('a,button');
    focusable[0].focus();
    function close() { document.removeEventListener('keydown', onKey); del(K.next, sessionStorage); bg.remove(); if (opener && opener.focus) opener.focus(); }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('.sm-close')) close(); });
  }

  /* ---------- 5. HEADER THEO TRẠNG THÁI & BẢO VỆ TRANG ---------- */
  var ICON = {
    chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    qr: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/></svg>',
    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };
  var STUDENT = '../student/';

  // Header giống cổng sinh viên. Các mục dẫn sang trang student; khách bấm vào sẽ được yêu cầu đăng nhập.
  function siteHeaderHTML(user, active) {
    function gate(msg) { return ' data-auth data-student data-auth-msg="' + esc(msg) + '"'; }
    function navLink(key, href, text, msg) {
      return '<a class="nav-link' + (active === key ? ' is-active' : '') + '" href="' + href + '"' + (active === key ? ' aria-current="page"' : '') + (msg ? gate(msg) : '') + '>' + text + '</a>';
    }
    function item(href, text, msg) { return '<a href="' + STUDENT + href + '" role="menuitem"' + gate(msg) + '>' + text + '</a>'; }

    var actions = '<a class="btn-qr" href="' + STUDENT + 'qr-checkin.html"' + gate('Vui lòng đăng nhập để dùng mã QR điểm danh.') + '>' + ICON.qr + 'Quét QR điểm danh</a>';
    if (user) {
      var links = '<div class="menu-who"><b>' + esc(user.fullname) + '</b><span>' + esc(roleLabel(user.role) + (user.studentid ? ' – ' + user.studentid : '')) + '</span></div>' +
        '<a href="profile.html" role="menuitem">Thông tin cá nhân</a>';
      if (user.role === 'admin') links += '<a href="../admin/overview.html" role="menuitem">Khu vực quản trị</a>';
      links += '<button type="button" role="menuitem" data-logout>Đăng xuất</button>';
      actions += '<div class="has-menu"><button class="account" type="button" aria-haspopup="true" aria-expanded="false" data-menu-trigger' + (user.studentid ? ' title="MSSV ' + esc(user.studentid) + '"' : '') + '>' +
        '<span class="avatar">' + (user.avatar ? '<img src="' + esc(user.avatar) + '" alt="">' : ICON.user) + '</span>' + esc(user.fullname) + ICON.chevron + '</button>' +
        '<div class="menu menu-right" role="menu">' + links + '</div></div>';
    } else {
      actions += '<a class="hbtn" href="register.html">Đăng ký</a><a class="hbtn pri" href="login.html">Đăng nhập</a>';
    }

    var eventsActive = active === 'events';
    return '<header class="site-header" id="siteHeader"><div class="wrap nav-inner">' +
      '<a class="brand" href="home.html" aria-label="Đại học Quy Nhơn - Cổng thông tin sinh viên">' +
      '<img class="brand-mark" src="../../images/student/logo.png" width="46" height="46" alt="">' +
      '<span><span class="brand-name">Đại học Quy Nhơn</span><span class="brand-sub">Cổng thông tin sinh viên</span></span></a>' +
      '<button class="nav-toggle" id="navToggle" type="button" aria-label="Mở menu" aria-expanded="false" aria-controls="mainNav">' + ICON.menu + '</button>' +
      '<nav class="nav" id="mainNav" aria-label="Điều hướng chính">' +
      navLink('home', 'home.html', 'Trang chủ') +
      '<div class="has-menu"><button class="nav-trigger' + (eventsActive ? ' is-active' : '') + '" type="button" aria-haspopup="true" aria-expanded="false" data-menu-trigger>Sự kiện ' + ICON.chevron + '</button>' +
      '<div class="menu" role="menu">' +
      item('event-list.html', 'Danh sách sự kiện', 'Vui lòng đăng nhập để xem danh sách sự kiện.') +
      item('my-events.html', 'Sự kiện của tôi', 'Vui lòng đăng nhập để xem sự kiện của bạn.') +
      '</div></div>' +
      navLink('calendar', STUDENT + 'activity-calendar.html', 'Lịch hoạt động', 'Vui lòng đăng nhập để xem lịch hoạt động.') +
      navLink('notices', STUDENT + 'notifications.html', 'Thông báo', 'Vui lòng đăng nhập để xem thông báo.') +
      '</nav><div class="nav-actions">' + actions + '</div></div></header>';
  }

  function setupMenus() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    function closeAll(except) {
      header.querySelectorAll('.has-menu.is-open').forEach(function (m) {
        if (m === except) return;
        m.classList.remove('is-open');
        m.querySelector('[data-menu-trigger]').setAttribute('aria-expanded', 'false');
      });
    }
    header.querySelectorAll('[data-menu-trigger]').forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        var wrap = t.closest('.has-menu'), open = !wrap.classList.contains('is-open');
        closeAll(wrap);
        wrap.classList.toggle('is-open', open);
        t.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.has-menu')) closeAll(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    var toggle = document.getElementById('navToggle');
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function init() {
    var user = currentUser();
    var guard = document.body.getAttribute('data-guard');   // "auth" = phải đăng nhập, "guest" = chỉ dành cho khách

    if (guard === 'auth' && !user) {
      flash('info', 'Vui lòng đăng nhập để tiếp tục.');
      location.replace(loginUrl());
      return;
    }
    if (guard === 'guest' && user) {
      location.replace(takeNext(user.role) || roleHome(user));
      return;
    }

    var slot = document.getElementById('siteHeaderSlot');
    if (slot) { slot.outerHTML = siteHeaderHTML(user, document.body.getAttribute('data-nav') || ''); setupMenus(); }
    showFlash();

    document.addEventListener('click', function (e) {
      // Đăng xuất
      if (e.target.closest('[data-logout]')) { e.preventDefault(); logout(); return; }
      // Mục yêu cầu đăng nhập (xem chi tiết, đăng ký sự kiện, lịch hoạt động...)
      var gated = e.target.closest('[data-auth]');
      if (!gated) return;
      var me = currentUser();
      if (!me) {
        e.preventDefault();
        var href = gated.getAttribute('href') || '';
        requireLogin(gated.getAttribute('data-auth-msg'), gated.hasAttribute('data-student') ? href : null);
        return;
      }
      // Các mục dẫn sang cổng sinh viên chỉ dành cho tài khoản sinh viên
      if (gated.hasAttribute('data-student') && me.role !== 'student') {
        e.preventDefault();
        toast('info', 'Mục này dành cho tài khoản sinh viên. Bạn đang đăng nhập với vai trò ' + roleLabel(me.role) + '.');
      }
    });
  }

  window.SEMSAuth = {
    config: CONFIG, api: api, currentUser: currentUser, roleHome: roleHome, roleLabel: roleLabel,
    takeNext: takeNext, logout: logout, toast: toast, flash: flash, setLoading: setLoading,
    requireLogin: requireLogin, startSession: startSession, wait: wait,
    validatePassword: validatePassword, pwMeter: pwMeter, focusFirstError: focusFirstError
  };

  init();
})();
