const db = require('../../server');
const validator = require('validator');

function Cliente (body){
    //Body - Corpo da requisisão, receberá um objeto com os parametros
    //Possíveis parametros: cpf, email, nome, data_nasc
    this.body = body;
    //Responsável por acumular os erros de validação e de buscas
    this.erros = [];

    //Responsável por validar campos existentes em body
    this.valida = function(){
        this.cleanUp();
        if(!this.body.cpf) return this.erros.push('Necessário informar CPF/CNPJ');

        if(this.body.email){
            if(!validator.isEmail(this.body.email)) this.erros.push('E-mail Inválido');
            this.body.email = this.body.email.toLowerCase();
        }
        if(this.body.nome){
            if(this.body.nome.length <=4) this.erros.push('Nome precisa ter mais de 4 Carácteres');
            if(this.body.nome.indexOf(' ') === -1) this.erros.push('Digite o Nome Completo');
        }
        if(this.body.cpf.length === 11){ 
            if(!this.validaCpf(this.body.cpf)) this.erros.push('CPF inválido');
        }else if(this.body.cpf.length === 14){
            if(!this.validaCNPJ(this.body.cpf)) this.erros.push('CNPJ inválido')
        }else{
            this.erros.push('Insira um CPF/CNPJ válidos');
        }
    }
    //Responsável por formatar os dados
    this.cleanUp = function(){
        if(!this.body.nome){
            this.body.nome = null;
        }else{
            this.body.nome = toUpCamelCase(this.body.nome);
        }
        if(!this.body.nascimento){
             this.body.nascimento = null;
        }else{
            this.body.nascimento = new Date(this.body.nascimento);
        }
        if(!this.body.email) this.body.email = null;
        
        
    }
}
// Cria o cliente
Cliente.prototype.create = async function(){
    this.valida();
    //Verifica se há cpf informado no body
    if(this.erros.length > 0) return 
     //Checa se CPF/CNPJ já existe no banco
    if(await this.cpfExists()) this.erros.push('CPF/CNPJ já estão cadastrados');
    if(this.erros.length > 0) return 
    

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

//Register vale para Venda onde o cliente não existe então cria e retorna seu ID

Cliente.prototype.register = async function(){
    this.valida();
    if(this.erros.length >0) return
    if(!await this.cpfExists()){
        await this.create();
        console.log('Cliente Criado');
    }
    const id = await this.getId(this.body.cpf);
    console.log('ID DO CLIENTE: ', id.id_cliente)
    return id.id_cliente;
}
//Altera cliente
Cliente.prototype.alter = async function (){
    const cmd_alter = `UPDATE cliente SET nome = ?, email = ?, data_nasc = ? WHERE id_cliente = ?`
    this.valida();
    if(this.erros.length > 0) return
    try{
        const result = await db.connection.query(cmd_alter, [this.body.nome, this.body.email, this.body.nascimento, this.body.id]);
        if(result[0].affectedRows === 1) return
        this.erros.push = 'Ocorreu um erro, cliente não foi atualizado';
    }catch(ex){
        console.log('Erro na atualização do Cliente');
    }
}
//Busca o id do cliente pelo cpf
Cliente.prototype.getId = async function(cpf){
    const cmd_select = `SELECT id_cliente FROM cliente where cpf = ?`
    const [rows] = await db.connection.query(cmd_select, [cpf]);
    return rows[0];
}
//Busca cliente por id
Cliente.prototype.getClienteByID = async function(){
    const cmd_select = `SELECT id_cliente, cpf, nome, email, data_nasc FROM cliente WHERE id_cliente = ?`
    try{
        const [rows] = await db.connection.query(cmd_select, this.body.id);
        this.body = {... rows[0]};
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}
//Retorna todos os clientes
Cliente.prototype.allClientes = async function(){
    // IS NULL para deixar os nulls por ultimo
    const cmd_all = `SELECT c.id_cliente, c.cpf, c.nome, c.email, c.data_nasc, sum(v.valor) AS totalCompra
    FROM cliente c
    LEFT JOIN venda v ON v.id_cliente = c.id_cliente
    group by c.id_cliente
    ORDER BY nome IS NULL, nome;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}
//Retorna todos cliente por ordem decrescente de venda
Cliente.prototype.allClientesBySoldDesc = async function(){
    const cmd_all = `SELECT c.id_cliente, c.cpf, c.nome, c.email, c.data_nasc, sum(v.valor) AS totalCompra
    FROM cliente c
    LEFT JOIN venda v ON v.id_cliente = c.id_cliente
    group by c.id_cliente
    ORDER BY totalCompra DESC;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}
//Retorna todos cliente por ordem de venda
Cliente.prototype.allClientesBySold = async function(){
    const cmd_all = `SELECT c.id_cliente, c.cpf, c.nome, c.email, c.data_nasc, sum(v.valor) AS totalCompra
    FROM cliente c
    LEFT JOIN venda v ON v.id_cliente = c.id_cliente
    group by c.id_cliente
    ORDER BY totalCompra;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}
//Retorna todos cliente por ordem do mais recente a faser alguma compra
Cliente.prototype.allClientesByRecent = async function(){
    // IS NULL para deixar os nulls por ultimo
    const cmd_all = `SELECT c.id_cliente, c.cpf, c.nome, c.email, c.data_nasc, sum(v.valor) AS totalCompra
    FROM cliente c
    LEFT JOIN venda v ON v.id_cliente = c.id_cliente
    group by c.id_cliente
    ORDER BY v.data DESC;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}
//Verifica se o CPF já existe no banco
Cliente.prototype.cpfExists = async function(){
    const cmd_exists = `SELECT cpf FROM cliente WHERE cpf = '${this.body.cpf}'`;
    const [rows] = await db.connection.query(cmd_exists);
    if(rows.length > 0) return true;
    return false;
}

//Calcula CPF
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
//Valida CPf
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
//Valida CNPJ
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
//Formata textos para que toda primeira letra seja maiuscula
function toUpCamelCase(str){
    let res = "";
    const vetStr = str.toLowerCase().split(' ');
    vetStr.forEach(word => {
        res += word[0].toUpperCase() + word.slice(1) + " ";
    });
    return res.slice(0, -1);
}

module.exports = Cliente;