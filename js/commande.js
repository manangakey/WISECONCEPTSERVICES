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
                // SUCCÈS - REMPLACER TOUT LE CONTENU PAR LE MESSAGE
                const container = document.querySelector('.commande-container');
    
                container.innerHTML = `
                    <div class="success-fullscreen">
                        <div class="success-icon">✅</div>
                        <h1>Commande Envoyée !</h1>
                        <p class="success-message">${result.message}</p>
                        <p class="success-id">ID: #${result.commande_id || 'XXXX'}</p>
                        <p class="success-note">Notre équipe vous contactera dans les 24h.</p>
                        <button class="close-btn" onclick="window.close()">Fermer</button>
                    </div>
                `;
    
                // Ajouter le CSS pour le message plein écran
                const style = document.createElement('style');
                style.textContent = `
                .success-fullscreen {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 600px;
                    padding: 40px;
                    text-align: center;
                    background: linear-gradient(135deg, #151b54 0%, #324499 100%);
                    color: white;
                    border-radius: 20px;
                }
                .success-icon {
                    font-size: 5rem;
                    margin-bottom: 30px;
                    animation: bounce 1s;
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                .success-fullscreen h1 {
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                    color: #faaa03;
                }
                .success-message {
                    font-size: 1.3rem;
                    margin-bottom: 15px;
                    max-width: 600px;
                    line-height: 1.6;
                }
                .success-id {
                    background: rgba(255,255,255,0.1);
                    padding: 10px 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    font-weight: bold;
                    letter-spacing: 1px;
                }
                .success-note {
                    font-size: 1rem;
                    opacity: 0.9;
                    margin-top: 30px;
                }
                .close-btn {
                    margin-top: 40px;
                    padding: 15px 40px;
                    background: #faaa03;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                .close-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(250, 170, 3, 0.3);
                }
            `;
            document.head.appendChild(style);
    
            // Fermer automatiquement après 6 secondes
            setTimeout(() => {
                if (window.opener) {
                    window.close();
                }
            }, 6000);
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


