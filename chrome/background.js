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

// Get an option.
var getOption = function(name) {
    var val = localStorage[name];
    // Hack because localStorage stores everything as a string.
    if (val === 'false') {
        val = false;
    }
    return val || undefined;
};
// Get all options of a module.
var getOptions = function(name) {
    var newkey;
    var options = {};
    for (var key in localStorage) {
        if (key.indexOf(name) === 0) {
            newkey = key.substring(name.length + 1);
            translation = translateOption(newkey, localStorage[key]);
            options[translation[0]] = translation[1];
        }
    }
    return options;
};
// Save an option.
var saveOption = function(name, value) {
    localStorage[name] = value;
};
// Translate an option.
var translateOption = function(name, value) {
    var i, j, newval, newnewval;
    if (name.match(/-listComma$/)) {
        name = name.replace(/-listComma$/, '');
        newval = value.split(',');
        for (i in newval) {
            newval[i] = newval[i].trim();
        }
        value = newval;
    } else if (name.match(/-listPipe$/)) {
        name = name.replace(/-listPipe$/, '');
        newval = value.split('|');
        for (i in newval) {
            newval[i] = newval[i].trim();
        }
        value = newval;
    } else if (name.match(/-dictPipeColon$/)) {
        name = name.replace(/-dictPipeColon$/, '');
        newval = value.split('|');
        value = {};
        for (i in newval) {
            newnewval = newval[i].split(':');
            value[newnewval[0]] = newnewval[1].trim() || undefined;
        }
    } else if (name.match(/-dictLnColon$/)) {
        name = name.replace(/-dictLnColon$/, '');
        newval = value.split('\n');
        value = {};
        for (i in newval) {
            newnewval = newval[i].split(':');
            value[newnewval[0]] = newnewval[1].trim() || undefined;
        }
    }
    return [name, value];
};
// Messaging system to load the config.
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == 'getConfig') {
            sendResponse(getOptions(request.module));
        }
    }
);

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
// TODO Use events like chrome.webNavigation.onDOMContentLoaded?
// TODO Register events on install to set persistent to False?
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var settings, script, i, line, lineinfo;
    // Do not load anything while page is still loading.
    if (changeInfo.status != 'complete') {
        return;
    }

    /**
     * MDK Toolbar.
     */
    if (getOption('mdk_toolbar_enabled') && tab.url.match(hostPattern)) {
        script = {
            file: 'mdk-toolbar.user.js'
        };
        chrome.tabs.executeScript(tabId, script);
    }

    /**
     * Tracker scripts.
     */
    if (tab.url.match(trackerHostPattern)) {

        /**
         * Pull Request Helper.
         */
        if (getOption('mdk_pull_request_helper_enabled')) {
            script = {
                file: 'pull-request-helper.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

        /**
         * Tracker Toggle Moodle.org Menu.
         */
        if (getOption('mdk_tracker_toggle_moodle_menu_enabled')) {
            script = {
                file: 'tracker-toggle-moodle-menu.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

        /**
         * MDK Tracker Tester Helper.
         */
        if (getOption('mdk_tracker_tester_helper_enabled') && tab.url.match(testerHostPattern)) {
            script = {
                file: 'mdk-tracker-tester.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

        /**
         * MDK Tracker Pull Branches.
         */
        if (getOption('mdk_tracker_pull_branches_enabled') && tab.url.match(pullBranchHostPattern)) {
            script = {
                file: 'mdk-tracker-pull-branches.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }
    }

    /**
     * Moodle.org.
     */
    if (tab.url.match(moodleHostPattern)) {

        /**
         * File Manager Shrinker.
         */
        if (getOption('mdk_filemanager_shrinker_enabled')) {
            script = {
                file: 'filemanager-shrinker.user.js'
            };
            chrome.tabs.executeScript(tabId, script);
        }

        /**
         * Moodle.org Markdown Selector.
         */
        if (getOption('mdk_moodleorg_markdown_selector_enabled')) {
            script = {
                file: 'moodleorg-markdown-selector.user.js'
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
    localStorage['mdk_filemanager_shrinker_enabled'] = false;
}
if (!localStorage['mdk_moodleorg_markdown_selector_enabled']) {
    localStorage['mdk_moodleorg_markdown_selector_enabled'] = false;
}
if (!localStorage['mdk_pull_request_helper_enabled']) {
    localStorage['mdk_pull_request_helper_enabled'] = true;
}
if (!localStorage['mdk_toolbar_enabled']) {
    localStorage['mdk_toolbar_enabled'] = true;
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
    localStorage['mdk_tracker_pull_branches_enabled'] = true;
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
if (!localStorage['mdk_tracker_pull_branches_default_branches-listComma']) {
    // Setting name changed in 0.4.1.
    localStorage['mdk_tracker_pull_branches_default_branches-listComma'] = localStorage['mdk_tracker_pull_branches_default_branches'] || '23, 24, master';
}
if (!localStorage['mdk_tracker_pull_branches_compare_with_origin']) {
    localStorage['mdk_tracker_pull_branches_compare_with_origin'] = true;
}
if (!localStorage['mdk_tracker_pull_branches_versions-dictLnColon']) {
    // Setting name changed in 0.4.1.
    localStorage['mdk_tracker_pull_branches_versions-dictLnColon'] = localStorage['mdk_tracker_pull_branches_versions'] || '19: -19\n21: -21\n22: -22\n23: -23\n24: -24\nmaster: -master';
}
if (!localStorage['mdk_tracker_pull_branches_suffix-listPipe']) {
    var mdk_tracker_pull_branches_suffix = '-|';
    // Setting name changed in 0.4.1.
    if (localStorage['mdk_tracker_pull_branches_suffix']) {
        mdk_tracker_pull_branches_suffix = localStorage['mdk_tracker_pull_branches_suffix'];
        mdk_tracker_pull_branches_suffix.replace('\n', '|');
        mdk_tracker_pull_branches_suffix.replace('before:', '');
        mdk_tracker_pull_branches_suffix.replace('after:', '');
    }
    localStorage['mdk_tracker_pull_branches_suffix-listPipe'] = mdk_tracker_pull_branches_suffix;
}
if (!localStorage['mdk_tracker_tester_helper_enabled']) {
    localStorage['mdk_tracker_tester_helper_enabled'] = true;
}
if (!localStorage['mdk_tracker_toggle_moodle_menu_enabled']) {
    localStorage['mdk_tracker_toggle_moodle_menu_enabled'] = true;
}
