async function carregarForuns(dados, numeroDeDestaques){
    const container = document.getElementById("forum-box")
    container.innerHTML = ``
    for (let i = 0; i < numeroDeDestaques; i++){
        const dataFormatada = new Date(dados[i].ultima_interacao).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        hour12: false });
        
        const comentariosResponse = await fetch(`https://tiaw-synapso.onrender.com/comentarios_forum?forum_id=${dados[i].id}`);
        const comentariosData = await comentariosResponse.json();
        const quantidadeComentarios = Array.isArray(comentariosData) ? comentariosData.length : 0;

        const categoriaForum = await fetchCategoria(dados[i].categoria_id)
        // const itemForum = document.createElement("div");
        // itemForum.className = `forum-thread`;
        const itemForum = document.createElement("a")
        itemForum.className = `forum-link`
        itemForum.setAttribute("href", "/modulos/detalhes-forum.html?id="+ dados[i].id)
        itemForum.innerHTML = `
        <div class = "forum-thread">            
            <div>${categoriaForum}</div>
            <div>${dados[i].titulo}</div>
            <div>${dataFormatada}</div>
            <div>${quantidadeComentarios}</div>
            <div>${dados[i].visualizacoes}</div>
        </div>`
        container.appendChild(itemForum);
    }
}


async function fetchCategoria(categoria_id) {
    const response = await fetch("https://tiaw-synapso.onrender.com/categorias/" + categoria_id);
        const data = await response.json();
        return data.nome;
}
