<?php

/*
oko map; module waarin het allemaal gebeurt...
 */

//ini_set('display_errors', 'Off');
ini_set('error_reporting', E_ALL);
//define('WP_DEBUG', false);
//define('WP_DEBUG_DISPLAY', false);

function ts($test)
{ // for debug/development only
    echo '<pre>';
    echo print_r($test, true);
    echo '</pre>';
}

class okomap_visual
{
    public function __construct()
    {
        $this->plugindir = plugin_dir_url(__FILE__);
        //echo '</br>in map_visual construct';
    }

    public function poke_wpdb($sql, $methode)
    {
        global $wpdb;
        //ts($sql);
        $zql = $wpdb->prepare($sql, "");
        switch ($methode) {
            case 'get_results':
                $aa = $wpdb->get_results($zql, ARRAY_A);
                break;
            case 'get_row':
                $aa = $wpdb->get_row($zql, ARRAY_A);
                break;
            case 'query':
                $aa = $wpdb->query($zql);
                break;
        }
        return $aa;
    }

    public function get_interface()
    {
        //echo '</br>in map_visual get_interface';
        $output = $this->get_style();
        $output .= $this->get_biebs();

        $output .= "<div class = 'parent'>
                        <div id='oko-buttons' class='button-group'></div>
                        <div id='gemscan-map'></div>
                    </div>
                    <footer>";

        $output .= "<script src='" . $this->plugindir . "js/okomap.js" . "' type='text/javascript' ></script>";

        $output .= "</footer>";
        //echo 'hallo';
        echo $output;
    }

    public function get_biebs()
    {
        $out = "<script src='https://code.highcharts.com/maps/highmaps.js'></script>";
        $out .= "<script src='https://code.highcharts.com/maps/modules/exporting.js'></script>";
        return $out;
    }
    public function get_style()
    {
        wp_enqueue_style('okomap', $this->plugindir . 'css/style.css');
    }
}
