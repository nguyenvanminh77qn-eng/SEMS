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
  });

  // Cảnh báo khi Caps Lock đang bật lúc gõ mật khẩu
  function caps(e) { if (e.getModifierState) $('caps').hidden = !e.getModifierState('CapsLock'); }
  $('password').addEventListener('keydown', caps);
  $('password').addEventListener('keyup', caps);
  $('password').addEventListener('blur', function () { $('caps').hidden = true; });

  ['username', 'password'].forEach(function (id) {
    $(id).addEventListener('input', function () { err(id, ''); });
  });

  var busy = false;
  $('f').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var ok = [
      err('username', $('username').value.trim() ? '' : 'Vui lòng nhập tên đăng nhập, email hoặc mã sinh viên'),
      err('password', $('password').value ? '' : 'Vui lòng nhập mật khẩu')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng điền đầy đủ thông tin đăng nhập.'); A.focusFirstError($('f')); return; }

    var btn = $('f').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang đăng nhập...');
    A.api.login($('username').value, $('password').value, $('remember').checked).then(function (res) {
      if (!res.ok) {
        busy = false;
        A.setLoading(btn, false);
        if (res.field) { err(res.field, res.message); $(res.field).focus(); }
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
