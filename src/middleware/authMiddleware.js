const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Tarayıcılar bazen "Bearer token_buraya" şeklinde gönderir
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token bulunamadı, yetkisiz erişim.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar');
        req.user = decoded; // id, username, role
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmamaktadır.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };