const Produto = require('../models/ProdutoModel');

exports.index = async (req, res)=>{
    const p = new Produto();
    const produtos = await p.getProdutos();
    const plataformas = await p.getPlataforma();
    const tipos = await p.getTipo();
    res.render('produtos', {produtos, plataformas, tipos});
}

exports.search = async(req, res)=>{
    const p = new Produto();
    const {field, value} = req.body;
    const result = await p.getByFieldValue(field, value);
    if(result.length === 0){
        console.log('DATA VAZIO');
        return res.status(400).json({});
    } 
    return res.status(200).json(result);
}

exports.searchPrices = async (req, res)=>{
    const p = new Produto();
    const {inicial, final} = req.body;
    const result = await p.getProdutoByPrice(inicial, final);
    if(result.length === 0){
        console.log('DATA VAZIO');
        return res.status(400).json({});
    } 
    return res.status(200).json(result);
}