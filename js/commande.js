// Configuration
const CONFIG = {
    modalId: 'commande-modal',
    formId: 'commande-form',
    successId: 'success-message',
    closeBtnId: 'close-commande',
    closeSuccessId: 'close-success',
    resetBtnId: 'reset-form',
    openBtnId: 'open-commande-btn',
    countdownId: 'countdown',
    commandeRefId: 'commande-ref',
    autoCloseTime: 10000, // 10 secondes
    apiEndpoint: 'send_commande.php'
};

// Traduction des types de commande
const COMMANDE_TYPES = {
    'logo_simple': 'Logo simple',
    'logo_charte': 'Logo & charte graphique',
    'branding_complet': 'Branding complet',
    'affiche': 'Affiche',
    'flyers_rollup': 'Flyers ou Roll-up',
    'brochures': 'Brochures',
    'catalogues': 'Catalogues',
    'carte_visite': 'Carte de visite',
    'tshirt': 'T-shirt',
    'videos_promo': 'Vidéos promotionnelles',
    'montages_pro': 'Montages professionnels',
    'motion_design': 'Motion design (animation)',
    'autre': 'Autre demande'
};

// Initialisation
class CommandeSystem {
    constructor() {
        this.modal = null;
        this.form = null;
        this.successMessage = null;
        this.countdownInterval = null;
        this.timeLeft = CONFIG.autoCloseTime / 1000;
        this.init();
    }

    init() {
        // Écouteur pour ouvrir le modal
        document.addEventListener('click', (e) => {
            if (e.target.id === CONFIG.openBtnId || e.target.closest(`#${CONFIG.openBtnId}`)) {
                e.preventDefault();
                this.openModal();
            }
        });

        // Écouteur pour fermer avec ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Charger le contenu du modal
        this.loadModalContent();
    }

    async loadModalContent() {
        try {
            const response = await fetch('commande.html');
            const html = await response.text();
            
            // Extraire le contenu du body
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector('.commande-container');
            
            if (content) {
                const modalContent = document.querySelector('.commande-modal-content');
                if (modalContent) {
                    modalContent.innerHTML = content.innerHTML;
                    this.setupModalEvents();
                }
            }
        } catch (error) {
            console.error('Erreur chargement modal:', error);
            this.showError('Impossible de charger le formulaire de commande.');
        }
    }

    setupModalEvents() {
        this.modal = document.getElementById(CONFIG.modalId);
        this.form = document.getElementById(CONFIG.formId);
        this.successMessage = document.getElementById(CONFIG.successMessageId);

        // Fermer modal
        document.getElementById(CONFIG.closeBtnId)?.addEventListener('click', () => this.closeModal());
        
        // Fermer en cliquant en dehors
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Réinitialiser formulaire
        document.getElementById(CONFIG.resetBtnId)?.addEventListener('click', () => this.resetForm());

        // Fermer message succès
        document.getElementById(CONFIG.closeSuccessId)?.addEventListener('click', () => this.closeSuccessMessage());

        // Soumission formulaire
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validation en temps réel
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const requiredFields = this.form?.querySelectorAll('[required]');
        requiredFields?.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }

    validateField(field) {
        const errorId = `error-${field.name}`;
        const errorElement = document.getElementById(errorId);
        
        if (!field.checkValidity()) {
            let message = '';
            
            switch(field.type) {
                case 'checkbox':
                    message = 'Ce champ est obligatoire';
                    break;
                case 'email':
                    message = 'Veuillez entrer un email valide';
                    break;
                case 'tel':
                    message = 'Veuillez entrer un numéro valide';
                    break;
                default:
                    message = 'Ce champ est obligatoire';
            }
            
            this.showFieldError(field, errorElement, message);
            return false;
        }
        
        this.clearFieldError(field, errorElement);
        return true;
    }

    showFieldError(field, errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        field.style.borderColor = '#e74c3c';
    }

    clearFieldError(field, errorElement = null) {
        if (!errorElement) {
            errorElement = document.getElementById(`error-${field.name}`);
        }
        
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        field.style.borderColor = '';
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // Validation
        if (!this.validateForm()) {
            return;
        }

        // Préparation données
        const formData = new FormData(this.form);
        const submitBtn = this.form.querySelector('.btn-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // UI Loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Envoi au serveur
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Afficher message succès
                this.showSuccessMessage(result);
                
                // Générer référence
                const ref = `CMD-${Date.now().toString().slice(-6)}`;
                document.getElementById(CONFIG.commandeRefId).textContent = ref;
                
                // Réinitialiser formulaire
                this.form.reset();
                
                // Démarrer compte à rebours
                this.startAutoClose();
            } else {
                throw new Error(result.message || 'Erreur serveur');
            }

        } catch (error) {
            console.error('Erreur soumission:', error);
            alert(`Erreur: ${error.message}\nVeuillez réessayer ou nous contacter directement.`);
        } finally {
            // Réinitialiser UI
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showSuccessMessage(result) {
        this.form.style.display = 'none';
        document.getElementById(CONFIG.successId).classList.add('active');
    }

    startAutoClose() {
        this.timeLeft = CONFIG.autoCloseTime / 1000;
        const countdownElement = document.getElementById(CONFIG.countdownId);
        
        this.countdownInterval = setInterval(() => {
            this.timeLeft--;
            countdownElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.closeSuccessMessage();
            }
        }, 1000);
    }

    closeSuccessMessage() {
        clearInterval(this.countdownInterval);
        document.getElementById(CONFIG.successId).classList.remove('active');
        this.form.style.display = 'block';
        this.closeModal();
    }

    resetForm() {
        if (confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
            this.form.reset();
            const errorMessages = this.form.querySelectorAll('.error-message');
            errorMessages.forEach(error => error.classList.remove('show'));
            
            const inputs = this.form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.style.borderColor = '');
        }
    }

    openModal() {
        if (!this.modal) {
            this.loadModalContent();
        }
        
        document.body.style.overflow = 'hidden';
        this.modal.classList.add('active');
        
        // Focus sur premier champ
        setTimeout(() => {
            const firstInput = this.form?.querySelector('input, select, textarea');
            firstInput?.focus();
        }, 300);
    }

    closeModal() {
        document.body.style.overflow = '';
        this.modal?.classList.remove('active');
        this.resetForm();
    }

    showError(message) {
        alert(`Erreur: ${message}`);
    }
}

// Démarrer le système quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new CommandeSystem();
});
