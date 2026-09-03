<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title inertia>{{ config('app.name', 'SIT-APP') }}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <script>
    // Set base URL for Ziggy & Inertia to use current browser origin
    // This ensures AJAX requests go to the correct domain (e.g. gray-jay.slim.show)
    // instead of localhost:8080 or https://login/
    window._baseOrigin = window.location.origin;
    window.Ziggy = window.Ziggy || {};
    window.Ziggy.url = window.location.origin;
  </script>
  @vite(['resources/js/app.jsx'])
</head>
<body class="font-sans antialiased">
  @inertia
</body>
</html>
