(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cur = 'step1', timer = null;

  function show(id) {
    cur = id;
    ['step1', 'step2', 'done'].forEach(function (s) { $(s).hidden = s !== id; });
    $('back').hidden = id === 'done';
    window.scrollTo(0, 0);
  }
  function err(id, msg) {
    $('e-' + id).textContent = msg || '';
    $(id).classList.toggle('bad', !!msg);
    return !msg;
  }
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  // Quay lại: bước 2 -> bước 1; bước 1 -> trang đăng nhập (liên kết mặc định)
  $('back').addEventListener('click', function (e) {
    if (cur === 'step2') { e.preventDefault(); show('step1'); }
  });

  // Hiện / ẩn mật khẩu
  document.querySelectorAll('.eye').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = $(b.dataset.target), hidden = i.type === 'password';
      i.type = hidden ? 'text' : 'password';
      b.setAttribute('aria-label', hidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
  });

  // Gửi OTP: kiểm tra email rồi đếm ngược 60 giây trước khi cho gửi lại
  $('sendOtp').addEventListener('click', function () {
    var btn = this, hint = $('otpHint');
    if (!err('email', emailOk($('email').value.trim()) ? '' : 'Email chưa đúng định dạng')) return;
    // TODO: gọi API gửi mã OTP tới email.
    hint.textContent = 'Đã gửi mã OTP, vui lòng kiểm tra email.';
    hint.classList.add('ok');
    var left = 60;
    btn.disabled = true;
    btn.textContent = 'Gửi lại (' + left + 's)';
    clearInterval(timer);
    timer = setInterval(function () {
      left--;
      if (left <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = 'Gửi lại OTP';
      } else {
        btn.textContent = 'Gửi lại (' + left + 's)';
      }
    }, 1000);
  });

  // Bước 1: xác nhận OTP
  $('f1').addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = [
      err('username', $('username').value.trim() ? '' : 'Vui lòng nhập tên đăng nhập'),
      err('email', emailOk($('email').value.trim()) ? '' : 'Email chưa đúng định dạng'),
      err('otp', /^\d{6}$/.test($('otp').value.trim()) ? '' : 'Mã OTP gồm 6 chữ số')
    ].every(Boolean);
    // TODO: gửi tên đăng nhập, email, OTP tới máy chủ để xác minh.
    if (ok) show('step2');
  });

  // Bước 2: tạo mật khẩu mới
  $('f2').addEventListener('submit', function (e) {
    e.preventDefault();
    var p = $('password').value, p2 = $('password2').value;
    var ok = [
      err('password', p.length >= 8 ? '' : 'Mật khẩu cần ít nhất 8 ký tự'),
      err('password2', p2 && p2 === p ? '' : 'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    // TODO: gửi mật khẩu mới tới máy chủ.
    if (ok) show('done');
  });
})();
