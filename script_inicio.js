/*!
* Start Bootstrap - Creative v7.0.7 (https://startbootstrap.com/theme/creative)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
*/
//
// Scripts
// 

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


// Redirigir a Sign Up (SignIn1.html)
const btnRegister = document.querySelector('.btn-register');
if (btnRegister) {
    btnRegister.addEventListener('click', () => {
        window.location.href = 'Registro/SignUp1.html';
    });
}
// Redirigir a Sign In (Registro/SignIn.html)
const btnLogin = document.querySelector('#btnLogin');
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        window.location.href = 'Registro/SignIn.html';
    });
}
