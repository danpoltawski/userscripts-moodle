// ==UserScript==
// @match         https://moodle.org/mod/forum/post.php*
// @name          Auto select markdown moodle.org
// @description   Automatically select markdown message format on moodle.org
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @version       0.2
// ==/UserScript==


var formatselector = document.getElementById('menumessageformat');

if (!formatselector) {
    return;
}

formatselector.value = 4; // Markdown!
