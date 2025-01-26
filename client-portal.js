class ClientPortal {
    constructor() {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        this.quizData = Database.getQuizData(this.currentUser.id);
        this.init();
    }

    async init() {
        this.loadUserInfo();
        this.setupEventListeners();
        this.loadInvitations();
        this.loadMessages();
        this.loadProfile();
        this.setupNavigation();
    }

    loadUserInfo() {
        document.getElementById('clientName').textContent = this.currentUser.name;
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-links li').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.id === 'logoutBtn') {
                    this.handleLogout();
                    return;
                }
                this.handleNavigation(link.dataset.view);
            });
        });

        // Chat input
        const chatInput = document.querySelector('.chat-input button');
        if (chatInput) {
            chatInput.addEventListener('click', () => this.sendMessage());
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleSettingsUpdate(e));
        }
    }

    loadInvitations() {
        const interactions = JSON.parse(localStorage.getItem('interactions') || '[]');
        const myInvitations = interactions.filter(i => 
            i.clientId === this.currentUser.id && 
            i.accepted === true
        );

        const container = document.querySelector('.invitations-list');
        container.innerHTML = '';

        if (myInvitations.length === 0) {
            container.innerHTML = `
                <div class="no-invitations">
                    <p>No advisor invitations yet</p>
                </div>
            `;
            return;
        }

        myInvitations.forEach(invitation => {
            const advisor = this.getAdvisorInfo(invitation.advisorId);
            const div = document.createElement('div');
            div.className = 'invitation-card';
            div.innerHTML = `
                <div class="advisor-info">
                    <h3>${advisor.name}</h3>
                    <p>${this.getAdvisorSummary(advisor)}</p>
                </div>
                <div class="invitation-actions">
                    <button class="accept-btn" data-advisor-id="${advisor.id}">
                        Accept
                    </button>
                    <button class="decline-btn" data-advisor-id="${advisor.id}">
                        Decline
                    </button>
                </div>
            `;

            container.appendChild(div);
        });

        // Update invitation count
        document.getElementById('invitationCount').textContent = myInvitations.length;
    }

    getAdvisorInfo(advisorId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.id === advisorId) || { name: 'Unknown Advisor' };
    }

    getAdvisorSummary(advisor) {
        const advisorQuizData = Database.getQuizData(advisor.id);
        return `
            <div class="advisor-summary">
                <p>Experience: ${advisorQuizData?.yearsExperience || 'N/A'} years</p>
                <p>Specialties: ${advisorQuizData?.specialties || 'N/A'}</p>
                <p>Client Satisfaction: ${advisorQuizData?.satisfaction || 'N/A'}/10</p>
            </div>
        `;
    }

    loadMessages() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const myMessages = messages.filter(m => 
            m.from === this.currentUser.id || 
            m.to === this.currentUser.id
        );

        // Group messages by conversation
        const conversations = {};
        myMessages.forEach(m => {
            const otherId = m.from === this.currentUser.id ? m.to : m.from;
            if (!conversations[otherId]) {
                conversations[otherId] = [];
            }
            conversations[otherId].push(m);
        });

        this.renderConversations(conversations);

        // Update unread count
        const unreadCount = myMessages.filter(m => 
            m.to === this.currentUser.id && !m.read
        ).length;
        document.getElementById('unreadCount').textContent = unreadCount;
    }

    renderConversations(conversations) {
        const container = document.querySelector('.conversations-list');
        container.innerHTML = '';

        Object.entries(conversations).forEach(([advisorId, messages]) => {
            const advisor = this.getAdvisorInfo(advisorId);
            const lastMessage = messages[messages.length - 1];
            const unreadCount = messages.filter(m => 
                m.to === this.currentUser.id && !m.read
            ).length;

            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.innerHTML = `
                <div class="conversation-info">
                    <h4>${advisor.name}</h4>
                    <p>${lastMessage.content.substring(0, 30)}...</p>
                </div>
                ${unreadCount ? `<span class="unread-badge">${unreadCount}</span>` : ''}
            `;

            div.addEventListener('click', () => this.openConversation(advisorId, messages));
            container.appendChild(div);
        });
    }

    loadProfile() {
        const profileSummary = document.querySelector('.profile-summary');
        const financialSummary = document.querySelector('.financial-summary');

        profileSummary.innerHTML = `
            <div class="profile-info">
                <h3>${this.currentUser.name}</h3>
                <p>Email: ${this.currentUser.email}</p>
                <p>Phone: ${this.currentUser.phone}</p>
            </div>
        `;

        financialSummary.innerHTML = `
            <div class="financial-info">
                <div class="info-card">
                    <h4>Assets</h4>
                    <p>Cash: $${this.quizData?.cashAmount || '0'}</p>
                    <p>Investments: $${this.quizData?.stocksValue || '0'}</p>
                    <p>Real Estate: $${this.quizData?.realEstateValue || '0'}</p>
                </div>
                <div class="info-card">
                    <h4>Liabilities</h4>
                    <p>Mortgage: $${this.quizData?.mortgageBalance || '0'}</p>
                    <p>Car Loan: $${this.quizData?.carLoanBalance || '0'}</p>
                    <p>Credit Cards: $${this.quizData?.creditCardDebt || '0'}</p>
                </div>
            </div>
        `;
    }

    handleLogout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    setupNavigation() {
        document.querySelectorAll('.nav-links li').forEach(link => {
            link.addEventListener('click', () => {
                if (link.id === 'logoutBtn') return;
                
                document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                document.querySelectorAll('.view-section').forEach(section => {
                    section.style.display = 'none';
                });
                document.getElementById(`${link.dataset.view}View`).style.display = 'block';
            });
        });
    }

    sendMessage() {
        const input = document.querySelector('.chat-input input');
        const content = input.value.trim();
        if (!content || !this.currentConversationWith) return;

        const message = {
            from: this.currentUser.id,
            to: this.currentConversationWith,
            content,
            timestamp: new Date().toISOString(),
            read: false
        };

        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));

        input.value = '';
        this.loadMessages();
        this.openConversation(this.currentConversationWith);
    }

    openConversation(advisorId, messages) {
        this.currentConversationWith = advisorId;
        const advisor = this.getAdvisorInfo(advisorId);
        
        const chatHeader = document.querySelector('.chat-header');
        chatHeader.innerHTML = `<h3>Chat with ${advisor.name}</h3>`;

        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.innerHTML = messages.map(m => `
            <div class="message ${m.from === this.currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">${m.content}</div>
                <div class="message-time">${new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');

        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Mark messages as read
        const updatedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        updatedMessages.forEach(m => {
            if (m.to === this.currentUser.id && m.from === advisorId) {
                m.read = true;
            }
        });
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        this.loadMessages();
    }
}

// Initialize the portal
document.addEventListener('DOMContentLoaded', () => {
    new ClientPortal();
});