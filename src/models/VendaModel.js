const db = require('../../server');
const Produto = require('./ProdutoModel');

function Venda(itens, idCliente, idVendedor){
    this.id = undefined;
    this.itens = itens;
    this.cliente = {id_cliente:idCliente};
    this.vendedor = {id_usuario:idVendedor};
    this.date = new Date();
    this.erros = [];

    this.valida = function(){
        if(this.itens.length === 0) return this.erros.push('Necessário Adicionar ao menos um produto');
    }
}
Venda.prototype.create = async function(){
    console.log('Venda-Itens:', this.itens);
    this.valida();
    if(this.erros.length > 0) return 

    try{
        const vendaId = await this.newId();
        const date = dateModel(this.date);
        const produto = new Produto();

        //Subtrai a quantidade vendida de cada item da tabela produto
        await produto.subtractItens(this.itens);
        if(produto.erros.length > 0) return this.erros.push(produto.erros[0]);
    
        //Cria INSERT de multiplas linhas com os itens
        let cmd_insert_multiple = 'INSERT INTO venda (id_venda, id_vendedor, id_cliente, id_produto, `data`, quantidade, desconto, valor) VALUES';
        this.itens.forEach( item => {
            const valorTotal = Number.parseFloat(item.preco * item.qtdItem).toFixed(2);
            cmd_insert_multiple += `(${vendaId}, ${this.vendedor.id_usuario}, ${this.cliente.id_cliente}, ${item.id}, '${date}', ${item.qtdItem}, ${item.desconto}, ${valorTotal} ),`
        });
        cmd_insert_multiple = cmd_insert_multiple.slice(0, -1);
        console.log(cmd_insert_multiple);

        const result = await db.connection.query(cmd_insert_multiple);
        if(result[0].affectedRows !== 0){
            console.log('Venda realizada com sucesso!');
        }else{
            this.erros.push('Estamos com instabilidade, a venda não foi realizada');
            return
        }

    }catch(ex){
        console.log('Erro Critico no banco de Dados: ', ex.message);
    }

    
}

Venda.prototype.allVendas = async function(){
    const cmd_all = `SELECT v.id_venda, u.nome as vendedor, c.nome as cliente, v.data, SUM(v.quantidade) as quantidade, SUM(v.valor) as valorTotal
    FROM venda as v
    INNER JOIN usuario as u ON  u.id_usuario = v.id_vendedor
    INNER JOIN cliente as c ON c.id_cliente = v.id_cliente
    GROUP BY v.id_venda
    ORDER BY u.nome;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}

Venda.prototype.allVendasByRecent = async function(){
    const cmd_all = `SELECT v.id_venda, u.nome as vendedor, c.nome as cliente, v.data, SUM(v.quantidade) as quantidade, SUM(v.valor) as valorTotal
    FROM venda as v
    INNER JOIN usuario as u ON  u.id_usuario = v.id_vendedor
    INNER JOIN cliente as c ON c.id_cliente = v.id_cliente
    GROUP BY v.id_venda
    ORDER BY v.data DESC;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}

Venda.prototype.allVendasByValue = async function(){
    const cmd_all = `SELECT v.id_venda, u.nome as vendedor, c.nome as cliente, v.data, SUM(v.quantidade) as quantidade, SUM(v.valor) as valorTotal
    FROM venda as v
    INNER JOIN usuario as u ON  u.id_usuario = v.id_vendedor
    INNER JOIN cliente as c ON c.id_cliente = v.id_cliente
    GROUP BY v.id_venda
    ORDER BY valorTotal;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}

Venda.prototype.allVendasByValueDesc = async function(){
    const cmd_all = `SELECT v.id_venda, u.nome as vendedor, c.nome as cliente, v.data, SUM(v.quantidade) as quantidade, SUM(v.valor) as valorTotal
    FROM venda as v
    INNER JOIN usuario as u ON  u.id_usuario = v.id_vendedor
    INNER JOIN cliente as c ON c.id_cliente = v.id_cliente
    GROUP BY v.id_venda
    ORDER BY valorTotal DESC;`;
    try{
        const [rows] = await db.connection.query(cmd_all);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco',ex.message);
    }
}

Venda.prototype.newId = async function(){
    //TODO gerar um novo id, com base no valor máximo já existente
    const cmd_new_id = `SELECT MAX(id_venda)+1 as id FROM venda`;
    const [rows] = await db.connection.query(cmd_new_id);
    return rows[0].id;
}

function dateModel(date){
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

module.exports = Venda;