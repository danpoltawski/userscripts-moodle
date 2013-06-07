// ==UserScript==
// @match         http://tracker.moodle.org/browse/*
// @match         https://tracker.moodle.org/browse/*
// @name          Pull Request Helper
// @description   Makes copy and paste easier for Moodle integrators
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @downloadURL   https://github.com/danpoltawski/userscripts-moodle/raw/master/pull-request-helper.user.js
// @version       0.8
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

    var MASTER = document.getElementById('customfield_10111-val');
    var MOODLE_25_STABLE = document.getElementById('customfield_11410-val');
    var MOODLE_24_STABLE = document.getElementById('customfield_11110-val');
    var MOODLE_23_STABLE = document.getElementById('customfield_11016-val');
    var MOODLE_22_STABLE = document.getElementById('customfield_10711-val');
    var MOODLE_21_STABLE = document.getElementById('customfield_10311-val');
    var MOODLE_20_STABLE = document.getElementById('customfield_10113-val');
    var MOODLE_19_STABLE = document.getElementById('customfield_10116-val');

    var template =
            '<li id="userscript_integrator_cs" class="item">' +
                '<div class="wrap">' +
                    '<strong class="name" title="Integrators Cheat Sheet">Integrators Cheat Sheet:</strong>' +
                    '<div id="userscript_integrator_cs-val" class="value type-textarea">' +
                        '<pre style="overflow: auto;">%cheatsheet%</pre>' +
                    '</div>' +
                '</div>' +
            '</li>';

    var cs = '';

    if (MASTER) {
        cs += "git checkout master\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MASTER) + "\n\n";
    }

    if (MOODLE_25_STABLE) {
        cs += "git checkout MOODLE_25_STABLE\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_25_STABLE) + "\n\n";
    }

    if (MOODLE_24_STABLE) {
        cs += "git checkout MOODLE_24_STABLE\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_24_STABLE) + "\n\n";
    }

    if (MOODLE_23_STABLE) {
        cs += "git checkout MOODLE_23_STABLE\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_23_STABLE) + "\n\n";
    }

    if (MOODLE_22_STABLE) {
        cs += "git checkout MOODLE_22_STABLE\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_22_STABLE) + "\n\n";
    }

    if (MOODLE_21_STABLE) {
        cs += "git checkout MOODLE_21_STABLE\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_21_STABLE) + "\n\n";
    }

    if (MOODLE_20_STABLE) {
        cs += "git checkout MOODLE_20_STABLE\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_20_STABLE) + "\n\n";
    }

    if (MOODLE_19_STABLE) {
        cs += "git checkout MOODLE_19_STABLE\n";
        cs += 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_19_STABLE) + "\n\n";
    }

    var output = template.replace('%cheatsheet%', cs.trim());
    var ul = document.getElementById('tabCellPane1');

    if (ul) {
        ul.innerHTML = output + ul.innerHTML;
    }

})();
