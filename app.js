/*
    SETUP
*/
const path = require("path");
const { handleBarsHelpers } = require("./helpers");
const { router: ordersRouter } = require("./routes/orders");
const { router: shiftsRouter } = require("./routes/shifts");
const { router: waitersRouter } = require("./routes/waiters");
const { router: customersRouter } = require("./routes/customers");

// Express
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

PORT = 8555;

// Database
const db = require("./database/db-connector");

// Handlebars
const exphbs = require("express-handlebars");
const { query } = require("express");
app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// Helper Functions
app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    helpers: handleBarsHelpers,
  })
);
app.set("view engine", ".hbs");

// Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

/*
    ROUTES
*/

// GET ROUTES
//ROUTE FOR MAIN PAGE
app.get("/", function (req, res, next) {
  res.render("index");
});

// GET ROUTES
//ROUTE FOR MAIN PAGE
app.get("/index_private", function (req, res, next) {
  res.render("index_private");
});

// ROUTE FOR MENU ITEMS --------------------------------------------------------------------------------------------

app.get("/menu_items", function (req, res, next) {
  // Display all items on page load
  let query1 = `SELECT * FROM menu_items`;
  db.pool.query(query1, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    // Save menu items
    let items = rows;
    return res.render("menu_items", { data: items });
  });
});

// ROUTE FOR ORDERS--------------------------------------------------------------------------------------------------------------------
app.use("/orders", ordersRouter);

// ROUTE FOR SHIFTS--------------------------------------------------------------------------------------------------------------------
app.use("/shifts", shiftsRouter);

// ROUTE FOR WAITERS--------------------------------------------------------------------------------------------------------------------
app.use("/waiters", waitersRouter);

// ROUTE FOR CUSTOMERS SEARCH ORDERS

app.get("/customers_search_orders", function (req, res) {
  // If there is a query string, we run the query for searching by last name
  if (req.query.customer == undefined) {
    // select all customer_ID's to display all customer ID's on dropdown as default with every page load
    const selectCustomersInfoQuery = `SELECT * FROM customers`;
    db.pool.query(selectCustomersInfoQuery, function (error, rows, fields) {
      // Save the people
      const customersInfo = rows;
      return res.render("customers_search_orders", {
        customersInfo,
      });
    });
  } else {
    // else if user input a customer to search for all orders
    // run query to get all attributes for customers and orders for all entries for specified customer
    const getCustomerOrdersQuery = `SELECT * FROM customers c
  INNER JOIN orders o ON c.customer_id = o.customer_id WHERE c.customer_id = "${req.query.customer}"`;
    db.pool.query(getCustomerOrdersQuery, function (error, rows, fields) {
      // save the orders
      const orders = rows;
      // run query to get total charges for all orders for specified customer ID
      const getOrdersTotalQuery = `SELECT SUM(o.total_price) as total_charges FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id WHERE c.customer_id = "${req.query.customer}"`;
      db.pool.query(getOrdersTotalQuery, function (error, rows, fields) {
        // save the charges
        const charges = rows;
        const selectCustomersInfoQuery = `SELECT * FROM customers`;
        db.pool.query(selectCustomersInfoQuery, function (error, rows, fields) {
          // Save the people
          const customersInfo = rows;
          return res.render("customers_search_orders", {
            orders,
            charges,
            customersInfo,
          });
        });
      });
    });
  }
});

// ROUTE FOR CUSTOMERS PAGE

app.use("/customers", customersRouter);

// ROUTE FOR ADD MENU ITEM

//render the add menu item form
app.get("/menu_items/new", function (req, res, next) {
  res.render("menu_items/new");
});

// handle submission of add menu item form
app.post("/add-menu-item-form", function (req, res, next) {
  let data = req.body; // holds body of request
  let items; // holds all menu items to be displayed

  // insert new menu item
  query1 = `INSERT INTO menu_items (name, price, is_available, number_sold) VALUES ('${data["input-name"]}', '${data["input-price"]}', '${data["is-available"]}', '${data["input-number-sold"]}')`;
  db.pool.query(query1, function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(400);
    } else {
    }
  });

  // get all menu items to display
  query1 = `SELECT * FROM menu_items`;
  db.pool.query(query1, function (error, rows, fields) {
    // check to see if there was an error
    if (error) {
      console.log(error);
      res.sendStatus(400);
    } else {
      // save all menu items
      items = rows;
      return res.render("menu_items", { data: items });
    }
  });
});

// global error handler

app.use((error, req, res, next) => {
  res.status(500).json({
    error: error.message,
  });
});

//----------------------------------------------------------------------------------------------------------------------
/*
    LISTENER
*/
app.listen(PORT, function () {
  console.log(
    "Express started on http://localhost:" +
      PORT +
      "; press Ctrl-C to terminate."
  );
});
