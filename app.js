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

PORT = 6719;

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
  let data = req.query;
  let query2;
  let waiters;
  let remove_shift;
  let add_shift;
  let shifts;
  let remove = false;
  let add = false;
  let no_shift_change = false;
  let remove_error;
  let add_error;

  // Query 2 is the same in both cases
  query2 = `SELECT shift_id FROM shifts`;
  // Run the second query
  db.pool.query(query2, (error, rows, fields) => {
   shifts = rows 
      })

  if (data["switch-one"] == "remove") {
  //if switch-one is "remove", get all shift ID's that belong to waiter
  query2 = `SELECT s.shift_id FROM waiters w
  INNER JOIN shifts_waiters sw ON w.waiter_id = sw.waiter_id
  INNER JOIN shifts s ON sw.shift_id = s.shift_id WHERE w.waiter_id = '${data["input-id"]}'`
  db.pool.query(query2, (error, rows, fields) => {
   remove_shift = rows;
    //set remove to true
    remove = true;
}) }

  if (data["switch-one"] == "none") {
    no_shift_change = true;
  }

  // if user chose to add an assigned shift
  if (data["switch-one"] == "add") {
    //get all shift ID's 
    add_shift = shifts;
    //set add to true
    add = true;
  }

  // get all waiter IDs, this will be populated in the dropdown to search for waiters whenever the page is loaded
  query2 = `SELECT waiter_id FROM waiters`; 
    // Run the second query
    db.pool.query(query2, (error, rows, fields) => {
      if (error) { 

      }
      else {}

    waiters = rows 
  })

  // if waiter_id is submitted, user has selected a waiter to modify.   
  if (data["input-id"] != undefined) {
    // run a query to select all attributes of waiter with waiter id input by user
    query2 = `SELECT * FROM waiters WHERE waiter_id = '${data["input-id"]}'`; 
    db.pool.query(query2, (error, rows, fields) => {
      if (error) {
        // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
        console.log("here is the error", error);
        res.sendStatus(400);
      }
      
      else {
      mod_waiter = rows
      return res.render("waiters", { mod_waiter: mod_waiter, waiters: waiters, shifts: shifts, remove_shift:remove_shift, remove:remove, add:add, add_shift:add_shift, no_shift_change:no_shift_change});
      }  
      })
      }

  // If there is a query string or ALL was selected, we run the query as select all
  if (data["input-shift"] === undefined || data["input-shift"] == "ALL") {
    query1 = `SELECT * FROM waiters w
    INNER JOIN shifts_waiters sw ON w.waiter_id = sw.waiter_id
    INNER JOIN shifts s ON sw.shift_id = s.shift_id
    ORDER BY w.last_name ASC`;
    // run query to get all waiters and their assigned shifts to display
    db.pool.query(query1, function (error, rows, fields) {
      // Save the people
      let people = rows;
      return res.render("waiters", { data: people, shifts : shifts, waiters: waiters, remove_shift: remove_shift});
    });
  } 
  
  else {
    // otherwise a particular ID was selected, run a query for that shift ID to display all waiters on that shift
    query1 = `SELECT * FROM waiters w INNER JOIN shifts_waiters sw ON w.waiter_id = sw.waiter_id 
    INNER JOIN shifts s ON sw.shift_id = s.shift_id WHERE s.shift_id = '${data["input-shift"]}' ORDER BY w.last_name ASC`;

    // Run the 1st query
    db.pool.query(query1, function (error, rows, fields) {
      // Save the people
      let people = rows;
        return res.render("waiters", { data: people, shifts : shifts, waiters: waiters, remove_shift:remove_shift });
    
    });
  }

});

// ROUTE FOR MENU ITEMS --------------------------------------------------------------------------------------------

app.get("/menu_items", function (req, res) {
  // Display all items on page load
    let query1 = `SELECT * FROM menu_items`;
    // Run the 1st query
    db.pool.query(query1, function (error, rows, fields) {
      // Save the people
      let items = rows;
      return res.render("menu_items", { data: items });

})
});

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

