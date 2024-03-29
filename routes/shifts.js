const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders shifts and waiter table(/shifts):
router.get("", function (req, res, next) {
  const selectQuery = `
  SELECT s.shift_id, s.shift_day, s.shift_type, w.waiter_id, w.first_name, w.last_name FROM shifts s
	  LEFT JOIN shifts_waiters sw ON s.shift_id = sw.shift_id
    LEFT JOIN waiters w ON sw.waiter_id = w.waiter_id`;

  db.pool.query(selectQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
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
router.get("/new", function (req, res, next) {
  const waitersQuery = `SELECT * FROM waiters`;

  let errorMessage;
  if (req.query.error === "select_waiters") {
    errorMessage = "You must select at least 1 waiter";
  }

  db.pool.query(waitersQuery, function (error, rows, fields) {
    let waiters = rows;
    res.render("shifts/new", { waiters, errorMessage });
  });
});

// receives the form submission of the "add shift" form
router.post("/new", function (req, res, next) {
  const shiftDay = req.body["input-shift-day"];
  const shiftType = req.body["input-shift-type"];

  function getWaiterIds(data) {
    let waiterIdsWithHyphens = Object.keys(data).filter((key) =>
      key.includes("waiter-")
    );
    let waiterIdsWithoutHyphens = waiterIdsWithHyphens.map((waiterId) =>
      parseInt(waiterId.replace("waiter-", ""))
    );
    return waiterIdsWithoutHyphens;
  }

  let waiterIds = getWaiterIds(req.body);

  if (waiterIds.length === 0) {
    return res.redirect(`/shifts/new?error=select_waiters`);
  }

  const selectShiftsQuery = `SElECT * FROM shifts`;

  const insertShiftQuery = `INSERT INTO shifts (shift_day, shift_type) VALUES ("${shiftDay}", "${shiftType}")`;

  db.pool.query(insertShiftQuery, function (error, rows, fields) {
    console.log(error);
    db.pool.query(selectShiftsQuery, function (error, rows, fields) {
      console.log(error);

      const shiftId = rows[rows.length - 1].shift_id;
      const shiftIdWaiterIdTuples = waiterIds
        .map((waiterId) => `(${shiftId}, ${waiterId})`)
        .join(",");

      const shiftsWaitersQuery = `INSERT INTO shifts_waiters (shift_id, waiter_id) VALUES ${shiftIdWaiterIdTuples}`;

      db.pool.query(shiftsWaitersQuery, function (error, rows, fields) {
        console.log(error);

        res.redirect("/shifts");
      });
    });
  });
});

// renders the "edit shift" form
router.get("/:id/edit", function (req, res, next) {
  const shiftQuery = `SELECT * FROM shifts WHERE shift_id = ${req.params.id}`;
  const waitersQuery = `SELECT * FROM waiters`;
  const shiftsWaitersQuery = `SELECT waiter_id FROM shifts_waiters WHERE shift_id = ${req.params.id}`;

  let errorMessage;
  if (req.query.error === "select_waiters") {
    errorMessage = "You must select at least 1 waiter";
  }

  db.pool.query(shiftQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    const shift = rows[0];
    db.pool.query(waitersQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      let waiters = rows;
      db.pool.query(shiftsWaitersQuery, function (error, rows, fields) {
        if (error) {
          return next(error);
        }
        // make shiftsWaiter just an array of waiterIDs
        const shiftsWaiters = rows.map((shiftWaiter) => shiftWaiter.waiter_id);

        waiters = waiters.map((waiter) => {
          waiter.isOnShift = shiftsWaiters.includes(waiter.waiter_id);
          return waiter;
        });

        res.render("shifts/edit", { shift, waiters, errorMessage });
      });
    });
  });
});

// receives the form submission of the "edit shift" form
router.post("/:id/edit", function (req, res, next) {
  // update the shift itself
  const shiftId = req.params.id;
  const shiftDay = req.body["input-shift-day"];
  const shiftType = req.body["input-shift-type"];

  const updateShiftQuery = `
    UPDATE shifts SET shift_day = '${shiftDay}', shift_type = '${shiftType}'
      WHERE shift_id = ${shiftId}`;

  // handle assigning waiters

  // first parse the form body and just extract the IDs of the waiters that are checked
  const waiterIds = Object.keys(req.body)
    .filter((key) => key.includes("waiter-"))
    .map((waiterKey) => waiterKey.replace("waiter-", ""));

  if (waiterIds.length === 0) {
    return res.redirect(`/shifts/${shiftId}/edit?error=select_waiters`);
  }

  // first delete
  const deleteShiftsWaitersQuery = `DELETE FROM shifts_waiters WHERE shift_id = ${shiftId}`;

  // then insert
  const shiftIdWaiterIdTuples = waiterIds
    .map((waiterId) => `(${shiftId}, ${waiterId})`)
    .join(",");
  const insertShiftsWaitersQuery = `INSERT INTO shifts_waiters (shift_id, waiter_id) VALUES ${shiftIdWaiterIdTuples}`;

  db.pool.query(deleteShiftsWaitersQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    db.pool.query(updateShiftQuery, function (error, rows, fields) {
      if (error) {
        return next(error);
      }
      db.pool.query(insertShiftsWaitersQuery, function (error, rows, fields) {
        if (error) {
          return next(error);
        }
        res.redirect("/shifts");
      });
    });
  });
});

module.exports = {
  router,
};
