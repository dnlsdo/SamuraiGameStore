const select = document.querySelector('#serchBy');
const priceBox = document.querySelector('#prices');
const idNameBox = document.querySelector('#id-name');
const plataformaBox = document.querySelector('#plataform');
const typeBox = document.querySelector('#type');
const table = document.querySelector('#table')

const defaultInput = document.querySelector('#defaultInput');
const plataformInput = document.querySelector('#plataformInput');
const typeInput = document.querySelector('#typeInput');
const priceInicial = document.querySelector('#priceInitialInput');
const priceFinal = document.querySelector('#priceFinalInput');

const message = document.querySelector('#message');
const formProduto = document.querySelector('#serchProduto');


select.selectedIndex = 0;
//Esconde todos inputs
function hiddenAll(){
    priceBox.setAttribute('hidden', true);
    idNameBox.setAttribute('hidden', true);
    plataformaBox.setAttribute('hidden', true);
    typeBox.setAttribute('hidden', true);
    message.setAttribute('hidden', true);
}
//Carega produtos na tabela
function tableLoad(produtos){
    table.innerHTML = '';
    produtos.forEach( produto =>{
        const tr = document.createElement('tr');
        if(produto.estoque <= 5){
            tr.setAttribute('class','bg-warning')
        }
        tr.appendChild(criaTD(produto.id_produto));
        tr.appendChild(criaTD(produto.nome));
        tr.appendChild(criaTD(produto.plataforma));
        tr.appendChild(criaTD(produto.tipo));
        tr.appendChild(criaTD(produto.preco, 'R$'));
        tr.appendChild(criaTD(produto.estoque))
        tr.appendChild(criaLink(produto.id_produto));
        table.appendChild(tr);
    })
}
//Cria um elemetno de coluna com um valor dentro
function criaTD(content, prefix){
    let temp = '';
    if(prefix) temp = prefix.toString();

    const td = document.createElement('td');
    td.textContent = temp + content;
    return td;
}
//Cria link para editar produto
function criaLink(id){
    const link = `/editar/produto/${id}`;
    const a = document.createElement('a');
    a.setAttribute('class', 'd-grid mx-auto col-8 text-decoration-none');
    a.setAttribute('href',link);
    a.innerHTML = '<button type="button" class="btn btn-secondary btn-sm">Editar</button>';
    return a;
}

//Message
function messageShow(mensagem){
    message.removeAttribute('hidden');
    message.textContent = mensagem;
}

//Faz um request de produto por campo inserido
async function serchOthers(inputField){
    const obj ={
        field: select.value,
        value: inputField.value
    }
    console.log(obj);
    const result = await fetch('/produtoSearch', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
        'Content-Type': 'application/json',
        },
    });
    const data = await result.json();
    console.log(':',data);
    if(result.status === 400) return messageShow('Não Encotrado Resultados');
    tableLoad(data);
}
//Faz um requeste por produtos por faixa de preços
async function serchPrices(){
    const inicial = Number.parseFloat(priceInicial.value)
    const final = Number.parseFloat(priceFinal.value);
    if(Number.isNaN(inicial) || Number.isNaN(final)){
        return messageShow('Preço precisa conter números');
    }else if(inicial > final) return messageShow('Preço inicial deve ser menor que o preço Final');
    
    const obj ={
        inicial: priceInicial.value,
        final: priceFinal.value
    }
    console.log(obj);
    const result = await fetch('/produtoPriceSearch', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
        'Content-Type': 'application/json',
        },
    });
    const data = await result.json();
    console.log(':',data);
    if(result.status === 400) return messageShow('Não Encotrado Resultados');
    tableLoad(data);
}

//-- Event listener --
select.addEventListener('change', ()=>{
    hiddenAll();
    switch (select.value) {
        case 'id_produto':
        case 'nome':
            idNameBox.removeAttribute('hidden');
            break;
        case 'plataforma':
            plataformaBox.removeAttribute('hidden');
            break;
        case 'tipo':
            typeBox.removeAttribute('hidden');
            break;
        default:
            priceBox.removeAttribute('hidden');
            break;
    }
});

document.addEventListener('submit', async (e)=>{
    e.preventDefault();
    message.setAttribute('hidden', true);

    switch (select.value) {
        case 'id_produto':
        case 'nome':
            serchOthers(defaultInput);
            break;
        case 'plataforma':
            serchOthers(plataformInput);
            break;
        case 'tipo':
            serchOthers(typeInput);
            break;
        default:
            serchPrices();
            break;
    }
    
});