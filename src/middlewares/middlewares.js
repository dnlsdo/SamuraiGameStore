exports.log = (req, res, next) =>{
    console.log('Passei aqui')
    next();
}