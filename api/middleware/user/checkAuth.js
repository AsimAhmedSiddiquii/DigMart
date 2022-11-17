const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        jwt.verify(req.session.jwttoken, process.env.JWT_KEY);
        next();
    } catch (error) {
        res.render('./user/login-page')
    }
};