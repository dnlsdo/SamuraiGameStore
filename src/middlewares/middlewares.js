
exports.middlewareGlobal = (req, res, next) => {
    res.locals.erros = req.flash('erros');
    res.locals.success = req.flash('success');
    res.locals.user = req.session.user;
    if(res.locals.user){
      res.locals.acesso = res.locals.user.acesso;
    }else{
      res.locals.acesso = 2;
    }
    
    next();
  };

exports.loginRequired= (req, res, next) =>{
  if(!req.session.user) {
    res.status(403).render('403');
    return
  }
  next();
}
exports.adminRequired = (req, res, next)=>{
  if(!req.session.user || req.session.user.acesso !== 0){
    res.status(403).render('403');
    return
  }
  next();
}

exports.notfoundError = (req, res, next) =>{ 
  res.status(404).render('404'); 
}