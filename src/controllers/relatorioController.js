const Cliente = require('../models/ClienteModel');


exports.showClientes = async (req, res) =>{
    const cliente = new Cliente();
    const clientes = await cliente.allClientes();



    res.render('relatorioCliente',{clientes});
}

