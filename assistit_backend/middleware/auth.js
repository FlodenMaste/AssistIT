const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_moi_en_production';

// Middleware d'authentification JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware pour vérifier le rôle technicien
const requireTechnician = (req, res, next) => {
  if (req.user.role !== 'technicien') {
    return res.status(403).json({ error: 'Accès réservé aux techniciens' });
  }
  next();
};

// Middleware pour vérifier le rôle client
const requireClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Accès réservé aux clients' });
  }
  next();
};

module.exports = { authMiddleware, requireTechnician, requireClient };
