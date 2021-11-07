const Cliente = require('../models/ClienteModel');
const Produto = require('../models/ProdutoModel');
const Login = require('../models/LoginModel');

//Renderiza as telas
exports.funcionario = (req, res) =>{
    return res.render('cadastroFuncionario');
}

exports.cliente = (req, res)=>{
    return res.render('cadastroCliente');
}

exports.produto = (req, res) =>{
    return res.render('cadastroProduto');
}
//Cria cliente
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
//Cria Produto
exports.createProduto = async (req, res) =>{
    const produto = new Produto(req.body);
    produto.create();

    if(produto.erros.length > 0){
        req.flash('erros', produto.erros);
        req.session.save( function(){
            return res.redirect('back');
        });
        return;
    }
    req.flash('success', 'Produto criado com sucesso');
    req.session.save( function(){
        return res.redirect('back');
    });
}
//Cria Funcionário
exports.createFuncionario = async (req, res) =>{
    // Validação de Acesso
    const acesso = req.body.cargo === 'Gerente' ? 0 : 1;
    req.body.acesso = acesso;

    const user = new Login(req.body);
    try{
        await user.create();
    }catch(e){
        console.log('Erro ao tentar criar o usuário', e)
    }
    

    if(user.erros.length > 0){
        req.flash('erros', user.erros);
        req.session.save( function(){
            return res.redirect('back');
        });
        return;
    }
    req.flash('success', 'Usuario criado com sucesso');
    req.session.save( function(){
        return res.redirect('back');
    });
}
