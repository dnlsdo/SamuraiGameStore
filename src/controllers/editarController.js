const Cliente = require('../models/ClienteModel');
const Funcionario = require('../models/LoginModel');
const Produto = require('../models/ProdutoModel');

//Renderiza tela de edição de cliente, trazendo os dados do cliente
exports.editClienteIndex = async function(req, res){
    const cliente = new Cliente(req.params);
    await cliente.getClienteByID();
    console.log('cliente', cliente.body)
    return res.render('editarCliente', {cliente});
}
//Altera dados do cliente
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
// Renderiza tela de edição de Funcionários
exports.editFuncionarioIndex = async function(req, res){
    const body = Object.assign(req.params, req.body);
    const funcionario = new Funcionario(body);
    await funcionario.getByID();
    return res.render('editarFuncionario', {funcionario});
}
//Altera Funcionário
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
//Renderiza editar produto
exports.editProdutoIndex = async (req, res)=>{
    const p = new Produto();
    console.log('Params', req.params);
    const result = await p.getByID(req.params.id);
    let produto = {... result[0] };
    if(p.erros.length > 0){
        produto = undefined
        req.flash('erros', p.erros);
        req.session.save( function(){
            console.log('Erros:',p.erros)
            return res.redirect('back');
        });
        return
    }
    console.log('Produtos:', produto);
    return res.render('editarProduto', {produto});
}
//Altera Produto
exports.editProduto = async (req, res)=>{
    const p = new Produto(req.body);
    
    await p.alter();

    if(p.erros.length > 0){
        req.flash('erros', p.erros);
        req.session.save( function(){
            console.log(p.erros)
            return res.redirect('back');
        });
        return;
    }
    req.flash('success', 'Produto alterado com sucesso');
    req.session.save( function(){
        return res.redirect('back');
    }); 
}