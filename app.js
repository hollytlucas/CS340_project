/*
    SETUP
*/
const path = require("path");
const { handleBarsHelpers } = require("./helpers");
const { router: ordersRouter } = require("./routes/orders");
const { router: shiftsRouter } = require("./routes/shifts");
const {
  router: customersPrivateRouter,
} = require("./routes/customers_private");

// Express
var express = require("express");
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

PORT = 8555;

// Database
var db = require("./database/db-connector");

// Handlebars
var exphbs = require("express-handlebars");
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
app.get("/", function (req, res) {
  res.render("index");
});

// GET ROUTES
//ROUTE FOR MAIN PAGE
app.get("/index_private", function (req, res) {
  res.render("index_private");
});

// ROUTE FOR WAITERS

// ROUTE FOR WAITERS
app.get("/waiters", function (req, res) {
  let query1;
  let query2;
  let data = req.query;
  let waiters; //holds all the waiter ID's
  let remove_shift; //holds all shift ID's belonging to a waiter that can be removed
  let add_shift; //holds all shift ID's belonging to a waiter that can be added
  let shifts; //holds all shift ID's available
  let remove = false; //if selected shift ID can be removed
  let add = false; //if selected shift ID can be added
  let no_shift_change = false; //if user selected no shift change

  // get all waiter IDs, this will be populated in the modify waiters form whenever the page is loaded
  query2 = `SELECT waiter_id FROM waiters`;
  // Run the second query
  db.pool.query(query2, (error, rows, fields) => {
    if (error) {
    } else {
      waiters = rows;
    }
  });

  // Query 2 - select all shift ID's
  query2 = `SELECT shift_id FROM shifts`;
  // Run query
  db.pool.query(query2, (error, rows, fields) => {
    //assign shift ID's list to shifts
    shifts = rows;
  });

  // if user chose to remove an assigned shift, get all available shifts to remove
  if (data["switch-one"] == "remove") {
    //if switch-one is "remove", get all shift ID's that belong to waiter
    query2 = `SELECT s.shift_id FROM waiters w
    INNER JOIN shifts_waiters sw ON w.waiter_id = sw.waiter_id
    INNER JOIN shifts s ON sw.shift_id = s.shift_id WHERE w.waiter_id = '${data["input-id"]}'`;
    db.pool.query(query2, (error, rows, fields) => {
      remove_shift = rows;
      //set remove to true
      remove = true;
    });
  }

  // if user chose not to modify assigned shifts
  if (data["switch-one"] == "none") {
    // assign true for no shift change
    no_shift_change = true;
  }

  // if user chose to add an assigned shift
  if (data["switch-one"] == "add") {
    //get all shift ID's
    add_shift = shifts;
    //set add to true
    add = true;
  }

  // if waiter_id is submitted, user has selected a waiter to modify
  if (data["input-id"] != undefined) {
    // run a query to select all attributes of waiter with waiter id input by user
    query2 = `SELECT * FROM waiters WHERE waiter_id = '${data["input-id"]}'`;
    db.pool.query(query2, (error, rows, fields) => {
      if (error) {
        // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
        console.log("here is the error", error);
        res.sendStatus(400);
      } else {
        // assign all attributes of waiter to modify to mod_waiter
        mod_waiter = rows;

        // select all shift ID's
        query2 = `SELECT shift_id FROM shifts`;
        db.pool.query(query2, (error, rows, fields) => {
          //assign shift ID's list to shifts
          shifts = rows;
        });

        // return attributes to page to populate for modification
        return res.render("waiters", {
          mod_waiter: mod_waiter,
          waiters: waiters,
          remove_shift: remove_shift,
          shifts: shifts,
          remove: remove,
          add: add,
          add_shift: add_shift,
          no_shift_change: no_shift_change,
        });
      }
    });
  }

  // If no ID was selected (page loading for first time) or ALL was selected, we run the query to select ALL waiters-shifts to display
  if (data["input-shift"] === undefined || data["input-shift"] == "ALL") {
    query1 = `SELECT * FROM waiters w
    INNER JOIN shifts_waiters sw ON w.waiter_id = sw.waiter_id
    INNER JOIN shifts s ON sw.shift_id = s.shift_id
    ORDER BY w.last_name ASC`;
    // run query to get all waiters and their assigned shifts to display
    db.pool.query(query1, function (error, rows, fields) {
      // Save the people
      let people = rows;

      // Query 2 - select all shift ID's
      query2 = `SELECT shift_id FROM shifts`;
      // Run query
      db.pool.query(query2, (error, rows, fields) => {
        //assign shift ID's list to shifts
        shifts = rows;

        query2 = `SELECT waiter_id FROM waiters`;
        // Run the second query
        db.pool.query(query2, (error, rows, fields) => {
          if (error) {
          } else {
            waiters = rows;

            return res.render("waiters", {
              data: people,
              shifts: shifts,
              waiters: waiters,
              remove_shift: remove_shift,
            });
          }
        });
      });
    });
  }

  // otherwise a particular shift ID was selected, run a query for that shift ID to display all waiters on that shift
  else if (data["input-shift"] != undefined) {
    query1 = `SELECT * FROM waiters w INNER JOIN shifts_waiters sw ON w.waiter_id = sw.waiter_id 
    INNER JOIN shifts s ON sw.shift_id = s.shift_id WHERE s.shift_id = '${data["input-shift"]}' ORDER BY w.last_name ASC`;
    db.pool.query(query1, function (error, rows, fields) {
      // Save the waiters
      let people = rows;
      return res.render("waiters", {
        data: people,
        shifts: shifts,
        waiters: waiters,
        remove_shift: remove_shift,
      });
    });
  }
});

