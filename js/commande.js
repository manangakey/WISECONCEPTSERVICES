// Gestion du formulaire de commande

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) return;
    
    // Gestion de la soumission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validation du formulaire
        if (!form.checkValidity()) {
            // Trouver le premier champ invalide
            const invalidField = form.querySelector(':invalid');
            if (invalidField) {
                invalidField.focus();
                invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Animation d'erreur
                invalidField.style.borderColor = '#f00';
                setTimeout(() => {
                    invalidField.style.borderColor = '';
                }, 2000);
            }
            return;
        }
        
        // Préparer les données
        const formData = new FormData(form);
        
        // UI Loading state
        submitBtn.classList.add('loading');
        btnText.textContent = 'Traitement en cours...';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            console.log('📤 Envoi de la commande...');
            
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            console.log('📥 Réponse reçue:', response.status);
            
            const result = await response.json();
            console.log('📊 Résultat:', result);
            
            if (result.success) {
                // 1. Cacher le formulaire
                form.style.display = 'none';
    
                // 2. Afficher le message de succès
                const successMessage = document.getElementById('successMessage');
                const commandeIdElement = document.getElementById('commandeId');
                const okButton = document.getElementById('okButton');
                const newCommandButton = document.getElementById('newCommandButton');
                const countdownElement = document.getElementById('countdown');
    
                // 3. Remplir les informations
                commandeIdElement.textContent = '#' + (result.commande_id || '0000');
                successMessage.style.display = 'block';
    
                // 4. Compte à rebours (10 secondes)
                let countdown = 10;
                const countdownInterval = setInterval(() => {
                    countdown--;
                    countdownElement.textContent = countdown;
        
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        closePopupOrRedirect();
                    }
                }, 1000);
    
                // 5. Fonction pour fermer/rediriger
                function closePopupOrRedirect() {
                    clearInterval(countdownInterval);
        
                    if (window.opener && !window.opener.closed) {
                        // Si c'est une pop-up
                        try {
                            window.close();
                        } catch (e) {
                            // Si la fermeture échoue, rediriger
                            window.location.href = 'index.html';
                        }
                    } else {
                        // Si c'est un onglet normal
                        window.location.href = 'index.html';
                    }
                }
    
                // 6. Bouton OK
                okButton.addEventListener('click', closePopupOrRedirect);
    
                // 7. Optionnel : Bouton "Nouvelle commande" (pour les non-popups)
                if (!window.opener) {
                    newCommandButton.style.display = 'inline-block';
                    newCommandButton.addEventListener('click', function() {
                        location.reload(); // Recharge la page pour nouvelle commande
                    });
                }
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
            
            // Reset UI
            submitBtn.classList.remove('loading');
            btnText.textContent = 'Soumettre la commande';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // Animation d'entrée pour les champs
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
        input.style.opacity = '0';
        input.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            input.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            input.style.opacity = '1';
            input.style.transform = 'translateY(0)';
        }, 100 + index * 50);
    });
    
    // Effet de focus amélioré
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // Sélection dynamique pour "Autre projet"
    const commandeSelect = document.getElementById('commande');
    const descriptionTextarea = document.getElementById('description');
    
    commandeSelect.addEventListener('change', function() {
        if (this.value === 'autre') {
            descriptionTextarea.placeholder = "Décrivez précisément votre projet : type de design, utilisations prévues, spécifications techniques...";
        } else {
            descriptionTextarea.placeholder = "Décrivez votre projet en détail : objectifs, dimensions, couleurs, délais souhaités...";
        }
    });
    
    // Log pour debug
    console.log('✅ Formulaire de commande initialisé');

});



