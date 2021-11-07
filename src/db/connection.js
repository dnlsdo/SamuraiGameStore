const mysql = require("promise-mysql2");    
const dotenv = require('dotenv');
dotenv.config();
//Cria conexão com o Banco de dados através das váriaveis de ambiente
async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;

    const connection = await mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        insecureAuth: true
    });
    console.log('conectou ao MySql');
    global.connection = connection;
    return connection;
}
exports.connect = connect();