// ROUTE FOR MENU ITEMS --------------------------------------------------------------------------------------------

app.get("/menu_items", function (req, res) {
  // Display all items on page load
  let query1 = `SELECT * FROM menu_items`;
  db.pool.query(query1, function (error, rows, fields) {
    // Save menu items
    let items = rows;
    return res.render("menu_items", { data: items });
  });
});

//need to delete if Kelley is not using
app.post("/add-person-form", function (req, res) {
  // Capture the incoming data and parse it back to a JS object
  let data = req.body;

  // Capture NULL values
  let homeworld = parseInt(data["input-homeworld"]);
  if (isNaN(homeworld)) {
    homeworld = "NULL";
  }

  let age = parseInt(data["input-age"]);
  if (isNaN(age)) {
    age = "NULL";
  }

  // Create the query and run it on the database
  query1 = `INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES ('${data["input-fname"]}', '${data["input-lname"]}', ${homeworld}, ${age})`;
  db.pool.query(query1, function (error, rows, fields) {
    // Check to see if there was an error
    if (error) {
      // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
      console.log(error);
      res.sendStatus(400);
    }

    // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
    // presents it on the screen
    else {
      res.redirect("/");
      //res.redirect('/xxxx');
    }
  });
});
// ROUTE FOR ORDERS--------------------------------------------------------------------------------------------------------------------
app.use("/orders", ordersRouter);

// ROUTE FOR SHIFTS--------------------------------------------------------------------------------------------------------------------
app.use("/shifts", shiftsRouter);

// ROUTE FOR CUSTOMERS-------------------------------------------------------------------------------------------------------

// ROUTE FOR CUSTOMERS PUBLIC-------------------------------------------------------------------------------------------------------

// ROUTE FOR CUSTOMERS PUBLIC-------------------------------------------------------------------------------------------------------

