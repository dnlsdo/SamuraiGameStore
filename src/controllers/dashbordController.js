const Venda = require('../models/VendaModel')

exports.venda = async (req, res)=>{
    const v = new Venda();
    const info = await v.GeneralInfo();
    const data = await v.ComparativeYear();
    res.render('dashBord1', {info, data})
}