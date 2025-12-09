// =============================================
// NAVIGATION MOBILE
// =============================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Fermer le menu en cliquant sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// =============================================
// SMOOTH SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// =============================================
// ANIMATION AU SCROLL (VERSION SIMPLIFIÉE)
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.service-card, .portfolio-item, .formation-card');
    
    // Créer l'observateur une seule fois
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Quand l'élément entre dans le viewport
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Arrêter d'observer cet élément (optionnel, économise des ressources)
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15, // Seuil de visibilité (15%)
        rootMargin: '0px 0px -10% 0px' // Déclenche l'animation un peu avant que l'élément n'entre complètement
    });
    
    // Démarrer l'observation pour chaque élément
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
});

// =============================================
// BOUTON RETOUR EN HAUT
// =============================================
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (!backToTopButton) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =============================================
// INITIALISATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
});
