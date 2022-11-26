module.exports = (req,res,next) => {
    res.locals.jwttoken = req.session.jwttoken;
    res.locals.userID = req.session.userID;
    res.locals.mobile = req.session.mobile;
    res.locals.userName = req.session.userName;
    next();
};