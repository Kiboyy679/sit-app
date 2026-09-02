<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RewriteAssetUrls
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $contentType = $response->headers->get('Content-Type', '');
        if (!str_contains($contentType, 'text/html')) {
            return $response;
        }

        $content = $response->getContent();
        if (!$content) {
            return $response;
        }

        // Rewrite only absolute localhost URLs in link/script href/src attributes
        // Do NOT rewrite Inertia data-page JSON (JS handles that via base URL)
        $content = str_replace(
            ['http://localhost:8080/', 'http://127.0.0.1:8080/'],
            '/',
            $content
        );

        $response->setContent($content);
        return $response;
    }
}
