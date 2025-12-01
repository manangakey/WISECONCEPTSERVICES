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

// Lightbox
function openLightbox(projectId) {
    const lightbox = document.getElementById('lightbox');
    const projectData = getProjectData(projectId);
    
    // Mettre à jour le contenu de la lightbox
    document.getElementById('lightbox-title').textContent = projectData.title;
    document.getElementById('lightbox-description').textContent = projectData.description;
    
    // Mettre à jour les tags
    const tagsContainer = document.getElementById('lightbox-tags');
    tagsContainer.innerHTML = '';
    projectData.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
    
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Données des projets (à remplacer par vos vraies données)
function getProjectData(projectId) {
    const projects = {
        'logo1': {
            title: 'Logo "Gusto Italiano"',
            description: 'Création d\'une identité visuelle complète pour un restaurant italien authentique. Le logo combine élégance et convivialité.',
            tags: ['Logo', 'Restaurant', 'Identité Visuelle']
        },
        'affiche1': {
            title: 'Affiche Concert Jazz',
            description: 'Design rétro moderne pour un festival de jazz. Typographie expressive et palette de couleurs vibrante.',
            tags: ['Affiche', 'Événement', 'Musique']
        },
        'flyer1': {
            title: 'Flyer Soldes d\'Été',
            description: 'Flyer promotionnel pour une boutique de mode. Design attractif mettant en valeur les promotions saisonnières.',
            tags: ['Flyer', 'Commercial', 'Promotion']
        },
        'video1': {
            title: 'Vidéo Corporate TechStart',
            description: 'Vidéo de présentation d\'entreprise avec motion design. Communication moderne et percutante.',
            tags: ['Vidéo', 'Corporate', 'Motion Design']
        }
    };
    
    return projects[projectId] || {
        title: 'Projet Créatif',
        description: 'Une réalisation unique alliant créativité et expertise technique.',
        tags: ['Design', 'Créatif']
    };
}

// Fermer lightbox
document.querySelector('.close-lightbox').addEventListener('click', closeLightbox);

// Clic en dehors de la lightbox pour fermer
window.addEventListener('click', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Navigation au clavier
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