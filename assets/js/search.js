const API_URL = 'http://localhost:3000';

let fuseNoticias, fuseForum;
let todasNoticias = [], todosForum = [], categorias = [], comentariosNoticias = [], comentariosForum = [];

async function carregarDadosIniciais() {
  const [noticias, forum, categoriasData, comentariosNoticiasData, comentariosForumData] = await Promise.all([
    fetch(`${API_URL}/noticias`).then(res => res.json()),
    fetch(`${API_URL}/forum`).then(res => res.json()),
    fetch(`${API_URL}/categorias`).then(res => res.json()),
    fetch(`${API_URL}/comentarios_noticias`).then(res => res.json()),
    fetch(`${API_URL}/comentarios_forum`).then(res => res.json())
  ]);
  todasNoticias = noticias;
  todosForum = forum;
  categorias = categoriasData;
  comentariosNoticias = comentariosNoticiasData;
  comentariosForum = comentariosForumData;
  window.comentariosForum = comentariosForumData;

  // Configura Fuse.js
  fuseNoticias = new Fuse(noticias, {
    keys: ['titulo', 'texto'],
    threshold: 0.3
  });
  fuseForum = new Fuse(forum, {
    keys: ['titulo'],
    threshold: 0.3
  });
}

// Utilitário para pegar query string
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || '';
}

