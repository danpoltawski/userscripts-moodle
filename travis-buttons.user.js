// ==UserScript==
// @include       http://tracker.moodle.org/*
// @include       https://tracker.moodle.org/*
// @match         http://tracker.moodle.org/browse/*
// @match         https://tracker.moodle.org/browse/*
// @name          Travis to tracker
// @description   Adds travis buttons to Moodle tracker
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @downloadURL   https://github.com/danpoltawski/userscripts-moodle/raw/master/travis-buttons.user.js
// @version       0.3
// ==/UserScript==

(function() {
    var GITREPO = document.getElementById('customfield_10100-val');
    if (!GITREPO) {
        return;
    }



    // Escape HTML function.
    var escapeHTML = function(str) {
        return str.replace(/[&"<>]/g, function (m) {
            return escapeHTML.replacements[m];
        });
    };
    escapeHTML.replacements = { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };

    // Function to retrieve the innerText of a DOM element.
    // Improves compatibility with Firefox which does not always define innerText.
    var getInnerText = function(el) {
        var text = '';
        if (el.innerText) {
            text = el.innerText;
        } else if (el.textContent) {
            text = el.textContent;
        }
        return escapeHTML(text.trim());
    };


    var add_travis_button = function (username, el) {
        if (!el) {
            return;
        }
        var branchname = getInnerText(el);

        if (!branchname) {
            return;
        }

        var img = document.createElement('img');
        img.setAttribute('src', 'https://travis-ci.org/'+username+'/moodle.svg?branch='+branchname);
        img.setAttribute('style', 'height: 15px; padding-left: 10px;');

        // Crappy link for the moment..
        var link = document.createElement('a');
        link.setAttribute('href', 'https://travis-ci.org/'+username+'/moodle/branches');
        link.appendChild(img);
        el.parentNode.insertBefore(link, el.nextSibling);
    };

    var matches = getInnerText(GITREPO).match('github.com\/([^\/]+)\/moodle');
    var username = matches[1];

    var MASTER = document.getElementById('customfield_10111-val');
    var MOODLE_30_STABLE = document.getElementById('customfield_12911-val');


    add_travis_button(username, MASTER);
    add_travis_button(username, MOODLE_30_STABLE);

})();
