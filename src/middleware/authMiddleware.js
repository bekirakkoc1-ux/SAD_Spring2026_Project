const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // İstek başlığından (header) token'ı alıyoruz
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ error: 'Erişim reddedildi. Lütfen giriş yapın.' });
    }

    try {
        // "Bearer [token]" formatından sadece token kısmını ayırıyoruz
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified; // Kullanıcı bilgilerini (id, username) req objesine ekliyoruz
        next(); // Geçişe izin ver
    } catch (error) {
        res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token.' });
    }
};