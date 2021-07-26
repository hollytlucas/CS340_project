const handleBarsHelpers = {
  isEven: function (idx) {
    if (idx % 2 === 0) {
      return true;
    }
    return false;
  },
  isSelected: function (option, valueFromDatabase) {
    return option.toString() === valueFromDatabase.toString() ? "selected" : "";
  },
  isChecked: function (value) {
    return value ? "checked" : "";
  },
  isCurrentRoute: function (route, currentRoute) {
    return route === currentRoute ? " w3-grayscale-max" : "";
  },
  concat: function (...args) {
    return args.slice(0, args.length - 1).join("");
  },
  join: function (arr, separator) {
    return arr.join(separator);
  },
};

module.exports = {
  handleBarsHelpers,
};
