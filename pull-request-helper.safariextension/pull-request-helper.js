var GITREPO = document.getElementById('customfield_10100-val');

if (GITREPO) {
    var MASTER = document.getElementById('customfield_10111-val');
    var MOODLE_23_STABLE = document.getElementById('customfield_11016-val');
    var MOODLE_22_STABLE = document.getElementById('customfield_10711-val');
    var MOODLE_21_STABLE = document.getElementById('customfield_10311-val');
    var MOODLE_20_STABLE = document.getElementById('customfield_10113-val');
    var MOODLE_19_STABLE = document.getElementById('customfield_10116-val');

    var parent = document.getElementById('customfieldmodule');

    var s= '<p>Integrators Cheat Sheet:</p><pre>';

    if (MASTER) {
        s+= "git checkout master\n";
        s+= 'git pull ' + GITREPO.innerText + ' ' + MASTER.innerText + "\n\n";
    }

    if (MOODLE_23_STABLE) {
        s+= "git checkout MOODLE_23_STABLE\n";
        s+= 'git pull ' + GITREPO.innerText + ' ' + MOODLE_23_STABLE.innerText + "\n\n";
    }

    if (MOODLE_22_STABLE) {
        s+= "git checkout MOODLE_22_STABLE\n";
        s+= 'git pull ' + GITREPO.innerText + ' ' + MOODLE_22_STABLE.innerText + "\n\n";
    }

    if (MOODLE_21_STABLE) {
        s+= "git checkout MOODLE_21_STABLE\n";
        s+= 'git pull ' + GITREPO.innerText + ' ' + MOODLE_21_STABLE.innerText + "\n\n";
    }

    if (MOODLE_20_STABLE) {
        s+= "git checkout MOODLE_20_STABLE\n";
        s+= 'git pull ' + GITREPO.innerText + ' ' + MOODLE_20_STABLE.innerText + "\n\n";
    }

    if (MOODLE_19_STABLE) {
        s+= "git checkout MOODLE_19_STABLE\n";
        s+= 'git pull ' + GITREPO.innerText + ' ' + MOODLE_19_STABLE.innerText + "\n\n";
    }

    // prepare div
    var integratorDiv = document.createElement('div');
    integratorDiv.innerHTML = s;
    integratorDiv.setAttribute('style', 'border-top: 1px solid #DDD;');
    parent.insertBefore(integratorDiv, document.getElementById('tabCellPane1'));
}
