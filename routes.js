const express = require('express');
const router = express.Router();
const middleware = require('./src/middlewares/middlewares')
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const userController = require('./src/controllers/userController');
const cadastroController = require('./src/controllers/cadastroContoller');
const relatorioController = require('./src/controllers/relatorioController');
const vendaController = require('./src/controllers/vendaController');

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
router.get('/vendas', vendaController.index);
//Relatórios
router.get('/relatorio/cliente', relatorioController.showClientes);

router.get('/404', (req, res)=>{
    res.render('404')
});
router.get('/403', (req, res) =>{
    res.render('403')
})



module.exports = router;