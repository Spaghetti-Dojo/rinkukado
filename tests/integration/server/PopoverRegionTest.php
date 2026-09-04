<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Integration;

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

    $state = wp_interactivity_state('rinkukado');

    expect($state['nonce'])->toBe('')
        ->and($state['sheetQuery'])->toBe('(pointer: coarse), (max-width: 781px)')
        ->and($state['rootSelector'])->toBe('main')
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

    expect(wp_interactivity_state('rinkukado')['nonce'])->not->toBe('');
});

it('registers the script module and the style', function (): void {
    expect(wp_style_is('rinkukado-preview', 'registered'))->toBeTrue();
});
