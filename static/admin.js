let currentUser = null;
let activityChart = null;
let systemStats = {
    memory: 0,
    cpu: 0,
    activeUsers: 0,
    uniqueIPs: 0
};

let visitsData = [];
let ipsData = [];
let usersData = [];
let systemLimits = {
    maxChars: 10000,
    maxExecutionTime: 30,
    maxMemoryUsage: 512,
    maxCpuUsage: 100,
    maxFileSize: 1024
};

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadInitialData();
    initializeCharts();
    startRealTimeUpdates();
});

function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    document.getElementById('limitsForm').addEventListener('submit', handleLimitsSubmit);
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.querySelector('.close-btn').addEventListener('click', closeAddUserModal);
    document.getElementById('addUserModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddUserModal();
        }
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    loadTabData(tabName);
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            updateDashboardStats();
            break;
        case 'visits':
            loadVisitsData();
            break;
        case 'ips':
            loadIPsData();
            break;
        case 'resources':
            updateResourceUsage();
            break;
        case 'limits':
            loadLimitsData();
            break;
        case 'users':
            loadUsersData();
            break;
    }
}

function loadInitialData() {
    generateMockData();
    updateDashboardStats();
    updateResourceUsage();
    loadLimitsData();
}

function generateMockData() {
    visitsData = [
        { user: 'admin', ip: '192.168.1.100', date: '2024-01-15 10:30:00', duration: '45 min' },
        { user: 'user1', ip: '192.168.1.101', date: '2024-01-15 11:15:00', duration: '30 min' },
        { user: 'user2', ip: '192.168.1.102', date: '2024-01-15 12:00:00', duration: '60 min' },
        { user: 'admin', ip: '192.168.1.100', date: '2024-01-15 14:20:00', duration: '20 min' },
        { user: 'user3', ip: '192.168.1.103', date: '2024-01-15 15:45:00', duration: '15 min' }
    ];
    ipsData = [
        { ip: '192.168.1.100', country: 'España', city: 'Madrid', lastVisit: '2024-01-15 14:20:00', totalVisits: 5, status: 'active' },
        { ip: '192.168.1.101', country: 'España', city: 'Barcelona', lastVisit: '2024-01-15 11:15:00', totalVisits: 2, status: 'active' },
        { ip: '192.168.1.102', country: 'España', city: 'Valencia', lastVisit: '2024-01-15 12:00:00', totalVisits: 1, status: 'inactive' },
        { ip: '192.168.1.103', country: 'España', city: 'Sevilla', lastVisit: '2024-01-15 15:45:00', totalVisits: 1, status: 'active' }
    ];
    usersData = [
        { id: 1, nombre: 'admin', memoria_asignada: 1024, cpu_asignada: 100, ip: '192.168.1.100', fecha_ultimo_acceso: '2024-01-15 14:20:00' },
        { id: 2, nombre: 'user1', memoria_asignada: 512, cpu_asignada: 50, ip: '192.168.1.101', fecha_ultimo_acceso: '2024-01-15 11:15:00' },
        { id: 3, nombre: 'user2', memoria_asignada: 256, cpu_asignada: 25, ip: '192.168.1.102', fecha_ultimo_acceso: '2024-01-15 12:00:00' },
        { id: 4, nombre: 'user3', memoria_asignada: 512, cpu_asignada: 75, ip: '192.168.1.103', fecha_ultimo_acceso: '2024-01-15 15:45:00' }
    ];    
    systemStats = {
        memory: 45,
        cpu: 23,
        activeUsers: 3,
        uniqueIPs: 4
    };
}

function updateDashboardStats() {
    document.getElementById('activeUsers').textContent = systemStats.activeUsers;
    document.getElementById('uniqueIPs').textContent = systemStats.uniqueIPs;
    document.getElementById('memoryUsed').textContent = `${systemStats.memory} MB`;
    document.getElementById('cpuUsed').textContent = `${systemStats.cpu}%`;
}

function initializeCharts() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Usuarios Activos',
                data: [2, 1, 3, 5, 4, 3],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                }
            }
        }
    });
}

