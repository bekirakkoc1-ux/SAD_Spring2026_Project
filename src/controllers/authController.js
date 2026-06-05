const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
require('dotenv').config();

// =========================================================================
// 1. KULLANICI KAYIT ETME (REGISTER)
// =========================================================================
exports.register = async (req, res) => {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Kullanıcı adı ve şifre zorunlu." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Eğer dışarıdan rol gönderilmezse (veya manipüle edilirse) varsayılan 'student' olur.
        const userRole = role || 'student';
        
        db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, userRole], function(err) {
            if (err) {
                return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış olabilir." });
            }
            res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu.", userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası." });
    }
};

// =========================================================================
// 2. KULLANICI GİRİŞİ (LOGIN)
// =========================================================================
exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Kullanıcı adı ve şifre zorunlu." });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
        }

        // Bcrypt şifre çözümleme karşılaştırması
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
        }

        // Kullanıcı rolünü JWT payload içerisine ekleyerek ara katmanların okumasını sağlıyoruz
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET || 'gizli_anahtar', 
            { expiresIn: '2h' }
        );
        
        // Ön yüzün yakalayabilmesi için role bilgisini json içinde de dönüyoruz
        res.json({ message: "Giriş başarılı.", token, role: user.role });
    });
};