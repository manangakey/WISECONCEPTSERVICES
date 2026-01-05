<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

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
        $to = 'votre-email@wiseconceptservices.com';
        $subject = "📚 Nouvelle inscription formation: $formation";
        $emailMessage = "
        NOUVELLE INSCRIPTION À UNE FORMATION (B2C)
        ===========================================
        
        Détails de l'inscription :
        --------------------------
        Formation : $formation
        Nom : $nom
        Email : $email
        Téléphone : $telephone
        " . (!empty($entreprise) ? "Entreprise : $entreprise\n" : "") . "
        Newsletter acceptée : " . ($newsletter ? 'Oui' : 'Non') . "
        
        Message :
        ---------
        " . (!empty($message) ? $message : '(Aucun message)') . "
        
        --------------------------
        ID : #$lastId
        Date : " . date('d/m/Y H:i') . "
        Type : Formation (B2C)
        ";
        
        $headers = "From: noreply@wiseconceptservices.com\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        mail($to, $subject, $emailMessage, $headers);
        
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
        $to = 'votre-email@wiseconceptservices.com';
        $subject = "💼 Nouvelle demande service B2B: $serviceType";
        $emailMessage = "
        NOUVELLE DEMANDE DE SERVICE PROFESSIONNEL (B2B)
        ==============================================
        
        Détails de la demande :
        -----------------------
        Entreprise : $entreprise
        Contact : $nom
        Poste : " . (!empty($poste) ? $poste : 'Non précisé') . "
        Email : $email
        Téléphone : $telephone
        " . (!empty($siteweb) ? "Site web : $siteweb\n" : "") . "
        Type de service : $serviceType
        Budget estimé : " . (!empty($budget) ? $budget : 'Non précisé') . "
        Demande devis : " . ($devis ? 'Oui' : 'Non') . "
        
        Description du projet :
        -----------------------
        $description
        
        -----------------------
        ID : #$lastId
        Date : " . date('d/m/Y H:i') . "
        Type : Service B2B
        ";
        
        $headers = "From: noreply@wiseconceptservices.com\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        mail($to, $subject, $emailMessage, $headers);
        
        $response['success'] = true;
        $response['message'] = 'Votre demande a été envoyée avec succès ! Notre équipe B2B vous contactera sous 24h.';
        
    } catch (PDOException $e) {
        error_log("Erreur DB Service: " . $e->getMessage());
        $response['message'] = 'Erreur technique. Veuillez réessayer.';
    }
}

echo json_encode($response);
?>