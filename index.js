const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const DB_FILE = 'data.json';
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create public directory if it doesn't exist
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR);
}

// Database functions
function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        return { users: {}, projects: {} };
    }
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
        return { users: {}, projects: {} };
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Serve frontend
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MaxFilm - Professional Production Software</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #e5e5e5;
            height: 100vh;
            overflow: hidden;
        }

        .screen { display: none; }
        .screen.active { display: flex; }

        /* LOGIN SCREEN */
        .auth-screen {
            width: 100%;
            height: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
        }

        .auth-box {
            width: 100%;
            max-width: 400px;
            padding: 40px;
            background: #131313;
            border: 1px solid #1a1a1a;
        }

        .auth-box h1 {
            font-size: 28px;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }

        .auth-box p {
            color: #666666;
            font-size: 12px;
            margin-bottom: 24px;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-group label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }

        .form-group input {
            width: 100%;
            padding: 10px;
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            color: #e5e5e5;
            font-size: 14px;
        }

        .form-group input:focus {
            outline: none;
            border-color: #2a2a2a;
            background: #1a1a1a;
        }

        .auth-btn {
            width: 100%;
            padding: 10px;
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            color: #ffffff;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }

        .auth-btn:hover {
            background: #2a2a2a;
        }

        .toggle-auth {
            text-align: center;
            font-size: 12px;
            color: #666666;
        }

        .toggle-auth a {
            color: #999999;
            cursor: pointer;
            text-decoration: underline;
        }

        /* APP */
        .app-container {
            display: flex;
            width: 100%;
            height: 100%;
        }

        .sidebar {
            width: 220px;
            background: #131313;
            border-right: 1px solid #1a1a1a;
            display: flex;
            flex-direction: column;
        }

        .sidebar-header {
            padding: 16px;
            border-bottom: 1px solid #1a1a1a;
        }

        .sidebar-header h2 {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .sidebar-content {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
        }

        .sidebar-btn {
            width: 100%;
            padding: 8px;
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            color: #999999;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .sidebar-btn.active {
            background: #1a1a1a;
            border-color: #2a2a2a;
            color: #ffffff;
        }

        .logout-btn {
            margin-top: auto;
            padding: 12px;
            background: #2a1515;
            border: 1px solid #3a2020;
            color: #bb5555;
            cursor: pointer;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
        }

        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .header {
            padding: 16px;
            background: #0a0a0a;
            border-bottom: 1px solid #1a1a1a;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h3 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        .btn {
            padding: 8px 12px;
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn:hover {
            background: #2a2a2a;
        }

        .content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #0a0a0a;
        }

        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        }

        .project-card {
            background: #131313;
            border: 1px solid #1a1a1a;
            padding: 16px;
            cursor: pointer;
        }

        .project-card:hover {
            background: #1a1a1a;
            border-color: #2a2a2a;
        }

        .project-card h4 {
            font-size: 14px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .project-card-actions {
            display: flex;
            gap: 4px;
        }

        .project-card-actions button {
            flex: 1;
            padding: 6px;
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            color: #999999;
            font-size: 9px;
            cursor: pointer;
            text-transform: uppercase;
        }

        .tabs {
            display: flex;
            gap: 0;
            border-bottom: 1px solid #1a1a1a;
            margin-bottom: 16px;
        }

        .tab {
            padding: 10px 16px;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: #666666;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tab.active {
            color: #ffffff;
            border-bottom-color: #ffffff;
        }

        .screenplay-wrapper {
            display: flex;
            gap: 12px;
            height: 100%;
        }

        .screenplay-sidebar {
            width: 200px;
            background: #131313;
            border: 1px solid #1a1a1a;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }

        .screenplay-sidebar h4 {
            padding: 8px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #555555;
            border-bottom: 1px solid #1a1a1a;
            letter-spacing: 0.8px;
        }

        .scene-item {
            padding: 6px 8px;
            font-size: 10px;
            color: #999999;
            border-bottom: 1px solid #0a0a0a;
            cursor: pointer;
        }

        .scene-item:hover {
            background: #1a1a1a;
        }

        .screenplay-editor {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #131313;
            border: 1px solid #1a1a1a;
        }

        .screenplay-controls {
            padding: 8px;
            border-bottom: 1px solid #1a1a1a;
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }

        .screenplay-controls button {
            padding: 6px 10px;
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            color: #999999;
            font-size: 9px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
        }

        .screenplay-controls button:hover {
            background: #1a1a1a;
        }

        .screenplay-text {
            flex: 1;
            background: #0a0a0a;
            color: #e5e5e5;
            padding: 24px 48px;
            border: none;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.8;
            resize: none;
        }

        .screenplay-text:focus {
            outline: none;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #1a1a1a;
        }

        .data-table th {
            background: #1a1a1a;
            padding: 8px;
            text-align: left;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: 1px solid #1a1a1a;
        }

        .data-table td {
            padding: 8px;
            border-bottom: 1px solid #1a1a1a;
            font-size: 12px;
        }

        .data-table input {
            width: 100%;
            background: transparent;
            border: none;
            color: #e5e5e5;
            font-size: 11px;
        }

        .data-table input:focus {
            outline: none;
            background: #1a1a1a;
        }

        .storyboards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 12px;
        }

        .storyboard-card {
            background: #131313;
            border: 1px solid #1a1a1a;
        }

        .storyboard-image {
            width: 100%;
            aspect-ratio: 16/9;
            background: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-bottom: 1px solid #1a1a1a;
        }

        .storyboard-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .storyboard-notes {
            padding: 8px;
        }

        .storyboard-notes textarea {
            width: 100%;
            background: #0a0a0a;
            color: #e5e5e5;
            padding: 6px;
            border: 1px solid #1a1a1a;
            font-size: 10px;
            min-height: 40px;
        }

        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-thumb {
            background: #1a1a1a;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #2a2a2a;
        }

        input[type="file"] {
            display: none;
        }
    </style>
</head>
<body>
    <div id="authScreen" class="screen active">
        <div class="auth-screen">
            <div class="auth-box">
                <h1>MAXFILM</h1>
                <p>Professional Production Software</p>
                
                <div id="loginForm">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" placeholder="••••••••">
                    </div>
                    <button class="auth-btn" onclick="app.login()">Login</button>
                    <div class="toggle-auth">
                        Don't have an account? <a onclick="app.toggleAuth()">Sign Up</a>
                    </div>
                </div>

                <div id="signupForm" style="display: none;">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="signupEmail" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="signupPassword" placeholder="••••••••">
                    </div>
                    <button class="auth-btn" onclick="app.signup()">Create Account</button>
                    <div class="toggle-auth">
                        Already have an account? <a onclick="app.toggleAuth()">Login</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="appScreen" class="screen">
        <div class="app-container">
            <div class="sidebar">
                <div class="sidebar-header">
                    <h2>MAXFILM</h2>
                </div>
                <div class="sidebar-content">
                    <button class="sidebar-btn active" onclick="app.view('dashboard')">Dashboard</button>
                    <button class="sidebar-btn" onclick="app.view('new')">New Project</button>
                </div>
                <button class="logout-btn" onclick="app.logout()">Logout</button>
            </div>

            <div class="main-content">
                <div id="dashboardView">
                    <div class="header">
                        <h3>Your Projects</h3>
                        <button class="btn" onclick="app.newProject()">Create Project</button>
                    </div>
                    <div class="content">
                        <div class="dashboard" id="projectsList"></div>
                    </div>
                </div>

                <div id="editorView" style="display: none; flex-direction: column; flex: 1;">
                    <div class="header">
                        <h3 id="projectTitle">Project</h3>
                        <div class="header-actions">
                            <button class="btn" onclick="app.saveProject()">Save</button>
                            <button class="btn" onclick="app.exportProject()">Export</button>
                            <button class="btn" onclick="app.backToDashboard()">Back</button>
                        </div>
                    </div>

                    <div style="flex: 1; overflow: hidden;">
                        <div class="tabs">
                            <button class="tab active" onclick="app.switchTab('scripts')">Scripts</button>
                            <button class="tab" onclick="app.switchTab('storyboards')">Storyboards</button>
                            <button class="tab" onclick="app.switchTab('budget')">Budget</button>
                            <button class="tab" onclick="app.switchTab('shooting')">Shooting Plan</button>
                        </div>

                        <div id="scriptsTab" style="display: flex; flex: 1; padding: 12px;">
                            <div class="screenplay-wrapper">
                                <div class="screenplay-sidebar">
                                    <h4>Scenes</h4>
                                    <div id="scenesList"></div>
                                </div>
                                <div class="screenplay-editor">
                                    <div class="screenplay-controls">
                                        <button onclick="app.insertScene('EXT')">EXT</button>
                                        <button onclick="app.insertScene('INT')">INT</button>
                                        <button onclick="app.insertScene('ACTION')">ACTION</button>
                                        <button onclick="app.insertScene('CHARACTER')">CHARACTER</button>
                                        <button onclick="app.insertScene('DIALOGUE')">DIALOGUE</button>
                                        <button onclick="app.insertScene('PAREN')">PAREN</button>
                                    </div>
                                    <textarea id="scriptText" class="screenplay-text" placeholder="Start writing..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div id="storyboardsTab" style="display: none; overflow: auto; padding: 12px;">
                            <button class="btn" onclick="app.addStoryboard()">Add Frame</button>
                            <div class="storyboards-grid" id="storyboardsList" style="margin-top: 12px;"></div>
                        </div>

                        <div id="budgetTab" style="display: none; overflow: auto; padding: 12px;">
                            <button class="btn" onclick="app.addBudgetLine()">Add Line</button>
                            <table class="data-table" style="margin-top: 12px; width: 100%;">
                                <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
                                <tbody id="budgetList"></tbody>
                            </table>
                            <div style="margin-top: 12px; font-weight: 700;">Total: $<span id="budgetTotal">0.00</span></div>
                        </div>

                        <div id="shootingTab" style="display: none; overflow: auto; padding: 12px;">
                            <button class="btn" onclick="app.addShootingDay()">Add Day</button>
                            <table class="data-table" style="margin-top: 12px; width: 100%;">
                                <thead><tr><th>Date</th><th>Location</th><th>Scenes</th><th>Notes</th><th></th></tr></thead>
                                <tbody id="shootingList"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const app = {
            user: null,
            currentProject: null,
            projects: {},

            async init() {
                const saved = localStorage.getItem('user');
                if (saved) {
                    this.user = JSON.parse(saved);
                    this.showApp();
                    await this.loadProjects();
                }
            },

            toggleAuth() {
                const login = document.getElementById('loginForm');
                const signup = document.getElementById('signupForm');
                login.style.display = login.style.display === 'none' ? 'block' : 'none';
                signup.style.display = signup.style.display === 'none' ? 'block' : 'none';
            },

            async login() {
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (res.ok) {
                    this.user = { email };
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.showApp();
                    await this.loadProjects();
                } else {
                    alert('Invalid credentials');
                }
            },

            async signup() {
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;

                const res = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (res.ok) {
                    this.user = { email };
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.showApp();
                } else {
                    alert('Error creating account');
                }
            },

            logout() {
                localStorage.removeItem('user');
                location.reload();
            },

            showApp() {
                document.getElementById('authScreen').classList.remove('active');
                document.getElementById('appScreen').classList.add('active');
            },

            async loadProjects() {
                const res = await fetch(\`/api/projects/\${this.user.email}\`);
                this.projects = await res.json();
                this.renderDashboard();
            },

            view(v) {
                if (v === 'dashboard') {
                    document.getElementById('dashboardView').style.display = 'block';
                    document.getElementById('editorView').style.display = 'none';
                    this.renderDashboard();
                } else if (v === 'new') {
                    this.newProject();
                }
            },

            newProject() {
                const name = prompt('Project name:');
                if (!name) return;
                this.currentProject = {
                    id: Date.now(),
                    name,
                    scripts: '',
                    storyboards: [],
                    budget: [],
                    shooting: []
                };
                this.showEditor();
                this.renderEditor();
            },

            showEditor() {
                document.getElementById('dashboardView').style.display = 'none';
                document.getElementById('editorView').style.display = 'flex';
            },

            backToDashboard() {
                this.currentProject = null;
                this.view('dashboard');
            },

            renderDashboard() {
                const html = Object.values(this.projects).map(p => \`
                    <div class="project-card">
                        <h4>\${p.name}</h4>
                        <div class="project-card-actions">
                            <button onclick="app.openProject('\${p.id}')">Edit</button>
                            <button onclick="app.deleteProject('\${p.id}')">Delete</button>
                        </div>
                    </div>
                \`).join('');
                document.getElementById('projectsList').innerHTML = html || '<p style="color: #666;">No projects yet</p>';
            },

            openProject(id) {
                this.currentProject = this.projects[id];
                this.showEditor();
                this.renderEditor();
            },

            deleteProject(id) {
                if (!confirm('Delete project?')) return;
                fetch(\`/api/projects/\${this.user.email}/\${id}\`, { method: 'DELETE' });
                delete this.projects[id];
                this.renderDashboard();
            },

            renderEditor() {
                document.getElementById('projectTitle').textContent = this.currentProject.name;
                document.getElementById('scriptText').value = this.currentProject.scripts;
                this.updateScenesList();
                this.renderStoryboards();
                this.renderBudget();
                this.renderShooting();
            },

            updateScenesList() {
                const scenes = this.currentProject.scripts.split('\\n').filter(line => 
                    line.startsWith('INT.') || line.startsWith('EXT.')
                );
                document.getElementById('scenesList').innerHTML = scenes.map((s, i) => 
                    \`<div class="scene-item">\${i + 1}. \${s.slice(0, 30)}...</div>\`
                ).join('');
            },

            insertScene(type) {
                const text = document.getElementById('scriptText');
                let insert = '';
                if (type === 'EXT') insert = '\\nEXT. LOCATION - DAY\\n\\n';
                else if (type === 'INT') insert = '\\nINT. LOCATION - DAY\\n\\n';
                else if (type === 'ACTION') insert = '\\nACTION\\n';
                else if (type === 'CHARACTER') insert = '\\nCHARACTER\\n';
                else if (type === 'DIALOGUE') insert = '\\nDIALOGUE\\n';
                else if (type === 'PAREN') insert = '\\n(parenthetical)\\n';
                text.value += insert;
                this.currentProject.scripts = text.value;
                this.updateScenesList();
            },

            switchTab(tab) {
                document.querySelectorAll('[id$="Tab"]').forEach(t => t.style.display = 'none');
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.getElementById(tab + 'Tab').style.display = tab === 'scripts' ? 'flex' : 'block';
                event.target.classList.add('active');
            },

            addStoryboard() {
                this.currentProject.storyboards.push({ id: Date.now(), image: null, notes: '' });
                this.renderStoryboards();
            },

            renderStoryboards() {
                const html = this.currentProject.storyboards.map(s => \`
                    <div class="storyboard-card">
                        <label class="storyboard-image">
                            \${s.image ? \`<img src="\${s.image}">\` : 'Upload'}
                            <input type="file" accept="image/*" onchange="app.uploadStoryboard(\${s.id}, this)">
                        </label>
                        <div class="storyboard-notes">
                            <textarea placeholder="Notes" onchange="app.updateStoryNotes(\${s.id}, this.value)">\${s.notes}</textarea>
                        </div>
                    </div>
                \`).join('');
                document.getElementById('storyboardsList').innerHTML = html;
            },

            uploadStoryboard(id, input) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const sb = this.currentProject.storyboards.find(s => s.id === id);
                    if (sb) sb.image = e.target.result;
                    this.renderStoryboards();
                };
                reader.readAsDataURL(input.files[0]);
            },

            updateStoryNotes(id, notes) {
                const sb = this.currentProject.storyboards.find(s => s.id === id);
                if (sb) sb.notes = notes;
            },

            addBudgetLine() {
                this.currentProject.budget.push({ id: Date.now(), category: '', description: '', amount: 0 });
                this.renderBudget();
            },

            renderBudget() {
                const html = this.currentProject.budget.map(b => \`
                    <tr>
                        <td><input type="text" value="\${b.category}" onchange="app.updateBudget(\${b.id}, 'category', this.value)"></td>
                        <td><input type="text" value="\${b.description}" onchange="app.updateBudget(\${b.id}, 'description', this.value)"></td>
                        <td><input type="number" value="\${b.amount}" onchange="app.updateBudget(\${b.id}, 'amount', this.value)"></td>
                        <td><button onclick="app.deleteBudgetLine(\${b.id})" style="width: 100%; padding: 6px; background: #2a1515; color: #bb5555; border: 1px solid #3a2020; cursor: pointer; font-size: 9px;">Delete</button></td>
                    </tr>
                \`).join('');
                document.getElementById('budgetList').innerHTML = html;
                const total = this.currentProject.budget.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
                document.getElementById('budgetTotal').textContent = total.toFixed(2);
            },

            updateBudget(id, field, value) {
                const b = this.currentProject.budget.find(x => x.id === id);
                if (b) {
                    b[field] = field === 'amount' ? parseFloat(value) || 0 : value;
                    this.renderBudget();
                }
            },

            deleteBudgetLine(id) {
                this.currentProject.budget = this.currentProject.budget.filter(b => b.id !== id);
                this.renderBudget();
            },

            addShootingDay() {
                this.currentProject.shooting.push({ id: Date.now(), date: '', location: '', scenes: '', notes: '' });
                this.renderShooting();
            },

            renderShooting() {
                const html = this.currentProject.shooting.map(s => \`
                    <tr>
                        <td><input type="text" value="\${s.date}" onchange="app.updateShooting(\${s.id}, 'date', this.value)"></td>
                        <td><input type="text" value="\${s.location}" onchange="app.updateShooting(\${s.id}, 'location', this.value)"></td>
                        <td><input type="text" value="\${s.scenes}" onchange="app.updateShooting(\${s.id}, 'scenes', this.value)"></td>
                        <td><input type="text" value="\${s.notes}" onchange="app.updateShooting(\${s.id}, 'notes', this.value)"></td>
                        <td><button onclick="app.deleteShootingDay(\${s.id})" style="width: 100%; padding: 6px; background: #2a1515; color: #bb5555; border: 1px solid #3a2020; cursor: pointer; font-size: 9px;">Delete</button></td>
                    </tr>
                \`).join('');
                document.getElementById('shootingList').innerHTML = html;
            },

            updateShooting(id, field, value) {
                const s = this.currentProject.shooting.find(x => x.id === id);
                if (s) s[field] = value;
            },

            deleteShootingDay(id) {
                this.currentProject.shooting = this.currentProject.shooting.filter(s => s.id !== id);
                this.renderShooting();
            },

            async saveProject() {
                this.currentProject.scripts = document.getElementById('scriptText').value;
                await fetch(\`/api/projects/\${this.user.email}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: this.currentProject.id,
                        name: this.currentProject.name,
                        data: this.currentProject
                    })
                });
                alert('Project saved!');
            },

            exportProject() {
                const data = JSON.stringify(this.currentProject, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`\${this.currentProject.name}.json\`;
                a.click();
            }
        };

        app.init();
    </script>
</body>
</html>`);
});

// Auth Routes
app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;
    const db = loadDB();
    
    if (db.users[email]) {
        return res.status(400).json({ error: 'User exists' });
    }
    
    db.users[email] = { password, createdAt: new Date().toISOString() };
    saveDB(db);
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = loadDB();
    
    if (!db.users[email] || db.users[email].password !== password) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    res.json({ success: true, email });
});

// Project Routes
app.get('/api/projects/:email', (req, res) => {
    const db = loadDB();
    const projects = db.projects[req.params.email] || {};
    res.json(projects);
});

app.post('/api/projects/:email', (req, res) => {
    const { email } = req.params;
    const { id, name, data } = req.body;
    const db = loadDB();
    
    if (!db.projects[email]) db.projects[email] = {};
    db.projects[email][id] = { id, name, data, updatedAt: new Date().toISOString() };
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/projects/:email/:projectId', (req, res) => {
    const { email, projectId } = req.params;
    const db = loadDB();
    
    if (db.projects[email]) {
        delete db.projects[email][projectId];
        saveDB(db);
    }
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`MaxFilm running on http://localhost:${PORT}`);
});
