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
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("commandeModal");
    const overlay = document.getElementById("commandeOverlay");
    const openBtns = document.querySelectorAll(".btn-commander");
    const closeBtn = document.querySelector(".modal-close");

    function openModal() {
        modal.classList.add("active");
        overlay.classList.add("active");
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        modal.classList.remove("active");
        overlay.classList.remove("active");
        document.body.classList.remove("modal-open");
    }

    openBtns.forEach(btn => btn.addEventListener("click", openModal));
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);
});
    
    // 5. Gestion formulaire
    const form = document.getElementById('commandeForm');
    if (form) {
        console.log('✅ Formulaire trouvé');
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📤 Soumission formulaire commande');
            
            // Validation
            if (!form.checkValidity()) {
                console.log('⚠️ Validation échouée');
                form.reportValidity();
                return;
            }
            
            // Récupération données
            const formData = new FormData(form);
            formData.append('form_type', 'commande');
            
            // UI loading
            const submitBtn = form.querySelector('.modal-submit-btn');
            const messageDiv = document.getElementById('commandeMessage');
            
            if (submitBtn) submitBtn.classList.add('loading');
            if (messageDiv) {
                messageDiv.style.display = 'none';
                messageDiv.className = 'modal-message';
            }
            
            try {
                // Envoi
                console.log('📍 Envoi à send_commande.php');
                const response = await fetch('send_commande.php', {
                    method: 'POST',
                    body: formData
                });
                
                console.log('📥 Réponse reçue, status:', response.status);
                const result = await response.json();
                console.log('📊 Résultat:', result);
                
                // Afficher message
                if (messageDiv) {
                    messageDiv.textContent = result.message || 'Réponse serveur invalide';
                    messageDiv.className = 'modal-message ' + (result.success ? 'success' : 'error');
                    messageDiv.style.display = 'block';
                    
                    // Scroll vers message
                    setTimeout(() => {
                        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
                
                // Succès
                if (result.success) {
                    console.log('✅ Commande réussie');
                    form.reset();
                    
                    // Fermer après 3 secondes
                    setTimeout(() => {
                        closeModal();
                    }, 3000);
                }
                
            } catch (error) {
                console.error('💥 Erreur:', error);
                if (messageDiv) {
                    messageDiv.textContent = 'Erreur de connexion. Veuillez réessayer.';
                    messageDiv.className = 'modal-message error';
                    messageDiv.style.display = 'block';
                }
            } finally {
                // Reset UI
                if (submitBtn) submitBtn.classList.remove('loading');
            }
        });
    } else {
        console.error('❌ Formulaire #commandeForm non trouvé !');
    }
    
    console.log('✅ Modal commande initialisé avec succès');
});
