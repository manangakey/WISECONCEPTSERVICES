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

// =============================================
// DEMANDE D'INSCRIPTION (popup)
// =============================================
const inscriptionModal = document.getElementById('inscription-modal');
const inscriptionForm = document.getElementById('inscription-form');
const formView = document.getElementById('inscription-form-view');
const successView = document.getElementById('inscription-success-view');
const submitBtn = document.getElementById('inscription-submit');
const errorBox = document.getElementById('inscription-error');

// Ouvre la popup avec la formation et le prix de la carte cliquée
function openInscription(card) {
    const formation = card.querySelector('h3').textContent.trim();
    const priceEl = card.querySelector('.formation-price .price');
    const prix = priceEl ? priceEl.textContent.replace(/\s+/g, '').replace('$', ' $') : 'Sur demande';

    document.getElementById('summary-formation').textContent = formation;
    document.getElementById('summary-price').textContent = prix;
    document.getElementById('inscription-formation').value = formation;
    document.getElementById('inscription-prix').value = prix;

    inscriptionForm.reset();
    clearErrors();
    formView.hidden = false;
    successView.hidden = true;

    inscriptionModal.style.display = 'block';
    inscriptionModal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('inscription-nom').focus({ preventScroll: true }), 50);
}

function closeModal() {
    inscriptionModal.style.display = 'none';
    document.body.style.overflow = '';
}

document.querySelectorAll('.btn-inscription').forEach(button => {
    button.addEventListener('click', () => openInscription(button.closest('.formation-card')));
});

document.querySelector('.close-modal').addEventListener('click', closeModal);
document.getElementById('inscription-done').addEventListener('click', closeModal);

// Clic en dehors de la popup ou touche Échap pour fermer
window.addEventListener('click', (e) => {
    if (e.target === inscriptionModal) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && inscriptionModal.style.display === 'block') closeModal();
});

// Numéro RDC : 9 chiffres après +243 (on tolère un 0 initial ou « 243 » saisi)
function normalizePhone(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('243')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    return digits;
}

function setError(field, message) {
    field.classList.add('error');
    errorBox.textContent = message;
    field.focus();
}

function clearErrors() {
    errorBox.textContent = '';
    inscriptionForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

inscriptionForm.addEventListener('input', (e) => {
    e.target.classList.remove('error');
    errorBox.textContent = '';
});

inscriptionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const nom = document.getElementById('inscription-nom');
    const email = document.getElementById('inscription-email');
    const tel = document.getElementById('inscription-tel');
    const consent = document.getElementById('inscription-consent');
    const phoneDigits = normalizePhone(tel.value);

    if (nom.value.trim().length < 2) return setError(nom, 'Veuillez indiquer votre nom complet.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return setError(email, 'Veuillez indiquer une adresse e-mail valide.');
    if (phoneDigits.length !== 9) return setError(tel, 'Le numéro doit comporter 9 chiffres après +243.');
    if (!consent.checked) {
        errorBox.textContent = 'Veuillez accepter d\'être recontacté(e) pour envoyer votre demande.';
        return;
    }

    const formData = new FormData(inscriptionForm);
    formData.append('form_type', 'formation');
    formData.append('telephone', '+243 ' + phoneDigits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'));

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
        const response = await fetch('send_contact.php', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
            document.getElementById('success-nom').textContent = nom.value.trim();
            document.getElementById('success-formation').textContent = document.getElementById('inscription-formation').value;
            formView.hidden = true;
            successView.hidden = false;
            inscriptionModal.scrollTop = 0;
        } else {
            errorBox.textContent = result.message || 'Une erreur est survenue. Veuillez réessayer.';
        }
    } catch (error) {
        console.error('Erreur:', error);
        errorBox.textContent = 'Problème de connexion. Veuillez réessayer.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Soumettre';
    }
});
