(function () {
  var A = window.SEMSAuth;
  var $ = function (i) { return document.getElementById(i); }, cur = 'step1', busy = false, timer = null;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Thứ tự mới (khớp backend): tài khoản -> hồ sơ -> tạo tài khoản & gửi OTP -> xác thực OTP
  var STEP_NO = { step1: 1, step2: 2, stepOtp: 3, done: 4 };

  function show(id) {
    cur = id;
    ['step1', 'stepOtp', 'step2', 'done'].forEach(function (s) { $(s).hidden = s !== id; });
    var n = STEP_NO[id], st = document.querySelectorAll('#steps .s');
    st.forEach(function (el, i) { el.classList.toggle('cur', i + 1 === n); });
    $('steps').hidden = n === 4;
    $('back').hidden = n === 4 || id === 'stepOtp';   // tài khoản đã được tạo nên không quay lại sửa hồ sơ
    window.scrollTo(0, 0);
    if (id === 'step1') $('regEmail').focus();
    else if (id === 'stepOtp') $('regOtp').focus();
    else if (id === 'step2') $('fullname').focus();
  }
  function err(id, msg) { var e = $('e-' + id); if (e) e.textContent = msg || ''; $(id).classList.toggle('bad', !!msg); $(id).setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }

  document.querySelectorAll('.eye').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = $(b.dataset.target), h = i.type === 'password';
      i.type = h ? 'text' : 'password';
      b.setAttribute('aria-label', h ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
      b.setAttribute('aria-pressed', h ? 'true' : 'false');
      b.classList.toggle('is-on', h);
    });
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
  });
  // Gợi ý email sinh viên từ mã sinh viên (chỉ khi ô email còn trống)
  ['regEmail', 'password', 'password2', 'regOtp', 'fullname', 'studentid', 'phone'].forEach(function (id) {
    $(id).addEventListener('input', function () { err(id, ''); });
  });

  A.pwMeter($('password'));

  // Quay lại: lùi một bước; bước đầu thì về trang chủ
  $('back').addEventListener('click', function (e) {
    if (cur === 'step2') { e.preventDefault(); show('step1'); }
  });

  function countdown(btn) {
    var left = A.config.otpResendSec;
    btn.disabled = true;
    btn.textContent = 'Gửi lại (' + left + 's)';
    clearInterval(timer);
    timer = setInterval(function () {
      left--;
      if (left <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = 'Gửi lại OTP'; }
      else btn.textContent = 'Gửi lại (' + left + 's)';
    }, 1000);
  }
  // Hộp thư demo: thay cho email thật vì chưa có máy chủ gửi thư
  function showMailbox(email, code) {
    var box = $('mailbox');
    if (!code) { box.hidden = true; return; }
    $('mbTo').textContent = email;
    $('mbCode').textContent = code;
    box.hidden = false;
  }

  // Gửi OTP tới email; trả về Promise<boolean>
  function sendOtp(email, btn, label) {
    busy = true;
    A.setLoading(btn, true, label);
    return A.api.sendRegisterOtp(email).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        A.toast('error', 'Gửi OTP thất bại. ' + res.message);
        return false;
      }
      $('otpTo').textContent = res.email;
      A.toast('success', 'Nếu email hợp lệ, mã OTP đã được gửi tới ' + res.email + '.');
      return true;
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Không gửi được OTP, vui lòng thử lại.');
      return false;
    });
  }

  // Bước 1: email + mật khẩu -> sang bước hồ sơ (email trùng sẽ được máy chủ báo ở bước tạo tài khoản)
  $('f1').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var em = $('regEmail').value.trim(), p = $('password').value, p2 = $('password2').value;
    var ok = [
      err('regEmail', EMAIL_RE.test(em) ? '' : 'Email chưa đúng định dạng'),
      err('password', A.validatePassword(p)),
      err('password2', p2 && p2 === p ? '' : 'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    if (!ok) { A.toast('error', $('e-regEmail').textContent || $('e-password').textContent || 'Vui lòng kiểm tra lại thông tin tài khoản.'); A.focusFirstError($('f1')); return; }
    $('email').value = em;
    show('step2');
  });

  // Gửi lại OTP
  $('resendOtp').addEventListener('click', function () {
    if (busy) return;
    var btn = this;
    sendOtp($('regEmail').value.trim(), btn, 'Đang gửi...').then(function (sent) { if (sent) { $('regOtp').value = ''; $('regOtp').focus(); countdown(btn); } else if (!btn.disabled) { btn.textContent = 'Gửi lại OTP'; } });
  });

  // Bước 3: xác thực OTP -> hoàn tất
  $('fOtp').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var code = $('regOtp').value.trim();
    if (!err('regOtp', /^\d{6}$/.test(code) ? '' : 'Mã OTP gồm 6 chữ số')) { A.toast('error', 'Mã OTP gồm 6 chữ số.'); A.focusFirstError($('fOtp')); return; }
    var btn = $('fOtp').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang xác thực...');
    A.api.verifyRegisterOtp($('regEmail').value.trim(), code).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) { err('regOtp', res.message); A.toast('error', 'Xác thực thất bại. ' + res.message); return; }
      clearInterval(timer);
      A.toast('success', 'Xác thực email thành công. Bạn có thể đăng nhập ngay.');
      show('done');
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });

  // Bước 2: hồ sơ -> tạo tài khoản (máy chủ gửi OTP)
  $('f2').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var sid = $('studentid').value.trim(), ph = $('phone').value.replace(/\s/g, '');
    var ok = [
      err('fullname', $('fullname').value.trim() ? '' : 'Nhập họ và tên'),
      err('studentid', !sid ? 'Nhập mã sinh viên' : /^\d+$/.test(sid) ? '' : 'Mã sinh viên chỉ gồm chữ số'),
      err('phone', !ph || /^0\d{9}$/.test(ph) ? '' : 'Nhập 10 số, bắt đầu bằng 0')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng kiểm tra lại các trường bị báo lỗi.'); A.focusFirstError($('f2')); return; }

    var btn = $('f2').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang tạo tài khoản...');
    A.api.register({
      password: $('password').value,
      fullname: $('fullname').value, email: $('regEmail').value.trim(), studentid: sid, phone: ph,
      cls: $('class').value.trim(), faculty: $('faculty').value.trim(),
      gender: (document.querySelector('input[name="gender"]:checked') || {}).value
    }).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        A.toast('error', 'Đăng ký thất bại. ' + res.message);
        var ids = Object.keys(res.fields || {});
        ids.forEach(function (id) { err(id, res.fields[id]); });
        if (ids.indexOf('regEmail') > -1 || ids.indexOf('password') > -1) show('step1');
        else if (ids.length) A.focusFirstError($('f2'));
        return;
      }
      $('otpTo').textContent = res.email;
      $('regOtp').value = '';
      $('otpHint').textContent = 'Mã có hiệu lực 5 phút.';
      A.toast('success', 'Đã tạo tài khoản. Mã OTP được gửi tới ' + res.email + '.');
      show('stepOtp');
      countdown($('resendOtp'));
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });

  // Quay lại từ trang đăng nhập khi email chưa xác thực: vào thẳng bước nhập OTP và gửi mã mới
  var pending = null;
  try { pending = JSON.parse(sessionStorage.getItem('sems_verify_email')); sessionStorage.removeItem('sems_verify_email'); } catch (e) { pending = null; }
  if (pending && /[?&]verify=1/.test(location.search)) {
    $('regEmail').value = pending;
    $('otpTo').textContent = pending;
    show('stepOtp');
    sendOtp(pending, $('resendOtp'), 'Đang gửi...').then(function () { countdown($('resendOtp')); });
  }
})();
