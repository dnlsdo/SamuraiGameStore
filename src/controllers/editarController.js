const Cliente = require('../models/ClienteModel');
const Funcionario = require('../models/LoginModel');

exports.editClienteIndex = async function(req, res){
    const cliente = new Cliente(req.params);
    await cliente.getClienteByID();
    console.log('cliente', cliente.body)
    return res.render('editarCliente', {cliente});
}
exports.editCliente = async function(req, res){
    const body = Object.assign(req.params, req.body);
    console.log('BODY:',body);
    const cliente = new Cliente(body);
    await cliente.alter();

    if(cliente.erros.length > 0){
        req.flash('erros', cliente.erros);
        req.session.save( function(){
            console.log(cliente.erros)
            return res.redirect('back');
        });
        return;
    }
    req.flash('success', 'Cliente alterado com sucesso');
    req.session.save( function(){
        return res.redirect('back');
    }); 
}

exports.editFuncionarioIndex = async function(req, res){
    const body = Object.assign(req.params, req.body);
    const funcionario = new Funcionario(body);
    await funcionario.getByID();
    return res.render('editarFuncionario', {funcionario});
}

exports.editFuncionario = async function(req, res){
    const body = Object.assign(req.params, req.body);
    console.log('BODY:',body);
    const funcionario = new Funcionario(body);
   
    const acesso = funcionario.body.cargo === 'Gerente' ? 0 : 1;
    funcionario.body.acesso = acesso;
    
    console.log('funcionarioUser: ', body);
    
    await funcionario.alter();

    if(funcionario.erros.length > 0){
        req.flash('erros', funcionario.erros);
        req.session.save( function(){
            console.log(funcionario.erros)
            return res.redirect('back');
        });
        return;
    }
    req.flash('success', 'Usuario alterado com sucesso');
    req.session.save( function(){
        return res.redirect('back');
    }); 
}