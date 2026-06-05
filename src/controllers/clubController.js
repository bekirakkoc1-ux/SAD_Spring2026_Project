const db = require('../db/database');

// =========================================================================
// 1. KULÜPLERİ LİSTELEME (TÜM DURUMLAR: PENDING, APPROVED, REJECTED)
// =========================================================================
exports.getAllClubs = (req, res) => {
    const query = `SELECT * FROM clubs`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

// =========================================================================
// 2. YENİ KULÜP BAŞVURUSU YAP (Öğrenci veya Kulüp Başkanı)
// =========================================================================
exports.createClubRequest = (req, res) => {
    const { name, description, capacity } = req.body;
    const query = `INSERT INTO clubs (name, description, capacity, created_by, status) VALUES (?, ?, ?, ?, 'pending')`;
    
    db.run(query, [name, description, capacity || 50, req.user.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ message: 'Kulüp oluşturma talebi admin onayına gönderildi.', clubId: this.lastID });
    });
};

// =========================================================================
// 3. ADMIN İÇİN: KULÜBÜ ONAYLA VEYA REDDET
// =========================================================================
exports.reviewClubStatus = (req, res) => {
    const { clubId, status } = req.body; // status: 'approved' veya 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Geçersiz durum bilgisi.' });
    }

    const query = `UPDATE clubs SET status = ? WHERE id = ?`;
    db.run(query, [status, clubId], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: `Kulüp durumu '${status}' olarak güncellendi.` });
    });
};

// =========================================================================
// 4. KULÜP SİL (Sadece Kulüp Başkanı veya Admin silebilir)
// =========================================================================
exports.deleteClub = (req, res) => {
    const clubId = req.params.id;

    db.get(`SELECT created_by FROM clubs WHERE id = ?`, [clubId], (err, club) => {
        if (err || !club) return res.status(404).json({ message: 'Kulüp bulunamadı.' });

        if (req.user.role !== 'admin' && club.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Bu kulübü silme yetkiniz yoktur.' });
        }

        db.run(`DELETE FROM clubs WHERE id = ?`, [clubId], (err) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: 'Kulüp başarıyla silindi.' });
        });
    });
};

// =========================================================================
// 5. ÖĞRENCİ İÇİN: KULÜBE KATILMA İSTEĞİ GÖNDER
// =========================================================================
exports.joinRequest = (req, res) => {
    const { clubId } = req.body;

    db.get(`SELECT capacity, current_members, status FROM clubs WHERE id = ?`, [clubId], (err, club) => {
        if (err || !club) return res.status(404).json({ message: 'Kulüp bulunamadı.' });
        if (club.status !== 'approved') return res.status(400).json({ message: 'Onaylanmamış kulüplere istek gönderilemez.' });
        if (club.current_members >= club.capacity) return res.status(400).json({ message: 'Kulüp kontenjanı tamamen dolu!' });

        const query = `INSERT INTO application_requests (user_id, club_id, status) VALUES (?, ?, 'pending')`;
        db.run(query, [req.user.id, clubId], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: 'Kulübe katılım isteğiniz başarıyla iletildi.' });
        });
    });
};

// =========================================================================
// 6. KULÜP BAŞKANI VEYA ADMIN İÇİN: KATILIM İSTEĞİNE ONAY/RET VER
// =========================================================================
exports.reviewJoinRequest = (req, res) => {
    const { requestId, status } = req.body; // status: 'approved' veya 'rejected'

    db.get(`SELECT r.*, c.created_by, c.current_members, c.capacity 
            FROM application_requests r 
            JOIN clubs c ON r.club_id = c.id 
            WHERE r.id = ?`, [requestId], (err, request) => {
        
        if (err || !request) return res.status(404).json({ message: 'Talep bulunamadı.' });

        if (req.user.role !== 'admin' && request.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Bu isteği onaylama yetkiniz yok.' });
        }

        if (status === 'approved') {
            if (request.current_members >= request.capacity) {
                return res.status(400).json({ message: 'Kontenjan dolu olduğu için onaylanamaz.' });
            }

            db.serialize(() => {
                db.run(`UPDATE application_requests SET status = 'approved' WHERE id = ?`, [requestId]);
                db.run(`UPDATE clubs SET current_members = current_members + 1 WHERE id = ?`, [request.club_id]);
            });
            return res.json({ message: 'Öğrenci kulübe başarıyla kabul edildi.' });
        } else {
            db.run(`UPDATE application_requests SET status = 'rejected' WHERE id = ?`, [requestId]);
            return res.json({ message: 'Kulüp katılım isteği reddedildi.' });
        }
    });
};

// =========================================================================
// 7. KULÜP BAŞKANI VEYA ADMIN İÇİN: GELEN TÜM KATILIM İSTEKLERİNİ LİSTELEME
// =========================================================================
exports.getPendingRequests = (req, res) => {
    const query = `
        SELECT r.id, u.username AS student_name, c.name AS club_name, r.status 
        FROM application_requests r
        JOIN users u ON r.user_id = u.id
        JOIN clubs c ON r.club_id = c.id
        WHERE r.status = 'pending'
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};