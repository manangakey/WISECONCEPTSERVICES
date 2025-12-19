// Filtrage des formations
const filterBtns = document.querySelectorAll('.filter-btn');
const formationCards = document.querySelectorAll('.formation-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Retirer active de tous les boutons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Activer le bouton cliqué
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        formationCards.forEach(card => {
            const categories = card.getAttribute('data-categories');
            if (filter === 'all' || categories.includes(filter)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Modal d'inscription
function openModal(formationId) {
    const modal = document.getElementById('inscription-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fermer modal
document.querySelector('.close-modal').addEventListener('click', closeModal);

function closeModal() {
    const modal = document.getElementById('inscription-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Navigation formulaire
document.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
        const currentStep = document.querySelector('.form-step.active');
        const nextStep = currentStep.nextElementSibling;
        
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
    });
});

document.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
        const currentStep = document.querySelector('.form-step.active');
        const prevStep = currentStep.previousElementSibling;
        
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
    });
});

// Gestion paiement
document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const cardPayment = document.querySelector('.card-payment');
        if (e.target.value === 'card') {
            cardPayment.style.display = 'block';
        } else {
            cardPayment.style.display = 'none';
        }
    });
});

// Soumission formulaire
document.getElementById('inscription-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Simulation traitement paiement
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = 'Traitement...';
    submitBtn.disabled = true;
    
    // Ici, intégration avec Stripe/API
    setTimeout(() => {
        alert('Inscription réussie ! Vous recevrez un email de confirmation.');
        closeModal();
        submitBtn.innerHTML = 'Payer et s\'inscrire';
        submitBtn.disabled = false;
    }, 2000);
});

// Clic en dehors du modal pour fermer
window.addEventListener('click', (e) => {
    const modal = document.getElementById('inscription-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Synchronise le bouton d'inscription avec le modal
document.querySelectorAll('.formation-card .btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.formation-card');
        const title = card.querySelector('h3').textContent;
        const select = document.getElementById('formation-choix');
        
        // Trouve l'option correspondante dans la liste
        for (let option of select.options) {
            if (option.text.includes(title.split(' - ')[0]) || 
                option.text.includes(title.split(' ')[0])) {
                select.value = option.value;
                break;
            }
        }
        
        // Ouvre le modal (assurez-vous que openModal() existe)
        openModal('inscription-modal');
    });
});
