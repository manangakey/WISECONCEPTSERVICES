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

// Gestion des deux formulaires
document.addEventListener('DOMContentLoaded', function() {
    // Sélection des deux formulaires
    const formationForm = document.getElementById('formation-form');
    const serviceForm = document.getElementById('service-form');
    
    if (formationForm) setupForm(formationForm, 'formation');
    if (serviceForm) setupForm(serviceForm, 'service');
});

function setupForm(form, formType) {
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validation frontale
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Préparation des données
        const formData = new FormData(form);
        formData.append('form_type', formType); // Ajout du type de formulaire
        
        // UI Loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('send_contact.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Succès - afficher message et reset
                alert(result.message); // Vous pouvez remplacer par un toast plus élégant
                form.reset();
                
                // Redirection optionnelle vers une page de remerciement
                // window.location.href = 'merci.html';
            } else {
                // Erreur
                alert('Erreur: ' + result.message);
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        } finally {
            // Reset UI
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// ========== GESTION COMMANDE POPUP ==========
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du modal
    const modal = document.getElementById('commandeModal');
    const overlay = document.getElementById('commandeOverlay');
    const closeBtn = modal?.querySelector('.modal-close');
    const commanderBtns = document.querySelectorAll('.btn-commander');
    const form = document.getElementById('commandeForm');
    const submitBtn = form?.querySelector('.modal-submit-btn');
    const messageDiv = document.getElementById('commandeMessage');
    
    // 1. Ouvrir le modal
    commanderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (modal && overlay) {
                modal.style.display = 'block';
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Empêcher le scroll
                // Focus sur le premier champ
                setTimeout(() => {
                    document.getElementById('commandeNom')?.focus();
                }, 300);
            }
        });
    });
    
    // 2. Fermer le modal
    function closeModal() {
        if (modal && overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto'; // Réactiver le scroll
            // Réinitialiser le formulaire après un délai
            setTimeout(() => {
                if (form) form.reset();
                messageDiv.style.display = 'none';
                submitBtn?.classList.remove('loading');
            }, 300);
        }
    }
    
    // Fermer avec le bouton X
    closeBtn?.addEventListener('click', closeModal);
    
    // Fermer en cliquant sur l'overlay
    overlay?.addEventListener('click', closeModal);
    
    // Fermer avec la touche Echap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
            closeModal();
        }
    });
    
    // 3. Gestion du formulaire
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validation
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Récupérer les données
            const formData = new FormData(form);
            formData.append('form_type', 'commande');
            
            // UI loading
            submitBtn?.classList.add('loading');
            messageDiv.style.display = 'none';
            
            try {
                // Envoyer les données
                const response = await fetch('send_commande.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                // Afficher le message
                messageDiv.textContent = result.message;
                messageDiv.className = 'modal-message ' + (result.success ? 'success' : 'error');
                messageDiv.style.display = 'block';
                
                if (result.success) {
                    // Réinitialiser le formulaire après succès
                    form.reset();
                    // Fermer automatiquement après 3 secondes
                    setTimeout(closeModal, 3000);
                }
                
            } catch (error) {
                console.error('Erreur:', error);
                messageDiv.textContent = 'Erreur de connexion. Veuillez réessayer.';
                messageDiv.className = 'modal-message error';
                messageDiv.style.display = 'block';
            } finally {
                // Reset UI
                submitBtn?.classList.remove('loading');
                
                // Scroll vers le message
                if (messageDiv.style.display === 'block') {
                    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
});
