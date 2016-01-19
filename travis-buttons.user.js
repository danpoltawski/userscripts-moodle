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
// @version       0.4
// ==/UserScript==

var add_travis = function() {
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
        link.setAttribute('id', '#travis-link-'+branchname);
        link.appendChild(img);
        el.parentNode.insertBefore(link, el.nextSibling);

        AJS.$.ajax({
            dataType: "json",
            url: 'https://api.travis-ci.org/repos/'+username+'/moodle/branches/'+branchname,
            headers: {
                Accept: 'application/vnd.travis-ci.2+json'
            },
            success: function(data) {
                if (typeof data.branch === 'undefined' || typeof data.branch.id === 'undefined') {
                    return;
                }
                AJS.$('#travis-link-'+branchname).attr("href",
                    'https://travis-ci.org/'+username+'/moodle/builds/'+data.branch.id
                    );
            }
        });
    };

    var matches = getInnerText(GITREPO).match('github.com\/([^\/]+)\/moodle');
    var username = matches[1];

    var MASTER = document.getElementById('customfield_10111-val');
    add_travis_button(username, MASTER);
    var MOODLE_30_STABLE = document.getElementById('customfield_12911-val');
    add_travis_button(username, MOODLE_30_STABLE);
    var MOODLE_29_STABLE = document.getElementById('customfield_12311-val');
    add_travis_button(username, MOODLE_29_STABLE);

};


// Attempt to add buttons on document load..
add_travis();

// But we also want to register it for when ajax stuff happens too..
AJS.$(function() {
    if (JIRA.Events.ISSUE_REFRESHED) {
        JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function () {
            add_travis();
        });
    }
});
