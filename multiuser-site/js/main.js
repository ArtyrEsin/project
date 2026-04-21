
const AVATAR_COLORS = ['#00e5c3','#5b8af0','#f472b6','#fb923c','#a78bfa','#34d399','#f87171','#fbbf24','#38bdf8','#e879f9'];
let selectedColor = AVATAR_COLORS[0];

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function $(id) { return document.getElementById(id); }

document.addEventListener('DOMContentLoaded', function() {
  buildColorPicker();
  buildDemoUsers();
  bindEvents();
  applyUserState();
  populateUserFilter();
  filterProjects();
});

function bindEvents() {
  
  $('loginBtn').addEventListener('click', () => showModal('login'));
  $('logoutBtn').addEventListener('click', () => { storage.logout(); location.reload(); });
  $('heroRegBtn').addEventListener('click', () => showModal('register'));

  $('authClose').addEventListener('click', hideModal);
  $('authModal').addEventListener('click', e => { if (e.target === $('authModal')) hideModal(); });
  $('tabLogin').addEventListener('click', () => switchTab('login'));
  $('tabRegister').addEventListener('click', () => switchTab('register'));
  $('doLoginBtn').addEventListener('click', doLogin);
  $('doRegBtn').addEventListener('click', doRegister);

  $('toggleLogin').addEventListener('click', () => togglePw('loginPass', $('toggleLogin')));
  $('toggleReg1').addEventListener('click',  () => togglePw('regPass',  $('toggleReg1')));
  $('toggleReg2').addEventListener('click',  () => togglePw('regPass2', $('toggleReg2')));

  $('loginName').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('regName').addEventListener('keydown',   e => { if (e.key === 'Enter') doRegister(); });
  $('regPass').addEventListener('keydown',   e => { if (e.key === 'Enter') doRegister(); });
  $('regPass2').addEventListener('keydown',  e => { if (e.key === 'Enter') doRegister(); });

  // 
  $('searchInput').addEventListener('input', filterProjects);
  $('statusFilter').addEventListener('change', filterProjects);
  $('userFilter').addEventListener('change', filterProjects);

  $('pmClose').addEventListener('click', closeProjectModal);
  $('pmCloseFooter').addEventListener('click', closeProjectModal);
  $('projectModal').addEventListener('click', e => { if (e.target === $('projectModal')) closeProjectModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProjectModal(); hideModal(); }
  });
}

function applyUserState() {
  const user = storage.getCurrentUser();
  if (user) {
    $('userInfo').style.display = 'flex';
    $('loginBtn').style.display = 'none';
    const dot = $('headerAvatar');
    dot.textContent = user.displayName.charAt(0).toUpperCase();
    dot.style.background = user.color;
    $('headerName').textContent = user.displayName;
  } else {
    $('userInfo').style.display = 'none';
    $('loginBtn').style.display = 'inline-flex';
  }
}

function updateStats(all) {
  $('statUsers').textContent    = storage.getAllUsers().length;
  $('statProjects').textContent = all.length;
  $('statDone').textContent     = all.filter(p => p.done).length;
}

function populateUserFilter() {
  const sel = $('userFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="all">Все авторы</option>';
  storage.getAllUsers().forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.displayName;
    opt.textContent = u.displayName;
    sel.appendChild(opt);
  });
  sel.value = cur || 'all';
}

function filterProjects() {
  const text    = $('searchInput').value.toLowerCase();
  const status  = $('statusFilter').value;
  const userVal = $('userFilter').value;
  const all     = storage.getAllProjects();

  const filtered = all.filter(p => {
    const matchText   = (p.title + ' ' + p.author + ' ' + p.category).toLowerCase().includes(text);
    const matchStatus = status === 'all' || (status === 'done' ? p.done : !p.done);
    const matchUser   = userVal === 'all' || p.author === userVal;
    return matchText && matchStatus && matchUser;
  });

  updateStats(all);
  $('countText').textContent = 'Найдено: ' + filtered.length;
  drawProjects(filtered);
}

