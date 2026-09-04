<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

/**
 * Builds the payload of a preview and keeps it in the object cache.
 *
 * @phpstan-type Thumbnail array{src: string, srcset: string, width: int, height: int, alt: string}
 * @phpstan-type Payload array{
 *     id: int,
 *     title: string,
 *     excerpt: string,
 *     permalink: string,
 *     thumbnail: Thumbnail|null
 * }
 */
final readonly class PreviewRepository
{
    public const CACHE_GROUP = 'rinkukado';
    private const IMAGE_SIZE = 'medium';

    public static function new(Excerpt $excerpt, int $excerptLength): self
    {
        return new self($excerpt, $excerptLength);
    }

    private function __construct(
        private Excerpt $excerpt,
        private int $excerptLength,
    ) {
    }

    public function init(): void
    {
        add_action('save_post', $this->flush(...));
        add_action('delete_post', $this->flush(...));
        add_action('clean_post_cache', $this->flush(...));
    }

    /**
     * @return Payload
     */
    public function forPost(\WP_Post $post): array
    {
        $payload = $this->cacheablePayload($post);

        // The title and the permalink run outside the cache: a filter of
        // either one that varies per visitor must never freeze on the
        // first visitor who built the cached entry.
        $payload['title'] = (string) get_the_title($post);
        $payload['permalink'] = (string) get_permalink($post);

        return $payload;
    }

    /**
     * @return Payload
     */
    private function cacheablePayload(\WP_Post $post): array
    {
        $key = $this->key((int) $post->ID);
        $cached = wp_cache_get($key, self::CACHE_GROUP);

        if (is_array($cached)) {
            /** @var Payload $cached */
            return $cached;
        }

        $payload = [
            'id' => (int) $post->ID,
            'title' => '',
            'excerpt' => $this->excerpt->forPost($post),
            'permalink' => '',
            'thumbnail' => $this->thumbnail($post),
        ];

        wp_cache_set($key, $payload, self::CACHE_GROUP);

        return $payload;
    }

    /**
     * @return Thumbnail|null
     */
    private function thumbnail(\WP_Post $post): ?array
    {
        if (!has_post_thumbnail($post)) {
            return null;
        }

        $attachmentId = (int) get_post_thumbnail_id($post);
        $image = wp_get_attachment_image_src($attachmentId, self::IMAGE_SIZE);

        if (!is_array($image) || !is_string($image[0] ?? null)) {
            return null;
        }

        $srcset = wp_get_attachment_image_srcset($attachmentId, self::IMAGE_SIZE);
        $alt = get_post_meta($attachmentId, '_wp_attachment_image_alt', true);

        return [
            'src' => (string) $image[0],
            'srcset' => is_string($srcset) ? $srcset : '',
            'width' => (int) ($image[1] ?? 0),
            'height' => (int) ($image[2] ?? 0),
            'alt' => is_string($alt) ? $alt : '',
        ];
    }

    /**
     * Flushes the payload of the post that changed. An attachment carries
     * no payload of its own, but a change of it, such as a replaced file
     * or an edited alt text, must still flush the payload of the post
     * that uses it as a thumbnail: the attachment id never matches
     * `key()`, so nothing would clear that payload otherwise.
     */
    private function flush(int $postId): void
    {
        wp_cache_delete($this->key($postId), self::CACHE_GROUP);

        $parentId = $this->thumbnailParentId($postId);

        if ($parentId !== null) {
            wp_cache_delete($this->key($parentId), self::CACHE_GROUP);
        }
    }

    private function thumbnailParentId(int $postId): ?int
    {
        $post = get_post($postId);

        if ($post === null || $post->post_type !== 'attachment') {
            return null;
        }

        $parentId = (int) $post->post_parent;

        return $parentId > 0 ? $parentId : null;
    }

    private function key(int $postId): string
    {
        return "preview:{$postId}:{$this->excerptLength}";
    }
}
