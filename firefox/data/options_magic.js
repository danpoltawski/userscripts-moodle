var onload = function(restore_only) {
    // Action on each saveable elements.
    var inputs = Array.prototype.slice.call(document.getElementsByTagName('input'));
    var textareas = Array.prototype.slice.call(document.getElementsByTagName('textarea'));
    inputs = inputs.concat(textareas);
    console.log(inputs);
    for (var i in inputs) {
        var input = inputs[i];
        if ((input.localName == 'input' && (input.type == 'checkbox' || input.type == 'text')) ||
                (input.localName == 'textarea')) {
            // Restore the previously saved options.
            restore_option(input);
            if (!restore_only) {
                // Add event listeners.
                input.addEventListener('change', save_option, false);
            }
        }
    }
};

// Saves an option.
var save_option = function(e) {
    var el = e.target;
    if (el.name) {
        var val = el.value || 0;
        if (el.type == 'checkbox' && !el.checked) {
            val = 0;
        }
        self.port.emit('saveOption', [el.name, val]);
        // localStorage[el.name] = val;
    }
};

// Restore the option of an element.
var restore_option = function(el) {
    var val = self.port.emit('getOption', el.name);
    // var val = localStorage[el.name];
    if (!val) {
        return;
    }
    if (el.type == 'checkbox') {
        elval = el.value || 0;
        el.checked = (elval == val) ? true : false;
    } else if (el.type == 'textarea') {
        el.innerText = val;
    } else {
        el.value = val;
    }
};

onload();
// window.addEventListener('load', onload, false);
