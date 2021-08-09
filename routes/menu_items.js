const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

//render /menu_items
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

//render the add menu item form
app.get("/menu_items/new", function (req, res, next) {
  res.render("menu_items/new");
});

// handle submission of add menu item form
app.post("/add-menu-item-form", function (req, res, next) {
  let data = req.body; // holds body of request
  let items; // holds all menu items to be displayed

  // insert new menu item
  const addMenuItemQuery = `INSERT INTO menu_items (name, price, is_available, number_sold) VALUES ('${data["input-name"]}', '${data["input-price"]}', '${data["is-available"]}', '${data["input-number-sold"]}')`;
  db.pool.query(addMenuItemQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    res.redirect("/menu_items")
  });

module.exports = {
  router,
};