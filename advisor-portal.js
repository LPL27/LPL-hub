class AdvisorPortal {
    constructor() {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        this.currentClientIndex = 0;
        this.clients = [];
        this.currentConversationWith = null;
        this.init();
    }

    async init() {
        this.loadUserInfo();
        this.setupEventListeners();
        await this.loadClients();
        this.setupNavigation();
        this.loadMessages();
    }

    loadUserInfo() {
        document.getElementById('advisorName').textContent = this.currentUser.name;
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

    async loadClients() {
        // Get all users from local storage
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Filter for clients that haven't been interacted with
        this.clients = allUsers.filter(user => 
            user.userType === 'client' && 
            !this.hasInteractedWith(user.id)
        );
        
        this.showNextClient();
    }

    hasInteractedWith(clientId) {
        const interactions = JSON.parse(localStorage.getItem('interactions') || '[]');
        return interactions.some(i => 
            i.advisorId === this.currentUser.id && 
            i.clientId === clientId
        );
    }

    showNextClient() {
        const currentCard = document.getElementById('currentCard');
        
        if (this.currentClientIndex >= this.clients.length) {
            currentCard.innerHTML = `
                <div class="no-more-clients">
                    <h3>No more potential clients</h3>
                    <p>Check back later for new matches</p>
                </div>
            `;
            return;
        }

        const client = this.clients[this.currentClientIndex];
        const clientQuizData = Database.getQuizData(client.id);

        currentCard.innerHTML = `
            <div class="client-info">
                <h3>${client.name}</h3>
                <div class="client-details">
                    <p><strong>Email:</strong> ${client.email}</p>
                    <p><strong>Annual Income:</strong> $${clientQuizData?.annualIncome || 'N/A'}</p>
                    <p><strong>Investment Goal:</strong> ${clientQuizData?.investmentPreference || 'N/A'}</p>
                    <p><strong>Risk Tolerance:</strong> ${clientQuizData?.riskTolerance || 'N/A'}</p>
                </div>
            </div>
            <div class="card-buttons">
                <button class="reject-btn" onclick="advisorPortal.handleClientDecision(false)">
                    <i class="fas fa-times"></i>
                </button>
                <button class="accept-btn" onclick="advisorPortal.handleClientDecision(true)">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `;
    }

    handleClientDecision(accepted) {
        const client = this.clients[this.currentClientIndex];
        
        if (!client) return;

        const interaction = {
            advisorId: this.currentUser.id,
            clientId: client.id,
            accepted,
            timestamp: new Date().toISOString()
        };

        // Save interaction
        const interactions = JSON.parse(localStorage.getItem('interactions') || '[]');
        interactions.push(interaction);
        localStorage.setItem('interactions', JSON.stringify(interactions));

        if (accepted) {
            // Show message modal when accepting a client
            this.showMessageModal(client);
        } else {
            // If rejected, just move to next client
            this.currentClientIndex++;
            this.showNextClient();
        }
    }

    showMessageModal(client) {
        // Create and show modal
        const modalHTML = `
            <div class="modal" id="messageModal">
                <div class="modal-content">
                    <h3>Send Introduction Message to ${client.name}</h3>
                    <textarea id="introMessage" rows="4" placeholder="Write your introduction message here..."
                    >${this.getDefaultMessage()}</textarea>
                    <div class="modal-buttons">
                        <button id="sendMessageBtn">Send Message</button>
                        <button id="cancelMessageBtn">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('messageModal');
        const sendBtn = document.getElementById('sendMessageBtn');
        const cancelBtn = document.getElementById('cancelMessageBtn');

        // Handle send button click
        sendBtn.addEventListener('click', () => {
            const messageContent = document.getElementById('introMessage').value;
            this.sendInitialMessage(client.id, messageContent);
            modal.remove();
            this.currentClientIndex++;
            this.showNextClient();
        });

        // Handle cancel button click
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            this.currentClientIndex++;
            this.showNextClient();
        });
    }

    getDefaultMessage() {
        return `Hi! I've reviewed your profile and would love to discuss how I can help with your financial goals. I specialize in providing personalized financial advice and would be happy to schedule a consultation to discuss your needs in detail.`;
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
    }

    renderConversations(conversations) {
        const container = document.querySelector('.conversations-list');
        if (!container) return;
        
        container.innerHTML = '';

        Object.entries(conversations).forEach(([userId, messages]) => {
            const user = this.getUserInfo(userId);
            const lastMessage = messages[messages.length - 1];
            const unreadCount = messages.filter(m => 
                m.to === this.currentUser.id && !m.read
            ).length;

            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.innerHTML = `
                <div class="conversation-info">
                    <h4>${user.name}</h4>
                    <p>${lastMessage.content.substring(0, 30)}...</p>
                </div>
                ${unreadCount ? `<span class="unread-badge">${unreadCount}</span>` : ''}
            `;

            div.addEventListener('click', () => this.openConversation(userId, messages));
            container.appendChild(div);
        });
    }

    openConversation(userId, messages) {
        this.currentConversationWith = userId;
        const user = this.getUserInfo(userId);
        
        const chatWindow = document.querySelector('.chat-window');
        if (!chatWindow) return;

        const chatMessages = chatWindow.querySelector('.chat-messages');
        chatMessages.innerHTML = messages.map(m => `
            <div class="message ${m.from === this.currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">${m.content}</div>
                <div class="message-time">${new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');

        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Mark messages as read
        this.markMessagesAsRead(userId);
    }

    markMessagesAsRead(userId) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        let hasUnread = false;
        
        messages.forEach(m => {
            if (m.to === this.currentUser.id && m.from === userId && !m.read) {
                m.read = true;
                hasUnread = true;
            }
        });

        if (hasUnread) {
            localStorage.setItem('messages', JSON.stringify(messages));
            this.loadMessages(); // Refresh the conversation list
        }
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

    sendInitialMessage(clientId, content) {
        const message = {
            from: this.currentUser.id,
            to: clientId,
            content: content,
            timestamp: new Date().toISOString(),
            read: false
        };

        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    getUserInfo(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.id === userId) || { name: 'Unknown User' };
    }

    handleNavigation(view) {
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        document.querySelectorAll('.view-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`${view}View`).style.display = 'block';
    }

    handleLogout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    handleSettingsUpdate(e) {
        e.preventDefault();
        // Implement settings update logic here
        alert('Settings updated successfully!');
    }
}

// Initialize the portal
let advisorPortal;
document.addEventListener('DOMContentLoaded', () => {
    advisorPortal = new AdvisorPortal();
});