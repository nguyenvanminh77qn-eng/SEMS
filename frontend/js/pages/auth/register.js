(function(){
  var $=function(i){return document.getElementById(i)},cur='step1';
  function show(id){
    cur=id;
    ['step1','step2','done'].forEach(function(s){$(s).hidden=s!==id});
    var n=id==='step1'?1:id==='step2'?2:3,st=document.querySelectorAll('#steps .s');
    st.forEach(function(el,i){el.classList.toggle('cur',i+1===n)});
    $('steps').hidden=n===3;
    window.scrollTo(0,0);
  }
  function err(id,msg){$('e-'+id).textContent=msg||'';$(id).classList.toggle('bad',!!msg);return !msg}
  document.querySelectorAll('.eye').forEach(function(b){
    b.addEventListener('click',function(){var i=$(b.dataset.target),h=i.type==='password';i.type=h?'text':'password';b.setAttribute('aria-label',h?'Ẩn mật khẩu':'Hiện mật khẩu')});
  });
  $('back').addEventListener('click',function(e){if(cur==='step2'){e.preventDefault();show('step1')}});
  $('f1').addEventListener('submit',function(e){
    e.preventDefault();
    var u=$('username').value.trim(),p=$('password').value,p2=$('password2').value;
    var ok=[
      err('username',/^[A-Za-z0-9]{4,30}$/.test(u)?'':'Tên đăng nhập gồm 4-30 ký tự, chỉ chữ và số'),
      err('password',p.length>=8?'':'Mật khẩu cần ít nhất 8 ký tự'),
      err('password2',p2&&p2===p?'':'Mật khẩu nhập lại chưa khớp')
    ].every(Boolean);
    if(ok)show('step2');
  });
  $('f2').addEventListener('submit',function(e){
    e.preventDefault();
    var sid=$('studentid').value.trim(),ph=$('phone').value.replace(/\s/g,'');
    var ok=[
      err('fullname',$('fullname').value.trim()?'':'Nhập họ và tên'),
      err('email',/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim())?'':'Email chưa đúng định dạng'),
      err('studentid',!sid||/^\d+$/.test(sid)?'':'Mã sinh viên chỉ gồm chữ số'),
      err('phone',!ph||/^0\d{9}$/.test(ph)?'':'Nhập 10 số, bắt đầu bằng 0')
    ].every(Boolean);
    if(ok)show('done');
  });
})();
