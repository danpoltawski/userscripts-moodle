// ==UserScript==
// @match         http://moodle.org/*
// @name          Shrink filemanager on moodle.org
// @description   Click to show the big filemanager. Use of thie userscript entitles Dan to 1 beer from you.
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @version       0.1
// ==/UserScript==


var fileareas = document.querySelectorAll("div.filemanager");

if (!fileareas || fileareas.length != 1) {
    return;
}

var filemanagers = fileareas[0].querySelectorAll("div.filemanager-container");
if (!filemanagers || filemanagers.length != 1) {
    return;
}

filemanagers[0].style.display = 'none';
fileareas[0].addEventListener('click',  function () { filemanagers[0].style.display = 'block'; });
