const db = require('../db/database');

// 1. Yeni Kulüp Oluştur (CREATE)
exports.createClub = (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id; // Middleware'den gelen kullanıcı ID'si

    if (!name) return res.status(400).json({ error: "Kulüp adı zorunludur." });

    db.run(`INSERT INTO clubs (name, description, userId) VALUES (?, ?, ?)`, 
        [name, description, userId], 
        function(err) {
            if (err) return res.status(500).json({ error: "Kulüp oluşturulamadı." });
            res.status(201).json({ message: "Kulüp başarıyla oluşturuldu.", clubId: this.lastID });
        }
    );
};

// 2. Kullanıcının Kulüplerini Listele (READ)
exports.getClubs = (req, res) => {
    const userId = req.user.id;

    db.all(`SELECT * FROM clubs WHERE userId = ?`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Kulüpler getirilemedi." });
        res.json(rows);
    });
};

// 3. Kulüp Bilgilerini Güncelle (UPDATE)
exports.updateClub = (req, res) => {
    const { name, description } = req.body;
    const clubId = req.params.id;
    const userId = req.user.id;

    db.run(`UPDATE clubs SET name = ?, description = ? WHERE id = ? AND userId = ?`, 
        [name, description, clubId, userId], 
        function(err) {
            if (err) return res.status(500).json({ error: "Kulüp güncellenemedi." });
            if (this.changes === 0) return res.status(404).json({ error: "Kulüp bulunamadı veya yetkiniz yok." });
            res.json({ message: "Kulüp başarıyla güncellendi." });
        }
    );
};

// 4. Kulüp Sil (DELETE)
exports.deleteClub = (req, res) => {
    const clubId = req.params.id;
    const userId = req.user.id;

    db.run(`DELETE FROM clubs WHERE id = ? AND userId = ?`, 
        [clubId, userId], 
        function(err) {
            if (err) return res.status(500).json({ error: "Kulüp silinemedi." });
            if (this.changes === 0) return res.status(404).json({ error: "Kulüp bulunamadı veya yetkiniz yok." });
            res.json({ message: "Kulüp başarıyla silindi." });
        }
    );
};