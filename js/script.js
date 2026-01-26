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

// ========== GESTION DU BOUTON "PASSER UNE COMMANDE" ==========
document.addEventListener('DOMContentLoaded', function() {
    // Gestion des boutons "Passer une commande"
    const commandeButtons = document.querySelectorAll('.open-commande-modal');
    
    commandeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Option 1 : Ouvrir dans une nouvelle fenêtre pop-up
            const popup = window.open(
                'commande.html',
                'CommandeWiseConcept',
                'width=900,height=800,scrollbars=yes,resizable=yes,top=100,left=100'
            );
            
            if (popup) {
                popup.focus();
            } else {
                // Option 2 : Si pop-up bloqué, ouvrir dans un nouvel onglet
                window.open('commande.html', '_blank');
            }
            
            // Option 3 : Vous pouvez aussi utiliser un modal JS si vous préférez
            // createCommandeModal(); // À implémenter si vous voulez un vrai modal
        });
    });
    
    // Log pour debug
    console.log(`✅ ${commandeButtons.length} bouton(s) "Passer une commande" initialisé(s)`);
});

// Fonction pour créer un modal (optionnel - plus avancé)
function createCommandeModal() {
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #151b54ee, #324499ee);
        z-index: 9998;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    // Créer l'iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'commande.html';
    iframe.style.cssText = `
        width: 90%;
        max-width: 800px;
        height: 90vh;
        border: none;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    `;
    
    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: #faaa03;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        z-index: 9999;
    `;
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    overlay.appendChild(iframe);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    // Empêcher le scroll sur le body
    document.body.style.overflow = 'hidden';
    
    // Restaurer le scroll à la fermeture
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        }
    });
}

// Images showcase
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.portfolio-track');
  if (!track) return;

  let position = 0;
  const speed = 0.015;

  fetch('api/get-random-portfolio.php')
  .then(res => {
    if (!res.ok) {
      throw new Error('Server error: ' + res.status);
    }
    return res.json();
  })
  .then(images => {
    if (!Array.isArray(images) || images.length === 0) {
      console.warn('No portfolio images found');
      return;
    }

    images.concat(images).forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      track.appendChild(img);
    });

    requestAnimationFrame(animate);
  })
  .catch(err => {
    console.error('Portfolio API error:', err);
  });

  function animate() {
    position -= speed;
    track.style.transform = `translateX(${position}%)`;

    if (Math.abs(position) >= 50) {
      position = 0;
    }

    requestAnimationFrame(animate);
  }

  // Parallaxe léger (desktop only)
  window.addEventListener('scroll', () => {
    if (window.innerWidth < 768) return;
    track.style.transform = `translateX(${position}%) translateY(${window.scrollY * 0.04}px)`;
  });
});
