const express = require("express");
const router = express.Router();
const db = require("../database/db-connector");

//render /menu_items, display menu_items table
router.get("", function (req, res, next) {
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
router.get("/new", function (req, res, next) {
  res.render("menu_items/new");
});

// handle submission of add menu item form
router.post("/new", function (req, res, next) {
  let data = req.body; // holds body of request
  let items; // holds all menu items to be displayed

  // insert new menu item
  const addMenuItemQuery = `INSERT INTO menu_items (name, price, is_available, number_sold) VALUES ('${data["input-name"]}', '${data["input-price"]}', '${data["is-available"]}', '${data["input-number-sold"]}')`;
  db.pool.query(addMenuItemQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    res.redirect("/menu_items");
  });
});

//render the edit menu item form
router.get("/:id/edit", function (req, res, next) {
  const menuItemID = req.params.id;
  const selectQuery = `SELECT * FROM menu_items WHERE menu_item_id = ${menuItemID}`;
  db.pool.query(selectQuery, function (error, rows, fields) {
    const item = rows[0];
    console.log(item.name);
    res.render("menu_items/edit", { item });
  });
});

// receives the form submission of the "edit menu item" form
router.post("/:id/edit", function (req, res, next) {
  const name = req.body["input-item-name"];
  const price = req.body["input-unit-price"];
  const isAvailable = req.body["is-available"] === "1" ? 1 : 0;
  const numberSold = req.body["input-number-sold"];
  const menuItemID = req.params.id;

  const updateMenuItemQuery = `UPDATE menu_items SET name = '${name}', price = '${price}', is_available = '${isAvailable}', number_sold = '${numberSold}'
                                  WHERE menu_item_id = ${menuItemID}`;

  db.pool.query(updateMenuItemQuery, function (error, rows, fields) {
    if (error) {
      return next(error);
    }
    res.redirect("/menu_items");
  });
});

module.exports = {
  router,
};
