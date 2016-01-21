// ==UserScript==
// @match         https://moodle.org/mod/forum/discuss.php*
// @name          Add keyboard navigation to go to next thread on moodle.org
// @author        Dan Poltawski
// @homepage      http://github.com/danpoltawski/userscripts-moodle
// @namespace     http://userscripts.danpoltawski.co.uk
// @version       0.2
// ==/UserScript==

var nexturl = document.evaluate("//li[@class='next-discussion']/a[1]", document, null, XPathResult.ANY_TYPE, null).iterateNext().getAttribute('href');

if (nexturl) {
    window.addEventListener('keydown', function (e) {
        if (e.keyCode == 37) {
            // Left arrow (yep I know its oppposite to UI, but fits Dan's brain better)
            window.location.href = nexturl;
        }
    });
}

var prevurl = document.evaluate("//li[@class='prev-discussion']/a[1]", document, null, XPathResult.ANY_TYPE, null).iterateNext().getAttribute('href');

if (prevurl) {
    window.addEventListener('keydown', function (e) {
        if (e.keyCode == 39) {
            // Right arrow (yep I know its oppposite to UI, but fits Dan's brain better)
            window.location.href = prevurl;
        }
    });
}