app.get("/customers_public", function (req, res) {
  // Declare Query 1
<<<<<<< HEAD

  return res.render("menu_items");
=======
  let query1;
  let charges;
  let orders;
  let customer_ids;

  query1 = `SELECT customer_id FROM customers`;
  db.pool.query(query1, function (error, rows, fields) {
    // Save the people
    customer_ids = rows;
    // Run the second query
    });

  // If there is a query string, we run the query for searching by last name
  if (req.query.lname != undefined) 
  {
    console.log("searching");
    query1 = `SELECT * FROM customers WHERE last_name LIKE "${req.query.lname}%"`;
    // Run the 1st query
    db.pool.query(query1, function (error, rows, fields) {
      // Save the people
      let customers = rows;
      // Run the second query
      return res.render("customers_public", { customers: customers, customer_ids: customer_ids });
      });
  } 
  
  else if (req.query.customer != undefined) {
    console.log(req.query.custorder);
    query1 = `SELECT * FROM customers c
    INNER JOIN customers_orders co ON c.customer_id = co.customer_id
    INNER JOIN orders o ON co.order_id = o.order_id WHERE c.customer_id = "${req.query.customer}%"`;
    db.pool.query(query1, function (error, rows, fields) {
      // Save the orders
      orders = rows;
      query1 = `SELECT SUM(o.total_price) as total_charges FROM customers c
      INNER JOIN customers_orders co ON c.customer_id = co.customer_id
      INNER JOIN orders o ON co.order_id = o.order_id WHERE c.customer_id = "${req.query.customer}%"`;
      db.pool.query(query1, function (error, rows, fields) {
        // Save the orders
        charges = rows;
        return res.render("customers_public", { orders: orders, charges: charges, customer_ids: customer_ids });
        });
      });
    // get the total charges

    
   }

  else {

    query1 = `SELECT customer_id FROM customers`;
    db.pool.query(query1, function (error, rows, fields) {
      // Save the people
      customer_ids = rows;
      // Run the second query
      console.log("this is cust id ", customer_ids);
      return res.render("customers_public", {customer_ids: customer_ids});
      });
  

  }
>>>>>>> 7d6f797538081e7538885537f9226a362d195a5d
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
  let data = req.body;
  let no_assigned_shift = false;

  let phone = data["input-phone"];

  // if assigned shift not selected
  if (data["input-assigned-shift"] == ""){
    console.log("shift not added")
    no_assigned_shift = true;
    res.render("waiters", {no_assigned_shift: no_assigned_shift});
  }
  
  else {
    // Create the query and run it on the database
    query1 = `INSERT INTO waiters (first_name, last_name, phone_number, shift_type_preference) VALUES ('${data["input-fname"]}', '${data["input-lname"]}', '${data["input-phone"]}', '${data["input-shift"]}')`;
    db.pool.query(query1, function (error, rows, fields) {
      // Check to see if there was an error
      if (error) {
        console.log(error);
        res.sendStatus(400);
      }
      else {
        query1 = `select max(waiter_id) as last_id from waiters`;   
        db.pool.query(query1, function (error, rows, fields) {

            if (error) {
              console.log(error);
              res.sendStatus(400);
            }
            else {
                
                let new_id = rows[0]
                console.log("this is the last id ", new_id["last_id"]);
                query1 = `INSERT INTO shifts_waiters (waiter_id, shift_id) VALUES ('${new_id["last_id"]}', '${data["input-assigned-shift"]}')`
                db.pool.query(query1, function (error, rows, fields) {
                    if (error) {
                        console.log(error);
                        res.sendStatus(400);
                      }
                    else {
                        res.redirect("/waiters");
                    }
              //res.redirect('/xxxx');
            })   
      }
    })
}
})
}
});

