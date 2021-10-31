const express = require('express');
const router = express.Router();
const middleware = require('./src/middlewares/middlewares')
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const userController = require('./src/controllers/userController');
const cadastroController = require('./src/controllers/cadastroContoller');
const relatorioController = require('./src/controllers/relatorioController');
const vendaController = require('./src/controllers/vendaController');
const editarController = require('./src/controllers/editarController')
const detailController = require('./src/controllers/detailsController');
const produtosController = require('./src/controllers/produtosController');

router.get('/', homeController.index);
//Login
router.get('/login', loginController.index);
router.post('/login/login', loginController.login);
//Tela User
router.get('/user', middleware.loginRequired, userController.index);
router.post('/user/alter', middleware.loginRequired, loginController.alter);
//Cadastros
router.get('/cadastro/funcionario', middleware.loginRequired, cadastroController.funcionario);
router.post('/cadastro/funcionario', middleware.loginRequired, loginController.create);
router.get('/cadastro/cliente',  middleware.loginRequired, cadastroController.cliente);
router.post('/cadastro/cliente', middleware.loginRequired, cadastroController.createCliente);
router.get('/cadastro/produto', cadastroController.produto);
router.post('/cadastro/produto', cadastroController.createProduto);
//Vendas
router.get('/vendas', middleware.loginRequired, vendaController.index);
router.post('/vendas', middleware.loginRequired, vendaController.create);

router.get('/search/:produto', vendaController.serch); 
//Relatórios
router.get('/relatorio/cliente', relatorioController.showClientes);
router.get('/relatorio/cliente/:order', relatorioController.orderClientes);
router.get('/relatorio/funcionario', relatorioController.showFuncionario);
router.get('/relatorio/funcionario/:order', relatorioController.orderFuncionario);
router.get('/relatorio/venda', relatorioController.showVenda);
router.get('/relatorio/venda/:order', relatorioController.orderVenda);
//EDIÇÃO
router.get('/editar/cliente/:id', editarController.editClienteIndex);
router.post('/editar/cliente/:id', editarController.editCliente);
router.get('/editar/funcionario/:id', editarController.editFuncionarioIndex);
router.post('/editar/funcionario/:id', editarController.editFuncionario);
router.get('/editar/produto/:id', editarController.editProdutoIndex);
router.post('/editar/produto/:id', editarController.editProduto);
//Detelhe Venda
router.get('/detalhe-venda/:id', detailController.index);
//Produtos
router.get('/produtos', produtosController.index);
router.post('/produtoSearch', produtosController.search);
router.post('/produtoPriceSearch', produtosController.searchPrices);

router.get('/404', (req, res)=>{
    res.render('404')
});
router.get('/403', (req, res) =>{
    res.render('403')
})



module.exports = router;