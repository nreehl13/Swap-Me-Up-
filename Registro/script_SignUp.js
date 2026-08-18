const SupabaseSignIn = supabase.createClient(
  "https://neixymqdpagskqtdewts.supabase.co",
  "sb_publishable_C5NaGu086iJSwmi--V96EA_Hamle6Jp"
);

// ---------- PASO 1 (Signin1.thml) ----------
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

    sessionStorage.setItem("smu_signup_step1", JSON.stringify({ fullName, email, phone, idCard }));
    window.location.href = "Signin2.html";
  });
}

// ---------- PASO 2 (Signin2.html) ----------
const signin2Form = document.getElementById("signin2Form");

if (signin2Form) {
  signin2Form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const step1 = JSON.parse(sessionStorage.getItem("smu_signup_step1") || "{}");
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!step1.email) {
      alert("Faltan datos del paso 1. Vuelve a empezar.");
      window.location.href = "Signin1.thml";
      return;
    }

    const { data, error } = await SupabaseSignIn.auth.signUp({
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

    if (error) {
      alert("Error al crear la cuenta: " + error.message);
      return;
    }

    sessionStorage.removeItem("smu_signup_step1");
    window.location.href = "dashboard.html";
  });
}
