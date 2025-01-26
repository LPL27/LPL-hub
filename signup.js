document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    // Password strength validation
    if (!isPasswordStrong(password)) {
        alert('Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters');
        return;
    }

    const userData = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        password,
        userType
    };

    Database.saveUser(userData);
    
    // Store current user in session
    sessionStorage.setItem('currentUser', JSON.stringify(userData));

    // Redirect to appropriate quiz
    if (userType === 'client') {
        window.location.href = 'client-quiz.html';
    } else {
        window.location.href = 'advisor-quiz.html';
    }
});

// Password strength checker
document.getElementById('password').addEventListener('input', function(e) {
    const password = e.target.value;
    const strengthDiv = document.getElementById('password-strength');
    const strength = checkPasswordStrength(password);
    
    strengthDiv.className = 'password-strength';
    strengthDiv.classList.add(strength);
    strengthDiv.textContent = `Password Strength: ${strength}`;
});

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 2) return 'weak';
    if (strength < 4) return 'medium';
    return 'strong';
}

function isPasswordStrong(password) {
    return checkPasswordStrength(password) === 'strong';
}
