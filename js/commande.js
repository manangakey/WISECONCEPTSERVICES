// Gestion formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation formulaire');
    
    const form = document.getElementById('commandeForm');
    if (!form) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const successMessage = document.getElementById('successMessage');
    
    // IMPORTANT: Éviter submitBtn.type = 'button' - Déjà fait dans HTML
    
    // Gestion du clic SUR LE BOUTON (pas sur le formulaire)
    submitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('🖱️ Bouton cliqué - Début traitement');
        
        // Validation
        const requiredFields = form.querySelectorAll('[required]');
        let hasError = false;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff4444';
                field.style.backgroundColor = '#fff8f8';
                hasError = true;
            }
        });
        
        if (hasError) {
            alert('⚠️ Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        // Chargement
        submitBtn.disabled = true;
        btnText.textContent = 'Envoi...';
        if (spinner) spinner.style.display = 'inline-block';
        
        try {
            // Données
            const formData = new FormData(form);
            
            // Debug
            console.log('📤 Données:', Object.fromEntries(formData));
            
            // Envoi
            const response = await fetch('/send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('📊 Réponse:', result);
            
            if (result.success) {
                // ========== SUCCÈS COMPLET ==========
                console.log('✅ Commande réussie!');
                
                // 1. MASQUER TOUT
                form.style.display = 'none';
                document.querySelector('.commande-footer').style.display = 'none';
                document.querySelector('.commande-header').style.display = 'none';
                
                // 2. AFFICHER SEUL le message de succès
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
                
                // 3. Contenu amélioré
                successMessage.innerHTML = `
                    <div style="max-width: 500px; animation: fadeIn 0.5s ease-out;">
                        <!-- Icône -->
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
                            animation: pulse 2s infinite;
                        ">
                            ✓
                        </div>
                        
                        <!-- Titre -->
                        <h2 style="
                            font-size: 2.2rem;
                            margin-bottom: 15px;
                            font-weight: 700;
                        ">
                            Commande Confirmée !
                        </h2>
                        
                        <!-- Message -->
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
                        ">
                            <p><strong>Référence :</strong> #${result.commande_id || 'WC-' + Date.now().toString().slice(-6)}</p>
                            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                            <p>Notre équipe vous contactera sous 24h.</p>
                        </div>
                        
                        <!-- Boutons -->
                        <div style="margin-top: 40px;">
                            <button onclick="window.close()" style="
                                background: #faaa03;
                                color: white;
                                border: none;
                                padding: 14px 35px;
                                border-radius: 10px;
                                font-weight: bold;
                                cursor: pointer;
                                font-size: 1.1rem;
                                transition: all 0.3s;
                                margin-right: 15px;
                            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(250, 170, 3, 0.3)'" 
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                Fermer la fenêtre
                            </button>
                        </div>
                        
                        <!-- Compte à rebours -->
                        <p style="margin-top: 30px; font-size: 0.9rem; opacity: 0.8;">
                            Fermeture automatique dans <span id="countdown" style="font-weight: bold; color: #faaa03;">5</span>s
                        </p>
                    </div>
                `;
                
                // 4. Compte à rebours
                let seconds = 5;
                const countdownElement = document.getElementById('countdown');
                const countdownInterval = setInterval(() => {
                    seconds--;
                    if (countdownElement) countdownElement.textContent = seconds;
                    if (seconds <= 0) {
                        clearInterval(countdownInterval);
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
    
    // Fonction reset
    function resetButton() {
        submitBtn.disabled = false;
        btnText.textContent = 'Soumettre la commande';
        if (spinner) spinner.style.display = 'none';
    }
    
    // Réinitialiser styles d'erreur
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        });
    });
    
    console.log('✅ Formulaire prêt !');
});
