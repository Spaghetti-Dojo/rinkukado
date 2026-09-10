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


/**
 * The version of the content below. Raise it after every change of the
 * fixtures, so an existing site takes the new content on the next request.
 */
const RINKUKADO_FIXTURES_VERSION = '2';

/**
 * Inserts the post, or updates it when a post of the same slug and the same
 * type already exists. A site that already holds the fixtures then takes the
 * new content instead of keeping the old one.
 *
 * @param array<string, mixed> $data
 */
function rinkukado_fixture_post(array $data): int
{
    $existing = get_page_by_path(
        (string) $data['post_name'],
        OBJECT,
        (string) $data['post_type']
    );

    if ($existing instanceof WP_Post) {
        $data['ID'] = $existing->ID;
    }

    return (int) wp_insert_post($data);
}

add_action('init', static function (): void {
    if (get_option('rinkukado_fixtures_version') === RINKUKADO_FIXTURES_VERSION) {
        return;
    }

    $withThumbnail = rinkukado_fixture_post([
        'post_type' => 'post',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-with-thumbnail',
        'post_title' => 'A post with a thumbnail',
        'post_excerpt' => 'The excerpt of the post that holds a thumbnail.',
    ]);

    $withoutThumbnail = rinkukado_fixture_post([
        'post_type' => 'post',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-without-thumbnail',
        'post_title' => 'A post without a thumbnail',
        'post_excerpt' => 'The excerpt of the post that holds no thumbnail.',
    ]);

    $draft = rinkukado_fixture_post([
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

    $existing = get_page_by_path('rinkukado-thumbnail', OBJECT, 'attachment');
    $attachment = (int) wp_insert_attachment([
        'ID' => $existing instanceof WP_Post ? $existing->ID : 0,
        'post_mime_type' => 'image/png',
        'post_name' => 'rinkukado-thumbnail',
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

    $category = term_exists('Rinkukado news', 'category')
        ?: wp_insert_term('Rinkukado news', 'category');
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
        // A link of the metadata, outside of a paragraph. The popover must
        // leave it alone.
        . '<div class="wp-block-post-date">'
        . '<a id="link-outside" href="%2$s">Outside of a paragraph</a>'
        . '</div>'
        // `wp_kses` drops `block-size`, so the spacer needs `height` to survive.
        . '<div style="height: 200vh"></div>'
        . '<p><a id="link-bottom" href="%2$s">Near the bottom</a></p>',
        get_permalink($withThumbnail),
        get_permalink($withoutThumbnail),
        get_permalink($draft),
        $categoryLink
    );

    rinkukado_fixture_post([
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-links',
        'post_title' => 'Rinkukado links',
        'post_content' => $content,
    ]);

    update_option('rinkukado_fixtures_version', RINKUKADO_FIXTURES_VERSION);
});
