const db = require('../../server');

function Produto(body){
    //Body - Corpo da requisisão, receberá um objeto com os parametros
    //Parametros esperados: nome, tipo, plataforma, descricao, preco e estoque
    this.body = body;
    //Responsável por acumular os erros de validação e busca
    this.erros = [];
    // Lista de produtos id e sua quantidade (inportante para checar o processo de subtração)
    this.produtoAmount = [];

    //Realiza validações dos campos
    this.valida = function(){
        if(!(this.body.nome && this.body.tipo && this.body.plataforma && this.body.descricao && this.body.preco && this.body.estoque)){
            this.erros.push('Por favor preencher todos os parametros');
        }
        this.body.preco = this.body.preco.replace(',','.');
        this.cleanUp();

        if(isNaN(this.body.preco)) this.erros.push('Preço inválido');
        if(isNaN(this.body.estoque)) this.erros.push('Quantidade inválido');
        if(this.body.preco < 0 || this.body.estoque <0)  this.erros.push('Valores abaixo de 0, não são permitidos')   
        
    }
    //realiza formtação dos campos
    this.cleanUp = function(){
        this.body.nome = toUpCamelCase(this.body.nome);
        this.body.tipo = toUpCamelCase(this.body.tipo);
        this.body.plataforma = toUpCamelCase(this.body.plataforma);
        this.body.preco = currencyModel(this.body.preco);
        this.body.estoque = Number.parseInt(this.body.estoque);
    }
}
//Seta o campo id
Produto.prototype.setId = function(id){
    if(!this.body) this.body = {};
    this.body.id = Number.parseInt(id);
}
//Cria um produto
Produto.prototype.create = async function(){
    this.valida();
    //Verifica se produto já exite
    if(await this.produtoExists()) this.erros.push('Produto já está cadastrado no banco de dados');
    if(this.erros.length > 0) return

    const cmd_insert = `INSERT INTO produto (NOME, TIPO, PLATAFORMA, ESTOQUE, PRECO, DESCRICAO) VALUES (?, ?, ?, ?, ?, ?)`
    try{
        const result = await db.connection.query(cmd_insert,
            [this.body.nome,this.body.tipo,this.body.plataforma,
                this.body.estoque,this.body.preco,this.body.descricao]);
        if(result[0].affectedRows === 1){
                console.log('Produto Adicionado com sucesso!');
        }else{
                this.erros.push('Estamos com instabilidade, o cliente não foi adicionado');
                return
        }
    }catch(ex){
        console.log("ERRO CRITICO NO BANCO:", ex.message);
    }
}
// Edita produto
Produto.prototype.alter = async function(){
    this.valida();
    //TODO Produto alterado é igual a outro sem ser ele mesmo?
    if(this.erros.length > 0) return

    const cmd_insert = `UPDATE produto SET NOME = ?, TIPO = ?, PLATAFORMA = ?, ESTOQUE = ?, PRECO = ?, DESCRICAO =? WHERE id_produto = ?`
    try{
        const result = await db.connection.query(cmd_insert,
            [this.body.nome,this.body.tipo,this.body.plataforma,
                this.body.estoque,this.body.preco,this.body.descricao, this.body.id_produto]);
        if(result[0].affectedRows === 1){
                console.log('Produto alterado com sucesso!');
        }else{
                this.erros.push('Estamos com instabilidade, o produto não foi adicionado');
                return
        }
    }catch(ex){
        console.log("ERRO NO BANCO AO ALTERAR PRODUTO:", ex.message);
    }
}
//Busca dados de tipo de produto por seu valor, para popular gráfico
Produto.prototype.comparativeTipo = async function(){
    const result = {tipos: [], vendas: []}; 
    const now = new Date().toISOString();
    const cmd_tipo = `SELECT p.tipo as tipo, SUM(v.valor) as total 
    FROM venda as v
    INNER JOIN produto as p
    ON p.id_produto = v.id_produto
    WHERE DATE_FORMAT(v.data, '%m/%Y') = DATE_FORMAT(?, '%m/%Y')
    GROUP BY p.tipo; `

    try{
        const [rows] = await db.connection.query(cmd_tipo, [now]);
        //Formata resultado
        const temp = JSON.parse(JSON.stringify(rows));
        temp.forEach( item =>{
            result.tipos.push(item.tipo)
            result.vendas.push(item.total);
        });
        return result;
    }catch(ex){
        console.log('Erro na consulta dos dados comparativos', ex.message);
    }
}
//Busca produtos por campo selecionado pelo usuário
Produto.prototype.getByFieldValue = async function(field, value){
    const cmd_search = `SELECT * FROM produto WHERE ${field} LIKE('%${value}%')`;
    try{
        const [rows] = await db.connection.query(cmd_search);
        return rows;
    }catch(ex){
        console.log('Campo desconhecido', ex.message);
    }
}
//Busca produtos por faixa de preço
Produto.prototype.getProdutoByPrice = async function(inicial, final){
    const cmd_search = `SELECT * FROM produto WHERE preco >= ? AND preco <= ? `;
    try{
        const [rows] = await db.connection.query(cmd_search, [inicial, final]);
        return rows;
    }catch(ex){
        console.log('Erro na consulta de produtos por preço', ex.message);
    }
}
//Busca todas as plataformas (para filtro)
Produto.prototype.getPlataforma = async function(){
    const [rows, fields] = await db.connection.query('SELECT DISTINCT plataforma FROM produto')
    const plataformas = [];
    rows.forEach(element => {
        plataformas.push(element.plataforma);
    });
    return plataformas;
}
//Busca todos os tipos (para filtro)
Produto.prototype.getTipo = async function(){
    const [rows] = await db.connection.query('SELECT DISTINCT tipo FROM produto')
    const tipos = [];
    rows.forEach(element => {
        tipos.push(element.tipo);
    });
    return tipos;
}
//Busca todos os produtos
Produto.prototype.getProdutos = async function(){
    const cmd_select = `SELECT * FROM produto`;
    try{
        const [rows] = await db.connection.query(cmd_select);
        return rows;
    }catch(ex){
        console.log('Ocorreu um erro na consulta de Produtos',ex.message);
    }
}
//Busca produto pelo id informado
Produto.prototype.getByID = async function(id){
    const cmd_select = 'SELECT * FROM produto WHERE id_produto = ?';
    try{
        const [rows] = await db.connection.query(cmd_select, [id]);
        if(rows.length === 0) return this.erros.push('Nenhum produto encontrado com essas especificações');
        return [rows[0]];
    }catch(ex){
        console.log('Erro na cosulta de Produto por ID', ex.message);
    }
}
//Busca produto por nome
Produto.prototype.getByName = async function(name){
    if(name.length < 3) return this.erros.push('Insira ao menos 3 carácteres para a pesquisa');

    const cmd_select = `SELECT * FROM produto WHERE nome LIKE('%${name}%')`;
    const [rows, fields] = await db.connection.query(cmd_select);
    if(rows.length === 0) return this.erros.push('Nenhum produto encontrado com essas especificações');
    return rows;
}
//Busca todas as quantidades id|quantidade
Produto.prototype.getAllAmount = async function(){
    const cmd_select = 'SELECT id_produto, estoque FROM produto';
    const [rows] = await db.connection.query(cmd_select);
    this.produtoAmount = rows; 
}
// Verifica se a quantidade de produto é menor que a que se deseja extrair, false para maior que o estoque
Produto.prototype.checkAmount = function(id, qtd){
    for (let i = 0; i < this.produtoAmount.length; i++) {
        const p = this.produtoAmount[i];
        if(p.id_produto == id){
            if(p.estoque < qtd) return false;
            p.estoque -= qtd;
            return true;
        }
    }
}

