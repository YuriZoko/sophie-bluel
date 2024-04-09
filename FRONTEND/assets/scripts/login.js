const errorBox = document.querySelector(".error-box"); 
const emailField = document.getElementById("email-field");
const passwordField = document.getElementById("password-field");
const loginButton = document.getElementById("login-button");

loginButton.addEventListener("click", () => {
    let userCredentials = {
        email: emailField.value,
        password: passwordField.value
    };
    authenticateUser(userCredentials);
})

// Fonction d'authentification
async function authenticateUser(userCredentials) {
    errorBox.innerHTML = "";
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-z]{2,4}$/;
    const passwordPattern = /^[a-zA-Z0-9]+$/;

    if (!emailPattern.test(userCredentials.email)) {
        const errorParagraph = document.createElement("p");
        errorParagraph.innerHTML = "Veuillez entrer une adresse e-mail valide.";
        errorBox.appendChild(errorParagraph);
        return;
    }

    if (!passwordPattern.test(userCredentials.password)) {
        const errorParagraph = document.createElement("p");
        errorParagraph.innerHTML = "Veuillez entrer un mot de passe valide.";
        errorBox.appendChild(errorParagraph);
        return;
    }

    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(userCredentials)
        });
        const result = await response.json();

        if (result.error || result.message) {
            const errorParagraph = document.createElement("p");
            errorParagraph.innerHTML = "Combinaison e-mail/mot de passe incorrecte.";
            errorBox.appendChild(errorParagraph);
        } else if (result.token) {
            localStorage.setItem("accessToken", result.token);
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Une erreur est survenue lors de la tentative de connexion:", error);
        const errorParagraph = document.createElement("p");
        errorParagraph.innerHTML = "Une erreur s'est produite. Veuillez réessayer plus tard.";
        errorBox.appendChild(errorParagraph);
    }
}
