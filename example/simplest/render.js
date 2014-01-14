var h = require('hyperscript');

module.exports = function (row) {
    return h('div.cat', { 'data-key': row.key }, row.value.name);
};
