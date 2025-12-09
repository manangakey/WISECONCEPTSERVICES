// Navigation mobile
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observer les éléments à animer
document.querySelectorAll('.service-card, .portfolio-item').forEach(el => {
    observer.observe(el);
});

function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (!backToTopButton) return;
    
    // Afficher/cacher le bouton selon le scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Retour en haut au clic
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    console.log('✅ Bouton retour en haut initialisé');
}

// Appeler cette fonction dans votre init
document.addEventListener('DOMContentLoaded', function() {
    // ... vos autres initialisations
    initBackToTop();
});

// Animation au scroll pour les cartes de service
function animateServicesOnScroll() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    // Fonction pour vérifier si un élément est dans le viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85
        );
    };
    
    // Fonction pour gérer l'animation
    const handleScrollAnimation = () => {
        serviceCards.forEach(card => {
            if (isInViewport(card)) {
                card.classList.add('in-view');
            }
        });
    };
    
    // Vérifie au chargement et au scroll
    window.addEventListener('load', handleScrollAnimation);
    window.addEventListener('scroll', handleScrollAnimation);
    
    // Déclenche une première vérification
    handleScrollAnimation();
}

// Initialise l'animation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', animateServicesOnScroll);
