const Venda = require('../models/VendaModel');
const Funcionario = require('../models/LoginModel');
const Produto = require('../models/ProdutoModel');

exports.venda = async (req, res)=>{
    const v = new Venda();
    const info = await v.GeneralInfo();
    const data = await v.ComparativeYear();
    res.render('dashBord1', {info, data})
}
exports.funcionario = async (req, res) =>{
    const f = new Funcionario();
    const data = await f.comparativeVendedores();
    res.render('dashBordFuncionario', {data});
}
exports.categoria = async (req, res)=>{
    const p = new Produto();
    const data = await p.comparativeTipo();
    res.render('dashBordCategoria', {data});
}