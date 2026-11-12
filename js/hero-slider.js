// Accueil : les images de la première section défilent en boucle, dans un ordre aléatoire,
// de droite à gauche, une nouvelle image toutes les 3 secondes.
(function () {
    const cadre = document.querySelector('.hero-slider-cadre');
    if (!cadre) return;
    const slides = Array.from(cadre.querySelectorAll('.hero-slide'));
    if (slides.length < 2) return;

    const DELAI = 3000;
    let actuelle = slides.findIndex(s => s.classList.contains('actif'));
    if (actuelle < 0) actuelle = 0;
    let minuteur = null;

    // Charge toutes les images dès que la page est prête, pour un défilement fluide
    slides.forEach(s => s.removeAttribute('loading'));

    function auHasard() {
        let suivante;
        do {
            suivante = Math.floor(Math.random() * slides.length);
        } while (suivante === actuelle);
        return suivante;
    }

    function suivante() {
        const sortante = slides[actuelle];
        const index = auHasard();
        const entrante = slides[index];

        // L'image qui entre repart de la droite, sans animation pour ce placement
        entrante.classList.add('sans-transition');
        entrante.classList.remove('sortie', 'actif');
        void entrante.offsetWidth;
        entrante.classList.remove('sans-transition');

        sortante.classList.remove('actif');
        sortante.classList.add('sortie');
        entrante.classList.add('actif');
        actuelle = index;
    }

    function demarrer() {
        arreter();
        minuteur = setInterval(suivante, DELAI);
    }

    function arreter() {
        if (minuteur) clearInterval(minuteur);
        minuteur = null;
    }

    // Pause au survol de la souris : une transition déjà lancée se termine, puis l'image reste affichée
    let survol = false;
    cadre.addEventListener('mouseenter', () => {
        survol = true;
        arreter();
    });
    cadre.addEventListener('mouseleave', () => {
        survol = false;
        if (!document.hidden) demarrer();
    });

    // Pause quand l'onglet n'est pas visible (évite un enchaînement rapide au retour)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) arreter(); else if (!survol) demarrer();
    });

    demarrer();
})();
