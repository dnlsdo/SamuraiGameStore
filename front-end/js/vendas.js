const tabela = document.querySelector('#selecionavel');
const linhas = tabela.querySelectorAll('tr');
const carrinho = document.querySelector('.produtosCarrinho')
let itens = [];

//Obejto Venda
function criaItemCarrinho(id, nome, plataforma, tipo, preco, qtdItem){
    return{
        id,
        nome,
        plataforma,
        tipo,
        preco,
        qtdItem,
        totalVenda(){
            let value = this.qtdItem * this.preco;
            value = value.toFixed(2)
            return value;
        }
    }
}

// Lista Selecionavel Caso chamado sem parametro irá deselecionar todos
function selectRow(row){
    linhas.forEach((e) => {
        e.classList.remove("selected");
    });
    if(row) row.classList.toggle('selected');
}
//Cria objeto venda apartir da linha Selecionada
function loadVenda(){
    let qtd = document.querySelector('#input-qtd').value;
    let [id, nome, plataforma, tipo, preco, estq]= sliceSelect();
    console.log(estq, qtd, estq < qtd);
    qtd = Number.parseInt(qtd);
    estq = Number.parseInt(estq);
    id = Number.parseInt(id);
    preco = Number.parseFloat(currencyFormat(preco));

    if(estq < qtd) throw new TypeError('Quantidade acima do disponível em estoque');
    subtractEstoque(qtd);

    const item = criaItemCarrinho(id,nome,plataforma,tipo,preco,qtd);
    itens.push(item);
    console.log(itens);
    reloadCarrinho();
}
// captura as informações da linha selecionada
function sliceSelect(){
    const result = [];
    let tr = getSelectedRow();
    if(typeof tr === 'undefined') throw new TypeError('É preciso selecionar um produto');
    const cols  = tr.querySelectorAll('td');
    cols.forEach( value =>{
        result.push(value.textContent);
    });
    return result;
}
//Retorna a linha selecionada
function getSelectedRow(){
    let tr;
    linhas.forEach( linha=>{
        if(linha.classList.contains('selected')) tr = linha;
    });
    return tr;
}
//Atauliza carrinho com base na variavel itens
function reloadCarrinho(){
    deleteCarrinho();
    itens.forEach( item =>{
        const p = createItem();
        p.id = item.id;
        p.innerText = `${item.nome.slice(0, 11)} ${item.qtdItem}X - R$${item.totalVenda()}`
        carrinho.appendChild(p);
    })
}
//Apaga itens do carrinho
function deleteCarrinho(){
    let itensCarrinho = carrinho.querySelectorAll('p');
    itensCarrinho.forEach( item => carrinho.removeChild(item));
}
//Cria item para o carrinho
function createItem(){
    const p = document.createElement('p');
    p.classList.add('colorList');
    return p;
}
//Retira qtd Estque da linha selecionada
function subtractEstoque(qtd){
    const row = getSelectedRow();
    const estq = row.querySelectorAll('td')[5]
    const currency = estq.textContent;
    estq.textContent = currency - qtd;
}
//remove item da lista itens
function removeItem(id){
    itens = itens.filter(obj=>{
        if(obj.id == id){
            addEstoque(obj.id, obj.qtdItem);
           return false;
        } else{
            return true;
        } 
    });
}

function addEstoque(id, qtd){
    linhas.forEach( row=>{
        const idRow = row.querySelectorAll('td')[0];
        if(idRow.textContent == id){
            const qtdRow = row.querySelectorAll('td')[5];
            const temp = qtdRow.textContent;
            qtdRow.textContent = Number.parseInt(temp) + qtd;
        }
    })
}


//Formtação
function currencyFormat(currency){
    let temp = currency.replace('R$', '');
    let value = temp.replace(',','.');
    return value;
}

//=-=-=- EventListener =-=-=-=
//Lista Selecionaval
tabela.addEventListener('click', e=>{
    const el = e.target;
    const tr = el.parentElement;
    selectRow(tr);
});
//Ação Botão Adicionar
document.addEventListener('click', e=>{
    const el = e.target;
    if(el.id === "btnAdd"){
        loadVenda();
        selectRow(null);
    }
    //deletar item do carrinho
    if(el.classList.contains('colorList')){
        let id = el.id;
        removeItem(id);
        el.remove();
        
    }
})