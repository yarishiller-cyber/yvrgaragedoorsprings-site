<?php
/**
 * YVR Garage Door Springs — Partner application handler
 *
 * Receives the #partner-form POST from /partners/, then:
 *   1. Emails the full application to info@yvrgaragedoorsprings.ca
 *   2. Sends the applicant an auto-reply confirmation
 * Returns JSON so the front-end can show an inline thank-you state.
 *
 * Hostinger: PHP 7.4+, native mail() (same setup as weather.php / quote.php).
 * On-domain From/envelope-sender keeps both messages SPF-aligned.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ---------- POST only ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

/* ---------- Honeypot ---------- */
if (!empty($_POST['url'])) {
    echo json_encode(['ok' => true]);
    exit;
}

/* ---------- Helpers ---------- */
function field(string $key, int $max = 200): string {
    $v = isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
    $v = str_replace(["\r", "\n", "\0"], ' ', $v);
    return mb_substr($v, 0, $max);
}
function multiline(string $key, int $max = 2000): string {
    $v = isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
    return mb_substr(str_replace("\0", '', $v), 0, $max);
}
function checks(string $key, int $maxItems = 30, int $maxLen = 80): array {
    if (!isset($_POST[$key]) || !is_array($_POST[$key])) return [];
    $out = [];
    foreach ($_POST[$key] as $v) {
        $v = trim(str_replace(["\r", "\n", "\0"], ' ', (string) $v));
        if ($v !== '') $out[] = mb_substr($v, 0, $maxLen);
        if (count($out) >= $maxItems) break;
    }
    return $out;
}

/* ---------- Collect ---------- */
$name        = field('name', 120);
$business    = field('business', 160);
$email       = field('email', 180);
$phone       = field('phone', 40);
$city        = field('city', 120);
$website     = field('website', 200);
$years       = field('years', 60);
$team        = field('team', 40);
$services    = checks('services');
$trades      = checks('trades');
$tradesOther = field('trades_other', 200);
$coverage    = field('coverage', 300);
$insurance   = field('insurance', 80);
$about       = multiline('about', 3000);
$referral    = field('referral', 200);

/* ---------- Validate ---------- */
$errors = [];
if ($name === '')      $errors[] = 'name';
if ($business === '')  $errors[] = 'business';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (strlen(preg_replace('/\D+/', '', $phone)) < 7) $errors[] = 'phone';
if ($city === '')      $errors[] = 'city';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

/* ---------- Compose admin notification ---------- */
$adminTo = 'info@yvrgaragedoorsprings.ca';
$from    = 'noreply@yvrgaragedoorsprings.ca';
$brand   = 'YVR Garage Door Springs';

$when = gmdate('Y-m-d H:i:s') . ' UTC';
$ip   = $_SERVER['REMOTE_ADDR'] ?? '—';

$adminSubject = 'New partner application — ' . $business;
$adminBody = implode("\n", [
    'New partner application from yvrgaragedoorsprings.ca',
    '',
    'Contact name:   ' . $name,
    'Business:       ' . $business,
    'Email:          ' . $email,
    'Phone:          ' . $phone,
    'City/location:  ' . $city,
    'Website:        ' . ($website !== '' ? $website : '—'),
    '',
    'Years in industry: ' . ($years !== '' ? $years : '—'),
    'Team size:         ' . ($team !== '' ? $team : '—'),
    'Insurance/WCB:     ' . ($insurance !== '' ? $insurance : '—'),
    '',
    'Services offered:  ' . ($services ? implode(', ', $services) : '—'),
    'Other trades:      ' . ($trades ? implode(', ', $trades) : '—'),
    'Other skills:      ' . ($tradesOther !== '' ? $tradesOther : '—'),
    'Coverage area:     ' . ($coverage !== '' ? $coverage : '—'),
    'Heard about us:    ' . ($referral !== '' ? $referral : '—'),
    '',
    'About the business:',
    ($about !== '' ? $about : '—'),
    '',
    '------------------------------------------',
    'Submitted: ' . $when,
    'IP:        ' . $ip,
]);
$adminHeaders = implode("\r\n", [
    'From: ' . $brand . ' Partners <' . $from . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
]);

$adminSent = @mail($adminTo, $adminSubject, $adminBody, $adminHeaders, '-f ' . $from);

/* ---------- Compose applicant auto-reply ---------- */
$replyFrom    = 'info@yvrgaragedoorsprings.ca';
$replySubject = 'Thanks for applying to partner with ' . $brand;
$firstName    = trim(explode(' ', $name)[0]);
$replyBody = implode("\n", [
    'Hi ' . ($firstName !== '' ? $firstName : 'there') . ',',
    '',
    'Thank you for applying to join the ' . $brand . ' partner network. We\'ve',
    'received your application for ' . $business . ' and a real person will review it.',
    '',
    'What happens next:',
    '  1. We review your application (usually within a few business days).',
    '  2. If it\'s a fit, we\'ll reach out to talk coverage areas and the kind of',
    '     work we can send your way.',
    '  3. From there, we start referring customers — you quote, do, and bill the',
    '     work directly. We just make the introduction.',
    '',
    'If anything changes or you\'d like to add details, just reply to this email',
    'or call us at (778) 800-0769.',
    '',
    'Talk soon,',
    'The ' . $brand . ' team',
    'info@yvrgaragedoorsprings.ca · (778) 800-0769',
    'https://yvrgaragedoorsprings.ca/',
]);
$replyHeaders = implode("\r\n", [
    'From: ' . $brand . ' <' . $replyFrom . '>',
    'Reply-To: ' . $replyFrom,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
]);

@mail($email, $replySubject, $replyBody, $replyHeaders, '-f ' . $replyFrom);

/* ---------- Respond ---------- */
if ($adminSent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'send_failed']);
}
