<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Integration;

/**
 * Puts the main query on a single post, because the region prints only
 * on a singular view.
 */
function goToSingular(): int
{
    $postId = (int) wp_insert_post([
        'post_title' => 'The single post',
        'post_status' => 'publish',
    ]);

    $GLOBALS['wp_query'] = new \WP_Query(['p' => $postId]);
    $GLOBALS['wp_the_query'] = $GLOBALS['wp_query'];

    return $postId;
}

beforeEach(function (): void {
    goToSingular();
});

it('prints the dialog once in the footer', function (): void {
    ob_start();
    do_action('wp_footer');
    $output = (string) ob_get_clean();

    expect(substr_count($output, 'class="rinkukado"'))->toBe(1)
        ->and($output)->toContain('data-wp-interactive="rinkukado"')
        ->and($output)->toContain('role="dialog"')
        ->and($output)->toContain('data-wp-init="callbacks.init"');
});

it('seeds no nonce for an anonymous visitor', function (): void {
    wp_set_current_user(0);

    ob_start();
    do_action('wp_footer');
    ob_get_clean();

    $config = wp_interactivity_config('rinkukado');

    expect($config['nonce'])->toBe('')
        ->and($config['sheetQuery'])->toBe('(pointer: coarse)')
        ->and($config['hoverQuery'])
            ->toBe('(hover: hover) and (pointer: fine) and (min-width: 782px)')
        ->and($config['rootSelector'])->toBe('main')
        ->and($config['containerSelector'])->toBe('p');
});

it('keeps the configuration out of the state', function (): void {
    ob_start();
    do_action('wp_footer');
    ob_get_clean();

    $state = wp_interactivity_state('rinkukado');

    expect($state)->not->toHaveKeys(['endpoint', 'nonce', 'sheetQuery', 'hoverQuery'])
        ->and($state['isOpen'])->toBeFalse();
});

it('seeds a nonce for a logged in user', function (): void {
    $user = wp_insert_user([
        'user_login' => 'rinkukado-editor',
        'user_pass' => 'rinkukado-editor',
        'role' => 'editor',
    ]);
    wp_set_current_user($user);

    ob_start();
    do_action('wp_footer');
    ob_get_clean();

    expect(wp_interactivity_config('rinkukado')['nonce'])->not->toBe('');

    wp_set_current_user(0);
});

it('prints nothing outside of a singular view', function (): void {
    $GLOBALS['wp_query'] = new \WP_Query(['post_type' => 'post']);
    $GLOBALS['wp_the_query'] = $GLOBALS['wp_query'];

    ob_start();
    do_action('wp_footer');
    $output = (string) ob_get_clean();

    expect($output)->not->toContain('class="rinkukado"');
});

it('registers the script module and the style', function (): void {
    expect(wp_style_is('rinkukado-preview', 'registered'))->toBeTrue();
});
