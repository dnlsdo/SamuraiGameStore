
const Login = require('../models/LoginModel');

exports.index = (req, res) =>{
    if(req.session.user) req.session.destroy();
    res.render('login');
}

// exports.cargos = async (req, res) =>{
//     const login = new Login();
//     await login.cargos()
//     res.send(login.user.cargos);
// }


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
    console.log('De sessao',req.session.user);
    req.session.save( function(){
        return res.redirect('/');
    });         
}