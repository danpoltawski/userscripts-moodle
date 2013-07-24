var data = require('self').data;
var pageMod = require('page-mod');
var tabs = require('tabs');
var sp = require('simple-prefs');
var widget = require("widget");

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
    return sp.prefs[name] || undefined;
};
// Get all options of a module.
var getOptions = function(name) {
    var newkey;
    var options = {};
    for (var key in sp.prefs) {
        if (key.indexOf(name) === 0) {
            newkey = key.substring(name.length + 1);
            translation = translateOption(newkey, sp.prefs[key]);
            options[translation[0]] = translation[1];
        }
    }
    return options;
};
// Save an option.
var saveOption = function(name, value) {
    sp.prefs[name] = value;
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
    }
    return [name, value];
};

// Create the button.
var widget_panel = require("panel").Panel({
    contentURL: data.url("popup.html"),
    contentScriptFile: data.url('options_magic.js')
});

// Option Workers.
widget_panel.port.on('getOption', function(data) {
    var name = data[1];
    var id = data[0];
    var value = getOption(name);
    widget_panel.port.emit('gotOption', [id, value]);
});
widget_panel.port.on('saveOption', function(data) {
    saveOption(data[0], data[1]);
});
widget.Widget({
    label: "MDK Browser Extension",
    id: "mdk-browser-extension",
    contentURL: data.url("mdk-16.png"),
    panel: widget_panel
});

// Create host patterns.
var hostPattern = sp.prefs.mdk_hosts;
if (hostPattern) {
    hostPattern = hostPattern.split('|');
    hostPattern = createHostPattern(hostPattern);
}

var moodleorgHostPattern = 'https?://(www|docs|dev)?\\.?moodle.org/.*';
var trackerHostPattern = createHostPattern(['tracker.moodle.org']);

tabs.on('ready', function (tab) {
    var options;
    var pattern;
    var url = tab.url;

    /**
     * MDK Toolbar.
     */
    if (sp.prefs.mdk_toolbar_enabled && url.match(hostPattern)) {
        worker = tab.attach({
            contentScriptFile: data.url('mdk-toolbar.user.js'),
            onMessage: function(data) {
                if (data.action === 'clipboard') {
                    var cp = require('sdk/clipboard');
                    cp.set(data.txt);
                }
            }
        });
        options = getOptions('mdk_toolbar') || {};
        worker.port.emit("loadConfig", options);
    }

    /**
     * Moodle Tracker scripts.
     */
    if (url.match(trackerHostPattern)) {

        /**
         * MDK Tracker Toggle Moodle.org Menu.
         */
        if (sp.prefs.mdk_tracker_toggle_moodle_menu_enabled) {
            worker = tab.attach({
                contentScriptFile: data.url('tracker-toggle-moodle-menu.user.js')
            });
        }

        /**
         * MDK Tracker Pull Branches.
         */
        pattern = 'https?://tracker\\.moodle\\.org/(secure/EditIssue|browse/MDL-).*';
        if (sp.prefs.mdk_tracker_pull_branches_enabled && url.match(pattern)) {
            worker = tab.attach({
                contentScriptFile: data.url('mdk-tracker-pull-branches.user.js')
            });
            options = getOptions('mdk_tracker_pull_branches') || {};
            worker.port.emit("loadConfig", options);
        }

        /**
         * MDK Tracker Tester.
         */
        pattern = 'https?://tracker\\.moodle\\.org/(secure/EditIssue|browse/MDL-).*';
        if (sp.prefs.mdk_tracker_tester_helper_enabled && url.match(pattern)) {
            worker = tab.attach({
                contentScriptFile: data.url('mdk-tracker-tester.user.js')
            });
        }

        /**
         * Pull Request Helper.
         */
        pattern = 'https?://tracker\\.moodle\\.org/browse/MDL-.*';
        if (sp.prefs.mdk_pull_request_helper_enabled && url.match(pattern)) {
            worker = tab.attach({
                contentScriptFile: data.url('pull-request-helper.user.js')
            });
        }

    }

    /**
     * Moodle.org scripts.
     */
    if (url.match(moodleorgHostPattern)) {

        /**
         * File Manager Shrinker.
         */
        if (sp.prefs.mdk_filemanager_shrinker_enabled) {
            worker = tab.attach({
                contentScriptFile: data.url('filemanger-shrinker.user.js')
            });
        }

        /**
         * Markdown selector.
         */
        if (sp.prefs.moodleorg_markdown_selector_enabled) {
            worker = tab.attach({
                contentScriptFile: data.url('moodleorg-markdown-selector.user.js')
            });
        }

    }
});
