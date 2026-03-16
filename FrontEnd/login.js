const form = document.querySelector("#login form");

async function login(email, password) {
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error("Erreur de connexion");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);

        return true;
    } catch (error) {
        console.error("Erreur login :", error);
        return false;
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    const isLoggedIn = await login(email, password);
    if (isLoggedIn) {
        window.location.href = "/index.html";
    } else {
        alert("Email ou mot de passe incorrect");
    }
});