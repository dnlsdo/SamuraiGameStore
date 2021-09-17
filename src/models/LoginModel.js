const db = require('../../server');

function Login (body){
    this.body = body;
    this.erros = [];
    this.user = null;

    
}

Login.prototype.allUser = async function(){
    
    const [rows, fields] = await db.connection.query('Select * from usuario');
    return rows;
}

Login.prototype.login = async function(){
    const cmd_serch = `SELECT * FROM usuario WHERE email = '${this.body.email}' AND md5=('${this.body.password}')`;

    this.valida();
    if(this.erros.length > 0) return
    
    await db.connection.query(cmd_serch, (err, result)=>{
        if(err){
            console.log(err);
            throw new TypeError('Erro ao conectar-se ao Banco de dados'); 
        }
        if(!user) {
            this.erros.push('Email ou Senha Inválidos');
            return;
        }
        const [rows, fields] = result;
        console.log(rows);
        user = rows[1];        
    })

}

Login.valida = function(){
    this.cleanUp();
    if(!validator.isEmail(this.body.email)) this.erros.push('E-mail Inválido');
    if(this.body.password.length < 3 || this.body.password.length > 50 ) this.erros.push('Senha deve ter mais de 3 carácteres e menos de 50');
}

Login.cleanUp = function(){
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

module.exports = Login;
