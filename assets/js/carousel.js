function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function carregarDestaques() {
    let contador = 0;
    try {
        const response = await fetch("http://localhost:3000/noticias");
        const noticias = await response.json();

        // Filtra apenas as notícias com destaque
        const destaques = noticias.filter(noticia => noticia.destaque);
        embaralhar(destaques);

        document.querySelector(".carousel-inner").innerHTML = "";
        document.querySelector(".carousel-indicators").innerHTML = "";
        document.querySelector(".carousel-control-prev").style.display = "block";
        document.querySelector(".carousel-control-next").style.display = "block";

        destaques.slice(0, 5).forEach((noticia, idx) => {
            let carouselBS = document.createElement("div");
            carouselBS.className = "carousel-item";
            if (idx === 0) carouselBS.classList.add("active");

            let destDiv = document.createElement("a");
            destDiv.className = "destaque";
            destDiv.href = noticia.url || "#";

            let title = document.createElement("h2");
            title.className = "titulo-dest";
            title.innerText = noticia.titulo;

            let content = document.createElement("div");
            content.className = "conteudo";
            if (idx % 2 !== 0) content.classList.add("cnt-v2");

            let desc = document.createElement("p");
            desc.className = "descr-dest";
            desc.innerText = noticia.texto;

            let img = document.createElement("img");
            img.className = "img-dest";
            if (noticia.Imagens && noticia.Imagens[0]) {
                img.src = noticia.Imagens[0].url;
                img.alt = noticia.Imagens[0].descricao || "Imagem da notícia";
            } else {
                img.src = "";
                img.alt = "Sem imagem";
            }

            // Timer SVG
            const svgNS = "http://www.w3.org/2000/svg";
            let svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "30");
            svg.setAttribute("height", "30");
            svg.setAttribute("viewBox", "0 0 36 36");
            svg.classList.add("progress-circle");
            let circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", "18");
            circle.setAttribute("cy", "18");
            circle.setAttribute("r", "16");
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke", "#007bff");
            circle.setAttribute("stroke-width", "4");
            circle.setAttribute("stroke-dasharray", "100");
            circle.setAttribute("stroke-dashoffset", "0");
            svg.appendChild(circle);

            content.appendChild(desc);
            content.appendChild(img);
            destDiv.appendChild(title);
            destDiv.appendChild(content);
            carouselBS.appendChild(svg);
            carouselBS.appendChild(destDiv);
            document.querySelector(".carousel-inner").appendChild(carouselBS);

            // Indicadores
            let indicator = document.createElement("button");
            indicator.className = "indicadores";
            indicator.type = "button";
            indicator.setAttribute("data-bs-target", "#carousel-conteiner");
            indicator.setAttribute("data-bs-slide-to", idx);
            indicator.setAttribute("aria-label", "Notícia " + (idx + 1));
            if (idx === 0) indicator.classList.add("active");
            document.querySelector(".carousel-indicators").appendChild(indicator);

            contador++;
        });

        // Caso não tenha destaques
        if (contador === 0) {
            let carouselBS = document.createElement("div");
            carouselBS.className = "carousel-item active";
            let destDiv = document.createElement("div");
            destDiv.className = "destaque";
            let title = document.createElement("h2");
            title.className = "titulo-dest";
            title.innerText = "Nenhum destaque";
            let content = document.createElement("div");
            content.className = "conteudo";
            let desc = document.createElement("p");
            desc.className = "descr-dest";
            desc.innerText = "Nenhuma notícia em destaque no momento, tente novamente mais tarde.";
            let img = document.createElement("span");
            img.className = "img-dest fa-solid fa-circle-exclamation fa-5x";
            img.style.padding = "30px";
            img.style.width = "25%";
            content.appendChild(desc);
            content.appendChild(img);
            destDiv.appendChild(title);
            destDiv.appendChild(content);
            carouselBS.appendChild(destDiv);
            document.querySelector(".carousel-inner").appendChild(carouselBS);
            document.querySelector(".carousel-control-prev").style.display = "none";
            document.querySelector(".carousel-control-next").style.display = "none";
        }

        // Se só tiver um destaque, esconde setas e timer
        if (contador === 1) {
            document.querySelector(".carousel-control-prev").style.display = "none";
            document.querySelector(".carousel-control-next").style.display = "none";
            document.querySelector(".progress-circle").style.display = "none";
        }
    } catch (error) {
        console.error("Erro ao carregar destaques:", error);
    }
}

// Timer sincronizado com o carrossel
document.addEventListener("DOMContentLoaded", () => {
    carregarDestaques();

    const carouselElement = document.querySelector('#carousel-conteiner');
    const interval = 15000;
    if (carouselElement) {
        carouselElement.addEventListener('slide.bs.carousel', () => {
            const currentSlide = carouselElement.querySelector('.carousel-item.active');
            const circle = currentSlide ? currentSlide.querySelector('.progress-circle circle') : null;
            if (circle) {
                circle.style.animation = 'none';
                void circle.offsetWidth;
                circle.style.animation = `progress ${interval}ms linear forwards`;
            }
        });
    }
});