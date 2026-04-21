// Form page

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function init() {
  const user = storage.getCurrentUser();
  const userInfo = document.getElementById('userInfo');
  const loginBtn = document.getElementById('loginBtn');
  const authWarning = document.getElementById('authWarning');
  const submitBtn = document.getElementById('submitBtn');
  const authorLine = document.getElementById('authorLine');
  const mySection = document.getElementById('mySection');

  if (user) {
    userInfo.style.display = 'flex';
    loginBtn.style.display = 'none';
    const dot = document.getElementById('headerAvatar');
    dot.textContent = user.displayName.charAt(0).toUpperCase();
    dot.style.background = user.color;
    document.getElementById('headerName').textContent = user.displayName;
    authorLine.textContent = 'Автор: ' + user.displayName;
    authorLine.style.display = 'block';
    mySection.style.display = 'block';
    renderMyProjects(user);
  } else {
    loginBtn.style.display = 'inline-flex';
    authWarning.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.title = 'Войдите чтобы добавить проект';
  }
}

function renderMyProjects(user) {
  const projects = storage.getUserProjects(user.displayName);
  const container = document.getElementById('myProjectsList');
  if (!projects.length) {
    container.innerHTML = '<div class="empty-text">У тебя пока нет проектов. Добавь первый!</div>';
    return;
  }
  container.innerHTML = '';
  projects.forEach(p => {
    const statusClass = p.done ? 'status-done' : 'status-progress';
    const statusText = p.done ? '✓ Завершён' : '⟳ В процессе';
    const shortDesc = p.description.length > 100 ? p.description.slice(0,100)+'…' : p.description;
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="card-clickable" style="cursor:pointer">
        <span class="project-status ${statusClass}">${statusText}</span>
        <h3 style="margin-top:8px">${esc(p.title)}</h3>
        <p><strong>Категория:</strong> ${esc(p.category)}</p>
        <p><strong>Дата:</strong> ${p.date}</p>
        <p style="color:var(--muted)">${esc(shortDesc)}</p>
        <p style="font-size:12px;color:var(--accent);margin-top:4px">Нажми для подробностей →</p>
      </div>
      <div class="card-buttons">
        <button class="btn btn-ghost btn-sm" onclick="toggleStatus(${p.id})">Сменить статус</button>
        <button class="btn btn-danger btn-sm" onclick="remove(${p.id})">Удалить</button>
      </div>
    `;
    card.querySelector('.card-clickable').addEventListener('click', () => openProjectModal(p, user));
    container.appendChild(card);
  });
}

function openProjectModal(p, user) {
  const isOwner = user && p.author === user.displayName;
  const color = p.authorColor || user?.color || '#7d8590';

  const statusEl = document.getElementById('pm-status');
  statusEl.className = 'project-status ' + (p.done ? 'status-done' : 'status-progress');
  statusEl.textContent = p.done ? '✓ Завершён' : '⟳ В процессе';

  document.getElementById('pm-title').textContent = p.title;
  document.getElementById('pm-category').textContent = p.category;
  document.getElementById('pm-date').textContent = p.date;
  document.getElementById('pm-desc').textContent = p.description;

  const linkWrap = document.getElementById('pm-link-wrap');
  if (p.link) {
    linkWrap.style.display = 'block';
    document.getElementById('pm-link').href = p.link;
    document.getElementById('pm-link-text').textContent = p.link;
  } else { linkWrap.style.display = 'none'; }

  const avatar = document.getElementById('pm-avatar');
  avatar.textContent = p.author.charAt(0).toUpperCase();
  avatar.style.background = color;
  document.getElementById('pm-author').textContent = p.author;

  const ownerBtns = document.getElementById('pm-owner-btns');
  if (isOwner) {
    ownerBtns.style.display = 'flex';
    document.getElementById('pm-toggle-btn').onclick = () => {
      storage.toggleStatus(p.id);
      closeProjectModal();
      renderMyProjects(user);
    };
    document.getElementById('pm-delete-btn').onclick = () => {
      if (!confirm('Удалить «' + p.title + '»?')) return;
      storage.deleteProject(p.id);
      closeProjectModal();
      renderMyProjects(user);
    };
  } else { ownerBtns.style.display = 'none'; }

  document.getElementById('projectModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  document.getElementById('projectModal').style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProjectModal(); });

function toggleStatus(id) {
  const user = storage.getCurrentUser();
  storage.toggleStatus(id);
  renderMyProjects(user);
}

function remove(id) {
  if (!confirm('Удалить этот проект?')) return;
  const user = storage.getCurrentUser();
  storage.deleteProject(id);
  renderMyProjects(user);
}

document.getElementById('projectForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const user = storage.getCurrentUser();
  if (!user) { alert('Войди в аккаунт!'); return; }

  const title       = document.getElementById('title').value.trim();
  const category    = document.getElementById('category').value.trim();
  const date        = document.getElementById('date').value;
  const description = document.getElementById('description').value.trim();
  const link        = document.getElementById('link').value.trim();
  const done        = document.getElementById('done').checked;

  if (!title || !category || !date || !description) {
    alert('Заполни все обязательные поля!'); return;
  }

  storage.addProject({ title, category, date, description, link, done, author: user.displayName, authorColor: user.color });

  this.reset();
  const btn = document.getElementById('submitBtn');
  btn.textContent = '✅ Сохранено!';
  btn.style.background = '#3fb950'; btn.style.color = '#fff';
  setTimeout(() => { btn.textContent = 'Сохранить проект'; btn.style.background = ''; btn.style.color = ''; }, 2000);
  renderMyProjects(user);
});

init();
