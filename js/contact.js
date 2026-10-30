// Sélection du type de formulaire
const tabBtns = document.querySelectorAll('.tab-btn');
const contactForms = document.querySelectorAll('.contact-form');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabType = btn.getAttribute('data-tab');
        
        // Mettre à jour les tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Afficher le bon formulaire
        contactForms.forEach(form => {
            form.classList.remove('active');
            if (form.getAttribute('data-type') === tabType) {
                form.classList.add('active');
            }
        });
    });
});

// Gestion de la soumission des formulaires
const formationForm = document.getElementById('formation-form');
const serviceForm = document.getElementById('service-form');

formationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit(e.target, 'formation');
});

serviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit(e.target, 'service');
});

async function handleFormSubmit(form, formType) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Afficher le loading
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        formData.append('form_type', formType);

        const response = await fetch('send_contact.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            showConfirmation(formType);
            form.reset();
        } else {
            showError(result.message || 'Une erreur est survenue. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Problème de connexion. Veuillez réessayer.');
    } finally {
        // Réinitialiser le bouton
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function showConfirmation(formType) {
    if (formType === 'formation') {
        openModal('✅', 'Inscription envoyée !', 'Nous vous confirmons votre inscription par email sous 24h.', 'Parfait');
    } else {
        openModal('✅', 'Demande envoyée !', 'Nous étudions votre projet et vous recontactons sous 24h.', 'Parfait');
    }
}

function showError(text) {
    openModal('❌', 'Envoi impossible', text, 'Fermer');
}

// Une seule fenêtre (avec icône) pour la réussite comme pour l'erreur
function openModal(icon, titleText, messageText, buttonText) {
    const modal = document.getElementById('confirmation-modal');
    modal.querySelector('.confirmation-icon').textContent = icon;
    document.getElementById('confirmation-title').textContent = titleText;
    document.getElementById('confirmation-message').textContent = messageText;
    modal.querySelector('.btn').textContent = buttonText;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeConfirmation() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Gestion FAQ
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Fermer tous les autres
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Ouvrir/fermer celui-ci
        item.classList.toggle('active', !isActive);
    });
});

// Validation en temps réel
function setupValidation(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearValidation(input);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    if (!value) {
        isValid = false;
        message = 'Ce champ est obligatoire';
    } else if (field.type === 'email' && !isValidEmail(value)) {
        isValid = false;
        message = 'Email invalide';
    } else if (field.type === 'tel' && !isValidPhone(value)) {
        isValid = false;
        message = 'Numéro de téléphone invalide';
    }
    
    if (!isValid) {
        showFieldError(field, message);
    } else {
        clearValidation(field);
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function showFieldError(field, message) {
    clearValidation(field);
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function clearValidation(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Initialiser la validation pour les deux formulaires
setupValidation(formationForm);
setupValidation(serviceForm);

// Fermer modal en cliquant dehors
window.addEventListener('click', (e) => {
    const modal = document.getElementById('confirmation-modal');
    if (e.target === modal) {
        closeConfirmation();
    }
});
