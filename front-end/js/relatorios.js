const orderby = document.querySelector('.orderby')
const table = document.querySelector('.table-relatorio')

function writeTable(data){
    eraseTable();   
    console.log('data:',data);
    data.forEach(item =>{   
        table.appendChild(crateLine(item));
    })
}

function crateLine(obj){
    //Deletar propiedade id, de quaisquer classe que seja (dado que o id é o primeiro iteravel)
    console.log(obj);
    const propId = Object.keys(obj)[0];
    const id = obj[propId];
    delete obj[propId]
    
    const tr = document.createElement('tr');
    for (const key in obj) {
        const td = document.createElement('td');
        td.textContent = obj[key];
        tr.appendChild(td);
    }
    tr.appendChild(createButtonEdit(id));
    return tr;
}

function createButtonEdit(id){             
    const a = document.createElement('a');
    const btn = document.createElement('button');
    a.setAttribute('class', 'btn btn-link');
    a.setAttribute('href', `/editar/cliente/${id}`);
    btn.setAttribute('type','button');
    btn.setAttribute('class', 'btn btn-secondary');
    btn.innerText = 'Editar';
    a.appendChild(btn);
    return a;
}

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
       writeTable(data);
    }
})