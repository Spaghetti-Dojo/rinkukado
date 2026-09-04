<?php

declare(strict_types=1);

/**
 * Plugin Name: Rinkukado fixtures
 * Description: The content that the browser tests need.
 */

/**
 * The tests ask for /rinkukado-links/, so the site needs pretty permalinks.
 * A fresh wp-env site starts with the plain structure. Set the structure once,
 * and flush the rewrite rules once, on the first request after the install.
 */
add_action('init', static function (): void {
    $structure = '/%postname%/';

    if (get_option('permalink_structure') === $structure) {
        return;
    }

    global $wp_rewrite;

    $wp_rewrite->set_permalink_structure($structure);
    $wp_rewrite->flush_rules(true);
}, 5);

add_action('init', static function (): void {
    if (get_page_by_path('rinkukado-links', OBJECT, 'page') !== null) {
        return;
    }

    $withThumbnail = wp_insert_post([
        'post_type' => 'post',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-with-thumbnail',
        'post_title' => 'A post with a thumbnail',
        'post_excerpt' => 'The excerpt of the post that holds a thumbnail.',
    ]);

    $withoutThumbnail = wp_insert_post([
        'post_type' => 'post',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-without-thumbnail',
        'post_title' => 'A post without a thumbnail',
        'post_excerpt' => 'The excerpt of the post that holds no thumbnail.',
    ]);

    $draft = wp_insert_post([
        'post_type' => 'post',
        'post_status' => 'draft',
        'post_name' => 'rinkukado-draft',
        'post_title' => 'A draft',
    ]);

    // The image must sit in the uploads directory, or the browser gets a 404
    // for the source of the thumbnail.
    $uploads = wp_upload_dir();
    $file = $uploads['basedir'] . '/thumbnail.png';

    copy(__DIR__ . '/thumbnail.png', $file);

    $attachment = wp_insert_attachment([
        'post_mime_type' => 'image/png',
        'post_title' => 'The thumbnail',
        'post_status' => 'inherit',
    ], $file);

    wp_update_attachment_metadata($attachment, [
        'width' => 320,
        'height' => 240,
        'file' => 'thumbnail.png',
        'sizes' => [],
    ]);

    set_post_thumbnail($withThumbnail, $attachment);

    $category = wp_insert_term('Rinkukado news', 'category');
    $categoryLink = is_array($category)
        ? get_category_link((int) $category['term_id'])
        : '';

    $content = sprintf(
        '<p>'
        . '<a id="link-thumb" href="%1$s">With thumbnail</a> '
        . '<a id="link-plain" href="%2$s">Without thumbnail</a> '
        . '<a id="link-draft" href="%3$s">Draft</a> '
        . '<a id="link-category" href="%4$s">Category</a> '
        . '<a id="link-external" href="https://example.org/">External</a> '
        . '<a id="link-denied" class="no-rinkukado" href="%2$s">Denied</a>'
        . '</p>'
        // `wp_kses` drops `block-size`, so the spacer needs `height` to survive.
        . '<div style="height: 200vh"></div>'
        . '<p><a id="link-bottom" href="%2$s">Near the bottom</a></p>',
        get_permalink($withThumbnail),
        get_permalink($withoutThumbnail),
        get_permalink($draft),
        $categoryLink
    );

    wp_insert_post([
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-links',
        'post_title' => 'Rinkukado links',
        'post_content' => $content,
    ]);
});
