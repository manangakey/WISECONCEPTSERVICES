document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('commandeForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const successOverlay = document.getElementById('successMessage');
    const commandeId = document.getElementById('commandeId');
    const countdownElem = document.getElementById('countdown');
    const okButton = document.getElementById('okButton');
    const descriptionTextarea = document.getElementById('description');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            const response = await fetch('send_commande.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                form.style.opacity = '0';
                form.style.transition = 'opacity 0.3s';
                
                setTimeout(() => {
                    form.style.display = 'none';
                    
                    commandeId.textContent = '#' + result.commande_id;
                    successOverlay.style.display = 'flex';
                    
                    setTimeout(() => {
                        successOverlay.style.opacity = '1';
                        const successCard = successOverlay.querySelector('.success-card');
                        successCard.style.transform = 'translateY(0)';
                    }, 10);
                    
                    let countdown = 10;
                    const countdownInterval = setInterval(() => {
                        countdown--;
                        countdownElem.textContent = countdown;
                        
                        if (countdown <= 0) {
                            clearInterval(countdownInterval);
                            closeWindow();
                        }
                    }, 1000);
                    
                    function closeWindow() {
                        clearInterval(countdownInterval);
                        successOverlay.style.opacity = '0';
                        
                        setTimeout(() => {
                            if (window.opener && !window.opener.closed) {
                                window.close();
                            } else {
                                window.location.href = 'index.html';
                            }
                        }, 300);
                    }
                    
                    okButton.onclick = closeWindow;
                    
                }, 300);
                
            } else {
                alert('Erreur: ' + result.message);
                resetUI();
            }
            
        } catch (error) {
            alert('Erreur de connexion');
            resetUI();
        }
        
        function resetUI() {
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    const commandeSelect = document.getElementById('commande');
    if (commandeSelect && descriptionTextarea) {
        commandeSelect.addEventListener('change', function() {
            if (this.value === 'autre') {
                descriptionTextarea.placeholder = "Décrivez précisément votre projet : type de design, utilisations prévues...";
            } else {
                descriptionTextarea.placeholder = "Décrivez votre projet en détail : objectifs, dimensions, couleurs, délais...";
            }
        });
    }
});
