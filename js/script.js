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

// GESTION DU LOADER (GIF)
// =============================================
function initPageLoader() {
    const pageLoader = document.getElementById('page-loader');
    
    if (!pageLoader) return;
    
    // Cache le loader quand la page est complètement chargée
    window.addEventListener('load', function() {
        // Délai minimum pour que le GIF soit vu (au moins 2 cycles)
        setTimeout(function() {
            // Ajoute la classe qui déclenche le fondu
            pageLoader.classList.add('loaded');
            
            // Optionnel : Supprime complètement l'élément après le fondu
            setTimeout(function() {
                pageLoader.style.display = 'none';
                
                // Pour économiser des ressources : stopper le GIF
                // (Note : un GIF ne peut pas être "mis en pause" via JS)
                // Vous pouvez cacher l'image ou la remplacer par une version statique
                const gif = document.querySelector('.loader-gif');
                if (gif) {
                    // Remplacer le GIF par une image statique (logo.png) pour économiser
                    gif.style.display = 'none';
                    // Ou charger une image statique en arrière-plan
                }
            }, 500); // Correspond à la durée de la transition CSS (0.5s)
        }, 2000); // Délai MINIMUM d'affichage (2 secondes)
    });
}

// Initialiser le loader au chargement du DOM
document.addEventListener('DOMContentLoaded', initPageLoader);

