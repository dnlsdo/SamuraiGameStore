const db = require('../../server');
const validator = require('validator');

function Login (body){
    this.body = body;
    this.erros = [];
    this.user = null;
    this.valida = function(){
        if(!validator.isEmail(this.body.email)) this.erros.push('E-mail Inválido');
        if(this.body.password.length <= 3 || this.body.password.length > 50 ) this.erros.push('Senha deve ter mais de 3 carácteres e menos de 50');
        if(this.body.nome){
            if(this.body.nome.length <=4) this.erros.push('Nome precisa ter mais de 4 Carácteres');
            if(this.body.nome.indexOf(' ') === -1) this.erros.push('Digite o Nome Completo');
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
    console.log('Tamanho da Rows = ', rows.length,"Resultado da rows → " ,rows)
    if(rows.length > 0) return true;
    return false;
}


Login.prototype.create = async function(){
    this.valida();
    if(await this.emailExists()) this.erros.push('E-mail já está sendo utilizado por outro usuário');

    if(this.erros.length > 0) return
    console.log(this.body);
    
    const cmd_insert = `INSERT INTO usuario (NOME, EMAIL, CARGO, SENHA, ACESSO)
     VALUES ('${this.body.nome}', '${this.body.email}', '${this.body.cargo}', MD5('${this.body.password}'), ${this.body.acesso})`;

    const result = await db.connection.query(cmd_insert); 
    console.log('→',result.affectedRows);
}

Login.prototype.alter = async function(){

    if(!validator.isEmail(this.body.email)) this.erros.push('E-mail Inválido');
    if(this.body.senha && (this.body.senha.length <= 3 || this.body.senha.length > 50)){
        this.erros.push('Senha deve ter mais de 3 carácteres e menos de 50');
    }
    //QUERY MD5 PARA SENHA
    let cmd_put= `UPDATE usuario SET nome = '${this.body.nome}', email='${this.body.email}',
     cargo='${this.body.cargo}'  WHERE id_usuario = ${this.user.id_usuario}`;
    if(this.body.senha){
        cmd_put = `UPDATE usuario SET nome = '${this.body.nome}', email='${this.body.email}',
        cargo='${this.body.cargo}', senha = MD5('${this.body.senha}')  WHERE id_usuario = ${this.user.id_usuario}`;
    }
    

    if(this.user.email !== this.body.email && await this.emailExists()) {
       return  this.erros.push('Email já está sendo utilizado por outra conta.')
    }
       
    if(this.body.erros > 0) return

    const result = await db.connection.query(cmd_put);
    console.log(result);
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


module.exports = Login;
