// ==UserScript==
// @match         http://tracker.moodle.org/browse/*
// @match         https://tracker.moodle.org/browse/*
// @name          Pull Request Helper
// @description   Makes copy and paste easier for Moodle integrators
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @downloadURL   https://github.com/danpoltawski/userscripts-moodle/raw/master/pull-request-helper.user.js
// @version       1.01
// ==/UserScript==

var userScript = function() {
    var userScriptContent = {
        branches: [
            {
                shortname: 'master',
                customField: '10111',
                branchname: 'master'
            },
            {
                shortname: '30',
                customField: '12911',
                branchname: 'MOODLE_30_STABLE'
            },
            {
                shortname: '29',
                customField: '12311',
                branchname: 'MOODLE_29_STABLE'
            },
            {
                shortname: '28',
                customField: '12013',
                branchname: 'MOODLE_28_STABLE'
            },
            {
                shortname: '27',
                customField: '11710',
                branchname: 'MOODLE_27_STABLE'
            }
        ],

        updateView: function() {
            // First we check for a valid git repository being listed.
            var gitrepo = AJS.$('#customfield_10100-val').text().trim();
            if (!gitrepo.length) {
                return;
            }

            var cs = '',
                travisLink = ''
                ;

            var repoStructure = gitrepo.match('^.*:\/\/github.com\/([^/]*)\/moodle.*$');
            if (repoStructure) {
                travisLink = 'https://travis-ci.org/' + repoStructure[1] + '/moodle.svg?branch=';
            }

            userScriptContent.branches.forEach(function(branch) {
                branch.customFieldNode = AJS.$('#customfield_' + branch.customField + '-val');
                if (branch.customFieldNode.length) {
                    var remoteBranchName = branch.customFieldNode.text().trim(),
                        travisBranchStatus;
                    if (travisLink) {
                        travisBranchStatus = '<img src="' + travisLink + remoteBranchName + '">';
                    }
                    cs +=
                        '<dl>' +
                            '<dt>' +
                                branch.shortname +
                                '<br>' +
                                travisBranchStatus +
                            '</dt>' +
                            '<dd>' +
                                '<pre>' +
                                    'git checkout ' + branch.branchname + "\n" +
                                    'git pull ' + gitrepo + ' ' + remoteBranchName + "\n" +
                                '</pre>' +
                            '</dd>' +
                        '</dl>'
                        ;
                }
            });

            if (!cs) {
                // No content on this issue.
                return;
            }

            var template = '' +
                '<div id="userscript_integrator_cs" class="module toggle-wrap">' +
                    '<div id="userscript_integrator_cs_heading" class="mod-header">' +
                        '<ul class="ops"></ul>' +
                        '<h2 class="toggle-title">Pull Branches</h2>' +
                    '</div>' +
                    '<div class="mod-content">' +
                        '<ul class="item-details" id="userscript_integrator_cs-details">' +
                            '<li class="userscript_integrator_cs-details">' +
                                '%cheatsheet%' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                '</div>'
                ;


            var content         = template.replace('%cheatsheet%', cs.trim()),
                targetSection   = AJS.$('#userscript_integrator_cs')
                ;
            if (targetSection.length) {
                targetSection.replaceWith(content);
            } else {
                targetSection = AJS.$('#details-module');
                if (targetSection.length) {
                    targetSection.before(content);
                }
            }
        },
        setup: function() {
            userScriptContent.updateView();

            // But we also want to register it for when ajax stuff happens too..
            AJS.$(function() {
                if (JIRA.Events.ISSUE_REFRESHED) {
                    JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function () {
                        userScriptContent.updateView();
                    });
                }
            });
        }
    };
    userScriptContent.setup();
};

// Hack to make this script work for Chrome.
// Note: We cannot use the global jQuery here.
var winScript = document.createElement('script');
winScript.appendChild(document.createTextNode('(' + userScript + ')();'));
(document.body || document.head || document.documentElement).appendChild(winScript);
