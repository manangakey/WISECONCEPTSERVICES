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
            // Succès
            form.style.display = 'none';
            successMessage.style.display = 'block';
            successMessage.style.animation = 'fadeIn 0.5s ease-out';

            // 1. Créer un bouton "OK" dans le message
            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.style.cssText = `
                display: block;
                margin: 20px auto 0;
                padding: 12px 30px;
                background: linear-gradient(90deg, #faaa03, #8f6101);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            `;
    
            // 2. Ajouter un effet hover
            okButton.addEventListener('mouseenter', () => {
                okButton.style.transform = 'translateY(-2px)';
                okButton.style.boxShadow = '0 5px 15px rgba(250, 170, 3, 0.3)';
            });
    
            okButton.addEventListener('mouseleave', () => {
                okButton.style.transform = 'translateY(0)';
                okButton.style.boxShadow = 'none';
            });
    
            // 3. Gérer le clic sur OK
            okButton.addEventListener('click', function() {
                if (window.opener && !window.opener.closed) {
                    // Si c'est une pop-up, la fermer
                    window.close();
                } else {
                    // Sinon, rediriger vers l'accueil
                    window.location.href = 'index.html';
                }
            });
    
            // 4. Ajouter le bouton au message
            successMessage.appendChild(okButton);
    
            // 5. Optionnel : Fermer automatiquement après 10s (sécurité)
            setTimeout(() => {
                if (!document.hidden && window.opener) {
                    window.close();
                }
            }, 10000); // 10 secondes max
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