Produto.prototype.subtractAll = async function(itens){
    /*
        itens é um vetor de objeto dos quais terão sua quantidade subtraida, 
        cada item deve ter ao menos 2 propriedades: id e qtdItem
        id: representa id do produto
        qtdItem: quantidade a ser subtraido
    */

   //Verificar se é seguro subrair itens sem ficar com estoque negativo
    await this.getAllAmount();
    itens.forEach( item =>{
        if(!this.checkAmount(item.id, item.qtdItem)) this.erros.push('Produto está fora de estoque, por favor atualize a página');
    })
    if(this.erros.length > 0) return;
    
    //Realizar a subtração dos itens
    try{
        itens.forEach(async (item) =>{
            this.setId(item.id);
            const result = await this.subtractQtd(item.qtdItem);
            if(!result) throw new TypeError(`Erro ao subtair do item: ${item.id} a quantidade: ${item.qtdItem}`)
        });
    }catch(ex){
        throw new TypeError(`Erro na subtração dos produtos > ${ex.message}`);
    }
}
//Executa a query de subtração de quantidade
Produto.prototype.subtractQtd = async function(qtd){
    try{
        const produt_id = this.body.id;
        const cmd_put = `UPDATE produto SET estoque = estoque - ? WHERE id_produto = ?`;
        const result = await db.connection.query(cmd_put, [qtd, produt_id]);
        if(result[0].affectedRows === 1){
            console.log(`Subtraido ${qtd} do Produto de ID ${produt_id}`);
            return true;
        }else{
            return false;
        }
    }catch(ex){
        TypeError(`> Subtração do Item ${this.body.id}`)
    }
}
//Verifca se produto já exite pelo seu nome e plataforma
Produto.prototype.produtoExists = async function(){
    const cmd_select = `SELECT id_produto FROM produto WHERE nome = ? AND plataforma = ?`;

    const [rows] = await db.connection.query(cmd_select, [this.body.nome, this.body.plataforma]);
    if(rows.length > 0) return true;
    return false;
}

//Formata as primeiras letras para maiusculo
function toUpCamelCase(str){
    let res = "";
    const vetStr = str.split(' ');
    vetStr.forEach(word => {
        res += word[0].toUpperCase() + word.slice(1) + " ";
    });
    return res.slice(0, -1);
}
//Formata floats para duas casas decimais
function currencyModel(value){
    const currency = Number.parseFloat(value).toFixed(2);
    return currency;
}

module.exports = Produto;