const gallery = document.querySelector(".gallery");
const buttons = document.querySelectorAll(".filter-btn");

let allWorks = [];

function displayWorks(works) {
    gallery.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

async function fetchWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        
        if (!response.ok) {
            throw new Error("Erreur API");
        }

        const works = await response.json();
        allWorks = works;
        displayWorks(allWorks);
    } catch (err) {
        console.error(err);
    }
}

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filterName = btn.textContent.trim();
        if (filterName === "Tous") {
            displayWorks(allWorks);
        } else if (filterName === "Objects") {
            const filteredWorks = allWorks.filter(work => work.categoryId === 1);
            displayWorks(filteredWorks);
        } else if (filterName === "Appartement") {
            const filteredWorks = allWorks.filter(work => work.categoryId === 2);
            displayWorks(filteredWorks);
        } else if (filterName === "Hotel & restaurants") {
            const filteredWorks = allWorks.filter(work => work.categoryId === 3);
            displayWorks(filteredWorks);
        }
    });
});

fetchWorks();