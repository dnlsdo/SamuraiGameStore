const nav = document.querySelector(".nav");
(function adicionaNav(){
nav.innerHTML = `
<input type="checkbox" id="chec">
<label for="chec">
    <img src="imagens/controle.png" id="menu">
</label>

  <nav>
    <ul>
      <li><a href="index.html">HOME</a></li>
      <li><a href="login.html">LOGIN</a></li>
      <li><a href="">VENDAS</a></li>
      <li><a href="">CADASTROS</a></li>
      <li><a href="">RELATÓRIOS</a></li>

    </ul>
    <img src="imagens/download.png" id="logo">
  </nav>
`;

})();