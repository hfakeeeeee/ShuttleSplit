// ShuttleSplit JavaScript - Badminton Court Fee Calculator

class ShuttleSplit {
    constructor() {
        this.players = [];
        this.sessions = [];
        this.settings = {
            bankName: '',
            accountNumber: '',
            accountHolder: ''
        };
        this.loadData();
        this.bindEvents();
        this.render();
    }

    // Data persistence
    saveData() {
        localStorage.setItem('shuttleSplit_players', JSON.stringify(this.players));
        localStorage.setItem('shuttleSplit_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('shuttleSplit_settings', JSON.stringify(this.settings));
    }

    loadData() {
        const savedPlayers = localStorage.getItem('shuttleSplit_players');
        const savedSessions = localStorage.getItem('shuttleSplit_sessions');
        const savedSettings = localStorage.getItem('shuttleSplit_settings');

        if (savedPlayers) {
            this.players = JSON.parse(savedPlayers);
        }
        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions);
        }
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    // Event binding
    bindEvents() {
        // Auto-save on input changes
        document.addEventListener('input', () => {
            this.updateSummary();
        });
    }

    // Player management
    addPlayer() {
        document.getElementById('addPlayerForm').style.display = 'block';
        document.getElementById('playerName').focus();
    }

    savePlayer() {
        const name = document.getElementById('playerName').value.trim();
        const type = document.getElementById('playerType').value;

        if (!name) {
            alert('Please enter a player name');
            return;
        }

        if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Player with this name already exists');
            return;
        }

        const player = {
            id: Date.now(),
            name: name,
            type: type
        };

        this.players.push(player);
        this.saveData();
        this.renderPlayers();
        this.updateSummary();
        this.cancelAddPlayer();
        
