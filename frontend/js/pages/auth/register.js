(function () {
  var A = window.SEMSAuth;
  var $ = function (i) { return document.getElementById(i); }, cur = 'step1', busy = false;

  function show(id) {
    cur = id;
    ['step1', 'step2', 'done'].forEach(function (s) { $(s).hidden = s !== id; });
    var n = id === 'step1' ? 1 : id === 'step2' ? 2 : 3, st = document.querySelectorAll('#steps .s');
    st.forEach(function (el, i) { el.classList.toggle('cur', i + 1 === n); });
    $('steps').hidden = n === 3;
    $('back').hidden = n === 3;
    window.scrollTo(0, 0);
    if (id === 'step1') $('username').focus();
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
  $('studentid').addEventListener('blur', function () {
    var sid = $('studentid').value.trim();
    if (/^\d{6,}$/.test(sid) && !$('email').value.trim()) $('email').value = sid + '@student.qnu.edu.vn';
  });
  ['username', 'password', 'password2', 'fullname', 'email', 'studentid', 'phone'].forEach(function (id) {
    $(id).addEventListener('input', function () { err(id, ''); });
  });

  A.pwMeter($('password'));

  $('back').addEventListener('click', function (e) { if (cur === 'step2') { e.preventDefault(); show('step1'); } });

  // Bước 1: tài khoản
  $('f1').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = $('username').value.trim(), p = $('password').value, p2 = $('password2').value;
    var ok = [
      err('username', /^[A-Za-z0-9]{4,30}$/.test(u) ? (A.api.usernameTaken(u) ? 'Tên đăng nhập đã được sử dụng' : '') : 'Tên đăng nhập gồm 4-30 ký tự, chỉ chữ và số'),
      err('password', A.validatePassword(p)),
      err('password2', p2 && p2 === p ? '' : 'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    if (!ok) { A.toast('error', $('e-username').textContent || $('e-password').textContent || 'Vui lòng kiểm tra lại thông tin tài khoản.'); A.focusFirstError($('f1')); return; }
    show('step2');
  });

  // Bước 2: hồ sơ -> tạo tài khoản
  $('f2').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var sid = $('studentid').value.trim(), ph = $('phone').value.replace(/\s/g, '');
    var ok = [
      err('fullname', $('fullname').value.trim() ? '' : 'Nhập họ và tên'),
      err('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()) ? '' : 'Email chưa đúng định dạng'),
      err('studentid', !sid || /^\d+$/.test(sid) ? '' : 'Mã sinh viên chỉ gồm chữ số'),
      err('phone', !ph || /^0\d{9}$/.test(ph) ? '' : 'Nhập 10 số, bắt đầu bằng 0')
    ].every(Boolean);
    if (!ok) { A.toast('error', 'Vui lòng kiểm tra lại các trường bị báo lỗi.'); A.focusFirstError($('f2')); return; }

    var btn = $('f2').querySelector('.submit');
    busy = true;
    A.setLoading(btn, true, 'Đang tạo tài khoản...');
    A.api.register({
      username: $('username').value, password: $('password').value,
      fullname: $('fullname').value, email: $('email').value, studentid: sid, phone: ph,
      cls: $('class').value.trim(), faculty: $('faculty').value.trim(),
      gender: (document.querySelector('input[name="gender"]:checked') || {}).value
    }).then(function (res) {
      busy = false;
      A.setLoading(btn, false);
      if (!res.ok) {
        A.toast('error', 'Đăng ký thất bại. ' + res.message);
        if (res.field === 'username') { show('step1'); err('username', res.message); }
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
