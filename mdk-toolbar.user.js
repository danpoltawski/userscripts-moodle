// ==UserScript==
// @name            MDK Toolbar
// @description     Set a toolbar of shortcuts on your instances of Moodle
// @include         http://localhost/*
// @include         http://127.0.0.1/*
// @include         http://*.moodle.local/*
// @include         https://localhost/*
// @include         https://127.0.0.1/*
// @include         https://*.moodle.local/*
// @match           http://localhost/*
// @match           http://127.0.0.1/*
// @match           http://*.moodle.local/*
// @match           https://localhost/*
// @match           https://127.0.0.1/*
// @match           https://*.moodle.local/*
// @grant           none
// @author          Frédéric Massart - FMCorz.net
// @version         0.410
// ==/UserScript==

var mdkToolbar = {

    // Default settings.
    settings: {
        admin_login: 'admin',
        admin_password: 'test',
        student_prefix: 's',
        student_count: 10,
        student_password: 'test',
        teacher_prefix: 't',
        teacher_count: 3,
        teacher_password: 'test',
        langs: [
            'en',
            'fr',
            'he*',
            'ja'
        ],
        themes: [
            'afterburner',
            'anomaly',
            'arialist',
            'binarius',
            'boxxie',
            'brick',
            'canvas',
            'formal_white',
            'formfactor',
            'fusion',
            'leatherbound',
            'magazine',
            'mymobile',
            'nimble',
            'nonzero',
            'overlay',
            'serenity',
            'sky_high',
            'splash',
            'standard'
        ],
        opacity: '.8',

        // Settings functions.
        get: function(name) {
            return this[name];
        },
        load: function(settings) {
            for (var key in settings) {
                this.set(key, settings[key]);
            }
        },
        set: function(name, setting) {
            this[name] = setting;
        }
    },

    id: 'mdkToolbar',
    loadingid: 'mdkLoadingPic',
    loginid: 'mdkLoginiFrame',
    M: null,
    purgeid: 'mdkPurgeCacheiFrame',

    init: function(window) {
        // Try to get the M variable.
        this.M = window.M || undefined;
    },

    display: function() {
        // Toolbar already there.
        if (document.getElementById(this.id)) {
            return;
        }

        // Make sure M was found, which more or less guarantee that we are
        // on a Moodle site.
        if (!this.M) {
            return;
        }

        var p, e, x;
        var D = document;
        var B = document.body;
        var scope = this;

        // Menu.
        e = D.createElement('div');
        e.id = this.id;
        e.style.zIndex = '65001';
        e.style.position = 'fixed';
        e.style.borderBottom = '1px solid #000';
        e.style.top = '0px';
        e.style.left = '0px';
        e.style.height = '24px';
        e.style.lineHeight = '24px';
        e.style.width = '100%';
        e.style.background = '#ccc';
        e.style.padding = '1px 10px 1px 4px';
        e.style.color = '#333';
        e.style.opacity = this.settings.get('opacity');

        // Style tweaks.
        p = D.createElement('style');
        p.type = 'text/css';
        p.textContent = 'body { margin-top: 24px; } #dock { top: 24px; }';
        e.appendChild(p);

        // Close button.
        x = D.createElement('a');
        x.href = '#';
        x.textContent = 'X';
        x.onclick = function() { scope.hide(scope); return false; };
        p = D.createElement('div');
        p.style.cssFloat = 'right';
        p.style.marginRight = '8px';
        p.appendChild(D.createTextNode('['));
        p.appendChild(x);
        p.appendChild(D.createTextNode(']'));
        e.appendChild(p);

        // Loading pic.
        p = D.createElement('div');
        p.style.visibility = 'hidden';
        p.style.marginRight = '4px';
        p.style.lineHeight = '24px';
        p.style.cssFloat = 'right';
        p.id = this.loadingid;
        loading_pic = D.createElement('img');
        loading_pic.src = this.M.cfg.loadingicon;
        loading_pic.style.verticalAlign = 'text-bottom';
        p.appendChild(loading_pic);
        e.appendChild(p);

        // Purge cache.
        p = document.createElement('a');
        p.href = '#';
        p.textContent = 'Purge cache';
        p.onclick = function() { scope.purge_cache(scope, false, false); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode(' ('));
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'H';
        p.title = 'Hard refresh';
        p.onclick = function() { scope.purge_cache(scope, true, false); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode('|'));
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'N';
        p.title = 'No refresh';
        p.onclick = function() { scope.purge_cache(scope, false, true); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode(')'));

        // Separator
        e.appendChild(D.createTextNode(' | '));

        // Login
        e.appendChild(D.createTextNode('Login as: '));
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'admin';
        p.onclick = function () { scope.login(scope, 'admin'); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode(' - '));
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'teacher';
        p.onclick = function () { scope.login(scope, 'teacher'); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode(' - '));
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'student';
        p.onclick = function () { scope.login(scope, 'student'); return false; };
        e.appendChild(p);

        // Separator.
        e.appendChild(D.createTextNode(' | '));

        // Courses.
        e.appendChild(D.createTextNode('Course: '));
        p = D.createElement('a');
        p.href = this.M.cfg.wwwroot + '/course/index.php';
        p.textContent = 'list';
        e.appendChild(p);
        e.appendChild(D.createTextNode(' - '));
        p = D.createElement('a');
        p.href = this.M.cfg.wwwroot + '/course/edit.php?category=1';
        p.textContent = 'add';
        e.appendChild(p);

        // Separator.
        e.appendChild(D.createTextNode(' | '));

        // Breadcrumb.
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'Breadcrumb';
        p.onclick = this.breadcrumb;
        e.appendChild(p);

        // Separator
        e.appendChild(D.createTextNode(' | '));

        // Switch language.
        var select = D.createElement('select');
        var option = D.createElement('option');
        option.value = '';
        option.text = 'Lang';
        select.appendChild(option);
        var langs = this.settings.get('langs');
        for (var i = 0; i < langs.length; i++) {
            option = D.createElement('option');
            option.value = langs[i].replace('*', '');
            option.text = langs[i];
            option.selected = (document.getElementsByTagName('html')[0].lang == option.value) ? 'selected' : '';
            select.appendChild(option);
        }
        select.onchange = function() {
            if (!this.value) {
                return;
            }
            var loc = D.location;
            var search = loc.search.replace(/&?lang=[a-z]+/, '');
            if (!loc.origin) {
                loc.origin = loc.protocol + '//' + loc.hostname;
            }
            var url = loc.origin + loc.pathname + search;
            url += search !== '' ? '&' : '?';
            url += 'lang=' + this.value;
            D.location.href = url;
        };
        e.appendChild(select);

        // Separator.
        e.appendChild(D.createTextNode(' | '));

        // Switch themes.
        select = D.createElement('select');
        option = D.createElement('option');
        option.value = '';
        option.text = 'Themes';
        select.appendChild(option);
        var themes = this.settings.get('themes');
        for (i = 0; i < themes.length; i++) {
            option = D.createElement('option');
            option.value = themes[i];
            option.text = themes[i];
            option.selected = (this.M.cfg.theme == option.value) ? 'selected' : '';
            select.appendChild(option);
        }
        select.onchange = function() {
            if (!this.value) {
                return;
            }
            var loc = document.location;
            var search = loc.search.replace(/&?theme=[a-z0-9]+/, '');
            if (!loc.origin) {
                loc.origin = loc.protocol + '//' + loc.hostname;
            }
            var url = loc.origin + loc.pathname + search;
            url += search !== '' ? '&' : '?';
            url += 'theme=' + this.value;
            document.location.href = url;
        };
        e.appendChild(select);

        // Add toolbar menu.
        B.insertBefore(e, B.firstChild);

    },

    breadcrumb: function() {
        var node = document.getElementsByClassName('breadcrumb')[0];
        if (node && node.firstChild) {
            if (node.firstChild.classList.toString().match('accesshide')) {
                node.removeChild(node.firstChild);
            }
            var breadcrumb = node.textContent;
            window.prompt('Copy the breadcrumb', breadcrumb.replace(new RegExp(/ \//g), ''));
        }
        return false;
    },

    hide: function(scope) {
        document.body.removeChild(document.getElementById(scope.id));
        return false;
    },

    loading: function(show) {
        var i = document.getElementById(this.loadingid);
        if (show) {
            i.style.visibility = 'visible';
        } else {
            i.style.visibility = 'hidden';
        }
    },

    login: function(scope, mode) {
        if (typeof(mode) === 'undefined') { mode = 'admin'; }

        var submit_form = function(doc, mode) {
            var login = '';
            var password = '';
            if (mode == 'student') {
                login = scope.settings.get('student_prefix') + parseInt(Math.random() * parseInt(scope.settings.get('student_count'), 10) + 1, 10);
                password = scope.settings.get('student_password');
            } else if (mode == 'teacher') {
                login = scope.settings.get('teacher_prefix') + parseInt(Math.random() * parseInt(scope.settings.get('teacher_count'), 10) + 1, 10);
                password = scope.settings.get('teacher_password');
            } else {
                login = scope.settings.get('admin_login');
                password = scope.settings.get('admin_password');
            }
            doc.getElementById('username').value = login;
            doc.getElementById('password').value = password;
            doc.getElementById('login').submit();
        };

        var login_iframe = function(mode) {
            if (document.getElementById(scope.loginid)) {
                document.body.removeChild(document.getElementById(scope.loginid));
            }
            var el = document.createElement('iframe');
            el.id = scope.loginid;
            el.src = scope.M.cfg.wwwroot + '/login/index.php';
            el.onload = function() {
                var frame = document.getElementById(scope.loginid);
                if (!frame) {
                    return;
                }
                var frameD;
                if (!!frame.contentWindow) {
                    frameD = frame.contentWindow.document;
                } else {
                    frameD = frame.contentDocument;
                }
                frame.onload = function() { loggedin(false); };
                submit_form(frameD, mode);
            };
            el.style.cssText = 'display: none;';
            document.body.appendChild(el);
        };

        var loggedin = function(noreload) {
            frame = document.getElementById(scope.loginid);
            if (!frame) {
                return;
            }
            document.body.removeChild(frame);
            if (!noreload) {
                window.location.reload();
            } else {
                scope.loading(false);
            }
        };

        scope.loading(true);
        var logininfo = document.getElementsByClassName('logininfo')[0].children;
        // If there are two children, means two links, we are probably logged in.
        if (logininfo.length >= 2) {
            var el = document.createElement('iframe');
            el.id = scope.loginid;
            el.src = scope.M.cfg.wwwroot + '/login/logout.php?sesskey=' + scope.M.cfg.sesskey;
            el.onload = function() { login_iframe(mode); };
            el.style.cssText = 'display: none;';
            document.body.appendChild(el);
        } else if (document.location.pathname.search(/\/login\/index\.php/) >= 0) {
            submit_form(document, mode);
        } else {
            login_iframe(mode);
        }

        return false;
    },

    purge_cache: function(scope, hardreload, noreload) {
        scope.loading(true);
        var el = document.createElement('iframe');
        el.id = scope.purgeid;
        el.src = scope.M.cfg.wwwroot + '/admin/purgecaches.php?confirm=1&sesskey=' + scope.M.cfg.sesskey;
        el.style.cssText = 'display: none;';
        el.onload = function() {
            var i, id;
            scope.loading(false);
            i = document.getElementById(scope.purgeid);
            if (i.contentWindow) {
                id = i.contentWindow.document;
            } else {
                id = i.contentDocument;
            }
            if (id.location.pathname.match(/login\/index\.php/) || id.body.textContent.match('accessdenied')) {
                alert('Could not purge cache.\nLogin as admin first.');
            } else {
                if (!noreload) {
                    window.location.reload(hardreload);
                }
            }
            document.body.removeChild(document.getElementById(scope.purgeid));
        };
        document.body.appendChild(el);
        return false;
    }

};

// Getting the window.
if (!!window.opera) {
    unsafeWindow = window;
} else if (!!window.navigator.vendor.match(/Google/)) {
    var div = document.createElement('div');
    div.setAttribute('onclick', 'return window;');
    unsafeWindow = div.onclick();
}

// TODO Do not init and destroy mdkToolbar when not on Moodle site.
mdkToolbar.init(unsafeWindow);

if (self && self.port && self.port.on) {
    // Firefox extension specific.
    self.port.on("loadConfig", function(options) {
        mdkToolbar.settings.load(options);
        mdkToolbar.display();
    });
} else {
    // Greasemonkey fallback.
    mdkToolbar.display();
}
