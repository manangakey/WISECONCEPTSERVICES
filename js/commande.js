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
    console.log('✅ Commande réussie !');
    
    // Cacher tout sauf le message
    const elementsToHide = [
        '.commande-header',
        '#commandeForm', 
        '.commande-footer'
    ];
    
    elementsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = 'none';
    });
    
    // Montrer et agrandir le message
    successMessage.style.display = 'flex';
    successMessage.style.flexDirection = 'column';
    successMessage.style.justifyContent = 'center';
    successMessage.style.alignItems = 'center';
    successMessage.style.minHeight = '400px';
    successMessage.style.textAlign = 'center';
    successMessage.style.padding = '40px';
    successMessage.style.borderRadius = '15px';
    
    // Mettre à jour le contenu
    successMessage.innerHTML = `
        <div style="font-size: 3.5rem; margin-bottom: 20px;">✅</div>
        <h2 style="color: white; margin-bottom: 15px;">Commande Envoyée !</h2>
        <p style="font-size: 1.1rem; margin-bottom: 10px;">${result.message}</p>
        <p style="margin-top: 25px; font-size: 0.9rem; opacity: 0.9;">
            Fermeture automatique...
        </p>
    `;
    
    // Fermer après 4 secondes
    setTimeout(() => {
        if (window.opener) window.close();
    }, 4000);
}
    
        } else {
            // ERREUR SERVEUR
            console.error('❌ Erreur serveur:', result.message);
            alert('Désolé, une erreur est survenue: ' + result.message);
            resetButton();
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



