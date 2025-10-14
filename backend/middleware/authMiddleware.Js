const jwt = require('jsonwebtoken');
const {User} = require('../models/User');


const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer')) {

      return res.status(401).json({ message: 'Token non fourni ou invalide' });
    }


    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token décodé:", decoded);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log("❌ Utilisateur non trouvé pour l'ID:", decoded.id);
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    
    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur protect middleware:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    res.status(401).json({ message: 'Non autorisé' });
  }
};


const admin = (req, res, next) => {
  // L'utilisateur est injecté dans req.user par le middleware protect
  if (req.user && req.user.role === 'admin') {
    next(); // Il est admin → on passe à la suite
  } else {
    res.status(403).json({ message: "Accès refusé : réservé aux administrateurs." });
  }
};
module.exports = { protect, admin };