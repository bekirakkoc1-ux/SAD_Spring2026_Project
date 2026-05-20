# Öğrenci Kulübü Yönetim Sistemi (SAD Projesi)

Bu proje, Sistem Analizi ve Tasarımı dersi için geliştirilmiş web tabanlı bir CRUD uygulamasıdır. Kullanıcıların kendilerine ait öğrenci kulüplerini oluşturabildiği, listeleyebildiği, güncelleyebildiği ve silebildiği bir sistemdir.

## Kullanılan Teknolojiler
* **Frontend:** Vanilla Javascript (SPA), HTML, Bootstrap
* **Backend:** Node.js, Express.js
* **Veritabanı:** SQLite
* **Güvenlik:** JWT (JSON Web Token), bcryptjs
* **Test:** Jest
* **Dokümantasyon:** Swagger UI

## Kurulum ve Çalıştırma Adımları

1. Proje dosyalarını bilgisayarınıza indirin.
2. Terminali proje dizininde açın ve gerekli paketleri yüklemek için şu komutu çalıştırın:
   \`npm install\`
3. Sistemi başlatmak için şu komutu çalıştırın:
   \`node server.js\`
4. Tarayıcınızda \`http://localhost:3000\` adresine giderek uygulamayı kullanabilirsiniz.

## API ve Dokümantasyon
Sistemde interaktif bir Swagger dokümantasyonu bulunmaktadır. API uç noktalarını incelemek ve test etmek için sunucu çalışırken şu adrese gidebilirsiniz:
* **Swagger UI:** \`http://localhost:3000/api-docs\`

## Proje Gereksinimleri ve Karşılanan Kriterler
* **JWT ve Veri İzolasyonu:** Sistemde kayıt ve giriş mekanizması vardır. Her kullanıcı sadece kendi oluşturduğu kulüpleri görebilir ve yönetebilir.
* **İş Mantığı ve Test:** Veritabanı ve iş mantığı (business logic) Controller katmanına ayrılarak modüler bir yapı kurulmuş ve Jest ile birim testi (Unit Test) yazılmıştır (\`npm test\` ile çalıştırılabilir).
* **SPA:** Önyüz tamamen Vanilla JS ile sayfa yenilenmeden (fetch API) çalışmaktadır.