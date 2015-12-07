// ==UserScript==
// @match         http://tracker.moodle.org/browse/*
// @match         https://tracker.moodle.org/browse/*
// @name          Pull Request Helper
// @description   Makes copy and paste easier for Moodle integrators
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @downloadURL   https://github.com/danpoltawski/userscripts-moodle/raw/master/pull-request-helper.user.js
// @version       1.00
// ==/UserScript==

var userScript = function() {
    var updateView = function() {
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

        var
            branches = [
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
            branchkey,
            branch,
            cs = '',
            gitrepo = getInnerText(GITREPO),
            travisLink;

        var structure = gitrepo.match('^.*:\/\/github.com\/([^/]*)\/moodle.*$');
        if (structure) {
            travisLink = 'https://travis-ci.org/' + structure[1] + '/moodle.svg?branch=';
        }

        branches.forEach(function(branch) {
            branch.customFieldNode = document.getElementById('customfield_' + branch.customField + '-val');
            if (branch.customFieldNode) {
                var remoteBranchName = getInnerText(branch.customFieldNode),
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
                                'git pull ' + gitrepo+ ' ' + getInnerText(branch.customFieldNode) + "\n" +
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


        var contentWrapper = document.createElement('span');
        contentWrapper.innerHTML = template.replace('%cheatsheet%', cs.trim());

        var targetSection = document.getElementById('userscript_integrator_cs');
        if (targetSection) {
            targetSection.parentNode.replaceChild(contentWrapper.firstChild, targetSection);
        } else {
            targetSection = document.getElementById('details-module');
            if (targetSection) {
                targetSection = targetSection.parentNode;
                targetSection.insertBefore(contentWrapper.firstChild, targetSection.firstChild);
            }
        }
    };

    updateView();

    // But we also want to register it for when ajax stuff happens too..
    AJS.$(function() {
        if (JIRA.Events.ISSUE_REFRESHED) {
            JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function () {
                updateView();
            });
        }
    });
};

// Hack to make this script work for Chrome.
var winScript = document.createElement('script');
winScript.appendChild(document.createTextNode('(' + userScript + ')();'));
(document.body || document.head || document.documentElement).appendChild(winScript);
