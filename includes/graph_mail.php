<?php
/**
 * Envoi d'e-mails via Microsoft 365 (Microsoft Graph).
 *
 * Les identifiants viennent de ../private_config/config.php (jamais dans Git) :
 *   MS_TENANT_ID     ID de l'annuaire (tenant)
 *   MS_CLIENT_ID     ID de l'application
 *   MS_CLIENT_SECRET Valeur du secret client
 *   MS_SENDER        Boîte qui envoie, ex. contact@wiseconceptservices.com
 */

/**
 * Envoie un e-mail texte. Retourne true si Microsoft a accepté l'envoi.
 */
function sendGraphMail(string $to, string $subject, string $body, ?string $replyTo = null): bool
{
    foreach (['MS_TENANT_ID', 'MS_CLIENT_ID', 'MS_CLIENT_SECRET', 'MS_SENDER'] as $const) {
        if (!defined($const) || constant($const) === '') {
            error_log("Graph mail : constante $const manquante dans config.php");
            return false;
        }
    }

    $token = getGraphToken();
    if ($token === null) {
        return false;
    }

    $message = [
        'subject' => $subject,
        'body' => ['contentType' => 'Text', 'content' => $body],
        'toRecipients' => [['emailAddress' => ['address' => $to]]],
    ];
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $message['replyTo'] = [['emailAddress' => ['address' => $replyTo]]];
    }

    $url = 'https://graph.microsoft.com/v1.0/users/' . rawurlencode(MS_SENDER) . '/sendMail';
    [$status, $response] = graphHttpPost(
        $url,
        json_encode(['message' => $message, 'saveToSentItems' => false]),
        ['Authorization: Bearer ' . $token, 'Content-Type: application/json']
    );

    // Graph répond 202 (Accepted) quand l'e-mail est pris en charge
    if ($status === 202) {
        return true;
    }
    error_log("Graph mail : envoi refusé (HTTP $status) $response");
    return false;
}

/**
 * Obtient un jeton d'accès (flux « client credentials »).
 */
function getGraphToken(): ?string
{
    $url = 'https://login.microsoftonline.com/' . rawurlencode(MS_TENANT_ID) . '/oauth2/v2.0/token';
    [$status, $response] = graphHttpPost(
        $url,
        http_build_query([
            'client_id' => MS_CLIENT_ID,
            'client_secret' => MS_CLIENT_SECRET,
            'scope' => 'https://graph.microsoft.com/.default',
            'grant_type' => 'client_credentials',
        ]),
        ['Content-Type: application/x-www-form-urlencoded']
    );

    $data = json_decode((string) $response, true);
    if ($status === 200 && !empty($data['access_token'])) {
        return $data['access_token'];
    }
    $detail = $data['error_description'] ?? $data['error'] ?? $response;
    error_log("Graph mail : jeton refusé (HTTP $status) " . strtok((string) $detail, "\r\n"));
    return null;
}

/**
 * Requête POST simple avec cURL. Retourne [code HTTP, corps de la réponse].
 */
function graphHttpPost(string $url, string $body, array $headers): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);
    $response = curl_exec($ch);
    if ($response === false) {
        error_log('Graph mail : erreur réseau ' . curl_error($ch));
        $response = '';
    }
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$status, $response];
}
