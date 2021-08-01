SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `cs340_lucasho`
--

-- --------------------------------------------------------

--
-- Table structure for table `waiters`
--

CREATE TABLE `waiters` (
  `waiter_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `shift_type_preference` varchar(50) NOT NULL,
  PRIMARY KEY (waiter_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `waiters`
--

INSERT INTO `waiters` (`first_name`, `last_name`, `phone_number`, `shift_type_preference`) VALUES
('Holly', 'Lucas', '2152223434', 'night'),
('Michael', 'Fern', '2453332598', 'day'),
('Abdul', 'Rehman', '2154452988', 'swing');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  PRIMARY KEY (customer_id),
  UNIQUE KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`first_name`, `last_name`, `email`) VALUES
('Mary', 'Smith', 'MSmith@hello.com'),
('Joe', 'Stone', 'JStone@hello.com'),
('Abdul', 'Karim', 'Abdul_Karim@hello.com');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `menu_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) NOT NULL,
  `number_sold` int(11) NOT NULL,
  PRIMARY KEY (menu_item_id),
  UNIQUE KEY `menu_item_id` (`menu_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`name`, `price`, `is_available`, `number_sold`) VALUES
('Sheet Pan Chicken with Mozzarella, Pesto, and Broccoli', '8.95', 1, 35),
('Summer Special Shrimp and Fruit Fried Rice', '13.50', 1, 22),
('Chipotle Peach Salsa with Cilantro', '9.75', 0, 12);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_price` decimal(10,2) NOT NULL,
  `waiter_id` int(11),
  `customer_id` int(11) NOT NULL,
  PRIMARY KEY (order_id),
  FOREIGN KEY (waiter_id) references waiters(waiter_id),
  FOREIGN KEY (customer_id) references customers(customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`total_price`, `waiter_id`, `customer_id`) VALUES
('25.67', 1, 2),
('100.50', 3, 1),
('56.20', 2, 1),
('30.22', 1, 3),
('45.79', 1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `menu_items_orders`
--

CREATE TABLE `menu_items_orders` (
  `menu_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  FOREIGN KEY (menu_item_id) references menu_items(menu_item_id),
  FOREIGN KEY (order_id) references orders(order_id)
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
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `shift_id` int(11) NOT NULL AUTO_INCREMENT,
  `shift_day` varchar(50) NOT NULL,
  `shift_type` varchar(50) NOT NULL,
  PRIMARY KEY (shift_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `shifts`
--

INSERT INTO `shifts` (`shift_day`, `shift_type`) VALUES
('Friday', 'day'),
('Friday', 'night'),
('Saturday', 'day'),
('Saturday', 'swing'),
('Saturday', 'night');

-- --------------------------------------------------------

--
-- Table structure for table `shifts_waiters`
--

CREATE TABLE `shifts_waiters` (
  `shift_id` int(11) NOT NULL,
  `waiter_id` int(11) NOT NULL,
  FOREIGN KEY (shift_id) references shifts(shift_id),
  FOREIGN KEY (waiter_id) references waiters(waiter_id)
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






