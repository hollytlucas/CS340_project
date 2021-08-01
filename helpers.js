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
  getWaiterNameOnOrder(waiters, order) {
    orderWaiter = waiters.filter(
      (waiter) => waiter.waiter_id == order.waiter_id
    )[0];
    return `${orderWaiter.first_name} ${orderWaiter.last_name}`;
  },
  getCustomerNamesOnOrder(customers, order) {
    customersOrders = customers.filter(
      (customer) => customer.customer_id == order.customer_id
    );
    let str = "";
    if (customersOrders.length > 1) {
      for (let i = 0; i < customersOrders.length; i++) {
        if (i == customersOrders.length - 1) {
          str += `${customersOrders[i].first_name} ${customersOrders[i].last_name}`;
        } else {
          str += `${customersOrders[i].first_name} ${customersOrders[i].last_name}, `;
        }
      }
    } else {
      return `${customersOrders[0].first_name} ${customersOrders[0].last_name}`;
    }
    return str;
  },
};

module.exports = {
  handleBarsHelpers,
};
