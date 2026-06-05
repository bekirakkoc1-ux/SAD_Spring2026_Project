const bcrypt = require('bcryptjs');
const db = require('./src/db/database');

async function createPresident() {
    const username = 'baskan';
    const password = 'baskan'; 
    const role = 'club_president';
    
    const hashedPassword = await bcrypt.hash(password, 10);

    db.serialize(() => {
        db.run(
            `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [username, hashedPassword, role],
            function(err) {
                if (err) console.log('❌ Hata veya Kullanıcı zaten var:', err.message);
                else console.log('✅ Şifreli Başkan başarıyla oluşturuldu! Kullanıcı: baskan, Şifre: baskan');
                db.close();
            }
        );
    });
}
createPresident();