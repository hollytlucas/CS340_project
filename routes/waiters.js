const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders the list of waiters (/waiters)
router.get("", function (req, res, next) {
  let selectQuery;

  // If there is a query string, we run the query
  if (req.query.id != undefined) {
    selectQuery = `SELECT * FROM waiters WHERE waiter_id LIKE "${req.query.id}%"`;
    // Run the 1st query
    db.pool.query(selectQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      // Save the waiters
      let waiters = rows;
      return res.render("waiters", { waiters });
    });
  } else {
    selectQuery = `SELECT * FROM waiters`;

    db.pool.query(selectQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      let waiters = rows;
      return res.render("waiters/index", { waiters });
    });
  }
});

// renders the "add waiter" form
router.get("/new", function (req, res, next) {
  const selectShiftsQuery = `SELECT * FROM shifts`;
  db.pool.query(selectShiftsQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    const shifts = rows;
    res.render("waiters/new", { shifts });
  });
});

// receives the form submission of the "add waiter" form
router.post("/new", function (req, res, next) {
  const firstName = req.body["input-fname"];
  const lastName = req.body["input-lname"];
  const phone = req.body["input-phone"];
  const shiftTypePreference = req.body["input-shift"];

  const insertQuery = `
    INSERT INTO waiters (first_name, last_name, phone_number, shift_type_preference) 
                VALUES ('${firstName}', '${lastName}', ${phone}, '${shiftTypePreference}')`;

  db.pool.query(insertQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
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
router.get("/:id/edit", function (req, res, next) {
  const waiterQuery = `SELECT * FROM waiters WHERE waiter_id = ${req.params.id}`;

  db.pool.query(waiterQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }

    const waiter = rows[0];

    res.render("waiters/edit", { waiter });
  });
});

// receives the form submission of the "edit waiter" form
router.post("/:id/edit", function (req, res, next) {
  const firstName = req.body["input-first-name"];
  const lastName = req.body["input-last-name"];
  const phone = req.body["input-phone-number"];
  const shiftTypePreference = req.body["input-shift-type-preference"];
  const waiterID = req.params.id;

  const updateWaiterQuery = `UPDATE waiters SET first_name = '${firstName}', last_name = '${lastName}', phone_number = '${phone}',
                                shift_type_preference = '${shiftTypePreference}' WHERE waiter_id = ${waiterID}`;

  db.pool.query(updateWaiterQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    res.redirect("/waiters");
  });
});

module.exports = {
  router,
};
