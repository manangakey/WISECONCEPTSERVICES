// =============================================
// PAGE « NOS TARIFS » : inscription aux formations et demande de devis
// Mêmes formulaires, mêmes envois (send_contact.php) et mêmes confirmations
// que les pages Formations (inscription) et Contact (service B2B).
// Le bouton « Commander » est géré par js/script.js (formulaire de commande en popup).
// =============================================
(function () {
    function ouvrirModal(modal) {
        modal.style.display = 'block';
        modal.scrollTop = 0;
        document.body.style.overflow = 'hidden';
    }
    function fermerModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    // Croix, clic à côté et touche Échap pour toutes les popups de la page
    document.querySelectorAll('.modal').forEach(modal => {
        modal.querySelectorAll('.close-modal').forEach(croix => {
            croix.addEventListener('click', () => fermerModal(modal));
            croix.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fermerModal(modal); } });
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) fermerModal(modal); });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal').forEach(m => { if (m.style.display === 'block') fermerModal(m); });
    });

    // =============================================
    // INSCRIPTION À UNE FORMATION (comme la page Formations)
    // =============================================
    const inscriptionModal = document.getElementById('inscription-modal');
    const inscriptionForm = document.getElementById('inscription-form');
    if (inscriptionModal && inscriptionForm) {
        const formView = document.getElementById('inscription-form-view');
        const successView = document.getElementById('inscription-success-view');
        const submitBtn = document.getElementById('inscription-submit');
        const errorBox = document.getElementById('inscription-error');

        function ouvrirInscription(formation, prix) {
            document.getElementById('summary-formation').textContent = formation;
            document.getElementById('summary-price').textContent = prix;
            inscriptionForm.reset();
            document.getElementById('inscription-formation').value = formation;
            document.getElementById('inscription-prix').value = prix;
            clearErrors();
            formView.hidden = false;
            successView.hidden = true;
            ouvrirModal(inscriptionModal);
            setTimeout(() => document.getElementById('inscription-nom').focus({ preventScroll: true }), 50);
        }

        document.querySelectorAll('[data-inscription]').forEach(bouton => {
            bouton.addEventListener('click', () => ouvrirInscription(bouton.dataset.inscription, bouton.dataset.prix || 'Sur demande'));
        });
        document.getElementById('inscription-done').addEventListener('click', () => fermerModal(inscriptionModal));

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
    }

    // =============================================
    // DEMANDE DE DEVIS (comme la demande de service B2B de la page Contact)
    // =============================================
    const devisModal = document.getElementById('devis-modal');
    const serviceForm = document.getElementById('service-form');
    const confirmation = document.getElementById('confirmation-modal');
    if (devisModal && serviceForm && confirmation) {
        const typeService = document.getElementById('service-type');

        // L'offre cliquée devient le « type de service » de la demande (Catégorie > Service > Offre)
        function ouvrirDevis(offre) {
            typeService.querySelectorAll('option[data-offre]').forEach(o => o.remove());
            if (offre) {
                const option = new Option(offre, offre, true, true);
                option.dataset.offre = '1';
                typeService.insertBefore(option, typeService.options[1] || null);
            } else {
                typeService.value = '';
            }
            serviceForm.querySelectorAll('.field-error').forEach(el => el.remove());
            serviceForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            ouvrirModal(devisModal);
            setTimeout(() => document.getElementById('service-nom').focus({ preventScroll: true }), 50);
        }

        document.querySelectorAll('[data-devis]').forEach(lien => {
            lien.addEventListener('click', (e) => {
                e.preventDefault();
                ouvrirDevis(lien.dataset.devis || '');
            });
        });

        serviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = serviceForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(serviceForm);
                formData.append('form_type', 'service');

                const response = await fetch('send_contact.php', { method: 'POST', body: formData });
                const result = await response.json();

                if (result.success) {
                    fermerModal(devisModal);
                    afficherConfirmation('✅', 'Demande envoyée !', 'Nous étudions votre projet et vous recontactons sous 24h.', 'Parfait');
                    serviceForm.reset();
                    typeService.querySelectorAll('option[data-offre]').forEach(o => o.remove());
                } else {
                    afficherConfirmation('❌', 'Envoi impossible', result.message || 'Une erreur est survenue. Veuillez réessayer.', 'Fermer');
                }
            } catch (error) {
                console.error('Erreur:', error);
                afficherConfirmation('❌', 'Envoi impossible', 'Problème de connexion. Veuillez réessayer.', 'Fermer');
            } finally {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });

        // Même fenêtre de confirmation (avec icône) que la page Contact, pour la réussite comme pour l'erreur
        function afficherConfirmation(icone, titre, message, bouton) {
            confirmation.querySelector('.confirmation-icon').textContent = icone;
            document.getElementById('confirmation-title').textContent = titre;
            document.getElementById('confirmation-message').textContent = message;
            confirmation.querySelector('.btn').textContent = bouton;
            confirmation.style.zIndex = '1001';      // au-dessus de la demande en cas d'erreur
            ouvrirModal(confirmation);
        }
        document.getElementById('confirmation-ok').addEventListener('click', () => {
            fermerModal(confirmation);
            if (devisModal.style.display === 'block') document.body.style.overflow = 'hidden';
        });

        // Vérification des champs à la sortie (comme la page Contact)
        serviceForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(champ => {
            champ.addEventListener('blur', () => validerChamp(champ));
            champ.addEventListener('input', () => effacerErreur(champ));
        });
        function validerChamp(champ) {
            const valeur = champ.value.trim();
            let message = '';
            if (!valeur) message = 'Ce champ est obligatoire';
            else if (champ.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur)) message = 'Email invalide';
            else if (champ.type === 'tel' && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(valeur)) message = 'Numéro de téléphone invalide';
            effacerErreur(champ);
            if (message) {
                champ.classList.add('error');
                const erreur = document.createElement('div');
                erreur.className = 'field-error';
                erreur.textContent = message;
                champ.parentNode.appendChild(erreur);
            }
        }
        function effacerErreur(champ) {
            champ.classList.remove('error');
            const existante = champ.parentNode.querySelector('.field-error');
            if (existante) existante.remove();
        }
    }
})();
