<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(0); // Désactiver l'affichage d'erreurs

$response = ['success' => false, 'message' => 'Erreur'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Méthode non autorisée';
    echo json_encode($response);
    exit;
}

// Données
$nom = htmlspecialchars($_POST['nom_complet'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$telephone = htmlspecialchars($_POST['telephone'] ?? '');
$commande = htmlspecialchars($_POST['commande'] ?? '');
$description = htmlspecialchars($_POST['description'] ?? '');
$devis = isset($_POST['devis']) ? 1 : 0;

// Validation
if (empty($nom) || empty($telephone) || empty($commande) || empty($description)) {
    $response['message'] = 'Champs obligatoires manquants';
    echo json_encode($response);
    exit;
}

try {
    // 1. EMAIL À VOUS
    $to = 'contact@wiseconceptservices.com';
    $subject = "Commande: $commande - $nom";
    
    $message = "Nouvelle commande WiseConcept\n\n";
    $message .= "Client: $nom\n";
    $message .= "Téléphone: $telephone\n";
    if ($email) $message .= "Email: $email\n";
    $message .= "Service: $commande\n";
    $message .= "Devis: " . ($devis ? 'Oui' : 'Non') . "\n\n";
    $message .= "Description:\n$description\n\n";
    $message .= date('d/m/Y H:i');
    
    $headers = [
        "From: WiseConcept Commande <contact@wiseconceptservices.com>",
        "Reply-To: contact@wiseconceptservices.com",
        "Content-Type: text/plain; charset=UTF-8"
    ];
    
    mail($to, $subject, $message, implode("\r\n", $headers));
    
    // 2. RÉPONSE SUCCÈS
    $response['success'] = true;
    $response['message'] = 'Commande envoyée ! Nous vous contacterons rapidement.';
    $response['commande_id'] = uniqid();
    
} catch (Exception $e) {
    $response['message'] = 'Erreur serveur';
}

echo json_encode($response);
?>
