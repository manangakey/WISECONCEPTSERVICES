// =============================================
// NAVIGATION MOBILE
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    if (!hamburger || !navMenu) return;

    // Créer l'overlay pour fermer en cliquant dehors
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // Fonction pour ouvrir le menu
    function openMenu() {
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        overlay.classList.add('active');
        body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    // Fonction pour fermer le menu
    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = ''; // Réactiver le scroll
    }

    // Toggle menu au clic sur hamburger
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Fermer en cliquant sur un lien
    document.querySelectorAll('.nav-link, .nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Si c'est un lien interne (ancre), on ferme après navigation
            if (link.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
            closeMenu();
        });
    });

    // Fermer en cliquant sur l'overlay
    overlay.addEventListener('click', closeMenu);

    // Fermer avec la touche Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Empêcher la propagation des clics dans le menu
    navMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
});

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

// Les formulaires de contact.html sont gérés dans js/contact.js

// ========== BOUTONS "PASSER UNE COMMANDE" / "COMMANDER" : FORMULAIRE EN POPUP ==========
// Le formulaire commande.html s'ouvre par-dessus la page (même design, même envoi).
// Un bouton qui porte data-offre="ID" (page Nos tarifs) ouvre le formulaire avec cette offre déjà choisie.
function ouvrirCommandePopup(offreId) {
    if (document.getElementById('commande-popup')) return;
    const precedent = document.activeElement;

    const fond = document.createElement('div');
    fond.id = 'commande-popup';
    fond.setAttribute('role', 'dialog');
    fond.setAttribute('aria-modal', 'true');
    fond.setAttribute('aria-label', 'Passer une commande');
    fond.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(10,14,45,0.72);' +
        'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .25s ease;';

    const cadre = document.createElement('iframe');
    cadre.src = '/commande.html' + (offreId ? '?offre=' + encodeURIComponent(offreId) : '');
    cadre.title = 'Formulaire de commande';
    cadre.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;color-scheme:normal;';
    cadre.setAttribute('allowtransparency', 'true');

    const fermerBtn = document.createElement('button');
    fermerBtn.type = 'button';
    fermerBtn.setAttribute('aria-label', 'Fermer le formulaire');
    fermerBtn.innerHTML = '&times;';
    fermerBtn.style.cssText = 'position:absolute;top:14px;right:16px;z-index:2;width:42px;height:42px;border-radius:50%;' +
        'border:none;cursor:pointer;background:#faaa03;color:#fff;font-size:26px;line-height:1;box-shadow:0 6px 18px rgba(0,0,0,.3);';

    function fermer() {
        window.removeEventListener('message', recevoir);
        document.removeEventListener('keydown', echap);
        fond.style.opacity = '0';
        setTimeout(() => {
            fond.remove();
            document.body.style.overflow = '';
            if (precedent && precedent.focus) precedent.focus();
        }, 250);
    }
    // Messages envoyés par le formulaire (fermeture après envoi, clic à côté, touche Échap)
    function recevoir(e) {
        if (e.origin === window.location.origin && e.data && e.data.type === 'wcs-commande-fermer') fermer();
    }
    function echap(e) { if (e.key === 'Escape') fermer(); }

    fermerBtn.addEventListener('click', fermer);
    window.addEventListener('message', recevoir);
    document.addEventListener('keydown', echap);

    fond.append(cadre, fermerBtn);
    document.body.appendChild(fond);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { fond.style.opacity = '1'; });
    cadre.addEventListener('load', () => { try { cadre.contentWindow.focus(); } catch (err) {} });
}

document.addEventListener('click', function(e) {
    const bouton = e.target.closest('.open-commande-modal');
    if (!bouton) return;
    e.preventDefault();
    ouvrirCommandePopup(bouton.dataset.offre || '');
});
