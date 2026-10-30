<?php
// send_commande.php - enregistre une commande et prévient l'équipe par e-mail (Microsoft 365)
header('Content-Type: application/json; charset=utf-8');

require_once '../private_config/config.php';
require_once __DIR__ . '/includes/graph_mail.php';

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

if (empty($nom) || empty($telephone) || empty($commande)) {
    $response['message'] = 'Nom, téléphone et type de commande sont requis';
    echo json_encode($response);
    exit;
}

// Libellés lisibles des types de commande
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

$dbInserted = false;
$lastId = null;

// 3. Enregistrement en base de données
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $pdo->exec("
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
    ");

    $stmt = $pdo->prepare(
        "INSERT INTO commandes (nom_complet, email, telephone, type_commande, description, demande_devis)
         VALUES (:nom, :email, :telephone, :type_commande, :description, :devis)"
    );
    $dbInserted = $stmt->execute([
        ':nom' => $nom,
        ':email' => empty($email) ? null : $email,
        ':telephone' => $telephone,
        ':type_commande' => $commandeLibelle,
        ':description' => $description,
        ':devis' => $devis
    ]);

    if ($dbInserted) {
        $lastId = $pdo->lastInsertId();
        $response['commande_id'] = $lastId;
    }
} catch (Exception $e) {
    // Le détail technique reste dans le journal du serveur, jamais affiché au visiteur
    error_log('Commande : erreur base de données ' . $e->getMessage());

    // Copie de secours hors du dossier public (private_config n'est pas accessible depuis le web)
    $backupData = [
        'date' => date('Y-m-d H:i:s'),
        'nom' => $nom,
        'telephone' => $telephone,
        'email' => $email,
        'commande' => $commandeLibelle,
        'description' => $description,
        'devis' => $devis,
    ];
    @file_put_contents(
        __DIR__ . '/../private_config/commandes_backup.txt',
        json_encode($backupData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ",\n",
        FILE_APPEND
    );
}

// 4. E-mail à l'équipe via Microsoft 365 (envoyé même si la base échoue)
$emailBody = "NOUVELLE COMMANDE WISECONCEPT\n";
$emailBody .= "=============================\n\n";
$emailBody .= "CLIENT :\n";
$emailBody .= "Nom : $nom\n";
$emailBody .= "Tél : $telephone\n";
if (!empty($email)) $emailBody .= "Email : $email\n";
$emailBody .= "Devis demandé : " . ($devis ? 'Oui' : 'Non') . "\n\n";
$emailBody .= "COMMANDE :\n";
$emailBody .= "Type : $commandeLibelle\n\n";
$emailBody .= "DESCRIPTION :\n";
$emailBody .= "$description\n\n";
$emailBody .= "STATUT BASE : " . ($dbInserted ? 'Enregistrée' : 'Échec (copie de secours dans private_config)') . "\n";
if ($lastId) $emailBody .= "ID Commande : #$lastId\n";
$emailBody .= "---\n";
$emailBody .= "Date : " . date('d/m/Y H:i') . "\n";

$emailSent = sendGraphMail(
    'contact@wiseconceptservices.com',
    "🛒 Nouvelle commande : $commandeLibelle - $nom",
    $emailBody,
    !empty($email) ? $email : null
);
if (!$emailSent) {
    error_log('Commande : e-mail non envoyé' . ($lastId ? " (ID #$lastId)" : ''));
}

// 5. Réponse : la commande est prise en compte si elle est en base OU si l'équipe a reçu l'e-mail
if ($dbInserted || $emailSent) {
    $response['success'] = true;
    $response['message'] = '✅ Commande enregistrée ! Notre équipe vous contactera dans les 24h.';
} else {
    $response['message'] = "Votre commande n'a pas pu être envoyée. Veuillez réessayer ou nous contacter par téléphone.";
}

echo json_encode($response);
