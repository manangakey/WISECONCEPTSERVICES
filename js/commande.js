// Gestion du formulaire de commande
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM chargé');
    
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    
    // Éléments de succès
    const successMessage = document.getElementById('successMessage');
    const commandeIdElement = document.getElementById('commandeId');
    const okButton = document.getElementById('okButton');
    const newCommandButton = document.getElementById('newCommandButton');
    const countdownElement = document.getElementById('countdown');
    
    console.log('📋 Éléments trouvés:');
    console.log('- Formulaire:', !!form);
    console.log('- Message succès:', !!successMessage);
    console.log('- Bouton OK:', !!okButton);
    
    if (!form) {
        console.error('❌ Formulaire non trouvé!');
        return;
    }
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('🖱️ Formulaire soumis');
        
        // Validation
        if (!form.checkValidity()) {
            console.warn('⚠️ Validation échouée');
            form.reportValidity();
            return;
        }
        
        // Préparation
        const formData = new FormData(form);
        console.log('📦 Données:', Object.fromEntries(formData));
        
        // UI Loading
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        console.log('⏳ Chargement affiché');
        
        try {
            console.log('🌐 Envoi vers send_commande.php...');
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            console.log('📥 Réponse reçue, status:', response.status);
            const result = await response.json();
            console.log('📊 Résultat JSON:', result);
            
            if (result.success) {
                console.log('🎉 SUCCÈS DÉTECTÉ');
                console.log('1. Cacher formulaire...');
                form.style.display = 'none';
                
                console.log('2. Afficher message succès...');
                console.log('   - successMessage avant:', successMessage.style.display);
                commandeIdElement.textContent = '#' + (result.commande_id || '0000');
                successMessage.style.display = 'block';
                console.log('   - successMessage après:', successMessage.style.display);
                
                console.log('3. Vérifier CSS...');
                console.log('   - Classe:', successMessage.className);
                console.log('   - CSS display:', window.getComputedStyle(successMessage).display);
                
                // Compte à rebours (DEBUG - pas de fermeture)
                let countdown = 10;
                console.log('4. Démarrer compte à rebours:', countdown + 's');
                
                const countdownInterval = setInterval(() => {
                    countdown--;
                    countdownElement.textContent = countdown;
                    console.log('   Countdown:', countdown);
                    
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        console.log('⏰ Temps écoulé (fermeture désactivée pour debug)');
                        // closePopupOrRedirect(); // DÉSACTIVÉ
                    }
                }, 1000);
                
                // Fonction de fermeture (désactivée)
                function closePopupOrRedirect() {
                    console.log('🔄 closePopupOrRedirect appelée');
                    console.log('   window.opener:', !!window.opener);
                    console.log('   window.opener fermé?:', window.opener ? window.opener.closed : 'N/A');
                    
                    clearInterval(countdownInterval);
                    
                    if (window.opener && !window.opener.closed) {
                        console.log('   Tentative fermeture popup...');
                        // window.close(); // DÉSACTIVÉ
                    } else {
                        console.log('   Tentative redirection...');
                        // window.location.href = 'index.html'; // DÉSACTIVÉ
                    }
                }
                
                // Bouton OK
                okButton.addEventListener('click', function() {
                    console.log('🆗 Bouton OK cliqué');
                    closePopupOrRedirect();
                });
                
                // Bouton nouvelle commande
                if (!window.opener) {
                    newCommandButton.style.display = 'inline-block';
                    newCommandButton.addEventListener('click', function() {
                        console.log('🔄 Bouton nouvelle commande');
                        location.reload();
                    });
                }
                
                // Afficher un message pour l'utilisateur
                alert('DEBUG MODE: Vérifiez la console F12 pour les logs');
                
            } else {
                console.error('❌ Échec du serveur:', result.message);
                alert('Erreur: ' + result.message);
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                submitBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('💥 Erreur fetch:', error);
            alert('Erreur réseau: ' + error.message);
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    console.log('✅ Formulaire initialisé avec succès');
});

console.log('✨ commande.js prêt');
    
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






