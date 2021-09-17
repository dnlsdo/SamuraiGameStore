const Login = require('../models/LoginModel');

exports.index = (req, res) =>{
    res.render('login');
}


exports.login = async (req, res) =>{
    const login = new Login(req.body);
    await login.login();
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
    console.log('De sessao',req.session.user);
    req.session.save( function(){
        return res.redirect('/');
    });         
}