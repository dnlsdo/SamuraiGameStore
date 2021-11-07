const check = document.querySelector('#check-senha');
const inputPassword = document.querySelector('#inputPassword');
check.checked = false;
//Bloqueia o campos de senha
check.addEventListener('change', ()=>{
    if(check.checked){
       inputPassword.removeAttribute('disabled');
       inputPassword.setAttribute('name','password');
       inputPassword.value = ''
        return
    }
    inputPassword.setAttribute('disabled', true);
    inputPassword.removeAttribute('name');
    inputPassword.value = 'naoSenha'
})