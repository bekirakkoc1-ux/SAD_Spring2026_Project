const API_URL = 'http://localhost:3000/api';
let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard(); 
    }
});

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('toggle-auth').innerText = isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login';
    document.getElementById('auth-message').innerText = ''; 
}

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
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
                localStorage.setItem('token', data.token);
                showDashboard();
            } else {
                document.getElementById('auth-message').innerText = 'Registration successful! You can now login.';
                document.getElementById('auth-message').className = 'text-success mt-2 text-center';
                toggleAuthMode();
            }
        } else {
            document.getElementById('auth-message').innerText = data.error || 'An error occurred.';
            document.getElementById('auth-message').className = 'text-danger mt-2 text-center';
        }
    } catch (error) {
        console.error('Connection error:', error);
    }
});

function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    fetchClubs(); 
}

function logout() {
    localStorage.removeItem('token');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

async function fetchClubs() {
    const token = localStorage.getItem('token');
    const res = await fetch(API_URL + '/clubs', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const clubs = await res.json();
    renderClubs(clubs);
}

function renderClubs(clubs) {
    const container = document.getElementById('clubs-container');
    container.innerHTML = '';
    
    if (clubs.length === 0) {
        container.innerHTML = '<p class="text-muted">You haven\'t added any clubs yet.</p>';
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
                        <button class="btn btn-sm btn-outline-secondary" onclick="editClub(${club.id}, '${club.name}', '${club.description}')">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteClub(${club.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
}

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
    fetchClubs(); 
});

async function editClub(id, oldName, oldDesc) {
    const newName = prompt('New Club Name:', oldName);
    const newDesc = prompt('New Description:', oldDesc);

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
        fetchClubs(); 
    }
}

async function deleteClub(id) {
    if (confirm('Are you sure you want to delete this club?')) {
        const token = localStorage.getItem('token');
        await fetch(API_URL + '/clubs/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        fetchClubs(); 
    }
}