const orderby = document.querySelector('.orderby')
const table = document.querySelector('.table-relatorio')
//Redireciona qual tipo de dado é para ser apresentado na tabela
function writeTable(data, tipo){
    eraseTable();   
    console.log('data:',data);
    switch (tipo) {
        case 'cliente':
            data.forEach( cliente =>{createCliente(cliente)})
            break;
        case 'funcionario':
            data.forEach( funcionario =>{createFuncionario(funcionario)})
            break;
        case 'venda':
            data.forEach( venda =>{createVenda(venda)})
        default:
            break;
    }
}
//Cria Linha na tabela de cliente
function createCliente(obj){
    //Deleta a propriedade ID de Cliente
    const id = obj.id_cliente
    delete obj.id_cliente

    if(obj.totalCompra) obj.totalCompra = obj.totalCompra.toFixed(2);

    const tr = createDataRow(obj)
    tr.appendChild(createButtonEdit(id, 'cliente'));
    table.appendChild(tr);
}
//Cria linha na tebela de funcionario
function createFuncionario(obj){
    const id = Object.values(obj)[0];
    if(obj.totalVenda) obj.totalVenda = obj.totalVenda.toFixed(2);

    const tr = createDataRow(obj);
    tr.appendChild(createButtonEdit(id, 'funcionario'));
    table.appendChild(tr);
}
//Cria linha na tabela de venda
function createVenda(obj){
    const id = Object.values(obj)[0];
    obj.valorTotal = obj.valorTotal.toFixed(2);
    
    const tr = createDataRow(obj);
    tr.appendChild(createButtonDetails(id));
    table.appendChild(tr);
}
//Popula uma linha com os paramentros de um objeto
function createDataRow(obj){
    const tr = document.createElement('tr');
    for (const key in obj) {
        const td = document.createElement('td');
        td.textContent = obj[key];
        tr.appendChild(td);
    }
    return tr;
}
//Cria o botado edit
function createButtonEdit(id, tipo){             
    const a = document.createElement('a');
    const btn = document.createElement('button');
    a.setAttribute('class', 'btn btn-link');
    a.setAttribute('href', `/editar/${tipo}/${id}`);
    btn.setAttribute('type','button');
    btn.setAttribute('class', 'btn btn-secondary');
    btn.innerText = 'Editar';
    a.appendChild(btn);
    return a;
}
//Cria o botado detalhes
function createButtonDetails(id){             
    const a = document.createElement('a');
    const btn = document.createElement('button');
    a.setAttribute('class', 'btn btn-link');
    a.setAttribute('href', `/detalhe-venda/${id}`);
    btn.setAttribute('type','button');
    btn.setAttribute('class', 'btn btn-secondary');
    btn.innerText = 'Detalhes';
    a.appendChild(btn);
    return a;
}
//Apaga conteudo da tabela
function eraseTable(){
    table.innerHTML = "";
}

//Event Listner
document.addEventListener('submit', async e =>{
    e.preventDefault();
    const el = e.target;
    const value = orderby.value;

    if(el.id === 'form-cliente'){
       const result = await fetch(`/relatorio/cliente/${value}`) 
       const data = await result.json();
       writeTable(data, 'cliente');
    }
    if(el.id === 'form-funcionario'){
        const result = await fetch(`/relatorio/funcionario/${value}`) 
       const data = await result.json();
       writeTable(data, 'funcionario');
    }
    if(el.id === 'form-venda'){
        const result = await fetch(`/relatorio/venda/${value}`)
        const data = await result.json();
        writeTable(data, 'venda');
    }
})