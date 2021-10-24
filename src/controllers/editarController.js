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
    console.log('BODY:',req.params);
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