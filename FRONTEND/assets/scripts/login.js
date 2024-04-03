const error = document.querySelector(".error"); 
const email = document.getElementById("email");
const password = document.getElementById("password");
const submit = document.getElementById("submit");

submit.addEventListener("click", () => {
    let user = {
        email: email.value,
        password: password.value
    };
    login(user);
})

// Login function
async function login(user) {
    error.innerHTML = "";
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-z]{2,4}$/;
    const passwordRegex = /^[a-zA-Z0-9]+$/;

    if (!emailRegex.test(user.email)) {
        const p = document.createElement("p");
        p.innerHTML = "Veuillez entrer une adresse mail valide";
        error.appendChild(p);
        return;
    }

    if (user.password.length < 5 || !passwordRegex.test(user.password)) {
        const p = document.createElement("p");
        p.innerHTML = "Veuillez entrer un mot de passe valide";
        error.appendChild(p);
        return;
    }

    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(user)
        });
        const result = await response.json();

        if (result.error || result.message) {
            const p = document.createElement("p");
            p.innerHTML = "La combinaison e-mail/mot de passe est incorrecte";
            error.appendChild(p);
        } else if (result.token) {
            localStorage.setItem("token", result.token);
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Une erreur est survenue lors de la tentative de connexion:", error);
        const p = document.createElement("p");
        p.innerHTML = "Une erreur technique est survenue";
        error.appendChild(p);
    }
}