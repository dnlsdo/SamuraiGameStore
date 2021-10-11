const Produto = require('../models/ProdutoModel');

exports.index = async function (req, res){
    let produtos = [];
    const p = new Produto();
    produtos = await p.getProdutos();
    
    res.render('vendas',{produtos});
}