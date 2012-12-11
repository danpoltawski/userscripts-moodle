var onload = function() {
    // Action on each saveable elements.
    var inputs = Array.prototype.slice.call(document.getElementsByTagName('input'));
    var textareas = Array.prototype.slice.call(document.getElementsByTagName('textarea'));
    inputs = inputs.concat(textareas);
    for (var i in inputs) {
        var input = inputs[i];
        if ((input.localName == 'input' && (input.type == 'checkbox' || input.type == 'text')) ||
                (input.localName == 'textarea')) {
            // Restore the previously saved options.
            restore_option(input);
            // Add event listeners.
            input.addEventListener('change', save_option, false);
        }
    }
};

// Saves an option.
var save_option = function(e) {
    var el = e.target;
    if (el.name) {
        var val = el.value || 0;
        if (el.type == 'checkbox') {
            val = el.checked;
        }
        self.port.emit('saveOption', [el.name, val]);
    }
};

// Restore the option of an element.
var restore_option = function(el) {
    if (!el.id) {
        el.id = el.name;
    }
    self.port.emit('getOption', [el.id, el.name]);
};
self.port.on('gotOption', function(data) {
    var id = data[0];
    var val = data[1];
    var el = document.getElementById(id);
    if (!val || !el) {
        return;
    }
    if (el.type == 'checkbox') {
        el.checked = !!val;
    } else if (el.type == 'textarea') {
        el.innerText = val;
    } else {
        el.value = val;
    }
});

onload();