function drawProjects(list) {
  const container = $('projectsList');
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<div class="empty-text">😶 Ничего не найдено. Попробуй изменить фильтры.</div>';
    return;
  }

  const currentUser = storage.getCurrentUser();

  list.forEach(p => {
    const isOwner     = currentUser && p.author === currentUser.displayName;
    const color       = p.authorColor || '#7d8590';
    const initial     = p.author.charAt(0).toUpperCase();
    const statusClass = p.done ? 'status-done' : 'status-progress';
    const statusText  = p.done ? '✓ Завершён' : '⟳ В процессе';
    const shortDesc   = p.description.length > 90 ? p.description.slice(0, 90) + '…' : p.description;

    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="card-clickable">
        <div class="card-top">
          <span class="project-status ${statusClass}">${statusText}</span>
          <div class="card-author">
            <div class="avatar-dot" style="background:${color};width:18px;height:18px;font-size:9px">${initial}</div>
            ${esc(p.author)}
          </div>
        </div>
        <h3>${esc(p.title)}</h3>
        <p><strong>Категория:</strong> ${esc(p.category)}</p>
        <p><strong>Дата:</strong> ${p.date}</p>
        <p style="color:var(--muted);margin-top:4px">${esc(shortDesc)}</p>
        <p style="font-size:12px;color:var(--accent);margin-top:6px">Нажми для подробностей →</p>
      </div>
      ${isOwner ? `<div class="card-buttons">
        <button type="button" class="btn btn-ghost btn-sm toggle-btn" data-id="${p.id}">Сменить статус</button>
        <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${p.id}">Удалить</button>
      </div>` : ''}
    `;

    card.querySelector('.card-clickable').addEventListener('click', () => openProjectModal(p));
    if (isOwner) {
      card.querySelector('.toggle-btn').addEventListener('click', e => { e.stopPropagation(); doToggle(p.id); });
      card.querySelector('.delete-btn').addEventListener('click', e => { e.stopPropagation(); doDelete(p.id); });
    }

    container.appendChild(card);
  });
}

function doToggle(id) {
  storage.toggleStatus(id);
  filterProjects();
}

function doDelete(id) {
  if (!confirm('Удалить этот проект?')) return;
  storage.deleteProject(id);
  populateUserFilter();
  filterProjects();
}

function showModal(tab) {
  $('authModal').style.display = 'flex';
  switchTab(tab || 'login');
  setTimeout(() => $('loginName').focus(), 80);
}

function hideModal() {
  $('authModal').style.display = 'none';
  $('loginError').textContent = '';
  $('regError').textContent = '';
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  $('loginForm').style.display    = isLogin ? 'block' : 'none';
  $('registerForm').style.display = isLogin ? 'none'  : 'block';
  $('tabLogin').classList.toggle('active', isLogin);
  $('tabRegister').classList.toggle('active', !isLogin);
}

function doLogin() {
  const res = storage.login($('loginName').value, $('loginPass').value);
  if (!res.ok) { $('loginError').textContent = res.error; return; }
  hideModal();
  applyUserState();
  populateUserFilter();
  filterProjects();
}

function doRegister() {
  const name  = $('regName').value;
  const pass  = $('regPass').value;
  const pass2 = $('regPass2').value;
  if (pass !== pass2) { $('regError').textContent = 'Пароли не совпадают'; return; }
  const res = storage.register(name, pass, selectedColor);
  if (!res.ok) { $('regError').textContent = res.error; return; }
  hideModal();
  applyUserState();
  populateUserFilter();
  filterProjects();
}

function togglePw(inputId, btn) {
  const inp = $(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function buildColorPicker() {
  const container = $('colorPicker');
  AVATAR_COLORS.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'avatar-color-btn' + (i === 0 ? ' selected' : '');
    btn.style.background = c;
    btn.addEventListener('click', () => {
      selectedColor = c;
      container.querySelectorAll('.avatar-color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    container.appendChild(btn);
  });
}

function buildDemoUsers() {
  const container = $('demoUsers');
  [
  
  ].forEach(d => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'user-chip';
    btn.innerHTML = `<div class="avatar-dot" style="background:${d.color};width:20px;height:20px;font-size:10px">${d.name[0]}</div>${d.name}`;
    btn.addEventListener('click', () => {
      $('loginName').value = d.name;
      $('loginPass').value = '1234';
      doLogin();
    });
    container.appendChild(btn);
  });
}

function openProjectModal(p) {
  const user    = storage.getCurrentUser();
  const isOwner = user && p.author === user.displayName;
  const color   = p.authorColor || '#7d8590';

  const statusEl = $('pm-status');
  statusEl.className   = 'project-status ' + (p.done ? 'status-done' : 'status-progress');
  statusEl.textContent = p.done ? '✓ Завершён' : '⟳ В процессе';

  $('pm-title').textContent    = p.title;
  $('pm-category').textContent = p.category;
  $('pm-date').textContent     = p.date;
  $('pm-desc').textContent     = p.description;

  if (p.link) {
    $('pm-link-wrap').style.display = 'block';
    $('pm-link').href = p.link;
    $('pm-link-text').textContent = p.link;
  } else {
    $('pm-link-wrap').style.display = 'none';
  }

  const avatar = $('pm-avatar');
  avatar.textContent    = p.author.charAt(0).toUpperCase();
  avatar.style.background = color;
  $('pm-author').textContent = p.author;

  const ownerBtns = $('pm-owner-btns');
  if (isOwner) {
    ownerBtns.style.display = 'flex';
    $('pm-toggle-btn').onclick = () => { storage.toggleStatus(p.id); closeProjectModal(); filterProjects(); };
    $('pm-delete-btn').onclick = () => {
      if (!confirm('Удалить «' + p.title + '»?')) return;
      storage.deleteProject(p.id);
      closeProjectModal();
      populateUserFilter();
      filterProjects();
    };
  } else {
    ownerBtns.style.display = 'none';
  }

  $('projectModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  $('projectModal').style.display = 'none';
  document.body.style.overflow = '';
}
