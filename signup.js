// Using Set to store user data
let users = new Set();

// Load existing users from localStorage
function loadUsers() {
    const storedUsers = localStorage.getItem('todoAppUsers');
    if (storedUsers) {
        const userArray = JSON.parse(storedUsers);
        users = new Set(userArray.map(user => JSON.stringify(user)));
    }
}

// Save users to localStorage
function saveUsers() {
    const userArray = Array.from(users).map(user => JSON.parse(user));
    localStorage.setItem('todoAppUsers', JSON.stringify(userArray));
}

// Check if user exists
function userExists(username, email) {
    for (const userStr of users) {
        const user = JSON.parse(userStr);
        if (user.username === username || user.email === email) {
            return true;
        }
    }
    return false;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Display message
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'error' : 'success';
}

// Handle form submission
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields.', true);
        return;
    }
    
    if (username.length < 3) {
        showMessage('Username must be at least 3 characters long.', true);
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address.', true);
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', true);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match.', true);
        return;
    }
    
    // Check if user already exists
    if (userExists(username, email)) {
        showMessage('Username or email already exists.', true);
        return;
    }
    
    // Create new user
    const newUser = {
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    // Add user to Set
    users.add(JSON.stringify(newUser));
    saveUsers();
    
    showMessage('Account created successfully! Redirecting to sign in...');
    
    // Redirect to sign in page after 2 seconds
    setTimeout(() => {
        window.location.href = 'signin.html';
    }, 2000);
});

// Load users when page loads
window.addEventListener('load', loadUsers);