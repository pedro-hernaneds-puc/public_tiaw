document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'https://tiaw-synapso.onrender.com/usuarios';
  const header = document.getElementById('main-header');
  const usuarioCorrente = JSON.parse(sessionStorage.getItem('usuarioCorrente') || 'null');

  // Funções de autenticação
  async function carregarUsuarios() {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  }

  async function loginUser(login, senha) {
    const usuarios = await carregarUsuarios();
    const usuario = usuarios.find(u => u.login === login && u.senha === senha);
    if (usuario) {
      sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuario));
      return true;
    }
    return false;
  }

  async function addUser(nome, login, senha, email) {
    const usuarios = await carregarUsuarios();
    const existe = usuarios.find(u => u.login === login);
    if (existe) {
      alert('Login já cadastrado. Escolha outro.');
      return;
    }

    const novoUsuario = { nome, login, senha, email };
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoUsuario)
    });
  }

  // Criação do modal de cadastro
  if (!document.getElementById('loginModal')) {
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = `
      <div class="modal fade" id="loginModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cadastro de Usuário</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <input type="text" id="cad_nome" class="form-control mb-2" placeholder="Nome completo">
              <input type="text" id="cad_login" class="form-control mb-2" placeholder="Login">
              <input type="email" id="cad_email" class="form-control mb-2" placeholder="Email">
              <input type="password" id="cad_senha" class="form-control mb-2" placeholder="Senha">
              <input type="password" id="cad_senha2" class="form-control mb-3" placeholder="Confirme a senha">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="btn_cadastrar">Cadastrar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  // Criação do header com search e login
  header.innerHTML = `
  <h1><a href="/index.html" style="text-decoration: none; color: inherit;">Synapso</a></h1>
    <nav class="nav-links">
    <a href="/modulos/Foruns/foruns.html">Fóruns</a>
    <a href="/modulos/noticias/noticias.html">Notícias</a>
  </nav>
    <div class="search-bar-container">
      <input type="text" id="search" placeholder="Buscar..." autocomplete="off">
      <button id="search-btn" class="search-btn" aria-label="Buscar">
        <i class="fa-solid fa-magnifying-glass fa-rotate-90"></i>
      </button>
      <ul id="search-suggestions" class="search-suggestions" hidden></ul>
    </div>
    <div class="user-icon" id="user-icon">
      <i class="fa-solid ${usuarioCorrente ? 'fa-right-from-bracket' : 'fa-user'}"></i>
      <div class="login-popup" id="login-popup">
        ${usuarioCorrente ? `
          <p>Olá, ${usuarioCorrente.nome}</p>
          <button id="logout-btn">Sair</button>
        ` : `
          <input type="text" id="popup-login" placeholder="Login">
          <input type="password" id="popup-senha" placeholder="Senha">
          <button id="popup-login-btn">Entrar</button>
          <hr>
          <button id="popup-cadastro-btn">Cadastrar-se</button>
        `}
      </div>
    </div>
  `;

  // Lógica do popup de login
  const userIcon = document.getElementById('user-icon');
  const loginPopup = document.getElementById('login-popup');

  userIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    loginPopup.style.display = loginPopup.style.display === 'block' ? 'none' : 'block';
  });

  loginPopup.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', (e) => {
    if (!loginPopup.contains(e.target) && !userIcon.contains(e.target)) {
      loginPopup.style.display = 'none';
    }
  });

  if (usuarioCorrente) {
    document.getElementById('logout-btn').addEventListener('click', () => {
      sessionStorage.removeItem('usuarioCorrente');
      location.reload();
    });
  } else {
    document.getElementById('popup-login-btn').addEventListener('click', async () => {
      const login = document.getElementById('popup-login').value;
      const senha = document.getElementById('popup-senha').value;
      const sucesso = await loginUser(login, senha);
      if (sucesso) {
        location.reload();
      } else {
        alert('Login ou senha inválidos');
      }
    });

    document.getElementById('popup-cadastro-btn').addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('loginModal'));
      modal.show();
    });

    document.getElementById('btn_cadastrar').addEventListener('click', async () => {
      const nome = document.getElementById('cad_nome').value;
      const login = document.getElementById('cad_login').value;
      const email = document.getElementById('cad_email').value;
      const senha = document.getElementById('cad_senha').value;
      const senha2 = document.getElementById('cad_senha2').value;

      if (senha !== senha2) {
        alert('As senhas não conferem.');
        return;
      }

      await addUser(nome, login, senha, email);
      alert('Usuário cadastrado com sucesso. Faça o login.');
      const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      modal.hide();
    });
  }

  // -------------------- FUNCIONALIDADE DE BUSCA ----------------------

  const searchInput = document.getElementById('search');
  const searchBtn = document.getElementById('search-btn');
  const suggestionsList = document.getElementById('search-suggestions');

  let dados = [];
  try {
    const [noticias, foruns] = await Promise.all([
      fetch('https://tiaw-synapso.onrender.com/noticias').then(r => r.json()),
      fetch('https://tiaw-synapso.onrender.com/forum').then(r => r.json())
    ]);
    dados = [
      ...noticias.map(n => ({ tipo: 'noticia', titulo: n.titulo, id: n.id })),
      ...foruns.map(f => ({ tipo: 'forum', titulo: f.titulo, id: f.id }))
    ];
  } catch (e) {
    dados = [];
  }

  let suggestionIndex = -1;

  function getAutocompleteSuggestions(query) {
    if (!query) return [];
    const termo = query.toLowerCase();
    return dados.filter(item => item.titulo.toLowerCase().includes(termo)).slice(0, 6);
  }

  searchInput.addEventListener('input', () => {
    const termo = searchInput.value.trim();
    const sugestoes = getAutocompleteSuggestions(termo);
    if (termo && sugestoes.length > 0) {
      suggestionsList.innerHTML = sugestoes.map((s) =>
        `<li tabindex="0" data-tipo="${s.tipo}" data-id="${s.id}">${s.titulo} <span class="sug-tipo">${s.tipo === 'noticia' ? 'Notícia' : 'Fórum'}</span></li>`
      ).join('');
      suggestionsList.hidden = false;
      suggestionsList.style.display = 'block';
      suggestionIndex = -1;
    } else {
      suggestionsList.hidden = true;
      suggestionsList.style.display = 'none';
      suggestionIndex = -1;
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = suggestionsList.querySelectorAll('li');
    if (!items.length) {
      if (e.key === 'Enter') {
        window.location.href = `search.html?query=${encodeURIComponent(searchInput.value.trim())}`;
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      suggestionIndex = (suggestionIndex + 1) % items.length;
      items.forEach(li => li.classList.remove('active'));
      items[suggestionIndex].classList.add('active');
      items[suggestionIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      suggestionIndex = (suggestionIndex - 1 + items.length) % items.length;
      items.forEach(li => li.classList.remove('active'));
      items[suggestionIndex].classList.add('active');
      items[suggestionIndex].focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestionIndex >= 0) {
        items[suggestionIndex].click();
        suggestionIndex = -1;
      } else {
        window.location.href = `search.html?query=${encodeURIComponent(searchInput.value.trim())}`;
      }
    } else if (e.key === 'Escape') {
      suggestionsList.hidden = true;
      suggestionsList.style.display = 'none';
      suggestionIndex = -1;
    }
  });

  suggestionsList.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'LI') {
      const query = e.target.textContent;
      window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      suggestionsList.hidden = true;
      suggestionsList.style.display = 'none';
      suggestionIndex = -1;
    }, 100);
  });

  // Dentro do evento de clique na lupa
searchBtn.addEventListener('click', () => {
  window.location.href = `/modulos/search.html?query=${encodeURIComponent(searchInput.value.trim())}`;
});

// Dentro do evento de pressionamento de tecla (Enter sem sugestão selecionada)
if (e.key === 'Enter') {
  e.preventDefault();
  if (suggestionIndex >= 0) {
    items[suggestionIndex].click();
    suggestionIndex = -1;
  } else {
    window.location.href = `/modulos/search.html?query=${encodeURIComponent(searchInput.value.trim())}`;
  }
}

// Dentro do clique nas sugestões
suggestionsList.addEventListener('mousedown', (e) => {
  const li = e.target.closest('li');
  if (li) {
    const tipo = li.getAttribute('data-tipo');
    const id = li.getAttribute('data-id');
    if (tipo === 'noticia') {
      window.location.href = `/modulos/noticias/noticiasdetalhes.html?id=${id}`;
    } else if (tipo === 'forum') {
      window.location.href = `/modulos/Foruns/detalhes-forum.html?id=${id}`;
    }
  }
});



  // Footer dinâmico
  const footer = document.getElementById('main-footer');
  if (footer) {
    footer.innerHTML = `<div class="footer-content">&copy; ${new Date().getFullYear()} Synapso.</div>`;
  }
});
