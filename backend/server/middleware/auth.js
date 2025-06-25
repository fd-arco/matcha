const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "monsecret";

const auth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({error:"Acces non autorise, aucun token fourni"});
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = {id:decoded.userId};
        next();
    } catch (error) {
        return res.status(401).json({error : "token invalide ou expire"});
    }
}

module.exports = {auth};
