const Produto = require('../models/ProdutoModel');
//Renderiza tela de produtos
exports.index = async (req, res)=>{
    const p = new Produto();
    const produtos = await p.getProdutos();
    //Array para filtrar lista
    const plataformas = await p.getPlataforma();
    const tipos = await p.getTipo();
    res.render('produtos', {produtos, plataformas, tipos});
}
// Buscar produto por Id, nome, plataforma ou tipo
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
// Buscar produto por faixa de preço
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