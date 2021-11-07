const Cliente = require('../models/ClienteModel');
const Funcionario = require('../models/LoginModel');
const Venda = require('../models/VendaModel');
const convert = require('xml-js');
// Renderiza Telas de relatório com seus respectivos dados
exports.showClientes = async (req, res) =>{
    const cliente = new Cliente();
    const clientes = await cliente.allClientes();
    return res.render('relatorioCliente',{clientes});
}

exports.showFuncionario = async (req, res) =>{
    const funcionario = new Funcionario();
    const funcionarios = await funcionario.allUser();

    res.render('relatorioFuncionario', {funcionarios});
}

exports.showVenda = async (req, res) =>{
    const venda = new Venda();
    const vendas = await venda.allVendas();

    res.render('relatorioVenda', {vendas});
}
// Busca dados para ordenar cliente 
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

    return res.status(200).json(result);

}

exports.orderFuncionario = async (req, res) =>{
    const order = req.params.order;
    const funcionario = new Funcionario();
    let result = [];

    switch (order) {
        case 'name':
            result = await funcionario.allUser();
            break;
        case 'date':
            result = await funcionario.allUserByRecent();
            break;
        case 'price':
            result = await funcionario.allUserBySold();
            break;
        case 'price-desc':
            result = await funcionario.allUserBySoldDesc();
            break;
        default:
            result = await funcionario.allClientes();
            break;
    }

    return res.status(200).json(result);

}

exports.orderVenda = async (req, res) =>{
    const order = req.params.order;
    const venda = new Venda();
    let result = [];

    switch (order) {
        case 'name':
            result = await venda.allVendas();
            break;
        case 'date':
            result = await venda.allVendasByRecent();
            break;
        case 'price':
            result = await venda.allVendasByValue();
            break;
        case 'price-desc':
            result = await venda.allVendasByValueDesc();
            break;
        default:
            result = await venda.allVendas();
            break;
    }
    result = result.map( obj=>{
        const date = new Date(obj.data);
        obj.data = date.toLocaleDateString('pt-BR')
        return obj;
    });

    return res.status(200).json(result);
}
// Gera XML dos dados do funcionário > Requisito de tópicos
exports.xmlFuncionario = async (req, res) =>{
    const funcionario = new Funcionario();
    const data = await funcionario.allUser();
    const body = {'Funcionario':data}
    const result = convert.js2xml(body, { compact: true, spaces:4});

    return res.send(result);
}
// Gera JSON dos dados de cliente > Requisito de tópicos
exports.jsonCliente = async (req, res) =>{
    const cliente = new Cliente();
    const data = await cliente.allClientes();
    
    return res.send(data);
}