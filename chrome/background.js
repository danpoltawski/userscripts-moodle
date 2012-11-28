// Escape Regex strings.
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// Create a host pattern based on a host list.
function createHostPattern(hosts) {
    var pattern = 'https?://(';
    for (var i in hosts) {
        var host = hosts[i].replace('*', '__STAR__');
        host = escapeRegExp(host);
        host = host.replace('__STAR__', '[^./]+');
        hosts[i] = host;
    }
    pattern += hosts.join('|');
    pattern += ')/';
    return pattern;
}

// Create host patterns.
var hostPattern = localStorage['mdk_hosts'];
if (hostPattern) {
    hostPattern = hostPattern.split('\n');
    hostPattern = createHostPattern(hostPattern);
}
var moodleHostPattern = 'https?://(www|docs|dev)?\\.?moodle.org/.*';
var trackerHostPattern = createHostPattern(['tracker.moodle.org']);
var pullBranchHostPattern = 'https?://tracker\\.moodle\\.org/(secure/EditIssue|browse/MDL-).*';
var testerHostPattern = 'https?://tracker\\.moodle\\.org/(secure/EditIssue|browse/MDL-).*';

// When a tab is updated.
// TODO Use proper messaging to send the configuration to the tab.
// TODO Use events like chrome.webNavigation.onDOMContentLoaded?gi
// TODO Register events on install to set persistent to False?
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var settings, script, i, line, lineinfo;
    // Do not load anything while page is still loading.
    if (changeInfo.status != 'complete') {
        return;
    }

    // Loading Toolbar.
    if (tab.url.match(hostPattern) && localStorage['mdk_toolbar_enabled'] == 1) {
        if (tab.url.match(hostPattern)) {
            settings = {
                code:   'var mdkToolbarSettings = { ' +
                            'admin_login: "' + localStorage['mdk_toolbar_admin_login'] + '",' +
                            'admin_password: "' + localStorage['mdk_toolbar_admin_password'] + '",' +
                            'teacher_prefix: "' + localStorage['mdk_toolbar_teacher_prefix'] + '",' +
                            'teacher_password: "' + localStorage['mdk_toolbar_teacher_password'] + '",' +
                            'teacher_count: "' + localStorage['mdk_toolbar_teacher_count'] + '",' +
                            'student_prefix: "' + localStorage['mdk_toolbar_student_prefix'] + '",' +
                            'student_password: "' + localStorage['mdk_toolbar_student_password'] + '",' +
                            'student_count: "' + localStorage['mdk_toolbar_student_count'] + '"' +
                        ' };'
            };
            script = {
                file: 'mdk-toolbar.user.js'
            };
            chrome.tabs.executeScript(tabId, settings);
            chrome.tabs.executeScript(tabId, script);
        }
    }

    // Tracker scripts.
    if (tab.url.match(trackerHostPattern)) {

        // Loading Pull Manager Helper.
        if (localStorage['mdk_pull_request_helper_enabled'] == 1) {
            script = {
                file: 'pull-request-helper.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

        // Loading Tracker Toggle Moodle Menu.
        if (localStorage['mdk_tracker_toggle_moodle_menu_enabled'] == 1) {
            script = {
                file: 'tracker-toggle-moodle-menu.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

        // Loading Tracker Tester Helper.
        if (tab.url.match(testerHostPattern) && localStorage['mdk_tracker_tester_helper_enabled'] == 1) {
            script = {
                file: 'mdk-tracker-tester.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

        // Loading Tracker Pull Branches.
        if (tab.url.match(pullBranchHostPattern) && localStorage['mdk_tracker_pull_branches_enabled'] == 1) {

            // Default branches.
            var default_branches = localStorage['mdk_tracker_pull_branches_default_branches'].split(',');
            var default_branches_txt = '[';
            if (default_branches.length > 0) {
                for (i in default_branches) {
                    default_branches[i] = '"' + default_branches[i].trim() + '"';
                }
                default_branches_txt += default_branches.join(',');
            }
            default_branches_txt += ']';

            // Versions naming.
            var version_naming = localStorage['mdk_tracker_pull_branches_versions'].split('\n');
            var version_naming_txt = '{';
            var version_name, version_translation;
            var version_naming_obj = [];
            if (version_naming.length > 0) {
                for (i in version_naming) {
                    line = version_naming[i];
                    lineinfo = line.split(':');
                    if (lineinfo.length == 2) {
                        version_name = lineinfo[0].trim();
                        version_translation = lineinfo[1].trim();
                        version_naming_obj[version_naming_obj.length] = version_name + ': "' + version_translation + '"';
                    }
                }
                version_naming_txt += version_naming_obj.join(',');
            }
            version_naming_txt += '}';

            // Suffix.
            var suffix_naming = localStorage['mdk_tracker_pull_branches_suffix'].split('\n');
            var suffix_naming_txt = '{';
            var suffix_name, suffix_translation;
            var suffix_naming_obj = [];
            if (suffix_naming.length > 0) {
                for (i in suffix_naming) {
                    line = suffix_naming[i];
                    lineinfo = line.split(':');
                    if (lineinfo.length == 2) {
                        suffix_name = lineinfo[0].trim();
                        suffix_translation = lineinfo[1].trim();
                        suffix_naming_obj[suffix_naming_obj.length] = suffix_name + ': "' + suffix_translation + '"';
                    }
                }
                suffix_naming_txt += suffix_naming_obj.join(',');
            }
            suffix_naming_txt += '}';

            settings = {
                code:   'var mdkTrackerPullBranchesSettings = { ' +
                            'repository: "' + localStorage['mdk_tracker_pull_branches_repository'] + '",'  +
                            'branch: "' + localStorage['mdk_tracker_pull_branches_branch'] + '",'  +
                            'compare_url: "' + localStorage['mdk_tracker_pull_branches_compare_url'] + '",'  +
                            'default_branches: ' + default_branches_txt + ','  +
                            'compare_with_origin: "' + localStorage['mdk_tracker_pull_branches_compare_with_origin'] + '",'  +
                            'versions: ' + version_naming_txt + ','  +
                            'suffix: ' + suffix_naming_txt +
                        ' };'
            };
            script = {
                file: 'mdk-tracker-pull-branches.user.js'
            };
            chrome.tabs.executeScript(tabId, settings);
            chrome.tabs.executeScript(tabId, script);
        }
    }

    // Moodle.org scripts.
    if (tab.url.match(moodleHostPattern)) {

        // Loading Tracker Tester Helper.
        if (localStorage['mdk_filemanager_shrinker_enabled'] == 1) {
            script = {
                file: 'filemanager-shrinker.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

    }
});

// Default settings.
if (!localStorage['mdk_hosts']) {
    localStorage['mdk_hosts'] = 'localhost\n127.0.0.1\n*.moodle.local';
}
if (!localStorage['mdk_filemanager_shrinker_enabled']) {
    localStorage['mdk_filemanager_shrinker_enabled'] = 1;
}
if (!localStorage['mdk_pull_request_helper_enabled']) {
    localStorage['mdk_pull_request_helper_enabled'] = 1;
}
if (!localStorage['mdk_toolbar_enabled']) {
    localStorage['mdk_toolbar_enabled'] = 1;
}
if (!localStorage['mdk_toolbar_admin_login']) {
    localStorage['mdk_toolbar_admin_login'] = 'admin';
}
if (!localStorage['mdk_toolbar_admin_password']) {
    localStorage['mdk_toolbar_admin_password'] = 'test';
}
if (!localStorage['mdk_toolbar_teacher_prefix']) {
    localStorage['mdk_toolbar_teacher_prefix'] = 't';
}
if (!localStorage['mdk_toolbar_teacher_password']) {
    localStorage['mdk_toolbar_teacher_password'] = 'test';
}
if (!localStorage['mdk_toolbar_teacher_count']) {
    localStorage['mdk_toolbar_teacher_count'] = 3;
}
if (!localStorage['mdk_toolbar_student_prefix']) {
    localStorage['mdk_toolbar_student_prefix'] = 's';
}
if (!localStorage['mdk_toolbar_student_password']) {
    localStorage['mdk_toolbar_student_password'] = 'test';
}
if (!localStorage['mdk_toolbar_student_count']) {
    localStorage['mdk_toolbar_student_count'] = 10;
}
if (!localStorage['mdk_tracker_pull_branches_enabled']) {
    localStorage['mdk_tracker_pull_branches_enabled'] = 1;
}
if (!localStorage['mdk_tracker_pull_branches_repository']) {
    localStorage['mdk_tracker_pull_branches_repository'] = 'git://github.com/YourUserName/moodle.git';
}
if (!localStorage['mdk_tracker_pull_branches_branch']) {
    localStorage['mdk_tracker_pull_branches_branch'] = 'MDL-%issue%%version%%suffix%';
}
if (!localStorage['mdk_tracker_pull_branches_compare_url']) {
    localStorage['mdk_tracker_pull_branches_compare_url'] = 'https://github.com/YourUserName/moodle/compare/%with%...%branch%';
}
if (!localStorage['mdk_tracker_pull_branches_default_branches']) {
    localStorage['mdk_tracker_pull_branches_default_branches'] = '23, 24, master';
}
if (!localStorage['mdk_tracker_pull_branches_compare_with_origin']) {
    localStorage['mdk_tracker_pull_branches_compare_with_origin'] = true;
}
if (!localStorage['mdk_tracker_pull_branches_versions']) {
    localStorage['mdk_tracker_pull_branches_versions'] = '19: -19\n21: -21\n22: -22\n23: -23\n24: -24\nmaster: -master';
}
if (!localStorage['mdk_tracker_pull_branches_suffix']) {
    localStorage['mdk_tracker_pull_branches_suffix'] = 'before: -\nafter:';
}
