<?php
// bridge.php - V2: Mit Unterordner-Support
// Sicherheits-Token (Muss mit dem im Hub übereinstimmen!)
$secret_key = "4382180593Rank-Scout"; // <--- HIER DEIN PASSWORT REIN

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// 1. Authentifizierung
$headers = getallheaders();
$auth_header = isset($headers['X-Auth-Token']) ? $headers['X-Auth-Token'] : ($_SERVER['HTTP_X_AUTH_TOKEN'] ?? '');

if ($auth_header !== $secret_key) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Falscher Key']);
    exit;
}

// 2. Daten empfangen
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['html']) || empty($data['html'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Kein HTML']);
    exit;
}

// 3. Pfad bestimmen
$slug = isset($data['slug']) ? trim($data['slug']) : '';
$slug = trim($slug, '/'); // Führende/Endende Slashes entfernen

// Sicherheits-Check: Nur Buchstaben, Zahlen, Bindestriche erlaubt (keine Punkte oder Pfad-Tricks)
if (!empty($slug) && !preg_match('/^[a-z0-9\-]+$/i', $slug)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ungültiger Pfad. Nur a-z, 0-9 und Bindestrich erlaubt.']);
    exit;
}

// Ziel-Datei bestimmen
if (empty($slug)) {
    // Startseite
    $target_file = 'index.html';
} else {
    // Unterordner
    if (!is_dir($slug)) {
        if (!mkdir($slug, 0755, true)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => "Konnte Ordner '$slug' nicht erstellen"]);
            exit;
        }
    }
    $target_file = $slug . '/index.html';
}

// 4. Speichern
if (file_put_contents($target_file, $data['html']) !== false) {
    echo json_encode([
        'status' => 'success', 
        'message' => "Seite erfolgreich in /$target_file gespeichert",
        'url' => empty($slug) ? '/' : "/$slug/"
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Schreibfehler']);
}
?>