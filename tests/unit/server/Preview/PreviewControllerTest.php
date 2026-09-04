<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Preview;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Rest;
use SpaghettiDojo\Rinkukado\Rest\Preview\Excerpt;
use SpaghettiDojo\Rinkukado\Rest\Preview\PreviewController;
use SpaghettiDojo\Rinkukado\Rest\Preview\PreviewRepository;

/*
 * PreviewRepository is a final readonly class. Mockery cannot generate a
 * mock that satisfies its type hint, so these tests use a real instance.
 * A rejection that happens before the repository is reached needs no stub
 * of wp_cache_get, because the code never calls forPost(). A test that
 * needs a canned payload stubs wp_cache_get to return it, which makes
 * forPost() return it without a build.
 */
function request(string $url): \WP_REST_Request
{
    $request = \Mockery::mock(\WP_REST_Request::class);
    $request->allows('get_param')->with('url')->andReturn($url);

    return $request;
}

function config(): Config
{
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed => $value
    );
    Functions\when('get_post_types')->justReturn(['post' => 'post', 'page' => 'page']);

    return Config::new();
}

function repository(): PreviewRepository
{
    return PreviewRepository::new(Excerpt::new(30), 30);
}

beforeEach(function (): void {
    Functions\when('home_url')->justReturn('https://example.com');
    Functions\when('wp_parse_url')->alias(
        static fn (string $url, int $component = -1): mixed => parse_url($url, $component)
    );
    Functions\when('url_to_postid')->justReturn(0);
    Functions\when('__')->returnArg();
    Functions\when('get_the_title')->justReturn('The title');
    Functions\when('get_permalink')->justReturn('https://example.com/post/');
});

it('rejects a URL of another host', function (): void {
    $error = PreviewController::new(config(), repository(), Rest\ErrorFactory::new())(
        request('https://other.test/post/')
    );

    expect($error)->toBeInstanceOf(\WP_Error::class)
        ->and($error->get_error_code())->toBe('not_found')
        ->and($error->get_error_data()['status'])->toBe(404);
});

it('rejects a URL that resolves to no post', function (): void {
    $error = PreviewController::new(config(), repository(), Rest\ErrorFactory::new())(
        request('https://example.com/category/news/')
    );

    expect($error->get_error_code())->toBe('not_found');
});

it('rejects a post that is not published', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'draft';
    $post->post_password = '';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);

    $error = PreviewController::new(
        config(),
        repository(),
        Rest\ErrorFactory::new()
    )(request('https://example.com/draft/'));

    expect($error->get_error_code())->toBe('not_found');
});

it('rejects a post that holds a password', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = 'secret';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);

    $error = PreviewController::new(
        config(),
        repository(),
        Rest\ErrorFactory::new()
    )(request('https://example.com/secret/'));

    expect($error->get_error_code())->toBe('not_found');
});

it('rejects a post type that is not allowed', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = '';
    $post->post_type = 'attachment';

    Functions\when('get_post')->justReturn($post);

    $error = PreviewController::new(
        config(),
        repository(),
        Rest\ErrorFactory::new()
    )(request('https://example.com/image/'));

    expect($error->get_error_code())->toBe('not_found');
});

it('returns the payload of a published post', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = '';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);

    $payload = [
        'id' => 7,
        'title' => 'The title',
        'excerpt' => 'The excerpt',
        'permalink' => 'https://example.com/post/',
        'thumbnail' => null,
    ];

    Functions\when('wp_cache_get')->justReturn($payload);

    $response = PreviewController::new(config(), repository(), Rest\ErrorFactory::new())(
        request('https://example.com/post/')
    );

    expect($response)->toBeInstanceOf(\WP_REST_Response::class)
        ->and($response->get_status())->toBe(200)
        ->and($response->get_data())->toBe($payload);
});

it('lets a filter change the payload', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = '';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);
    Functions\when('wp_cache_get')->justReturn([
        'id' => 7,
        'title' => 'The title',
        'excerpt' => '',
        'permalink' => '',
        'thumbnail' => null,
    ]);
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.payload'
                ? ['id' => 7, 'title' => 'Filtered', 'excerpt' => '', 'permalink' => '', 'thumbnail' => null]
                : $value
    );
    Functions\when('get_post_types')->justReturn(['post' => 'post', 'page' => 'page']);

    $response = PreviewController::new(
        Config::new(),
        repository(),
        Rest\ErrorFactory::new()
    )(request('https://example.com/post/'));

    expect($response->get_data()['title'])->toBe('Filtered');
});
