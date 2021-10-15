const Produto = require('../models/ProdutoModel');
const Cliente = require('../models/ClienteModel');
const Venda = require('../models/VendaModel');

exports.index = async function (req, res){
    let produtos = [];
    const p = new Produto();
    produtos = await p.getProdutos();
    
    res.render('vendas',{produtos});
}

exports.create = async function (req, res){
    const {itens, cpf} = req.body; 
    const cliente = new Cliente({cpf:cpf});
    const idCliente = await cliente.register();
    const idVendedor = req.session.user.id_usuario;

    const venda = new Venda(itens, idCliente, idVendedor);
    venda.create();

    if(cliente.erros.length > 0){
        console.log(cliente.erros);
        return res.json({ type:'danger', message:cliente.erros[0] })
    }
    return res.json({type:'success', message:'Venda Realizada Com Sucesso'});
}