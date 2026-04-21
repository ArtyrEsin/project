const storage = (() => {
  const USERS_KEY    = 'hub_users';
  const PROJECTS_KEY = 'hub_projects';
  const SESSION_KEY  = 'hub_session';

  function hashPassword(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function getAllProjects() {
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      if (!data) return seedDemoData();
      return JSON.parse(data);
    } catch { return []; }
  }
  function saveAllProjects(arr) { localStorage.setItem(PROJECTS_KEY, JSON.stringify(arr)); }

  function register(username, password, color) {
    username = username.trim();
    if (!username || username.length < 2) return { ok: false, error: 'Имя минимум 2 символа' };
    if (username.length > 24)             return { ok: false, error: 'Имя не более 24 символов' };
    if (!password || password.length < 4) return { ok: false, error: 'Пароль минимум 4 символа' };
    const key = username.toLowerCase();
    const users = getUsers();
    if (users[key]) return { ok: false, error: 'Это имя уже занято' };
    users[key] = { displayName: username, passwordHash: hashPassword(password), color: color || '#00e5c3', createdAt: Date.now() };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ displayName: username, color: color || '#00e5c3' }));
    return { ok: true };
  }

  function login(username, password) {
    username = username.trim();
    if (!username || !password) return { ok: false, error: 'Заполни все поля' };
    const key = username.toLowerCase();
    const users = getUsers();
    if (!users[key]) return { ok: false, error: 'пароль не правильный' };
    if (users[key].passwordHash !== hashPassword(password)) return { ok: false, error: 'Неверный пароль' };
    const u = users[key];
    localStorage.setItem(SESSION_KEY, JSON.stringify({ displayName: u.displayName, color: u.color }));
    return { ok: true };
  }

  function logout() { localStorage.removeItem(SESSION_KEY); }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  }

  function getAllUsers() {
    return Object.values(getUsers()).map(u => ({ displayName: u.displayName, color: u.color }));
  }

  function getUserProjects(displayName) {
    return getAllProjects().filter(p => p.author === displayName);
  }

  function addProject(p) {
    const all = getAllProjects();
    p.id = Date.now() + Math.floor(Math.random() * 9999);
    p.createdAt = Date.now();
    all.unshift(p);
    saveAllProjects(all);
    return p;
  }

  function toggleStatus(id) {
    const user = getCurrentUser();
    if (!user) return false;
    const all = getAllProjects();
    const p = all.find(p => p.id === id && p.author === user.displayName);
    if (!p) return false;
    p.done = !p.done;
    saveAllProjects(all);
    return true;
  }

  function deleteProject(id) {
    const user = getCurrentUser();
    if (!user) return false;
    const all = getAllProjects();
    const idx = all.findIndex(p => p.id === id && p.author === user.displayName);
    if (idx === -1) return false;
    all.splice(idx, 1);
    saveAllProjects(all);
    return true;
  }

  function seedDemoData() {
    saveUsers(users);
    saveAllProjects(projects);
    return projects;
  }

  return { register, login, logout, getCurrentUser, getAllUsers, getAllProjects, getUserProjects, addProject, toggleStatus, deleteProject };
})();
