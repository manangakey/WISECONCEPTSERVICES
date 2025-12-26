// Filtrage portfolio
const portfolioFilters = document.querySelectorAll('.portfolio-filter');
const galleryItems = document.querySelectorAll('.gallery-item');

portfolioFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Retirer active de tous les filtres
        portfolioFilters.forEach(f => f.classList.remove('active'));
        // Activer le filtre cliqué
        filter.classList.add('active');
        
        const filterValue = filter.getAttribute('data-filter');
        
        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// DONNÉES DES PROJETS
function getProjectData(projectId) {
    const projects = {
        'logo1': {
            title: 'Logo "Ducky restaurant"',
            description: 'Identité visuelle complète pour un restaurant. Création d\'un logo qui allie modernité et chaleur, avec une charte graphique adaptée à tous supports.',
            tags: ['Logo', 'Restauration', 'Identité visuelle'],
            imageUrl: '/assets/images/portfolio/logos/logo1.png'
        },
        'affiche1': {
            title: 'Carte de visite professionnelle',
            description: 'Rendez-vous évenementiel - Verte de création, dorée d’ambition.',
            tags: ['Affiche', 'Carte de visite', 'Événement'],
            imageUrl: '/assets/images/portfolio/affiches/affiche1.png' // AJOUTEZ LE CHEMIN
        },
        'flyer1': {
            title: 'Dépliant pour une structure Digital',
            description: 'Crédit | Virement à partir de votre téléphone - Tout en un!',
            tags: ['Flyer', 'Commercial', 'Promotion'],
            imageUrl: '/assets/images/portfolio/flyers/flyer1.png' // AJOUTEZ LE CHEMIN
        },
        'video1': {
            title: 'Vidéo Corporate TechStart',
            description: 'Vidéo de présentation d\'entreprise avec motion design. Communication moderne et percutante.',
            tags: ['Vidéo', 'Corporate', 'Motion Design'],
            imageUrl: '/assets/images/portfolio/videos/thumbnail-corporate.jpg' // AJOUTEZ LE CHEMIN (miniature)
        }
    };
    
    // Retourne les données du projet ou un projet par défaut AVEC imageUrl
    return projects[projectId] || {
        title: 'Projet Créatif',
        description: 'Une réalisation unique alliant créativité et expertise technique.',
        tags: ['Design', 'Créatif'],
        imageUrl: '' // Chemin d'image par défaut (vide ou placeholder)
    };
}

// =============================================
// LIGHTBOX
// =============================================

function openLightbox(projectId) {
    const lightbox = document.getElementById('lightbox');
    
    // 1. Récupérer les données du projet
    const projectData = getProjectData(projectId);
    
    // 2. Mettre à jour le contenu TEXTUEL de la lightbox
    document.getElementById('lightbox-title').textContent = projectData.title;
    document.getElementById('lightbox-description').textContent = projectData.description;
    
    // 3. Mettre à jour l'IMAGE
    const lightboxImageContainer = document.querySelector('.lightbox-image');
    if (lightboxImageContainer) {
        lightboxImageContainer.innerHTML = ''; // Vider le contenu existant
        
        if (projectData.imageUrl && projectData.imageUrl.trim() !== '') {
            // Créer et ajouter l'image
            const img = document.createElement('img');
            img.src = projectData.imageUrl;
            img.alt = `Présentation du projet: ${projectData.title}`;
            img.style.width = '100%';
            img.style.borderRadius = '10px';
            img.style.maxHeight = '70vh'; // Empêche l'image d'être trop haute
            img.style.objectFit = 'contain';
            lightboxImageContainer.appendChild(img);
        } else {
            // Fallback si pas d'image
            lightboxImageContainer.innerHTML = '<div class="lightbox-placeholder" style="padding: 3rem; text-align: center; color: #666;">Aperçu du projet</div>';
        }
    }
    
    // 4. Mettre à jour les TAGS
    const tagsContainer = document.getElementById('lightbox-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        if (projectData.tags && Array.isArray(projectData.tags)) {
            projectData.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
    }
    
    // 5. Afficher la lightbox
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =============================================
// GESTION DES ÉVÉNEMENTS
// =============================================

// Fermer lightbox avec la croix
document.querySelector('.close-lightbox')?.addEventListener('click', closeLightbox);

// Clic en dehors de la lightbox pour fermer
window.addEventListener('click', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Navigation au clavier (Escape)
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.style.display === 'block' && e.key === 'Escape') {
        closeLightbox();
    }
});

// Animation au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const portfolioObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observer les éléments du portfolio
document.querySelectorAll('.portfolio-card').forEach(card => {
    portfolioObserver.observe(card);
});
