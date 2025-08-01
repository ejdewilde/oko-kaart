<?php

/**
 * OKO  interactieve kaart voor Wordpress
 * @package      oko-map
 * @link         https://www.hansei.nl/plugins/okomap/
 * @author       Erik Jan de Wilde <ej@hansei.nl>
 * @copyright    2025 Erik Jan de Wilde
 * @license      GPL v2 or later
 * Plugin Name:  OKO interactieve kaart
 * Description:  Toont de Nederlandse gemeentekaart met informatie over gemeenten die meedoen aan OKO
 * Version:      1.0.4
 * Plugin URI:   https://www.hansei.nl/plugins
 * Author:       Erik Jan de Wilde, (c) 2025, HanSei
 * Text Domain:  oko-map
 * Domain Path:  /languages/
 * Network:      true
 * Requires PHP: 7
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * version 1.5: koppel-class toegevoegd, db credentials verwijderd, fixes...
 */

// first make sure this file is called as part of WP
ini_set('display_errors', 'On');
defined('ABSPATH') or die('Hej då');

add_action('plugins_loaded', 'oko_kaart_laad_updater');

function oko_kaart_laad_updater()
{
    $pad = plugin_dir_path(__FILE__) . 'plugin-update-checker/plugin-update-checker.php';

    if (file_exists($pad)) {
        require_once $pad;

        // Gebruik v5 factory
        if (class_exists('\YahnisElsts\PluginUpdateChecker\v5\PucFactory')) {
            $updateChecker = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
                'https://github.com/ejdewilde/oko-kaart/',
                __FILE__,
                'oko-kaart'
            );

            $updateChecker->setBranch('main');
            $updateChecker->getVcsApi()->enableReleaseAssets();
        } else {
            error_log('PucFactory class niet gevonden.');
        }
    } else {
        error_log('plugin-update-checker.php niet gevonden op: ' . $pad);
    }
}

function okomap_start($atts)
{

    include_once "mapvisual.php";
    $wat = new okomap_visual();
    $ta  = $wat->get_interface();
}

function okomap_register_shortcode()
{
    add_shortcode('okomap', 'okomap_start');
}

add_action('init', 'okomap_register_shortcode');
