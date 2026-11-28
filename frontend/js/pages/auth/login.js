(function () {
  var A = window.SEMSAuth;
  var $ = function (i) { return document.getElementById(i); };
  function err(id, msg) { $('e-' + id).textContent = msg || ''; $(id).classList.toggle('bad', !!msg); $(id).setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }

  // Hiện / ẩn mật khẩu
  var eye = document.querySelector('.eye');
  eye.addEventListener('click', function () {
    var i = $('password'), h = i.type === 'password';
    i.type = h ? 'text' : 'password';
    eye.setAttribute('aria-label', h ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    eye.setAttribute('aria-pressed', h ? 'true' : 'false');
    eye.classList.toggle('is-on', h);
  });
  // Giữ con trỏ trong ô mật khẩu khi bấm con mắt
  eye.addEventListener('mousedown', function (e) { e.preventDefault(); });

  // Cảnh báo khi Caps Lock đang bật lúc gõ mật khẩu
  function caps(e) { if (e.getModifierState) $('caps').hidden = !e.getModifierState('CapsLock'); }
  $('password').addEventListener('keydown', caps);
  $('password').addEventListener('keyup', caps);
  $('password').addEventListener('blur', function () { $('caps').hidden = true; });

  ['email', 'password'].forEach(function (id) {
    $(id).addEventListener('input', function () { err(id, ''); });
  });

  var busy = false;
  $('f').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var ok = [
      err('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()) ? '' : 'Vui lòng nhập email hợp lệ'),
      err('password', $('password').value ? '' : 'Vui lòng nhập mật khẩu')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng điền đầy đủ thông tin đăng nhập.'); A.focusFirstError($('f')); return; }

    var btn = $('f').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang đăng nhập...');
    A.api.login($('email').value.trim(), $('password').value, $('remember').checked).then(function (res) {
      if (!res.ok) {
        busy = false;
        A.setLoading(btn, false);
        if (res.code === 'EMAIL_NOT_VERIFIED') {   // đã đăng ký nhưng chưa nhập OTP: chuyển sang bước xác thực email
          try { sessionStorage.setItem('sems_verify_email', JSON.stringify($('email').value.trim())); } catch (e) { /* bỏ qua */ }
          A.toast('info', 'Email chưa được xác thực. Đang chuyển sang bước nhập mã OTP...', 3500);
          setTimeout(function () { location.href = 'register.html?verify=1'; }, 1200);
          return;
        }
        if (res.field && $('e-' + res.field)) { err(res.field, res.message); $(res.field).focus(); }
        A.toast('error', 'Đăng nhập thất bại. ' + res.message);
        return;
      }
      // Thành công: báo, rồi tự chuyển đến khu vực đúng với vai trò
      A.toast('success', 'Đăng nhập thành công. Xin chào ' + res.user.fullname + ' (' + A.roleLabel(res.user.role) + ').', 3000);
      btn.textContent = 'Đang chuyển trang...';
      setTimeout(function () { location.href = A.takeNext(res.user.role) || A.roleHome(res.user); }, 1100);
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });
})();
