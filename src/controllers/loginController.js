const Login = require('../models/LoginModel');

exports.index = (req, res) =>{
    res.render('login');
}


exports.login = async (req, res) =>{
    const login = new Login(req.body);
    await login.login();
    if(login.erros.length > 0){
        res.send('MENSAGENS DE ERROS', login.erros);
        return console.log('=-=-MENSAGENS DE ERROS=-=-=', login.erros);
    } 

    res.send(await login.user());    
}