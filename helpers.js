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
  isCurrentRoute: function (route, currentRoute) {
    return route === currentRoute ? " w3-grayscale-max" : "";
  },
  concat: function (arg1, arg2) {
    str1 = arg1.toString();
    str2 = arg2.toString();
    return "str1" + "str2";
  },
};

module.exports = {
  handleBarsHelpers,
};
