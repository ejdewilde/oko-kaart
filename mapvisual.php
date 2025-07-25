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
    }
    public function poke_wpdb($sql, $methode)
    {
        global $wpdb;
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
        $output = $this->get_style();
        $output .= $this->get_biebs();
        $output .= ' <div id="oko-container">
                        <div id="oko-map"></div>
<div id="oko-sidebar">

  <div id="oko-buttons" class="button-group"></div>
  <div id="oko-info" class="info-box">Selecteer een gemeente op de kaart voor meer informatie…</div>
</div>


                    </div>

                    <footer>';
        wp_enqueue_script('oko-map', plugins_url('js/okomap.js', __FILE__), [], '1.0.0', true);
        //$output .= "<script src='" . $this->plugindir . "js/okomap.js" . "' type='text/javascript' ></script>";
        $output .= "</footer>";
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
