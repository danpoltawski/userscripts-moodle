// ==UserScript==
// @name        MDK Tracker Pull Branches
// @description Helper to populate the pull branch fields
// @include     http://tracker.moodle.org/secure/EditIssue*
// @include     http://tracker.moodle.org/browse/MDL-*
// @include     https://tracker.moodle.org/secure/EditIssue*
// @include     https://tracker.moodle.org/browse/MDL-*
// @match       http://tracker.moodle.org/secure/EditIssue*
// @match       http://tracker.moodle.org/browse/MDL-*
// @match       https://tracker.moodle.org/secure/EditIssue*
// @match       https://tracker.moodle.org/browse/MDL-*
// @grant       none
// @author      Frédéric Massart - FMCorz.net
// @version     0.391
// ==/UserScript==

// Settings.
var settings = {
    // Branch default template.
    branch: 'MDL-%issue%%version%%suffix%',

    // Git:// URL to your repository.
    repository: 'git://github.com/FMCorz/moodle.git',

    // Compare URL template.
    compare_url: 'https://github.com/FMCorz/moodle/compare/%with%...%branch%',

    // If you are using github you can set this to true to compare with the origin.
    compare_with_origin: true,

    // The default branches to select.
    default_branches: [ '22', '23', 'master' ],

    // How do you name your versions in the branches?
    versions: {
        19: '-19',
        20: '-20',
        21: '-21',
        22: '-22',
        23: '-23',
        master: '-master'
    },

    // How to separate the suffix with the rest of the context, if any.
    suffix: {
        prefix: '-',
        suffix: ''
    },

    // Preview all your selection instead of just one branch.
    real_preview: false
};

// Scripts.
var fields = {
    repository: 'customfield_10100',
    branch: {
        19: 'customfield_10116',
        20: 'customfield_10113',
        21: 'customfield_10311',
        22: 'customfield_10711',
        23: 'customfield_11016',
        master: 'customfield_10111'
    },
    diff: {
        19: 'customfield_10115',
        20: 'customfield_10114',
        21: 'customfield_10312',
        22: 'customfield_10712',
        23: 'customfield_11017',
        master: 'customfield_10112'
    },
    issue: 'key-val',
    testing: 'customfield_10117',
    comment: 'comment'
}

var dialogs = {
    ids: [ 'workflow-transition-951-dialog', 'workflow-transition-5-dialog', 'workflow-transition-821-dialog'],
}

