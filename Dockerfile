# Base image
FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    nodejs \
    npm \
    mysql-client \
    postgresql-client \
    libpq-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    xml \
    opcache \
    zip

# Get Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first (for caching)
COPY composer.json composer.lock ./

# Install PHP dependencies (skip scripts that need full app)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install Node dependencies
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Build frontend assets
RUN npm run build

# Generate app key if not exists
RUN php artisan key:generate --force 2>/dev/null || true

# Run post-autoload-dump scripts manually now that full app is copied
RUN php artisan package:discover --ansi

# Cache config
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 8080

# Start supervisor (nginx + php-fpm)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]