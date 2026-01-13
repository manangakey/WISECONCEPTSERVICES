<?php
header('Content-Type: application/json; charset=utf-8');

// Activer le logging des erreurs
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

$response = ['success' => false, 'message' => ''];

// 1. Vérifier si on reçoit les données
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée';
    echo json_encode($response);
    exit;
}

// LOG pour voir ce qui arrive
error_log("=== NOUVELLE COMMANDE ===");
error_log("Nom: " . ($_POST['nom_complet'] ?? 'N/A'));
error_log("Tel: " . ($_POST['telephone'] ?? 'N/A'));
error_log("Commande: " . ($_POST['commande'] ?? 'N/A'));

// 2. Récupérer les données SANS validation stricte d'abord
$nom = $_POST['nom_complet'] ?? '';
$email = $_POST['email'] ?? '';
$telephone = $_POST['telephone'] ?? '';
$commande = $_POST['commande'] ?? '';
$description = $_POST['description'] ?? '';
$devis = isset($_POST['devis']) ? 'Oui' : 'Non';

// 3. Nettoyer
$nom = htmlspecialchars(trim($nom));
$email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
$telephone = htmlspecialchars(trim($telephone));
$commande = htmlspecialchars(trim($commande));
$description = htmlspecialchars(trim($description));

// 4. Validation minimale
if (empty($nom) || empty($telephone) || empty($commande)) {
    $response['message'] = 'Nom, téléphone et type de commande sont requis';
    echo json_encode($response);
    exit;
}

// 5. ENREGISTRER DANS UN FICHIER TXT (garantie de sauvegarde)
$logEntry = date('Y-m-d H:i:s') . " | $nom | $telephone | $email | $commande | $devis\n";
file_put_contents('commandes_log.txt', $logEntry, FILE_APPEND);

// 6. Tenter l'email (mais ne pas bloquer si ça échoue)
$emailSent = false;
try {
    $to = 'contact@wiseconceptservices.com';
    $subject = "Nouvelle commande: $commande - $nom";
    
    $message = "NOUVELLE COMMANDE WISECONCEPT\n";
    $message .= "=============================\n\n";
    $message .= "CLIENT:\n";
    $message .= "Nom: $nom\n";
    $message .= "Tél: $telephone\n";
    if (!empty($email)) $message .= "Email: $email\n";
    $message .= "Devis demandé: $devis\n\n";
    
    $message .= "COMMANDE:\n";
    $message .= "Type: $commande\n\n";
    
    $message .= "DESCRIPTION:\n";
    $message .= "$description\n\n";
    
    $message .= "---\n";
    $message .= "Date: " . date('d/m/Y H:i') . "\n";
    $message .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? '') . "\n";
    
    // Headers optimisés
    $headers = [];
    $headers[] = "From: WiseConcept <contact@wiseconceptservices.com>";
    $headers[] = "Reply-To: contact@wiseconceptservices.com";
    $headers[] = "Return-Path: contact@wiseconceptservices.com";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: WiseConcept-AutoMailer/1.0";
    
    // Encodage sujet UTF-8
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    
    // Tenter l'envoi
    if (@mail($to, $encodedSubject, $message, implode("\r\n", $headers))) {
        $emailSent = true;
        error_log("✅ Email envoyé pour commande: $nom");
    } else {
        error_log("⚠️ Email NON envoyé (fonction mail() échouée)");
        $emailSent = false;
    }
    
} catch (Exception $e) {
    error_log("❌ Exception email: " . $e->getMessage());
    $emailSent = false;
}

// 7. RÉPONSE SUCCÈS (même si email échoue)
$response['success'] = true;
$response['message'] = '✅ Commande enregistrée ! Nous vous contacterons dans les 24h.';
$response['data'] = [
    'nom' => $nom,
    'commande' => $commande,
    'email_sent' => $emailSent,
    'timestamp' => date('Y-m-d H:i:s')
];

// 8. ENVOYER la réponse
echo json_encode($response);

// 9. LOG final
error_log("✅ Commande traitée avec succès pour: $nom");
error_log("==========================================");
?>
