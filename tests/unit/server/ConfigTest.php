<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Config;

beforeEach(function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed => $value
    );
    Functions\when('get_post_types')->justReturn(['post' => 'post', 'page' => 'page']);
});

it('returns the defaults', function (): void {
    $config = Config::new();

    expect($config->rootSelector())->toBe('main')
        ->and($config->containerSelector())->toBe('p')
        ->and($config->denyClass())->toBe('no-rinkukado')
        ->and($config->excerptLength())->toBe(30)
        ->and($config->timings())->toBe(['prefetch' => 80, 'open' => 300, 'close' => 200])
        ->and($config->postTypes())->toBe(['post', 'page']);
});

it('applies the filter of the root selector', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.root-selector' ? '.site-content' : $value
    );

    expect(Config::new()->rootSelector())->toBe('.site-content');
});

it('rejects an empty root selector', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.root-selector' ? '   ' : $value
    );

    expect(Config::new()->rootSelector())->toBe('main');
});

it('applies the filter of the container selector', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.container-selector' ? '.entry-content p' : $value
    );

    expect(Config::new()->containerSelector())->toBe('.entry-content p');
});

it('rejects an empty container selector', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.container-selector' ? '   ' : $value
    );

    expect(Config::new()->containerSelector())->toBe('p');
});

it('rejects a timing that is not a positive integer', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.timings'
                ? ['prefetch' => -1, 'open' => 'x', 'close' => 250]
                : $value
    );

    expect(Config::new()->timings())
        ->toBe(['prefetch' => 80, 'open' => 300, 'close' => 250]);
});

it('keeps only the post types that exist', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.post-types' ? ['post', 'book', 42] : $value
    );

    expect(Config::new()->postTypes())->toBe(['post']);
});

it('rejects an excerpt length below one', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.excerpt-length' ? 0 : $value
    );

    expect(Config::new()->excerptLength())->toBe(30);
});

it('applies the filter of the deny class', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.deny-class' ? 'skip-preview' : $value
    );

    expect(Config::new()->denyClass())->toBe('skip-preview');
});

it('rejects an empty deny class', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.deny-class' ? '   ' : $value
    );

    expect(Config::new()->denyClass())->toBe('no-rinkukado');
});

it('applies the filter of the excerpt length', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.excerpt-length' ? 55 : $value
    );

    expect(Config::new()->excerptLength())->toBe(55);
});

it('returns an empty array when all filtered types are invalid', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.post-types' ? ['book'] : $value
    );

    expect(Config::new()->postTypes())->toBe([]);
});

it('excludes attachment from the default post types', function (): void {
    Functions\when('get_post_types')->justReturn([
        'post' => 'post',
        'page' => 'page',
        'attachment' => 'attachment',
    ]);

    expect(Config::new()->postTypes())->toBe(['post', 'page']);
});

it('lets the filter add attachment back', function (): void {
    Functions\when('get_post_types')->justReturn([
        'post' => 'post',
        'page' => 'page',
        'attachment' => 'attachment',
    ]);
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.post-types'
                ? ['post', 'page', 'attachment']
                : $value
    );

    expect(Config::new()->postTypes())->toBe(['post', 'page', 'attachment']);
});
