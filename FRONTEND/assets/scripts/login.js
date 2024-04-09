const errorBox = document.querySelector(".error-box");
const emailField = document.getElementById("email-field");
const passwordField = document.getElementById("password-field");
const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", authenticateUser);
async function authenticateUser() {
    const { value: email } = emailField;
    const { value: password } = passwordField;
    errorBox.innerHTML = "";
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-z]{2,4}$/;
    const passwordPattern = /^[a-zA-Z0-9]+$/;
    const createErrorParagraph = message => {
        const errorParagraph = document.createElement("p");
        errorParagraph.innerHTML = message;
        errorBox.appendChild(errorParagraph);
    };
    if (!emailPattern.test(email)) {
        createErrorParagraph(`Veuillez entrer une adresse e-mail valide.`);
        return;
    }
    if (!passwordPattern.test(password)) {
        createErrorParagraph(`Veuillez entrer un mot de passe valide.`);
        return;
    }
    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ email, password })
        });
        const { error, message, token } = await response.json();
        if (error || message) {
            createErrorParagraph(`Combinaison e-mail/mot de passe incorrecte.`);
        } else if (token) {
            localStorage.setItem("accessToken", token);
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Une erreur est survenue lors de la tentative de connexion:", error);
        createErrorParagraph(`Une erreur s'est produite. Veuillez réessayer plus tard.`);
    }
}