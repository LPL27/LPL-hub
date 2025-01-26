document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    const user = Database.getUser(email, password);
    
    if (user && user.userType === userType) {
        // Store current user in session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on user type
        if (userType === 'client') {
            window.location.href = 'client-portal.html';
        } else {
            window.location.href = 'advisor-portal.html';
        }
    } else {
        alert('Invalid credentials or user type!');
    }
});
