const Database = {
    // User Management
    saveUser: function(userData) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
    },

    getUser: function(email, password) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(user => user.email === email && user.password === password);
    },

    // Quiz Data Management
    saveQuizData: function(userId, quizData) {
        let quizResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
        quizResults[userId] = quizData;
        localStorage.setItem('quizResults', JSON.stringify(quizResults));
    },

    getQuizData: function(userId) {
        let quizResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
        return quizResults[userId];
    },

    // Messages Management
    saveMessage: function(fromId, toId, message) {
        let messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push({
            from: fromId,
            to: toId,
            message: message,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('messages', JSON.stringify(messages));
    },

    getMessages: function(userId) {
        let messages = JSON.parse(localStorage.getItem('messages') || '[]');
        return messages.filter(msg => msg.to === userId || msg.from === userId);
    }
};
