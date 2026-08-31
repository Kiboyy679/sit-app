<?php
namespace App\Jobs;

use App\Models\UrlResolution;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class ResolveUrlJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 5;

    public function __construct(
        private string $shareUrl,
        private int $importRowId,
        private string $platform,
    ) {}

    public function handle(): void
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->withoutVerifying()
                ->get($this->shareUrl);

            $finalUrl = $response->effectiveUri() ?? $this->shareUrl;
            $statusCode = $response->status();

            UrlResolution::updateOrCreate(
                ['share_url' => substr($this->shareUrl, 0, 2048)],
                [
                    'resolved_url' => $finalUrl,
                    'platform' => $this->platform,
                    'status_code' => $statusCode,
                    'resolved_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            UrlResolution::updateOrCreate(
                ['share_url' => substr($this->shareUrl, 0, 2048)],
                [
                    'platform' => $this->platform,
                    'status_code' => 0,
                    'error' => $e->getMessage(),
                    'retry_count' => \DB::raw('retry_count + 1'),
                ]
            );
        }
    }
}
