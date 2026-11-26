(function () {
  var A = window.SEMSAuth;
  var $ = function (i) { return document.getElementById(i); }, cur = 'step1', busy = false, timer = null, verifiedEmail = '';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var STEP_NO = { step1: 1, stepOtp: 2, step2: 3, done: 4 };

  function show(id) {
    cur = id;
    ['step1', 'stepOtp', 'step2', 'done'].forEach(function (s) { $(s).hidden = s !== id; });
    var n = STEP_NO[id], st = document.querySelectorAll('#steps .s');
    st.forEach(function (el, i) { el.classList.toggle('cur', i + 1 === n); });
    $('steps').hidden = n === 4;
    $('back').hidden = n === 4;
    window.scrollTo(0, 0);
    if (id === 'step1') $('regEmail').focus();
    else if (id === 'stepOtp') $('regOtp').focus();
    else if (id === 'step2') $('fullname').focus();
  }
  function err(id, msg) { $('e-' + id).textContent = msg || ''; $(id).classList.toggle('bad', !!msg); $(id).setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }

  document.querySelectorAll('.eye').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = $(b.dataset.target), h = i.type === 'password';
      i.type = h ? 'text' : 'password';
      b.setAttribute('aria-label', h ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
  });
  // Gợi ý email sinh viên từ mã sinh viên (chỉ khi ô email còn trống)
  ['regEmail', 'password', 'password2', 'regOtp', 'fullname', 'studentid', 'phone'].forEach(function (id) {
    $(id).addEventListener('input', function () { err(id, ''); });
  });

  A.pwMeter($('password'));

  // Quay lại: lùi một bước; bước đầu thì về trang chủ
  $('back').addEventListener('click', function (e) {
    if (cur === 'stepOtp') { e.preventDefault(); show('step1'); }
    else if (cur === 'step2') { e.preventDefault(); show('stepOtp'); }
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
        if (res.field === 'email') { show('step1'); err('regEmail', res.message); }
        A.toast('error', 'Gửi OTP thất bại. ' + res.message);
        return false;
      }
      $('otpTo').textContent = res.email;
      showMailbox(res.email, res.demoCode);
      A.toast('success', 'Đã gửi mã OTP tới ' + res.email + '.');
      if (res.demoCode) A.toast('info', 'Chế độ demo: chưa có máy chủ gửi email, mã OTP hiển thị trong khung "Hộp thư demo".', 7000);
      return true;
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Không gửi được OTP, vui lòng thử lại.');
      return false;
    });
  }

  // Bước 1: email + mật khẩu -> gửi OTP
  $('f1').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var em = $('regEmail').value.trim(), p = $('password').value, p2 = $('password2').value;
    var ok = [
      err('regEmail', EMAIL_RE.test(em) ? (A.api.emailTaken(em) ? 'Email này đã được đăng ký' : '') : 'Email chưa đúng định dạng'),
      err('password', A.validatePassword(p)),
      err('password2', p2 && p2 === p ? '' : 'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    if (!ok) { A.toast('error', $('e-regEmail').textContent || $('e-password').textContent || 'Vui lòng kiểm tra lại thông tin tài khoản.'); A.focusFirstError($('f1')); return; }
    sendOtp(em, $('f1').querySelector('.submit'), 'Đang gửi OTP...').then(function (sent) {
      if (!sent) return;
      $('regOtp').value = '';
      $('otpHint').textContent = 'Mã có hiệu lực 5 phút.';
      show('stepOtp');
      countdown($('resendOtp'));
    });
  });

  // Gửi lại OTP
  $('resendOtp').addEventListener('click', function () {
    if (busy) return;
    var btn = this;
    sendOtp($('regEmail').value.trim(), btn, 'Đang gửi...').then(function (sent) { if (sent) { $('regOtp').value = ''; $('regOtp').focus(); countdown(btn); } else if (!btn.disabled) { btn.textContent = 'Gửi lại OTP'; } });
  });

  // Bước 2: xác thực OTP
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
      verifiedEmail = $('regEmail').value.trim();
      $('email').value = verifiedEmail;
      clearInterval(timer);
      A.toast('success', 'Xác thực email thành công. Hãy hoàn thiện hồ sơ.');
      show('step2');
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });

  // Bước 3: hồ sơ -> tạo tài khoản
  $('f2').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var sid = $('studentid').value.trim(), ph = $('phone').value.replace(/\s/g, '');
    var ok = [
      err('fullname', $('fullname').value.trim() ? '' : 'Nhập họ và tên'),
      err('studentid', !sid || /^\d+$/.test(sid) ? '' : 'Mã sinh viên chỉ gồm chữ số'),
      err('phone', !ph || /^0\d{9}$/.test(ph) ? '' : 'Nhập 10 số, bắt đầu bằng 0')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng kiểm tra lại các trường bị báo lỗi.'); A.focusFirstError($('f2')); return; }

    var btn = $('f2').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang tạo tài khoản...');
    A.api.register({
      password: $('password').value,
      fullname: $('fullname').value, email: verifiedEmail, studentid: sid, phone: ph,
      cls: $('class').value.trim(), faculty: $('faculty').value.trim(),
      gender: (document.querySelector('input[name="gender"]:checked') || {}).value
    }).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        A.toast('error', 'Đăng ký thất bại. ' + res.message);
        if (res.field === 'email') { show('step1'); err('regEmail', res.message); }
        else if (res.field) err(res.field, res.message);
        return;
      }
      A.toast('success', 'Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      show('done');
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });
})();
