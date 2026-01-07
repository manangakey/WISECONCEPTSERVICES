<?php
// send_commande.php - Traitement des commandes rapides
header('Content-Type: application/json; charset=utf-8');
require_once '../private_config/config.php';

$response = ['success' => false, 'message' => 'Une erreur est survenue.'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée.';
    echo json_encode($response);
    exit;
}

// Récupération et validation des données
$nom = trim(htmlspecialchars($_POST['nom'] ?? ''));
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telephone = trim(htmlspecialchars($_POST['telephone'] ?? ''));
$service = trim(htmlspecialchars($_POST['service'] ?? ''));
$description = trim(htmlspecialchars($_POST['description'] ?? ''));
$devis = isset($_POST['devis']) ? 1 : 0;

// Noms des services pour affichage
$servicesNoms = [
    'logo_simple' => 'Logo simple',
    'logo_charte' => 'Logo & charte graphique',
    'branding_complet' => 'Branding complet',
    'affiche' => 'Affiche',
    'flyer_rollup' => 'Flyers ou Roll-up',
    'brochure' => 'Brochures',
    'catalogue' => 'Catalogues',
    'carte_visite' => 'Carte de visite',
    't_shirt' => 'T-shirt',
    'video_promo' => 'Vidéos promotionnelles',
    'montage_pro' => 'Montages professionnels',
    'motion_design' => 'Motion design (animation)'
];

$serviceNom = $servicesNoms[$service] ?? $service;

// Validation
if (empty($nom) || empty($telephone) || empty($service) || empty($description)) {
    $response['message'] = 'Veuillez remplir tous les champs obligatoires.';
    echo json_encode($response);
    exit;
}

if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Adresse email invalide.';
    echo json_encode($response);
    exit;
}

try {
    // Connexion à la base de données
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Créer la table si elle n'existe pas
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS commandes (
            id INT(11) NOT NULL AUTO_INCREMENT,
            nom_complet VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            telephone VARCHAR(30) NOT NULL,
            service VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            demande_devis TINYINT(1) DEFAULT 0,
            date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            traite TINYINT(1) DEFAULT 0,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Insertion de la commande
    $sql = "INSERT INTO commandes (nom_complet, email, telephone, service, description, demande_devis)
            VALUES (:nom, :email, :telephone, :service, :description, :devis)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom' => $nom,
        ':email' => $email ?: null,
        ':telephone' => $telephone,
        ':service' => $service,
        ':description' => $description,
        ':devis' => $devis
    ]);
    
    $lastId = $pdo->lastInsertId();
    
    // ========== ENVOI DE L'EMAIL ==========
    $to = 'contact@wiseconceptservices.com'; 
    
    // Sujet avec encodage UTF-8
    $subjectText = "🛒 Nouvelle commande: " . $serviceNom;
    $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
    
    // Construction du message
    $message = "NOUVELLE COMMANDE RAPIDE - WISECONCEPT\n";
    $message .= "=====================================\n\n";
    
    $message .= "**INFORMATIONS CLIENT**\n";
    $message .= "Nom: " . $nom . "\n";
    if ($email) {
        $message .= "Email: " . $email . "\n";
    }
    $message .= "Téléphone: " . $telephone . "\n\n";
    
    $message .= "**DÉTAILS DE LA COMMANDE**\n";
    $message .= "Service: " . $serviceNom . "\n";
    $message .= "Devis demandé: " . ($devis ? "OUI" : "NON") . "\n\n";
    
    $message .= "**DESCRIPTION**\n";
    $message .= wordwrap($description, 70) . "\n\n";
    
    $message .= "---\n";
    $message .= "ID Commande: #" . $lastId . "\n";
    $message .= "Date: " . date('d/m/Y à H:i') . "\n";
    $message .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
    
    // Headers pour UTF-8
    $headers = [];
    $headers[] = "From: WiseConcept Commandes <contact@wiseconceptservices.com>";
    $headers[] = "Reply-To: " . ($email ?: 'contact@wiseconceptservices.com');
    $headers[] = "Return-Path: contact@wiseconceptservices.com";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: WiseConcept-Commande/1.0";
    $headers[] = "X-Priority: 1"; // Haute priorité
    
    // Envoi de l'email
    if (mail($to, $subject, $message, implode("\r\n", $headers))) {
        error_log("✅ Email commande envoyé - ID #" . $lastId);
    } else {
        error_log("⚠️  Email commande échoué - ID #" . $lastId);
    }
    
    $response['success'] = true;
    $response['message'] = '✅ Votre commande a été envoyée avec succès ! Notre équipe vous contactera sous 24h.';
    
} catch (PDOException $e) {
    error_log("❌ Erreur DB commande: " . $e->getMessage());
    $response['message'] = 'Erreur technique. Veuillez réessayer.';
}

echo json_encode($response);
?>
