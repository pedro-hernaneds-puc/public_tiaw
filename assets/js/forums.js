const apiForum = "/forum";
const apiCategorias = "/categorias";

//funcao para obter foruns da database
async function api() {
    try {
        const resposta = await fetch(apiForum);
        return await resposta.json();
    } catch(error) {
        console.error('Erro ao buscar detalhes sobre o forum', error);
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

// reformulacao exibir Foruns
async function exibirForuns(categoriaId = null) {
    const foruns = await api();
    const categorias = await apiCategoria();

    const respostaUsuarios = await fetch("/usuarios");
    const usuarios = await respostaUsuarios.json();

    const exibirForuns = document.getElementById("exibirForuns");
    if (!exibirForuns) return;
    exibirForuns.innerHTML = "";

    let filtradas = foruns;
    if (categoriaId) {
        filtradas = foruns.filter(forum => forum.categoria_id == categoriaId);
    }

    filtradas.forEach((forum) => {
        const categoria = categorias.find(cat => cat.id == forum.categoria_id);
        const autor = usuarios.find(user => user.id == forum.autor_id);

        const card = document.createElement("div");
        card.className = "card-forum";
        card.innerHTML = `
            <h2>${forum.titulo}</h2>
            <div class="detalhes-forum">
                <span><strong>Categoria:</strong> ${categoria ? categoria.nome : "Sem categoria"}</span>
                <span><strong>Autor:</strong> ${autor ? autor.nome : "Desconhecido"}</span>
                <span><strong>Postado em:</strong> ${new Date(forum.data_postagem).toLocaleDateString()}</span>
                <span><strong>Comentários:</strong> ${forum.quantidade_comentarios || 0}</span>
                <span><strong>Visualizações:</strong> ${forum.visualizacoes || 0}</span>
            </div>
        `;
        card.addEventListener("click", () => {
            window.location.href = `detalhes-forum.html?id=${forum.id}`;
        });
        exibirForuns.appendChild(card);
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
        exibirForuns();
        document.querySelectorAll('.categoriaBTN').forEach(btn => btn.classList.remove('ativa'));
        this.classList.add('ativa');
    });
    categorias2.appendChild(botaoTodas);

    categorias.forEach((categoria) => {
        const botao = document.createElement("button");
        botao.className = "categoriaBTN";
        botao.textContent = categoria.nome;
        botao.addEventListener("click", function() {
            exibirForuns(categoria.id);
            document.querySelectorAll('.categoriaBTN').forEach(btn => btn.classList.remove('ativa'));
            this.classList.add('ativa');
        });
        categorias2.appendChild(botao);
    });
}

// apresentar Foruns na pagina Foruns.html e redirecionar com o click para Foruns detalhes
async function exibirforum() {
    const detalhes = document.getElementById("detalhes-forum");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    try {
        const resposta = await fetch(apiforum + id);
        const forum = await resposta.json();
        detalhes.innerHTML = `
            <h2>${forum.titulo}</h2>
            <small>Por ${forum.autor} - ${new Date(forum.data).toLocaleDateString()} - ${forum.fonte}</small>
            <p>${forum.texto}</p>
        `;
    } catch (error) {
        detalhes.innerHTML = "<p>Erro ao carregar detalhes da notícia.</p>";
        console.error("Erro ao carregar detalhes da notícia: ", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("exibirForuns")) {
        exibirCategorias();
        exibirForuns();
    }
    if (document.getElementById("detalhes-forum")) {
        exibirforum();
    }
});