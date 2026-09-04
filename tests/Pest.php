<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests;

use Brain\Monkey;
use Brain\Monkey\Functions;

/*
 * Unit tests run against Brain Monkey. No WordPress is loaded.
 *
 * Integration tests run against a real WordPress. The bootstrap file
 * tests/bootstrap-integration.php installs it and activates this plugin, so
 * the integration suite needs no setup here.
 *
 * WP_Error and WP_REST_Response have no side effect at load time, so the unit
 * suite requires their real class files instead of a fake. This keeps a test
 * like `new WP_REST_Response(...)` close to the real behavior of WordPress.
 */
require_once __DIR__ . '/../vendor/wordpress/wordpress/wp-includes/class-wp-error.php';
require_once __DIR__ . '/../vendor/wordpress/wordpress/wp-includes/class-wp-http-response.php';
require_once __DIR__ . '/../vendor/wordpress/wordpress/wp-includes/rest-api/class-wp-rest-response.php';

uses()
    ->beforeEach(function (): void {
        Monkey\setUp();
        Functions\when('__')->returnArg(1);
    })
    ->afterEach(function (): void {
        Monkey\tearDown();
        \Mockery::close();
    })
    ->in('unit');
