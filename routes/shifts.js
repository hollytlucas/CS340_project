const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

// renders shifts list (/shifts):
router.get("", function (req, res) {
  let selectQuery;

  if (req.query.id != undefined) {
    selectQuery = `SELECT * FROM shifts`;

    db.pool.query(selectQuery, function (error, rows, fields) {
      let shifts = rows;
      return res.render("shifts", { data: shifts });
    });
  } else {
    selectQuery = "SELECT * FROM shifts;";

    db.pool.query(selectQuery, function (error, rows, fields) {
      let shifts = rows;
      return res.render("shifts/index", { data: shifts });
    });
  }
});

// renders the "add shift" form
router.get("/new", function (req, res) {
  res.render("shifts/new");
});

// receives the form submission of the "add shift" form
router.post("/new", function (req, res) {
  res.redirect("/shifts");
});

// renders the "edit shift" form
router.get("/:id/edit", function (req, res) {
  res.render("shifts/edit", { shift: {} });
});

// receives the form submission of the "edit shift" form
router.post("/:id/edit", function (req, res) {
  res.redirect("/shifts");
});

module.exports = {
  router,
};
