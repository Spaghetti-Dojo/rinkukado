<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Preview;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Rest\Preview\Excerpt;
use SpaghettiDojo\Rinkukado\Rest\Preview\PreviewRepository;

/*
 * Excerpt is a final readonly class. Mockery cannot generate a mock that
 * satisfies its type hint, so these tests use a real Excerpt instance and
 * stub the WordPress functions it calls.
 */
function thumbnailPost(int $id): \WP_Post
{
    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = $id;
    $post->post_title = 'The title';
    $post->post_excerpt = 'The excerpt';
    $post->post_content = '';

    return $post;
}

beforeEach(function (): void {
    Functions\when('wp_cache_get')->justReturn(false);
    Functions\when('wp_cache_set')->justReturn(true);
    Functions\when('get_permalink')->justReturn('https://example.com/post/');
    Functions\when('get_the_title')->justReturn('The title');
    Functions\when('has_post_thumbnail')->justReturn(false);
});

it('builds the payload of a post without a thumbnail', function (): void {
    Functions\when('excerpt_remove_blocks')->returnArg();
    Functions\when('strip_shortcodes')->returnArg();
    Functions\when('wp_strip_all_tags')->alias(
        static fn (string $text): string => strip_tags($text)
    );

    $payload = PreviewRepository::new(Excerpt::new(30), 30)->forPost(thumbnailPost(7));

    expect($payload)->toBe([
        'id' => 7,
        'title' => 'The title',
        'excerpt' => 'The excerpt',
        'permalink' => 'https://example.com/post/',
        'thumbnail' => null,
    ]);
});

it('builds the payload of a post with a thumbnail', function (): void {
    Functions\when('excerpt_remove_blocks')->returnArg();
    Functions\when('strip_shortcodes')->returnArg();
    Functions\when('wp_strip_all_tags')->alias(
        static fn (string $text): string => strip_tags($text)
    );
    Functions\when('has_post_thumbnail')->justReturn(true);
    Functions\when('get_post_thumbnail_id')->justReturn(99);
    Functions\when('wp_get_attachment_image_src')->justReturn([
        'https://example.com/image.jpg', 320, 240, false,
    ]);
    Functions\when('wp_get_attachment_image_srcset')->justReturn('https://example.com/image.jpg 320w');
    Functions\when('get_post_meta')->justReturn('The alt text');

    $payload = PreviewRepository::new(Excerpt::new(30), 30)->forPost(thumbnailPost(7));

    expect($payload['thumbnail'])->toBe([
        'src' => 'https://example.com/image.jpg',
        'srcset' => 'https://example.com/image.jpg 320w',
        'width' => 320,
        'height' => 240,
        'alt' => 'The alt text',
    ]);
});

it('returns the cached excerpt and thumbnail without a second build', function (): void {
    /*
     * This test stubs no excerpt-cleaning function. If the cache miss path
     * ran again, Excerpt::forPost would call an undefined function and the
     * test would fail, so a green test also proves the second build never runs.
     */
    Functions\when('wp_cache_get')->justReturn([
        'id' => 7,
        'title' => '',
        'excerpt' => 'Cached excerpt',
        'permalink' => '',
        'thumbnail' => null,
    ]);

    $payload = PreviewRepository::new(Excerpt::new(30), 30)->forPost(thumbnailPost(7));

    expect($payload['excerpt'])->toBe('Cached excerpt');
});

it('computes the title and the permalink outside the cache', function (): void {
    /*
     * The cached entry carries no title and no permalink: a filter of
     * either one, such as one that varies per language, must run on
     * every visitor, not only on the one who built the cached entry.
     */
    Functions\when('wp_cache_get')->justReturn([
        'id' => 7,
        'title' => '',
        'excerpt' => '',
        'permalink' => '',
        'thumbnail' => null,
    ]);

    $payload = PreviewRepository::new(Excerpt::new(30), 30)->forPost(thumbnailPost(7));

    expect($payload['title'])->toBe('The title')
        ->and($payload['permalink'])->toBe('https://example.com/post/');
});

it('registers the hooks that clear the cache', function (): void {
    Functions\expect('add_action')->once()->with('save_post', \Mockery::type('callable'));
    Functions\expect('add_action')->once()->with('delete_post', \Mockery::type('callable'));
    Functions\expect('add_action')->once()->with('clean_post_cache', \Mockery::type('callable'));

    $result = PreviewRepository::new(Excerpt::new(30), 30)->init();

    expect($result)->toBeNull();
});

/**
 * Registers the repository and returns the `flush` callback that
 * `save_post` receives, so a test can trigger it directly.
 */
function flushCallback(): callable
{
    $captured = null;
    Functions\when('add_action')->alias(
        static function (string $hook, callable $callback) use (&$captured): void {
            if ($hook === 'save_post') {
                $captured = $callback;
            }
        }
    );

    PreviewRepository::new(Excerpt::new(30), 30)->init();

    return $captured;
}

it('flushes only the changed id when it is not an attachment', function (): void {
    Functions\when('get_post')->justReturn(null);
    Functions\expect('wp_cache_delete')->once()->with('preview:7:30', 'rinkukado');

    $result = flushCallback()(7);

    expect($result)->toBeNull();
});

it('also flushes the parent post when the changed id is its attachment', function (): void {
    $attachment = \Mockery::mock(\WP_Post::class);
    $attachment->post_type = 'attachment';
    $attachment->post_parent = 42;

    Functions\when('get_post')->justReturn($attachment);
    Functions\expect('wp_cache_delete')->once()->with('preview:99:30', 'rinkukado');
    Functions\expect('wp_cache_delete')->once()->with('preview:42:30', 'rinkukado');

    $result = flushCallback()(99);

    expect($result)->toBeNull();
});
