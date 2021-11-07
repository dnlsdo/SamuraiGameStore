//Os middlwares são executados antes de alguma outra requisisão

//Middlware responsável por setar variaveis globais
exports.middlewareGlobal = (req, res, next) => {
  //Responsável por setar as variaveis que apresentarão mensagens de sucesso ou erro ao usuário
    res.locals.erros = req.flash('erros');
    res.locals.success = req.flash('success');
    //Responsável por setar o usuároi da sessão e seu respectivo nível de acesso
    res.locals.user = req.session.user;
    if(res.locals.user){
      res.locals.acesso = res.locals.user.acesso;
    }else{
      res.locals.acesso = 2;
    }
    
    next();
  };
//Responsável por requerer que o usuário esteja logado
exports.loginRequired= (req, res, next) =>{
  if(!req.session.user) {
    res.status(403).render('403');
    return
  }
  next();
}
//Resposável por requerer que o usuário tenha acesso nível admin para acessar o recurso
exports.adminRequired = (req, res, next)=>{
  if(!req.session.user || req.session.user.acesso !== 0){
    res.status(403).render('403');
    return
  }
  next();
}
//Renderiza a tela do erro 404
exports.notfoundError = (req, res, next) =>{ 
  res.status(404).render('404'); 
}