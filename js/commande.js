// Gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Formulaire de commande initialisé');
    
    // Éléments
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const successMessage = document.getElementById('successMessage');
    
    // Vérifications
    if (!form) {
        console.error('❌ Formulaire non trouvé');
        return;
    }
    
    // Initialisation : cacher le message de succès (sécurité)
    if (successMessage) {
        successMessage.style.display = 'none';
        successMessage.style.opacity = '0';
        successMessage.classList.remove('show');
    }
    
    // Soumission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // État chargement
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            // Envoi
            const formData = new FormData(form);
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('📊 Résultat:', result);
            
            if (result.success) {
                // ========== SUCCÈS ==========
                console.log('✅ Commande réussie #' + result.commande_id);
                
                // 1. Animation de disparition du formulaire
                form.style.transition = 'opacity 0.5s ease';
                form.style.opacity = '0';
                
                setTimeout(() => {
                    // 2. Cacher complètement le formulaire
                    form.style.display = 'none';
                    
                    // 3. AFFICHER le message de succès
                    if (successMessage) {
                        // Remplir l'ID
                        const commandeIdElem = document.getElementById('commandeId');
                        if (commandeIdElem) {
                            commandeIdElem.textContent = '#' + result.commande_id;
                        }
                        
                        // Forcer l'affichage
                        successMessage.style.display = 'block';
                        successMessage.classList.add('show');
                        
                        // Animation d'apparition
                        setTimeout(() => {
                            successMessage.style.opacity = '1';
                        }, 10);
                        
                        console.log('🎉 Message de succès affiché');
                    }
                    
                    // 4. Compte à rebours
                    const countdownElem = document.getElementById('countdown');
                    let countdown = 10;
                    
                    if (countdownElem) {
                        const countdownInterval = setInterval(() => {
                            countdown--;
                            countdownElem.textContent = countdown;
                            
                            if (countdown <= 0) {
                                clearInterval(countdownInterval);
                                fermerFenetre();
                            }
                        }, 1000);
                    }
                    
                    // 5. Bouton OK
                    const okButton = document.getElementById('okButton');
                    if (okButton) {
                        okButton.onclick = fermerFenetre;
                    }
                    
                    // 6. Bouton nouvelle commande
                    const newCommandButton = document.getElementById('newCommandButton');
                    if (newCommandButton && !window.opener) {
                        newCommandButton.style.display = 'inline-block';
                        newCommandButton.onclick = () => location.reload();
                    }
                    
                }, 500); // Délai pour l'animation
                
            } else {
                // ÉCHEC
                alert('❌ ' + result.message);
                reinitialiserUI();
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            alert('❌ Erreur de connexion');
            reinitialiserUI();
        }
        
        function reinitialiserUI() {
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
        
        function fermerFenetre() {
            if (window.opener && !window.opener.closed) {
                window.close();
            } else {
                window.location.href = 'index.html';
            }
        }
    });
    
    // Animations des champs (optionnel)
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
        setTimeout(() => {
            input.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            input.style.opacity = '1';
            input.style.transform = 'translateY(0)';
        }, 100 + index * 50);
    });
});
