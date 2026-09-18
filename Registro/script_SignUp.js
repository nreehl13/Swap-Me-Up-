// Registro/script_SignUp.js
// Usa el cliente único smuSupabase definido en script_auth.js
// (cargado antes que este archivo tanto en SignUp1.html como en SignUp2.html)
//
// IMPORTANTE: SignUp1 y SignUp2 NO son páginas protegidas por sesión.
// Un usuario puede visitarlas aunque ya tenga una sesión activa; solo
// Dashboard/dashboard.html comprueba obligatoriamente getSession().

// Evita que un submit nativo accidental (ej. Enter dentro de un input)
// recargue la página, ya que #signupForm contiene un botón type="submit"
// dentro del bloque .step-two que no se usa en este flujo.
const signupFormEl = document.getElementById('signupForm');
if (signupFormEl) {
  signupFormEl.addEventListener('submit', e => e.preventDefault());
}

// ---------- PASO 1 (SignUp1.html) ----------
const continueBtn = document.getElementById("continueBtn");

if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    const fullName = document.getElementById("signup-fullname").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const idCard = document.getElementById("signup-idcard").value.trim();

    if (!fullName || !email || !phone || !idCard) {
      alert("Por favor completa todos los campos.");
      return;
    }

    // Solo datos no sensibles se guardan temporalmente (nunca la contraseña).
    sessionStorage.setItem("smu_signup_step1", JSON.stringify({ fullName, email, phone, idCard }));
    window.location.href = "SignUp2.html";
  });
}

// ---------- MOSTRAR/OCULTAR CONTRASEÑA (SignUp2.html) ----------
// Conecta cada botón .toggle-password con el input de contraseña que
// tiene al lado dentro del mismo .input-box. Funciona tanto para el
// campo de contraseña como para el de confirmar contraseña.
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-box').querySelector('input');
    if (!input) return;
    const icon = btn.querySelector('i');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    if (icon) {
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    }
  });
});

// ---------- BARRA DE FORTALEZA DE CONTRASEÑA (SignUp2.html) ----------
// Calcula un puntaje de 0 a 5 según longitud, mayúsculas/minúsculas,
// números y símbolos, y traduce ese puntaje a un nivel visual.
function calculatePasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const signupPasswordInput = document.getElementById("signup-password");
const strengthLevelBar = document.querySelector(".strength-level");

if (signupPasswordInput && strengthLevelBar) {
  signupPasswordInput.addEventListener("input", () => {
    const password = signupPasswordInput.value;

    strengthLevelBar.classList.remove("weak", "medium", "strong");

    if (!password) {
      strengthLevelBar.style.width = "0%";
      return;
    }

    const score = calculatePasswordStrength(password);

    if (score <= 1) {
      strengthLevelBar.style.width = "25%";
      strengthLevelBar.classList.add("weak");
    } else if (score <= 3) {
      strengthLevelBar.style.width = "60%";
      strengthLevelBar.classList.add("medium");
    } else {
      strengthLevelBar.style.width = "100%";
      strengthLevelBar.classList.add("strong");
    }
  });
}

// ---------- PASO 2 (SignUp2.html) ----------
const signin2Form = document.getElementById("signin2Form");

if (signin2Form) {
  signin2Form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const step1 = JSON.parse(sessionStorage.getItem("smu_signup_step1") || "{}");
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    if (!step1.email) {
      alert("Faltan datos del paso 1. Vuelve a empezar.");
      window.location.href = "SignUp1.html";
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const submitBtn = signin2Form.querySelector('.signup-btn');
    if (submitBtn) submitBtn.disabled = true;

    const { data, error } = await smuSupabase.auth.signUp({
      email: step1.email,
      password: password,
      options: {
        data: {
          full_name: step1.fullName,
          phone: step1.phone,
          id_card: step1.idCard
        }
      }
    });

    if (submitBtn) submitBtn.disabled = false;

    if (error) {
      alert("Error al crear la cuenta: " + error.message);
      return;
    }

    // Esto NO es una comprobación de sesión para proteger la página:
    // es leer el resultado de signUp() para saber a dónde mandar al usuario.

    // CASO A: signUp devolvió sesión válida → ya está autenticado
    if (data.session) {
      sessionStorage.removeItem("smu_signup_step1");
      window.location.href = "../Dashboard/dashboard.html";
      return;
    }

    // CASO B: cuenta creada pero requiere confirmación de email
    sessionStorage.removeItem("smu_signup_step1");
    alert("¡Cuenta creada! Revisa tu correo (" + step1.email + ") para confirmar tu cuenta antes de iniciar sesión.");
  });
}
