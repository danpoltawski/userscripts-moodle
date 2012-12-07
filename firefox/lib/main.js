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
    if (!!sp.prefs.name) {
        return undefined;
    }
    return sp.prefs.name;
};
// Get all options of a module.
var getOptions = function(name) {
    var newkey;
    var options = {};
    for (var key in sp.prefs) {
        if (key.indexOf(name) === 0) {
            newkey = key.substring(name.length + 1);
            options[newkey] = sp.prefs[key];
        }
    }
    return options;
};
var saveOption = function(name, value) {
    sp.prefs.name = value;
};

// Create the button.
var widget_panel = require("panel").Panel({
    contentURL: data.url("popup.html"),
    contentScriptFile: data.url('options_magic.js')
});

// Option Workers.
widget_panel.port.on('getOption', function(name) {
    return getOption(name);
});
widget_panel.port.on('saveOption', function(data) {
    saveOption(data[0], data[1]);
});
widget.Widget({
    label: "MDK Browser Extension",
    id: "mdk-broswer-extension",
    contentURL: data.url("mdk-16.png"),
    panel: widget_panel
});

// Create host patterns.
var hostPattern = sp.prefs.mdk_hosts;
if (hostPattern) {
    hostPattern = hostPattern.split('|');
    hostPattern = createHostPattern(hostPattern);
}

// var moodleHostPattern = 'https?://(www|docs|dev)?\\.?moodle.org/.*';
// var trackerHostPattern = createHostPattern(['tracker.moodle.org']);
// var pullBranchHostPattern = 'https?://tracker\\.moodle\\.org/(secure/EditIssue|browse/MDL-).*';
// var testerHostPattern = 'https?://tracker\\.moodle\\.org/(secure/EditIssue|browse/MDL-).*';

tabs.on('ready', function (tab) {
    var options;
    var url = tab.url;

    /**
     * Include MDK Toolbar
     */
    if (url.match(hostPattern) && sp.prefs.mdk_toolbar_enabled) {
        worker = tab.attach({
            contentScriptFile: data.url('mdk-toolbar.user.js')
        });
        options = getOptions('mdk_toolbar') || {};
        worker.port.emit("loadConfig", options);
    }
});
