fetch("http://localhost:5678/api/works")
    .then(res => {
        if (!res.ok) {
            throw new Error("Erreur API");
        }
        return res.json();
    })
    .then(works => {
        console.log("Les projets réalisés :", works);
    })
    .catch(err => {
        console.error(err);
    });

const buttons = document.querySelectorAll(".filter-btn");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});