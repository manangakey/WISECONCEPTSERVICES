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
