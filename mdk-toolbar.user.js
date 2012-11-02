// ==UserScript==
// @name            MDK Toolbar
// @description     Set a toolbar of shortcuts on your instances of Moodle
// @include         http://localhost/*
// @include         http://*.moodle.local/*
// @include         https://localhost/*
// @include         https://*.moodle.local/*
// @match           http://localhost/*
// @match           http://*.moodle.local/*
// @match           https://localhost/*
// @match           https://*.moodle.local/*
// @author          Frédéric Massart - FMCorz.net
// @version         0.358
// ==/UserScript==

// Configuration
var settings = {
    admin_login: 'admin',
    admin_password: 'test',
    student_prefix: 's',
    student_count: 10,
    student_password: 'test',
    teacher_prefix: 't',
    teacher_count: 3,
    teacher_password: 'test',
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
    ]
};

// Script
if (!!window.opera) {
    unsafeWindow = window;
} else if (!!window.navigator.vendor.match(/Google/)) {
    var div = document.createElement('div');
    div.setAttribute('onclick', 'return window;');
    unsafeWindow = div.onclick();
}

var M = unsafeWindow.M || undefined;
var D = document
var B = document.body

// Limit to Moodle sites
if (!!M) {

    var mdkShowLoading = function(show) {
        i = D.getElementById('mdkLoadingPic');
        if (show) {
            i.style.visibility = 'visible';
        } else {
            i.style.visibility = 'hidden';
        }
    };

    var cachePurged = function(hardreload, noreload) {
        mdkShowLoading(false);
        i = D.getElementById('mdkPurgeCacheiFrame')
        if (i.contentWindow) {
            id = i.contentWindow.document;
        } else {
            id = i.contentDocument;
        }
        if (id.body.textContent.match('accessdenied')) {
            alert('Could not purge cache.\nLogin as admin first.');
        } else {
            if (!noreload) {
                window.location.reload(hardreload);
            }
        }
        B.removeChild(D.getElementById('mdkPurgeCacheiFrame'));
    };
    var purgeCache = function(hardreload, noreload) {
        if (typeof(hardreload) === 'undefined') { hardreload = false };
        if (typeof(noreload) === 'undefined') { noreload = false };
        if (D.getElementById('mdkPurgeCacheiFrame')) {
            return false;
        }
        mdkShowLoading(true);
        var el = document.createElement('iframe');
        el.id = 'mdkPurgeCacheiFrame';
        el.src = M.cfg.wwwroot + '/admin/purgecaches.php?confirm=1&sesskey=' + M.cfg.sesskey;
        el.onload = function() { cachePurged(hardreload, noreload); };
        el.style.cssText = 'display: none;';
        document.body.appendChild(el);
        return false;
    };

    var mdkAfterDoLogin = function(noreload) {
        loginFrame = D.getElementById('mdkLoginiFrame');
        if (!loginFrame) {
            return;
        }
        B.removeChild(D.getElementById('mdkLoginiFrame'));
        mdkShowLoading(false);
        if (!noreload) {
            window.location.reload();
        }
    };
    var mdkDoLogin = function(mode) {
        loginFrame = D.getElementById('mdkLoginiFrame')
        if (!loginFrame) {
            return;
        }
        if (!!loginFrame.contentWindow) {
            loginFrameD = loginFrame.contentWindow.document;
        } else {
            loginFrameD = loginFrame.contentDocument;
        }
        loginFrame.onload = function() { mdkAfterDoLogin(false); }
        var login = '';
        var password = '';
        if (mode == 'student') {
            login = settings.student_prefix + parseInt(Math.random() * settings.student_count + 1);
            password = settings.student_password;
        } else if (mode == 'teacher') {
            login = settings.teacher_prefix + parseInt(Math.random() * settings.teacher_count + 1);
            password = settings.teacher_password;
        } else {
            login = settings.admin_login;
            password = settings.admin_password;
        }
        loginFrameD.getElementById('username').value = login;
        loginFrameD.getElementById('password').value = password;
        loginFrameD.getElementById('login').submit();
    };
    var mdkLogin = function(mode) {
        if (typeof(mode) === 'undefined') { mode = 'admin' };
        mdkShowLoading(true);

        var loginMethod = function(mode) {
            var el = document.createElement('iframe');
            el.id = 'mdkLoginiFrame';
            el.src = M.cfg.wwwroot + '/login/index.php';
            el.onload = function() { mdkDoLogin(mode); };
            el.style.cssText = 'display: none;';
            document.body.appendChild(el);
        }

        logininfo = D.getElementsByClassName('logininfo')[0].children;
        // If there are two children, means two links, we are probably logged in.
        if (logininfo.length >= 2) {
            var el = document.createElement('iframe');
            el.id = 'mdkLogoutiFrame';
            el.src = M.cfg.wwwroot + '/login/logout.php?sesskey=' + M.cfg.sesskey;
            el.onload = function() { loginMethod(mode); };
            el.style.cssText = 'display: none;';
            document.body.appendChild(el);
        } else {
            loginMethod();
        }

        return false;
    };

    // Breadcrumb function
    var mdkBreadCrumb = function() {
        node = document.getElementsByClassName('breadcrumb')[0];
        if (node && node.firstChild) {
            if (node.firstChild.classList.toString().match('accesshide')) {
                node.removeChild(node.firstChild);
            }
            breadcrumb = node.textContent;
            window.prompt('Copy the breadcrumb', breadcrumb.replace(new RegExp(/ \//g), ''));
        }
    }

    function displayMenu() {

        // Menu
        e = D.createElement('div');
        e.style.zIndex = '65001';
        e.style.position = 'fixed';
        e.style.borderBottom = '1px solid #000';
        e.style.top = '0px';
        e.style.left = '0px';
        e.style.height = '24px';
        e.style.width = '100%';
        e.style.background = '#ccc';
        e.style.padding = '1px 4px';
        e.style.color = '#333';
        // Margin the body because menu is fixed
        D.body.style.marginTop = '24px';

        // Loading pic
        loading_pic = D.createElement('img');
        loading_pic.src = M.cfg.loadingicon;
        loading_pic.id = 'mdkLoadingPic';
        loading_pic.style.verticalAlign = 'text-bottom';
        loading_pic.style.visibility = 'hidden';
        loading_pic.style.cssFloat = 'right';
        loading_pic.style.marginRight = '5px';
        e.appendChild(loading_pic);

        // Purge cache
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'Purge cache';
        p.onclick = purgeCache;
        e.appendChild(p);
        e.appendChild(D.createTextNode(' ('))
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'H';
        p.title = 'Hard refresh';
        p.onclick = function() { purgeCache(true, false); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode('|'))
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'N';
        p.title = 'No refresh';
        p.onclick = function() { purgeCache(false, true); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode(')'))

        // Separator
        e.appendChild(D.createTextNode(' | '))

        // Login
        e.appendChild(D.createTextNode('Login as: '))
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'admin';
        p.onclick = function () { mdkLogin('admin'); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode(' - '))
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'teacher';
        p.onclick = function () { mdkLogin('teacher'); return false; };
        e.appendChild(p);
        e.appendChild(D.createTextNode(' - '))
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'student';
        p.onclick = function () { mdkLogin('student'); return false; };
        e.appendChild(p);

        // Separator
        e.appendChild(D.createTextNode(' | '))

        // Courses
        e.appendChild(D.createTextNode('Course: '))
        p = D.createElement('a');
        p.href = M.cfg.wwwroot + '/course/index.php';
        p.textContent = 'list';
        e.appendChild(p);
        e.appendChild(D.createTextNode(' - '))
        p = D.createElement('a');
        p.href = M.cfg.wwwroot + '/course/edit.php?category=1';
        p.textContent = 'add';
        e.appendChild(p);

        // Separator
        e.appendChild(D.createTextNode(' | '));

        // Breadcrumb
        p = D.createElement('a');
        p.href = '#';
        p.textContent = 'Breadcrumb';
        p.onclick = function () { mdkBreadCrumb(); return false; };
        e.appendChild(p);

        // Separator
        e.appendChild(D.createTextNode(' | '));

        // Switch themes
        var select = D.createElement('select');
        var option = D.createElement('option');
        option.value = '';
        option.text = 'Themes';
        select.appendChild(option);
        for (var i = 0; i < settings.themes.length; i++) {
            option = D.createElement('option');
            option.value = settings.themes[i];
            option.text = settings.themes[i];
            select.appendChild(option);
        };
        select.onchange = function() {
            if (!this.value) {
                return;
            }
            var loc = document.location;
            var url = loc.href.replace(/&?theme=[a-z0-9]+/, '');
            url += loc.search != '' ? '&' : '?';
            url += 'theme=' + this.value;
            document.location.href = url;
        };
        e.appendChild(select);

        // Add toolbar menu
        B.insertBefore(e, B.firstChild);

    }

    displayMenu();

}
