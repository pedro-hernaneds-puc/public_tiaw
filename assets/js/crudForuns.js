const apiUrl = "/forum";
function readForum(processaDados, filtro){
    fetch(apiUrl + filtro)
    .then(response => response.json())
    .then(data =>{ 
        processaDados(data);
    })
    .catch(error => {console.log("Erro ao ler a API via Jsonserver", error)});
}

function createForum(Forum, refreshFunction){
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Forum),
    })
    .then(response => response.json())
    .then(data => {
        if(refreshFunction)
            refreshFunction();
    })
    .catch(error => {console.log("Erro ao inserir Forum", error)});
}

function updateForum(id, Forum, refreshFunction) {
    fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept-language': 'pt-br',
            'Accept': 'text/xml',
        },
        body: JSON.stringify(Forum),
    })
    .then(response => response.json())
    .then(data => {
        if(refreshFunction)
            refreshFunction();
    })
    .catch(error => {console.log("Erro ao atualizar Forum", error)});
}

function deleteForum(id, refreshFunction) {
    fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if(refreshFunction)
            refreshFunction();
    })
    .catch(error => {console.log("Erro ao atualizar Forum", error)});
}