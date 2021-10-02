const Cliente = require('../models/ClienteModel');

exports.funcionario = (req, res) =>{
    return res.render('cadastroFuncionario');
}

exports.cliente = (req, res)=>{
    return res.render('cadastroCliente');
}

exports.produto = (req, res) =>{
    return res.render('cadastroProduto');
}

exports.createCliente = async (req, res) =>{
    const cliente = new Cliente(req.body);
    await cliente.create();
    if(cliente.erros.length > 0){
        req.flash('erros', cliente.erros);
        req.session.save( function(){
            return res.redirect('back');
        });
        return;
    }
    req.flash('success', 'Cliente criado com sucesso');
    req.session.save( function(){
        return res.redirect('back');
    });
}
exports.createProduto = async (req, res) =>{
    return res.send('OLÁ')
}

