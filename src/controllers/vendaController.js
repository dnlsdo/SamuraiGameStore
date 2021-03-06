const Produto = require('../models/ProdutoModel');
const Cliente = require('../models/ClienteModel');
const Venda = require('../models/VendaModel');
//rendereiza Tela de Vendas com os produtos e as plataformas (para filtro)
exports.index = async function (req, res){
    let produtos = [];
    let plataformas = [];
    const p = new Produto();
    produtos = await p.getProdutos();
    plataformas = await p.getPlataforma();
    res.render('vendas',{produtos, plataformas});
}
//Cria uma venda
exports.create = async function (req, res){
    const {itens, cpf} = req.body; 
    const cliente = new Cliente({cpf:cpf});
    const idCliente = await cliente.register();
    const idVendedor = req.session.user.id_usuario;

    const venda = new Venda(itens, idCliente, idVendedor);
    await venda.create();
    console.log('erros:',venda.erros);
    //Se houver erro mostrar na tela
    if(venda.erros.length > 0){
        console.log('Erro na venda');
        return res.json({type:'danger', message:venda.erros[0]});
    } 
    if(cliente.erros.length > 0) return res.json({ type:'danger', message:cliente.erros[0] });
    
    return res.json({type:'success', message:'Venda Realizada Com Sucesso'});
}
//Busca produto através da serchBar
exports.serch = async function (req, res){
    const sProduto = req.params.produto;
    const searchProduto = new Produto();
    
    let result = [];
    if(isNaN(sProduto)){
        result = await searchProduto.getByName(sProduto);
    }else{
        //Caso digitado 0 - Retorna todos produtos
        if(sProduto == 0) result = await searchProduto.getProdutos();
        else result = await searchProduto.getByID(sProduto);
    }
    if(searchProduto.erros.length > 0){
        return res.status(400).json({type: 'danger', message:searchProduto.erros[0]})
    }
    return res.status(200).json(result);
}