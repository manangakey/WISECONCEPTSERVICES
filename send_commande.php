<?php
// send_commande.php - Traitement des commandes
header('Content-Type: application/json; charset=utf-8');

// Configuration
require_once '../private_config/config.php';

$response = ['success' => false, 'message' => 'Une erreur est survenue.'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée.';
    echo json_encode($response);
    exit;
}

// Récupération et nettoyage des données
$nom = trim(htmlspecialchars($_POST['nom_complet'] ?? ''));
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

// Mapping des types de commande
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
    'autre' => 'Autre projet'
];

$commandeLibelle = $commandeTypes[$commande] ?? $commande;

try {
    // Connexion à la base de données
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Création de la table si elle n'existe pas
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS commandes (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            nom_complet VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            telephone VARCHAR(30) NOT NULL,
            type_commande VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            demande_devis BOOLEAN DEFAULT 1,
            date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            statut ENUM('nouvelle', 'en_cours', 'terminee', 'annulee') DEFAULT 'nouvelle',
            INDEX idx_statut (statut),
            INDEX idx_date (date_commande)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    // Insertion
    $sql = "INSERT INTO commandes (nom_complet, email, telephone, type_commande, description, demande_devis)
            VALUES (:nom, :email, :telephone, :commande, :description, :devis)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom' => $nom,
        ':email' => $email ?: null,
        ':telephone' => $telephone,
        ':commande' => $commandeLibelle,
        ':description' => $description,
        ':devis' => $devis
    ]);
    
    $lastId = $pdo->lastInsertId();
    
    // ========== ENVOI DE L'EMAIL ==========
    $to = 'contact@wiseconceptservices.com'; // Votre email
    $subjectText = "Nouvelle commande #$lastId - $commandeLibelle";
    
    // Corps de l'email
    $emailBody = "NOUVELLE COMMANDE - WISECONCEPT SERVICES\n";
    $emailBody .= "===========================================\n\n";
    $emailBody .= "INFORMATIONS CLIENT\n";
    $emailBody .= str_repeat("-", 30) . "\n";
    $emailBody .= "Nom : $nom\n";
    if (!empty($email)) {
        $emailBody .= "Email : $email\n";
    }
    $emailBody .= "Téléphone : $telephone\n";
    $emailBody .= "Demande devis : " . ($devis ? 'OUI' : 'NON') . "\n\n";
    
    $emailBody .= "DÉTAILS DE LA COMMANDE\n";
    $emailBody .= str_repeat("-", 30) . "\n";
    $emailBody .= "Type : $commandeLibelle\n";
    $emailBody .= "ID Commande : #$lastId\n\n";
    
    $emailBody .= "DESCRIPTION DU PROJET\n";
    $emailBody .= str_repeat("-", 30) . "\n";
    $emailBody .= wordwrap($description, 70) . "\n\n";
    
    $emailBody .= "INFORMATIONS SYSTÈME\n";
    $emailBody .= str_repeat("-", 30) . "\n";
    $emailBody .= "Date : " . date('d/m/Y à H:i') . "\n";
    $emailBody .= "IP : " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
    $emailBody .= "Navigateur : " . ($_SERVER['HTTP_USER_AGENT'] ?? 'N/A') . "\n\n";
    
    $emailBody .= "--\n";
    $emailBody .= "WiseConcept Services - Création & Design\n";
    $emailBody .= "Cet email a été généré automatiquement.\n";
    
    // Headers optimisés
    $headers = [];
    $headers[] = "From: WiseConcept Commande <contact@wiseconceptservices.com>";
    if (!empty($email)) {
        $headers[] = "Reply-To: $email";
    } else {
        $headers[] = "Reply-To: contact@wiseconceptservices.com";
    }
    $headers[] = "Return-Path: contact@wiseconceptservices.com";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: WiseConcept-Commande/1.0";
    $headers[] = "X-Priority: 1"; // Haute priorité pour les commandes
    $headers[] = "Importance: High";
    
    // Encodage du sujet
    $subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
    
    // Envoi
    if (mail($to, $subject, $emailBody, implode("\r\n", $headers))) {
        error_log("✅ Email de commande envoyé - ID #$lastId");
        
        // Optionnel : Envoyer un accusé de réception au client
        if (!empty($email)) {
            $clientSubject = "✅ Confirmation de votre commande #$lastId";
            $clientBody = "Bonjour $nom,\n\n";
            $clientBody .= "Nous avons bien reçu votre commande pour : $commandeLibelle\n\n";
            $clientBody .= "Notre équipe va étudier votre projet et vous contactera ";
            $clientBody .= "dans les plus brefs délais pour discuter des détails.\n\n";
            $clientBody .= "Merci pour votre confiance !\n\n";
            $clientBody .= "Cordialement,\n";
            $clientBody .= "L'équipe WiseConcept Services\n";
            $clientBody .= "contact@wiseconceptservices.com\n";
            
            $clientHeaders = [
                "From: WiseConcept Services <contact@wiseconceptservices.com>",
                "Reply-To: contact@wiseconceptservices.com",
                "Content-Type: text/plain; charset=UTF-8"
            ];
            
            mail($email, $clientSubject, $clientBody, implode("\r\n", $clientHeaders));
        }
        
    } else {
        error_log("⚠️ Email de commande échoué - ID #$lastId");
    }
    
    // Réponse succès
    $response['success'] = true;
    $response['message'] = 'Votre commande a été enregistrée avec succès ! Notre équipe vous contactera rapidement.';
    $response['commande_id'] = $lastId;
    
} catch (PDOException $e) {
    error_log("❌ Erreur DB commande: " . $e->getMessage());
    $response['message'] = 'Erreur technique. Veuillez réessayer.';
} catch (Exception $e) {
    error_log("❌ Erreur générale commande: " . $e->getMessage());
    $response['message'] = 'Erreur inattendue.';
}

echo json_encode($response);
?>
