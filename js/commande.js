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
    // SUCCÈS COMPLET
    console.log('🎉 Commande réussie!');
    
    // 1. CACHER TOUT LE FORMULAIRE et le header
    const commandeContainer = document.querySelector('.commande-container');
    const commandeHeader = document.querySelector('.commande-header');
    const commandeForm = document.getElementById('commandeForm');
    const commandeFooter = document.querySelector('.commande-footer');
    
    if (commandeHeader) commandeHeader.style.display = 'none';
    if (commandeForm) commandeForm.style.display = 'none';
    if (commandeFooter) commandeFooter.style.display = 'none';
    
    // 2. AFFICHER SEUL LE MESSAGE DE SUCCÈS
    successMessage.style.display = 'block';
    successMessage.style.margin = '0';
    successMessage.style.borderRadius = '20px';
    successMessage.style.height = '100%';
    successMessage.style.display = 'flex';
    successMessage.style.flexDirection = 'column';
    successMessage.style.justifyContent = 'center';
    successMessage.style.alignItems = 'center';
    successMessage.style.textAlign = 'center';
    successMessage.style.padding = '60px 40px';
    
    // 3. METTRE LE MESSAGE AU CENTRE DE L'ÉCRAN
    successMessage.innerHTML = `
        <div style="max-width: 500px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
            <h3 style="font-size: 2rem; margin-bottom: 20px; color: white;">Commande Confirmée !</h3>
            <p style="font-size: 1.2rem; margin-bottom: 10px; color: rgba(255,255,255,0.9);">
                ${result.message}
            </p>
            <p style="font-size: 1rem; margin-top: 30px; color: rgba(255,255,255,0.8);">
                <strong>ID Commande: #${result.commande_id || 'XXXX'}</strong>
            </p>
            <p style="font-size: 0.9rem; margin-top: 40px; color: rgba(255,255,255,0.7);">
                Cette fenêtre se fermera automatiquement dans 5 secondes...
            </p>
        </div>
    `;
    
    // 4. CHANGER LE STYLE DU CONTENEUR POUR CENTRER LE MESSAGE
    if (commandeContainer) {
        commandeContainer.style.display = 'flex';
        commandeContainer.style.justifyContent = 'center';
        commandeContainer.style.alignItems = 'center';
        commandeContainer.style.minHeight = '500px';
        commandeContainer.style.background = 'linear-gradient(135deg, #151b54 0%, #324499 100%)';
    }
    
    // 5. Fermer après 5 secondes
    setTimeout(() => {
        if (window.opener && !window.opener.closed) {
            window.close();
        } else {
            // Ajouter un bouton de fermeture manuelle
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Fermer cette fenêtre';
            closeBtn.style.cssText = `
                margin-top: 30px;
                padding: 12px 30px;
                background: #faaa03;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                cursor: pointer;
                font-weight: bold;
            `;
            closeBtn.onclick = () => window.close();
            successMessage.querySelector('div').appendChild(closeBtn);
        }
    }, 5000);
    
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

