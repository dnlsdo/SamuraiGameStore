const Cliente = require('../models/ClienteModel');


exports.showClientes = async (req, res) =>{
    const cliente = new Cliente();
    const clientes = await cliente.allClientes();

    res.render('relatorioCliente',{clientes});
}

exports.orderClientes = async (req, res) =>{
    const order = req.params.order;
    const cliente = new Cliente();
    let result = [];

    switch (order) {
        case 'name':
            result = await cliente.allClientes();
            break;
        case 'date':
            result = await cliente.allClientesByRecent();
            break;
        case 'price':
            result = await cliente.allClientesBySold();
            break;
        case 'price-desc':
            result = await cliente.allClientesBySoldDesc();
            break;
        default:
            result = await cliente.allClientes();
            break;
    }
    result = result.map( obj=>{
        const date = new Date(obj.data_nasc);
        obj.data_nasc = date.toLocaleDateString('pt-BR')
        return obj;
    });

    console.log('Result =>', result);
    return res.status(200).json(result);

}
