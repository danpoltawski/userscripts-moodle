// ==UserScript==
// @name        MDK Tracker CiBoT Collapser
// @description Automatically collapse CiBoT comments in the tracker.
// @include     http://tracker.moodle.org/browse/*
// @include     https://tracker.moodle.org/browse/*
// @match       http://tracker.moodle.org/browse/*
// @match       https://tracker.moodle.org/browse/*
// @grant       none
// @author      Frédéric Massart - FMCorz.net
// @version     0.100
// ==/UserScript==

var mdkTrackerCibotCollapser = function() {

    jQuery('.activity-comment .action-details a[rel=cibot]')
        .parents('.activity-comment')
        .removeClass('expanded')
        .addClass('collapsed');

};

mdkTrackerCibotCollapser();
