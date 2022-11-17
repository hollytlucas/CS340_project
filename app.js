/*
    SETUP
*/
const path = require("path");
const { handleBarsHelpers } = require("./helpers");
const { router: ordersRouter } = require("./routes/orders");
const { router: shiftsRouter } = require("./routes/shifts");
const { router: waitersRouter } = require("./routes/waiters");
const { router: customersRouter } = require("./routes/customers");
const { router: menuItemsRouter } = require("./routes/menu_items");

// Express
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//PORT = 6719;
PORT = process.env.PORT || 3306;

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

//ROUTE FOR MAIN PAGE
app.get("/", function (req, res, next) {
  res.render("index");
});

//ROUTE FOR MAIN PAGE
app.get("/index_private", function (req, res, next) {
  res.render("index_private");
});

// ROUTE FOR MENU ITEMS --------------------------------------------------------------------------------------------
app.use("/menu_items", menuItemsRouter);

// ROUTE FOR ORDERS--------------------------------------------------------------------------------------------------------------------
app.use("/orders", ordersRouter);

// ROUTE FOR SHIFTS--------------------------------------------------------------------------------------------------------------------
app.use("/shifts", shiftsRouter);

// ROUTE FOR WAITERS-------------------------------------------------------------------------------------------------------------------
app.use("/waiters", waitersRouter);

// ROUTE FOR CUSTOMERS-----------------------------------------------------------------------------------------------------------------
app.use("/customers", customersRouter);

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