function loadVisitsData() {
    const tbody = document.getElementById('visitsTableBody');
    tbody.innerHTML = '';
    
    visitsData.forEach(visit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${visit.user}</td>
            <td>${visit.ip}</td>
            <td>${visit.date}</td>
            <td>${visit.duration}</td>
            <td>
                <button class="btn-secondary" onclick="viewVisitDetails('${visit.user}')">Ver</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadIPsData() {
    const tbody = document.getElementById('ipsTableBody');
    tbody.innerHTML = '';
    
    ipsData.forEach(ip => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ip.ip}</td>
            <td>${ip.country}</td>
            <td>${ip.city}</td>
            <td>${ip.lastVisit}</td>
            <td>${ip.totalVisits}</td>
            <td><span class="status-${ip.status}">${ip.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function loadUsersData() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    usersData.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nombre}</td>
            <td>${user.memoria_asignada} MB</td>
            <td>${user.cpu_asignada}%</td>
            <td>${user.ip}</td>
            <td>${user.fecha_ultimo_acceso}</td>
            <td>
                <button class="btn-secondary" onclick="editUser(${user.id})">Editar</button>
                <button class="btn-secondary" onclick="deleteUser(${user.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateResourceUsage() {
    const memoryUsage = Math.floor(Math.random() * 80) + 20;
    const cpuUsage = Math.floor(Math.random() * 60) + 10;
    document.getElementById('memoryProgress').style.width = `${memoryUsage}%`;
    document.getElementById('cpuProgress').style.width = `${cpuUsage}%`;
    document.getElementById('memoryText').textContent = `${memoryUsage * 6.4} MB / 512 MB`;
    document.getElementById('cpuText').textContent = `${cpuUsage}% / 100%`;
    updateProcessList();
}

function updateProcessList() {
    const processList = document.getElementById('processList');
    const processes = [
        { name: 'lua-sandbox-1', pid: 1234, memory: '45 MB', cpu: '12%' },
        { name: 'lua-sandbox-2', pid: 1235, memory: '32 MB', cpu: '8%' },
        { name: 'nginx', pid: 1236, memory: '15 MB', cpu: '3%' },
        { name: 'python-app', pid: 1237, memory: '28 MB', cpu: '5%' }
    ];    
    processList.innerHTML = '';
    processes.forEach(process => {
        const item = document.createElement('div');
        item.className = 'process-item';
        item.innerHTML = `
            <span>${process.name} (PID: ${process.pid})</span>
            <span>${process.memory} | ${process.cpu}</span>
        `;
        processList.appendChild(item);
    });
}

function loadLimitsData() {
    document.getElementById('maxChars').value = systemLimits.maxChars;
    document.getElementById('maxExecutionTime').value = systemLimits.maxExecutionTime;
    document.getElementById('maxMemoryUsage').value = systemLimits.maxMemoryUsage;
    document.getElementById('maxCpuUsage').value = systemLimits.maxCpuUsage;
    document.getElementById('maxFileSize').value = systemLimits.maxFileSize;
}

function handleLimitsSubmit(e) {
    e.preventDefault();
    
    systemLimits = {
        maxChars: parseInt(document.getElementById('maxChars').value),
        maxExecutionTime: parseInt(document.getElementById('maxExecutionTime').value),
        maxMemoryUsage: parseInt(document.getElementById('maxMemoryUsage').value),
        maxCpuUsage: parseInt(document.getElementById('maxCpuUsage').value),
        maxFileSize: parseInt(document.getElementById('maxFileSize').value)
    };
    
    showNotification('Límites guardados correctamente', 'success');
}

function adjustMemory(amount) {
    const currentMemory = parseInt(document.getElementById('maxMemoryUsage').value);
    const newMemory = Math.max(64, Math.min(2048, currentMemory + amount));
    document.getElementById('maxMemoryUsage').value = newMemory;
    systemLimits.maxMemoryUsage = newMemory;
}

function adjustCPU(amount) {
    const currentCPU = parseInt(document.getElementById('maxCpuUsage').value);
    const newCPU = Math.max(10, Math.min(100, currentCPU + amount));
    document.getElementById('maxCpuUsage').value = newCPU;
    systemLimits.maxCpuUsage = newCPU;
}

function refreshProcesses() {
    updateProcessList();
    showNotification('Procesos actualizados', 'success');
}

function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('active');
    document.getElementById('addUserForm').reset();
}

function handleAddUser(e) {
    e.preventDefault();
    
    const newUser = {
        id: usersData.length + 1,
        nombre: document.getElementById('newUserName').value,
        memoria_asignada: parseInt(document.getElementById('newUserMemory').value),
        cpu_asignada: parseInt(document.getElementById('newUserCPU').value),
        ip: 'N/A',
        fecha_ultimo_acceso: 'Nunca'
    };
    
    usersData.push(newUser);
    loadUsersData();
    closeAddUserModal();
    showNotification('Usuario agregado correctamente', 'success');
}

function editUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (user) {
        showNotification(`Editando usuario: ${user.nombre}`, 'info');
    }
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        usersData = usersData.filter(u => u.id !== userId);
        loadUsersData();
        showNotification('Usuario eliminado correctamente', 'success');
    }
}

function viewVisitDetails(user) {
    showNotification(`Detalles de visita para: ${user}`, 'info');
}

function refreshUsers() {
    loadUsersData();
    showNotification('Usuarios actualizados', 'success');
}

function startRealTimeUpdates() {
    setInterval(() => {
        updateResourceUsage();
        updateDashboardStats();
    }, 5000); 
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#8b5cf6'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

const notificationCSS = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);
