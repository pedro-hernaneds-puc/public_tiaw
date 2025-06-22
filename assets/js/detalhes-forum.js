const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const API_FORUM = 'https://tiaw-synapso.onrender.com/forum';
const API_COMENTARIOS = 'https://tiaw-synapso.onrender.com/comentarios_forum';

const container = document.getElementById('detalhes-forum');
const listaComentarios = document.getElementById('comentarios');
const formComentario = document.getElementById('comentarios-forum');
const inputComentarioId = document.getElementById('comentarios-id');
const inputMensagem = document.getElementById('comentario-mensagem');
const btnCancelar = document.getElementById('cancelar');

let editandoComentarioId = null;

// Carrega os dados do tópico
async function carregarDadosForum() {
    const res = await fetch(`${API_FORUM}/${id}`);
    const forum = await res.json();

    const dataFormatada = forum.data_postagem 
        ? new Date(forum.data_postagem).toLocaleDateString('pt-BR') 
        : 'Data indisponível';

    container.innerHTML = `
        <h2>${forum.titulo}</h2>
        <div class="detalhes-forum">
            <span><strong>Data:</strong> ${dataFormatada}</span>
            <span><strong>Visualizações:</strong> ${forum.visualizacoes}</span>
            <span><strong>Comentários:</strong> ${forum.quantidade_comentarios || 0}</span>
        </div>
    `;
}

// Carrega comentários
async function carregarComentarios() {
    const res = await fetch(`${API_COMENTARIOS}?forum_id=${id}`);
    const comentarios = await res.json();

    listaComentarios.innerHTML = "";

    comentarios.forEach(comentario => {
        const data = new Date(comentario.data_comentario).toLocaleString("pt-BR");
        const div = document.createElement("div");
        div.className = "comentario";
        div.innerHTML = `
            <p>${comentario.mensagem}</p>
            <p><strong>Postado em:</strong> ${data} — <strong>Likes:</strong> ${comentario.likes}</p>
            <button class="btn-curtir">Curtir</button>
            <button class="btn-editar">Editar</button>
            <button class="btn-excluir">Excluir</button>
        `;
        div.querySelector('.btn-curtir').onclick = () => curtirComentario(comentario);
        div.querySelector('.btn-editar').onclick = () => preencherFormularioComentario(comentario);
        div.querySelector('.btn-excluir').onclick = () => excluirComentario(comentario.id);
        listaComentarios.appendChild(div);
    });
}

// Comentário CRUD
function preencherFormularioComentario(comentario) {
    editandoComentarioId = comentario.id;
    inputComentarioId.value = comentario.id;
    inputMensagem.value = comentario.mensagem;
    btnCancelar.style.display = 'inline-block';
}

async function criarComentario(dados) {
    dados.forum_id = parseInt(id);
    dados.data_comentario = new Date().toISOString();
    dados.likes = 0;

    await fetch(API_COMENTARIOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
}

async function editarComentario(dados) {
    await fetch(`${API_COMENTARIOS}/${editandoComentarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
}

async function excluirComentario(idComentario) {
    if (!confirm('Deseja realmente excluir este comentário?')) return;
    await fetch(`${API_COMENTARIOS}/${idComentario}`, { method: 'DELETE' });
    if (editandoComentarioId === idComentario) resetFormularioComentario();
    carregarComentarios();
}

async function curtirComentario(comentario) {
    comentario.likes++;
    await fetch(`${API_COMENTARIOS}/${comentario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comentario)
    });
    carregarComentarios();
}

function resetFormularioComentario() {
    editandoComentarioId = null;
    formComentario.reset();
    btnCancelar.style.display = 'none';
    inputComentarioId.value = '';
}

btnCancelar.onclick = resetFormularioComentario;

formComentario.onsubmit = async (e) => {
    e.preventDefault();
    const mensagem = inputMensagem.value.trim();
    if (!mensagem) {
        alert('Digite uma mensagem!');
        return;
    }

    const dados = { mensagem };

    if (editandoComentarioId) {
        dados.id = editandoComentarioId;
        await editarComentario(dados);
    } else {
        await criarComentario(dados);
    }

    carregarComentarios();
    resetFormularioComentario();
};

async function inicializarPagina() {
    await carregarDadosForum();
    await carregarComentarios();
}

document.addEventListener('DOMContentLoaded', inicializarPagina);
