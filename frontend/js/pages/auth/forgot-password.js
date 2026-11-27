(function () {
  var A = window.SEMSAuth;
  var $ = function (id) { return document.getElementById(id); };
  var cur = 'step1', timer = null, ctx = null, busy = false;

  function show(id) {
    cur = id;
    ['step1', 'step2', 'done'].forEach(function (s) { $(s).hidden = s !== id; });
    $('back').hidden = id === 'done';
    window.scrollTo(0, 0);
  }
  function err(id, msg) { $('e-' + id).textContent = msg || ''; $(id).classList.toggle('bad', !!msg); $(id).setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  ['email', 'otp', 'password', 'password2'].forEach(function (id) {
    $(id).addEventListener('input', function () { err(id, ''); });
  });

  A.pwMeter($('password'));

  // Quay lại: bước 2 -> bước 1; bước 1 -> trang đăng nhập
  $('back').addEventListener('click', function (e) { if (cur === 'step2') { e.preventDefault(); show('step1'); } });

  document.querySelectorAll('.eye').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = $(b.dataset.target), hidden = i.type === 'password';
      i.type = hidden ? 'text' : 'password';
      b.setAttribute('aria-label', hidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
      b.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      b.classList.toggle('is-on', hidden);
    });
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
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

  // Gửi OTP
  $('sendOtp').addEventListener('click', function () {
    if (busy) return;
    var btn = this, hint = $('otpHint');
    if (!err('email', emailOk($('email').value.trim()) ? '' : 'Email chưa đúng định dạng')) { A.toast('error', 'Hãy nhập email hợp lệ trước khi gửi OTP.'); A.focusFirstError($('f1')); return; }

    busy = true;
    A.setLoading(btn, true, 'Đang gửi...');
    A.api.sendOtp($('email').value.trim()).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        hint.textContent = 'Mã OTP sẽ được gửi tới email đã đăng ký.';
        hint.classList.remove('ok');
        showMailbox('', null);
        A.toast('error', 'Gửi OTP thất bại. ' + res.message);
        return;
      }
      hint.textContent = 'Nếu email đã đăng ký, mã OTP đã được gửi tới ' + res.email + '. Mã có hiệu lực 5 phút.';
      hint.classList.add('ok');
      showMailbox(res.email, res.demoCode);
      A.toast('success', 'Nếu email đã đăng ký, mã OTP đã được gửi tới ' + res.email + '.');
      if (res.demoCode) A.toast('info', 'Chế độ demo: chưa có máy chủ gửi email, mã OTP hiển thị trong khung "Hộp thư demo".', 7000);
      countdown(btn);
      $('otp').focus();
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Không gửi được OTP, vui lòng thử lại.');
    });
  });

  // Bước 1: xác nhận OTP
  $('f1').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var u = $('email').value.trim(), code = $('otp').value.trim();
    var ok = [
      err('email', emailOk(u) ? '' : 'Email chưa đúng định dạng'),
      err('otp', /^\d{6}$/.test(code) ? '' : 'Mã OTP gồm 6 chữ số')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng kiểm tra lại thông tin.'); A.focusFirstError($('f1')); return; }

    var btn = $('f1').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang xác nhận...');
    A.api.verifyOtp(u, code).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) { err('otp', res.message); A.toast('error', 'Xác nhận thất bại. ' + res.message); return; }
      ctx = { email: u, code: code };
      A.toast('success', 'Xác minh thành công. Hãy tạo mật khẩu mới.');
      show('step2');
      $('password').focus();
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });

  // Bước 2: mật khẩu mới
  $('f2').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy || !ctx) return;
    var p = $('password').value, p2 = $('password2').value;
    var ok = [
      err('password', A.validatePassword(p)),
      err('password2', p2 && p2 === p ? '' : 'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng kiểm tra lại mật khẩu mới.'); A.focusFirstError($('f2')); return; }

    var btn = $('f2').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang cập nhật...');
    A.api.resetPassword(ctx.email, ctx.code, p).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        A.toast('error', 'Đặt lại mật khẩu thất bại. ' + res.message);
        if (res.field === 'password') { err('password', res.message); return; }   // mật khẩu chưa hợp lệ: sửa tại chỗ
        if (res.code === 'network') return;                                      // mất kết nối: giữ nguyên để thử lại
        ctx = null; show('step1');   // mã hết hạn / không hợp lệ -> làm lại từ đầu
        return;
      }
      clearInterval(timer);
      A.toast('success', 'Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.');
      show('done');
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });
})();
