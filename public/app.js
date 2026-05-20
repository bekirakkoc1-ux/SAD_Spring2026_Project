const API_URL = 'http://localhost:3000/api';
let isLoginMode = true;

// Sayfa yüklendiğinde kullanıcının giriş yapıp yapmadığını kontrol et
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard(); // Token varsa direkt paneli aç
    }
});

// Kayıt Ol / Giriş Yap modları arasında geçiş
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Giriş Yap' : 'Kayıt Ol';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Giriş' : 'Kayıt Ol';
    document.getElementById('toggle-auth').innerText = isLoginMode ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap';
    document.getElementById('auth-message').innerText = ''; // Mesajları temizle
}

// Kayıt/Giriş Formu Gönderildiğinde
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle (SPA kuralı)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

    try {
        const res = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            if (isLoginMode) {
                // Giriş başarılıysa token'ı kaydet ve paneli aç
                localStorage.setItem('token', data.token);
                showDashboard();
            } else {
                // Kayıt başarılıysa giriş moduna geç
                document.getElementById('auth-message').innerText = 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.';
                document.getElementById('auth-message').className = 'text-success mt-2 text-center';
                toggleAuthMode();
            }
        } else {
            document.getElementById('auth-message').innerText = data.error || 'Bir hata oluştu.';
            document.getElementById('auth-message').className = 'text-danger mt-2 text-center';
        }
    } catch (error) {
        console.error('Bağlantı hatası:', error);
    }
});

// Başarılı giriş sonrası ekranı değiştirme
function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    fetchClubs(); // Kulüpleri veritabanından çek (READ)
}

// Çıkış Yapma
function logout() {
    localStorage.removeItem('token');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// --- CRUD OPERASYONLARI ---

// READ: Kulüpleri Getir
async function fetchClubs() {
    const token = localStorage.getItem('token');
    const res = await fetch(API_URL + '/clubs', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const clubs = await res.json();
    renderClubs(clubs);
}

// Ekrana Kulüpleri Çizdirme
function renderClubs(clubs) {
    const container = document.getElementById('clubs-container');
    container.innerHTML = '';
    
    if (clubs.length === 0) {
        container.innerHTML = '<p class="text-muted">Henüz hiç kulüp eklemediniz.</p>';
        return;
    }

    clubs.forEach(club => {
        container.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <h5 class="card-title text-primary">${club.name}</h5>
                        <p class="card-text">${club.description}</p>
                    </div>
                    <div class="card-footer bg-transparent d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-secondary" onclick="editClub(${club.id}, '${club.name}', '${club.description}')">Düzenle</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteClub(${club.id})">Sil</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// CREATE: Yeni Kulüp Ekle
document.getElementById('club-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('club-name').value;
    const description = document.getElementById('club-desc').value;
    const token = localStorage.getItem('token');

    await fetch(API_URL + '/clubs', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ name, description })
    });

    document.getElementById('club-name').value = '';
    document.getElementById('club-desc').value = '';
    fetchClubs(); // Listeyi güncelle
});

// UPDATE: Kulüp Güncelle
async function editClub(id, oldName, oldDesc) {
    const newName = prompt('Yeni Kulüp Adı:', oldName);
    const newDesc = prompt('Yeni Açıklama:', oldDesc);

    if (newName && newDesc) {
        const token = localStorage.getItem('token');
        await fetch(API_URL + '/clubs/' + id, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ name: newName, description: newDesc })
        });
        fetchClubs(); // Listeyi güncelle
    }
}

// DELETE: Kulüp Sil
async function deleteClub(id) {
    if (confirm('Bu kulübü silmek istediğinize emin misiniz?')) {
        const token = localStorage.getItem('token');
        await fetch(API_URL + '/clubs/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        fetchClubs(); // Listeyi güncelle
    }
}