document.addEventListener('DOMContentLoaded', async () => { 
  // Elementos DOM
  const resultsList = document.getElementById('results');
  const categoryCheckboxes = document.getElementById('category-checkboxes');
  const typeFilter = document.getElementById('type-filter');
  const orderFilter = document.getElementById('order-filter');
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterToggle = document.getElementById('filter-toggle');
  const closeSidebar = document.getElementById('close-sidebar');
  const searchInput = document.getElementById('search');
  const searchQueryLabel = document.getElementById('search-query-label');
  
  await carregarDadosIniciais();
  
  // Preenche o campo de busca com o termo da query string, se houver
  // Preenche o campo de busca com o termo da query string e executa a busca
const termoInicial = getQueryParam('query');
if (termoInicial) {
    const interval = setInterval(() => {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.value = termoInicial;
            clearInterval(interval);
            atualizarResultados();
        }
    }, 100);
}


  // Cria o checkbox "Todas"
  categoryCheckboxes.innerHTML = `
    <label>
      <input type="checkbox" value="todas" checked>
      <span>Todas as categorias</span>
    </label>
  `;

  // Cria um checkbox para cada categoria
  categorias.forEach(cat => {
    categoryCheckboxes.innerHTML += `
      <label>
        <input type="checkbox" value="${cat.id}">
        <span>${cat.nome}</span>
      </label>
    `;
  });

  // Função para sincronizar o checkbox "todas"
  function syncTodasCheckbox() {
    const allCheckboxes = Array.from(categoryCheckboxes.querySelectorAll('input[type="checkbox"]:not([value="todas"])'));
    const todasCheckbox = categoryCheckboxes.querySelector('input[value="todas"]');
    if (todasCheckbox.checked) {
      allCheckboxes.forEach(cb => cb.checked = true);
    } else {
      allCheckboxes.forEach(cb => cb.checked = false);
    }
  }

  // Função para atualizar o estado do "todas" ao marcar/desmarcar individuais
  function syncIndividualCheckboxes() {
    const allCheckboxes = Array.from(categoryCheckboxes.querySelectorAll('input[type="checkbox"]:not([value="todas"])'));
    const todasCheckbox = categoryCheckboxes.querySelector('input[value="todas"]');
    if (allCheckboxes.every(cb => cb.checked)) {
      todasCheckbox.checked = true;
    } else {
      todasCheckbox.checked = false;
    }
  }

  // Função para pegar o nome da categoria
  function getCategoriaNome(categoria_id) {
    const categoria = categorias.find(cat => Number(cat.id) === Number(categoria_id));
    return categoria ? categoria.nome : 'Sem categoria';
  }

  // Função para atualizar os resultados
  function atualizarResultados() {
    const termo = (searchInput?.value || '').trim();
    if (searchQueryLabel) {
      searchQueryLabel.textContent = termo ? `Exibindo resultados para '${termo}'` : '';
    }

    const checked = Array.from(categoryCheckboxes.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

    let noticiasFiltradas = todasNoticias;
    let forumFiltrados = todosForum;

    // Busca fuzzy
    if (termo) {
      noticiasFiltradas = fuseNoticias.search(termo).map(r => r.item);
      forumFiltrados = fuseForum.search(termo).map(r => r.item);
    }

    // Filtro por categoria
    if (!(checked.includes("todas") || checked.length === 0)) {
      const catIds = checked.map(Number);
      noticiasFiltradas = noticiasFiltradas.filter(n => catIds.includes(n.categoria_id));
      forumFiltrados = forumFiltrados.filter(f => catIds.includes(f.categoria_id));
    }

    // Filtro por tipo
    if (tipoSelecionado === "noticias") {
      forumFiltrados = [];
    } else if (tipoSelecionado === "foruns") {
      noticiasFiltradas = [];
    }

    // Adiciona tipo para cada item
    const resultados = [
      ...noticiasFiltradas.map(n => ({ ...n, _tipo: "noticia" })),
      ...forumFiltrados.map(f => ({ ...f, _tipo: "forum" }))
    ];

    // Ordenação combinada
    if (ordemSelecionada === "titulo-az") {
      resultados.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
    } else if (ordemSelecionada === "titulo-za") {
      resultados.sort((a, b) => (b.titulo || '').localeCompare(a.titulo || ''));
    } else if (ordemSelecionada === "data-nova") {
      resultados.sort((a, b) => {
        const dataA = a._tipo === "noticia" ? new Date(a.data || 0) : new Date(a.data_postagem || 0);
        const dataB = b._tipo === "noticia" ? new Date(b.data || 0) : new Date(b.data_postagem || 0);
        return dataB - dataA;
      });
    } else if (ordemSelecionada === "data-antiga") {
      resultados.sort((a, b) => {
        const dataA = a._tipo === "noticia" ? new Date(a.data || 0) : new Date(a.data_postagem || 0);
        const dataB = b._tipo === "noticia" ? new Date(b.data || 0) : new Date(b.data_postagem || 0);
        return dataA - dataB;
      });
    }
    // "Relevância" mantém a ordem do Fuse.js

    resultsList.innerHTML = '';

    resultados.forEach(item => {
      const li = document.createElement('li');
      li.className = 'result-card ' + (item._tipo === "noticia" ? 'noticia' : 'forum');

      // Badge de categoria
      const badgeCategoria = `<span class="badge-categoria badge-cat-${item.categoria_id}">${getCategoriaNome(item.categoria_id)}</span>`;

      // Ícone "novo" (exemplo: últimos 3 dias)
      let isNovo = false;
      let dataBase = item._tipo === "noticia" ? item.data : item.data_postagem;
      if (dataBase) {
        const diff = (new Date()) - (new Date(dataBase));
        isNovo = diff < 3 * 24 * 60 * 60 * 1000; // 3 dias
      }
      const iconeNovo = isNovo ? `<span class="icon-novo" title="Novo">●</span>` : '';

      // Último comentário (fórum)
      let lastComment = '';
      if (item._tipo === "forum" && window.comentariosForum) {
        const comentarios = window.comentariosForum.filter(c => c.forum_id === item.id);
        if (comentarios.length > 0) {
          const ultimo = comentarios.reduce((a, b) =>
            new Date(a.data_comentario) > new Date(b.data_comentario) ? a : b
          );
          lastComment = `<span class="result-last-comment">"${ultimo.mensagem.slice(0, 80)}${ultimo.mensagem.length > 80 ? '...' : ''}"</span>`;
        }
      }

      // Estrela de destaque para notícia
      const destaque = item._tipo === "noticia" && item.destaque
        ? `<span class="star" title="Notícia em destaque"><i class="fa-solid fa-star"></i></span>`
        : '';

      // Comentários
      const comentarios = item._tipo === "noticia"
        ? `<span class="result-comments" title="Comentários"><i class="fa-solid fa-comment"></i> ${
            comentariosNoticias.filter(c => Number(c.noticia_id) === Number(item.id)).length
          }</span>`
        : `<span class="result-comments" title="Comentários"><i class="fa-solid fa-comment"></i> ${item.quantidade_comentarios || 0}</span>`;

      // Visualizações (só fórum)
      const visualizacoes = item._tipo === "forum"
        ? `<span class="result-views" title="Visualizações"><i class="fa-solid fa-eye"></i> ${item.visualizacoes || 0}</span>`
        : "";

      // Autor
      const autor = item._tipo === "noticia"
        ? (item.autor || "Autor desconhecido")
        : getAutorNome(item.autor_id);

      // Data
      let dataStr = '';
      if (item._tipo === "noticia" && item.data) {
        const data = new Date(item.data);
        dataStr = `<i class="fa-solid fa-calendar"></i> ${data.toLocaleDateString('pt-BR')}`;
      } else if (item._tipo === "forum" && item.data_postagem) {
        const data = new Date(item.data_postagem);
        dataStr = `<i class="fa-solid fa-calendar"></i> ${data.toLocaleDateString('pt-BR')}`;
      }

      // No HTML do card:
      let tipoIcone = item._tipo === "noticia"
        ? `<i class="fa-solid fa-newspaper" title="Notícia" style="color:#1976d2;font-size:1.2em;margin-right:0.7em;"></i>`
        : `<i class="fa-solid fa-comments" title="Fórum" style="color:#43a047;font-size:1.2em;margin-right:0.7em;"></i>`;

      let link = item._tipo === "noticia"
  ? `/modulos/noticias/noticiasdetalhes.html?id=${item.id}`
  : `/modulos/Foruns/detalhes-forum.html?id=${item.id}`;


      li.innerHTML = `
        <a href="${link}" class="result-link-card">
          <div class="result-header">
            ${tipoIcone}
            <span class="result-title">${item.titulo || ''}</span>
            ${destaque}
            ${iconeNovo}
          </div>
          <div class="result-body">
            ${item._tipo === "noticia" ? `<p>${item.texto || ''}</p>` : ''}
            ${lastComment}
          </div>
          <div class="result-footer">
            ${badgeCategoria}
            <span class="result-author"><i class="fa-solid fa-user"></i> ${autor}</span>
            ${comentarios}
            ${visualizacoes}
            ${dataStr ? `<span class="result-date">${dataStr}</span>` : ''}
          </div>
        </a>
      `;
      resultsList.appendChild(li);
    });

    if (resultados.length === 0) {
      resultsList.innerHTML = `<li class="no-results-msg">Nenhum resultado encontrado</li>`;
    }
  }

  // Eventos para os checkboxes
  categoryCheckboxes.addEventListener('change', (e) => {
    if (e.target.value === "todas") {
      syncTodasCheckbox();
    } else {
      syncIndividualCheckboxes();
    }
    atualizarResultados();
  });

  if (typeFilter) typeFilter.addEventListener('change', atualizarResultados);
  if (orderFilter) orderFilter.addEventListener('change', atualizarResultados);

  // Abrir sidebar
  filterToggle.addEventListener('click', () => {
    filterSidebar.removeAttribute('hidden');
    filterToggle.setAttribute('aria-expanded', 'true');
  });
  // Fechar sidebar
  closeSidebar.addEventListener('click', () => {
    filterSidebar.classList.add('closing');
    filterToggle.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      filterSidebar.setAttribute('hidden', '');
      filterSidebar.classList.remove('closing');
    }, 200); // tempo igual ao da animação
  });

  // Dropdown tipo
  const typeDropdownBtn = document.getElementById('type-dropdown-btn');
  const typeDropdownList = document.getElementById('type-dropdown-list');
  let tipoSelecionado = "todos";
  typeDropdownBtn.addEventListener('click', () => {
    typeDropdownList.hidden = !typeDropdownList.hidden;
  });
  typeDropdownList.addEventListener('click', (e) => {
    if (e.target.tagName === "LI") {
      tipoSelecionado = e.target.dataset.value;
      typeDropdownBtn.textContent = e.target.textContent;
      Array.from(typeDropdownList.children).forEach(li => li.classList.remove('selected'));
      e.target.classList.add('selected');
      typeDropdownList.hidden = true;
      atualizarResultados();
    }
  });

  // Dropdown ordem
  const orderDropdownBtn = document.getElementById('order-dropdown-btn');
  const orderDropdownList = document.getElementById('order-dropdown-list');
  let ordemSelecionada = "relevancia";
  orderDropdownBtn.addEventListener('click', () => {
    orderDropdownList.hidden = !orderDropdownList.hidden;
  });
  orderDropdownList.addEventListener('click', (e) => {
    if (e.target.tagName === "LI") {
      ordemSelecionada = e.target.dataset.value;
      orderDropdownBtn.textContent = e.target.textContent;
      Array.from(orderDropdownList.children).forEach(li => li.classList.remove('selected'));
      e.target.classList.add('selected');
      orderDropdownList.hidden = true;
      atualizarResultados();
    }
  });

  // Dropdown categoria
  const categoryDropdownBtn = document.getElementById('category-dropdown-btn');
  const categoryDropdownList = document.getElementById('category-dropdown-list');

  // Abrir/fechar dropdown de categorias
  categoryDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryDropdownList.hidden = !categoryDropdownList.hidden;
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!categoryDropdownBtn.contains(e.target) && !categoryDropdownList.contains(e.target)) {
      categoryDropdownList.hidden = true;
    }
  });

  // Atualizar texto do botão de categorias conforme seleção
  categoryCheckboxes.addEventListener('change', () => {
    const checked = Array.from(categoryCheckboxes.querySelectorAll('input[type="checkbox"]:checked'));
    if (checked.length === 0 || checked.some(cb => cb.value === "todas")) {
      categoryDropdownBtn.textContent = "Todas as categorias";
    } else if (checked.length === 1) {
      categoryDropdownBtn.textContent = checked[0].parentElement.textContent.trim();
    } else {
      categoryDropdownBtn.textContent = `${checked.length} categorias selecionadas`;
    }
  });

  // Fechar dropdowns ao clicar fora
  document.addEventListener('click', (e) => {
    if (!typeDropdownBtn.contains(e.target) && !typeDropdownList.contains(e.target)) {
      typeDropdownList.hidden = true;
    }
    if (!orderDropdownBtn.contains(e.target) && !orderDropdownList.contains(e.target)) {
      orderDropdownList.hidden = true;
    }
  });

  // Busca inicial
  syncTodasCheckbox();
  atualizarResultados();
});

// Utilitário para buscar nome do autor de fórum
function getAutorNome(autor_id) {
  if (!window.usuarios || !Array.isArray(window.usuarios)) return "Autor desconhecido";
  const usuario = window.usuarios.find(u => u.id === autor_id);
  return usuario ? usuario.nome : "Autor desconhecido";
}
