module.exports = (req,res,next) => {
    res.locals.jwttoken = req.session.jwttoken;
    res.locals.sellerID = req.session.sellerID;
    res.locals.slugID = req.session.slugID;
    res.locals.pFname = req.session.pFname;
    res.locals.pLname = req.session.pLname;
    res.locals.sellerName = req.session.pFname + ' ' + req.session.pLname;
    res.locals.plan = req.session.plan;
    next();
};