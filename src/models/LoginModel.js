const db = require('../../server');
const validator = require('validator');

/* 
!!! MODEL Login referencia-se ao USUÁRIO (do sistema) o qual também é um FUNCIONÁRIO (da loja), dado o contexto
o controlador pode chama-lo como Funcionário ou Usuário
*/
function Login (body){
    //Body - Corpo da requisisão, receberá um objeto com os parametros
    //Possíveis parametros: email, nome, password
    this.body = body;
    this.erros = [];
    this.user = null;

    //Valida os atributos da requisisão
    this.valida = function(){
        if(!validator.isEmail(this.body.email)) this.erros.push('E-mail Inválido');
        if(this.body.password){
            if(this.body.password.length <= 3 || this.body.password.length > 50 ){
                this.erros.push('Senha deve ter mais de 3 carácteres e menos de 50');
            }  
        }
        
        if(this.body.nome){
            if(this.body.nome.length <=4) this.erros.push('Nome precisa ter mais de 4 Carácteres');
            if(this.body.nome.indexOf(' ') === -1) this.erros.push('Digite o Nome Completo');
            this.body.nome = toUpCamelCase(this.body.nome);
        }
    }
    //Formata principais campos
    this.cleanUp = function(){
        for(const key in this.body){
            if(typeof this.body[key] !== 'string'){
                this.body[key] ='';
            }
            this.body = {
                password: this.body.password,
                email: this.body.email
            }
        }
    }
}
//Realiza Login
Login.prototype.login = async function(){
    const cmd_serch = `SELECT * FROM usuario WHERE email = '${this.body.email}' AND senha = md5('${this.body.password}')`;
    this.cleanUp();
    this.valida();
    if(this.erros.length > 0) return
    //Vericfica se há um usuário em que os campos e-mail se senha coincidem com o da requisisão
    const [rows, fields] = await db.connection.query(cmd_serch);
    
    if(rows.length > 0) this.user = {... rows[0]};
    if(!this.user) {
        this.erros.push('Email ou Senha Inválidos');
        return;
    }
    return;
}
//Cria um novo usuário
Login.prototype.create = async function(){
    this.valida();
    if(await this.emailExists()) this.erros.push('E-mail já está sendo utilizado por outro usuário');

    if(this.erros.length > 0) return
    const cmd_insert = `INSERT INTO usuario (NOME, EMAIL, CARGO, SENHA, ACESSO)
     VALUES ('${this.body.nome}', '${this.body.email}', '${this.body.cargo}', md5('${this.body.password}'), ${this.body.acesso})`;

    const result = await db.connection.query(cmd_insert); 

}

