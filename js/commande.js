// Gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Formulaire de commande initialisé');
    
    // 1. Éléments principaux
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    
    // 2. Éléments de succès
    const successMessage = document.getElementById('successMessage');
    const commandeIdElement = document.getElementById('commandeId');
    const okButton = document.getElementById('okButton');
    const newCommandButton = document.getElementById('newCommandButton');
    const countdownElement = document.getElementById('countdown');
    
    // 3. Vérifications
    if (!form) {
        console.error('❌ Formulaire non trouvé');
        return;
    }
    
    if (!successMessage) {
        console.error('❌ Message de succès non trouvé');
    }
    
    // 4. Gestion de la soumission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('📤 Envoi du formulaire...');
        
        // Validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // État de chargement
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            // Envoi des données
            const formData = new FormData(form);
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('📨 Réponse:', result);
            
            if (result.success) {
                // SUCCÈS
                console.log('🎉 Succès - Affichage message');
                
                // Cacher le formulaire
                form.style.opacity = '0';
                form.style.transition = 'opacity 0.3s';
                
                setTimeout(() => {
                    form.style.display = 'none';
                    
                    // Afficher message de succès
                    commandeIdElement.textContent = '#' + (result.commande_id || '0000');
                    successMessage.style.display = 'block';
                    successMessage.style.opacity = '0';
                    
                    // Animation d'apparition
                    setTimeout(() => {
                        successMessage.style.opacity = '1';
                        successMessage.style.transition = 'opacity 0.5s';
                    }, 10);
                    
                    // Compte à rebours
                    let countdown = 10;
                    const countdownInterval = setInterval(() => {
                        countdown--;
                        countdownElement.textContent = countdown;
                        
                        if (countdown <= 0) {
                            clearInterval(countdownInterval);
                            closePopup();
                        }
                    }, 1000);
                    
                    // Fonction de fermeture
                    function closePopup() {
                        clearInterval(countdownInterval);
                        
                        if (window.opener && !window.opener.closed) {
                            // Animation de fermeture
                            successMessage.style.opacity = '0';
                            successMessage.style.transition = 'opacity 0.3s';
                            
                            setTimeout(() => {
                                try {
                                    window.close();
                                } catch (e) {
                                    window.location.href = 'index.html';
                                }
                            }, 300);
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                    
                    // Bouton OK
                    okButton.onclick = closePopup;
                    
                    // Bouton nouvelle commande (si pas popup)
                    if (!window.opener) {
                        newCommandButton.style.display = 'inline-block';
                        newCommandButton.onclick = () => location.reload();
                    }
                    
                }, 300);
                
            } else {
                // ÉCHEC
                alert('Erreur: ' + result.message);
                resetFormUI();
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            alert('Erreur de connexion');
            resetFormUI();
        }
        
        function resetFormUI() {
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // 5. Animations d'entrée des champs
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
    
    // 6. Effets de focus
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // 7. Sélection dynamique "Autre projet"
    const commandeSelect = document.getElementById('commande');
    const descriptionTextarea = document.getElementById('description');
    
    if (commandeSelect && descriptionTextarea) {
        commandeSelect.addEventListener('change', function() {
            if (this.value === 'autre') {
                descriptionTextarea.placeholder = "Décrivez précisément votre projet...";
            } else {
                descriptionTextarea.placeholder = "Décrivez votre projet en détail...";
            }
        });
    }
    
    console.log('✨ Toutes les fonctionnalités initialisées');
});

// 8. CSS pour le message de succès (à ajouter si besoin)
const style = document.createElement('style');
style.textContent = `
    .success-message {
        display: none !important;
        opacity: 0;
        transition: opacity 0.5s ease !important;
    }
    
    .success-message.show {
        display: block !important;
        opacity: 1 !important;
    }
`;
document.head.appendChild(style);
