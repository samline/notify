<?php
// In the theme's functions.php; use one enqueue per asset, not one per block.
add_action('wp_enqueue_scripts', static function () {
    $base = get_stylesheet_directory_uri() . '/assets/';
    wp_enqueue_style('notify', $base . 'notify.css', [], '3.2.0');
    wp_enqueue_script('notify', $base . 'notify.global.js', [], '3.2.0', true);
    wp_enqueue_script('notify-hosts', $base . 'notify-hosts.js', ['notify'], '1.0.0', true);
});
?>
<!-- Block or template markup; the host script also handles DOM replacement. -->
<section data-notify-host>
  <button type="button" data-notify-save>Save changes</button>
</section>
