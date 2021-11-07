
const Login = require('../models/LoginModel');
//Renderiza tela de Login
exports.index = (req, res) =>{
    if(req.session.user) req.session.destroy();
    res.render('login');
}
// Altera Usuário logado através da tela 'Meu usuario'
exports.alter = async (req, res) =>{
    const login = new Login(req.body);
    login.user = req.session.user;
   
    const acesso = login.user.cargo === 'Gerente' ? 0 : 1;
    login.body.acesso = acesso;
    
    console.log('LoginUser: ', login.user);
    
    //Regra de Negócio
    if(login.body.cargo !== login.user.cargo && login.user.acesso === 0){
        login.body.acesso = 1;
    } else if (login.body.cargo !== login.user.cargo){
        login.erros.push('Somente o gerente pode alterar um cargo');
    }

    await login.alter();

    if(login.erros.length > 0){
        req.flash('erros', login.erros);
        req.session.save( function(){
            console.log(login.erros)
            return res.redirect('back');
        });
        return;
    }
    req.flash('success', 'Usuario alterado com sucesso');
    req.session.user = Object.assign({}, login.user);
    req.session.save( function(){
        return res.redirect('back');
    }); 
}

//Responsável por efetuar o Login e carregar a nova sessão
exports.login = async (req, res) =>{
    const login = new Login(req.body);
    await login.login();
    await login.cargos()
    //Buscar os cargos disponíveis             


    if(login.erros.length > 0){
        req.flash('erros', login.erros);
        req.session.save( function(){
            console.log(login.erros)
            return res.redirect('../login');
        });
        return;
    }
    req.flash('success', 'Você está logado');
    req.session.user = Object.assign({}, login.user);
    req.session.save( function(){
        return res.redirect('/');
    });         
}

