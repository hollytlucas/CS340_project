const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders orders list (/orders):
router.get("", function (req, res, next) {
  const selectQuery = `
  SELECT o.order_id, o.order_created_at, o.total_price, o.waiter_id,  
    mi.menu_item_id, mi.name AS menu_item_name, c.first_name AS customer_first_name, 
    c.last_name AS customer_last_name, w.first_name AS waiter_first_name,
    w.last_name AS waiter_last_name FROM orders o
	  LEFT JOIN menu_items_orders mio ON o.order_id = mio.order_id
    LEFT JOIN menu_items mi ON mio.menu_item_id = mi.menu_item_id
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN waiters w ON o.waiter_id = w.waiter_id
    ORDER BY o.order_id
    `;
  const waitersQuery = `SELECT * FROM waiters`;

  db.pool.query(selectQuery, function (error, rows, fields) {
    const orders = rows;
    if (error) {
      return next(error);
    }
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
      if (error) {
        return next(error);
      }
      return res.render("orders", {
        orders: condensedOrders,
        waiters: waiters,
      });
    });
  });
});

// renders the "add order" form
router.get("/new", function (req, res, next) {
  const waitersQuery = `SELECT * FROM waiters`;
  const customersQuery = `SELECT * FROM customers`;
  const menuItemsQuery = `SELECT * FROM menu_items`;

  db.pool.query(waitersQuery, function (error, rows, fields) {
    let waiters = rows;
    if (error) {
      return next(error);
    }
    db.pool.query(customersQuery, function (error, rows, fields) {
      let customers = rows;
      if (error) {
        return next(error);
      }
      db.pool.query(menuItemsQuery, function (error, rows, fields) {
        let menuItems = rows;
        if (error) {
          return next(error);
        }
        res.render("orders/new", { waiters, customers, menuItems });
      });
    });
  });
});

// receives the form submission of the "add order" form
router.post("/new", function (req, res, next) {
  const totalPrice = req.body["input-total-price"];
  const waiterId = req.body["input-waiter-name"].split(": waiter ")[1];
  const customerId = req.body["input-customer-name"].split(": customer ")[1];

  function getMenuIds(data) {
    let menuItemsWithHyphens = Object.keys(data).filter((key) =>
      key.includes("menuItem-")
    );
    let menuItemsWithoutHyphens = menuItemsWithHyphens.map((menuItem) =>
      parseInt(menuItem.replace("menuItem-", ""))
    );
    return menuItemsWithoutHyphens;
  }

  let menuItemIds = getMenuIds(req.body);

  const selectOrdersQuery = `SElECT * FROM orders`;

  const insertOrderQuery = `INSERT INTO orders (total_price, waiter_id, customer_id) VALUES (${totalPrice}, ${waiterId}, ${customerId})`;

  db.pool.query(insertOrderQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    db.pool.query(selectOrdersQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      const orderId = rows[rows.length - 1].order_id;
      const menuItemIdOrderIdTuples = menuItemIds
        .map((menuItemId) => `(${orderId}, ${menuItemId})`)
        .join(",");

      const menuItemsOrdersQuery = `INSERT INTO menu_items_orders (order_id, menu_item_id) VALUES ${menuItemIdOrderIdTuples}`;
      // TODO: Update units sold on menu items included in order
      db.pool.query(menuItemsOrdersQuery, function (error, rows, fields) {
        if (error) {
          return next(error);
        }
        res.redirect("/orders");
      });
    });
  });
});

//renders the edit form
router.get("/:id/edit", function (req, res, next) {
  const selectQuery = `SELECT * FROM orders WHERE order_id=${req.params.id}`;
  const waitersQuery = `SELECT * FROM waiters`;
  const customersQuery = `SELECT * FROM customers`;
  const menuItemsQuery = `SELECT * FROM menu_items`;
  const menuItemsOrdersQuery = `SELECT menu_item_id FROM menu_items_orders WHERE order_id = ${req.params.id}`;

  db.pool.query(selectQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    const order = rows[0];
    // query for waiters and customers to propagate drop downs
    db.pool.query(waitersQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      let waiters = rows;
      db.pool.query(customersQuery, function (error, rows, fields) {
        if (error) {
          return next(error);
        }
        const customers = rows;
        // query for menu items to propagate check boxes
        db.pool.query(menuItemsQuery, function (error, rows, fields) {
          if (error) {
            return next(error);
          }
          let menuItems = rows;
          db.pool.query(menuItemsOrdersQuery, function (error, rows, fields) {
            if (error) {
              return next(error);
            }
            // make array of just the menuItemIDs
            const menuItemsOrders = rows.map(
              (menuItemOrder) => menuItemOrder.menu_item_id
            );
            menuItems = menuItems.map((menuItem) => {
              menuItem.isOnOrder = menuItemsOrders.includes(
                menuItem.menu_item_id
              );
              return menuItem;
            });
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
});

router.post("/:id/edit", function (req, res, next) {
  // TODO: Update units sold on menu items included in order
  const orderId = req.params.id;
  const totalPrice = req.body["input-order-price"];
  const waiterId = req.body["input-waiter-name"].split(": waiter ")[1];
  const customerId = req.body["input-customer-name"].split(": customer ")[1];

  const updateOrderQuery = `
    UPDATE orders SET total_price = '${totalPrice}', waiter_id = ${waiterId}, customer_id = ${customerId} 
      WHERE order_id = ${orderId}`;

  // handle assigning menu items

  // first parse from the body and just extract the menu item Ids that are checked
  const menuItemIds = Object.keys(req.body)
    .filter((key) => key.includes("menuItem-"))
    .map((menuItemKey) => parseInt(menuItemKey.replace("menuItem-", "")));

  // first delete
  const deleteMenuItemsOrdersQuery = `DELETE FROM menu_items_orders WHERE order_id = ${orderId}`;

  // then insert
  const menuItemIdOrderIdTuples = menuItemIds
    .map((menuItemId) => `(${orderId}, ${menuItemId})`)
    .join(",");
  const insertMenuItemsOrdersQuery = `INSERT INTO menu_items_orders (order_id, menu_item_id) VALUES ${menuItemIdOrderIdTuples}`;

  db.pool.query(deleteMenuItemsOrdersQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    db.pool.query(updateOrderQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      db.pool.query(insertMenuItemsOrdersQuery, function (error, rows, fields) {
        if (error) {
          return next(error);
        }
        res.redirect("/orders");
      });
    });
  });
});

// receives the submission of the "delete order" button
router.get("/:id/delete", function (req, res, next) {
  const orderId = req.params.id;
  const deleteMenuItemsOrdersQuery = `DELETE FROM menu_items_orders WHERE order_id = ${orderId}`;
  const deleteOrderQuery = `DELETE FROM orders WHERE order_id = ${orderId}`;

  // TODO: Update units sold on menu items included in order
  db.pool.query(deleteMenuItemsOrdersQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }

    db.pool.query(deleteOrderQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      res.redirect("/orders");
    });
  });
});

module.exports = {
  router,
};
