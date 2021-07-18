const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders the list of waiters (/waiters)
router.get("", function (req, res) {
  let selectQuery;

  // If there is a query string, we run the query
  if (req.query.id != undefined) {
    selectQuery = `SELECT * FROM waiters WHERE employee_id LIKE "${req.query.id}%"`;
    // Run the 1st query
    db.pool.query(selectQuery, function (error, rows, fields) {
      // Save the waiters
      let waiters = rows;
      return res.render("waiters", { data: waiters });
    });
  } else {
    // Query 1 is select all waiters if name search is blank
    selectQuery = "SELECT * FROM waiters;";

    // Run the 1st query
    db.pool.query(selectQuery, function (error, rows, fields) {
      // Save the waiters
      let people = rows;
      return res.render("waiters/index", { data: people });
    });
  }
});

// renders the "add waiter" form
router.get("/new", function (req, res) {
  res.render("waiters/new");
});

// receives the form submission of the "add waiter" form
router.post("/new", function (req, res) {
  const firstName = req.body["input-fname"];
  const lastName = req.body["input-lname"];
  const phone = req.body["input-phone"];
  const shiftTypePreference = req.body["input-shift"];

  const insertQuery = `
    INSERT INTO waiters (first_name, last_name, employee_phone_number, shift_type_preference) 
                VALUES ('${firstName}', '${lastName}', ${phone}, '${shiftTypePreference}')`;

  db.pool.query(insertQuery, function (error, rows, fields) {
    // Check to see if there was an error
    if (error) {
      // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
      console.log(error);
      res.sendStatus(400);
    }

    // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
    // presents it on the screen
    else {
      res.redirect("/waiters");
      //res.redirect('/xxxx');
    }
  });
});

// renders the "edit waiter" form
router.get("/:id/edit", function (req, res) {
  const waiterQuery = `SELECT * FROM waiters WHERE employee_id = ${req.params.id}`;

  db.pool.query(waiterQuery, function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.sendStatus(400);
    }

    const waiter = rows[0];

    res.render("waiters/edit", { waiter });
  });
});

// receives the form submission of the "edit waiter" form
router.post("/:id/edit", function (req, res) {
  // make a sql query to UPDATE the waiter
  // Capture the incoming data and parse it back to a JS object
  count = 0;
  let updateQuery = `UPDATE waiters SET `;

  let data = req.body;

  // Capture NULL values
  let fname = data["input-fname"];
  if (fname != "") {
    updateQuery += `first_name = '${fname}' `;
    count += 1;
  }

  let lname = data["input-lname"];
  if (lname != "") {
    if (count >= 1) {
      updateQuery += `, `;
    }
    updateQuery += ` last_name = '${lname}'`;
  }

  let phone = data["input-phone"];
  if (phone != "") {
    if (count >= 1) {
      updateQuery += `, `;
    }
    updateQuery += ` employee_phone_number = '${phone}' `;
  }

  let shift = data["input-shift"];
  if (shift != "") {
    if (count >= 1) {
      updateQuery += `, `;
    }
    updateQuery += ` shift_type_preference = '${shift}' `;
  }

  updateQuery += `where employee_id = '${data["input-id"]}'`;

  // Create the query and run it on the database
  db.pool.query(updateQuery, function (error, rows, fields) {
    // Check to see if there was an error
    if (error) {
      // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
      console.log(error);
      res.sendStatus(400);
    }

    // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM waiters and
    // presents it on the screen
    else {
      res.redirect("/waiters");
    }
  });
});

module.exports = {
  router,
};