// Alterar dados do usuário
Login.prototype.alter = async function(){

    //Validações
    this.valida();
    //Caso usuário a alterar seja o logado
    if(this.user){
        if(this.user.email !== this.body.email && await this.emailExists()) {
            return  this.erros.push('Email já está sendo utilizado por outra conta.')
        }
    }
    //Caso o usuário a editar seja outro, que não o logado
    else{
        this.user = {id_usuario:this.body.id}
        const tempId =  await this.getIDByEmail()
        if(this.body.id != tempId && await this.emailExists()){
            return this.erros.push('Email já está sendo utilizado em outra conta.')
        } 
    }
    

    //QUERY sem alterar a senha
    let cmd_put= `UPDATE usuario SET acesso = ${this.body.acesso}, nome = '${this.body.nome}', email='${this.body.email}',
     cargo='${this.body.cargo}'  WHERE id_usuario = ${this.user.id_usuario}`;
    //Query alterando a senha
     if(this.body.password){
        cmd_put = `UPDATE usuario SET acesso = ${this.body.acesso}, nome = '${this.body.nome}', email='${this.body.email}',
        cargo='${this.body.cargo}', senha = MD5('${this.body.password}')  WHERE id_usuario = ${this.user.id_usuario}`;
    }
        
    //Caso qualquer erro de validação retornar   
    if(this.erros.length > 0) return
    try{
        const result = await db.connection.query(cmd_put);
    }
    catch(ex){ console.log(ex.message);}
    //Retirar Senha do body para não aparacer no usuario de sessao
    if(!this.body.passoword) delete this.body.passowrd;
    Object.assign(this.user, this.body);
}
// Query para popular gráfico em Dashbord, retorna vendedores e valores de suas vendas no mês referente 
Login.prototype.comparativeVendedores = async function(){
    const result = {vendedores: [], vendas: []}; 
    const now = new Date().toISOString();
    const cmd_vendas = `SELECT u.nome as vendedor, SUM(v.valor) as venda
    FROM venda as v
    INNER JOIN usuario as u
    ON v.id_vendedor = u.id_usuario
    WHERE DATE_FORMAT(v.data, '%m/%Y') = DATE_FORMAT(?, '%m/%Y')
    GROUP BY v.id_vendedor;`

    try{
        const [rows] = await db.connection.query(cmd_vendas, [now]);
        const temp = JSON.parse(JSON.stringify(rows));
        temp.forEach( item =>{
            result.vendedores.push(item.vendedor)
            result.vendas.push(item.venda);
        });
        return result;
    }catch(ex){
        console.log('Erro na consulta dos dados comparativos', ex.message);
    }
}
//Busca usuário por id
Login.prototype.getByID = async function(){
    const cmd_select = `SELECT id_usuario, nome, cargo, email FROM usuario WHERE id_usuario = ?`
    try{
        const [rows] = await db.connection.query(cmd_select, this.body.id);
        this.body = {... rows[0]};
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}
//Busca todos usuários
Login.prototype.allUser = async function(){
    const cmd_all = `SELECT u.id_usuario, u.nome, u.cargo, u.email, SUM(v.valor) as totalVenda
    FROM usuario AS u
    LEFT JOIN venda AS v ON u.id_usuario = v.id_vendedor
    group by u.id_usuario
    ORDER BY u.nome;`

    try{
        const [rows, fields] = await db.connection.query(cmd_all);
        return rows;        
    }catch(ex){
        console.log(ex.message);
    }
}
//Busca todos usuários ordenado por venda mais recente
Login.prototype.allUserByRecent = async function(){
    const cmd_all = `SELECT u.id_usuario, u.nome, u.cargo, u.email, SUM(v.valor) as totalVenda
    FROM usuario AS u
    LEFT JOIN venda AS v ON u.id_usuario = v.id_vendedor
    group by u.id_usuario
    ORDER BY v.data DESC;`

    try{
        const [rows, fields] = await db.connection.query(cmd_all);
        return rows;        
    }catch(ex){
        console.log(ex.message);
    }
}
//Busca todos usuários ordenado por compras
Login.prototype.allUserBySold= async function(){
    const cmd_all = `SELECT u.id_usuario, u.nome, u.cargo, u.email, SUM(v.valor) as totalVenda
    FROM usuario AS u
    LEFT JOIN venda AS v ON u.id_usuario = v.id_vendedor
    group by u.id_usuario
    ORDER BY totalVenda;`

    try{
        const [rows, fields] = await db.connection.query(cmd_all);
        return rows;        
    }catch(ex){
        console.log(ex.message);
    }
}

Login.prototype.allUserBySoldDesc= async function(){
    const cmd_all = `SELECT u.id_usuario, u.nome, u.cargo, u.email, SUM(v.valor) as totalVenda
    FROM usuario AS u
    LEFT JOIN venda AS v ON u.id_usuario = v.id_vendedor
    group by u.id_usuario
    ORDER BY totalVenda DESC;`

    try{
        const [rows, fields] = await db.connection.query(cmd_all);
        return rows;        
    }catch(ex){
        console.log(ex.message);
    }
}
//Busca todos os cargos criados
Login.prototype.cargos = async function(){
    const [rows, fields] = await db.connection.query('SELECT DISTINCT cargo FROM usuario')
    const cargos = [];
    rows.forEach(element => {
        cargos.push(element.cargo);
    });
    if(!this.user) this.user = {};
    this.user.cargos = cargos;
    return;
}
//Verifica se o e-mail já exites
Login.prototype.emailExists = async function(){
    
    const cmd_exists = `SELECT email FROM usuario WHERE email = '${this.body.email}'`;
    const [rows] = await db.connection.query(cmd_exists);
    if(rows.length > 0) return true;
    return false;
}
//Retorna id do usuário por email
Login.prototype.getIDByEmail = async function(){
    const cmd_exists = `SELECT id_usuario FROM usuario WHERE email = '${this.body.email}'`;
    const [rows] = await db.connection.query(cmd_exists);
    if(rows.length > 0) return rows[0].id_usuario
    return false;
}

function toUpCamelCase(str){
    let res = "";
    const vetStr = str.split(' ');
    vetStr.forEach(word => {
        res += word[0].toUpperCase() + word.slice(1) + " ";
    });
    return res.slice(0, -1);;
}

module.exports = Login;
