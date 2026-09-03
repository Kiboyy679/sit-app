<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RewriteAssetUrls
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Force HTTPS on redirect Location header (Vercel proxy sets X-Forwarded-Proto)
        if ($response->headers->has('Location')) {
            $location = $response->headers->get('Location');
            if (str_starts_with($location, 'http://')) {
                $response->headers->set('Location', 'https://' . substr($location, 7));
            }
        }

        $contentType = $response->headers->get('Content-Type', '');
        if (!str_contains($contentType, 'text/html')) {
            return $response;
        }

        $content = $response->getContent();
        if (!$content) {
            return $response;
        }

        // Replace all absolute URLs with current domain to relative paths
        $host = $request->getHost();
        $schemes = ['https', 'http'];
        foreach ($schemes as $scheme) {
            $content = str_replace(
                $scheme . '://' . $host . '/',
                '/',
                $content
            );
        }

        // Fallback: rewrite any localhost URLs
        $content = str_replace(
            ['http://localhost:8080/', 'http://127.0.0.1:8080/'],
            '/',
            $content
        );

        $response->setContent($content);
        return $response;
    }
}