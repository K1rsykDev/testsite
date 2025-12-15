const state = JSON.parse(localStorage.getItem('bf-state')) || {
  user: { role: 'guest', name: 'Stranger', applicationId: null },
  applications: [],
  contracts: [],
  news: [
    { id: 'n1', date: '2024-12-01', title: 'Blood Family сезон відкрито', body: 'Новий набір, нові виклики та винагороди.' }
  ],
  giveaways: [
    { id: 'g1', condition: 'Зроби 1 контракт', timer: 3, prize: '$100 000' }
  ]
};

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const roleBadge = document.getElementById('roleBadge');
const statusMessage = document.getElementById('statusMessage');
const currentRole = document.getElementById('currentRole');

function persist() {
  localStorage.setItem('bf-state', JSON.stringify(state));
}

function setRole(role) {
  state.user.role = role;
  persist();
  updateUI();
}

function setStatusMessage(message) {
  statusMessage.textContent = message || '';
}

function activateSection(id) {
  pages.forEach((p) => p.classList.toggle('active', p.id === id));
  navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === id));
  if (nav.classList.contains('open')) nav.classList.remove('open');
}

function renderApplications() {
  const wrap = document.getElementById('adminApplications');
  const statusBox = document.getElementById('applicationStatus');
  wrap.innerHTML = '';

  if (state.applications.length === 0) {
    wrap.innerHTML = '<p class="muted">Немає заявок</p>';
  }

  state.applications.forEach((app) => {
    const card = document.createElement('div');
    card.className = 'card subtle';
    card.innerHTML = `
      <div class="card-header">
        <strong>${app.nickname}</strong>
        <span class="badge">${app.status}</span>
      </div>
      <p class="muted">Timezone: ${app.timezone}</p>
      <p class="muted">Грає: ${app.playtime}</p>
      <p>${app.reason}</p>
      <div class="role-actions">
        <button class="btn primary" data-action="approve">Схвалити</button>
        <button class="btn ghost" data-action="reject">Відхилити</button>
      </div>
    `;

    card.querySelector('[data-action="approve"]').onclick = () => approveApplication(app.id);
    card.querySelector('[data-action="reject"]').onclick = () => rejectApplication(app.id);
    wrap.appendChild(card);
  });

  const myApp = state.user.applicationId
    ? state.applications.find((a) => a.id === state.user.applicationId)
    : null;

  if (myApp) {
    statusBox.innerHTML = `Статус твоєї заявки: <strong>${myApp.status}</strong>`;
  } else {
    statusBox.textContent = 'Ще немає активної заявки.';
  }

  document.getElementById('appCount').textContent = state.applications.length;
}

function approveApplication(id) {
  const app = state.applications.find((a) => a.id === id);
  if (!app) return;
  app.status = 'approved';
  state.user.role = 'member';
  state.user.applicationId = id;
  persist();
  updateUI();
}

function rejectApplication(id) {
  const app = state.applications.find((a) => a.id === id);
  if (!app) return;
  app.status = 'rejected';
  if (state.user.applicationId === id) {
    state.user.role = 'guest';
  }
  persist();
  updateUI();
}

function renderContracts() {
  const list = document.getElementById('contractList');
  const adminList = document.getElementById('adminContractList');
  list.innerHTML = '';
  adminList.innerHTML = '';

  const renderCard = (contract) => `
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">${contract.description}</h4>
        <span class="badge">${contract.status === 'paid' ? 'Виплачено' : 'Очікує'}</span>
      </div>
      <p class="muted">Сума: $${contract.amount}</p>
      <p class="muted">Користувач: ${contract.user}</p>
    </div>`;

  if (state.contracts.length === 0) {
    list.innerHTML = '<p class="muted">Контрактів немає</p>';
    adminList.innerHTML = '<p class="muted">Контрактів немає</p>';
  } else {
    state.contracts.forEach((c) => {
      list.insertAdjacentHTML('beforeend', renderCard(c));
      adminList.insertAdjacentHTML('beforeend', renderCard(c));
    });
  }

  document.getElementById('adminContractCount').textContent = state.contracts.length;
}

function renderNews() {
  const list = document.getElementById('newsList');
  const adminList = document.getElementById('adminNewsList');
  list.innerHTML = '';
  adminList.innerHTML = '';

  if (state.news.length === 0) {
    list.innerHTML = '<p class="muted">Новин поки немає</p>';
    adminList.innerHTML = '<p class="muted">Новин поки немає</p>';
    return;
  }

  state.news.forEach((item) => {
    const card = `
      <div class="card">
        <div class="card-header">
          <span class="pill">${item.date}</span>
          <strong>${item.title}</strong>
        </div>
        <p>${item.body}</p>
      </div>`;
    list.insertAdjacentHTML('beforeend', card);
    adminList.insertAdjacentHTML('beforeend', card);
  });
}

