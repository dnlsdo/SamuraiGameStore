const db = require('../../server');
const validator = require('validator');

function Login (body){
    this.body = body;
    this.erros = [];
    this.user = null;
    this.valida = function(){
        this.cleanUp();
        if(!validator.isEmail(this.body.email)) this.erros.push('E-mail Inválido');
        if(this.body.password.length < 3 || this.body.password.length > 50 ) this.erros.push('Senha deve ter mais de 3 carácteres e menos de 50');
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

Login.prototype.login = async function(){
    const cmd_serch = `SELECT * FROM usuario WHERE email = '${this.body.email}' AND senha = md5('${this.body.password}')`;
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

Login.prototype.alter = async function(){
    const cmd_alter = ``
}

module.exports = Login;
