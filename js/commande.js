// Gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Formulaire de commande initialisé');
    
    const form = document.getElementById('commandeForm');
    if (!form) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const successMessage = document.getElementById('successMessage');
    const commandeFooter = document.querySelector('.commande-footer');
    
    // Assurer que le bouton est cliquable
    submitBtn.type = 'submit';
    
    // Gestion du clic
    submitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('📝 Début de soumission');
        
        // Validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff4444';
                field.style.backgroundColor = '#fff8f8';
                isValid = false;
                if (isValid) field.focus();
            }
        });
        
        if (!isValid) {
            alert('⚠️ Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        // Préparation données
        const formData = new FormData(form);
        
        // État "chargement"
        submitBtn.disabled = true;
        btnText.textContent = 'Envoi en cours...';
        if (spinner) spinner.style.display = 'inline-block';
        submitBtn.style.opacity = '0.7';
        
        try {
            // Envoi
            const response = await fetch('/send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('📊 Réponse:', result);
            
            if (result.success) {
                console.log('🎉 Commande réussie! ID:', result.commande_id);
                
                // 1. Masquer TOUT sauf le message de succès
                form.style.display = 'none';
                if (commandeFooter) commandeFooter.style.display = 'none';
                document.querySelector('.commande-header').style.display = 'none';
                
                // 2. Ajuster le style du conteneur pour le message seul
                const container = document.querySelector('.commande-container');
                if (container) {
                    container.style.maxWidth = '600px';
                    container.style.padding = '0';
                }
                
                // 3. Afficher le message de succès (plein écran dans le conteneur)
                successMessage.style.display = 'flex';
                successMessage.style.flexDirection = 'column';
                successMessage.style.justifyContent = 'center';
                successMessage.style.alignItems = 'center';
                successMessage.style.minHeight = '500px';
                successMessage.style.padding = '40px';
                successMessage.style.textAlign = 'center';
                successMessage.style.borderRadius = '20px';
                successMessage.style.background = 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)';
                successMessage.style.color = 'white';
                successMessage.style.animation = 'fadeIn 0.5s ease-out';
                
                // 4. Contenu du message
                successMessage.innerHTML = `
                    <div style="max-width: 500px;">
                        <!-- Icône succès -->
                        <div style="
                            width: 80px;
                            height: 80px;
                            background: white;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 25px;
                            font-size: 40px;
                            color: #4CAF50;
                        ">
                            ✓
                        </div>
                        
                        <!-- Titre -->
                        <h2 style="
                            font-size: 2rem;
                            margin-bottom: 15px;
                            font-weight: 700;
                        ">
                            Commande Confirmée !
                        </h2>
                        
                        <!-- Message -->
                        <p style="
                            font-size: 1.1rem;
                            line-height: 1.6;
                            margin-bottom: 30px;
                            opacity: 0.95;
                        ">
                            ${result.message}
                        </p>
                        
                        <!-- Carte de récapitulatif -->
                        <div style="
                            background: rgba(255, 255, 255, 0.15);
                            border-radius: 12px;
                            padding: 25px;
                            margin: 25px 0;
                            border-left: 4px solid #faaa03;
                        ">
                            <h3 style="
                                margin-bottom: 15px;
                                font-size: 1.2rem;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <span>📋</span> Récapitulatif
                            </h3>
                            
                            <div style="text-align: left; margin-bottom: 20px;">
                                <p><strong>Référence :</strong> #${result.commande_id || 'WC-' + Date.now().toString().slice(-6)}</p>
                                <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                <p><strong>Statut :</strong> En attente de traitement</p>
                            </div>
                            
                            <p style="
                                font-style: italic;
                                font-size: 0.95rem;
                                padding: 10px;
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 6px;
                            ">
                                ⏱️ Notre équipe vous contactera dans les <strong>24 heures</strong>
                            </p>
                        </div>
                        
                        <!-- Instructions -->
                        <p style="margin: 25px 0 35px; font-size: 1rem;">
                            <strong>Prochaine étape :</strong><br>
                            Vérifiez votre téléphone et email pour nos communications.
                        </p>
                        
                        <!-- Compte à rebours -->
                        <div style="
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid rgba(255, 255, 255, 0.3);
                        ">
                            <p style="margin-bottom: 15px; font-size: 0.9rem;">
                                ⏳ Fermeture automatique dans <span id="countdown" style="
                                    font-weight: bold;
                                    font-size: 1.1rem;
                                    color: #faaa03;
                                ">5</span> secondes
                            </p>
                            
                            <!-- Boutons d'action -->
                            <div style="display: flex; gap: 15px; justify-content: center;">
                                <button onclick="window.close()" style="
                                    background: white;
                                    color: #2E7D32;
                                    border: none;
                                    padding: 12px 30px;
                                    border-radius: 8px;
                                    font-weight: bold;
                                    cursor: pointer;
                                    transition: all 0.3s;
                                    min-width: 180px;
                                " onmouseover="this.style.transform='translateY(-2px)'" 
                                onmouseout="this.style.transform='translateY(0)'">
                                    Fermer la fenêtre
                                </button>
                                
                                <button onclick="location.reload()" style="
                                    background: transparent;
                                    color: white;
                                    border: 2px solid rgba(255, 255, 255, 0.5);
                                    padding: 10px 25px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    transition: all 0.3s;
                                " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
                                onmouseout="this.style.background='transparent'">
                                    Nouvelle commande
                                </button>
                            </div>
                        </div>
                        
                        <!-- Logo/branding -->
                        <div style="
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid rgba(255, 255, 255, 0.2);
                        ">
                            <p style="font-size: 0.85rem; opacity: 0.8;">
                                WiseConcept Services © ${new Date().getFullYear()}<br>
                                contact@wiseconceptservices.com
                            </p>
                        </div>
                    </div>
                `;
                
                // 5. Gestion du compte à rebours
                let secondsLeft = 5;
                const countdownElement = document.getElementById('countdown');
                
                const countdownTimer = setInterval(() => {
                    secondsLeft--;
                    if (countdownElement) {
                        countdownElement.textContent = secondsLeft;
                    }
                    
                    if (secondsLeft <= 0) {
                        clearInterval(countdownTimer);
                        if (window.opener && !window.opener.closed) {
                            window.close();
                        }
                    }
                }, 1000);
                
            } else {
                // ERREUR
                alert('❌ ' + result.message);
                resetButton();
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            alert('⚠️ Problème de connexion. Veuillez réessayer.');
            resetButton();
        }
    });
    
    // Fonction de réinitialisation
    function resetButton() {
        submitBtn.disabled = false;
        btnText.textContent = 'Soumettre la commande';
        if (spinner) spinner.style.display = 'none';
        submitBtn.style.opacity = '1';
    }
    
    // Réinitialiser les styles d'erreur
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        });
    });
    
    console.log('✅ Formulaire prêt !');
});
