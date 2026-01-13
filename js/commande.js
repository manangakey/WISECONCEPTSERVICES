// Gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation formulaire commande');
    
    const form = document.getElementById('commandeForm');
    if (!form) {
        console.error('❌ FORMULAIRE NON TROUVÉ');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const successMessage = document.getElementById('successMessage');
    
    // S'assurer que le bouton est bien un "button" et non "submit"
    submitBtn.type = 'button';
    
    // Gestion du clic sur le bouton
    submitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('🖱️ Bouton cliqué');
        
        // 1. Validation visuelle
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalid = null;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff4444';
                field.style.backgroundColor = '#fff8f8';
                isValid = false;
                if (!firstInvalid) firstInvalid = field;
            } else {
                field.style.borderColor = '';
                field.style.backgroundColor = '';
            }
        });
        
        if (!isValid) {
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            alert('⚠️ Veuillez remplir les champs obligatoires (en rouge)');
            return;
        }
        
        // 2. Préparation des données
        const formData = new FormData(form);
        
        // Ajouter un timestamp
        formData.append('timestamp', new Date().toISOString());
        
        // Debug
        console.log('📤 Données à envoyer:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        // 3. État "loading"
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        btnText.textContent = 'Envoi en cours...';
        if (spinner) spinner.style.display = 'inline-block';
        
        try {
            console.log('🚀 Envoi vers send_commande.php');
            
            // IMPORTANT: Chemin ABSOLU depuis la racine
            const response = await fetch('/send_commande.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('📥 Réponse HTTP:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Réponse JSON:', result);
            
            if (result.success) {
                // SUCCÈS COMPLET
                console.log('🎉 Commande réussie!');
                
                // Cacher le formulaire
                form.style.transition = 'all 0.5s ease';
                form.style.opacity = '0.3';
                form.style.pointerEvents = 'none';
                form.style.transform = 'scale(0.98)';
                
                // Afficher message succès
                successMessage.style.display = 'block';
                successMessage.style.animation = 'fadeIn 0.5s ease-out';
                
                // Mettre à jour le message
                successMessage.querySelector('h3').textContent = '✅ Commande confirmée !';
                successMessage.querySelector('p').textContent = result.message;
                
                // Option: Fermer après 4 secondes
                setTimeout(() => {
                    // Si c'est une popup, on ferme
                    if (window.opener && !window.opener.closed) {
                        window.close();
                    }
                    // Sinon, on laisse ouvert avec le message
                }, 4000);
                
            } else {
                // ERREUR SERVEUR
                console.error('❌ Erreur serveur:', result.message);
                alert('Désolé, une erreur est survenue: ' + result.message);
                resetButton();
            }
            
        } catch (error) {
            console.error('💥 Erreur fetch:', error);
            
            // Messages d'erreur clairs
            let userMessage = 'Erreur de connexion. ';
            if (error.message.includes('Failed to fetch')) {
                userMessage += 'Vérifiez votre connexion internet.';
            } else if (error.message.includes('HTTP')) {
                userMessage += 'Le serveur ne répond pas.';
            } else {
                userMessage += 'Détails: ' + error.message;
            }
            
            alert(userMessage);
            resetButton();
        }
    });
    
    // Fonction pour réinitialiser le bouton
    function resetButton() {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        btnText.textContent = 'Soumettre la commande';
        if (spinner) spinner.style.display = 'none';
    }
    
    // Réinitialiser les styles d'erreur quand on tape
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#324499';
            this.style.boxShadow = '0 0 0 3px rgba(50, 68, 153, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.style.boxShadow = '';
        });
    });
    
    console.log('✅ Formulaire de commande prêt !');
});
