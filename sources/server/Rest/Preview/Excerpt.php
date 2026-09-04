<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

/**
 * Builds the text of the preview.
 *
 * The manual excerpt wins. Without one, the content becomes an excerpt the way
 * core builds it: no block, no shortcode, no tag, and a word limit.
 */
final readonly class Excerpt
{
    public static function new(int $length): self
    {
        return new self($length);
    }

    private function __construct(private int $length)
    {
    }

    public function forPost(\WP_Post $post): string
    {
        $manual = trim((string) $post->post_excerpt);

        if ($manual !== '') {
            return $this->clean($manual);
        }

        $content = $this->clean((string) $post->post_content);

        if ($content === '') {
            return '';
        }

        return wp_trim_words($content, $this->length, '…');
    }

    private function clean(string $text): string
    {
        $text = excerpt_remove_blocks($text);
        $text = strip_shortcodes($text);
        $text = wp_strip_all_tags($text);

        return trim(preg_replace('/\s+/u', ' ', $text) ?? '');
    }
}
