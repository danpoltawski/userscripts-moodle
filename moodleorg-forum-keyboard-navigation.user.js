// ==UserScript==
// @match         https://moodle.org/mod/forum/*
// @name          Add keyboard navigation to go to next thread on modoel.org
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @version       0.1
// ==/UserScript==

var nexturl = document.evaluate("//li[@class='prev-discussion']/a[1]", document, null, XPathResult.ANY_TYPE, null).iterateNext().getAttribute('href');

if (nexturl) {
    window.addEventListener('keydown', function (e) {
        if (e.keyCode==39) {
            // Right arrow.
            window.location.href = nexturl;
        }
    });
}
