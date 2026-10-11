<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Preview\Rest;

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
            return $this->clean($manual, false);
        }

        $content = $this->clean((string) $post->post_content, true);

        if ($content === '') {
            return '';
        }

        return wp_trim_words($content, $this->length, '…');
    }

    /**
     * Cleans the text the way core builds an excerpt: no block, no
     * shortcode, then the `the_content` filter, then no tag. A plugin that
     * hides the body of a post through that filter must hide it here too,
     * so `$filterContent` runs it only for the content fallback, never for
     * a manual excerpt.
     */
    private function clean(string $text, bool $filterContent): string
    {
        $text = excerpt_remove_blocks($text);
        $text = strip_shortcodes($text);

        if ($filterContent) {
            $filtered = apply_filters('the_content', $text);
            $text = is_string($filtered) ? $filtered : '';
        }

        $text = wp_strip_all_tags($text);

        return trim(preg_replace('/\s+/u', ' ', $text) ?? '');
    }
}
