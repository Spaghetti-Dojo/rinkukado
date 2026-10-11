<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Preview\Rest;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Preview\Rest\Excerpt;

function post(string $excerpt, string $content): \WP_Post
{
    $post = \Mockery::mock(\WP_Post::class);
    $post->post_excerpt = $excerpt;
    $post->post_content = $content;

    return $post;
}

beforeEach(function (): void {
    Functions\when('excerpt_remove_blocks')->returnArg();
    Functions\when('strip_shortcodes')->returnArg();
    Functions\when('wp_strip_all_tags')->alias(
        static fn (string $text): string => strip_tags($text)
    );
    Functions\when('wp_trim_words')->alias(
        static function (string $text, int $words, string $more): string {
            $parts = preg_split('/\s+/', trim($text)) ?: [];

            return count($parts) <= $words
                ? implode(' ', $parts)
                : implode(' ', array_slice($parts, 0, $words)) . $more;
        }
    );
});

it('keeps the manual excerpt', function (): void {
    $excerpt = Excerpt::new(3)->forPost(post('The manual excerpt of the post', ''));

    expect($excerpt)->toBe('The manual excerpt of the post');
});

it('builds the excerpt from the content when there is none', function (): void {
    $excerpt = Excerpt::new(3)->forPost(post('', '<p>one two three four</p>'));

    expect($excerpt)->toBe('one two three…');
});

it('removes the tags of a manual excerpt', function (): void {
    expect(Excerpt::new(30)->forPost(post('<em>text</em>', '')))->toBe('text');
});

it('returns an empty string when the post holds no text', function (): void {
    expect(Excerpt::new(30)->forPost(post('', '')))->toBe('');
});

it('returns an empty excerpt when the_content hides the body', function (): void {
    Functions\when('apply_filters')->justReturn('');

    expect(Excerpt::new(30)->forPost(post('', '<p>one two three</p>')))->toBe('');
});

it('leaves the manual excerpt alone, without the_content', function (): void {
    Functions\expect('apply_filters')->never();

    expect(Excerpt::new(30)->forPost(post('The manual excerpt', 'ignored')))
        ->toBe('The manual excerpt');
});
