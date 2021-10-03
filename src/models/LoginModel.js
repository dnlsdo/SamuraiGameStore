const db = require('../../server');
const validator = require('validator');

function Login (body){
    this.body = body;
    this.erros = [];
    this.user = null;
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

Login.prototype.allUser = async function(){
    
    const [rows, fields] = await db.connection.query('Select * from usuario');
    return rows;
}

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

Login.prototype.emailExists = async function(){
    
    const cmd_exists = `SELECT email FROM usuario WHERE email = '${this.body.email}'`;
    const [rows] = await db.connection.query(cmd_exists);
    if(rows.length > 0) return true;
    return false;
}


Login.prototype.create = async function(){
    this.valida();
    if(await this.emailExists()) this.erros.push('E-mail já está sendo utilizado por outro usuário');

    if(this.erros.length > 0) return
    
    const cmd_insert = `INSERT INTO usuario (NOME, EMAIL, CARGO, SENHA, ACESSO)
     VALUES ('${this.body.nome}', '${this.body.email}', '${this.body.cargo}', MD5('${this.body.password}'), ${this.body.acesso})`;

    const result = await db.connection.query(cmd_insert); 

}

// Alterar dados do usuário

Login.prototype.alter = async function(){

    //Validações
    this.valida();
    if(this.user.email !== this.body.email && await this.emailExists()) {
        return  this.erros.push('Email já está sendo utilizado por outra conta.')
    }

    //QUERY MD5 PARA SENHA
    let cmd_put= `UPDATE usuario SET acesso = ${this.body.acesso}, nome = '${this.body.nome}', email='${this.body.email}',
     cargo='${this.body.cargo}'  WHERE id_usuario = ${this.user.id_usuario}`;
    if(this.body.password){
        cmd_put = `UPDATE usuario SET acesso = ${this.body.acesso}, nome = '${this.body.nome}', email='${this.body.email}',
        cargo='${this.body.cargo}', senha = MD5('${this.body.password}')  WHERE id_usuario = ${this.user.id_usuario}`;
    }
        
       
    if(this.erros.length > 0) return

    const result = await db.connection.query(cmd_put);
    //Retirar Senha do body para não aparacer no usuario de sessao
    if(!this.body.senha) delete this.body.senha;
    Object.assign(this.user, this.body);
}

Login.prototype.login = async function(){
    const cmd_serch = `SELECT * FROM usuario WHERE email = '${this.body.email}' AND senha = md5('${this.body.password}')`;
    this.cleanUp();
    this.valida();
    
    if(this.erros.length > 0) return
    
    const [rows, fields] = await db.connection.query(cmd_serch);
    
    if(rows.length > 0) this.user = {... rows[0]};

    if(!this.user) {
        this.erros.push('Email ou Senha Inválidos');
        return;
    }
    return;
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
