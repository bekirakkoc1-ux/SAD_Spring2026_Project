const bcrypt = require('bcryptjs');
const db = require('./src/db/database');

async function createAdmin() {
    const username = 'admin';
    const password = 'admin'; 
    const role = 'admin';
    
    const hashedPassword = await bcrypt.hash(password, 10);

    db.serialize(() => {
        db.run(
            `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [username, hashedPassword, role],
            function(err) {
                if (err) console.log('❌ Hata veya Kullanıcı zaten var:', err.message);
                else console.log('✅ Şifreli Admin başarıyla oluşturuldu! Kullanıcı: admin, Şifre: admin');
                db.close();
            }
        );
    });
}
createAdmin();