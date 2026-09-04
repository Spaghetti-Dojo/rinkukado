<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests;

use Brain\Monkey;
use Brain\Monkey\Functions;

/*
 * The unit suite runs against Brain Monkey. It loads no WordPress bootstrap.
 *
 * The suite still requires three real WordPress class files: WP_Error,
 * WP_HTTP_Response and WP_REST_Response. Each file only declares a class.
 * A class declaration runs no code, so the load is safe. A test can then
 * build a real response object, for example `new WP_REST_Response(...)`.
 *
 * Integration tests run against a real WordPress. The bootstrap file
 * tests/bootstrap-integration.php installs it and activates this plugin, so
 * the integration suite needs no setup here.
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
