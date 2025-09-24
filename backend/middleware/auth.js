const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       console.log("Headers reçus :", req.headers);

       if (!req.headers.authorization) {
           throw new Error("Authorization header manquant !");
       }

       const token = req.headers.authorization.split(' ')[1];
       console.log("Token reçu :", token);

       const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
       console.log("Token décodé :", decodedToken);

       req.auth = { userId: decodedToken.userId };
       next();
   } catch(error) {
       console.error("Erreur AUTH :", error.message);
       res.status(401).json({ error: error.message });
   }
};
