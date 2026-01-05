<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../private_config/config.php';

$response = ['success' => false, 'message' => 'Une erreur est survenue.'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée.';
    echo json_encode($response);
    exit;
}

// Récupération du type de formulaire
$formType = $_POST['form_type'] ?? '';

if (!in_array($formType, ['formation', 'service'])) {
    $response['message'] = 'Type de formulaire invalide.';
    echo json_encode($response);
    exit;
}

// Traitement selon le type
if ($formType === 'formation') {
    // Validation Formation (B2C)
    $nom = trim(htmlspecialchars($_POST['nom'] ?? ''));
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $telephone = trim(htmlspecialchars($_POST['telephone'] ?? ''));
    $entreprise = trim(htmlspecialchars($_POST['entreprise'] ?? ''));
    $formation = trim(htmlspecialchars($_POST['formation'] ?? ''));
    $message = trim(htmlspecialchars($_POST['message'] ?? ''));
    $newsletter = isset($_POST['newsletter']) ? 1 : 0;
    
    // Validation
    if (empty($nom) || empty($email) || empty($telephone) || empty($formation) || 
        !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Veuillez remplir tous les champs obligatoires correctement.';
        echo json_encode($response);
        exit;
    }
    
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Insertion pour formation
        $sql = "INSERT INTO demandes (
            type_demande, nom_complet, email, telephone, entreprise, 
            formation_choisie, message, accepte_newsletter
        ) VALUES (
            'formation', :nom, :email, :telephone, :entreprise,
            :formation, :message, :newsletter
        )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nom' => $nom,
            ':email' => $email,
            ':telephone' => $telephone,
            ':entreprise' => $entreprise,
            ':formation' => $formation,
            ':message' => $message,
            ':newsletter' => $newsletter
        ]);
        
        $lastId = $pdo->lastInsertId();
        
        // Email de notification
        $to = 'contact@wiseconceptservices.com';

        // 1. Construire le sujet avec emoji et décodage HTML
        $subjectText = "📚 Nouvelle inscription formation: " . html_entity_decode($formation ?? '', ENT_QUOTES, 'UTF-8');

        // 2. Construire le corps du message
        $emailMessage = "NOUVELLE INSCRIPTION À UNE FORMATION (B2C)\n";
        $emailMessage .= "===========================================\n\n";
        $emailMessage .= "DÉTAILS DE L'INSCRIPTION :\n";
        $emailMessage .= "--------------------------\n";
        $emailMessage .= "Formation : " . $formation . "\n";
        $emailMessage .= "Nom : " . $nom . "\n";
        $emailMessage .= "Email : " . $email . "\n";
        $emailMessage .= "Téléphone : " . $telephone . "\n";
        if (!empty($entreprise)) {
            $emailMessage .= "Entreprise : " . $entreprise . "\n";
        }
        $emailMessage .= "Newsletter acceptée : " . ($newsletter ? 'Oui' : 'Non') . "\n\n";

        if (!empty($message)) {
            $emailMessage .= "MESSAGE DU CLIENT :\n";
            $emailMessage .= "-------------------\n";
            $emailMessage .= $message . "\n\n";
        }

        $emailMessage .= "--------------------------\n";
        $emailMessage .= "ID : #" . $lastId . "\n";
        $emailMessage .= "Date : " . date('d/m/Y H:i') . "\n";
        $emailMessage .= "Type : Formation (B2C)\n";

        // 3. Headers CORRIGÉS pour UTF-8
        $headers = "From: WiseConcept Services <contact@wiseconceptservices.com>\r\n";
        $headers .= "Reply-To: " . $email . "\r\n";
        $headers .= "Return-Path: contact@wiseconceptservices.com\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
        $headers .= "Content-Transfer-Encoding: 8bit\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: 3\r\n";
        $headers .= "X-MSMail-Priority: Normal\r\n";

        // 4. Encoder le sujet pour UTF-8 (TRÈS IMPORTANT)
        $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

        // 5. Envoi
        if (mail($to, $subject, $emailMessage, $headers)) {
            error_log("✅ Email formation envoyé - ID #" . $lastId);
            $emailSent = true;
        } else {
            error_log("❌ Échec envoi email formation - ID #" . $lastId);
            $emailSent = false;
        }
        
        $response['success'] = true;
        $response['message'] = 'Votre inscription a été envoyée avec succès ! Nous vous contacterons sous 24h pour confirmer.';
        
    } catch (PDOException $e) {
        error_log("Erreur DB Formation: " . $e->getMessage());
        $response['message'] = 'Erreur technique. Veuillez réessayer.';
    }
    
} elseif ($formType === 'service') {
    // Validation Service (B2B)
    $nom = trim(htmlspecialchars($_POST['nom'] ?? ''));
    $entreprise = trim(htmlspecialchars($_POST['entreprise'] ?? ''));
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $telephone = trim(htmlspecialchars($_POST['telephone'] ?? ''));
    $poste = trim(htmlspecialchars($_POST['poste'] ?? ''));
    $siteweb = trim(htmlspecialchars($_POST['siteweb'] ?? ''));
    $serviceType = trim(htmlspecialchars($_POST['service_type'] ?? ''));
    $budget = trim(htmlspecialchars($_POST['budget'] ?? ''));
    $description = trim(htmlspecialchars($_POST['description'] ?? ''));
    $devis = isset($_POST['devis']) ? 1 : 0;
    
    // Validation
    if (empty($nom) || empty($entreprise) || empty($email) || empty($telephone) || 
        empty($serviceType) || empty($description) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Veuillez remplir tous les champs obligatoires correctement.';
        echo json_encode($response);
        exit;
    }
    
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Insertion pour service
        $sql = "INSERT INTO demandes (
            type_demande, nom_complet, entreprise, email, telephone,
            poste_occupe, site_web, type_service, budget_estime,
            description_projet, demande_devis
        ) VALUES (
            'service', :nom, :entreprise, :email, :telephone,
            :poste, :siteweb, :serviceType, :budget,
            :description, :devis
        )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nom' => $nom,
            ':entreprise' => $entreprise,
            ':email' => $email,
            ':telephone' => $telephone,
            ':poste' => $poste,
            ':siteweb' => $siteweb,
            ':serviceType' => $serviceType,
            ':budget' => $budget,
            ':description' => $description,
            ':devis' => $devis
        ]);
        
        $lastId = $pdo->lastInsertId();
        
        // Email de notification
        $to = 'contact@wiseconceptservices.com';

        // 1. Construire le sujet
        $subjectText = "💼 Nouvelle demande service: " . html_entity_decode($serviceType ?? '', ENT_QUOTES, 'UTF-8');

        // 2. Construire le corps du message
        $emailMessage = "NOUVELLE DEMANDE DE SERVICE PROFESSIONNEL (B2B)\n";
        $emailMessage .= "==============================================\n\n";
        $emailMessage .= "DÉTAILS DE LA DEMANDE :\n";
        $emailMessage .= "-----------------------\n";
        $emailMessage .= "Entreprise : " . $entreprise . "\n";
        $emailMessage .= "Contact : " . $nom . "\n";
        $emailMessage .= "Poste : " . (!empty($poste) ? $poste : 'Non précisé') . "\n";
        $emailMessage .= "Email : " . $email . "\n";
        $emailMessage .= "Téléphone : " . $telephone . "\n";
        if (!empty($siteweb)) {
            $emailMessage .= "Site web : " . $siteweb . "\n";
        }
        $emailMessage .= "Type de service : " . $serviceType . "\n";
        $emailMessage .= "Budget estimé : " . (!empty($budget) ? $budget : 'Non précisé') . "\n";
        $emailMessage .= "Demande devis : " . ($devis ? 'Oui' : 'Non') . "\n\n";

        $emailMessage .= "DESCRIPTION DU PROJET :\n";
        $emailMessage .= "------------------------\n";
        $emailMessage .= $description . "\n\n";

        $emailMessage .= "-----------------------\n";
        $emailMessage .= "ID : #" . $lastId . "\n";
        $emailMessage .= "Date : " . date('d/m/Y H:i') . "\n";
        $emailMessage .= "Type : Service B2B\n";

        // 3. Headers CORRIGÉS pour UTF-8
        $headers = "From: WiseConcept Services <contact@wiseconceptservices.com>\r\n";
        $headers .= "Reply-To: " . $email . "\r\n";
        $headers .= "Return-Path: contact@wiseconceptservices.com\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
        $headers .= "Content-Transfer-Encoding: 8bit\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "X-Priority: 3\r\n";
        $headers .= "X-MSMail-Priority: Normal\r\n";

        // 4. Encoder le sujet pour UTF-8
        $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

        // 5. Envoi
        if (mail($to, $subject, $emailMessage, $headers)) {
            error_log("✅ Email service envoyé - ID #" . $lastId);
            $emailSent = true;
        } else {
            error_log("❌ Échec envoi email service - ID #" . $lastId);
            $emailSent = false;
        }
        
        $response['success'] = true;
        $response['message'] = 'Votre demande a été envoyée avec succès ! Notre équipe vous contactera sous 24h.';
        
    } catch (PDOException $e) {
        error_log("Erreur DB Service: " . $e->getMessage());
        $response['message'] = 'Erreur technique. Veuillez réessayer.';
    }
}

echo json_encode($response);

?>


