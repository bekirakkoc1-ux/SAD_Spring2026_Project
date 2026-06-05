const clubController = require('./clubController');
const db = require('../db/database');

// SQLite veritabanı işlemlerini mock'luyoruz (sahte test verisi üretiyoruz)
jest.mock('../db/database', () => ({
    run: jest.fn((query, params, callback) => {
        // Eğer callback varsa, hata olmadan çalışmış gibi tetikle
        if (typeof params === 'function') params();
        else if (typeof callback === 'function') callback(null);
    })
}));

describe('Kulüp İş Mantığı (Business Logic) Testleri', () => {
    let req, res;

    beforeEach(() => {
        // Her testten önce req ve res nesnelerini sıfırlıyoruz
        req = {
            body: {},
            user: { id: 1, username: 'testuser', role: 'student' } // Mock kullanıcı
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test('Yeni kulüp isteği başarılı şekilde oluşturulmalı', () => {
        req.body = {
            name: 'Yazılım Kulübü',
            description: 'Kodlama ve projeler üzerine odaklı topluluk.',
            capacity: 50
        };

        // Yeni güncellediğimiz fonksiyon adını çağırıyoruz: createClubRequest
        clubController.createClubRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('admin onayına gönderildi')
            })
        );
    });

    test('Geçersiz durum bilgisi gönderildiğinde admin onayı 400 hatası dönmeli', () => {
        req.body = {
            clubId: 1,
            status: 'INVALID_STATUS' // 'approved' veya 'rejected' olmalıydı
        };

        clubController.reviewClubStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Geçersiz durum bilgisi.'
        });
    });
});