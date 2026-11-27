/* =========================================================
   SEMS – AUTH CORE (dùng chung cho mọi trang trong pages/auth)

   Gồm:
   1. Cấu hình
   2. Lớp API: gọi backend Spring Boot (/api/v1/auth/...), tự gắn token và tự làm mới token
   3. Phiên đăng nhập + phân quyền theo vai trò (admin / organizer / student)
   4. Thông báo (toast) và hộp thoại "Cần đăng nhập"
   5. Header theo trạng thái đăng nhập + bảo vệ trang

   Backend phải đang chạy ở http://localhost:8080 (đổi bằng window.SEMS_AUTH_CONFIG.apiBase nếu khác).
   Mỗi hàm trong `api` trả về Promise<{ ok: true, ... } | { ok: false, code, message, field }>.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. CẤU HÌNH ---------- */
  var CONFIG = window.SEMS_AUTH_CONFIG = Object.assign({
    apiBase: 'http://' + (location.hostname || 'localhost') + ':8080/api/v1',   // địa chỉ backend
    timeoutMs: 20000,         // quá thời gian này coi như mất kết nối
    otpResendSec: 60          // chờ 60 giây mới được gửi lại OTP (khớp app.otp.resend-seconds ở backend)
  }, window.SEMS_AUTH_CONFIG || {});

  // Trang đích sau khi đăng nhập (đường dẫn tính từ pages/auth/): mỗi vai trò vào thẳng trang của mình.
  var ROLE_HOME = {
    admin: '../admin/overview.html',
    organizer: '../organizer/organizer.html',
    student: 'home.html'   // ../student/index.html chỉ tự chuyển sang trang Thông báo nên sinh viên vào trang chủ
  };
  var ROLE_LABEL = { admin: 'Quản trị viên', organizer: 'Người tổ chức', student: 'Sinh viên' };

  var K = {
    users: 'sems_users',      // bản sao hồ sơ người đang đăng nhập (cổng sinh viên student.js cũng đọc khóa này)
    session: 'sems_session',  // { id } của người đang đăng nhập
    tokens: 'sems_tokens',    // { accessToken, refreshToken, exp }
    flash: 'sems_flash', next: 'sems_next', verifyEmail: 'sems_verify_email',
    avatarPrefix: 'sems_avatar_',
    studentFlag: 'qn_logged_in'   // cờ đăng nhập mà cổng sinh viên (student.js) đang dùng
  };

  /* ---------- tiện ích ---------- */
  function get(k, store) { try { return JSON.parse((store || localStorage).getItem(k)); } catch (e) { return null; } }
  function set(k, v, store) { try { (store || localStorage).setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function del(k, store) { try { (store || localStorage).removeItem(k); } catch (e) { /* bỏ qua */ } }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').trim().toLowerCase(); }
  function fail(code, message, field) { return { ok: false, code: code, message: message, field: field || null }; }

  /* ---------- 2. LỚP API (gọi backend thật) ---------- */
  var BACKEND_DOWN = 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy (Started SemsApplication) rồi thử lại.';

  function rawFetch(method, path, body, token) {
    var headers = { 'Accept': 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = 'Bearer ' + token;
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, CONFIG.timeoutMs) : null;
    return fetch(CONFIG.apiBase + path, {
      method: method, headers: headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctl ? ctl.signal : undefined
    }).then(function (resp) {
      return resp.text().then(function (t) {
        var json = null;
        try { json = t ? JSON.parse(t) : null; } catch (e) { /* phản hồi không phải JSON */ }
        return { status: resp.status, body: json };
      });
    }).then(function (r) { clearTimeout(timer); return r; }, function (e) { clearTimeout(timer); throw e; });
  }

  // ----- token -----
  function tokenStore() { return get(K.session, sessionStorage) ? sessionStorage : (get(K.session) ? localStorage : null); }
  function getTokens() { var st = tokenStore(); return st ? get(K.tokens, st) : null; }
  function saveTokens(res) {
    var st = tokenStore() || sessionStorage;
    set(K.tokens, { accessToken: res.accessToken, refreshToken: res.refreshToken, exp: Date.now() + (res.expiresIn || 0) * 1000 }, st);
  }
  var refreshing = null;
  // Đổi refresh token lấy cặp token mới (chỉ chạy một lần dù nhiều request cùng hết hạn). Trả về Promise<boolean>.
  function refreshTokens() {
    if (refreshing) return refreshing;
    var t = getTokens();
    if (!t || !t.refreshToken) return Promise.resolve(false);
    refreshing = rawFetch('POST', '/auth/refresh', { refreshToken: t.refreshToken }).then(function (r) {
      refreshing = null;
      if (r.status === 200 && r.body && r.body.result && r.body.result.accessToken) { saveTokens(r.body.result); return true; }
      return false;
    }, function (e) { refreshing = null; throw e; });
    return refreshing;
  }
  // Gọi API cần đăng nhập: hết hạn access token thì tự làm mới rồi gọi lại một lần.
  function authRequest(method, path, body) {
    var t = getTokens();
    if (!t) return Promise.resolve({ status: 401, body: null, noSession: true });
    return rawFetch(method, path, body, t.accessToken).then(function (r) {
      if (r.status !== 401) return r;
      return refreshTokens().then(function (ok) {
        if (!ok) { endSession(); return { status: 401, body: r.body, noSession: true }; }
        return rawFetch(method, path, body, getTokens().accessToken);
      });
    });
  }

  // ----- chuyển đổi dữ liệu backend <-> giao diện -----
  function pickRole(roles) {
    roles = roles || [];
    if (roles.indexOf('ADMIN') > -1) return 'admin';
    if (roles.indexOf('ORGANIZER') > -1) return 'organizer';
    return 'student';
  }
  function avatarOf(id) { try { return localStorage.getItem(K.avatarPrefix + id) || null; } catch (e) { return null; } }
  function mapUser(u) {
    return {
      id: u.id, role: pickRole(u.roles), roles: u.roles || [],
      fullname: u.fullName || '', email: u.email || '', studentid: u.studentCode || '',
      cls: u.className || '', faculty: u.facultyName || '', phone: u.phone || '',
      gender: u.gender || 'Nam', avatar: avatarOf(u.id)
    };
  }
  function users() { var u = get(K.users); return Array.isArray(u) ? u : []; }
  function cacheUser(user) {
    var list = users().filter(function (x) { return x.id !== user.id; });
    list.push(user);
    set(K.users, list);
  }

  // Tên trường backend -> id ô nhập trên giao diện
  var F_REGISTER = { email: 'regEmail', password: 'password', fullName: 'fullname', studentCode: 'studentid', className: 'class', facultyName: 'faculty', phone: 'phone' };
  var F_PROFILE = { fullName: 'fullname', phone: 'phone', className: 'class', facultyName: 'faculty' };
  var F_PASSWORD = { currentPassword: 'old', newPassword: 'new1' };
  var F_RESET = { email: 'email', otp: 'otp', newPassword: 'password' };
  var F_OTP = { otp: 'otp', email: 'email' };
  var F_DUP = [['Email', 'regEmail'], ['Số điện thoại', 'phone'], ['Mã sinh viên', 'studentid']];

  // Đổi phản hồi lỗi của backend thành { ok:false, code, message, field, fields }
  function toFail(r, fieldMap, dupMap) {
    var b = r.body || {}, res = b.result;
    var out = { ok: false, status: r.status, code: 'error', message: b.message || 'Có lỗi xảy ra, vui lòng thử lại.', field: null, fields: {} };
    if (r.noSession) { out.code = 'session'; out.message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'; return out; }
    if (res && typeof res === 'object') {
      if (res.errorCode) out.code = res.errorCode;
      Object.keys(res).forEach(function (k) {
        var id = fieldMap && fieldMap[k];
        if (!id) return;
        out.fields[id] = res[k];
        if (!out.field) { out.field = id; out.message = res[k]; }
      });
    }
    if (r.status === 400 && !out.field && out.message === 'Validation failed') out.message = 'Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại.';
    if (r.status === 409) {
      out.code = 'dup';
      (dupMap || []).some(function (d) { if (out.message.indexOf(d[0]) === 0) { out.field = d[1]; out.fields[d[1]] = out.message; return true; } return false; });
    } else if (r.status === 429) { out.code = 'rate_limited'; }
    else if (r.status === 401 && out.code === 'error') { out.code = 'unauthorized'; }
    else if (r.status >= 500 && !b.message) { out.message = 'Máy chủ gặp lỗi, vui lòng thử lại sau.'; }
    return out;
  }
  function netFail(e) { return fail('network', BACKEND_DOWN); }
  function ok2xx(r) { return r.status >= 200 && r.status < 300; }

  var api = {
    // POST /auth/login
    login: function (identity, password, remember) {
      return rawFetch('POST', '/auth/login', { email: String(identity || '').trim(), password: password }).then(function (r) {
        if (!ok2xx(r)) {
          var f = toFail(r, { email: 'email', password: 'password' });
          if (r.status === 401 && !f.field) f.field = 'password';   // backend không cho biết sai email hay sai mật khẩu
          return f;
        }
        var d = r.body.result, user = mapUser(d.user);
        startSession(user, !!remember, d);
        return { ok: true, user: user };
      }).catch(netFail);
    },

    // POST /auth/register : tạo tài khoản (chưa đăng nhập được) và gửi OTP xác thực email
    register: function (d) {
      var body = {
        email: String(d.email || '').trim(), password: d.password, fullName: String(d.fullname || '').trim(),
        studentCode: String(d.studentid || '').trim(), className: d.cls || '', facultyName: d.faculty || '',
        phone: d.phone || '', gender: d.gender || ''
      };
      return rawFetch('POST', '/auth/register', body).then(function (r) {
        return ok2xx(r) ? { ok: true, email: body.email } : toFail(r, F_REGISTER, F_DUP);
      }).catch(netFail);
    },

    // POST /auth/resend-otp (xác thực email khi đăng ký)
    sendRegisterOtp: function (email) {
      return rawFetch('POST', '/auth/resend-otp', { email: String(email || '').trim(), purpose: 'VERIFY_EMAIL' }).then(function (r) {
        return ok2xx(r) ? { ok: true, email: String(email).trim() } : toFail(r, F_OTP);
      }).catch(netFail);
    },

    // POST /auth/verify-email
    verifyRegisterOtp: function (email, code) {
      return rawFetch('POST', '/auth/verify-email', { email: String(email || '').trim(), otp: String(code || '').trim() }).then(function (r) {
        return ok2xx(r) ? { ok: true } : toFail(r, F_OTP);
      }).catch(netFail);
    },

    // POST /auth/forgot-password (luôn báo thành công dù email có tồn tại hay không)
    sendOtp: function (email) {
      return rawFetch('POST', '/auth/forgot-password', { email: String(email || '').trim() }).then(function (r) {
        return ok2xx(r) ? { ok: true, email: String(email).trim() } : toFail(r, F_OTP);
      }).catch(netFail);
    },

    // POST /auth/verify-reset-otp (chỉ kiểm tra mã, chưa đổi mật khẩu)
    verifyOtp: function (email, code) {
      return rawFetch('POST', '/auth/verify-reset-otp', { email: String(email || '').trim(), otp: String(code || '').trim() }).then(function (r) {
        return ok2xx(r) ? { ok: true } : toFail(r, F_OTP);
      }).catch(netFail);
    },

    // POST /auth/reset-password
    resetPassword: function (email, code, newPassword) {
      return rawFetch('POST', '/auth/reset-password', { email: String(email || '').trim(), otp: String(code || '').trim(), newPassword: newPassword }).then(function (r) {
        return ok2xx(r) ? { ok: true } : toFail(r, F_RESET);
      }).catch(netFail);
    },

    // GET /auth/me : lấy lại hồ sơ mới nhất từ máy chủ
    me: function () {
      return authRequest('GET', '/auth/me').then(function (r) {
        if (!ok2xx(r)) return toFail(r);
        var user = mapUser(r.body.result);
        cacheUser(user);
        return { ok: true, user: user };
      }).catch(netFail);
    },

    // PATCH /auth/me : sửa họ tên, SĐT, giới tính, lớp, khoa. Ảnh đại diện chỉ lưu trên trình duyệt này.
    updateProfile: function (id, patch) {
      var keys = Object.keys(patch || {});
      var cur = users().filter(function (u) { return u.id === id; })[0];
      if (!cur) return Promise.resolve(fail('session', 'Phiên đăng nhập không còn hợp lệ.'));

      if (keys.length === 1 && keys[0] === 'avatar') {
        try {
          if (patch.avatar) localStorage.setItem(K.avatarPrefix + id, patch.avatar);
          else localStorage.removeItem(K.avatarPrefix + id);
        } catch (e) { return Promise.resolve(fail('storage', 'Không lưu được ảnh (bộ nhớ trình duyệt đầy). Thử ảnh nhỏ hơn.')); }
        cur.avatar = patch.avatar || null;
        cacheUser(cur);
        return Promise.resolve({ ok: true, user: cur });
      }
      var body = {
        fullName: String(patch.fullname != null ? patch.fullname : cur.fullname).trim(),
        phone: patch.phone != null ? patch.phone : cur.phone,
        gender: patch.gender || cur.gender
      };
      if (cur.role === 'student') {
        body.className = patch.cls != null ? patch.cls : cur.cls;
        body.facultyName = patch.faculty != null ? patch.faculty : cur.faculty;
      }
      return authRequest('PATCH', '/auth/me', body).then(function (r) {
        if (!ok2xx(r)) return toFail(r, F_PROFILE, F_DUP);
        var user = mapUser(r.body.result);
        cacheUser(user);
        return { ok: true, user: user };
      }).catch(netFail);
    },

    // PATCH /auth/me/password : backend thu hồi mọi phiên cũ và trả cặp token mới cho thiết bị này
    changePassword: function (id, oldPw, newPw) {
      return authRequest('PATCH', '/auth/me/password', { currentPassword: oldPw, newPassword: newPw }).then(function (r) {
        if (!ok2xx(r)) return toFail(r, F_PASSWORD);
        if (r.body && r.body.result && r.body.result.accessToken) saveTokens(r.body.result);
        return { ok: true };
      }).catch(netFail);
    }
  };

  /* ---------- 3. PHIÊN ĐĂNG NHẬP & VAI TRÒ ---------- */
  // Lưu hồ sơ + token. "Ghi nhớ tôi" -> localStorage (giữ sau khi đóng trình duyệt), ngược lại sessionStorage.
  function startSession(user, remember, tokens) {
    endSession();
    var st = remember ? localStorage : sessionStorage;
    set(K.session, { id: user.id }, st);
    if (tokens) set(K.tokens, { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, exp: Date.now() + (tokens.expiresIn || 0) * 1000 }, st);
    cacheUser(user);
    // Đồng bộ với cổng sinh viên (student.js) để vào khu sinh viên không bị hỏi đăng nhập lại
    try { if (user.role === 'student') localStorage.setItem(K.studentFlag, '1'); else localStorage.removeItem(K.studentFlag); } catch (e) { /* bỏ qua */ }
  }
  function endSession() {
    del(K.session); del(K.session, sessionStorage);
    del(K.tokens); del(K.tokens, sessionStorage);
    del(K.users);
    try { localStorage.removeItem(K.studentFlag); } catch (e) { /* bỏ qua */ }
  }
  function flagOn() { try { return localStorage.getItem(K.studentFlag) === '1'; } catch (e) { return false; } }

  function currentUser() {
    var s = get(K.session, sessionStorage) || get(K.session);
    if (!s) {
      // Cổng sinh viên (student.js) đăng xuất bằng cách xóa phiên nhưng không biết về token: dọn token còn sót và thu hồi ở máy chủ.
      var left = get(K.tokens) || get(K.tokens, sessionStorage);
      if (left && left.refreshToken) revokeOnServer(left.refreshToken);
      del(K.tokens); del(K.tokens, sessionStorage); del(K.users);
      if (flagOn()) { try { localStorage.removeItem(K.studentFlag); } catch (e) { /* bỏ qua */ } }
      return null;
    }
    var user = users().filter(function (u) { return u.id === s.id; })[0] || null;
    if (!user || !getTokens()) { endSession(); return null; }
    if (user.role === 'student' && !flagOn()) {   // sinh viên đã đăng xuất ở cổng sinh viên
      endSession();
      return null;
    }
    return Object.assign({}, user);
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

  // Thu hồi refresh token ở máy chủ (keepalive để vẫn gửi được khi chuyển trang)
  function revokeOnServer(refreshToken) {
    try {
      fetch(CONFIG.apiBase + '/auth/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken }), keepalive: true
      }).catch(function () { /* bỏ qua */ });
    } catch (e) { /* bỏ qua */ }
  }
  function logout() {
    var t = getTokens();
    if (t && t.refreshToken) revokeOnServer(t.refreshToken);
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

    // Kiểm tra phiên với máy chủ (tài khoản bị khóa/xóa, refresh token hết hạn...). Không chặn việc hiển thị trang.
    if (user) {
      api.me().then(function (res) {
        if (!res.ok && res.code === 'session') {
          flash('info', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          location.reload();
        }
      });
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
    requireLogin: requireLogin, wait: wait,
    validatePassword: validatePassword, pwMeter: pwMeter, focusFirstError: focusFirstError
  };

  init();
})();
