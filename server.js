require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/db/database'); 
const swaggerUi = require('swagger-ui-express');

// swagger.json dosyasını controllers klasörüne taşıdığın için yolu buna göre güncelledim
const swaggerDocument = require('./src/controllers/swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 
app.use(express.static('public')); 

// Swagger API Dokümantasyonu Rotası
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Yetkilendirme (Auth) Rotaları
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Kulüp (CRUD) Rotaları
const clubRoutes = require('./src/routes/clubRoutes');
app.use('/api/clubs', clubRoutes);

// Test Rotası
app.get('/api/test', (req, res) => {
    res.json({ message: "Sunucu tıkır tıkır çalışıyor!" });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandı.`);
});