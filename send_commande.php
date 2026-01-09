<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../private_config/config.php'; // Même config que pour les autres formulaires

// Traduction des types de commande
$commandeTypes = [
    'logo_simple' => 'Logo simple',
    'logo_charte' => 'Logo & charte graphique',
    'branding_complet' => 'Branding complet',
    'affiche' => 'Affiche',
    'flyers_rollup' => 'Flyers ou Roll-up',
    'brochures' => 'Brochures',
    'catalogues' => 'Catalogues',
    'carte_visite' => 'Carte de visite',
    'tshirt' => 'T-shirt',
    'videos_promo' => 'Vidéos promotionnelles',
    'montages_pro' => 'Montages professionnels',
    'motion_design' => 'Motion design (animation)',
    'autre' => 'Autre demande'
];

$response = ['success' => false, 'message' => 'Une erreur est survenue.'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée.';
    echo json_encode($response);
    exit;
}

// Récupération et validation
$nom = trim(htmlspecialchars($_POST['nom_complet'] ?? '', ENT_QUOTES, 'UTF-8'));
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telephone = trim(htmlspecialchars($_POST['telephone'] ?? '', ENT_QUOTES, 'UTF-8'));
$type = trim($_POST['type_commande'] ?? '');
$description = trim(htmlspecialchars($_POST['description'] ?? '', ENT_QUOTES, 'UTF-8'));
$quantite = intval($_POST['quantite'] ?? 1);
$date_souhaitee = trim($_POST['date_souhaitee'] ?? '');
$demande_devis = isset($_POST['demande_devis']) ? 1 : 0;

// Validation
if (empty($nom) || empty($telephone) || empty($type) || empty($description)) {
    $response['message'] = 'Veuillez remplir tous les champs obligatoires.';
    echo json_encode($response);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) && !empty($email)) {
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
    
    // Insertion en base (créez cette table)
    $sql = "INSERT INTO commandes (
        nom_complet, email, telephone, type_commande, description,
        quantite, date_souhaitee, demande_devis, date_commande
    ) VALUES (
        :nom, :email, :telephone, :type, :description,
        :quantite, :date_souhaitee, :demande_devis, NOW()
    )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom' => $nom,
        ':email' => $email ?: NULL,
        ':telephone' => $telephone,
        ':type' => $type,
        ':description' => $description,
        ':quantite' => $quantite,
        ':date_souhaitee' => $date_souhaitee ?: NULL,
        ':demande_devis' => $demande_devis
    ]);
    
    $lastId = $pdo->lastInsertId();
    
    // ========== ENVOI EMAIL ==========
    $to = 'contact@wiseconceptservices.com'; // Votre email
    
    // Sujet encodé UTF-8
    $typeText = $commandeTypes[$type] ?? $type;
    $subjectText = "Nouvelle commande : " . $typeText;
    $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
    
    // Construction du message
    $message = "NOUVELLE COMMANDE - WISECONCEPT SERVICES\n";
    $message .= "========================================\n\n";
    
    $message .= "**INFORMATIONS CLIENT**\n";
    $message .= "Nom : " . $nom . "\n";
    if (!empty($email)) {
        $message .= "Email : " . $email . "\n";
    }
    $message .= "Téléphone : " . $telephone . "\n\n";
    
    $message .= "**DÉTAILS DE LA COMMANDE**\n";
    $message .= "Type : " . $typeText . "\n";
    $message .= "Quantité : " . $quantite . "\n";
    if (!empty($date_souhaitee)) {
        $message .= "Date souhaitée : " . date('d/m/Y', strtotime($date_souhaitee)) . "\n";
    }
    $message .= "Devis demandé : " . ($demande_devis ? 'Oui' : 'Non') . "\n\n";
    
    $message .= "**DESCRIPTION**\n";
    $message .= wordwrap($description, 70) . "\n\n";
    
    $message .= "**INFORMATIONS SYSTÈME**\n";
    $message .= "Référence : CMD-" . str_pad($lastId, 6, '0', STR_PAD_LEFT) . "\n";
    $message .= "Date : " . date('d/m/Y à H:i') . "\n";
    $message .= "IP : " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n\n";
    
    $message .= "--\n";
    $message .= "Cet email a été généré automatiquement.\n";
    $message .= "WiseConcept Services - Création & Formation\n";
    
    // Headers optimisés
    $headers = [];
    $headers[] = "From: WiseConcept Commande <contact@wiseconceptservices.com>";
    $headers[] = "Reply-To: " . ($email ?: 'contact@wiseconceptservices.com');
    $headers[] = "Return-Path: contact@wiseconceptservices.com";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: WiseConcept-Commande/1.0";
    $headers[] = "X-Priority: 1"; // Haute priorité
    
    // Envoi
    if (mail($to, $subject, $message, implode("\r\n", $headers))) {
        error_log("✅ Commande #$lastId - Email envoyé");
    } else {
        error_log("⚠️ Commande #$lastId - Email non envoyé");
    }
    
    $response['success'] = true;
    $response['message'] = 'Votre commande a été soumise avec succès ! Notre équipe vous contactera sous 24h.';
    $response['reference'] = 'CMD-' . str_pad($lastId, 6, '0', STR_PAD_LEFT);
    
} catch (PDOException $e) {
    error_log("❌ Erreur DB Commande: " . $e->getMessage());
    $response['message'] = 'Erreur technique. Veuillez réessayer ou nous contacter directement.';
} catch (Exception $e) {
    error_log("❌ Erreur Commande: " . $e->getMessage());
    $response['message'] = 'Erreur inattendue.';
}

echo json_encode($response);
?>

