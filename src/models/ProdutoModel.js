const db = require('../../server');

function Produto(body){
    this.body = body;
    this.erros = [];
    // id | qtd
    this.produtoAmount = [];

    
    this.valida = function(){
        if(!(this.body.nome && this.body.tipo && this.body.plataforma && this.body.descricao && this.body.preco && this.body.qtd)){
            this.erros.push('Por favor preencher todos os parametros');
        }
        this.body.preco = this.body.preco.replace(',','.');
        this.cleanUp();

        if(isNaN(this.body.preco)) this.erros.push('Preço inválido');
        if(isNaN(this.body.qtd)) this.erros.push('Quantidade inválido');     
        
    }
    this.cleanUp = function(){
        this.body.nome = toUpCamelCase(this.body.nome);
        this.body.preco = currencyModel(this.body.preco);
        this.body.qtd = Number.parseInt(this.body.qtd);
    }
}

Produto.prototype.setId = function(id){
    if(!this.body) this.body = {};
    this.body.id = Number.parseInt(id);
}

Produto.prototype.getByFieldValue = async function(field, value){
    const cmd_search = `SELECT * FROM produto WHERE ${field} LIKE('%${value}%')`;
    try{
        const [rows] = await db.connection.query(cmd_search);
        console.log('DATA:', rows);
        return rows;
    }catch(ex){
        console.log('Campo desconhecido', ex.message);
    }
}

Produto.prototype.getProdutoByPrice = async function(inicial, final){
    const cmd_search = `SELECT * FROM produto WHERE preco >= ? AND preco <= ? `;
    try{
        const [rows] = await db.connection.query(cmd_search, [inicial, final]);
        console.log('DATA:', rows);
        return rows;
    }catch(ex){
        console.log('Erro na consulta de produtos por preço', ex.message);
    }
}

Produto.prototype.getPlataforma = async function(){
    const [rows, fields] = await db.connection.query('SELECT DISTINCT plataforma FROM produto')
    const plataformas = [];
    rows.forEach(element => {
        plataformas.push(element.plataforma);
    });
    return plataformas;
}

Produto.prototype.getTipo = async function(){
    const [rows] = await db.connection.query('SELECT DISTINCT tipo FROM produto')
    const tipos = [];
    rows.forEach(element => {
        tipos.push(element.tipo);
    });
    return tipos;
}

Produto.prototype.getProdutos = async function(){
    const cmd_select = `SELECT * FROM produto`;
    try{
        const [rows] = await db.connection.query(cmd_select);
        return rows;
    }catch(ex){
        console.log('Ocorreu um erro na consulta de Produtos',ex.message);
    }
}

Produto.prototype.getByID = async function(id){
    const cmd_select = 'SELECT * FROM produto WHERE id_produto = ?';
    const [rows, fields] = await db.connection.query(cmd_select, [id]);
    if(rows.length === 0) return this.erros.push('Nenhum produto encontrado com essas especificações');
    return [rows[0]];
}

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
    this.produtoAmount.forEach( p =>{
        if(p.id_produto == id && p.estoque < qtd) return false;
    })
    return true;
}

Produto.prototype.subtractItens = async function(itens){
    /*
        itens é um vetor de objeto, cada item deve ter ao menos 2 propriedades: id e qtd
        id: representa id do produto
        qtdItem: quantidade a ser subtraido
    */
    await this.getAllAmount();
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

Produto.prototype.subtractQtd = async function(qtd){
    if(!this.checkAmount(this.body.id, qtd)) return this.erros.push('Produto está fora de estoque, por favor atualize a página');

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

Produto.prototype.create = async function(){
    this.valida();
    if(await this.produtoExists()) this.erros.push('Produto já está cadastrado no banco de dados');
    if(this.erros.length > 0) return
    //ToDo produto já existe?

    const cmd_insert = `INSERT INTO produto (NOME, TIPO, PLATAFORMA, ESTOQUE, PRECO, DESCRICAO) VALUES (?, ?, ?, ?, ?, ?)`
    try{
        const result = await db.connection.query(cmd_insert,
            [this.body.nome,this.body.tipo,this.body.plataforma,
                this.body.qtd,this.body.preco,this.body.descricao]);
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

Produto.prototype.produtoExists = async function(){
    const cmd_select = `SELECT id_produto FROM produto WHERE nome = ? AND plataforma = ?`;

    const [rows] = await db.connection.query(cmd_select, [this.body.nome, this.body.plataforma]);
    if(rows.length > 0) return true;
    return false;
}


function toUpCamelCase(str){
    let res = "";
    const vetStr = str.split(' ');
    vetStr.forEach(word => {
        res += word[0].toUpperCase() + word.slice(1) + " ";
    });
    return res.slice(0, -1);
}
function currencyModel(value){
    const currency = Number.parseFloat(value).toFixed(2);
    return currency;
}

module.exports = Produto;