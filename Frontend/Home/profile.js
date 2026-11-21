(function () {
  var $ = function (id) { return document.getElementById(id); };
  var toastTimer = null;

  function err(id, msg) {
    $('e-' + id).textContent = msg || '';
    $(id).classList.toggle('bad', !!msg);
    return !msg;
  }
  function clearErrors(form) {
    form.querySelectorAll('.err').forEach(function (p) { p.textContent = ''; });
    form.querySelectorAll('input.bad').forEach(function (i) { i.classList.remove('bad'); });
  }
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3500);
  }

  // ----- Chuyển tab: Thông tin cá nhân / Mật khẩu -----
  var tabs = [$('tab-info'), $('tab-pass')];
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
    $('toast').hidden = true;
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

  // ----- Hiện / ẩn mật khẩu -----
  document.querySelectorAll('.eye').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = $(b.dataset.target), hidden = i.type === 'password';
      i.type = hidden ? 'text' : 'password';
      b.setAttribute('aria-label', hidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
  });

  // ----- Đổi ảnh đại diện -----
  var MAX_MB = 2, SIZE = 400;
  var avatarData = null;   // ảnh đã cắt vuông 400x400 (data URL) — dùng để gửi lên máy chủ
  var fileInput = $('avatarFile');

  function avatarError(msg) { $('avatarErr').textContent = msg || ''; }
  function showAvatar(url) {
    var img = $('avatarImg');
    img.src = url || '';
    img.hidden = !url;
    $('avatarPh').style.display = url ? 'none' : '';
    $('avatarRemove').hidden = !url;
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
      fileInput.value = '';
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      avatarError('Ảnh quá lớn, tối đa ' + MAX_MB + 'MB.');
      fileInput.value = '';
      return;
    }
    var src = URL.createObjectURL(f), img = new Image();
    img.onload = function () {
      // Cắt vuông từ giữa ảnh rồi thu về 400x400
      var side = Math.min(img.width, img.height);
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = SIZE;
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
      avatarData = canvas.toDataURL('image/jpeg', 0.9);
      URL.revokeObjectURL(src);
      showAvatar(avatarData);
      // TODO: tải avatarData (hoặc file gốc) lên máy chủ.
      toast('Đã đổi ảnh đại diện.');
    };
    img.onerror = function () {
      URL.revokeObjectURL(src);
      avatarError('Không đọc được ảnh này, hãy chọn ảnh khác.');
    };
    img.src = src;
    fileInput.value = '';   // cho phép chọn lại đúng file đó lần sau
  });

  $('avatarRemove').addEventListener('click', function () {
    avatarData = null;
    avatarError('');
    showAvatar(null);
    // TODO: yêu cầu máy chủ xóa ảnh đại diện.
    toast('Đã xóa ảnh đại diện.');
  });

  // ----- Thông tin cá nhân -----
  var info = $('f-info');
  $('cancel-info').addEventListener('click', function () {
    info.reset();            // trả về dữ liệu ban đầu
    clearErrors(info);
    $('toast').hidden = true;
  });
  info.addEventListener('submit', function (e) {
    e.preventDefault();
    var sid = $('studentid').value.trim(), ph = $('phone').value.replace(/\s/g, '');
    var ok = [
      err('fullname', $('fullname').value.trim() ? '' : 'Nhập họ và tên'),
      err('studentid', !sid || /^\d+$/.test(sid) ? '' : 'Mã sinh viên chỉ gồm chữ số'),
      err('phone', !ph || /^0\d{9}$/.test(ph) ? '' : 'Nhập 10 số, bắt đầu bằng 0'),
      err('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()) ? '' : 'Email chưa đúng định dạng')
    ].every(Boolean);
    if (!ok) return;
    // TODO: gửi thông tin đã sửa tới máy chủ.
    toast('Đã cập nhật thông tin cá nhân.');
  });

  // ----- Cập nhật mật khẩu -----
  var pass = $('f-pass');
  $('cancel-pass').addEventListener('click', function () {
    pass.reset();
    clearErrors(pass);
    $('toast').hidden = true;
  });
  pass.addEventListener('submit', function (e) {
    e.preventDefault();
    var o = $('old').value, n1 = $('new1').value, n2 = $('new2').value;
    var ok = [
      err('old', o ? '' : 'Nhập mật khẩu cũ'),
      err('new1', n1.length < 8 ? 'Mật khẩu mới cần ít nhất 8 ký tự' : (n1 === o ? 'Mật khẩu mới phải khác mật khẩu cũ' : '')),
      err('new2', n2 && n2 === n1 ? '' : 'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    if (!ok) return;
    // TODO: gửi mật khẩu cũ và mới tới máy chủ.
    pass.reset();
    toast('Đã cập nhật mật khẩu.');
  });
})();
