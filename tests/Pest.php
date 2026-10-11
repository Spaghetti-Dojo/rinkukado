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
 * Pest loads this file for both suites, before it loads the bootstrap of
 * either suite. WordPress declares these three classes with a plain
 * `require`, not a `require_once`, so a load of them here before WordPress
 * runs would break the second declaration. The three loads sit inside the
 * `beforeEach` hook below, which Pest calls only for a test under `unit`,
 * so the integration suite never runs them and WordPress declares each
 * class only once.
 *
 * Integration tests run against a real WordPress. The bootstrap file
 * tests/bootstrap-integration.php installs it and activates this plugin, so
 * the integration suite needs no setup here.
 */
uses()
    ->beforeEach(function (): void {
        class_exists(\WP_Error::class)
            || require_once __DIR__ . '/../vendor/wordpress/wordpress/wp-includes/class-wp-error.php';
        class_exists(\WP_HTTP_Response::class)
            || require_once __DIR__ . '/../vendor/wordpress/wordpress/wp-includes/class-wp-http-response.php';
        class_exists(\WP_REST_Response::class)
            || require_once __DIR__
                . '/../vendor/wordpress/wordpress/wp-includes/rest-api/class-wp-rest-response.php';

        Monkey\setUp();
        Functions\when('__')->returnArg(1);
    })
    ->afterEach(function (): void {
        Monkey\tearDown();
        \Mockery::close();
    })
    ->in('unit');
