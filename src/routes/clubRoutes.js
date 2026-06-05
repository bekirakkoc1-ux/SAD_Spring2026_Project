const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// =========================================================================
// 1. GENEL / LİSTELEME ROTALARI
// =========================================================================
router.get('/', clubController.getAllClubs);

// =========================================================================
// 2. KULÜP İŞLEMLERİ VE TALEPLER (Giriş Yapmış Herkes)
// =========================================================================
router.post('/request', verifyToken, clubController.createClubRequest);
router.post('/join', verifyToken, clubController.joinRequest);

// =========================================================================
// 3. YETKİLİ / PANEL ROTALARI (Admin ve Kulüp Başkanı)
// =========================================================================

// GET /api/clubs/admin/pending-students -> Katılım isteklerini panele listeler
router.get('/admin/pending-students', verifyToken, authorizeRoles('admin', 'club_president'), clubController.getPendingRequests);

// POST /api/clubs/admin/review-club -> Admin kulüp açma talebini onaylar/reddeder
router.post('/admin/review-club', verifyToken, authorizeRoles('admin'), clubController.reviewClubStatus);

// POST /api/clubs/review-student -> Kulüp Başkanı veya Admin öğrenci katılım isteğini onaylar/reddeder
router.post('/review-student', verifyToken, authorizeRoles('admin', 'club_president'), clubController.reviewJoinRequest);

// DELETE /api/clubs/:id -> Kulüp silme işlemi
router.delete('/:id', verifyToken, authorizeRoles('admin', 'club_president'), clubController.deleteClub);

module.exports = router;