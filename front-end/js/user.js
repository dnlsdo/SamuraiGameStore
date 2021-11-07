const form = document.querySelector('#form-user');
const btnAlterar = document.querySelector('#btn-alterar');
const senha = document.querySelector('#user-password');
const senha2 = form.querySelector('#user-password2');

//Disponibilizar o input de senha caso o usuário deseje altera-la
btnAlterar.addEventListener('click', function(e){
    if(btnAlterar.textContent !== 'SALVAR'){
        const allInputs = form.querySelectorAll('.blocked');
        allInputs.forEach((input)=>{
            input.removeAttribute('hidden');
            input.removeAttribute('readonly');
            input.removeAttribute('disabled');
        });
        btnAlterar.textContent = 'SALVAR';  
        
    }else{
        btnAlterar.setAttribute('type', 'submit');
    }
});

function validarSenha(){
    if(senha2.hasAttribute('hidden')) return true;
    NovaSenha = senha.value;
    CNovaSenha = senha2.value;
    if (NovaSenha != CNovaSenha){ 
         alert("SENHAS DIFERENTES!\nFAVOR DIGITAR SENHAS IGUAIS");
         return false;
    }
    return true;
}


senha.addEventListener('focus', (e)=>{
    const lblsenha = form.querySelector("#lbl-pass2");
    lblsenha.removeAttribute('hidden');
    senha2.removeAttribute('hidden');
    senha.value = '';
    senha.setAttribute('name','password');
})

    




/* const nome = form.querySelector('#user-name');;
const email = form.querySelector('#user-email');
const cargo = form.querySelector('#user-cargo');
const senha = form.querySelector('#user-password');
const confSenha = form.querySelector('#user-password2');

*/