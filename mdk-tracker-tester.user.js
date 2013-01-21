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
// @version     0.510
// ==/UserScript==

// Note: this disables the 'inline editing' of the testing instructions.
// TODO Support for button to populate test instructions in dialogs.

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
        testing: 'customfield_10117',
        status: 'status-val'
    };

    var tester_helper = {
        field: null,
        attach_events: function() {
            this.field.addEventListener('click', function(e) {
                var node = e.target;
                var tag = node.tagName.toLowerCase();
                while (tag == 'a' || tag == 'b' || tag == 'i' || tag == 'strong' || tag == 'em' || tag == 'div') {
                    node = node.parentNode;
                    tag = node.tagName.toLowerCase();

                    // If we reached the main field, do nothing.
                    if (node == e.currentTarget) {
                        return;
                    }
                }
                var index = node.getAttribute('mdkTesterColourIndex') || -1;
                index++;
                if (index > settings.colours_steps.length -1) {
                    index = 0;
                }
                node.setAttribute('mdkTesterColourIndex', index);
                node.style.color = settings.colours_steps[index];
            });
        },
        disable_editing: function() {
            var editable = this.field.parentNode;
            if (editable) {
                editable.classList.remove('inactive');
                editable.setAttribute('title', '');
            }
        },
        init: function(node) {
            this.field = node;
            this.disable_editing();
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
