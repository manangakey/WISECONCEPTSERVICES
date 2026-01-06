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
// Fonction globale pour ouvrir le popup

function ouvrirPopupCommande() {
    const popup = document.getElementById('order-popup');
    if (!popup) {
        console.error('Popup non trouvé');
        return;
    }
    
    // Afficher le popup
    popup.style.display = 'flex';
    
    // Animation
    setTimeout(() => {
        popup.style.opacity = '1';
        const container = popup.querySelector('.popup-container');
        if (container) {
            container.style.transform = 'translateY(0)';
            container.style.opacity = '1';
        }
    }, 10);
    
    // Bloquer le scroll
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer le popup
function fermerPopupCommande() {
    const popup = document.getElementById('order-popup');
    if (!popup) return;
    
    // Animation de fermeture
    popup.style.opacity = '0';
    const container = popup.querySelector('.popup-container');
    if (container) {
        container.style.transform = 'translateY(30px)';
    }
    
    // Cacher après animation
    setTimeout(() => {
        popup.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation popup commande...');
    
    // 1. Configurer le bouton "Commencer"
    const commanderBtn = document.getElementById('commander-main');
    if (commanderBtn) {
        commanderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎯 Bouton "Commencer" cliqué');
            ouvrirPopupCommande();
        });
    } else {
        console.warn('⚠️ Bouton "commander-main" non trouvé. Vérifiez votre HTML.');
    }
    
    // 2. Configurer le bouton fermer
    const closeBtn = document.getElementById('close-order-popup');
    if (closeBtn) {
        closeBtn.addEventListener('click', fermerPopupCommande);
    }
    
    // 3. Fermer en cliquant en dehors
    const popup = document.getElementById('order-popup');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                fermerPopupCommande();
            }
        });
    }
    
    // 4. Fermer avec Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup && popup.style.display === 'flex') {
            fermerPopupCommande();
        }
    });
    
    // 5. Configurer le formulaire
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        configurerFormulaireCommande(orderForm);
    }
});

// Configuration du formulaire
function configurerFormulaireCommande(form) {
    const submitBtn = form.querySelector('.btn-submit-order');
    if (!submitBtn) {
        console.error('❌ Bouton submit non trouvé dans le formulaire');
        return;
    }
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Événement de soumission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('📝 Soumission du formulaire...');
        
        // Validation
        if (!this.checkValidity()) {
            // Trouver le premier champ invalide
            const invalidField = this.querySelector(':invalid');
            if (invalidField) {
                invalidField.focus();
                invalidField.style.borderColor = '#ff4757';
                invalidField.style.backgroundColor = '#fff5f5';
            }
            alert('⚠️ Veuillez remplir correctement tous les champs obligatoires.');
            return;
        }
        
        // Préparation des données
        const formData = new FormData(this);
        formData.append('form_type', 'commande');
        
        // Mode chargement
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        
        try {
            // Envoi au serveur
            console.log('📤 Envoi des données...');
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            console.log('📥 Statut réponse:', response.status);
            
            // Vérifier si la réponse est du JSON
            const responseText = await response.text();
            let result;
            
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Réponse non-JSON:', responseText);
                throw new Error('Format de réponse invalide');
            }
            
            console.log('📊 Résultat:', result);
            
            if (result.success) {
                // Succès
                alert('✅ ' + result.message);
                
                // Réinitialiser le formulaire
                this.reset();
                
                // Fermer le popup après délai
                setTimeout(() => {
                    fermerPopupCommande();
                }, 1500);
                
            } else {
                // Erreur
                alert('❌ ' + result.message);
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            alert('🚨 Erreur de connexion ou serveur. Veuillez réessayer.');
            
        } finally {
            // Réinitialiser UI
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // Validation en temps réel
    const champs = form.querySelectorAll('input, select, textarea');
    champs.forEach(champ => {
        champ.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.borderColor = '#dce1f0';
                this.style.backgroundColor = '#f8f9fc';
            }
        });
        
        champ.addEventListener('blur', function() {
            if (!this.checkValidity()) {
                this.style.borderColor = '#ff4757';
                this.style.backgroundColor = '#fff5f5';
            } else {
                this.style.borderColor = '#2ecc71';
                this.style.backgroundColor = '#f8f9fc';
            }
        });
    });
}
