// Gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation formulaire commande');
    
    // Éléments principaux
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('commandeForm');
    const successMessage = document.getElementById('successMessage');
    const container = document.querySelector('.commande-container');
    
    if (!submitBtn || !form) {
        console.error('❌ Éléments non trouvés');
        return;
    }
    
    // Gestion du clic sur le bouton
    submitBtn.addEventListener('click', async function() {
        console.log('🖱️ Bouton cliqué');
        
        // 1. Validation simple
        const nom = document.getElementById('nom_complet').value.trim();
        const tel = document.getElementById('telephone').value.trim();
        const commande = document.getElementById('commande').value;
        
        if (!nom || !tel || !commande) {
            alert('❌ Veuillez remplir : Nom, Téléphone et Type de commande');
            return;
        }
        
        // 2. Préparer les données
        const formData = new FormData();
        formData.append('nom_complet', nom);
        formData.append('telephone', tel);
        formData.append('commande', commande);
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('description', document.getElementById('description').value.trim());
        formData.append('devis', document.getElementById('devis').checked ? '1' : '0');
        
        // 3. Afficher "chargement"
        submitBtn.disabled = true;
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('spinner');
        
        if (btnText) btnText.textContent = 'Envoi en cours...';
        if (spinner) spinner.style.display = 'inline-block';
        
        try {
            console.log('📤 Envoi des données...');
            
            // Envoyer au PHP
            const response = await fetch('/send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('📊 Résultat:', result);
            
            if (result.success) {
                // ========== SUCCÈS ==========
                console.log('✅ Commande réussie !');
                
                // A. MASQUER le formulaire
                form.style.display = 'none';
                
                // B. MASQUER le footer (optionnel)
                const footer = document.querySelector('.commande-footer');
                if (footer) footer.style.display = 'none';
                
                // C. MASQUER le header (optionnel)
                const header = document.querySelector('.commande-header');
                if (header) header.style.display = 'none';
                
                // D. AFFICHER le message de succès
                successMessage.style.display = 'block';
                successMessage.style.background = 'linear-gradient(135deg, #151b54 0%, #324499 100%)';
                successMessage.style.color = 'white';
                successMessage.style.padding = '60px 40px';
                successMessage.style.borderRadius = '20px';
                successMessage.style.minHeight = '500px';
                successMessage.style.display = 'flex';
                successMessage.style.flexDirection = 'column';
                successMessage.style.justifyContent = 'center';
                successMessage.style.alignItems = 'center';
                successMessage.style.textAlign = 'center';
                successMessage.style.margin = '0';
                successMessage.style.width = '100%';
                
                // E. Contenu du message
                successMessage.innerHTML = `
                    <div style="max-width: 500px;">
                        <!-- Grande icône de succès -->
                        <div style="
                            font-size: 4rem;
                            margin-bottom: 20px;
                            animation: fadeIn 0.5s ease-out;
                        ">
                            🎉
                        </div>
                        
                        <!-- Titre -->
                        <h2 style="
                            font-size: 2.2rem;
                            margin-bottom: 20px;
                            font-weight: 700;
                            color: white;
                        ">
                            Commande Confirmée !
                        </h2>
                        
                        <!-- Message principal -->
                        <p style="
                            font-size: 1.2rem;
                            line-height: 1.6;
                            margin-bottom: 30px;
                            opacity: 0.95;
                        ">
                            ✅ Votre commande a été envoyée avec succès !
                        </p>
                        
                        <!-- Détails -->
                        <div style="
                            background: rgba(255, 255, 255, 0.15);
                            border-radius: 12px;
                            padding: 25px;
                            margin: 25px 0;
                            border-left: 4px solid #faaa03;
                            text-align: left;
                        ">
                            <p><strong>Référence :</strong> #${result.commande_id || 'WC-' + Date.now().toString().slice(-6)}</p>
                            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                            <p><strong>Statut :</strong> En attente de traitement</p>
                        </div>
                        
                        <!-- Instructions -->
                        <p style="margin-bottom: 30px; font-size: 1.1rem;">
                            <strong>Prochaine étape :</strong><br>
                            Notre équipe vous contactera sous 24 heures.
                        </p>
                        
                        <!-- Bouton de fermeture -->
                        <button onclick="window.close()" style="
                            background: #faaa03;
                            color: white;
                            border: none;
                            padding: 16px 40px;
                            border-radius: 10px;
                            font-weight: bold;
                            font-size: 1.1rem;
                            cursor: pointer;
                            transition: all 0.3s;
                            margin-top: 20px;
                            min-width: 200px;
                        " 
                        onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 10px 25px rgba(250, 170, 3, 0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            Fermer la fenêtre
                        </button>
                        
                        <!-- Compte à rebours -->
                        <p style="margin-top: 30px; font-size: 0.9rem; opacity: 0.8;">
                            ⏳ Fermeture automatique dans 
                            <span id="countdown" style="
                                font-weight: bold;
                                color: #faaa03;
                                font-size: 1.1rem;
                                margin: 0 5px;
                            ">5</span> 
                            secondes
                        </p>
                    </div>
                `;
                
                // F. Gérer le compte à rebours
                let seconds = 5;
                const countdownElement = document.getElementById('countdown');
                
                const countdownInterval = setInterval(() => {
                    seconds--;
                    if (countdownElement) {
                        countdownElement.textContent = seconds;
                    }
                    
                    if (seconds <= 0) {
                        clearInterval(countdownInterval);
                        // Fermer la fenêtre si c'est une popup
                        if (window.opener && !window.opener.closed) {
                            window.close();
                        }
                    }
                }, 1000);
                
            } else {
                // ERREUR du serveur
                alert('❌ ' + result.message);
                resetButton();
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            alert('⚠️ Problème de connexion. Veuillez réessayer.');
            resetButton();
        }
    });
    
    // Fonction pour réinitialiser le bouton
    function resetButton() {
        submitBtn.disabled = false;
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('spinner');
        
        if (btnText) btnText.textContent = 'Soumettre la commande';
        if (spinner) spinner.style.display = 'none';
    }
});
