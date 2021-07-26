SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `cs340_lucasho`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `loyalty_points` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `first_name`, `last_name`, `email`, `loyalty_points`) VALUES
(1, 'Mary', 'Smith', 'MSmith@hello.com', 50),
(2, 'Joe', 'Stone', 'JStone@hello.com', 25),
(3, 'Abdul', 'Karim', 'Abdul_Karim@hello.com', 30);

-- --------------------------------------------------------

--
-- Table structure for table `customers_orders`
--

CREATE TABLE `customers_orders` (
  `customer_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customers_orders`
--

INSERT INTO `customers_orders` (`customer_id`, `order_id`) VALUES
(3, 1),
(1, 2),
(2, 3),
(2, 4),
(2, 5);

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `menu_item_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) NOT NULL,
  `number_sold` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`menu_item_id`, `name`, `price`, `is_available`, `number_sold`) VALUES
(1, 'Sheet Pan Chicken with Mozzarella, Pesto, and Broccoli', '8.95', 1, 35),
(2, 'Summer Special Shrimp and Fruit Fried Rice', '13.50', 1, 22),
(3, 'Chipotle Peach Salsa with Cilantro', '9.75', 0, 12);

-- --------------------------------------------------------

--
-- Table structure for table `menu_items_orders`
--

CREATE TABLE `menu_items_orders` (
  `menu_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `menu_items_orders`
--

INSERT INTO `menu_items_orders` (`menu_item_id`, `order_id`) VALUES
(3, 1),
(1, 2),
(2, 2),
(1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `order_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_price` decimal(10,2) NOT NULL,
  `waiter_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`,`total_price`, `waiter_id`) VALUES
(1, '25.67', 1),
(2, '100.50', 3),
(3, '56.20', 2),
(4, '30.22', 1),
(5, '45.79', 1);

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `shift_id` int(11) NOT NULL,
  `shift_day` varchar(50) NOT NULL,
  `shift_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `shifts`
--

INSERT INTO `shifts` (`shift_id`, `shift_day`, `shift_type`) VALUES
(1, 'Friday', 'day'),
(2, 'Friday', 'night'),
(3, 'Saturday', 'day'),
(4, 'Saturday', 'swing'),
(5, 'Saturday', 'night');

-- --------------------------------------------------------

--
-- Table structure for table `shifts_waiters`
--

CREATE TABLE `shifts_waiters` (
  `shift_id` int(11) NOT NULL,
  `waiter_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `shifts_waiters`
--

INSERT INTO `shifts_waiters` (`shift_id`, `waiter_id`) VALUES
(1, 2),
(2, 2),
(2, 3),
(3, 1),
(4, 2);

-- --------------------------------------------------------

--
-- Table structure for table `waiters`
--

CREATE TABLE `waiters` (
  `waiter_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `shift_type_preference` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `waiters`
--

INSERT INTO `waiters` (`waiter_id`, `first_name`, `last_name`, `phone_number`, `shift_type_preference`) VALUES
(1, 'Holly', 'Lucas', '2152223434', 'night'),
(2, 'Michael', 'Fern', '2453332598', 'day'),
(3, 'Abdul', 'Rehman', '2154452988', 'swing');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`);

--
-- Indexes for table `customers_orders`
--
ALTER TABLE `customers_orders`
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`menu_item_id`),
  ADD UNIQUE KEY `menu_item_id` (`menu_item_id`);

--
-- Indexes for table `menu_items_orders`
--
ALTER TABLE `menu_items_orders`
  ADD KEY `menu_item_id` (`menu_item_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `waiter_id` (`waiter_id`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`shift_id`);

--
-- Indexes for table `shifts_waiters`
--
ALTER TABLE `shifts_waiters`
  ADD UNIQUE KEY `shift_id` (`shift_id`,`waiter_id`),
  ADD KEY `waiter_id` (`waiter_id`);

--
-- Indexes for table `waiters`
--
ALTER TABLE `waiters`
  ADD PRIMARY KEY (`waiter_id`),
  ADD UNIQUE KEY `waiter_id` (`waiter_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `menu_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `shift_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `waiters`
--
ALTER TABLE `waiters`
  MODIFY `waiter_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customers_orders`
--
ALTER TABLE `customers_orders`
  ADD CONSTRAINT `customers_orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `customers_orders_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

--
-- Constraints for table `menu_items_orders`
--
ALTER TABLE `menu_items_orders`
  ADD CONSTRAINT `menu_items_orders_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `menu_items_orders_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `menu_items` (`menu_item_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`waiter_id`) REFERENCES `waiters` (`waiter_id`);

--
-- Constraints for table `shifts_waiters`
--
ALTER TABLE `shifts_waiters`
  ADD CONSTRAINT `shifts_waiters_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`shift_id`),
  ADD CONSTRAINT `shifts_waiters_ibfk_2` FOREIGN KEY (`waiter_id`) REFERENCES `waiters` (`waiter_id`);
COMMIT;