        // Add animation
        setTimeout(() => {
            const playerCards = document.querySelectorAll('.player-card');
            const lastCard = playerCards[playerCards.length - 1];
            if (lastCard) {
                lastCard.classList.add('fade-in');
            }
        }, 100);
    }

    removePlayer(playerId) {
        if (confirm('Are you sure you want to remove this player?')) {
            this.players = this.players.filter(p => p.id !== playerId);
            this.saveData();
            this.renderPlayers();
            this.updateSummary();
        }
    }

    cancelAddPlayer() {
        document.getElementById('addPlayerForm').style.display = 'none';
        document.getElementById('playerName').value = '';
        document.getElementById('playerType').value = 'fixed';
    }

    // Session management
    addSession() {
        const sessionNumber = this.sessions.length + 1;
        const session = {
            id: Date.now(),
            name: `Session ${sessionNumber}`,
            date: new Date().toLocaleDateString(),
            courtFee: 0,
            shuttleFee: 0,
            waterFee: 0,
            additionalFee: 0
        };

        this.sessions.push(session);
        this.saveData();
        this.renderSessions();
        this.updateSummary();
    }

    removeSession(sessionId) {
        if (confirm('Are you sure you want to remove this session?')) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.saveData();
            this.renderSessions();
            this.updateSummary();
        }
    }

    updateSession(sessionId, field, value) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            session[field] = parseFloat(value) || 0;
            this.saveData();
            this.updateSummary();
        }
    }

    // Calculation methods
    calculateSessionCosts() {
        const courtFee = parseFloat(document.getElementById('courtFee').value) || 0;
        const shuttlecockPrice = parseFloat(document.getElementById('shuttlecockPrice').value) || 0;
        const shuttlecockCount = parseFloat(document.getElementById('shuttlecockCount').value) || 0;
        const waterFee = parseFloat(document.getElementById('waterFee').value) || 0;
        const additionalFee = parseFloat(document.getElementById('additionalFee').value) || 0;

        const shuttleFee = shuttlecockPrice * shuttlecockCount;
        const totalPerSession = courtFee + shuttleFee + waterFee + additionalFee;

        return {
            courtFee,
            shuttleFee,
            waterFee,
            additionalFee,
            totalPerSession
        };
    }

    calculatePlayerCosts() {
        if (this.players.length === 0 || this.sessions.length === 0) {
            return [];
        }

        const sessionCosts = this.calculateSessionCosts();
        const fixedPlayers = this.players.filter(p => p.type === 'fixed');
        const transientPlayers = this.players.filter(p => p.type === 'transient');
        
        const totalPlayers = this.players.length;
        const baseAmountPerPlayer = sessionCosts.totalPerSession / totalPlayers;
        
        // Transient players pay 10,000 VND more per session
        const transientSurcharge = 10000;
        
        const playerCosts = this.players.map(player => {
            const costPerSession = player.type === 'transient' 
                ? baseAmountPerPlayer + transientSurcharge 
                : baseAmountPerPlayer;
            
            // If there are transient players, fixed players pay slightly less
            const adjustedCostPerSession = transientPlayers.length > 0 && player.type === 'fixed'
                ? baseAmountPerPlayer - (transientPlayers.length * transientSurcharge) / fixedPlayers.length
                : costPerSession;

            const totalCost = adjustedCostPerSession * this.sessions.length;

            return {
                player,
                costPerSession: Math.round(adjustedCostPerSession),
                totalCost: Math.round(totalCost),
                sessions: this.sessions.map(session => ({
                    sessionName: session.name,
                    cost: Math.round(adjustedCostPerSession)
                }))
            };
        });

        return playerCosts;
    }

    // Rendering methods
    renderPlayers() {
        const container = document.getElementById('playersList');
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-user-plus" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No players added yet. Click "Add Player" to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.players.map(player => `
            <div class="player-card slide-in">
                <div class="player-info">
                    <div class="player-name">${this.escapeHtml(player.name)}</div>
                    <div class="player-type ${player.type}">
                        ${player.type === 'fixed' ? 'Fixed Registration' : 'Transient (+10,000₫)'}
                    </div>
                </div>
                <div class="player-actions">
                    <button class="btn btn-danger btn-sm" onclick="app.removePlayer(${player.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSessions() {
        const container = document.getElementById('sessionsList');
        
        if (this.sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-calendar-plus" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No sessions added yet. Click "Add Session" to get started.</p>
                </div>
            `;
            return;
        }

        const sessionCosts = this.calculateSessionCosts();

        container.innerHTML = this.sessions.map(session => `
            <div class="session-card fade-in">
                <div class="session-header">
                    <div class="session-title">${this.escapeHtml(session.name)}</div>
                    <button class="btn btn-danger btn-sm" onclick="app.removeSession(${session.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="session-costs">
                    <div class="cost-item">
                        <div class="cost-label">Court Fee</div>
                        <div class="cost-value">${this.formatCurrency(sessionCosts.courtFee)}</div>
                    </div>
                    <div class="cost-item">
                        <div class="cost-label">Shuttle Fee</div>
                        <div class="cost-value">${this.formatCurrency(sessionCosts.shuttleFee)}</div>
                    </div>
                    <div class="cost-item">
                        <div class="cost-label">Water Fee</div>
                        <div class="cost-value">${this.formatCurrency(sessionCosts.waterFee)}</div>
                    </div>
                    <div class="cost-item">
                        <div class="cost-label">Additional Fee</div>
                        <div class="cost-value">${this.formatCurrency(sessionCosts.additionalFee)}</div>
                    </div>
                    <div class="cost-item" style="background: linear-gradient(45deg, var(--primary-color), var(--primary-dark)); color: white;">
                        <div class="cost-label" style="color: rgba(255,255,255,0.8);">Total per Session</div>
                        <div class="cost-value" style="color: white; font-size: 1.3rem;">${this.formatCurrency(sessionCosts.totalPerSession)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateSummary() {
        const container = document.getElementById('summaryContent');
        
        if (this.players.length === 0 || this.sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Add players and sessions to see the cost breakdown.</p>
                </div>
            `;
            document.getElementById('qrSection').style.display = 'none';
            return;
        }

        const playerCosts = this.calculatePlayerCosts();
        const sessionCosts = this.calculateSessionCosts();
        const totalRevenue = playerCosts.reduce((sum, pc) => sum + pc.totalCost, 0);

        container.innerHTML = `
            <div class="summary-grid">
                ${playerCosts.map(playerCost => `
                    <div class="summary-card fade-in">
                        <div class="summary-header">
                            <span class="player-summary-name">
                                <i class="fas fa-user"></i> ${this.escapeHtml(playerCost.player.name)}
                                ${playerCost.player.type === 'transient' ? '<span style="color: var(--warning-color); font-size: 0.8em;">(+10K)</span>' : ''}
                            </span>
                            <span class="player-total">${this.formatCurrency(playerCost.totalCost)}</span>
                        </div>
                        <div class="session-breakdown">
                            ${playerCost.sessions.map(session => `
                                <div class="session-item">
                                    <span class="session-name">${this.escapeHtml(session.sessionName)}</span>
                                    <span class="session-amount">${this.formatCurrency(session.cost)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="cost-item" style="background: linear-gradient(45deg, var(--accent-color), #059669); color: white; padding: 1.5rem; text-align: center; margin-top: 1rem;">
                <div class="cost-label" style="color: rgba(255,255,255,0.8); font-size: 1rem;">Total Revenue (${this.sessions.length} sessions)</div>
                <div class="cost-value" style="color: white; font-size: 2rem; font-weight: 700;">${this.formatCurrency(totalRevenue)}</div>
            </div>
        `;

        // Show QR code section if there are costs to pay
        if (totalRevenue > 0) {
            this.generateQRCode(totalRevenue);
            document.getElementById('qrSection').style.display = 'block';
        } else {
            document.getElementById('qrSection').style.display = 'none';
        }
    }

    generateQRCode(amount) {
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = ''; // Clear previous QR code

        // Create payment information
        const paymentInfo = `Bank: ${this.settings.bankName || 'Not set'}\nAccount: ${this.settings.accountNumber || 'Not set'}\nHolder: ${this.settings.accountHolder || 'Not set'}\nAmount: ${this.formatCurrency(amount)}\nPurpose: Badminton Court Fee`;

        // Generate QR code
        QRCode.toCanvas(qrContainer, paymentInfo, {
            width: 200,
            height: 200,
            colorDark: '#1e293b',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        }, (error) => {
            if (error) {
                console.error('QR Code generation failed:', error);
                qrContainer.innerHTML = '<p>QR Code generation failed</p>';
            }
        });

        // Update bank info display
        document.getElementById('bankInfo').innerHTML = `
            <strong>Bank:</strong> ${this.settings.bankName || 'Not set'}<br>
            <strong>Account:</strong> ${this.settings.accountNumber || 'Not set'}<br>
            <strong>Holder:</strong> ${this.settings.accountHolder || 'Not set'}<br>
            <strong>Total Amount:</strong> ${this.formatCurrency(amount)}
        `;
    }

    render() {
        this.renderPlayers();
        this.renderSessions();
        this.updateSummary();
    }

    // Settings management
    openSettings() {
        document.getElementById('settingsModal').style.display = 'block';
        document.getElementById('bankName').value = this.settings.bankName;
        document.getElementById('accountNumber').value = this.settings.accountNumber;
        document.getElementById('accountHolder').value = this.settings.accountHolder;
    }

    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    saveSettings() {
        this.settings.bankName = document.getElementById('bankName').value.trim();
        this.settings.accountNumber = document.getElementById('accountNumber').value.trim();
        this.settings.accountHolder = document.getElementById('accountHolder').value.trim();
        
        this.saveData();
        this.updateSummary(); // Refresh QR code with new settings
        this.closeSettings();
        
        // Show success message
        this.showNotification('Settings saved successfully!', 'success');
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--accent-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML event handlers
function addPlayer() {
    app.addPlayer();
}

function savePlayer() {
    app.savePlayer();
}

function cancelAddPlayer() {
    app.cancelAddPlayer();
}

function addSession() {
    app.addSession();
}

function openSettings() {
    app.openSettings();
}

function closeSettings() {
    app.closeSettings();
}

function saveSettings() {
    app.saveSettings();
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ShuttleSplit();
    
    // Add some sample data for demonstration (comment out in production)
    if (app.players.length === 0) {
        // Uncomment the lines below to add sample data
        /*
        app.players = [
            { id: 1, name: 'John Doe', type: 'fixed' },
            { id: 2, name: 'Jane Smith', type: 'transient' },
            { id: 3, name: 'Mike Johnson', type: 'fixed' }
        ];
        app.sessions = [
            { id: 1, name: 'Session 1', date: '2025-09-01' },
            { id: 2, name: 'Session 2', date: '2025-09-02' }
        ];
        app.saveData();
        app.render();
        */
    }
});

// Handle modal clicks
document.addEventListener('click', (e) => {
    const modal = document.getElementById('settingsModal');
    if (e.target === modal) {
        app.closeSettings();
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        app.closeSettings();
        app.cancelAddPlayer();
    }
    
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        app.saveData();
        app.showNotification('Data saved!', 'success');
    }
});

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.saveData();
    }
});
