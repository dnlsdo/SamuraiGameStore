const express = require('express');
const app = express();
const routes = require('./routes');
const db = require('./src/db/connection');
const session = require('express-session');
const flash = require('connect-flash');
let connection = 0;

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

//Setando configurações de Views
app.use(express.static('front-end'));
app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(routes);

app.on('go', ()=>{
	app.listen(3000, ()=>{
		module.exports.connection = connection;
		console.log('Rodando em http://localhost:3000/')
	});
});
