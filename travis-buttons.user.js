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
// @version       0.5
// ==/UserScript==

var add_travis = function($) {
    var repo = $('#customfield_10100-val').text();
    if (!repo) {
        return;
    }

    // Look for github repo in repository field.
    var matches = repo.match('github.com\/([^\/]+)\/([^\./]+)');

    if (matches && matches.length != 3) {
        // No github repo found
        return;
    }
    var username = matches[1].trim();
    var reponame = matches[2].trim();
    var get_linkid = function (branchname) {
        return 'moodle-travis-link-' + branchname;
    };

    // Fairly hacky way of determining the list of branch fields, but means we don't have
    // to keep updating it..
    var branches = $('#customfieldmodule') // In the list of cutom fields
        .find("li[id^='rowForcustomfield_']:contains('Pull'):contains('Branch:')") // li id starting with 'rowForcustomfield_' and containing 'Pull' and 'Branch:'
        .find("div[id^=customfield_][id$=-val]"); // And the containing div which matches id 'customfield_[*]-val'

    var add_travis_button = function (el) {
        var branchname = el.text().trim();

        if (!branchname) {
            return false;
        }

        var linkid = get_linkid(branchname);

        if ($("#" + linkid).length > 0) {
            // Don't add duplicate links.
            return false;
        }

        var img = $('<img>', {
            src: 'https://travis-ci.org/'+username+'/'+reponame+'.svg?branch='+branchname,
            style: 'height: 15px; padding-left: 10px;'
        });

        // Crappy link for the moment..
        var link = $('<a>', {id: linkid, href: 'https://travis-ci.org/'+username+'/'+reponame+'/branches'});
        link.append(img).insertAfter(el);

        return branchname;
    };

    var branchnames = [];
    branches.each(function (index, element) {
        var branch = add_travis_button($(element));
        if (branch) {
            branchnames.push(branch);
        }
    });

    var update_travis_branch_link = function (branchname) {
         $.ajax({
            dataType: "json",
            url: 'https://api.travis-ci.org/repos/'+username+'/'+reponame+'/branches/'+branchname,
            headers: {
                Accept: 'application/vnd.travis-ci.2+json'
            },
            success: function(data) {
                if (typeof data.branch === 'undefined' || typeof data.branch.id === 'undefined') {
                    return;
                }
                $('#'+get_linkid(branchname)).attr("href",
                    'https://travis-ci.org/'+username+'/'+reponame+'/builds/'+data.branch.id
                    );
            }
        });
    };

    var add_note_about_missing_travis = function (status) {
        $("#customfield-panel-1 ul.property-list").append(
        '<li class="item"><strong class="name">Travis-CI:</strong>'+
        '<div class="value"><img src="https://twemoji.maxcdn.com/svg/274c.svg" style="height: 16px; padding-right: 5px">'+
        'Not enabled. See '+
        '<a href="https://docs.moodle.org/dev/Travis_Integration">Travis docs</a> '+
        'to enable.</div></li>');
    };

    $.ajax({dataType: "json", headers: { Accept: 'application/vnd.travis-ci.2+json'},
            url: 'https://api.travis-ci.org/repos/'+username+'/'+reponame}
     ).done(function( data ) {
         if (typeof data.repo === 'undefined' || typeof data.repo.active === 'undefined') {
             // Shouldn't happen really..
             return;
         }
         if (data.repo.active) {
             // Travis is setup, update the links to better ones.
             $.each(branchnames, function (index, branch) {
                 update_travis_branch_link(branch);
             });
         } else {
             // Add travis not setup message.
             add_note_about_missing_travis();
         }
     }).fail(function(data) {
         // Add travis not setup message.
         add_note_about_missing_travis();
         // Remove images..
         $.each(branchnames, function (index, branchname) {
             $('#'+get_linkid(branchname)).html('');
         });
     });
};

AJS.toInit(function() {
  add_travis(AJS.$);
  JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function() {
    moodle_add_travis_x(AJS.$);
  });
  JIRA.bind(JIRA.Events.NEW_PAGE_ADDED, function() {
    add_travis(AJS.$);
  });
});
