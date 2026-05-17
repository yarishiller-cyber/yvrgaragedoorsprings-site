<?php
/**
 * YVR Garage Door Springs — Weather backend
 *
 * Fetches Environment Canada citypage XML for Vancouver (station s0000141)
 * roughly every 2 hours and caches the result to /weather.json. The
 * front-end JS reads weather.json (preferred) or hits this endpoint directly.
 *
 * Cold-snap decision rules (per foundational research Section 2.1.4):
 *   - Forecast low <= 0°C anywhere in the next 24h, OR
 *   - Current observed temp <= +2°C with a 24h drop >= 5°C
 *
 * Hostinger setup: PHP 7.4+ with allow_url_fopen=On (default).
 * Recommended: also schedule this as a cron task every hour for redundancy.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=900, s-maxage=900'); // 15 min CDN cache
header('Access-Control-Allow-Origin: *');

$cacheFile   = __DIR__ . '/weather.json';
$cacheTtl    = 2 * 60 * 60;          // 2 hours
$lockFile    = __DIR__ . '/weather.lock';
$eccUrl      = 'https://dd.weather.gc.ca/citypage_weather/xml/BC/s0000141_e.xml';
$fetchTimeoutSec = 8;

/* ---------- Helper: serve cache ---------- */
function serve_cache(string $path): bool {
    if (!is_file($path)) return false;
    $body = @file_get_contents($path);
    if ($body === false) return false;
    echo $body;
    return true;
}

/* ---------- Helper: write atomic ---------- */
function write_atomic(string $path, string $content): bool {
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $content, LOCK_EX) === false) return false;
    return @rename($tmp, $path);
}

/* ---------- Decide if we should refresh ---------- */
$needsRefresh = !is_file($cacheFile) || (time() - filemtime($cacheFile)) > $cacheTtl;

if (!$needsRefresh) {
    serve_cache($cacheFile);
    exit;
}

/* ---------- Prevent thundering herd: file lock ---------- */
$lockHandle = @fopen($lockFile, 'c');
if ($lockHandle && flock($lockHandle, LOCK_EX | LOCK_NB)) {
    // We acquired the lock. Do the refresh.
    try {
        $ctx = stream_context_create([
            'http' => [
                'timeout' => $fetchTimeoutSec,
                'user_agent' => 'yvrgaragedoorsprings.ca cold-snap fetcher (info@yvrgaragedoorsprings.ca)',
                'follow_location' => 1,
            ],
            'https' => [
                'timeout' => $fetchTimeoutSec,
            ],
        ]);

        $xml = @file_get_contents($eccUrl, false, $ctx);

        if ($xml === false || strlen($xml) < 100) {
            throw new RuntimeException('ECCC fetch failed');
        }

        $doc = @simplexml_load_string($xml);
        if ($doc === false) {
            throw new RuntimeException('ECCC XML parse failed');
        }

        /* Current observation */
        $currentC = null;
        if (isset($doc->currentConditions->temperature)) {
            $val = (string)$doc->currentConditions->temperature;
            if ($val !== '') $currentC = (float)$val;
        }

        /* Forecast minimum over next 24 hours */
        $forecastLowC = null;
        if (isset($doc->forecastGroup->forecast)) {
            $count = 0;
            foreach ($doc->forecastGroup->forecast as $fc) {
                if ($count >= 2) break; // first 2 forecast periods ≈ next 24h
                if (isset($fc->temperatures->temperature)) {
                    foreach ($fc->temperatures->temperature as $t) {
                        $cls = (string)$t['class'];
                        $val = (string)$t;
                        if ($val === '') continue;
                        $n = (float)$val;
                        if ($cls === 'low' || $cls === 'min') {
                            if ($forecastLowC === null || $n < $forecastLowC) {
                                $forecastLowC = $n;
                            }
                        }
                    }
                }
                $count++;
            }
        }

        /* Yesterday's high for drop calculation (best-effort) */
        $yesterdayHighC = null;
        if (isset($doc->yesterdayConditions->temperature)) {
            foreach ($doc->yesterdayConditions->temperature as $t) {
                if ((string)$t['class'] === 'high') {
                    $yesterdayHighC = (float)(string)$t;
                }
            }
        }

        /* Cold-snap decision */
        $cold = false;
        $reason = null;

        if ($forecastLowC !== null && $forecastLowC <= 0) {
            $cold = true;
            $reason = 'forecast-low';
        } elseif ($currentC !== null && $currentC <= 2.0 && $yesterdayHighC !== null && ($yesterdayHighC - $currentC) >= 5) {
            $cold = true;
            $reason = 'rapid-drop';
        }

        $message = null;
        if ($cold) {
            $lowDisplay = $forecastLowC !== null
                ? sprintf('%+d', (int)round($forecastLowC)) . '°C'
                : sprintf('%+d', (int)round($currentC ?? 0)) . '°C';
            $message = 'Cold snap on the South Coast — forecast low ' . $lowDisplay . '. Springs break at 0°C. Booking up fast.';
        }

        $payload = [
            'cold'             => $cold,
            'current_c'        => $currentC,
            'forecast_low_c'   => $forecastLowC,
            'yesterday_high_c' => $yesterdayHighC,
            'message'          => $message,
            'reason'           => $reason,
            'station'          => 'YVR (Vancouver Intl)',
            'source'           => 'Environment Canada citypage XML',
            'updated'          => gmdate('c'),
            'ttl_seconds'      => $cacheTtl,
        ];

        $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            write_atomic($cacheFile, $json);
        }

        echo $json;

    } catch (Throwable $e) {
        // Fetch failed — keep serving the old cache if we have one
        if (!serve_cache($cacheFile)) {
            // No cache available either — return a safe "not cold" default
            echo json_encode([
                'cold' => false,
                'updated' => gmdate('c'),
                'error' => 'ECCC fetch failed; no cache available',
            ]);
        }
    } finally {
        flock($lockHandle, LOCK_UN);
        fclose($lockHandle);
    }
} else {
    // Another visitor is refreshing right now — serve the stale cache
    if (!serve_cache($cacheFile)) {
        echo json_encode([
            'cold' => false,
            'updated' => gmdate('c'),
            'note' => 'Refresh in progress',
        ]);
    }
    if ($lockHandle) fclose($lockHandle);
}
