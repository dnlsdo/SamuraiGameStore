const form = document.querySelector('#form-user');
const btnAlterar = document.querySelector('#btn-alterar');
const senha = document.querySelector('#user-password');
const senha2 = form.querySelector('#user-password2');

console.log('oi')

btnAlterar.addEventListener('click', function(e){
        console.log('estive no alterar')
        const allInputs = form.querySelectorAll('.blocked');
        allInputs.forEach((input)=>{
            input.removeAttribute('hidden');
            input.removeAttribute('readonly');
            input.removeAttribute('disabled');
        });
        btnAlterar.textContent = 'SALVAR';  
        btnAlterar.setAttribute('type', 'submit');
});

senha.addEventListener('focus', (e)=>{
    const lblsenha = form.querySelector("#lbl-pass2");
    lblsenha.removeAttribute('hidden');
    senha2.removeAttribute('hidden');
    senha.value = '';
})

    




/* const nome = form.querySelector('#user-name');;
const email = form.querySelector('#user-email');
const cargo = form.querySelector('#user-cargo');
const senha = form.querySelector('#user-password');
const confSenha = form.querySelector('#user-password2');

*/