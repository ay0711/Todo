// Using Set to manage user authentication
let users = new Set();

// Load existing users from localStorage
function loadUsers() {
    const storedUsers = localStorage.getItem('todoAppUsers');
    if (storedUsers) {
        const userArray = JSON.parse(storedUsers);
        users = new Set(userArray.map(user => JSON.stringify(user)));
    }
}

// Find user by username or email
function findUser(usernameOrEmail, password) {
    for (const userStr of users) {
        const user = JSON.parse(userStr);
        if ((user.username === usernameOrEmail || user.email === usernameOrEmail) && 
            user.password === password) {
            return user;
        }
    }
    return null;
}

// Display message
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'error' : 'success';
}

// Set current user session
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        email: user.email,
        loginTime: new Date().toISOString()
    }));
}

// Check if user is already logged in
function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'index.html';
    }
}

// Handle form submission
document.getElementById('signinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usernameOrEmail = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!usernameOrEmail || !password) {
        showMessage('Please fill in all fields.', true);
        return;
    }
    
    // Find and authenticate user
    const user = findUser(usernameOrEmail, password);
    
    if (user) {
        showMessage('Sign in successful! Redirecting to dashboard...');
        setCurrentUser(user);
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showMessage('Invalid username/email or password.', true);
    }
});

// Load users and check session when page loads
window.addEventListener('load', function() {
    loadUsers();
    checkExistingSession();
});