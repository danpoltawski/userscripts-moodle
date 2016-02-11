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

var add_travis = function($) {
    // Look for github repo in repository field.
    var matches = $('#customfield_10100-val').text().match('github.com\/([^\/]+)\/moodle');

    if (matches.length != 2) {
        // No github repo found
        return;
    }
    var username = matches[1];

    // Fairly hacky way of determining the list of branch fields, but means we don't have
    // to keep updating it..
    var branches = $('#customfieldmodule') // In the list of cutom fields
        .find("li[id^='rowForcustomfield_']:contains('Pull'):contains('Branch:')") // li id starting with 'rowForcustomfield_' and containing 'Pull' and 'Branch:'
        .find("div[id^=customfield_][id$=-val]"); // And the containing div which matches id 'customfield_[*]-val'

    var add_travis_button = function (username, el) {
        var branchname = el.text().trim();

        if (!branchname) {
            return;
        }

        var linkid = 'travis-link-' + branchname;

        if ($("#" + linkid).length > 0) {
            // Don't add duplicate links.
            return;
        }

        var img = $('<img>', {
            src: 'https://travis-ci.org/'+username+'/moodle.svg?branch='+branchname,
            style: 'height: 15px; padding-left: 10px;'
        });

        // Crappy link for the moment..
        var link = $('<a>', {id: linkid, href: 'https://travis-ci.org/'+username+'/moodle/branches'});
        link.append(img).insertAfter(el);

        $.ajax({
            dataType: "json",
            url: 'https://api.travis-ci.org/repos/'+username+'/moodle/branches/'+branchname,
            headers: {
                Accept: 'application/vnd.travis-ci.2+json'
            },
            success: function(data) {
                if (typeof data.branch === 'undefined' || typeof data.branch.id === 'undefined') {
                    return;
                }
                AJS.$('#'+linkid).attr("href",
                    'https://travis-ci.org/'+username+'/moodle/builds/'+data.branch.id
                    );
            }
        });
    };

    branches.each(function (index, element) {
        add_travis_button(username, $(element));
    });
};

// Attempt to add buttons on document load..
add_travis(AJS.$);

// But we also want to register it for when ajax stuff happens too..
AJS.$(function() {
    if (JIRA.Events.ISSUE_REFRESHED) {
        JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function () {
            add_travis(AJS.$);
        });
    }
});
