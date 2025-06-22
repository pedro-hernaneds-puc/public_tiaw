const apiNoticia = "http://localhost:3000/noticias/";
const apiCategorias = "http://localhost:3000/categorias/";

//funcao para obter noticias da database
async function api() {
    try {
        const resposta = await fetch(apiNoticia);
        return await resposta.json();
    } catch(error) {
        console.error('Erro ao buscar detalhes sobre a noticia', error);
    }
}

async function apiCategoria() {
    try {
        const resposta = await fetch(apiCategorias);
        return await resposta.json();
    } catch(error) {
        console.error('Erro ao buscar detalhes sobre as categorias', error);
    }
}

// reformulacao exibir noticias
async function exibirNoticias(categoriaId = null) {
    const noticias = await api();
    const exibirNoticias = document.getElementById("exibirNoticias");
    if (!exibirNoticias) return;
    exibirNoticias.innerHTML = "";

    let filtradas = noticias;
    if (categoriaId) {
        filtradas = noticias.filter(noticia => noticia.categoria_id == categoriaId);
    }

    filtradas.forEach((noticia) => {
        const card = document.createElement("div");
        card.className = "card-noticia";
        card.innerHTML = `
            <h2>${noticia.titulo || ""}</h2>
            <p>${noticia.texto || ""}</p>
        `;
        card.addEventListener("click", () => {
            window.location.href = `noticiasdetalhes.html?id=${noticia.id}`;
        });
        exibirNoticias.appendChild(card);
    });
}

// apresentar categorias em <aside> e filtrar
async function exibirCategorias() {
    const categorias = await apiCategoria();
    const categorias2 = document.getElementById("categorias2");
    if (!categorias2) return;
    categorias2.innerHTML = "";

    const botaoTodas = document.createElement("button");
    botaoTodas.className = "categoriaBTN ativa";
    botaoTodas.textContent = "Todas";
    botaoTodas.addEventListener("click", function() {
        exibirNoticias();
        document.querySelectorAll('.categoriaBTN').forEach(btn => btn.classList.remove('ativa'));
        this.classList.add('ativa');
    });
    categorias2.appendChild(botaoTodas);

    categorias.forEach((categoria) => {
        const botao = document.createElement("button");
        botao.className = "categoriaBTN";
        botao.textContent = categoria.nome;
        botao.addEventListener("click", function() {
            exibirNoticias(categoria.id);
            document.querySelectorAll('.categoriaBTN').forEach(btn => btn.classList.remove('ativa'));
            this.classList.add('ativa');
        });
        categorias2.appendChild(botao);
    });
}

// apresentar noticias na pagina noticias.html e redirecionar com o click para noticias detalhes
async function exibirNoticia() {
    const detalhes = document.getElementById("detalhes-noticia");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    try {
        const resposta = await fetch(apiNoticia + id);
        const noticia = await resposta.json();
        detalhes.innerHTML = `
            <h2>${noticia.titulo}</h2>
            <small>Por ${noticia.autor} - ${new Date(noticia.data).toLocaleDateString()} - ${noticia.fonte}</small>
            <p>${noticia.texto}</p>
        `;
    } catch (error) {
        detalhes.innerHTML = "<p>Erro ao carregar detalhes da notícia.</p>";
        console.error("Erro ao carregar detalhes da notícia: ", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("exibirNoticias")) {
        exibirCategorias();
        exibirNoticias();
    }
    if (document.getElementById("detalhes-noticia")) {
        exibirNoticia();
    }
});