const formSerch = document.querySelector('#serch');
const serchInput = document.querySelector('.input-pesquisa')

formSerch.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const produto = serchInput.value;
    //Necessário esse if?
    if(window.location.pathname !== '/vendas') return window.location.href = '/vendas';

    const result = await fetch(`/vendas?produto=${produto}`,{
        method: 'GET'
    });
})