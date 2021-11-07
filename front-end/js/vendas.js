const formCarrinho = document.querySelector('#form-carrinho');
const tabela = document.querySelector('#selecionavel');
const carrinho = document.querySelector('.produtosCarrinho');
const plataforma = document.querySelector('#plataforma-input')
const total = formCarrinho.querySelector('#total');
const mensagem = document.querySelector('#message');


const formSerch = document.querySelector('#serch');


//Parametros
const descontoInput = formCarrinho.querySelector('#input-desconto');
const cpfInput = formCarrinho.querySelector('#cpfcnpj');
let linhas = tabela.querySelectorAll('tr');
let itens = [];
let tableItens = [];
let tableFilter = [];



//Objetos
//Obejto itemCarrinho
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
//Objeto Produto
function criaProduto(id, nome, plataforma, tipo, preco, estoque){
    return{
        id_produto: id,
        nome,
        plataforma, 
        tipo,
        preco,
        estoque
    }
}

//Manipula dados da tabela, atualiza e limpa
//Cria uma lista com os objetos da tabela
function saveTable(){
    const rows = tabela.querySelectorAll('tr');
    rows.forEach( tr =>{
        let [id, nome, plataforma, tipo, preco, estoque] = sliceSelect(tr);
        const produto = criaProduto(id, nome, plataforma, tipo, preco, estoque);
        tableItens.push(produto);
    })
    console.log(tableItens);
}
//Atualizar Tabela
function loadTable(data){
    clearTable();   
    console.log('data',data);
    data.forEach(item =>{   
        delete item.descricao;
        delete item.totalVenda;
        tabela.appendChild(insertInLine(item));
    })
    linhas = tabela.querySelectorAll('tr');
}
//Criar linha de conteudo
function insertInLine(obj){
    console.log(obj);
    const tr = document.createElement('tr');
    insertInCol(obj.id_produto, tr);
    insertInCol(obj.nome, tr);
    insertInCol(obj.plataforma, tr);
    insertInCol(obj.tipo, tr);
    insertInCol(obj.preco, tr);
    insertInCol(obj.estoque, tr);
    return tr;
}
//Cria Coluna com conteudo
function insertInCol(value, tr){
    const td = document.createElement('td');
    td.textContent = value;
    tr.appendChild(td);
}
//Limpa tabela
function clearTable(){
    tabela.innerHTML = "";
}

