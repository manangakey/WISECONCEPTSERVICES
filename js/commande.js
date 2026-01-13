// Gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation commande.js');
    
    const form = document.getElementById('commandeForm');
    if (!form) {
        console.error('FORMULAIRE NON TROUVÉ');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const successMessage = document.getElementById('successMessage');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Soumission...');
        
        // Validation visuelle
        let valid = true;
        document.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = 'red';
                valid = false;
                if (valid) field.focus();
            }
        });
        
        if (!valid) {
            alert('❌ Champs obligatoires manquants');
            return;
        }
        
        // Loading
        submitBtn.disabled = true;
        btnText.textContent = 'Envoi...';
        spinner.style.display = 'block';
        
        // Envoi
        try {
            const formData = new FormData(form);
            
            // DEBUG
            console.log('Données:', Object.fromEntries(formData));
            
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('Résultat:', result);
            
            if (result.success) {
                // SUCCÈS
                form.style.opacity = '0.3';
                form.style.pointerEvents = 'none';
                successMessage.style.display = 'block';
                
                // Auto-fermeture
                setTimeout(() => {
                    if (window.opener) {
                        window.close();
                    } else {
                        successMessage.innerHTML += '<p>Vous pouvez fermer cette fenêtre.</p>';
                    }
                }, 3000);
                
            } else {
                alert('Erreur: ' + result.message);
                submitBtn.disabled = false;
                btnText.textContent = 'Soumettre';
                spinner.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('Problème de connexion. Réessayez.');
            submitBtn.disabled = false;
            btnText.textContent = 'Soumettre';
            spinner.style.display = 'none';
        }
    });
    
    // Reset erreurs
    form.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', () => el.style.borderColor = '');
    });
});
