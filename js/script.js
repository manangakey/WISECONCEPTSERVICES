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

// ===== GESTION DU POPUP DE COMMANDE =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation popup commande...');
    
    // Éléments
    const openBtn = document.getElementById('commander-main');
    const popup = document.getElementById('order-popup');
    const closeBtn = document.getElementById('close-order-popup');
    const orderForm = document.getElementById('order-form');
    
    // Vérifier que les éléments existent
    if (!openBtn) {
        console.error('❌ Bouton "commander-main" non trouvé');
        return;
    }
    
    if (!popup) {
        console.error('❌ Popup "order-popup" non trouvé');
        return;
    }
    
    console.log('✅ Éléments trouvés');
    
    // 1. Ouvrir le popup
    openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🎯 Bouton cliqué - ouverture popup');
        
        // Afficher le popup
        popup.style.display = 'flex';
        
        // Animation douce
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.querySelector('.popup-container').style.transform = 'translateY(0)';
        }, 10);
        
        // Bloquer le scroll de la page
        document.body.style.overflow = 'hidden';
    });
    
    // 2. Fermer le popup
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }
    
    // 3. Fermer en cliquant en dehors
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });
    
    // 4. Fermer avec Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.style.display === 'flex') {
            closePopup();
        }
    });
    
    // 5. Gérer le formulaire
    if (orderForm) {
        setupOrderForm(orderForm, popup);
    }
    
    // Fonction pour fermer le popup
    function closePopup() {
        console.log('🔒 Fermeture popup');
        
        // Animation de fermeture
        popup.style.opacity = '0';
        popup.querySelector('.popup-container').style.transform = 'translateY(20px)';
        
        // Cacher après animation
        setTimeout(() => {
            popup.style.display = 'none';
            document.body.style.overflow = ''; // Réactiver scroll
        }, 300);
    }
});

// Configuration du formulaire
function setupOrderForm(form, popup) {
    const submitBtn = form.querySelector('.btn-submit-order');
    if (!submitBtn) {
        console.error('❌ Bouton submit non trouvé');
        return;
    }
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('📝 Formulaire soumis');
        
        // Validation simple
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                field.style.borderColor = '#2ecc71';
            }
        });
        
        if (!isValid) {
            alert('⚠️ Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        // Préparation des données
        const formData = new FormData(form);
        formData.append('form_type', 'commande');
        
        // Afficher les données en console (debug)
        console.log('📤 Données envoyées:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        // État de chargement
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        
        try {
            // Envoi au serveur
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            console.log('📥 Réponse reçue - Status:', response.status);
            
            // Lire la réponse
            const result = await response.json();
            console.log('📊 Résultat:', result);
            
            if (result.success) {
                // SUCCÈS
                alert('✅ ' + result.message);
                
                // Réinitialiser le formulaire
                form.reset();
                
                // Fermer le popup après 1.5 secondes
                setTimeout(() => {
                    popup.style.display = 'none';
                    document.body.style.overflow = '';
                    
                    // Réinitialiser l'animation
                    popup.style.opacity = '1';
                    popup.querySelector('.popup-container').style.transform = 'translateY(0)';
                }, 1500);
                
            } else {
                // ERREUR
                alert('❌ ' + result.message);
            }
            
        } catch (error) {
            console.error('💥 Erreur réseau:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
            
        } finally {
            // Réinitialiser l'UI
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // Validation en temps réel
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.borderColor = '#2ecc71';
            }
        });
        
        input.addEventListener('blur', function() {
            if (!this.checkValidity()) {
                this.style.borderColor = '#e74c3c';
            }
        });
    });
}