app.get("/customers_search", function (req, res) {
  // Declare Query 1
  let query1;
  let charges;
  let orders;
  let customer_ids;

  // select all customer_ID's to display all customer ID's on dropdown as default with every page load
  query1 = `SELECT customer_id FROM customers`;
  db.pool.query(query1, function (error, rows, fields) {
    // Save the people
    customer_ids = rows;
    // Run the second query
  });

  // If there is a query string, we run the query for searching by last name
  if (req.query.lname != undefined) {
    // run query to select all customers with last name like user input
    query1 = `SELECT * FROM customers WHERE last_name LIKE "${req.query.lname}%"`;
    db.pool.query(query1, function (error, rows, fields) {
      // save customers
      let customers = rows;
      return res.render("customers_search", {
        customers: customers,
        customer_ids: customer_ids,
      });
    });
  }

  // else if user input a customer ID to search for all orders
  else if (req.query.customer != undefined) {
    // run query to get all attributes for customers and orders for all entries for specified customer ID
    query1 = `SELECT * FROM customers c
    INNER JOIN customers_orders co ON c.customer_id = co.customer_id
    INNER JOIN orders o ON co.order_id = o.order_id WHERE c.customer_id = "${req.query.customer}%"`;
    db.pool.query(query1, function (error, rows, fields) {
      // save the orders
      orders = rows;
      // run query to get total charges for all orders for specified customer ID
      query1 = `SELECT SUM(o.total_price) as total_charges FROM customers c
      INNER JOIN customers_orders co ON c.customer_id = co.customer_id
      INNER JOIN orders o ON co.order_id = o.order_id WHERE c.customer_id = "${req.query.customer}%"`;
      db.pool.query(query1, function (error, rows, fields) {
        // save the charges
        charges = rows;
        return res.render("customers_search", {
          orders: orders,
          charges: charges,
          customer_ids: customer_ids,
        });
      });
    });
  } else {
    // otherwise populate customer ID's into dropdown
    query1 = `SELECT customer_id FROM customers`;
    db.pool.query(query1, function (error, rows, fields) {
      // Save the people
      customer_ids = rows;
      // Run the second query
      console.log("this is cust id ", customer_ids);
      return res.render("customers_search", { customer_ids: customer_ids });
    });
  }
});

// ROUTE FOR CUSTOMERS EMPLOYEE ONLY

app.use("/customers_private", customersPrivateRouter);

// ROUTE FOR ADD PERSON (NEED TO DELETE)

app.post("/add-person-form", function (req, res) {
  // Capture the incoming data and parse it back to a JS object
  let data = req.body;

  // Capture NULL values
  let homeworld = parseInt(data["input-homeworld"]);
  if (isNaN(homeworld)) {
    homeworld = "NULL";
  }

  let age = parseInt(data["input-age"]);
  if (isNaN(age)) {
    age = "NULL";
  }

  // Create the query and run it on the database
  query1 = `INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES ('${data["input-fname"]}', '${data["input-lname"]}', ${homeworld}, ${age})`;
  db.pool.query(query1, function (error, rows, fields) {
    // Check to see if there was an error
    if (error) {
      // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
      console.log(error);
      res.sendStatus(400);
    }

    // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
    // presents it on the screen
    else {
      res.redirect("/");
      //res.redirect('/xxxx');
    }
  });
});

