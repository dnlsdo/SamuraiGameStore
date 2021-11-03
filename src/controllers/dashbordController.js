const Venda = require('../models/VendaModel');
const Funcionario = require('../models/LoginModel');

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