//  ROUTE FOR MODIFY WAITER --------------------------------------------------------------------------------------------------------
app.post("/modify-waiter-form", function (req, res) {
  let shifts;
  let waiters;
  let query2;
  // Capture the incoming data and parse it back to a JS object
  console.log(req.body);
  cant_delete = false

  count = 0;

  query2 = `SELECT shift_id FROM shifts`;
  // Run the second query
  db.pool.query(query2, (error, rows, fields) => {
   shifts = rows 
      })
        // get all waiter IDs, this will be populated in the dropdown to search for waiters whenever the page is loaded
  query2 = `SELECT waiter_id FROM waiters`; 
  // Run the second query
  db.pool.query(query2, (error, rows, fields) => {
  waiters = rows 
            })


  query2 = `UPDATE waiters SET `;

  let data = req.body;

  waiter_id = data["input-waiter-id"];

  // Capture NULL values
  let fname = data["input-fname"];
  if (fname != "") {
    query2 += `first_name = '${fname}' `;
    count += 1;
  }

  let lname = data["input-lname"];
  if (lname != "") {
    if (count >= 1) {
      query2 += `, `;
    }
    query2 += ` last_name = '${lname}'`;
  }

  let phone = data["input-phone"];
  if (phone != "") {
    if (count >= 1) {
      query2 += `, `;
    }
    query2 += ` phone_number = '${phone}' `;
  }

  let shift = data["input-shift"];
  console.log(data["input-shift"]);
  if (data["input-shift"] != "unchanged") {
    if (count >= 1) {
      query2 += `, `;
    }
    query2 += ` shift_type_preference = '${shift}' `;
  }

  query2 += `where waiter_id = '${data["input-waiter-id"]}'`;
  console.log("query is ", query2);


  // run the modify query
  db.pool.query(query2, function (error, rows, fields) {
    if (error) { 

    }
    else {
      console.log("assigned shift should be undefined ", data["input-assigned-shift"]);
      if (data["input-assigned-shift"] === undefined) {
        
        res.redirect("/waiters");
        //, {shifts:shifts, waiters:waiters});
      }

    //done
    }
});

    //if switch-one = add, then add to shifts_waiters table

    if (data["input-shift-action"] == "Add" && data["input-assigned-shift"] != "") {
      query1 = `INSERT INTO shifts_waiters (waiter_id, shift_id) VALUES ('${data["input-waiter-id"]}', '${data["input-assigned-shift"]}')`;
      db.pool.query(query1, function (error, rows, fields) {
      if (error) { 
        res.redirect("/waiters");
      }
      else {
        res.redirect("/waiters");
      }
    })
    }


      //if switch-one = delete and assigned shift not blank
      if (data["input-shift-action"] == "Remove" && data["input-assigned-shift"] != "") {
        query1 = `SELECT COUNT(*) AS count FROM shifts_waiters WHERE waiter_id = '${data["input-waiter-id"]}'`        
        db.pool.query(query1, function (error, rows, fields) {
        if (error) { }
        else {
          let count = rows[0];
          console.log("the waiter ID is ", data["input-id"]);
          console.log("count is ", count);
            if (count["count"] > 1) {
              query1 = `DELETE FROM shifts_waiters WHERE waiter_id = '${data["input-waiter-id"]}' AND shift_id = '${data["input-assigned-shift"]}'`;
              db.pool.query(query1, function (error, rows, fields) {

              if (error) { 
                console.log(error);
                res.sendStatus(400);
              }
        else {
          res.redirect("/waiters");
        }
      
      })    
    }
    else {
        // Only one shift assigned, cannot remove

        cant_delete = true
        console.log("not deleted")
        res.render("waiters", {cant_delete: cant_delete, shifts:shifts, waiters:waiters});
    }
}
  })
}

});

// ROUTE FOR ADD MENU ITEM

app.post("/add-menu-item-form", function (req, res) {
  // Capture the incoming data and parse it back to a JS object
  let data = req.body;
  let items;
    // Create the query and run it on the database
    query1 = `INSERT INTO menu_items (name, price, is_available, number_sold) VALUES ('${data["input-name"]}', '${data["input-price"]}', '${data["is-available"]}', '${data["input-number-sold"]}')`;
    db.pool.query(query1, function (error, rows, fields) {
      // Check to see if there was an error
      if (error) {
        console.log(error);
        res.sendStatus(400);
      }
      else {   }

            })   
    query1 = `SELECT * FROM menu_items`;
    db.pool.query(query1, function (error, rows, fields) {
      // Check to see if there was an error
      if (error) {
        console.log(error);
        res.sendStatus(400);
      }
      else {
        console.log(rows);
        items = rows
        return res.render("menu_items", { data: items});
                    }
            })
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
