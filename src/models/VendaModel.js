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

Venda.prototype.generalDetails = async function(){
    const cmd_detail = `
    SELECT v.id_venda, v.data, Sum(v.quantidade) as quantidade, SUM(v.desconto) as desconto, SUM(v.valor) as total, u.id_usuario, u.nome as vendedor, c.cpf, c.nome as cliente
    FROM venda as v
    INNER JOIN usuario as u ON v.id_vendedor = u.id_usuario
    INNER JOIN cliente as c ON v.id_cliente = c.id_cliente
    WHERE v.id_venda = ?
    GROUP BY v.id_venda;`
    try{
        const [rows] = await db.connection.query(cmd_detail, [this.id]);
        return rows[0];
    }catch(ex){
        console.log('Erro na consulta do banco', ex.message);
    }
}

Venda.prototype.productsDetails = async function(){
    const cmd_details = `
    SELECT p.id_produto, p.nome, p.tipo, p.plataforma, v.quantidade, p.preco
    FROM venda as v
    INNER JOIN produto as p ON v.id_produto = p.id_produto
    WHERE v.id_venda = ?;`
    try{
        const [rows] = await db.connection.query(cmd_details, [this.id]);
        return rows;
    }catch(ex){
        console.log('Erro na consulta do banco', ex.message);
    }
}
// Get Informações como Quantidade de Clientes, Produto mais vendido e total vendido no mês
Venda.prototype.GeneralInfo = async function(){
    const now =  new Date().toISOString();
    const cmd_info1 =  "SELECT COUNT(DISTINCT id_cliente) as maxCliente, SUM(valor) as totalVendido FROM venda WHERE DATE_FORMAT(`data`, '%m/%Y') = DATE_FORMAT(?, '%m/%Y')";
    const cmd_info2 = "SELECT produto.nome as produto FROM venda  JOIN produto ON venda.id_produto = produto.id_produto  WHERE DATE_FORMAT(`data`, '%m/%Y') = DATE_FORMAT(?, '%m/%Y') GROUP BY venda.id_produto ORDER BY SUM(venda.quantidade) DESC LIMIT 1"
    let result = {};
    try{
        let [info1] = await db.connection.query(cmd_info1, [now]);
        let [info2] = await db.connection.query(cmd_info2, [now]);
        const temp1 = JSON.parse(JSON.stringify(info1[0]))
        const temp2 = JSON.parse(JSON.stringify(info2[0]));
        result = Object.assign(temp1, temp2);

    }catch(ex){
        console.log('ERRO NO BANCO - falha ao pegar informações gerais2', ex.message);
    }
    console.log('Result:',result);
    return result;
}

Venda.prototype.ComparativeYear = async function(){
    const now =  new Date().getFullYear();
    const cmd_year = "SELECT SUM(valor) as total FROM VENDA WHERE YEAR(venda.data) = ? group by MONTH(venda.data)";
    let result = {actual:[], past:[]};
    try{
        let [year1] = await db.connection.query(cmd_year, [now]);
        let [year2] = await db.connection.query(cmd_year, [now - 1]);
        const temp1 = JSON.parse(JSON.stringify(year1));
        const temp2 = JSON.parse(JSON.stringify(year2));
        temp1.forEach( item =>result.actual.push(item.total));
        temp2.forEach( item =>result.past.push(item.total));

    }catch(ex){
        console.log('ERRO NO BANCO - falha ao pegar dados do ano', ex.message);
    }
    console.log('YEAR:',result);
    return result;
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