function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🔒';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}

function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    return {
        isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
        errors: {
            minLength,
            hasUpper,
            hasLower,
            hasNumber,
            hasSpecial
        },
        message: !minLength ? 'Password must be at least 8 characters long' :
                !hasUpper ? 'Password must contain an uppercase letter' :
                !hasLower ? 'Password must contain a lowercase letter' :
                !hasNumber ? 'Password must contain a number' :
                !hasSpecial ? 'Password must contain a special character (!@#$%^&*)' :
                ''
    };
}

function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showError('email', 'Please enter a valid email address');
        return false;
    }

    if (password.length < 8) {
        showError('password', 'Password must be at least 8 characters long');
        return false;
    }

    if (!validatePassword(password).isValid) {
        showError('password', 'Invalid password');
        return false;
    }

    // Dummy validation
    localStorage.setItem('user', JSON.stringify({ email }));
    window.location.href = 'dashboard.html';
}

function register(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const validation = validatePassword(password);
    if (!validation.isValid) {
        showPasswordStrength(validation.errors);
        return false;
    }

    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        return false;
    }

    // Dummy registration
    localStorage.setItem('user', JSON.stringify({ email }));
    window.location.href = 'dashboard.html';
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.parentElement;
    formGroup.classList.add('error');
    const validation = formGroup.querySelector('.validation-message');
    if (validation) {
        validation.textContent = message;
    }
}

function showPasswordStrength(validations) {
    const strengthEl = document.querySelector('.password-strength');
    const strengthText = document.querySelector('.strength-text');
    
    let strength = Object.values(validations).filter(Boolean).length;
    let color = ['#ff4343', '#ffa534', '#ffff34', '#4CAF50'][Math.floor(strength/1.25)];
    let text = ['Weak', 'Fair', 'Good', 'Strong'][Math.floor(strength/1.25)];
    
    strengthEl.style.width = `${strength * 25}%`;
    strengthEl.style.backgroundColor = color;
    strengthText.textContent = text;
}

// Real-time validation
if (document.getElementById('registerForm')) {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const formGroup = e.target.parentElement;
            formGroup.classList.remove('error');
            if (e.target.id === 'password') {
                showPasswordStrength(validatePassword(e.target.value).errors);
            }
        });
    });
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Check authentication
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && !window.location.href.includes('index.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'index.html';
    }
    
    const userEmail = document.getElementById('userEmail');
    if (userEmail && user) {
        userEmail.textContent = user.email;
    }
}

window.onload = checkAuth;
