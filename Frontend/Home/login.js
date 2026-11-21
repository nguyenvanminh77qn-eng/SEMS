(function(){
  var $=function(i){return document.getElementById(i)};
  function err(id,msg){$('e-'+id).textContent=msg||'';$(id).classList.toggle('bad',!!msg);return !msg}
  var eye=document.querySelector('.eye');
  eye.addEventListener('click',function(){
    var i=$('password'),h=i.type==='password';
    i.type=h?'text':'password';
    eye.setAttribute('aria-label',h?'Ẩn mật khẩu':'Hiện mật khẩu');
  });
  $('f').addEventListener('submit',function(e){
    e.preventDefault();
    var ok=[
      err('username',$('username').value.trim()?'':'Vui lòng nhập tên đăng nhập'),
      err('password',$('password').value?'':'Vui lòng nhập mật khẩu')
    ].every(Boolean);
    if(!ok)return;
    // TODO: gửi tên đăng nhập / mật khẩu tới máy chủ để xác thực.
    window.location.href='home.html';
  });
})();
