Como executar no Visual Studio Code:
1. Abra o terminal, certifique-se que o diretório do terminal esteja na pasta raiz do projeto
2. Execute o comando:
    npm i
3. Após o término do download dos pacotes, crie na pasta raiz do projeto um arquivo .env (se já não existir)
    O arquivo .env é para setar váriaveis de ambiente e possuem informações sensíveis de senha e usuário de acesso ao banco, por isso é ignorado pelo git

4. Adicione as seguintes dados dentro do arquivo .env:

    DATABASE=db_interdisciplinar
    HOST=localhost
    USER=NomeDOUsuario
    PASSWORD=SenhaDoSeuDB

5. Certifique-se que o serviço do MySql está rodando em sua máquina, barra de pesquisa>serviços:
MySql - Iniciar