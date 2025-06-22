document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';

    const fetchData = async (endpoint) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return null;
        }
    };

    const getCategoriasMap = async () => {
        const categorias = await fetchData('categorias');
        if (!categorias) return new Map();
        return new Map(categorias.map(cat => [cat.id, cat.nome]));
    };

    const displayError = (containerId, message) => {
        const containerEl = document.getElementById(containerId);
        if (containerEl) {
            containerEl.innerHTML = `<div class="alert alert-warning">${message}</div>`;
        }
    };

    const carregarNoticias = async (categoriasMap) => {
        const container = document.getElementById('recommended-news');
        if (!container) return;

        const newsList = await fetchData('noticias?_sort=data&_order=desc&_limit=3');
        if (!newsList) {
            displayError('recommended-news', 'Não foi possível carregar as notícias.');
            return;
        }
        
        container.innerHTML = '';
        newsList.forEach(news => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            const dataObj = new Date(news.data);
            const dataFormatada = !isNaN(dataObj) ? dataObj.toLocaleDateString('pt-BR') : 'Data indisponível';
            const categoriaNome = categoriasMap.get(news.categoria_id) || 'Geral';

            card.innerHTML = `
                <div class="card news-card h-100">
                    <div class="card-body d-flex flex-column">
                        <span class="badge rounded-pill mb-2" style="background:#588157;color:#fff;">${categoriaNome}</span>
                        <h5 class="card-title">${news.titulo}</h5>
                        <a href="modulos/noticias/noticiasdetalhes.html?id=${news.id}" class="btn btn-sm btn-outline-primary mt-auto align-self-start">Leia Mais</a>
                        <div class="mt-2"><small class="text-muted"><i class="bi bi-calendar me-1"></i>${dataFormatada}</small></div>
                    </div>
                </div>`;
            container.appendChild(card);
        });
    };

    const carregarForums = async (categoriasMap) => {
        const container = document.getElementById('trending-forums');
        if (!container) return;

        const forums = await fetchData('forum?_sort=visualizacoes&_order=desc&_limit=3');
        if (!forums) {
            displayError('trending-forums', 'Não foi possível carregar os tópicos do fórum.');
            return;
        }
        
        container.innerHTML = '';
        for (const forum of forums) {
            const comments = await fetchData(`comentarios_forum?forum_id=${forum.id}`);
            const replies = Array.isArray(comments) ? comments.length : 0;
            const categoriaNome = categoriasMap.get(forum.categoria_id) || 'Geral';
            const dataObj = new Date(forum.ultima_interacao);
            const ultimaInteracao = !isNaN(dataObj) ? dataObj.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : 'Interação indisponível';

            const link = document.createElement('a');
            link.className = 'list-group-item list-group-item-action trending-topic mb-3';
            link.href = `modulos/Foruns/detalhes-forum.html?id=${forum.id}`;
            link.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="topic-category"><i class="bi bi-tag-fill me-1"></i>${categoriaNome}</span>
                    <span class="topic-stats"><i class="bi bi-chat-square-text me-1"></i>${replies} respostas</span>
                </div>
                <h5 class="topic-title">${forum.titulo}</h5>
                <p class="mb-2">${forum.resumo || ''}</p>
                <div class="d-flex justify-content-between">
                    <small class="text-muted"><i class="bi bi-eye me-1"></i>${forum.visualizacoes || 0} visualizações</small>
                </div>
                <div class="text-muted mt-1" style="font-size:0.9em;"><i class="bi bi-clock me-1"></i>${ultimaInteracao}</div>`;
            container.appendChild(link);
        }
    };

    const init = async () => {
        const categoriasMap = await getCategoriasMap();
        carregarNoticias(categoriasMap);
        carregarForums(categoriasMap);
    };

    init();
});