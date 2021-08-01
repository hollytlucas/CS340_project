const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders orders list (/orders):
router.get("", function (req, res) {
  const selectQuery = `
  SELECT o.order_id, o.order_created_at, o.total_price, o.waiter_id, mi.menu_item_id, mi.name AS menu_item_name, c.first_name AS customer_first_name, c.last_name AS customer_last_name FROM orders o
	  LEFT JOIN menu_items_orders mio ON o.order_id = mio.order_id
    LEFT JOIN menu_items mi ON mio.menu_item_id = mi.menu_item_id
    JOIN customers c ON o.customer_id = c.customer_id
    `;
  const waitersQuery = `SELECT * FROM waiters`;

  db.pool.query(selectQuery, function (error, rows, fields) {
    const orders = rows;
    // add a "menuItems" array to each order object
    const condensedOrders = orders.reduce((acc, order) => {
      const mostRecentOrder = acc[acc.length - 1];
      if (order.menu_item_id) {
        const menuItemName = order.menu_item_name;

        // combine menuItems for the same order into one row by grouping by
        //  the order ID
        if (mostRecentOrder && mostRecentOrder.order_id === order.order_id) {
          mostRecentOrder.menuItems.push(menuItemName);
        } else {
          order.menuItems = [menuItemName];
          acc.push(order);
        }
      } else {
        // if there are no menuItems assigned to the order, just put an empty array
        order.menuItems = [];
        acc.push(order);
      }

      return acc;
    }, []);
    db.pool.query(waitersQuery, function (error, rows, fields) {
      let waiters = rows;
      return res.render("orders", {
        orders: condensedOrders,
        waiters: waiters,
      });
    });
  });
});

// renders the "add order" form
router.get("/new", function (req, res) {
  // query for waiters to propagate drop down
  const waitersQuery = `SELECT * FROM waiters`;
  const customersQuery = `SELECT * FROM customers`;
  db.pool.query(waitersQuery, function (error, rows, fields) {
    let waiters = rows;
    db.pool.query(customersQuery, function (error, rows, fields) {
      let customers = rows;
      res.render("orders/new", { waiters, customers });
    });
  });
});

// receives the form submission of the "add order" form
router.post("/new", function (req, res) {
  // const totalPrice = req.body["total-price"];
  // const waiterId = req.body["waiter-id"];
  // const customerId = req.body["customer-id"];
  // const menuItemIds = [];

  // const insertOrderQuery = `INSERT INTO orders (total_price, waiter_id) VALUES (${totalPrice}, ${waiterId})`;

  // db.pool.query(insertOrderQuery, function (error, rows, fields) {
  //   const orderId = rows[0].order_id;
  //   const customerOrdersQuery = `INSERT INTO customers_orders (customer_id, order_id) VALUES (${customerId}, ${orderId})`;
  //   const menuItemIdOrderIdTuples = ``;
  //   const menuItemsOrdersQuery = `INSERT INTO menu_items_orders (menu_item_id, order_id) VALUES ${menuItemIdOrderIdTuples}`;
  //   // TODO: Update units sold on menu items included in order
  //   db.pool.query(customerOrdersQuery, function (error, rows, fields) {
  //     res.redirect("/orders");
  //   });
  // });
  res.redirect("/orders");
});

//renders the edit form
router.get("/:id/edit", function (req, res) {
  const selectQuery = `SELECT * FROM orders WHERE order_id=${req.params.id}`;
  const waitersQuery = `SELECT * FROM waiters`;
  const customersQuery = `SELECT * FROM customers`;
  const menuItemsQuery = `SELECT * FROM menu_items`;

  db.pool.query(selectQuery, function (error, rows, fields) {
    const order = rows[0];
    // query for waiters and customers to propagate drop downs
    db.pool.query(waitersQuery, function (error, rows, fields) {
      let waiters = rows;
      db.pool.query(customersQuery, function (error, rows, fields) {
        let customers = rows;
        // query for menu items to propagate check boxes
        db.pool.query(menuItemsQuery, function (error, rows, fields) {
          let menuItems = rows;
          res.render("orders/edit", {
            order,
            waiters,
            customers,
            menuItems,
          });
        });
      });
    });
  });
});

router.post("/:id/edit", function (req, res) {
  // TODO: Pattern match off shifts
  // TODO: Update units sold on menu items included in order
  res.redirect("/orders");
});

// receives the form submission of the "delete order" form
router.delete("/:id/delete", function (req, res) {
  const orderId = req.params.id;
  const deleteMenuItemsOrdersQuery = `DELETE FROM menu_items_orders WHERE order_id = ${orderId}`;
  const deleteCustomersOrdersQuery = `DELETE FROM customers_orders WHERE order_id = ${orderId}`;
  const deleteOrderQuery = `DELETE FROM orders WHERE order_id = ${orderId}`;
  // TODO: Update units sold on menu items included in order
  db.pool.query(deleteOrderQuery, function (error, rows, fields) {
    res.redirect("/orders");
  });
});

module.exports = {
  router,
};
