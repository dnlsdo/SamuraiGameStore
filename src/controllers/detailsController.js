const Venda = require('../models/VendaModel');
//Renderiza tela de detlahes de venda, pelo id da venda
exports.index = async (req, res)=>{
    
    const venda = new Venda();
    venda.id = req.params.id;

    const general = await venda.generalDetails(); 
    const products = await venda.productsDetails();
    res.render('vendaDetails', {general, products});
}