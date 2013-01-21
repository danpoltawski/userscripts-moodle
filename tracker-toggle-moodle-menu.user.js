// ==UserScript==
// @name        Tracker Toggle Moodle Menu
// @description Toggle the Moodle.org menu on the Tracker.
// @include     http://tracker.moodle.org/*
// @include     https://tracker.moodle.org/*
// @match       http://tracker.moodle.org/*
// @match       https://tracker.moodle.org/*
// @grant       none
// @author      Frédéric Massart - FMCorz.net
// @version     0.20
// ==/UserScript==

// Settings.
var settings = {
    hidebydefault: true
};

// Limit to Jira, shoudln't be necessary.
if (document.body.id == 'jira') {
    var toggle_object = {
        menuid: 'custom-menu-1',
        navid: 'main-nav',
        menu: null,
        nav: null,
        init: function() {
            this.menu = document.getElementById(this.menuid);
            this.nav = document.getElementById(this.navid);
            if (!this.menu) {
                return;
            }
            if (settings.hidebydefault) {
                this.hide();
            }
            if (this.nav) {
                this.add_toggle_button();
            }
            return this;
        },
        add_toggle_button: function() {
            var btn = document.createElement('li');
            btn.className = 'aui-dd-parent nonlazy';
            var a = document.createElement('a');
            a.textContent = 'Toggle menu';
            a.className = 'lnk';
            a.onclick = this.toggle;
            btn.appendChild(a);
            this.nav.appendChild(btn);
        },
        hide: function() {
            toggle_object.menu.style.display = 'none';
        },
        show: function() {
            toggle_object.menu.style.display = 'block';
        },
        toggle: function() {
            if (toggle_object.menu.style.display != 'block') {
                toggle_object.show();
            } else {
                toggle_object.hide();
            }
            return false;
        }
    };
    t = toggle_object.init();
}
