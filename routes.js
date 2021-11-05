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
const dashBordController = require('./src/controllers/dashbordController');

router.get('/', homeController.index);
//Login
router.get('/login', loginController.index);
router.post('/login/login', loginController.login);
//Tela User
router.get('/user', middleware.loginRequired, userController.index);
router.post('/user/alter', middleware.loginRequired, loginController.alter);
//Cadastros
router.get('/cadastro/funcionario', middleware.adminRequired, cadastroController.funcionario);
router.post('/cadastro/funcionario', middleware.adminRequired, loginController.create);
router.get('/cadastro/cliente',  middleware.loginRequired, cadastroController.cliente);
router.post('/cadastro/cliente', middleware.loginRequired, cadastroController.createCliente);
router.get('/cadastro/produto', middleware.adminRequired, cadastroController.produto);
router.post('/cadastro/produto', middleware.adminRequired, cadastroController.createProduto);
//Vendas
router.get('/vendas', middleware.loginRequired, vendaController.index);
router.post('/vendas', middleware.loginRequired, vendaController.create);

router.get('/search/:produto', middleware.loginRequired, vendaController.serch); 
//Relatórios
router.get('/relatorio/cliente', middleware.adminRequired, relatorioController.showClientes);
router.get('/relatorio/cliente/:order', middleware.adminRequired, relatorioController.orderClientes);
router.get('/relatorio/funcionario', middleware.adminRequired, relatorioController.showFuncionario);
router.get('/relatorio/funcionario/:order', middleware.adminRequired, relatorioController.orderFuncionario);
router.get('/relatorio/venda', middleware.adminRequired, relatorioController.showVenda);
router.get('/relatorio/venda/:order', middleware.adminRequired, relatorioController.orderVenda);
//EDIÇÃO
router.get('/editar/cliente/:id', middleware.adminRequired, editarController.editClienteIndex);
router.post('/editar/cliente/:id', middleware.adminRequired, editarController.editCliente);
router.get('/editar/funcionario/:id', middleware.adminRequired, editarController.editFuncionarioIndex);
router.post('/editar/funcionario/:id', middleware.adminRequired, editarController.editFuncionario);
router.get('/editar/produto/:id', middleware.adminRequired, editarController.editProdutoIndex);
router.post('/editar/produto/:id', middleware.adminRequired, editarController.editProduto);
//Detelhe Venda
router.get('/detalhe-venda/:id', middleware.loginRequired, detailController.index);
//Produtos
router.get('/produtos', middleware.loginRequired, produtosController.index);
router.post('/produtoSearch', middleware.loginRequired, produtosController.search);
router.post('/produtoPriceSearch', middleware.loginRequired, produtosController.searchPrices);
//DashBord
router.get('/dashbord/venda', middleware.adminRequired, dashBordController.venda);
router.get('/dashbord/funcionario', middleware.adminRequired, dashBordController.funcionario);
router.get('/dashbord/categoria', middleware.adminRequired, dashBordController.categoria);

router.get('/403', (req, res) =>{
    res.render('403')
})



module.exports = router;