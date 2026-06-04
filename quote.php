<?php
/**
 * YVR Garage Door Springs — Quote-request mail handler
 *
 * Receives a POST from the #quote-form (postal, phone, what) and emails it to
 * info@yvrgaragedoorsprings.ca. Returns JSON so the front-end can show an
 * inline success state; the JS falls back to a mailto: link if this fails.
 *
 * Hostinger setup: PHP 7.4+, native mail() enabled (same host as weather.php).
 * Deliverability: From/envelope-sender are on-domain (noreply@yvrgaragedoor…)
 * so the message aligns with the domain SPF record and lands in the inbox.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ---------- Only accept POST ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

/* ---------- Honeypot: silently accept bot submissions ---------- */
if (!empty($_POST['company'])) {
    echo json_encode(['ok' => true]);
    exit;
}

/* ---------- Helpers ---------- */
// Single-line fields: strip CR/LF to prevent header injection.
function field(string $key, int $max = 200): string {
    $v = isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
    $v = str_replace(["\r", "\n", "\0"], ' ', $v);
    return mb_substr($v, 0, $max);
}

$postal = field('postal', 20);
$phone  = field('phone', 40);
$page   = field('page', 200);
$city   = field('city', 80);

// Multi-line message body — newlines allowed, just length-capped.
$what = isset($_POST['what']) ? trim((string) $_POST['what']) : '';
$what = mb_substr(str_replace("\0", '', $what), 0, 2000);

/* ---------- Minimal validation: a phone is the one thing we need ---------- */
$digits = preg_replace('/\D+/', '', $phone);
if (strlen($digits) < 7) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'phone_required']);
    exit;
}

/* ---------- Compose ---------- */
$to      = 'info@yvrgaragedoorsprings.ca';
$from    = 'noreply@yvrgaragedoorsprings.ca';
$subject = 'New spring repair request' . ($city !== '' ? ' — ' . $city : '');

$when = gmdate('Y-m-d H:i:s') . ' UTC';
$ip   = $_SERVER['REMOTE_ADDR'] ?? '—';

$body = implode("\n", [
    'New quote request from yvrgaragedoorsprings.ca',
    '',
    'Phone:        ' . $phone,
    'Postal code:  ' . ($postal !== '' ? $postal : '—'),
    'Nearest city: ' . ($city !== '' ? $city : '—'),
    '',
    'What broke:',
    ($what !== '' ? $what : '—'),
    '',
    '------------------------------------------',
    'Submitted:    ' . $when,
    'From page:    ' . ($page !== '' ? $page : '—'),
    'IP:           ' . $ip,
]);

$headers = implode("\r\n", [
    'From: YVR Quote Form <' . $from . '>',
    'Reply-To: ' . $from,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
]);

/* ---------- Send (envelope sender -f aids SPF alignment on Hostinger) ---------- */
$sent = @mail($to, $subject, $body, $headers, '-f ' . $from);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'send_failed']);
}
