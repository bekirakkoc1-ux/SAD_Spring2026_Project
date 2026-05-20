const clubController = require('./clubController');

// Veritabanını sahte (mock) olarak ayarlıyoruz ki test sırasında gerçek veritabanı etkilenmesin
jest.mock('../db/database', () => ({
    run: jest.fn(),
    all: jest.fn(),
    get: jest.fn()
}));

describe('Kulüp İş Mantığı (Business Logic) Testleri', () => {
    it('Kulüp adı boş gönderildiğinde 400 hatası dönmeli', () => {
        // Sahte (Mock) İstek (Request) ve Cevap (Response) objeleri oluşturuyoruz
        const req = { 
            body: { name: '', description: 'Gizli kulüp' }, 
            user: { id: 1 } 
        };
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };

        // Kontrolcü fonksiyonumuzu çalıştırıyoruz
        clubController.createClub(req, res);

        // Beklentilerimiz: Status 400 olmalı ve doğru hata mesajı dönmeli
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Kulüp adı zorunludur." });
    });
});