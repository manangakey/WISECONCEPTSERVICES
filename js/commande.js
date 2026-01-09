// Gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Formulaire de commande initialisé');
    
    // 1. Éléments principaux
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    
    // 2. Éléments de succès
    const successMessage = document.getElementById('successMessage');
    const commandeIdElement = document.getElementById('commandeId');
    const okButton = document.getElementById('okButton');
    const newCommandButton = document.getElementById('newCommandButton');
    const countdownElement = document.getElementById('countdown');
    
    // 3. Vérifications
    if (!form) {
        console.error('❌ Formulaire non trouvé');
        return;
    }
    
    if (!successMessage) {
        console.error('❌ Message de succès non trouvé');
    }
    
    // 4. Gestion de la soumission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('📤 Envoi du formulaire...');
        
        // Validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // État de chargement
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            // Envoi des données
            const formData = new FormData(form);
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('📨 Réponse:', result);
            
            if (result.success) {
    // SUPPRIMEZ le formulaire
    document.getElementById('commandeForm').remove();
    
    // CRÉEZ un nouveau message visible
    const successHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #151b54, #324499);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            z-index: 99999;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 500px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            ">
                <div style="font-size: 4rem; color: #4CAF50; margin-bottom: 20px;">✅</div>
                <h2 style="color: #151b54; margin-bottom: 15px;">Commande Confirmée !</h2>
                <p style="color: #666; margin-bottom: 10px;">
                    Votre commande <strong>#${result.commande_id}</strong> a été enregistrée.
                </p>
                <p style="color: #666; margin-bottom: 25px;">
                    Notre équipe vous contactera dans les 24h.
                </p>
                
                <button onclick="window.close() || (window.location.href='index.html')" 
                        style="
                            padding: 15px 40px;
                            background: linear-gradient(90deg, #faaa03, #8f6101);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-size: 1.1rem;
                            font-weight: 600;
                            cursor: pointer;
                            margin-top: 20px;
                        ">
                    OK - Fermer
                </button>
                
                <p style="font-size: 0.9rem; color: #999; margin-top: 20px;">
                    Cette fenêtre se fermera dans <span id="autoCloseCount">10</span> secondes
                </p>
            </div>
        </div>
    `;
    
    // Ajoutez au body
    document.body.innerHTML = successHTML;
    
    // Compte à rebours
    let count = 10;
    const interval = setInterval(() => {
        count--;
        const span = document.getElementById('autoCloseCount');
        if (span) span.textContent = count;
        
        if (count <= 0) {
            clearInterval(interval);
            if (window.opener) {
                window.close();
            } else {
                window.location.href = 'index.html';
            }
        }
    }, 1000);
}
            
        } catch (error) {
            console.error('💥 Erreur:', error);
            alert('Erreur de connexion');
            resetFormUI();
        }
        
        function resetFormUI() {
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // 5. Animations d'entrée des champs
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
    
    // 6. Effets de focus
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // 7. Sélection dynamique "Autre projet"
    const commandeSelect = document.getElementById('commande');
    const descriptionTextarea = document.getElementById('description');
    
    if (commandeSelect && descriptionTextarea) {
        commandeSelect.addEventListener('change', function() {
            if (this.value === 'autre') {
                descriptionTextarea.placeholder = "Décrivez précisément votre projet...";
            } else {
                descriptionTextarea.placeholder = "Décrivez votre projet en détail...";
            }
        });
    }
    
    console.log('✨ Toutes les fonctionnalités initialisées');
});

// 8. CSS pour le message de succès (à ajouter si besoin)
const style = document.createElement('style');
style.textContent = `
    .success-message {
        display: none !important;
        opacity: 0;
        transition: opacity 0.5s ease !important;
    }
    
    .success-message.show {
        display: block !important;
        opacity: 1 !important;
    }
`;
document.head.appendChild(style);

