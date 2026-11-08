// =============================================
// ACCUEIL - « NOS RÉALISATIONS » : les projets du portfolio défilent au hasard,
// une carte à la fois, de bas en haut avec un rebond.
// Les 4 cartes écrites dans index.html restent affichées si le portfolio ne répond pas.
// =============================================
(function () {
    const grille = document.getElementById('portfolioGrid');
    if (!grille || !window.fetch) return;

    const DELAI = 3000;        // une nouvelle image toutes les 3 secondes
    const sansAnimation = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cartes = Array.from(grille.querySelectorAll('.portfolio-item'));
    if (!cartes.length) return;

    let projets = [];
    let affiches = [];         // projet affiché dans chaque carte
    let derniere = -1;         // dernière carte changée (pour ne pas changer deux fois la même)
    let minuterie = null, enCours = false, visible = false, survol = false;

    const auHasard = (n) => Math.floor(Math.random() * n);
    function melanger(liste) {
        for (let i = liste.length - 1; i > 0; i--) {
            const j = auHasard(i + 1);
            [liste[i], liste[j]] = [liste[j], liste[i]];
        }
        return liste;
    }

    // Contenu d'une carte (mêmes classes que dans index.html : le design ne change pas)
    function creerContenu(p) {
        const bloc = document.createElement('div');
        bloc.style.cssText = 'position:relative;height:100%;';
        const etiquette = document.createElement('div');
        etiquette.className = 'portfolio-category';
        etiquette.textContent = p.c;
        const image = document.createElement('div');
        image.className = 'portfolio-placeholder';
        image.setAttribute('role', 'img');
        image.setAttribute('aria-label', p.t);
        image.style.backgroundImage = 'url("' + p.i.replace(/["\\\n\r]/g, '') + '")';
        bloc.append(etiquette, image);
        return bloc;
    }

    // Charge l'image avant de l'afficher ; une image introuvable est retirée de la liste
    function precharger(p) {
        return new Promise((ok) => {
            const img = new Image();
            img.onload = () => ok(true);
            img.onerror = () => { projets = projets.filter((x) => x !== p); ok(false); };
            img.src = p.i;
        });
    }

    // Un projet qui n'est affiché dans aucune carte (ou au moins différent de celui de la carte)
    function projetSuivant(index) {
        const libres = projets.filter((p) => !affiches.includes(p));
        if (libres.length) return libres[auHasard(libres.length)];
        const autres = projets.filter((p) => p !== affiches[index]);
        return autres.length ? autres[auHasard(autres.length)] : null;
    }

    async function changerUneCarte() {
        if (enCours || projets.length < 2) return;
        enCours = true;
        let index = auHasard(cartes.length);
        if (cartes.length > 1 && index === derniere) index = (index + 1 + auHasard(cartes.length - 1)) % cartes.length;
        const p = projetSuivant(index);
        if (!p || !(await precharger(p))) { enCours = false; return; }

        const carte = cartes[index];
        const ancien = carte.lastElementChild;
        const nouveau = creerContenu(p);
        nouveau.style.cssText = 'position:absolute;inset:0;';
        carte.append(nouveau);
        affiches[index] = p;
        derniere = index;

        // L'ancienne image monte et s'efface, la nouvelle arrive du bas en rebondissant
        const sortie = ancien.animate(
            [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }],
            { duration: 650, easing: 'cubic-bezier(0.55, 0, 0.75, 0.2)', fill: 'forwards' }
        );
        const entree = nouveau.animate([
            { transform: 'translateY(100%)', offset: 0 },
            { transform: 'translateY(-9%)', offset: 0.55 },
            { transform: 'translateY(4%)', offset: 0.72 },
            { transform: 'translateY(-2%)', offset: 0.86 },
            { transform: 'translateY(0)', offset: 1 }
        ], { duration: 1100, easing: 'ease-out' });

        await Promise.all([entree.finished, sortie.finished]).catch(() => {});
        ancien.remove();
        nouveau.style.cssText = 'position:relative;height:100%;';
        enCours = false;
    }

    function demarrer() {
        arreter();
        if (projets.length < 2 || !visible || survol || document.hidden || sansAnimation.matches || !Element.prototype.animate) return;
        minuterie = setInterval(changerUneCarte, DELAI);
    }
    function arreter() { clearInterval(minuterie); minuterie = null; }

    fetch('/portfolio-accueil.php', { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : []))
        .then((liste) => {
            projets = melanger((Array.isArray(liste) ? liste : []).filter((p) => p && p.i && p.t));
            if (!projets.length) return;   // on garde les cartes d'origine

            // Premier affichage : un projet différent par carte, tiré au hasard
            cartes.forEach((carte, i) => {
                const p = projets[i % projets.length];
                carte.replaceChildren(creerContenu(p));
                affiches[i] = p;
            });

            // Défile seulement quand la section est à l'écran
            new IntersectionObserver((entrees) => {
                visible = entrees[0].isIntersecting;
                demarrer();
            }, { threshold: 0.2 }).observe(grille);

            // Pause quand la souris est sur une carte
            grille.addEventListener('mouseenter', () => { survol = true; arreter(); });
            grille.addEventListener('mouseleave', () => { survol = false; demarrer(); });
            document.addEventListener('visibilitychange', demarrer);
            if (sansAnimation.addEventListener) sansAnimation.addEventListener('change', demarrer);
        })
        .catch(() => {});   // portfolio indisponible : on garde les cartes d'origine
})();
