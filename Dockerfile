FROM php:8.4-cli

# Install system dependencies + PHP extensions (ALL at once)
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev libpq-dev libonig-dev libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
       pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd xml opcache zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files + artisan first (cache layer)
COPY composer.json composer.lock artisan ./

# Install PHP deps (--no-scripts to skip artisan package:discover before full app)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# Copy everything else
COPY . .

# Build frontend
RUN npm ci --legacy-peer-deps --ignore-scripts && npm run build

# Run post-install scripts
RUN php artisan package:discover --ansi

# Cache config/routes/views
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Set permissions
RUN mkdir -p storage/framework/{sessions,views,cache,testing} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
