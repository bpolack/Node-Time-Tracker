module.exports = {
    ifeq: function(a, b, options){ //Usage: {{#ifeq thisUrl '/about'}}active{{/ifeq}}
      if (a === b) {
        return options.fn(this);
        }
      return options.inverse(this);
    },
    select: function(selected, options) {
        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');
    }
  }