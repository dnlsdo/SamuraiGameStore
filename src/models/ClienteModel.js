const db = require('../../server');
const validator = require('validator');

function Cliente (body){
    this.body = body;
    this.erros = [];

    this.valida = function(){
        this.cleanUp();
        if(this.body.email){
            if(!validator.isEmail(this.body.email)) this.erros.push('E-mail Inválido');
        }
        if(this.body.nome){
            if(this.body.nome.length <=4) this.erros.push('Nome precisa ter mais de 4 Carácteres');
            if(this.body.nome.indexOf(' ') === -1) this.erros.push('Digite o Nome Completo');
        }
        if(!this.body.cpf) return this.erros.push('Necessário informar CPF/CNPJ');
        if(this.body.cpf.length === 11){ 
            if(!this.validaCpf(this.body.cpf)) this.erros.push('CPF inválido');
        }else if(this.body.cpf.length === 14){
            if(!this.validaCNPJ(this.body.cpf)) this.erros.push('CNPJ inválido')
        }else{
            this.erros.push('Insira um CPF/CNPJ válidos');
        }
    }

    this.cleanUp = function(){
        if(!this.body.nome){
            this.body.nome = null;
        }else{
            this.body.nome = toUpCamelCase(this.body.nome);
        }
        if(!this.body.nascimento){
             this.body.nascimento = null;
        }else{
            this.body.nascimento = dateModel(this.body.nascimento);
        }
        if(!this.body.email) this.body.email = null;
        
        
    }
}
Cliente.prototype.create = async function(){
    this.valida();
    if(await this.cpfExists()) this.erros.push('CPF/CNPJ já estão cadastrados');
    if(this.erros.length > 0) return 
    //Checa se CPF/CNPJ já existe no banco
    

    //Criar query
    const cmd_insert = `INSERT INTO cliente (cpf, nome, email, data_nasc) VALUES (?, ?, ?, ?)`;

    try{
        const result = await db.connection.query(cmd_insert, [this.body.cpf, this.body.nome, this.body.email, this.body.nascimento]);
        if(result[0].affectedRows === 1){
            console.log('Cliente Adicionado com sucesso!');
        }else{
            this.erros.push('Estamos com instabilidade, o cliente não foi adicionado');
            return
        }
    }catch(ex){
        console.log("ERRO CRITICO NO BANCO:", ex.message);
    }    
}

Cliente.prototype.allClientes = async function(){
    const cmd_all = `SELECT * FROM cliente`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        console.log(rows);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}

Cliente.prototype.cpfExists = async function(){
    const cmd_exists = `SELECT cpf FROM cliente WHERE cpf = '${this.body.cpf}'`;
    const [rows] = await db.connection.query(cmd_exists);
    if(rows.length > 0) return true;
    return false;
}


Cliente.prototype.calculaCpf = function(values){
    let max = values.length +1;
    const calc = (x) => {
        const rest = 11-(x % 11);
        if( rest > 9) return 0
        return rest
    } 
  
    while (max < 12){
        let sum = 0;
        
        for(let i = max; i >= 2; i--){
            const index = (i - max)*-1;
            sum += values[index] * i;
        }
        if(max < 12)
        values += calc(sum);
        max = values.length +1;
    }
    return values.slice(-2);
}

Cliente.prototype.validaCpf = function(cpf){
    if(typeof cpf === 'number') return ;
    if(isNaN(cpf)) return false;
    if(cpf.length !== 11) return false;

    const digito = cpf.slice(-2)
    const values = cpf.slice(0, -2)
    const temp = this.calculaCpf(values);
    if(temp !== digito) return false;
    return true
}

Cliente.prototype.validaCNPJ = function(cnpj){
    cnpj = cnpj.replace(/[^\d]+/g,'');
 
    if(cnpj == '') return false;
     
    if (cnpj.length != 14)
        return false;
 
    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" || 
        cnpj == "11111111111111" || 
        cnpj == "22222222222222" || 
        cnpj == "33333333333333" || 
        cnpj == "44444444444444" || 
        cnpj == "55555555555555" || 
        cnpj == "66666666666666" || 
        cnpj == "77777777777777" || 
        cnpj == "88888888888888" || 
        cnpj == "99999999999999")
        return false;
         
    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0,tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
         
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
          return false;
           
    return true;
}


// Para garantir que data seja no modelo aaaa-mm-dd
function dateModel(date){
    let vet = [];

    if(date.indexOf('/') !== -1) vet = date.split('/');
    else vet = date.split('-');
    
    vet.reverse();
    return vet.join('-');
}



function toUpCamelCase(str){
    let res = "";
    const vetStr = str.split(' ');
    vetStr.forEach(word => {
        res += word[0].toUpperCase() + word.slice(1) + " ";
    });
    return res.slice(0, -1);
}

module.exports = Cliente;