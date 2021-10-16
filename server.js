const express = require('express');
const app = express();
const routes = require('./routes');
const db = require('./src/db/connection');
const session = require('express-session');
const flash = require('connect-flash');
const { middlewareGlobal } = require('./src/middlewares/middlewares');
const {notfoundError} = require('./src/middlewares/middlewares');
let connection = 0;
const port = process.env.PORT || 3000;
//Servidor -> Rotas(/algumaCoisa) → Controlador(render) → Models(Classes e dados do banco)

//Conecta com o banco antes de executar
db.connect.then((conn)=>{
	connection = conn;
	app.emit('go')
}).catch((err)=>{
	console.log('Ocorreu um grave erro de conexão', err);
});

//Inicialização de sessões, ativar leitura de pacotes codificados
app.use(session({
	secret:'golden sonic',
	saveUninitialized: true,
	resave: true
}));
app.use(flash());
app.use(express.urlencoded( { extended: true} ));
app.use(express.json({limit:'1mb'}));

//Setando configurações de Views
app.use(express.static('front-end'));
app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(middlewareGlobal);
app.use(routes);
app.use(notfoundError);


app.on('go', ()=>{
	app.listen(port, ()=>{
		module.exports.connection = connection;
		console.log(`Rodando  na porta ${port}`)
	});
});
