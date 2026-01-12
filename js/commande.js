// Gestion de formulaire
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) {
        console.error('❌ Formulaire non trouvé !');
        return;
    }
    
    console.log('✅ Formulaire trouvé, initialisation...');
    
    // Gestion de la soumission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('🟢 Submit détecté');
        
        // Validation basique
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ff0000';
                field.focus();
                console.warn('⚠️ Champ requis vide:', field.name);
            }
        });
        
        if (!isValid) {
            alert('Veuillez remplir tous les champs obligatoires (*)');
            return;
        }
        
        // UI Loading state
        submitBtn.classList.add('loading');
        btnText.textContent = 'Envoi en cours...';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        // Préparer les données
        const formData = new FormData(form);
        
        // DEBUG : Afficher les données envoyées
        console.log('📤 Données envoyées:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        try {
            console.log('🚀 Envoi à send_commande.php...');
            
            // IMPORTANT : Chemin ABSOLU pour éviter les problèmes
            const response = await fetch('/send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            console.log('📥 Status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📊 Réponse JSON:', result);
            
            if (result.success) {
                // SUCCÈS
                console.log('✅ Commande réussie! ID:', result.commande_id);
                
                // Cacher le formulaire
                form.style.opacity = '0';
                form.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    form.style.display = 'none';
                    successMessage.style.display = 'block';
                    successMessage.style.animation = 'fadeIn 0.5s ease-out';
                    
                    // Optionnel : Fermer la fenêtre après 5 secondes
                    setTimeout(() => {
                        window.close(); // Ferme le pop-up
                    }, 3000);
                    
                }, 500);
                
            } else {
                // ERREUR
                console.error('❌ Erreur serveur:', result.message);
                alert('Erreur: ' + result.message);
                
                // Réinitialiser UI
                submitBtn.classList.remove('loading');
                btnText.textContent = 'Soumettre la commande';
                spinner.style.display = 'none';
                submitBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('💥 Erreur fetch:', error);
            
            // Messages d'erreur spécifiques
            let errorMessage = 'Erreur de connexion. ';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage += 'Vérifiez votre connexion internet.';
            } else if (error.message.includes('HTTP')) {
                errorMessage += 'Le serveur ne répond pas.';
            } else {
                errorMessage += 'Détails: ' + error.message;
            }
            
            alert(errorMessage);
            
            // Réinitialiser UI
            submitBtn.classList.remove('loading');
            btnText.textContent = 'Soumettre la commande';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // Réinitialiser les bordures d'erreur quand l'utilisateur tape
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
        });
    });
    
    console.log('🎯 Formulaire de commande prêt !');
});
