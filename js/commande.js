// Gestion du formulaire de commande
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    
    // DÉCLARATION UNIQUE des éléments de succès
    const successMessage = document.getElementById('successMessage');
    const commandeIdElement = document.getElementById('commandeId');
    const okButton = document.getElementById('okButton');
    const newCommandButton = document.getElementById('newCommandButton');
    const countdownElement = document.getElementById('countdown');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Préparation données
        const formData = new FormData(form);
        
        // UI Loading
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // SUCCÈS - CORRECTION APPLIQUÉE ICI
                form.style.display = 'none';
                
                // Afficher le message de succès
                commandeIdElement.textContent = '#' + (result.commande_id || '0000');
                successMessage.style.display = 'block';
                
                // Compte à rebours
                let countdown = 10;
                const countdownInterval = setInterval(() => {
                    countdown--;
                    countdownElement.textContent = countdown;
                    
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        closePopupOrRedirect();
                    }
                }, 1000);
                
                // Fonction de fermeture
                function closePopupOrRedirect() {
                    clearInterval(countdownInterval);
                    
                    if (window.opener && !window.opener.closed) {
                        try {
                            window.close();
                        } catch (e) {
                            window.location.href = 'index.html';
                        }
                    } else {
                        window.location.href = 'index.html';
                    }
                }
                
                // Gestion des boutons
                okButton.addEventListener('click', closePopupOrRedirect);
                
                if (!window.opener) {
                    newCommandButton.style.display = 'inline-block';
                    newCommandButton.addEventListener('click', function() {
                        location.reload();
                    });
                }
                
            } else {
                // ÉCHEC
                alert('Erreur: ' + result.message);
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                submitBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
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




