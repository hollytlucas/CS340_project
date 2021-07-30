-- Waiters
--  INSERT a waiter (and insert into shifts waiters by last waiter ID added)
INSERT INTO waiters (first_name, last_name, employee_phone_number, shift_type_preference) VALUES (:first_name, :last_name, :employee_phone_number, :shift_type_preference);
SELECT max(waiter_id) as last_id from waiters;
INSERT INTO shifts_waiters (waiter_id, shift_id) VALUES (:waiter_id, :shift_id);

--  SELECT all waiters with certain shift ID
SELECT * FROM waiters w
INNER JOIN shift_waiters sw ON w.waiter_id = sw.waiter_id
INNER JOIN shifts s ON sw.shift_id = s.shift_id
ORDER BY w.last_name ASC;

-- SELECT all waiters and all shifts through innerjoin with the consolidated table
SELECT * FROM waiters w
INNER JOIN shifts_waiters sw ON w.waiter_id = sw.waiter_id
INNER JOIN shifts s ON sw.shift_id = s.shift_id
ORDER BY w.last_name ASC;

-- SELECT all waiter ID’s from waiters
SELECT waiter_id FROM waiters;

-- SELECT all shift ID’s from shifts
SELECT shift_id FROM shifts;

-- SELECT all attributes for a waiter given waiter ID
SELECT * FROM waiters WHERE waiter_id = :waiter_id;

--  UPDATE a waiter
UPDATE waiters SET first_name = :first_name, last_name = :last_name, phone_number = :phone_number, shift_preference = :shift_preference)
WHERE waiter_id = :waiter_id;

--    if user enters assigned shift ID and selects delete radio button
SELECT * FROM shifts_waiters WHERE waiter_id = :waiter_id;
DELETE FROM shifts_waiters WHERE :waiter_id = waiter_id AND :shift_id = shift_id;

--    if user enters assigned shift ID and selects add radio button
INSERT INTO shifts_waiters (waiter_id, shift_id) VALUES (:waiter_id, :shift_id);

-- check to make sure there is more than one shift assigned to a waiter
SELECT COUNT(*) AS count FROM shifts_waiters WHERE waiter_id = :waiter_id;     

-- DELETE relation from shifts_waiters table
DELETE FROM shifts_waiters WHERE waiter_id = '${data["input-waiter-id"]}' AND shift_id = :shift_id;
  
-- Menu Items
--  INSERT a menu item
INSERT INTO menu_items (name, price, is_available, number_sold) VALUES (:name, :price, :is_available, :number_sold);

-- SELECT all menu items
SELECT * FROM menu_items;

-- Customers (Modify/Add/Delete Page)
--  SELECT customer profile by name
SELECT * FROM customers WHERE last_name LIKE .last_name;

-- Customers (Search Page)
--  SELECT orders by customer id
SELECT * FROM customers c
INNER JOIN customers_orders co ON c.customer_id = co.customer_id
INNER JOIN orders o ON co.order_id = o.order_id

-- SELECT all customer ID’s for dropdown list
SELECT customer_id FROM customers;

-- SELECT sum of all prices of all orders related to given customer ID
SELECT SUM(o.total_price) as total_charges FROM customers c
INNER JOIN customers_orders co ON c.customer_id = co.customer_id
INNER JOIN orders o ON co.order_id = o.order_id WHERE c.customer_id = :customer_ID;

-- SELECT all customers with last name LIKE last name input by user
SELECT * FROM customers WHERE last_name LIKE :last_name;

-- Shifts
--  INSERT a shift
INSERT INTO shifts (shift_day, shift_type) VALUES (:shift_day, :shift_type);

--  SELECT shifts (and display waiters)
SELECT s.shift_id, s.shift_day, s.shift_type, w.waiter_id, w.first_name, w.last_name FROM shifts s
LEFT JOIN shifts_waiters sw ON s.shift_id = sw.shift_id
LEFT JOIN waiters w ON sw.waiter_id = w.waiter_id;

--  UPDATE a shift (and update waiters assigned to that shift)
UPDATE shifts SET shift_day = :shift_day, shift_type = :shift_type
WHERE shift_id = :shift_id;

    -- In order to update the shifts that waiters have, we use DELETE + INSERT so we don't duplicate rows
DELETE FROM shifts_waiters WHERE shift_id = :shift_id;
INSERT INTO shifts_waiters (shift_id, waiter_id) VALUES (:shift_id, :waiter_id);

-- Orders
--  INSERT an order (and insert into menu items orders and customers orders)
INSERT INTO orders (total_price, waiter_id) VALUES (:total_price, :waiter_id);
INSERT INTO customers_orders (customer_id, order_id) VALUES (:customer_id, :order_id);
INSERT INTO menu_items_orders (menu_item_id, order_id) VALUES (:menu_item_id, :order_id);

--  SELECT orders (and display menu items and customer ID)
SELECT o.order_id, o.order_created_at, o.total_price, mi.menu_item_id, mi.name AS menu_item_name, co.customer_id FROM orders o
LEFT JOIN menu_items_orders mio ON o.order_id = mio.order_id
LEFT JOIN menu_items mi ON mio.menu_item_id = mi.menu_item_id
JOIN customers_orders co ON co.order_id = o.order_id;

--  UPDATE an order
UPDATE orders SET total_price = :total_price, waiter_id = :waiter_id
WHERE order_id = :order_id;

-- In order to update the orders that customers have, we use DELETE + INSERT so we don't duplicate rows
DELETE FROM customers_orders WHERE order_id = :order_id;
INSERT INTO customers_orders (customer_id, order_id) VALUES (:customer_id, :order_id);

-- In order to update the orders that menu items are attached to, we use DELETE + INSERT so -- we don't duplicate rows
DELETE FROM menu_items_orders WHERE order_id = :order_id;
INSERT INTO menu_items_orders (menu_item_id, order_id) VALUES (:menu_item_id, :order_id);

-- UPDATE units sold of menu items included in the order
UPDATE menu_items m SET units_sold = units_sold + :item_count;

--  DELETE an order (and delete its references first)
DELETE FROM customers_orders WHERE order_id = :order_id;
DELETE FROM menu_items_orders WHERE order_id = :order_id;
DELETE FROM orders WHERE order_id = :order_id;
