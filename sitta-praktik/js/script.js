// --- Helper Functions ---
function getElement(id) {
    return document.getElementById(id);
}

function showAlert(id, message, type = 'danger') {
    const alertEl = getElement(id);
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = `alert alert-${type}`;
    alertEl.style.display = 'block';
    
    setTimeout(() => {
        alertEl.style.display = 'none';
    }, 3000);
}

// --- Modal Logic ---
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
        });
    });

    // Click outside to close
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

function openModal(id) {
    const modal = getElement(id);
    if (modal) {
        modal.classList.add('show');
    }
}

// --- Login Logic ---
function initLogin() {
    const loginForm = getElement('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = getElement('email').value;
        const password = getElement('password').value;

        if (!email || !password) {
            showAlert('loginAlert', 'Email dan Password harus diisi!');
            return;
        }

        // Check credentials against dataPengguna
        const user = dataPengguna.find(u => u.email === email && u.password === password);

        if (user) {
            // Save user to sessionStorage for greeting
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            showAlert('loginAlert', 'Email/password yang Anda masukkan salah!');
            // Show native alert as requested in PDF as an alternative
            alert('Email/password yang Anda masukkan salah!');
        }
    });

    // Modals triggers
    const btnLupa = getElement('btnLupaPassword');
    if (btnLupa) btnLupa.addEventListener('click', (e) => { e.preventDefault(); openModal('modalLupaPassword'); });
    
    const btnDaftar = getElement('btnDaftar');
    if (btnDaftar) btnDaftar.addEventListener('click', (e) => { e.preventDefault(); openModal('modalDaftar'); });
}

// --- Dashboard Logic ---
function initDashboard() {
    const greetingEl = getElement('greetingMessage');
    const userNameEl = getElement('userName');
    if (!greetingEl) return;

    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = 'Selamat ';
    
    if (hour >= 5 && hour < 12) {
        greeting += 'Pagi';
    } else if (hour >= 12 && hour < 15) {
        greeting += 'Siang';
    } else if (hour >= 15 && hour < 18) {
        greeting += 'Sore';
    } else {
        greeting += 'Malam';
    }

    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const nama = user ? user.nama : 'Pengguna';

    greetingEl.textContent = greeting;
    if (userNameEl) userNameEl.textContent = nama;
}

// --- Tracking Logic ---
function initTracking() {
    const trackingForm = getElement('trackingForm');
    if (!trackingForm) return;

    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const noDo = getElement('noDO').value.trim();
        if (!noDo) {
            showAlert('trackingAlert', 'Masukkan Nomor DO/Billing terlebih dahulu!');
            return;
        }

        const data = dataTracking[noDo];
        const resultDiv = getElement('trackingResult');

        if (data) {
            // Populate tracking data
            getElement('resNama').textContent = data.nama;
            getElement('resStatus').textContent = data.status;
            getElement('resEkspedisi').textContent = data.ekspedisi;
            getElement('resTgl').textContent = data.tanggalKirim;
            getElement('resPaket').textContent = data.paket;
            getElement('resTotal').textContent = data.total;

            // Generate timeline
            const timelineDiv = getElement('resTimeline');
            timelineDiv.innerHTML = '';
            
            data.perjalanan.forEach((step, index) => {
                const isLast = index === data.perjalanan.length - 1;
                const statusClass = (data.status === "Dikirim" && isLast) ? "completed" : "";
                
                timelineDiv.innerHTML += `
                    <div class="timeline-item ${statusClass}">
                        <div class="timeline-date">${step.waktu}</div>
                        <div class="timeline-content">${step.keterangan}</div>
                    </div>
                `;
            });

            resultDiv.style.display = 'block';
            getElement('trackingAlert').style.display = 'none';
        } else {
            resultDiv.style.display = 'none';
            showAlert('trackingAlert', `Data dengan Nomor DO ${noDo} tidak ditemukan.`);
        }
    });
}

// --- Stok Logic ---
function renderStokTable() {
    const tbody = getElement('stokTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    dataBahanAjar.forEach((item, index) => {
        let badgeClass = 'badge-success';
        if (item.stok < 100) badgeClass = 'badge-danger';
        else if (item.stok < 300) badgeClass = 'badge-warning';

        tbody.innerHTML += `
            <tr>
                <td>${item.kodeLokasi}</td>
                <td>${item.kodeBarang}</td>
                <td><strong>${item.namaBarang}</strong></td>
                <td>${item.jenisBarang}</td>
                <td>${item.edisi}</td>
                <td><span class="badge ${badgeClass}">${item.stok}</span></td>
            </tr>
        `;
    });
}

function initStok() {
    const formTambah = getElement('formTambahStok');
    if (!formTambah) return;

    renderStokTable();

    const btnTambah = getElement('btnTambahModal');
    if (btnTambah) btnTambah.addEventListener('click', () => openModal('modalTambahStok'));

    formTambah.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get values
        const newItem = {
            kodeLokasi: getElement('inputKodeLokasi').value,
            kodeBarang: getElement('inputKodeBarang').value,
            namaBarang: getElement('inputNamaBarang').value,
            jenisBarang: getElement('inputJenisBarang').value,
            edisi: getElement('inputEdisi').value,
            stok: parseInt(getElement('inputStok').value),
            cover: ""
        };

        // Add to array
        dataBahanAjar.unshift(newItem);
        
        // Re-render table
        renderStokTable();
        
        // Close modal and reset form
        getElement('modalTambahStok').classList.remove('show');
        formTambah.reset();
        
        // Show success alert above table
        showAlert('stokAlert', 'Berhasil menambahkan stok baru!', 'success');
    });
}

// --- Logout ---
function initLogout() {
    const btnLogout = getElement('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initModals();
    initLogin();
    initDashboard();
    initTracking();
    initStok();
    initLogout();
});
