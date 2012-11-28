// ==UserScript==
// @name        MDK Tracker Tester
// @description Helper to follow and write test instructions
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
// @version     0.400
// ==/UserScript==

var mdkTrackerTester = function() {

    // Settings.
    var settings = {
        colours_steps: ['#ccc', '#f00', '#444'],
        template:   '*Test pre-requisites*\n\n' +
                    '- Moodle\n\n' +
                    '*Test steps*\n\n' +
                    '# \n' +
                    '# *Make sure*\n\n'
    };

    // Scripts.
    var fields = {
        instructions: 'field-customfield_10117',
        testing: 'customfield_10117'
    };

    var tester_helper = {
        field: null,
        attach_events: function() {
            nodes = this.field.querySelectorAll('p, li, h1, h2, h3, h4');
            for (var i in nodes) {
                this.colour_switcher(nodes[i]);
            }
        },
        colour_switcher: function(node) {
            var index = -1;
            node.onclick = function() {
                index++;
                if (index > settings.colours_steps.length -1) {
                    index = 0;
                }
                this.style.color = settings.colours_steps[index];
            };
        },
        init: function(node) {
            this.field = node;
            this.attach_events();
        }
    };

    var testwriter_helper = {
        field: null,
        undo: [],
        add_btn: function() {
            var where = this.field.parentNode.parentNode.parentNode;

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'Use testing instructions template';
            btn.onclick = function() {
                testwriter_helper.undo.push(testwriter_helper.field.value);
                testwriter_helper.field.value = settings.template;
            };

            var cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.textContent = 'Undo';
            cancel.onclick = function() {
                var pop = testwriter_helper.undo.pop();
                if (pop) {
                    testwriter_helper.field.value = pop;
                }
            };

            var div = document.createElement('div');
            div.className = 'field-group';
            div.appendChild(document.createElement('label'));
            div.appendChild(btn);
            div.appendChild(cancel);
            where.parentNode.insertBefore(div, where);
        },
        init: function(node) {
            this.field = node;
            this.undo.push(this.field.value);
            this.add_btn();
        }
    };

    var field = document.getElementById(fields.instructions);
    if (field) {
        th = tester_helper;
        th.init(field);
    }

    var textarea = document.getElementById(fields.testing);
    if (textarea) {
        wh = testwriter_helper;
        wh.init(textarea);
    }
};

mdkTrackerTester();
