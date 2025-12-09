// Animation des cartes de service au scroll
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    // Fonction pour vérifier si un élément est visible à l'écran
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85
        );
    }
    
    // Fonction pour gérer l'animation
    function handleScrollAnimation() {
        serviceCards.forEach(card => {
            if (isElementInViewport(card) && !card.classList.contains('animated')) {
                card.classList.add('animated');
            }
        });
    }
    
    // Écouter le scroll et le chargement
    window.addEventListener('scroll', handleScrollAnimation);
    window.addEventListener('load', handleScrollAnimation);
    
    // Déclencher une première vérification
    handleScrollAnimation();
});