function renderGiveaways() {
  const list = document.getElementById('giveawayList');
  const adminList = document.getElementById('adminGiveawayList');
  list.innerHTML = '';
  adminList.innerHTML = '';

  if (state.giveaways.length === 0) {
    list.innerHTML = '<p class="muted">Розіграшів немає</p>';
    adminList.innerHTML = '<p class="muted">Розіграшів немає</p>';
    return;
  }

  state.giveaways.forEach((g) => {
    const card = `
      <div class="card">
        <div class="card-header">
          <strong>${g.condition}</strong>
          <span class="badge">${g.timer} днів</span>
        </div>
        <p class="muted">Приз: ${g.prize}</p>
      </div>`;
    list.insertAdjacentHTML('beforeend', card);
    adminList.insertAdjacentHTML('beforeend', card);
  });
}

function updateVisibility() {
  const role = state.user.role;
  const isMember = role === 'member' || role === 'admin';
  const isAdmin = role === 'admin';

  document.querySelectorAll('.protected').forEach((el) => {
    el.style.display = isMember ? '' : 'none';
  });

  document.querySelectorAll('.admin-only').forEach((el) => {
    el.style.display = isAdmin ? '' : 'none';
  });

  const restrictedPages = ['contracts', 'news', 'giveaways'];
  if (!isMember && restrictedPages.includes(document.querySelector('.page.active').id)) {
    activateSection('home');
  }

  roleBadge.textContent = role.toUpperCase();
  currentRole.textContent = role;

  if (role === 'guest') {
    setStatusMessage('Гість бачить лише головну та заявку.');
  } else if (role === 'applicant') {
    setStatusMessage('Заявка очікує перевірки.');
  } else if (role === 'member') {
    setStatusMessage('Ти схвалений учасник! Доступні контракти, новини, розіграші.');
  } else if (role === 'admin') {
    setStatusMessage('Адмін має повний доступ до панелі керування.');
  }
}

function updateUI() {
  renderApplications();
  renderContracts();
  renderNews();
  renderGiveaways();
  updateVisibility();
  persist();
}

function initNavigation() {
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;
      activateSection(target);
    });
  });

  document.querySelectorAll('[data-section]').forEach((btn) => {
    if (btn.tagName === 'A') return;
    btn.addEventListener('click', () => activateSection(btn.dataset.section));
  });

  burger.addEventListener('click', () => nav.classList.toggle('open'));
}

function initForms() {
  document.getElementById('joinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const id = crypto.randomUUID();
    state.applications.push({
      id,
      ...data,
      status: 'pending'
    });
    state.user.role = 'applicant';
    state.user.applicationId = id;
    persist();
    updateUI();
    e.target.reset();
    activateSection('home');
  });

  document.getElementById('contractForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    state.contracts.unshift({
      id: crypto.randomUUID(),
      amount: data.amount,
      description: data.description,
      status: data.status,
      user: state.user.name || 'Member'
    });
    persist();
    updateUI();
    e.target.reset();
  });

  document.getElementById('newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    state.news.unshift({ id: crypto.randomUUID(), ...data });
    persist();
    updateUI();
    e.target.reset();
  });

  document.getElementById('giveawayForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    state.giveaways.unshift({ id: crypto.randomUUID(), ...data });
    persist();
    updateUI();
    e.target.reset();
  });
}

function initAdminControls() {
  document.getElementById('switchToGuest').onclick = () => setRole('guest');
  document.getElementById('switchToMember').onclick = () => setRole('member');
  document.getElementById('switchToAdmin').onclick = () => setRole('admin');
  document.getElementById('adminLogin').onclick = () => setRole('admin');
}

function initSnow() {
  const canvas = document.getElementById('snow');
  const ctx = canvas.getContext('2d');
  const flakes = Array.from({ length: 60 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 1,
    d: Math.random() + 1
  }));

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    flakes.forEach((f) => {
      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
    });
    ctx.fill();
    update();
  }

  let angle = 0;
  function update() {
    angle += 0.01;
    flakes.forEach((f) => {
      f.y += Math.pow(f.d, 2) + 1;
      f.x += Math.sin(angle) * 0.5;

      if (f.y > canvas.height) {
        f.y = 0;
        f.x = Math.random() * canvas.width;
      }
    });
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  loop();
}

function bootstrap() {
  initNavigation();
  initForms();
  initAdminControls();
  initSnow();
  updateUI();
  activateSection('home');
}

bootstrap();
