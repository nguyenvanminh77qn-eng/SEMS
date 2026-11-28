(function () {
  var A = window.SEMSAuth;
  var $ = function (id) { return document.getElementById(id); };
  var me = A.currentUser();          // trang này có data-guard="auth" nên chắc chắn đã đăng nhập
  if (!me) return;
  var busy = false;

  function err(id, msg) { var e = $('e-' + id); if (e) e.textContent = msg || ''; $(id).classList.toggle('bad', !!msg); $(id).setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }
  function clearErrors(form) {
    form.querySelectorAll('.err').forEach(function (p) { p.textContent = ''; });
    form.querySelectorAll('input.bad').forEach(function (i) { i.classList.remove('bad'); });
  }

  // ----- Đổ dữ liệu tài khoản đang đăng nhập -----
  function fillForm() {
    $('fullname').value = me.fullname || '';
    $('studentid').value = me.studentid || '';
    $('class').value = me.cls || '';
    $('faculty').value = me.faculty || '';
    $('phone').value = me.phone || '';
    $('email').value = me.email || '';
    // Email và mã sinh viên là định danh tài khoản nên không sửa ở đây
    $('email').readOnly = true; $('studentid').readOnly = true;
    $('email').title = 'Email đăng nhập, không đổi được'; $('studentid').title = 'Mã sinh viên không đổi được';
    var g = document.querySelector('input[name="gender"][value="' + (me.gender || 'Nam') + '"]');
    if (g) g.checked = true;
  }
  function fillSide() {
    $('whoName').textContent = me.fullname;
    $('whoSub').textContent = A.roleLabel(me.role) + (me.studentid ? ' – ' + me.studentid : '');
    showAvatar(me.avatar);
  }
  // Sinh viên mới có lớp/khoa/mã SV; admin & organizer không cần các trường này
  if (me.role !== 'student') {
    ['studentid', 'class', 'faculty'].forEach(function (id) { $(id).closest('.field').hidden = true; });
  }

  // ----- Chuyển tab -----
  var tabs = [$('tab-info'), $('tab-pass')];
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var next = tabs[(i + 1) % tabs.length];
        selectTab(next);
        next.focus();
      }
    });
  });

  A.pwMeter($('new1'));

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

  // ----- Ảnh đại diện -----
  var MAX_MB = 2, SIZE = 400;
  var fileInput = $('avatarFile');
  function avatarError(msg) { $('avatarErr').textContent = msg || ''; }
  function showAvatar(url) {
    var img = $('avatarImg');
    img.src = url || '';
    img.hidden = !url;
    $('avatarPh').style.display = url ? 'none' : '';
    $('avatarRemove').hidden = !url;
  }
  function saveAvatar(data, okMsg) {
    A.api.updateProfile(me.id, { avatar: data }).then(function (res) {
      if (!res.ok) { A.toast('error', res.message); return; }
      me = res.user; showAvatar(me.avatar);
      A.toast('success', okMsg);
    }).catch(function () { A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.'); });
  }
  function pickAvatar() { fileInput.click(); }
  $('avatarBtn').addEventListener('click', pickAvatar);
  $('avatarChange').addEventListener('click', pickAvatar);

  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    avatarError('');
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) {
      avatarError('Chỉ nhận ảnh PNG, JPG hoặc WEBP.');
      A.toast('error', 'Ảnh không hợp lệ: chỉ nhận PNG, JPG hoặc WEBP.');
      fileInput.value = '';
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      avatarError('Ảnh quá lớn, tối đa ' + MAX_MB + 'MB.');
      A.toast('error', 'Ảnh quá lớn, tối đa ' + MAX_MB + 'MB.');
      fileInput.value = '';
      return;
    }
    var src = URL.createObjectURL(f), img = new Image();
    img.onload = function () {
      var side = Math.min(img.width, img.height);
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = SIZE;
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(src);
      saveAvatar(canvas.toDataURL('image/jpeg', 0.85), 'Đã đổi ảnh đại diện.');
    };
    img.onerror = function () {
      URL.revokeObjectURL(src);
      avatarError('Không đọc được ảnh này, hãy chọn ảnh khác.');
      A.toast('error', 'Không đọc được ảnh này, hãy chọn ảnh khác.');
    };
    img.src = src;
    fileInput.value = '';
  });
  $('avatarRemove').addEventListener('click', function () {
    avatarError('');
    saveAvatar(null, 'Đã xóa ảnh đại diện.');
  });

  // ----- Thông tin cá nhân -----
  var info = $('f-info');
  $('cancel-info').addEventListener('click', function () {
    fillForm(); clearErrors(info);
    A.toast('info', 'Đã hủy các thay đổi chưa lưu.');
  });
  ['fullname', 'studentid', 'phone', 'email'].forEach(function (id) { $(id).addEventListener('input', function () { err(id, ''); }); });

  info.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var sid = $('studentid').value.trim(), ph = $('phone').value.replace(/\s/g, '');
    var ok = [
      err('fullname', $('fullname').value.trim() ? '' : 'Nhập họ và tên'),
      err('studentid', !sid || /^\d+$/.test(sid) ? '' : 'Mã sinh viên chỉ gồm chữ số'),
      err('phone', !ph || /^0\d{9}$/.test(ph) ? '' : 'Nhập 10 số, bắt đầu bằng 0'),
      err('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()) ? '' : 'Email chưa đúng định dạng')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng kiểm tra lại các trường bị báo lỗi.'); A.focusFirstError(info); return; }

    var btn = info.querySelector('.submit');
    var patch = {
      fullname: $('fullname').value.trim(), email: $('email').value.trim(), phone: ph,
      gender: (document.querySelector('input[name="gender"]:checked') || {}).value
    };
    if (me.role === 'student') { patch.studentid = sid; patch.cls = $('class').value.trim(); patch.faculty = $('faculty').value.trim(); }
    busy = true;
    A.setLoading(btn, true, 'Đang lưu...');
    A.api.updateProfile(me.id, patch).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        if (res.field) err(res.field, res.message);
        A.toast('error', 'Cập nhật thất bại. ' + res.message);
        return;
      }
      me = res.user; fillSide();
      A.toast('success', 'Đã cập nhật thông tin cá nhân.');
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });

  // ----- Đổi mật khẩu -----
  var pass = $('f-pass');
  $('cancel-pass').addEventListener('click', function () { pass.reset(); clearErrors(pass); var m = pass.querySelector('.pw-meter'); if (m) m.hidden = true; });
  ['old', 'new1', 'new2'].forEach(function (id) { $(id).addEventListener('input', function () { err(id, ''); }); });

  pass.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var o = $('old').value, n1 = $('new1').value, n2 = $('new2').value;
    var ok = [
      err('old', o ? '' : 'Nhập mật khẩu cũ'),
      err('new1', A.validatePassword(n1) || (n1 === o ? 'Mật khẩu mới phải khác mật khẩu cũ' : '')),
      err('new2', n2 && n2 === n1 ? '' : 'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng kiểm tra lại các trường bị báo lỗi.'); A.focusFirstError(pass); return; }

    var btn = pass.querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang cập nhật...');
    A.api.changePassword(me.id, o, n1).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        if (res.field) err(res.field, res.message);
        A.toast('error', 'Đổi mật khẩu thất bại. ' + res.message);
        return;
      }
      pass.reset();
      var m = pass.querySelector('.pw-meter'); if (m) m.hidden = true;
      A.toast('success', 'Đã cập nhật mật khẩu.');
    }).catch(function () {
      busy = false;
      A.setLoading(btn, false);
      A.toast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    });
  });

  fillForm();
  fillSide();
})();
