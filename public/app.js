const API_URL = 'http://localhost:3000/api/clubs'; 
const AUTH_URL = 'http://localhost:3000/api/auth'; 

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const authForm = document.getElementById('auth-form');
    if (authForm) authForm.addEventListener('submit', handleAuth);

    const clubForm = document.getElementById('club-form');
    if (clubForm) clubForm.addEventListener('submit', handleCreateClub);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('dashboard');

    if (token) {
        if (authSection) authSection.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';

        if (document.getElementById('welcome-username')) {
            document.getElementById('welcome-username').innerText = username;
        }
        
        const roleBadge = document.getElementById('user-role-badge');
        if (roleBadge) {
            roleBadge.innerText = formatRoleName(role);
            if (role === 'admin') { roleBadge.className = 'badge bg-warning text-dark role-badge ms-2'; }
            else if (role === 'club_president') { roleBadge.className = 'badge bg-success text-white role-badge ms-2'; }
            else { roleBadge.className = 'badge bg-info text-dark role-badge ms-2'; }
        }

        if (document.getElementById('admin-panel')) {
            document.getElementById('admin-panel').style.display = (role === 'admin') ? 'block' : 'none';
        }
        if (document.getElementById('president-panel')) {
            document.getElementById('president-panel').style.display = (role === 'admin' || role === 'club_president') ? 'block' : 'none';
        }

        loadClubs();
        if (role === 'admin') loadPendingClubs();
        if (role === 'admin' || role === 'club_president') loadPendingStudents();

    } else {
        if (authSection) authSection.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    }
}

function formatRoleName(role) {
    if (role === 'admin') return 'System Admin (Yönetici)';
    if (role === 'club_president') return 'Club President (Kulüp Başkanı)';
    return 'Student (Öğrenci)';
}

async function handleAuth(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const authMessage = document.getElementById('auth-message');
    
    const isLogin = (typeof isLoginMode !== 'undefined') ? isLoginMode : true;

    if (isLogin) {
        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Giriş başarısız.');

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role || 'student'); 
            localStorage.setItem('username', usernameInput);

            authMessage.innerText = "";
            checkAuth(); 
        } catch (err) {
            authMessage.innerText = err.message;
        }
    } else {
        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput, role: 'student' })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Kayıt başarısız.');

            alert('Kayıt başarılı! Öğrenci rolüyle hesabınız açıldı. Giriş yapabilirsiniz.');
            toggleAuthMode(); 
        } catch (err) {
            authMessage.innerText = err.message;
        }
    }
}

function logout() {
    localStorage.clear();
    checkAuth();
}

async function loadClubs() {
    const container = document.getElementById('clubs-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}`); 
        const clubs = await response.json();
        
        const activeClubs = clubs.filter(c => c.status === 'approved');

        if (activeClubs.length === 0) {
            container.innerHTML = `<div class="text-muted text-center w-100 py-4">Henüz aktif bir kulüp bulunmamaktadır.</div>`;
            return;
        }

        const currentRole = localStorage.getItem('role');

        container.innerHTML = activeClubs.map(club => `
            <div class="col-md-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <h5 class="card-title fw-bold text-dark">${club.name}</h5>
                        <p class="card-text text-muted small">${club.description || 'Açıklama belirtilmemiş.'}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="small fw-semibold text-secondary">Kontenjan:</span>
                            <span class="badge ${club.current_members >= club.capacity ? 'bg-danger' : 'bg-secondary'}">
                                ${club.current_members} / ${club.capacity}
                            </span>
                        </div>
                        <div class="d-flex gap-2">
                            ${currentRole === 'student' && club.current_members < club.capacity ? 
                                `<button class="btn btn-primary btn-sm w-100 fw-bold" onclick="sendJoinRequest(${club.id})">Katılma İsteği Gönder</button>` : ''
                            }
                            ${currentRole === 'admin' || currentRole === 'club_president' ? 
                                `<button class="btn btn-outline-danger btn-sm w-100 fw-bold" onclick="handleDeleteClub(${club.id})">Kulübü Sil</button>` : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-danger">Kulüpler yüklenirken hata oluştu.</p>`;
    }
}

async function handleCreateClub(e) {
    e.preventDefault();
    const name = document.getElementById('club-name').value;
    const desc = document.getElementById('club-desc').value;
    const capacity = document.getElementById('club-capacity').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/request`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description: desc, capacity: parseInt(capacity) })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Talep iletilemedi.');

        alert(data.message || 'Kulüp talebi başarıyla admin onayına gönderildi.');
        document.getElementById('club-form').reset();
        loadClubs();
    } catch (err) {
        alert('Hata: ' + err.message);
    }
}

async function handleDeleteClub(clubId) {
    if (!confirm('Bu kulübü silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/${clubId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Silme başarısız.');
        alert('Kulüp başarıyla silindi.');
        loadClubs();
    } catch (err) {
        alert(err.message);
    }
}

async function sendJoinRequest(clubId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/join`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ clubId })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'İstek başarısız.');
        alert(data.message || 'Katılım isteğiniz iletildi.');
    } catch (err) {
        alert(err.message);
    }
}

async function loadPendingClubs() {
    const tbody = document.getElementById('admin-pending-clubs');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}`); 
        const clubs = await response.json();
        const pendingClubs = clubs.filter(c => c.status === 'pending');

        if (pendingClubs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center py-3">Onay bekleyen kulüp başvurusu yok.</td></tr>`;
            return;
        }

        tbody.innerHTML = pendingClubs.map(club => `
            <tr>
                <td class="fw-bold">${club.name}</td>
                <td>${club.description || '-'}</td>
                <td>${club.capacity}</td>
                <td>ID: ${club.created_by}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-success fw-bold me-1" onclick="reviewClub(${club.id}, 'approved')">Onayla</button>
                    <button class="btn btn-sm btn-danger fw-bold" onclick="reviewClub(${club.id}, 'rejected')">Reddet</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function reviewClub(clubId, status) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/admin/review-club`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ clubId, status })
        });
        if (!response.ok) throw new Error('İşlem başarısız.');
        
        alert(`Kulüp başarıyla ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
        loadClubs();
        loadPendingClubs();
    } catch (err) {
        alert(err.message);
    }
}

// 3. ADIMDA EKLENEN YENİ LİSTELEME VE BUTON FONKSİYONLARI:
async function loadPendingStudents() {
    const tbody = document.getElementById('president-pending-students');
    if (!tbody) return;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/admin/pending-students`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const requests = await response.json();

        if (!response.ok) throw new Error('İstekler yüklenemedi.');

        if (requests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-muted text-center py-3">No pending student join requests.</td></tr>`;
            return;
        }

        tbody.innerHTML = requests.map(req => `
            <tr>
                <td class="fw-bold"><i class="bi bi-person me-2"></i>${req.student_name}</td>
                <td><span class="badge bg-light text-dark border">${req.club_name}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-success fw-bold me-1" onclick="reviewStudent(${req.id}, 'approved')">Kabul Et</button>
                    <button class="btn btn-sm btn-danger fw-bold" onclick="reviewStudent(${req.id}, 'rejected')">Reddet</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function reviewStudent(requestId, status) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/review-student`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ requestId, status })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'İşlem başarısız.');
        
        alert(status === 'approved' ? 'Öğrenci kulübe kabul edildi!' : 'Öğrenci isteği reddedildi.');
        loadClubs();
        loadPendingStudents();
    } catch (err) {
        alert(err.message);
    }
}