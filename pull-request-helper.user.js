// ==UserScript==
// @match         http://tracker.moodle.org/browse/*
// @match         https://tracker.moodle.org/browse/*
// @name          Pull Request Helper
// @description   Makes copy and paste easier for Moodle integrators
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @downloadURL   https://github.com/danpoltawski/userscripts-moodle/raw/master/pull-request-helper.user.js
// @version       0.6
// ==/UserScript==

(function() {
    var GITREPO = document.getElementById('customfield_10100-val');
    if (!GITREPO) {
        return;
    }

    // Function to retrieve the innerText of a DOM element.
    // Improves compatibility with Firefox which does not always define innerText.
    var getInnerText = function(el) {
        var text = '';
        if (el.innerText) {
            text = el.innerText;
        } else if (el.textContent) {
            text = el.textContent;
        }
        return text.trim();
    };

    var MASTER = document.getElementById('customfield_10111-val');
    var MOODLE_24_STABLE = document.getElementById('customfield_11110-val');
    var MOODLE_23_STABLE = document.getElementById('customfield_11016-val');
    var MOODLE_22_STABLE = document.getElementById('customfield_10711-val');
    var MOODLE_21_STABLE = document.getElementById('customfield_10311-val');
    var MOODLE_20_STABLE = document.getElementById('customfield_10113-val');
    var MOODLE_19_STABLE = document.getElementById('customfield_10116-val');

    var parent = document.getElementById('customfieldmodule');

    var s= '<p>Integrators Cheat Sheet:</p><pre>';

    if (MASTER) {
        s+= "git checkout master\n";
        s+= 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MASTER) + "\n\n";
    }

    if (MOODLE_24_STABLE) {
        s+= "git checkout MOODLE_24_STABLE\n";
        s+= 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_24_STABLE) + "\n\n";
    }

    if (MOODLE_23_STABLE) {
        s+= "git checkout MOODLE_23_STABLE\n";
        s+= 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_23_STABLE) + "\n\n";
    }

    if (MOODLE_22_STABLE) {
        s+= "git checkout MOODLE_22_STABLE\n";
        s+= 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_22_STABLE) + "\n\n";
    }

    if (MOODLE_21_STABLE) {
        s+= "git checkout MOODLE_21_STABLE\n";
        s+= 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_21_STABLE) + "\n\n";
    }

    if (MOODLE_20_STABLE) {
        s+= "git checkout MOODLE_20_STABLE\n";
        s+= 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_20_STABLE) + "\n\n";
    }

    if (MOODLE_19_STABLE) {
        s+= "git checkout MOODLE_19_STABLE\n";
        s+= 'git pull ' + getInnerText(GITREPO) + ' ' + getInnerText(MOODLE_19_STABLE) + "\n\n";
    }

    // prepare div
    var integratorDiv = document.createElement('div');
    integratorDiv.innerHTML = s;
    integratorDiv.setAttribute('style', 'border-top: 1px solid #DDD;');
    parent.insertBefore(integratorDiv, document.getElementById('tabCellPane1'));
})();