var populate_branches = function() {
    var display = function() {
        var popup = "" +
            "<div id='mdk_populate_popup' style='width: 300px; background: #eee; box-shadow: 0px 0px 5px #333; padding: 1px; position: fixed; top: 50%; left: 50%; z-index: 65000; margin-left: -150px; margin-top: -120px;'>" +
            "    <h4 style='margin: .5em; text-align: center;'>Populate pull branches</h4>" +
            "    <div style='margin: .5em;'>" +
            "        <ul style='list-style: none; padding: 0; margin: 0;'>   " +
            "            <li style='float: left; width: 50%;'><label><input type='checkbox' value='19' id='mdk_version_19' class='mdk_version'> 1.9</label></li>" +
            "            <li style='float: left; width: 50%;'><label><input type='checkbox' value='21' id='mdk_version_21' class='mdk_version'> 2.1</label></li>" +
            "            <li style='float: left; width: 50%;'><label><input type='checkbox' value='22' id='mdk_version_22' class='mdk_version'> 2.2</label></li>" +
            "            <li style='float: left; width: 50%;'><label><input type='checkbox' value='23' id='mdk_version_23' class='mdk_version'> 2.3</label></li>" +
            "            <li style='float: left; width: 50%;'><label><input type='checkbox' value='master' id='mdk_version_master' class='mdk_version'> master</label></li>" +
            "        </ul>" +
            "        <div style='clear:both;'></div>" +
            "    </div>" +
            "    <div style='margin: .5em;'>" +
            "        <label>Suffix: " +
            "            <input type='text' id='mdk_suffix' style='width: 100%;'/>" +
            "        </label>" +
            "    </div>" +
            "    <div style='margin: .5em;'>" +
            "        <button id='mdk_populate' style='float: right;'>Populate</button>" +
            "        <button id='mdk_cancel' style='font-size: .9em'>Cancel</button>" +
            "    </div>" +
            "    <pre id='mdk_preview' style='font-size: .9em; overflow: auto; max-height: 6.3em; margin: .5em; padding: .5em; border: 1px #ccc dashed; color: #666; background: #fff; font-family: monospace;'></pre>" +
            "</div>";
        var e = document.createElement('div');
        e.innerHTML = popup;
        document.body.appendChild(e);

        set_actions();
        preview();
    };

    var get_branch_name = function(issue, version, suffix) {
        var branch = settings.branch;
        branch = branch.replace('%issue%', issue);
        version = settings.versions[version];
        branch = branch.replace('%version%', version);
        if (suffix && suffix.length > 0) {
            suffix = settings.suffix.prefix + suffix + settings.suffix.suffix;
        } else {
            suffix = '';
        }
        branch = branch.replace('%suffix%', suffix);
        return branch;
    };

    var get_compare_url = function(branch, version) {
        var compare = settings.compare_url;
        compare = compare.replace('%branch%', branch);
        var compare_with = 'master';
        if (version != 'master') {
            compare_with = 'MOODLE_' + version + '_STABLE';
        }
        if (settings.compare_with_origin) {
            compare_with = 'moodle:' + compare_with;
        }
        compare = compare.replace('%with%', compare_with);
        return compare;
    };

    var get_issue = function() {
        return document.getElementById(fields.issue).text.replace('MDL-', '');
    };

    var get_suffix = function() {
        return document.getElementById('mdk_suffix').value;
    };

    var get_versions = function() {
        var versions = [];
        var nodes = document.getElementsByClassName('mdk_version');
        for (var i = 0; i < nodes.length; i++) {
            node = nodes[i];
            if (node.checked) {
                versions[versions.length] = node.value;
            }
        }
        return versions;
    };

    var hide = function() {
        e = document.getElementById('mdk_populate_popup');
        if (e) {
            e.parentNode.removeChild(e);
        }
    };

    var preview = function() {
        var version = '';
        var branch = '';
        var compare_url = '';
        var versions = settings.real_preview ? get_versions() : ['master'];
        versions = versions.length < 1 ? ['master'] : versions;
        var prev = '';
        for (var i in versions) {
            version = versions[i];
            branch = get_branch_name(get_issue(), version, get_suffix());
            compare_url = get_compare_url(branch, version);
            prev = prev + branch + '\n' + compare_url + '\n';
        }
        document.getElementById('mdk_preview').textContent = prev;
    };

    var populate = function() {
        document.getElementById(fields.repository).value = settings.repository;
        var version = '';
        var branch = '';
        var compare_url = '';
        var issue = get_issue();
        var suffix = get_suffix();
        var versions = get_versions();
        for (var i in versions) {
            version = versions[i];
            if (fields.branch[version]) {
                branch = get_branch_name(issue, version, suffix);
                compare_url = get_compare_url(branch, version);
                document.getElementById(fields.branch[version]).value = branch;
                document.getElementById(fields.diff[version]).value = compare_url;
            }
        };
        hide();
    };

    var set_actions = function() {
        if (!document.getElementById('mdk_populate_popup')) {
            return;
        }
        var versions = document.getElementsByClassName('mdk_version');
        for (var i in versions) {
            if (settings.default_branches.indexOf(versions[i].value) > -1) {
                versions[i].checked = true;
            }
            versions[i].onchange = preview;
        }
        var suffix = document.getElementById('mdk_suffix');
        suffix.onchange = preview;
        suffix.onkeyup = function(e) {
            if (e.keyCode == 13) {
                populate();
                return;
            }
            preview();
        }
        suffix.onblur = preview;
        suffix.focus();
        var cancel = document.getElementById('mdk_cancel');
        cancel.onclick = hide;
        var button = document.getElementById('mdk_populate');
        button.onclick = populate;
    };

    display();
};

var go_to_compare = function(node) {
    var node = node;
    var btn = document.createElement('button');
    btn.textContent = 'Go';
    btn.style.fontSize = '.8em';
    btn.style.margin = '0 0 0 0';
    btn.type = 'button';
    btn.onclick = function() {
        url = node.value;
        if (url.length > 0) {
            window.open(url, '_blank');
        }
    }
    node.parentNode.insertBefore(btn, node.nextSibling);
}

function add_buttons() {
    var btn = document.createElement('input');
    btn.type = 'button';
    btn.className = 'button';
    btn.value = 'Populate pull branches';

    // Add button at the end of the form.
    var e = document.getElementById('issue-edit-submit');
    if (e) {
        var f = btn.cloneNode(true);
        f.onclick = populate_branches;
        e.parentNode.insertBefore(f, e);
    }

    // Add button right before the fields.
    var e = document.getElementById(fields.repository);
    if (e) {
        var f = btn.cloneNode(true);
        f.onclick = populate_branches;

        var field = document.createElement('div');
        field.className = 'field-group';
        var label = document.createElement('label');
        field.appendChild(label);
        field.appendChild(f);

        e = e.parentNode;
        e.parentNode.insertBefore(field, e);
    }

    // Add a button to open the compare URL.
    for (var i in fields.diff) {
        var field = fields.diff[i];
        var e = document.getElementById(field);
        if (e) {
            go_to_compare(e);
        }
    }

}

function set_events() {
    document.body.addEventListener('DOMNodeInserted', function(e) {
        if (dialogs.ids.indexOf(e.target.id) > -1) {
            var callback = function(f) {
                if (f.target.parentNode != f.currentTarget) {
                    return;
                }
                add_buttons();
            };
            e.target.addEventListener('DOMNodeInserted', callback, false);
        }
    }, false);
}

add_buttons();
set_events();
