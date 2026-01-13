<?php
// send_commande.php - VERSION COMPLÈTE CORRIGÉE
header('Content-Type: application/json; charset=utf-8');

// Activer le logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

$response = ['success' => false, 'message' => ''];

// 1. Vérifier méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée';
    echo json_encode($response);
    exit;
}

// 2. Récupérer et valider données
$nom = trim($_POST['nom_complet'] ?? '');
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telephone = trim($_POST['telephone'] ?? '');
$commande = trim($_POST['commande'] ?? '');
$description = trim($_POST['description'] ?? '');
$devis = isset($_POST['devis']) ? 1 : 0;

// Validation
if (empty($nom) || empty($telephone) || empty($commande)) {
    $response['message'] = 'Nom, téléphone et type de commande sont requis';
    echo json_encode($response);
    exit;
}

// Log des données reçues
error_log("=== COMMANDE REÇUE ===");
error_log("Nom: $nom");
error_log("Tel: $telephone");
error_log("Email: $email");
error_log("Commande: $commande");
error_log("Devis: $devis");

// 3. Connexion à la base de données
try {
    require_once '../private_config/config.php';
    
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    error_log("✅ Connexion DB réussie");
    
    // 4. Créer la table si elle n'existe pas (SQL corrigé)
    $sqlCreateTable = "
    CREATE TABLE IF NOT EXISTS `commandes` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `nom_complet` VARCHAR(100) NOT NULL,
        `email` VARCHAR(100) DEFAULT NULL,
        `telephone` VARCHAR(30) NOT NULL,
        `type_commande` VARCHAR(50) NOT NULL,
        `description` TEXT NOT NULL,
        `demande_devis` TINYINT(1) DEFAULT 1,
        `date_commande` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `statut` ENUM('nouvelle', 'en_cours', 'terminee', 'annulee') DEFAULT 'nouvelle',
        PRIMARY KEY (`id`),
        INDEX `idx_statut` (`statut`),
        INDEX `idx_date` (`date_commande`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sqlCreateTable);
    error_log("✅ Table 'commandes' vérifiée/créée");
    
    // 5. Mapping des types de commande
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
    
    // 6. Insertion des données (SQL corrigé)
    $sqlInsert = "INSERT INTO commandes 
                  (nom_complet, email, telephone, type_commande, description, demande_devis) 
                  VALUES (:nom, :email, :telephone, :type_commande, :description, :devis)";
    
    $stmt = $pdo->prepare($sqlInsert);
    
    $insertSuccess = $stmt->execute([
        ':nom' => $nom,
        ':email' => empty($email) ? null : $email,
        ':telephone' => $telephone,
        ':type_commande' => $commandeLibelle,
        ':description' => $description,
        ':devis' => $devis
    ]);
    
    if ($insertSuccess) {
        $lastId = $pdo->lastInsertId();
        error_log("✅ Commande insérée en base. ID: $lastId");
        
        $response['success'] = true;
        $response['message'] = '✅ Commande enregistrée ! Notre équipe vous contactera dans les 24h.';
        $response['commande_id'] = $lastId;
        $response['db_inserted'] = true;
        
    } else {
        error_log("❌ Échec insertion en base");
        $response['message'] = 'Erreur lors de l\'enregistrement en base de données';
    }
    
} catch (PDOException $e) {
    error_log("❌ Erreur PDO: " . $e->getMessage());
    $response['message'] = 'Erreur base de données: ' . $e->getMessage();
    
    // Enregistrer dans un fichier texte comme backup
    $backupData = [
        'date' => date('Y-m-d H:i:s'),
        'nom' => $nom,
        'telephone' => $telephone,
        'email' => $email,
        'commande' => $commande,
        'description' => $description,
        'devis' => $devis,
        'error' => $e->getMessage()
    ];
    
    file_put_contents('commandes_backup.txt', 
        json_encode($backupData, JSON_PRETTY_PRINT) . ",\n", 
        FILE_APPEND
    );
    
    $response['backup_saved'] = true;
    
} catch (Exception $e) {
    error_log("❌ Erreur générale: " . $e->getMessage());
    $response['message'] = 'Erreur inattendue: ' . $e->getMessage();
}

// 7. Envoyer l'email (même si DB échoue)
try {
    $to = 'contact@wiseconceptservices.com';
    $subject = "Nouvelle commande: $commande - $nom";
    
    $emailBody = "NOUVELLE COMMANDE WISECONCEPT\n";
    $emailBody .= "=============================\n\n";
    $emailBody .= "CLIENT:\n";
    $emailBody .= "Nom: $nom\n";
    $emailBody .= "Tél: $telephone\n";
    if (!empty($email)) $emailBody .= "Email: $email\n";
    $emailBody .= "Devis demandé: " . ($devis ? 'Oui' : 'Non') . "\n\n";
    
    $emailBody .= "COMMANDE:\n";
    $emailBody .= "Type: $commande\n\n";
    
    $emailBody .= "DESCRIPTION:\n";
    $emailBody .= "$description\n\n";
    
    $emailBody .= "STATUT DB: " . ($response['db_inserted'] ?? false ? 'Inserée' : 'Échec') . "\n";
    if (isset($response['commande_id'])) {
        $emailBody .= "ID Commande: #" . $response['commande_id'] . "\n";
    }
    
    $emailBody .= "---\n";
    $emailBody .= "Date: " . date('d/m/Y H:i') . "\n";
    $emailBody .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";
    
    // Headers
    $headers = [];
    $headers[] = "From: WiseConcept <contact@wiseconceptservices.com>";
    $headers[] = "Reply-To: contact@wiseconceptservices.com";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    
    // Encodage sujet
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    
    // Envoi
    if (@mail($to, $encodedSubject, $emailBody, implode("\r\n", $headers))) {
        error_log("✅ Email envoyé");
        $response['email_sent'] = true;
    } else {
        error_log("⚠️ Email non envoyé");
        $response['email_sent'] = false;
    }
    
} catch (Exception $e) {
    error_log("⚠️ Erreur email: " . $e->getMessage());
    $response['email_sent'] = false;
}

// 8. Réponse finale
echo json_encode($response);

// 9. Log final
error_log("=== TRAITEMENT TERMINÉ ===");
error_log("Succès: " . ($response['success'] ? 'Oui' : 'Non'));
error_log("Message: " . $response['message']);
error_log("=================================\n");
?>
