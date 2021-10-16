
exports.middlewareGlobal = (req, res, next) => {
    res.locals.erros = req.flash('erros');
    res.locals.success = req.flash('success');
    res.locals.user = req.session.user;
    next();
  };

exports.loginRequired= (req, res, next) =>{
  if(!req.session.user) {
    res.redirect('/403');
    return
  }
  next();
}

exports.notfoundError = (req, res, next) =>{ 
  res.status(404).render('404'); 
}