//Cria objeto a partir de seleção na tabela
// Lista Selecionavel Caso chamado sem parametro irá deselecionar todos
function selectRow(row){
    linhas.forEach((e) => {
        e.classList.remove("selected");
    });
    if(row) row.classList.toggle('selected');
}
//Cria objeto venda apartir da linha Selecionada
function loadVenda(){
    try{
        let qtd = document.querySelector('#input-qtd').value;
        if(qtd <= 0 ) throw new TypeError('Quantidade inválida'); 
        let [id, nome, plataforma, tipo, preco, estq]= sliceSelect(getSelectedRow());
        qtd = Number.parseInt(qtd);
        estq = Number.parseInt(estq);
        id = Number.parseInt(id);
        preco = Number.parseFloat(currencyFormat(preco));

        if(estq < qtd) throw new TypeError('Quantidade acima do disponível em estoque');
        subtractEstoque(qtd);

        const item = criaItemCarrinho(id,nome,plataforma,tipo,preco,qtd);
        //verifica se item já está no carrinho
        if(!checkCarrinho(item)) itens.push(item);
        console.log(itens);
        reloadCarrinho();
    }catch(e){
        console.log(e.message);
        showMessage('danger',e.message);
    }
}
//Captura as informações da linha selecionada
function sliceSelect(tr){
    const result = [];
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
//Verifica se item já exite no carrinho
function checkCarrinho(item){
    for (let i = 0; i < itens.length; i++) {
        if(itens[i].id == item.id){
            itens[i].qtdItem += item.qtdItem;
            return true
        }
    }
    return false
}


//Gerencia o Carrinho
//Atauliza carrinho com base na variavel itens
function reloadCarrinho(){
    deleteCarrinho();
    itens.forEach( item =>{
        const p = createItem();
        p.id = item.id;
        p.innerText = `${item.nome.slice(0, 20)} ${item.qtdItem}X - R$${item.totalVenda()}`
        carrinho.appendChild(p);
    })
    reloadSutTotal();
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
    reloadSutTotal();
}
//remover todos os itens do carrinho
function removeAllItens(){
    itens.forEach( obj =>{
        addEstoque(obj.id, obj.qtdItem);
    });
    itens = [];
    reloadSutTotal();
}

//Atualiza quantidade de itens na tabela

//Retira qtd Estque da linha selecionada
function subtractEstoque(qtd){
    const row = getSelectedRow();
    const estq = row.querySelectorAll('td')[5]
    const currency = estq.textContent;
    estq.textContent = currency - qtd;
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

//Reset Formulário

//Atualiza subTotal
function reloadSutTotal(){
    const subTotal = document.querySelector('#sub-total');
    const output = formCarrinho.querySelector('#output-desconto')
    valueTotal = calculateSubTotal();
    subTotal.textContent  = valueTotal;
    descontoInput.value = 0;
    output.value = '0%';
    total.textContent = valueTotal;    
}

//Limpa formulário de venda
function clearForm(){
    deleteCarrinho();
    itens = [];
    cpfInput.textContent = '';
    reloadSutTotal();
}

// Mensagens
function showMessage(type, message){
    clearMessage();
    mensagem.removeAttribute('hidden');
    mensagem.classList.add(`alert-${type}`);
    mensagem.textContent = message;
}
function clearMessage(){
    mensagem.setAttribute('hidden',true);
    mensagem.classList.remove('alert-danger', 'alert-success');
    mensagem.textContent = '';
}

//Calculos

function calculateSubTotal(){
    let acc = 0.00;
    itens.forEach( item =>{
        acc += Number.parseFloat(item.totalVenda());
    } )
    return acc.toFixed(2);
}
function calculateTotal(porcent){
    let total = calculateSubTotal();
    total *= 1-(porcent/100);
    return total;
    
}

//Formtação

function discountItens(percent){
    itens.forEach( (item, index) =>{
        const discount = item.preco* (percent/100);
        item.preco = Number.parseFloat(item.preco - discount).toFixed(2);
        itens[index].desconto = discount.toFixed(2);
    })
}

function currencyFormat(currency){
    let temp = currency.replace('R$', '');
    let value = temp.replace(',','.');
    return value;
}

//=-=-=- EventListener =-=-=-=
window.onload = function(){
    if(window.location.pathname !== '/vendas') return
    saveTable();
}

//Lista Selecionaval
tabela.addEventListener('click', e=>{
    clearMessage();
    const el = e.target;
    const tr = el.parentElement;
    selectRow(tr);
});
//Troca do Input Plataforma
plataforma.addEventListener('change', ()=>{
    if(plataforma.value == 0) return loadTable(tableItens);
    tableFilter = tableItens.filter( produto=>{
        return produto.plataforma == plataforma.value;
    })
    loadTable(tableFilter);
})

//Ação Botão Adicionar + deletar item do Carrinho + btn limpar
document.addEventListener('click', e=>{
    const el = e.target;
    if(el.id === "btnAdd"){
        clearMessage();
        loadVenda();
        selectRow(null);
    }
    //deletar item do carrinho
    if(el.classList.contains('colorList')){
        let id = el.id;
        removeItem(id);
        el.remove(); 
    }
    // Botão limpar do carrinho
    if(el.classList.contains('btnLimpar')){
        removeAllItens();
        carrinho.innerHTML ="";
    }
});
//Atualizar Valor Total
descontoInput.addEventListener('change', ()=>{
    const desconto = descontoInput.value;
    total.textContent = calculateTotal(desconto).toFixed(2);
})

//COMUNICAÇÃO COM O SERVIDOR

// ENVIA FORMULARIO criar venda
formCarrinho.addEventListener('submit', async e=>{
    e.preventDefault();
    clearMessage();

    const desconto = Number.parseFloat(descontoInput.value);
    discountItens(desconto);
    const cpf = cpfInput.value;
    
    if(itens.length <= 0) return showMessage('danger', 'Necessário escolher ao menos um produto');

    const obj = { itens: itens, cpf:cpf }
    
    const result = await fetch('/vendas', {
        method: 'POST',
        body: JSON.stringify(obj),
        redirect: 'follow',
        headers: {
        'Content-Type': 'application/json',
        },
    })
    const data = await result.json()
    showMessage(data.type, data.message);
    clearForm();
})
//Ao Buscar um produto na serch bar
formSerch.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const serchInput = formSerch.querySelector('.input-pesquisa')
    let produto = serchInput.value;
    //Necessário esse if?
    if(window.location.pathname !== '/vendas') window.location.href = '/vendas';
    if(produto === '') produto = 0;
    const result = await fetch(`/search/${produto}`,{
        method: 'GET'
    });
    const data = await result.json();
    console.log(':',data);
    if(result.status === 400) return showMessage(data.type, data.message);
    loadTable(data);
    tableItens = data;
    //TODO verificar o status da chamada caso 400 showMessage
})
