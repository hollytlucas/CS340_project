const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders shifts and waiter table(/shifts):
router.get("", function (req, res) {
  const selectQuery = `
  SELECT s.shift_id, s.shift_day, s.shift_type, w.waiter_id, w.first_name, w.last_name FROM shifts s
	  LEFT JOIN shifts_waiters sw ON s.shift_id = sw.shift_id
    LEFT JOIN waiters w ON sw.waiter_id = w.waiter_id`;

  db.pool.query(selectQuery, function (error, rows, fields) {
    const shifts = rows;
    // add a "waiters" array to each shift object
    const condensedShifts = shifts.reduce((acc, shift) => {
      const mostRecentShift = acc[acc.length - 1];
      if (shift.waiter_id) {
        const waiterName = `${shift.first_name} ${shift.last_name}`;

        // combine waiters for the same shift into one row by grouping by
        //  the shift ID
        if (mostRecentShift && mostRecentShift.shift_id === shift.shift_id) {
          mostRecentShift.waiters.push(waiterName);
        } else {
          shift.waiters = [waiterName];
          acc.push(shift);
        }
      } else {
        // if there are no waiters assigned to the shift, just put an empty array
        shift.waiters = [];
        acc.push(shift);
      }

      return acc;
    }, []);

    return res.render("shifts", { data: condensedShifts });
  });
});

// renders the "add shift" form
router.get("/new", function (req, res) {
  const waitersQuery = `SELECT * FROM waiters`;
  db.pool.query(waitersQuery, function (error, rows, fields) {
    let waiters = rows;
    res.render("shifts/new", { waiters });
  });
});

// receives the form submission of the "add shift" form
router.post("/new", function (req, res) {
  const shiftDay = req.body["shift-day"];
  const shiftType = req.body["shift-type"];

  const insertShiftQuery = `INSERT INTO shifts (shift_day, shift_type) VALUES (${shiftDay}, ${shiftType})`;
  res.redirect("/shifts");
});

// renders the "edit shift" form
router.get("/:id/edit", function (req, res) {
  const shiftQuery = `SELECT * FROM shifts WHERE shift_id = ${req.params.id}`;
  const waitersQuery = `SELECT * FROM waiters`;
  const shiftsWaitersQuery = `SELECT waiter_id FROM shifts_waiters WHERE shift_id = ${req.params.id}`;

  db.pool.query(shiftQuery, function (error, rows, fields) {
    const shift = rows[0];
    db.pool.query(waitersQuery, function (error, rows, fields) {
      let waiters = rows;
      db.pool.query(shiftsWaitersQuery, function (error, rows, fields) {
        // make shiftsWaiter just an array of waiterIDs
        const shiftsWaiters = rows.map((shiftWaiter) => shiftWaiter.waiter_id);

        waiters = waiters.map((waiter) => {
          waiter.isOnShift = shiftsWaiters.includes(waiter.waiter_id);
          return waiter;
        });

        res.render("shifts/edit", { shift, waiters });
      });
    });
  });
});

// receives the form submission of the "edit shift" form
router.post("/:id/edit", function (req, res) {
  // update the shift itself
  const shiftId = req.params.id;
  const shiftDay = req.body["shift-day"];
  const shiftType = req.body["shift-type"];

  const updateShiftQuery = `
    UPDATE shifts SET shift_day = ${shiftDay}, shift_type = ${shiftType}) 
      WHERE shift_id = ${shiftId}`;

  // handle assigning waiters

  // first parse the form body and just extract the IDs of the waiters that are checked
  const waiterIds = Object.keys(req.body)
    .filter((key) => key.includes("waiter-"))
    .map((waiterKey) => waiterKey.replace("waiter-", ""));

  // first delete
  const deleteShiftsWaitersQuery = `DELETE FROM shifts_waiters WHERE shift_id = ${shiftId}`;

  // then insert
  const shiftIdWaiterIdTuples = waiterIds
    .map((waiterId) => `(${shiftId}, ${waiterId})`)
    .join(",");
  const insertShiftsWaitersQuery = `INSERT INTO shifts_waiters (shift_id, waiter_id) VALUES ${shiftIdWaiterIdTuples}`;

  db.pool.query(deleteShiftsWaitersQuery, function (error, rows, fields) {
    db.pool.query(insertShiftsWaitersQuery, function (error, rows, fields) {
      res.redirect("/shifts");
    });
  });
});

module.exports = {
  router,
};
