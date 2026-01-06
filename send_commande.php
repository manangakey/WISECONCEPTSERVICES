<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'private_config/config.php';

$response = ['success' => false, 'message' => 'Une erreur est survenue.'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée.';
    echo json_encode($response);
    exit;
}

// Récupération des données
$nom = trim(htmlspecialchars($_POST['nom'] ?? ''));
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telephone = trim(htmlspecialchars($_POST['telephone'] ?? ''));
$commande = trim(htmlspecialchars($_POST['commande'] ?? ''));
$description = trim(htmlspecialchars($_POST['description'] ?? ''));
$devis = isset($_POST['devis']) ? 1 : 0;

// Validation
if (empty($nom) || empty($telephone) || empty($commande) || empty($description)) {
    $response['message'] = 'Veuillez remplir tous les champs obligatoires.';
    echo json_encode($response);
    exit;
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Adresse email invalide.';
    echo json_encode($response);
    exit;
}

try {
    // Connexion DB
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Créer la table si elle n'existe pas
    $createTableSQL = "CREATE TABLE IF NOT EXISTS `commandes` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `nom_complet` VARCHAR(100) NOT NULL,
        `email` VARCHAR(100) DEFAULT NULL,
        `telephone` VARCHAR(30) NOT NULL,
        `type_commande` VARCHAR(100) NOT NULL,
        `description` TEXT NOT NULL,
        `demande_devis` TINYINT(1) DEFAULT 0,
        `date_creation` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `statut` ENUM('nouvelle', 'en_cours', 'terminee') DEFAULT 'nouvelle',
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($createTableSQL);
    
    // Insertion
    $sql = "INSERT INTO commandes (nom_complet, email, telephone, type_commande, description, demande_devis)
            VALUES (:nom, :email, :telephone, :commande, :description, :devis)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom' => $nom,
        ':email' => $email,
        ':telephone' => $telephone,
        ':commande' => $commande,
        ':description' => $description,
        ':devis' => $devis
    ]);
    
    $lastId = $pdo->lastInsertId();
    
    // ========== ENVOI EMAIL ==========
    $to = 'contact@wiseconceptservices.com';
    
    // Noms des commandes
    $commandesNoms = [
        'logo-simple' => 'Logo simple',
        'logo-charte' => 'Logo & charte graphique',
        'branding-complet' => 'Branding complet',
        'affiche' => 'Affiche',
        'flyers' => 'Flyers ou Roll-up',
        'brochure' => 'Brochures',
        'catalogue' => 'Catalogues',
        'carte-visite' => 'Carte de visite',
        'video-promo' => 'Vidéos promotionnelles',
        'montage-pro' => 'Montages professionnels',
        'motion-design' => 'Motion design (animation)',
        'autre' => 'Autre'
    ];
    
    $commandeNom = $commandesNoms[$commande] ?? $commande;
    
    // Construire le sujet
    $subjectText = "🚀 NOUVELLE COMMANDE: " . $commandeNom;
    $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
    
    // Construire le message
    $message = "NOUVELLE COMMANDE REÇUE\n";
    $message .= "=====================\n\n";
    $message .= "👤 **CLIENT**\n";
    $message .= "Nom: " . $nom . "\n";
    if (!empty($email)) {
        $message .= "Email: " . $email . "\n";
    }
    $message .= "Téléphone: " . $telephone . "\n\n";
    
    $message .= "🛒 **COMMANDE**\n";
    $message .= "Type: " . $commandeNom . "\n";
    $message .= "Devis demandé: " . ($devis ? 'OUI' : 'NON') . "\n\n";
    
    $message .= "📝 **DESCRIPTION**\n";
    $message .= $description . "\n\n";
    
    $message .= "📊 **INFORMATIONS**\n";
    $message .= "ID: #" . $lastId . "\n";
    $message .= "Date: " . date('d/m/Y à H:i') . "\n";
    $message .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n\n";
    
    $message .= "--\n";
    $message .= "WiseConcept Services | Commandes\n";
    
    // Headers
    $headers = [];
    $headers[] = "From: Commandes WiseConcept <contact@wiseconceptservices.com>";
    $headers[] = "Reply-To: " . (!empty($email) ? $email : 'contact@wiseconceptservices.com');
    $headers[] = "Return-Path: contact@wiseconceptservices.com";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: WiseConcept-Commandes/1.0";
    $headers[] = "X-Priority: 1"; // Haute priorité
    
    // Envoi email
    $emailSent = mail($to, $subject, $message, implode("\r\n", $headers));
    
    if ($emailSent) {
        error_log("✅ Email commande envoyé - ID #" . $lastId);
    } else {
        error_log("⚠️ Email commande échoué - ID #" . $lastId);
    }
    
    $response['success'] = true;
    $response['message'] = 'Votre commande a été enregistrée avec succès ! Nous vous contacterons sous 24h.';
    $response['commande_id'] = $lastId;
    
} catch (PDOException $e) {
    error_log("❌ Erreur DB commande: " . $e->getMessage());
    $response['message'] = 'Erreur technique. Veuillez réessayer plus tard.';
}

echo json_encode($response);
?>