// Registro/script_SignIn.js
// Usa el cliente único smuSupabase definido en script_auth.js
// (cargado antes que este archivo en SignIn.html).
//
// IMPORTANTE: SignIn.html NO es una página protegida por sesión.
// Un usuario puede visitarla aunque ya tenga una sesión activa; solo
// Dashboard/dashboard.html comprueba obligatoriamente getSession().

const signinForm = document.getElementById("signinForm");
const signinError = document.getElementById("signinError");
const signinBtn = document.getElementById("signinBtn");

function showSigninError(message) {
  signinError.textContent = message;
  signinError.hidden = false;
}

function hideSigninError() {
  signinError.hidden = true;
  signinError.textContent = "";
}

// Toggle mostrar/ocultar contraseña (mismo patrón visual que SignUp)
const togglePasswordBtn = document.querySelector(".toggle-password");
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    const passwordInput = document.getElementById("signin-password");
    const icon = togglePasswordBtn.querySelector("i");
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    if (icon) {
      icon.classList.toggle("fa-eye", !isHidden);
      icon.classList.toggle("fa-eye-slash", isHidden);
    }
  });
}

if (signinForm) {
  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideSigninError();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    if (!email || !password) {
      showSigninError("Por favor completa tu email y contraseña.");
      return;
    }

    signinBtn.disabled = true;

    const { data, error } = await smuSupabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    signinBtn.disabled = false;

    if (error) {
      showSigninError("No se pudo iniciar sesión: " + error.message);
      return;
    }

    // Solo redirigimos si Supabase confirma que existe una sesión válida.
    if (data && data.session) {
      window.location.href = "../Dashboard/dashboard.html";
      return;
    }

    // Caso inesperado: no hubo error pero tampoco sesión.
    showSigninError("No se pudo iniciar sesión. Intenta nuevamente.");
  });
}