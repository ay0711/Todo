// Using Set to manage todos - each todo is stored as a stringified object
let todos = new Set();
let currentFilter = 'all';
let editingTodoId = null;
let currentUser = null;

// Todo class for structure
class Todo {
    constructor(text) {
        this.id = Date.now() + Math.random(); // Simple unique ID
        this.text = text.trim();
        this.completed = false;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

// Authentication check
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }
    currentUser = JSON.parse(user);
    document.getElementById('username').textContent = currentUser.username;
}

// Load todos from localStorage
function loadTodos() {
    const userTodos = localStorage.getItem(`todos_${currentUser.username}`);
    if (userTodos) {
        const todoArray = JSON.parse(userTodos);
        todos = new Set(todoArray.map(todo => JSON.stringify(todo)));
    }
}

// Save todos to localStorage
function saveTodos() {
    const todoArray = Array.from(todos).map(todo => JSON.parse(todo));
    localStorage.setItem(`todos_${currentUser.username}`, JSON.stringify(todoArray));
}

// Check if todo text already exists
function todoExists(text) {
    const normalizedText = text.trim().toLowerCase();
    for (const todoStr of todos) {
        const todo = JSON.parse(todoStr);
        if (todo.text.toLowerCase() === normalizedText) {
            return true;
        }
    }
    return false;
}

// Add new todo
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('Please enter a task!');
        return;
    }
    
    if (text.length > 200) {
        alert('Task is too long! Maximum 200 characters.');
        return;
    }
    
    // Check if todo already exists
    if (todoExists(text)) {
        alert('This task already exists! Please enter a different task.');
        return;
    }
    
    const newTodo = new Todo(text);
    
    // Add to Set
    todos.add(JSON.stringify(newTodo));
    
    // Clear input
    input.value = '';
    
    // Save and refresh
    saveTodos();
    renderTodos();
    updateStats();
    
    // Focus back on input for easy adding
    input.focus();
}

// Toggle todo completion
function toggleTodo(todoId) {
    const todoArray = Array.from(todos).map(todo => JSON.parse(todo));
    const todoIndex = todoArray.findIndex(todo => todo.id === todoId);
    
    if (todoIndex !== -1) {
        const todo = todoArray[todoIndex];
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        
        // Update Set
        const oldTodoStr = JSON.stringify(todoArray[todoIndex].completed ? 
            {...todo, completed: !todo.completed} : {...todo, completed: !todo.completed});
        
        // Remove old and add updated
        todos.delete(Array.from(todos).find(t => JSON.parse(t).id === todoId));
        todos.add(JSON.stringify(todo));
        
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Delete todo
function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const todoToDelete = Array.from(todos).find(t => JSON.parse(t).id === todoId);
        if (todoToDelete) {
            todos.delete(todoToDelete);
            saveTodos();
            renderTodos();
            updateStats();
        }
    }
}

// Start editing todo
function editTodo(todoId) {
    const todoStr = Array.from(todos).find(t => JSON.parse(t).id === todoId);
    if (todoStr) {
        const todo = JSON.parse(todoStr);
        editingTodoId = todoId;
        
        // Show edit form
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editTodoInput').value = todo.text;
        
        // Focus on edit input
        document.getElementById('editTodoInput').focus();
        
        // Scroll to edit form
        document.getElementById('editForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Save edited todo
function saveEdit() {
    if (!editingTodoId) return;
    
    const newText = document.getElementById('editTodoInput').value.trim();
    if (!newText) {
        alert('Please enter a task!');
        return;
    }
    
    if (newText.length > 200) {
        alert('Task is too long! Maximum 200 characters.');
        return;
    }
    
    // Check if the new text already exists (excluding current todo)
    const normalizedNewText = newText.toLowerCase();
    for (const todoStr of todos) {
        const todo = JSON.parse(todoStr);
        if (todo.id !== editingTodoId && todo.text.toLowerCase() === normalizedNewText) {
            alert('This task already exists! Please enter a different task.');
            return;
        }
    }
    
    // Find and update todo
    const todoStr = Array.from(todos).find(t => JSON.parse(t).id === editingTodoId);
    if (todoStr) {
        const todo = JSON.parse(todoStr);
        todo.text = newText;
        todo.updatedAt = new Date().toISOString();
        
        // Update Set
        todos.delete(todoStr);
        todos.add(JSON.stringify(todo));
        
        // Hide edit form
        cancelEdit();
        
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Cancel edit
function cancelEdit() {
    editingTodoId = null;
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('editTodoInput').value = '';
}

// Filter todos
function filterTodos(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderTodos();
}

// Render todos
function renderTodos() {
    const container = document.getElementById('todoContainer');
    const todoArray = Array.from(todos).map(todo => JSON.parse(todo));
    
    // Sort by: incomplete first, then by creation date (newest first)
    todoArray.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed - b.completed; // Incomplete first
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
    });
    
    // Filter todos
    let filteredTodos = todoArray;
    if (currentFilter === 'pending') {
        filteredTodos = todoArray.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todoArray.filter(todo => todo.completed);
    }
    
    if (filteredTodos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No ${currentFilter === 'all' ? '' : currentFilter} tasks</h3>
                <p>${currentFilter === 'all' ? 'Add your first task above to get started!' : 
                      currentFilter === 'pending' ? 'All tasks completed! 🎉' : 
                      'No completed tasks yet.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <div class="todo-content">
                <div class="todo-text-content">${escapeHtml(todo.text)}</div>
                <div class="todo-meta">
                    <span>Created: ${formatDate(todo.createdAt)}</span>
                    ${todo.updatedAt !== todo.createdAt ? 
                      `<span>Updated: ${formatDate(todo.updatedAt)}</span>` : ''}
                </div>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" onclick="editTodo(${todo.id})" 
                        ${todo.completed ? 'disabled' : ''}>Edit</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const todoArray = Array.from(todos).map(todo => JSON.parse(todo));
    const total = todoArray.length;
    const completed = todoArray.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    document.getElementById('totalTodos').textContent = total;
    document.getElementById('completedTodos').textContent = completed;
    document.getElementById('pendingTodos').textContent = pending;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'signin.html';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter to add todo (when input is focused)
    if (e.key === 'Enter' && document.getElementById('todoInput') === document.activeElement) {
        addTodo();
    }
    
    // Enter to save edit (when edit input is focused)
    if (e.key === 'Enter' && document.getElementById('editTodoInput') === document.activeElement) {
        saveEdit();
    }
    
    // Escape to cancel edit
    if (e.key === 'Escape' && editingTodoId) {
        cancelEdit();
    }
});

// Initialize app
window.addEventListener('load', function() {
    checkAuth();
    loadTodos();
    renderTodos();
    updateStats();
    
    // Focus on input
    document.getElementById('todoInput').focus();
});