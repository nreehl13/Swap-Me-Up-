const Supabase = supabase.createClient("https://neixymqdpagskqtdewts.supabase.co", "sb_publishable_C5NaGu086iJSwmi--V96EA_Hamle6Jp");

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Activate SimpleLightbox plugin for portfolio items
    new SimpleLightbox({
        elements: '#portfolio a.portfolio-box'
    });

});
// Activate SimpleLightbox plugin for portfolio items


// parte de las burbujas
    const sellBubbles = document.querySelectorAll('.sell-bubble');

    const sellObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.25
    });

    sellBubbles.forEach((bubble) => sellObserver.observe(bubble));


// parte de las burbujas 2
const whyCards = document.querySelectorAll('.why-card');

const whyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('why-show');
        }
    });
}, {
    threshold: 0.2
});

whyCards.forEach((card) => whyObserver.observe(card));


// que el 100 suba 
const counters = document.querySelectorAll('.counter');

const runCounter = (counter) => {
    const target = Number(counter.dataset.target);
    let current = 0;
    const duration = 1400;
    const stepTime = 20;
    const increment = target / (duration / stepTime);

    const updateCounter = () => {
        current += increment;

        if (current < target) {
            counter.textContent = Math.ceil(current) + '+';
            setTimeout(updateCounter, stepTime);
        } else {
            counter.textContent = target + '+';
        }
    };

    updateCounter();
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            runCounter(entry.target);
        }
    });
}, {
    threshold: 0.5
});

counters.forEach((counter) => counterObserver.observe(counter));


// la wea de la cinta de opciones
const impactCounters = document.querySelectorAll('.impact-counter');

const runImpactCounter = (counter) => {
    const target = Number(counter.dataset.target);
    let current = 0;
    const duration = 1300;
    const stepTime = 20;
    const increment = target / (duration / stepTime);

    const updateCounter = () => {
        current += increment;

        if (current < target) {
            counter.textContent = Math.ceil(current) + '+';
            setTimeout(updateCounter, stepTime);
        } else {
            counter.textContent = target + '+';
        }
    };

    updateCounter();
};

const impactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            runImpactCounter(entry.target);
        }
    });
}, {
    threshold: 0.5
});

impactCounters.forEach((counter) => impactObserver.observe(counter));




// LogIn
const boton = document.getElementById("BtnLogin");
if (boton) {
    boton.addEventListener("click", login);
}

async function login(event) {
    event.preventDefault();

    const email = document.getElementById("Email-login").value.trim();
    const password = document.getElementById("password-login").value;

    // Validación básica antes de llamar a Supabase
    if (!email || !password) {
        alert("Por favor completa email y contraseña.");
        return; // el usuario puede intentar de nuevo, el form sigue ahí
    }

    const { data, error } = await Supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        // Credenciales incorrectas u otro error de Supabase
        console.error("Error al iniciar sesión:", error.message);
        alert("No se pudo iniciar sesión: " + error.message);
        return; // el modal/form sigue abierto, puede reintentar
    }

    // Login correcto -> hay sesión activa
    window.location.href = "dashboard.html";
}


// SignUp
const botonSgn = document.getElementById("BtnSignup");
if (botonSgn) {
    botonSgn.addEventListener("click", SignUp);
}

async function SignUp(event) {
    event.preventDefault();

    const emailS = document.getElementById("Email-Signup").value.trim();
    const passwordS = document.getElementById("Password-Signup").value;
    const usernameS = document.getElementById("Nombre-Signup").value.trim();

    if (!emailS || !passwordS || !usernameS) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const { data, error } = await Supabase.auth.signUp({
        email: emailS,
        password: passwordS,
        options: {
            data: {
                username: usernameS
            }
        }
    });

    if (error) {
        console.error("Error al registrarse:", error.message);
        alert("No se pudo crear la cuenta: " + error.message);
        return; // puede reintentar
    }

    if (data.session) {
        // Confirmación de email desactivada: ya hay sesión activa, entra directo
        window.location.href = "dashboard.html";
    } else {
        // Confirmación de email activada: no hay sesión hasta que confirme el correo
        alert("¡Cuenta creada! Revisa tu correo para confirmar tu registro antes de iniciar sesión.");
    }
}


// Logout 
const botonLogout = document.getElementById("BtnLogout"); // agrega este id a tu botón de "Cerrar sesión"
if (botonLogout) {
    botonLogout.addEventListener("click", logout);
}

async function logout(event) {
    if (event) event.preventDefault();

    const { error } = await Supabase.auth.signOut();

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
        alert("No se pudo cerrar sesión: " + error.message);
        return;
    }

    window.location.href = "index.html"; // vuelve al inicio tras cerrar sesión
}


// AUTH: Estado de sesión — controla qué se muestra
Supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        console.log("Usuario logueado:", session.user.email);
        // Aquí podrías, por ejemplo, ocultar botones de "Iniciar sesión"/"Registrarse"
        // y mostrar el botón de "Cerrar sesión" o el nombre del usuario
    } else {
        console.log("No hay sesión activa");
    }
});