// ROUTE FOR ADD WAITER -----------------------------------------------------------------------------------------------------------------
app.post("/add-waiter-form", function (req, res) {
  // Capture the incoming data and parse it back to a JS object
  let data = req.body; // holds body of request
  let no_assigned_shift = false; // no assigned shift needs to flag error (all waiters must have a shift)

  // if assigned shift not selected, render website with error
  if (data["input-assigned-shift"] == "") {
    console.log("shift not added");
    no_assigned_shift = true;
    res.render("waiters", { no_assigned_shift: no_assigned_shift });
  } else {
    // insert new waiter into waiters table
    query1 = `INSERT INTO waiters (first_name, last_name, phone_number, shift_type_preference) VALUES ('${data["input-fname"]}', '${data["input-lname"]}', '${data["input-phone"]}', '${data["input-shift"]}')`;
    db.pool.query(query1, function (error, rows, fields) {
      // Check to see if there was an error
      if (error) {
        console.log(error);
        res.sendStatus(400);
      } else {
        // get the last waiter ID created
        query1 = `select max(waiter_id) as last_id from waiters`;
        db.pool.query(query1, function (error, rows, fields) {
          if (error) {
            console.log(error);
            res.sendStatus(400);
          } else {
            // insert new entry into shifts_waiters consolidated table
            let new_id = rows[0];
            query1 = `INSERT INTO shifts_waiters (waiter_id, shift_id) VALUES ('${new_id["last_id"]}', '${data["input-assigned-shift"]}')`;
            db.pool.query(query1, function (error, rows, fields) {
              if (error) {
                console.log(error);
                res.sendStatus(400);
              } else {
                res.redirect("/waiters");
              }
            });
          }
        });
      }
    });
  }
});
//  ROUTE FOR MODIFY WAITER --------------------------------------------------------------------------------------------------------
app.post("/modify-waiter-form", function (req, res) {
  let shifts; // holds all shift ID's
  let waiters; // holds all waiter ID's
  let query2;
  cant_delete = false; // holds flag to notify user shift cannot be deleted
  count = 0; // holds the counter to determine whether comma needs to be inserted when building query string

  // get all shift ID's
  query2 = `SELECT shift_id FROM shifts`;
  db.pool.query(query2, (error, rows, fields) => {
    shifts = rows;
  });

  // get all waiter IDs, this will be populated in the dropdown to search for waiters whenever the page is loaded
  query2 = `SELECT waiter_id FROM waiters`;
  db.pool.query(query2, (error, rows, fields) => {
    waiters = rows;
  });

  // start to build query string for updating waiter
  query2 = `UPDATE waiters SET `;
  let data = req.body;
  waiter_id = data["input-waiter-id"];

  // if first name given, add to update
  let fname = data["input-fname"];
  if (fname != "") {
    query2 += `first_name = '${fname}' `;
    count += 1;
  }

  // if last name given, add to update
  let lname = data["input-lname"];
  if (lname != "") {
    if (count >= 1) {
      query2 += `, `;
    }
    query2 += ` last_name = '${lname}'`;
  }

  // if phone number given, add to update
  let phone = data["input-phone"];
  if (phone != "") {
    if (count >= 1) {
      query2 += `, `;
    }
    query2 += ` phone_number = '${phone}' `;
  }

  // if preferred shift given, add to update
  let shift = data["input-shift"];
  if (data["input-shift"] != "unchanged") {
    if (count >= 1) {
      query2 += `, `;
    }
    query2 += ` shift_type_preference = '${shift}' `;
  }

  // finish string with waiter_ID given by user as selector
  query2 += `where waiter_id = '${data["input-waiter-id"]}'`;
  db.pool.query(query2, function (error, rows, fields) {
    if (error) {
    } else {
      if (data["input-assigned-shift"] === undefined) {
        //if no assigned shift change, then update is complete.  Redirect to waiters page
        res.redirect("/waiters");
      }
    }
  });

  //if user chose to add a shift, then add to shifts_waiters table
  if (
    data["input-shift-action"] == "Add" &&
    data["input-assigned-shift"] != ""
  ) {
    query1 = `INSERT INTO shifts_waiters (waiter_id, shift_id) VALUES ('${data["input-waiter-id"]}', '${data["input-assigned-shift"]}')`;
    db.pool.query(query1, function (error, rows, fields) {
      if (error) {
        res.redirect("/waiters");
      } else {
        // if successful shifts_waiters table update, then update is complete.  Redirect to waiters
        res.redirect("/waiters");
      }
    });
  }

  //if user chose to remove a shift and shift ID exists, then remove assigned shift
  if (
    data["input-shift-action"] == "Remove" &&
    data["input-assigned-shift"] != ""
  ) {
    query1 = `SELECT COUNT(*) AS count FROM shifts_waiters WHERE waiter_id = '${data["input-waiter-id"]}'`;
    db.pool.query(query1, function (error, rows, fields) {
      if (error) {
      } else {
        // get number of shifts the waiter has currently before the delete
        let count = rows[0];
        query2 = `SELECT COUNT(waiter_id) as count FROM shifts_waiters WHERE shift_id = '${data["input-assigned-shift"]}'`;
        db.pool.query(query2, (error, rows, fields) => {});
        // get number of waiters the shift has currently before the delete
        let waiters_assigned = rows[0];
        // if waiter has more than 1 shift and shift has more than 1 waiter
        if (count["count"] > 1 && waiters_assigned["count"] > 1) {
          // then okay to delete, detete from shifts_waiters table
          query1 = `DELETE FROM shifts_waiters WHERE waiter_id = '${data["input-waiter-id"]}' AND shift_id = '${data["input-assigned-shift"]}'`;
          db.pool.query(query1, function (error, rows, fields) {
            if (error) {
              console.log(error);
              res.sendStatus(400);
            } else {
              res.redirect("/waiters");
            }
          });
        } else {
          // ptherwise, shift cannot be deleted
          // set "can't delete" to true and notify user
          cant_delete = true;
          res.render("waiters", {
            cant_delete: cant_delete,
            shifts: shifts,
            waiters: waiters,
          });
        }
      }
    });
  }
});

// ROUTE FOR ADD MENU ITEM
app.post("/add-menu-item-form", function (req, res) {
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
