<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Integration;

function get(string $url): \WP_REST_Response
{
    $request = new \WP_REST_Request('GET', '/rinkukado/v1/preview');
    $request->set_param('url', $url);

    return rest_get_server()->dispatch($request);
}

it('registers the route', function (): void {
    expect(rest_get_server()->get_routes())
        ->toHaveKey('/rinkukado/v1/preview');
});

it('returns the payload of a published post', function (): void {
    $postId = wp_insert_post([
        'post_title' => 'The title',
        'post_excerpt' => 'The excerpt',
        'post_status' => 'publish',
    ]);

    $response = get(get_permalink($postId));

    expect($response->get_status())->toBe(200)
        ->and($response->get_data()['id'])->toBe($postId)
        ->and($response->get_data()['title'])->toBe('The title')
        ->and($response->get_data()['excerpt'])->toBe('The excerpt')
        ->and($response->get_data()['thumbnail'])->toBeNull()
        ->and($response->get_headers()['Cache-Control'])->toBe('public, max-age=300');

    wp_delete_post($postId, true);
});

it('refuses a draft', function (): void {
    $postId = wp_insert_post(['post_title' => 'Draft', 'post_status' => 'draft']);

    expect(get(get_permalink($postId))->get_status())->toBe(404);

    wp_delete_post($postId, true);
});

it('refuses a post that holds a password', function (): void {
    $postId = wp_insert_post([
        'post_title' => 'Secret',
        'post_status' => 'publish',
        'post_password' => 'secret',
    ]);

    expect(get(get_permalink($postId))->get_status())->toBe(404);

    wp_delete_post($postId, true);
});

it('refuses a category', function (): void {
    $term = wp_insert_term('news', 'category');

    expect($term)->toBeArray();

    $termId = (int) $term['term_id'];

    expect(get(get_category_link($termId))->get_status())->toBe(404);

    wp_delete_term($termId, 'category');
});

it('refuses a URL of another host', function (): void {
    expect(get('https://other.test/post/')->get_status())->toBe(404);
});

it('runs no query for the second request of the same post', function (): void {
    global $wpdb;

    $postId = wp_insert_post(['post_title' => 'Cached', 'post_status' => 'publish']);
    $url = get_permalink($postId);

    get($url);
    $before = $wpdb->num_queries;
    get($url);

    expect($wpdb->num_queries - $before)->toBeLessThan(3);

    wp_delete_post($postId, true);
});

it('clears the cached payload when the post changes', function (): void {
    $postId = wp_insert_post([
        'post_status' => 'publish',
        'post_title' => 'First title',
    ]);
    $url = get_permalink($postId);

    get($url);

    wp_update_post(['ID' => $postId, 'post_title' => 'Second title']);

    expect(get($url)->get_data()['title'])->toBe('Second title');

    wp_delete_post($postId, true);
});

it('never caches the response of a logged in user', function (): void {
    function_exists('wp_delete_user')
        || require_once ABSPATH . 'wp-admin/includes/user.php';

    $user = wp_insert_user([
        'user_login' => 'rinkukado-preview-editor',
        'user_pass' => 'rinkukado-preview-editor',
        'role' => 'editor',
    ]);
    wp_set_current_user($user);

    $postId = wp_insert_post(['post_title' => 'Editor view', 'post_status' => 'publish']);

    expect(get(get_permalink($postId))->get_headers()['Cache-Control'])->toBe('no-store');

    wp_delete_post($postId, true);
    wp_set_current_user(0);
    wp_delete_user((int) $user);
});

it('refuses an attachment', function (): void {
    $postId = wp_insert_attachment([
        'post_title' => 'An image',
        'post_status' => 'inherit',
        'post_mime_type' => 'image/jpeg',
    ]);

    expect(get(wp_get_attachment_url($postId))->get_status())->toBe(404);

    wp_delete_attachment($postId, true);
});
