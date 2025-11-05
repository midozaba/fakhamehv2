-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 01, 2025 at 04:10 PM
-- Server version: 11.4.8-MariaDB-cll-lve-log
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alfahoqm_alfakhama_rental`
--

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `car_barnd` varchar(100) NOT NULL,
  `car_type` varchar(100) NOT NULL,
  `car_model` int(11) NOT NULL,
  `car_num` int(11) NOT NULL,
  `car_category` varchar(50) DEFAULT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `price_per_week` decimal(10,2) NOT NULL,
  `price_per_month` decimal(10,2) NOT NULL,
  `car_color` varchar(50) DEFAULT NULL,
  `mileage` int(11) DEFAULT NULL,
  `status` enum('available','rented','maintenance') DEFAULT 'available',
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`id`, `car_barnd`, `car_type`, `car_model`, `car_num`, `car_category`, `price_per_day`, `price_per_week`, `price_per_month`, `car_color`, `mileage`, `status`, `image_url`, `created_at`, `updated_at`) VALUES
(3, 'Hyundai', 'H1', 2018, 7041195, NULL, 50.00, 350.00, 1200.00, 'Burgundy', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:30:03'),
(4, 'Hyundai', 'H1', 2018, 7044706, NULL, 50.00, 350.00, 1200.00, 'Burgundy', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:30:31'),
(5, 'Ford', 'Fusion', 2019, 7047838, 'Sedan', 27.00, 0.00, 0.00, 'White', 188000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:01:59'),
(6, 'Hyundai', 'i10', 2020, 7050085, 'Sedan', 17.00, 0.00, 0.00, 'Burgundy', 190000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:03:14'),
(7, 'Hyundai', 'Accent', 2020, 7050076, 'Sedan', 17.00, 0.00, 0.00, 'Navy Blue', 177000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:03:51'),
(8, 'Hyundai', 'i10', 2020, 7050067, 'Sedan', 17.00, 115.00, 500.00, 'Silver Metallic', 115000, 'available', '/uploads/carImage-1761476792473-347519029.jpg', '2025-10-25 14:21:07', '2025-10-28 13:04:56'),
(9, 'Hyundai', 'Elantra', 2020, 7050088, 'Sedan', 20.00, 0.00, 0.00, 'Black', 177022, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:06:00'),
(10, 'Hyundai', 'Elantra', 2020, 7050064, NULL, 20.00, 0.00, 0.00, 'Burgundy', 97004, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:06:34'),
(11, 'Hyundai', 'Elantra', 2020, 7050058, 'Sedan', 20.00, 0.00, 0.00, 'Black', 110640, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:07:30'),
(12, 'Hyundai', 'Elantra', 2020, 7050073, 'Sedan', 19.99, 0.00, 0.00, 'Red', 268128, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:08:22'),
(13, 'Hyundai', 'Elantra', 2020, 7050079, 'Sedan', 19.99, 0.00, 0.00, 'Burgundy', 120610, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:09:15'),
(14, 'Hyundai', 'Accent', 2020, 7050061, 'Sedan', 17.99, 0.00, 0.00, 'Red', 255301, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:11:49'),
(15, 'Hyundai', 'Elantra', 2020, 7050082, 'Sedan', 19.99, 0.00, 0.00, 'Red', 92000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:12:25'),
(16, 'Ford', 'Fusion', 2019, 7050952, 'Sedan', 30.00, 180.00, 600.00, 'White', 268003, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:39:20'),
(17, 'Hyundai', 'Elantra', 2020, 7051654, 'Sedan', 20.00, 0.00, 0.00, 'Silver Metallic', 293000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:16:35'),
(18, 'Toyota', 'Camry', 2018, 7051975, NULL, 35.00, 210.00, 900.00, 'Burgundy', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:28:34'),
(19, 'Toyota', 'Camry', 2019, 7042214, 'Sedan', 25.00, 0.00, 0.00, 'Champagne', 92430, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:13:20'),
(20, 'Hyundai', 'H1', 2020, 7042703, 'Sedan', 55.00, 0.00, 0.00, 'White', 292030, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:18:13'),
(21, 'Hyundai', 'H1', 2020, 7051429, 'Van', 50.00, 0.00, 0.00, 'Black', 293001, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:25:53'),
(22, 'Kia', 'Cerato', 2022, 7054088, NULL, 25.00, 161.00, 650.00, 'Burgundy', 146547, 'available', '/uploads/carImage-1761485986548-212348371.jpg', '2025-10-25 14:21:07', '2025-10-26 13:40:34'),
(23, 'Kia', 'Seltos', 2022, 7054085, 'SUV', 28.00, 0.00, 0.00, 'Maroon', 118350, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:33:02'),
(24, 'Kia', 'Sonet', 2022, 7054091, 'SUV', 25.00, 0.00, 0.00, 'Black', 108640, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:33:44'),
(25, 'Kia', 'Seltos', 2022, 7054094, 'Sedan', 25.00, 0.00, 0.00, 'Black', 86064, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:36:23'),
(26, 'Kia', 'Pegas', 2022, 7054103, 'Economy', 16.00, 0.00, 0.00, 'Burgundy', 92320, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:37:19'),
(27, 'Kia', 'Seltos', 2022, 7054106, NULL, 35.00, 230.00, 1000.00, 'Maroon', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:37:33'),
(28, 'Kia', 'Seltos', 2022, 7054109, NULL, 35.00, 220.00, 1000.00, 'Maroon', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:36:49'),
(29, 'Kia', 'Sonet', 2022, 7054097, NULL, 25.00, 0.00, 0.00, 'Pearl', 144562, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 14:21:15'),
(30, 'Kia', 'Cerato', 2022, 7054112, 'Sedan', 25.00, 0.00, 0.00, 'Burgundy', 144000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:29:16'),
(31, 'Kia', 'Sonet', 2022, 7054115, NULL, 25.00, 170.00, 700.00, 'Black', 127000, 'rented', '/uploads/carImage-1761477852549-55224885.jpg', '2025-10-25 14:21:07', '2025-10-26 15:27:15'),
(32, 'Toyota', 'Camry', 2022, 7058018, NULL, 35.00, 0.00, 0.00, 'Burgundy Metallic', 14000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:24:25'),
(33, 'Chevrolet', 'Captiva', 2023, 7049265, 'SUV', 40.00, 0.00, 0.00, 'Black', 268132, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:29:22'),
(34, 'Toyota', 'Camry', 2023, 7056316, 'Economy', 35.00, 0.00, 0.00, 'Burgundy Metallic', 132662, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:23:31'),
(35, 'Toyota', 'Camry', 2023, 7050930, 'Economy', 35.00, 0.00, 0.00, 'Burgundy Metallic', 80000, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:22:41'),
(36, 'Toyota', 'Camry', 2023, 7046388, 'Economy', 35.00, 0.00, 0.00, 'Silver Metallic', 108296, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:21:48'),
(37, 'Toyota', 'Camry', 2023, 7072429, 'Economy', 35.00, 0.00, 0.00, 'Silver Metallic', 115889, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:21:10'),
(38, 'Toyota', 'Camry', 2023, 7047837, 'Economy', 35.00, 0.00, 0.00, 'Silver Metallic', 68730, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:20:15'),
(39, 'Chevrolet', 'Captiva', 2023, 7074001, NULL, 40.00, 260.00, 1100.00, 'Black', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:38:36'),
(40, 'Chevrolet', 'Captiva', 2023, 7054105, NULL, 40.00, 0.00, 0.00, 'Burgundy', 90350, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:19:43'),
(41, 'Hyundai', 'H1', 2019, 7046896, 'Van', 50.00, 0.00, 0.00, 'Brown', 266120, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:28:07'),
(42, 'Toyota', 'Corolla', 2023, 7047105, 'Sedan', 25.00, 0.00, 750.00, 'Silver Metallic', 115000, 'rented', '/uploads/carImage-1761478068902-911485374.jpg', '2025-10-25 14:21:07', '2025-10-26 15:16:33'),
(43, 'Toyota', 'Corolla', 2023, 7096173, NULL, 25.00, 0.00, 750.00, 'Navy Metallic', 116247, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:18:47'),
(44, 'Toyota', 'Corolla', 2023, 7053237, NULL, 25.00, 0.00, 750.00, 'Navy Metallic', 100590, 'maintenance', NULL, '2025-10-25 14:21:07', '2025-10-26 15:18:11'),
(45, 'Toyota', 'Corolla', 2023, 7049175, 'Economy', 25.00, 0.00, 750.00, 'Navy Metallic', 104187, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:16:05'),
(46, 'Toyota', 'Corolla', 2023, 7049898, 'Economy', 25.00, 0.00, 750.00, 'Navy Metallic', 118890, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:15:36'),
(47, 'Toyota', 'Corolla', 2023, 7058668, 'Economy', 25.00, 0.00, 750.00, 'Navy Metallic', 97306, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:15:09'),
(48, 'Kia', 'Picanto', 2023, 7072602, 'Compact', 15.00, 0.00, 450.00, 'Silver', 53892, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:14:20'),
(50, 'Kia', 'Picanto', 2023, 7055721, NULL, 15.00, 0.00, 450.00, 'Silver', 61333, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:06:48'),
(51, 'Kia', 'Picanto', 2023, 7050039, NULL, 15.00, 105.00, 450.00, 'Black', 58000, 'available', '/uploads/carImage-1761477535128-404956323.png', '2025-10-25 14:21:07', '2025-10-26 11:18:55'),
(52, 'Hyundai', 'Sonata', 2022, 7049232, 'Sedan', 28.00, 0.00, 0.00, 'Burgundy', 108450, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:34:40'),
(53, 'Hyundai', 'Elantra', 2020, 7044977, 'Economy', 16.00, 0.00, 0.00, 'Burgundy', 88403, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:39:00'),
(54, 'Hyundai', 'H1', 2018, 7041817, 'Van', 50.00, 0.00, 0.00, 'Burgundy', 88970, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 13:40:03'),
(55, 'Hyundai', 'Elantra', 2025, 7053349, 'Sedan', 30.00, 0.00, 0.00, 'Burgundy', 88752, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 14:05:09'),
(56, 'Hyundai', 'H1', 2019, 7044793, NULL, 50.00, 0.00, 950.00, 'Black', 91751, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:12:56'),
(57, 'Hyundai', 'Elantra', 2023, 7055270, 'Sedan', 15.00, 0.00, 0.00, 'Silver', 87420, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 14:03:56'),
(58, 'Hyundai', 'Sonata', 2022, 7053887, NULL, 35.00, 0.00, 800.00, 'Navy Blue', 99602, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:10:44'),
(59, 'Hyundai', 'Sonata', 2022, 7053881, NULL, 35.00, 0.00, 800.00, 'Red', 142210, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:08:36'),
(60, 'Hyundai', 'Sonata', 2022, 7053890, NULL, 35.00, 0.00, 800.00, 'Burgundy', 87550, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 15:11:20'),
(61, 'Hyundai', 'Staria', 2025, 7053765, 'Van', 80.00, 0.00, 0.00, 'Black', 269120, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 14:04:51'),
(62, 'Dongfeng', 'Aeolus Shine', 2025, 7048146, NULL, 25.00, 160.00, 750.00, 'Pearl Metallic', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:35:31'),
(63, 'Dongfeng', 'Aeolus Shine', 2025, 7054411, NULL, 25.00, 160.00, 720.00, 'Pearl Metallic', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:34:34'),
(64, 'Hyundai', 'H1', 2020, 7051372, NULL, 55.00, 350.00, 1200.00, 'Black', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:32:25'),
(65, 'Hyundai', 'H1', 2020, 7043480, NULL, 55.00, 350.00, 1200.00, 'Burgundy', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:31:56'),
(66, 'Hyundai', 'H1', 2020, 7043471, NULL, 55.00, 350.00, 1200.00, 'Burgundy', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:31:37'),
(67, 'Hyundai', 'H1', 2020, 7043486, NULL, 55.00, 350.00, 1200.00, 'Burgundy', NULL, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-30 17:31:20'),
(68, 'Hyundai', 'H1', 2020, 7043465, NULL, 55.00, 0.00, 0.00, 'Burgundy', 107050, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-28 14:04:09'),
(69, 'Hyundai', 'Sonata', 2025, 7092933, NULL, 40.00, 0.00, 950.00, 'Maroon', 5007, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 14:53:49'),
(70, 'Hyundai', 'Sonata', 2025, 7081324, NULL, 40.00, 0.00, 950.00, 'Burgundy Metallic', 5009, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 14:52:53'),
(71, 'Hyundai', 'Sonata', 2025, 7053396, NULL, 40.00, 0.00, 950.00, 'Burgundy', 2030, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 14:47:03'),
(72, 'Hyundai', 'Sonata', 2025, 7099597, NULL, 40.00, 0.00, 950.00, 'Navy Blue', 987, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 14:45:03'),
(73, 'Hyundai', 'Sonata', 2025, 7096450, NULL, 40.00, 0.00, 950.00, 'Maroon', 2754, 'rented', NULL, '2025-10-25 14:21:07', '2025-10-26 14:44:29'),
(74, 'Hyundai', 'Elantra', 2025, 7051806, NULL, 30.00, 0.00, 850.00, 'Blue', NULL, 'available', '/uploads/carImage-1761738309041-269024028.png', '2025-10-25 14:21:07', '2025-10-29 11:50:55'),
(75, 'Hyundai', 'i10', 2025, 7054698, NULL, 20.00, 0.00, 600.00, 'grey Metallic', 1021, 'rented', '/uploads/carImage-1761738190288-56157477.jpg', '2025-10-25 14:21:07', '2025-10-29 11:43:10'),
(76, 'Hyundai', 'Staria (hybrid)', 2025, 7056382, NULL, 80.00, 0.00, 1600.00, 'grey Metallic', 3450, 'available', '/uploads/carImage-1761737261266-483628192.jpg', '2025-10-25 14:21:07', '2025-10-29 11:50:45'),
(77, 'Hyundai', 'Elantra', 2025, 7099913, NULL, 35.00, 0.00, 850.00, 'Navy Blue', 621, 'available', '/uploads/carImage-1761737061541-481357415.jpg', '2025-10-25 14:21:07', '2025-10-29 11:50:40'),
(78, 'Hyundai', 'i10', 2025, 7066470, NULL, 20.00, 0.00, 0.00, 'Petrol Blue', 521, 'available', NULL, '2025-10-25 14:21:07', '2025-10-26 14:39:41'),
(79, 'Hyundai', 'Elantra', 2025, 7073668, 'Economy', 30.00, 0.00, 850.00, 'Burgundy Metallic', 756, 'available', '/uploads/carImage-1761737008044-506417488.jpg', '2025-10-25 14:21:07', '2025-10-29 11:50:34'),
(80, 'Hyundai', 'Elantra', 2025, 7060466, 'Economy', 34.99, 0.00, 850.00, 'Olive', 760, 'available', '/uploads/carImage-1761735237742-276094528.jpg', '2025-10-25 14:21:07', '2025-10-29 10:54:55'),
(81, 'Hyundai', 'Elantra', 2025, 7075083, NULL, 35.00, 210.00, 850.00, 'Blue', 500, 'available', '/uploads/carImage-1761403777602-666282747.jpg', '2025-10-25 14:21:07', '2025-10-26 14:37:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `car_num` (`car_num`),
  ADD KEY `idx_car_status` (`status`),
  ADD KEY `idx_car_category` (`car_category`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
