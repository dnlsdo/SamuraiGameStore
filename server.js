const express = require('express');
const app = express();
const routes = require('./routes');
const db = require('./src/db/connection');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const { middlewareGlobal } = require('./src/middlewares/middlewares');
const {notfoundError} = require('./src/middlewares/middlewares');
let connection = 0;
const port = process.env.PORT || 3000;

//Server - Inicio de qualquer request ao cliente

//Conecta com o banco antes de executar, emite o sinal 'go' para servidor abrir conexão
db.connect.then((conn)=>{
	connection = conn;
	app.emit('go')
}).catch((err)=>{
	console.log('Ocorreu um grave erro de conexão', err);
});

//Inicialização de sessões, ativar leitura de pacotes codificados e limitar recebimento de pacotes json grandes
app.use(session({
	secret:'golden sonic',
	saveUninitialized: true,
	resave: true
}));
app.use(flash());
app.use(express.urlencoded( { extended: true} ));
app.use(express.json({limit:'1mb'}));

//Configurando: Pasta estática, pasta de Views e engine de renderização (EJS)
app.use(express.static('front-end'));
app.set('views', path.resolve(__dirname, 'src','views'));
app.set('view engine', 'ejs');

//Rotas de toda request: MiddlewareGlobal > Rotas > erro 404
app.use(middlewareGlobal);
app.use(routes);
app.use(notfoundError);

//Abrir conexão e exportar confinguração de conexão com o banco
app.on('go', ()=>{
	app.listen(port, ()=>{
		module.exports.connection = connection;
		console.log(`Rodando  na porta ${port}`)
	});
});
