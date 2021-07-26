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
    -- In order to update the orders that menu items are attached to, we use DELETE + INSERT so we don't duplicate rows
    DELETE FROM menu_items_orders WHERE order_id = :order_id;
    INSERT INTO menu_items_orders (menu_item_id, order_id) VALUES (:menu_item_id, :order_id);

--  DELETE an order (and delete its references first)
    DELETE FROM customers_orders WHERE order_id = :order_id;
    DELETE FROM menu_items_orders WHERE order_id = :order_id;
    DELETE FROM orders WHERE order_id = :order_id;

-- Waiters
