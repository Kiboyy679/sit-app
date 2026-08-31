<?php
namespace App\Services;

use App\Models\{User, UserAlias, Theme, FypReport, ImportRow};
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CsvImportService
{
    // Known column aliases (header → normalized field)
    private array $knownColumns = [
        'nama' => 'employee_name',
        'name' => 'employee_name',
        'karyawan' => 'employee_name',
        'employee' => 'employee_name',
        'url' => 'original_url',
        'link' => 'original_url',
        'postingan' => 'original_url',
        'post_url' => 'original_url',
        'platform' => 'platform',
        'media' => 'platform',
        'sosial_media' => 'platform',
        'tema' => 'theme_name',
        'theme' => 'theme_name',
        'kategori' => 'theme_name',
        'category' => 'theme_name',
        'penayangan' => 'impressions',
        'views' => 'impressions',
        'tayangan' => 'impressions',
        'views_count' => 'impressions',
        'interaksi' => 'engagements',
        'engagement' => 'engagements',
        'likes' => 'engagements',
        'tanda_suka' => 'engagements',
        'tanggal' => 'date',
        'date' => 'date',
        'periode' => 'date',
        'jenis' => 'post_type',
        'type' => 'post_type',
        'tipe_postingan' => 'post_type',
    ];

    private array $platformAliases = [
        'tiktok' => 'tiktok', 'tik tok' => 'tiktok', 'tt' => 'tiktok',
        'instagram' => 'instagram', 'ig' => 'instagram', 'insta' => 'instagram',
        'youtube' => 'youtube', 'yt' => 'youtube', 'ytb' => 'youtube',
        'facebook' => 'facebook', 'fb' => 'facebook',
        'x' => 'x', 'twitter' => 'x', 'tw' => 'x',
        'threads' => 'threads', 'thread' => 'threads',
    ];

    private array $postTypeAliases = [
        'main' => 'main', 'utama' => 'main', 'postingan utama' => 'main', 'post' => 'main',
        'reply' => 'reply', 'balasan' => 'reply', 'comment' => 'comment', 'komentar' => 'comment',
    ];

    /**
     * IMP-01/02: Parse CSV file, detect headers
     */
    public function parseFile(string $filePath): array
    {
        $handle = fopen($filePath, 'r');
        if (!$handle) throw new \RuntimeException('Gagal membuka file CSV.');

        // IMP-01: Read first 100 rows to detect headers
        $headers = [];
        $sampleRows = [];
        $rowIndex = 0;

        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            if ($rowIndex === 0) {
                $headers = $row;
            } elseif ($rowIndex <= 100) {
                $sampleRows[] = $row;
            }
            $rowIndex++;
        }
        fclose($handle);

        // IMP-02: Auto-detect header mapping
        $mapping = $this->detectMapping($headers);

        return [
            'total_rows' => $rowIndex - 1, // minus header
            'headers' => $headers,
            'mapping' => $mapping,
            'sample' => $sampleRows,
        ];
    }

    /**
     * IMP-02: Detect column mapping from headers
     */
    public function detectMapping(array $headers): array
    {
        $mapping = [];
        foreach ($headers as $idx => $header) {
            $normalized = strtolower(trim($header));
            $normalized = preg_replace('/[^a-z0-9_\x80-\xff]/u', '', $normalized);
            if (isset($this->knownColumns[$normalized])) {
                $mapping[$idx] = $this->knownColumns[$normalized];
            }
        }
        return $mapping;
    }

    /**
     * IMP-03..08: Process rows — validate, normalize, detect anomalies
     */
    public function processRows(string $filePath, array $mapping): array
    {
        $handle = fopen($filePath, 'r');
        if (!$handle) throw new \RuntimeException('Gagal membuka file CSV.');

        $headers = fgetcsv($handle, 0, ',');
        $allRows = [];
        $anomalies = [];
        $stats = ['total' => 0, 'valid' => 0, 'invalid' => 0, 'anomalies' => 0];

        // Load lookup data
        $users = User::all()->keyBy('name');
        $aliases = UserAlias::all()->keyBy('alias');
        $existingUrls = FypReport::pluck('original_url')->toArray();

        $rowIndex = 0;
        while (($rawRow = fgetcsv($handle, 0, ',')) !== false) {
            $rowIndex++;
            $stats['total']++;

            $mapped = $this->mapRow($rawRow, $headers, $mapping);
            $errors = $this->validateRow($mapped, $rowIndex);

            if (!empty($errors)) {
                $stats['invalid']++;
                $allRows[] = ['data' => $mapped, 'errors' => $errors, 'status' => 'invalid', 'row' => $rowIndex];
                continue;
            }

            // IMP-05: Normalize aliases → user
            if (!empty($mapped['employee_name'])) {
                $resolved = $this->resolveUser($mapped['employee_name'], $users, $aliases);
                $mapped['user_id'] = $resolved['user_id'] ?? null;
                $mapped['user_name'] = $resolved['name'] ?? $mapped['employee_name'];
                if ($resolved['method'] === 'alias') {
                    $mapped['resolved_from'] = $mapped['employee_name'];
                }
            }

            // IMP-06: Normalize platform
            if (!empty($mapped['platform'])) {
                $mapped['platform'] = $this->normalizePlatform($mapped['platform']);
            }

            // IMP-08: URL duplicates within batch
            $isDuplicate = in_array($mapped['original_url'] ?? '', $existingUrls);

            // IMP-15: Anomaly detection
            $rowAnomalies = $this->detectRowAnomalies($mapped, $rowIndex, $existingUrls);

            if ($isDuplicate || !empty($rowAnomalies)) {
                $stats['anomalies']++;
                foreach ($rowAnomalies as $a) $anomalies[] = $a;
            }

            $status = $isDuplicate ? 'duplicate' : ($rowAnomalies ? 'warning' : 'valid');
            $allRows[] = [
                'data' => $mapped,
                'errors' => [],
                'status' => $status,
                'row' => $rowIndex,
                'anomalies' => $rowAnomalies,
                'is_duplicate_url' => $isDuplicate,
            ];

            if ($status === 'valid') $stats['valid']++;
        }
        fclose($handle);

        return ['rows' => $allRows, 'stats' => $stats, 'anomalies' => $anomalies];
    }

    /**
     * IMP-09: Commit valid rows to database
     */
    public function commitRows(array $rows, int $userId, string $period): array
    {
        $committed = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            if ($row['status'] === 'invalid' || $row['status'] === 'skipped') {
                $skipped++;
                continue;
            }

            $data = $row['data'];

            try {
                // Resolve user if not yet resolved
                if (empty($data['user_id']) && !empty($data['employee_name'])) {
                    $user = User::where('name', $data['employee_name'])->first();
                    if ($user) $data['user_id'] = $user->id;
                }

                if (empty($data['user_id'])) {
                    $skipped++;
                    continue;
                }

                // Resolve theme
                $themeId = null;
                if (!empty($data['theme_name'])) {
                    $normalized = strtolower(preg_replace('/[^a-z0-9]/i', '', $data['theme_name']));
                    $theme = \App\Models\Theme::firstOrCreate(
                        ['normalized' => $normalized],
                        ['name' => $data['theme_name'], 'is_canonical' => false, 'usage_count' => 0]
                    );
                    $theme->increment('usage_count');
                    $themeId = $theme->id;
                }

                // Create FYP Report
                if (!empty($data['original_url'])) {
                    $contentKey = ($data['platform'] ?? 'unknown') . '_' . md5($data['original_url']);

                    FypReport::updateOrCreate(
                        ['content_key' => $contentKey],
                        [
                            'user_id' => $data['user_id'],
                            'theme_id' => $themeId,
                            'platform' => $data['platform'] ?? 'unknown',
                            'original_url' => $data['original_url'],
                            'content_key' => $contentKey,
                            'post_type' => $this->normalizePostType($data['post_type'] ?? 'main'),
                            'impressions' => intval($data['impressions'] ?? 0),
                            'engagements' => intval($data['engagements'] ?? 0),
                            'status' => 'pending',
                            'engagement_exceeds_views' => (intval($data['engagements'] ?? 0) > intval($data['impressions'] ?? 0)),
                        ]
                    );
                    $committed++;
                } else {
                    $skipped++;
                }
            } catch (\Exception $e) {
                Log::warning('CSV import row failed', ['row' => $row['row'] ?? '?', 'error' => $e->getMessage()]);
                $skipped++;
            }
        }

        return ['committed' => $committed, 'skipped' => $skipped];
    }

    // ─── Private Helpers ───

    private function mapRow(array $rawRow, array $headers, array $mapping): array
    {
        $mapped = [];
        foreach ($mapping as $colIdx => $field) {
            $mapped[$field] = $rawRow[$colIdx] ?? null;
        }
        return $mapped;
    }

    private function validateRow(array $mapped, int $rowIndex): array
    {
        $errors = [];
        if (empty($mapped['original_url'])) $errors[] = 'URL tidak boleh kosong';
        if (!empty($mapped['original_url']) && !filter_var($mapped['original_url'], FILTER_VALIDATE_URL)) {
            $errors[] = 'URL tidak valid';
        }
        if (!empty($mapped['impressions']) && !is_numeric($mapped['impressions'])) {
            $errors[] = 'Penayangan harus angka';
        }
        if (!empty($mapped['engagements']) && !is_numeric($mapped['engagements'])) {
            $errors[] = 'Interaksi harus angka';
        }
        return $errors;
    }

    private function resolveUser(string $name, $users, $aliases): array
    {
        // Direct match
        if ($users->has($name)) {
            return ['user_id' => $users[$name]->id, 'name' => $name, 'method' => 'direct'];
        }
        // Alias match
        if ($aliases->has($name)) {
            $alias = $aliases[$name];
            return ['user_id' => $alias->user_id, 'name' => $alias->user->name, 'method' => 'alias'];
        }
        // Fuzzy: first word match
        $firstWord = explode(' ', $name)[0];
        $match = $users->first(fn($u) => stripos($u->name, $firstWord) === 0);
        if ($match) {
            return ['user_id' => $match->id, 'name' => $match->name, 'method' => 'fuzzy'];
        }
        return ['user_id' => null, 'name' => $name, 'method' => 'none'];
    }

    private function normalizePlatform(string $input): string
    {
        $lower = strtolower(trim($input));
        return $this->platformAliases[$lower] ?? $lower;
    }

    private function normalizePostType(string $input): string
    {
        $lower = strtolower(trim($input));
        return $this->postTypeAliases[$lower] ?? 'main';
    }

    /**
     * IMP-15: Detect anomalies in a single row
     */
    private function detectRowAnomalies(array $mapped, int $rowIndex, array $existingUrls): array
    {
        $anomalies = [];
        $views = intval($mapped['impressions'] ?? 0);
        $engagements = intval($mapped['engagements'] ?? 0);

        // View spike detection (>100k views from unknown user)
        if ($views > 100000 && empty($mapped['user_id'])) {
            $anomalies[] = [
                'type' => 'view_spike',
                'row' => $rowIndex,
                'message' => "Baris {$rowIndex}: {$views} penayangan dari pengguna tidak dikenal",
                'severity' => 'warning',
            ];
        }

        // Engagement > views (impossible)
        if ($engagements > $views && $views > 0) {
            $anomalies[] = [
                'type' => 'engagement_exceeds_views',
                'row' => $rowIndex,
                'message' => "Baris {$rowIndex}: Interaksi ({$engagements}) melebihi penayangan ({$views})",
                'severity' => 'error',
            ];
        }

        // URL already in database
        if (in_array($mapped['original_url'] ?? '', $existingUrls)) {
            $anomalies[] = [
                'type' => 'duplicate_url',
                'row' => $rowIndex,
                'message' => "Baris {$rowIndex}: URL sudah ada di database",
                'severity' => 'warning',
            ];
        }

        // Unknown platform
        $platform = strtolower(trim($mapped['platform'] ?? ''));
        if ($platform && !isset($this->platformAliases[$platform])) {
            $anomalies[] = [
                'type' => 'unknown_platform',
                'row' => $rowIndex,
                'message' => "Baris {$rowIndex}: Platform '{$mapped['platform']}' tidak dikenal",
                'severity' => 'info',
            ];
        }

        return $anomalies;
    }
}
