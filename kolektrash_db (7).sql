-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 25, 2025 at 02:27 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kolektrash_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `user_id` int(11) NOT NULL,
  `position_title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `session` enum('AM','PM') NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('present','absent','on-leave','pending') DEFAULT 'pending',
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `recorded_by` int(11) DEFAULT NULL COMMENT 'Foreman user_id who recorded attendance',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `user_id`, `attendance_date`, `session`, `time_in`, `time_out`, `status`, `verification_status`, `recorded_by`, `notes`, `created_at`, `updated_at`) VALUES
(1, 17, '2025-11-21', 'AM', '05:12:59', NULL, 'present', 'verified', 91, NULL, '2025-11-21 16:25:46', '2025-11-21 16:25:46'),
(2, 16, '2025-11-21', 'AM', '05:12:28', NULL, 'present', 'verified', 91, NULL, '2025-11-21 16:26:29', '2025-11-21 16:26:29'),
(3, 30, '2025-11-21', 'AM', '05:13:28', NULL, 'present', 'verified', 91, NULL, '2025-11-21 16:26:30', '2025-11-21 16:26:30'),
(4, 35, '2025-11-21', 'AM', '05:14:04', NULL, 'present', 'verified', 91, NULL, '2025-11-21 16:26:31', '2025-11-21 16:26:31'),
(5, 29, '2025-11-21', 'AM', '05:14:33', NULL, 'present', 'verified', 91, NULL, '2025-11-21 16:26:32', '2025-11-21 16:26:32'),
(6, 33, '2025-11-21', 'AM', '05:15:04', NULL, 'present', 'verified', 91, NULL, '2025-11-21 16:26:33', '2025-11-21 16:26:33'),
(7, 16, '2025-11-23', 'AM', '05:13:43', NULL, 'present', 'verified', 91, NULL, '2025-11-23 16:14:27', '2025-11-23 16:14:27'),
(8, 28, '2025-11-24', 'AM', '05:18:46', NULL, 'present', 'verified', 91, NULL, '2025-11-24 16:29:52', '2025-11-24 16:29:52'),
(9, 31, '2025-11-24', 'AM', '05:16:44', NULL, 'present', 'verified', 91, NULL, '2025-11-24 16:30:16', '2025-11-24 16:30:16'),
(10, 35, '2025-11-24', 'AM', '05:15:02', NULL, 'present', 'verified', 91, NULL, '2025-11-24 16:30:17', '2025-11-24 16:30:17'),
(11, 30, '2025-11-24', 'AM', '05:14:15', NULL, 'present', 'verified', 91, NULL, '2025-11-24 16:30:18', '2025-11-24 16:30:18'),
(12, 17, '2025-11-24', 'AM', '05:12:08', NULL, 'present', 'verified', 91, NULL, '2025-11-24 16:30:18', '2025-11-24 16:30:18'),
(13, 16, '2025-11-24', 'AM', '05:11:14', NULL, 'present', 'verified', 91, NULL, '2025-11-24 16:30:19', '2025-11-24 16:30:19');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_request`
--

CREATE TABLE `attendance_request` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `schedule_id` bigint(20) UNSIGNED DEFAULT NULL,
  `photo_path` varchar(255) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `request_status` enum('pending','approved','declined') NOT NULL DEFAULT 'pending',
  `foreman_id` int(11) DEFAULT NULL,
  `review_note` varchar(255) DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` datetime DEFAULT NULL,
  `location_lat` decimal(10,7) DEFAULT NULL,
  `location_lng` decimal(10,7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance_request`
--

INSERT INTO `attendance_request` (`id`, `user_id`, `schedule_id`, `photo_path`, `remarks`, `request_status`, `foreman_id`, `review_note`, `submitted_at`, `reviewed_at`, `location_lat`, `location_lng`) VALUES
(12, 16, NULL, 'uploads/attendance/attendance_16_20251121171228_f0ef3f91.jpg', NULL, 'approved', 91, NULL, '2025-11-21 05:12:28', '2025-11-21 05:26:29', NULL, NULL),
(13, 17, NULL, 'uploads/attendance/attendance_17_20251121171259_9592d81e.jpg', NULL, 'approved', 91, NULL, '2025-11-21 05:12:59', '2025-11-21 05:25:46', NULL, NULL),
(14, 30, NULL, 'uploads/attendance/attendance_30_20251121171328_3899acf8.png', NULL, 'approved', 91, NULL, '2025-11-21 05:13:28', '2025-11-21 05:26:30', NULL, NULL),
(15, 35, NULL, 'uploads/attendance/attendance_35_20251121171404_d4ea96e8.png', NULL, 'approved', 91, NULL, '2025-11-21 05:14:04', '2025-11-21 05:26:31', NULL, NULL),
(16, 29, NULL, 'uploads/attendance/attendance_29_20251121171433_caf7aadd.jpg', NULL, 'approved', 91, NULL, '2025-11-21 05:14:33', '2025-11-21 05:26:32', NULL, NULL),
(17, 33, NULL, 'uploads/attendance/attendance_33_20251121171504_585ea45f.png', NULL, 'approved', 91, NULL, '2025-11-21 05:15:04', '2025-11-21 05:26:33', NULL, NULL),
(18, 16, NULL, 'uploads/attendance/attendance_16_20251123171343_2efa833e.jpg', NULL, 'approved', 91, NULL, '2025-11-23 05:13:43', '2025-11-23 05:14:27', NULL, NULL),
(19, 16, NULL, 'uploads/attendance/attendance_16_20251124171114_93e3a3cd.jpg', '{\"intent\":\"time_in\"}', 'approved', 91, NULL, '2025-11-24 05:11:14', '2025-11-24 05:30:19', NULL, NULL),
(20, 17, NULL, 'uploads/attendance/attendance_17_20251124171208_1266a851.jpg', '{\"intent\":\"time_in\"}', 'approved', 91, NULL, '2025-11-24 05:12:08', '2025-11-24 05:30:18', NULL, NULL),
(21, 30, NULL, 'uploads/attendance/attendance_30_20251124171415_5401d8d6.jpg', '{\"intent\":\"time_in\"}', 'approved', 91, NULL, '2025-11-24 05:14:15', '2025-11-24 05:30:18', NULL, NULL),
(22, 35, NULL, 'uploads/attendance/attendance_35_20251124171502_f37cca48.jpg', '{\"intent\":\"time_in\"}', 'approved', 91, NULL, '2025-11-24 05:15:02', '2025-11-24 05:30:17', NULL, NULL),
(23, 31, NULL, 'uploads/attendance/attendance_31_20251124171644_01f6d167.jpg', '{\"intent\":\"time_in\"}', 'approved', 91, NULL, '2025-11-24 05:16:44', '2025-11-24 05:30:16', NULL, NULL),
(24, 28, NULL, 'uploads/attendance/attendance_28_20251124171846_9c9a047e.jpg', '{\"intent\":\"time_in\"}', 'approved', 91, NULL, '2025-11-24 05:18:46', '2025-11-24 05:29:52', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `barangay`
--

CREATE TABLE `barangay` (
  `barangay_id` varchar(10) NOT NULL,
  `barangay_name` varchar(255) NOT NULL,
  `cluster_id` varchar(10) DEFAULT NULL,
  `barangay_head_id` varchar(10) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `barangay`
--

INSERT INTO `barangay` (`barangay_id`, `barangay_name`, `cluster_id`, `barangay_head_id`, `latitude`, `longitude`) VALUES
('01-ALDZR', 'Aldezar', '2C-CA', '01-VO', 13.8347000, 123.0279000),
('02-ALTZ', 'Alteza', '4C-CC', '02-CL', 13.7919000, 122.9716000),
('03-ANB', 'Anib', '5C-CD', '03-PN', 13.8023000, 123.0445000),
('04-AWYN', 'Awayan', '5C-CD', '04-BC', 13.7467000, 122.9913000),
('05-AZCN', 'Azucena', '1C-PB', '05-BA', 13.7772000, 122.9660000),
('06-BGNGS', 'Bagong Sirang', '3C-CB', '06-MB', 13.7187000, 122.9025000),
('07-BNHN', 'Binahian', '3C-CB', '07-EM', 13.7372000, 122.8696000),
('08-BLNRT', 'Bolo Norte', '4C-CC', '08-RN', 13.8194000, 122.9592000),
('09-BLSR', 'Bolo Sur', '4C-CC', '09-ME', 13.8042000, 122.9582000),
('10-BLN', 'Bulan', '2C-CA', '10-LA', 13.7939000, 122.9987000),
('11-BLWN', 'Bulawan', '3C-CB', '11-RL', 13.7499000, 122.8883000),
('12-CBY', 'Cabuyao', '2C-CA', '12-ER', 13.8042000, 122.9582000),
('13-CM', 'Caima', '3C-CB', '13-MB', 13.6855000, 122.8722000),
('14-CLGBN', 'Calagbangan', '4C-CC', '14-BR', 13.8405000, 122.9569000),
('15-CLMPN', 'Calampinay', '5C-CD', '15-RB', 13.7926000, 123.0400000),
('16-CRYRY', 'Carayrayan', '3C-CB', '16-RR', 13.7193000, 122.8765000),
('17-CTM', 'Cotmo', '5C-CD', '17-JJ', 13.8157000, 123.0389000),
('18-GB', 'Gabi', '3C-CB', '18-DM', 13.7372000, 122.8696000),
('19-GNGN', 'Gaongan', '1C-PB', '19-EG', 13.7600000, 122.9666000),
('20-IMPG', 'Impig', '1C-PB', '20-LP', 13.7884000, 122.9853000),
('21-LPLP', 'Lipilip', '3C-CB', '21-AA', 13.6946000, 122.8894000),
('22-LBGNJ', 'Lubigan Jr.', '3C-CB', '22-FV', 13.7308000, 122.9206000),
('23-LBGNS', 'Lubigan Sr.', '3C-CB', '23-AA', 13.7430000, 122.9391000),
('24-MLGC', 'Malaguico', '5C-CD', '24-MM', 13.7882000, 122.9518000),
('25-MLBG', 'Malubago', '1C-PB', '25-RD', 13.7707000, 122.9828000),
('26-MNNGL', 'Manangle', '3C-CB', '26-RL', 13.7681000, 122.9188000),
('27-MNGP', 'Mangapo', '5C-CD', '27-EC', 13.7569000, 122.9888000),
('28-MNGG', 'Mangga', '5C-CD', '28-RA', 13.7804000, 123.0406000),
('29-MNLBN', 'Manlubang', '3C-CB', '29-GD', 13.7068000, 122.8847000),
('30-MNTL', 'Mantila', '5C-CD', '30-LM', 13.7894000, 122.9863000),
('31-NRTHC', 'North Centro', '1C-PB', '31-JR', 13.7699000, 122.9760000),
('32-NRTHV', 'North Villazar', '4C-CC', '32-ME', 13.8735000, 122.9560000),
('33-SGRDF', 'Sagrada Familia', '2C-CA', '33-NM', 13.8130000, 122.9984000),
('34-SLND', 'Salanda', '4C-CC', '34-DL', 13.8056000, 122.9463000),
('35-SLVCN', 'Salvacion', '2C-CA', '35-YD', 13.8233000, 123.0168000),
('36-SNSDR', 'San Isidro', '5C-CD', '36-QB', 13.7656000, 123.0015000),
('37-SNVCN', 'San Vicente', '5C-CD', '37-LD', 13.8918000, 122.9645000),
('38-SRRNZ', 'Serranzana', '2C-CA', '38-RN', 13.8032000, 123.0193000),
('39-STHCN', 'South Centro', '1C-PB', '39-DC', 13.7642000, 122.9758000),
('40-STHVL', 'South Villazar', '4C-CC', '40-RA', 13.8547000, 122.9520000),
('41-TSN', 'Taisan', '3C-CB', '41-NC', 13.7680000, 122.9486000),
('42-TR', 'Tara', '1C-PB', '42-MD', 13.7474000, 122.9736000),
('43-TBL', 'Tible', '4C-CC', '43-JA', 13.8918000, 122.9645000),
('44-TLTL', 'Tula-tula', '2C-CA', '44-WB', 13.8495000, 123.0071000),
('45-VGN', 'Vigaan', '2C-CA', '45-RA', 13.8442000, 122.9839000),
('46-YB', 'Yabo', '4C-CC', '46-DC', 13.7934000, 122.9325000);

-- --------------------------------------------------------

--
-- Table structure for table `barangay_head`
--

CREATE TABLE `barangay_head` (
  `user_id` varchar(10) NOT NULL,
  `term_start` date DEFAULT NULL,
  `term_end` date DEFAULT NULL,
  `position_title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `barangay_head`
--

INSERT INTO `barangay_head` (`user_id`, `term_start`, `term_end`, `position_title`) VALUES
('01-VO', NULL, NULL, NULL),
('02-CL', NULL, NULL, NULL),
('03-PN', NULL, NULL, NULL),
('04-BC', NULL, NULL, NULL),
('05-BA', NULL, NULL, NULL),
('06-MB', NULL, NULL, NULL),
('07-EM', NULL, NULL, NULL),
('08-RN', NULL, NULL, NULL),
('09-ME', NULL, NULL, NULL),
('10-LA', NULL, NULL, NULL),
('11-RL', NULL, NULL, NULL),
('12-ER', NULL, NULL, NULL),
('13-MB', NULL, NULL, NULL),
('14-BR', NULL, NULL, NULL),
('15-RB', NULL, NULL, NULL),
('16-RR', NULL, NULL, NULL),
('17-JJ', NULL, NULL, NULL),
('18-DM', NULL, NULL, NULL),
('19-EG', NULL, NULL, NULL),
('20-LP', NULL, NULL, NULL),
('21-AA', NULL, NULL, NULL),
('22-FV', NULL, NULL, NULL),
('23-AA', NULL, NULL, NULL),
('24-MM', NULL, NULL, NULL),
('25-RD', NULL, NULL, NULL),
('26-RL', NULL, NULL, NULL),
('27-EC', NULL, NULL, NULL),
('28-RA', NULL, NULL, NULL),
('29-GD', NULL, NULL, NULL),
('30-LM', NULL, NULL, NULL),
('31-JR', NULL, NULL, NULL),
('32-ME', NULL, NULL, NULL),
('33-NM', NULL, NULL, NULL),
('34-DL', NULL, NULL, NULL),
('35-YD', NULL, NULL, NULL),
('36-QB', NULL, NULL, NULL),
('37-LD', NULL, NULL, NULL),
('38-RN', NULL, NULL, NULL),
('39-DC', NULL, NULL, NULL),
('40-RA', NULL, NULL, NULL),
('41-NC', NULL, NULL, NULL),
('42-MD', NULL, NULL, NULL),
('43-JA', NULL, NULL, NULL),
('44-WB', NULL, NULL, NULL),
('45-RA', NULL, NULL, NULL),
('46-DC', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cluster`
--

CREATE TABLE `cluster` (
  `cluster_id` varchar(10) NOT NULL,
  `cluster_name` varchar(255) NOT NULL,
  `type_of_area` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cluster`
--

INSERT INTO `cluster` (`cluster_id`, `cluster_name`, `type_of_area`) VALUES
('1C-PB', 'Metro Sipocot', 'Priority Barangays'),
('2C-CA', 'Cluster_A', 'Eastern Barangays'),
('3C-CB', 'Cluster_B', 'Western Barangays'),
('4C-CC', 'Cluster_C', 'Northern Barangays'),
('5C-CD', 'Cluster_D', 'Southern Barangays');

-- --------------------------------------------------------

--
-- Table structure for table `collection`
--

CREATE TABLE `collection` (
  `collection_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `collector_id` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `actual_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collection_point`
--

CREATE TABLE `collection_point` (
  `point_id` int(11) NOT NULL,
  `barangay_id` varchar(10) DEFAULT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_mrf` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `collection_point`
--

INSERT INTO `collection_point` (`point_id`, `barangay_id`, `location_name`, `latitude`, `longitude`, `is_mrf`) VALUES
(1, '01-ALDZR', 'Aldezar Main CP', 13.83490000, 123.02810000, 1),
(2, '02-ALTZ', 'Alteza Corner CP', 13.79210000, 122.97180000, 0),
(3, '03-ANB', 'Anib Plaza CP', 13.80250000, 123.04470000, 1),
(4, '04-AWYN', 'Awayan School CP', 13.74690000, 122.99150000, 0),
(5, '05-AZCN', 'Azucena Central CP', 13.77740000, 122.96620000, 1),
(6, '06-BGNGS', 'Bagong Sirang CP', 13.71890000, 122.90270000, 0),
(7, '07-BNHN', 'Binahian CP', 13.73740000, 122.86980000, 1),
(8, '08-BLNRT', 'Bolo Norte CP', 13.81960000, 122.95940000, 0),
(9, '09-BLSR', 'Bolo Sur CP', 13.80440000, 122.95840000, 1),
(10, '10-BLN', 'Bulan CP', 13.79410000, 122.99890000, 0),
(11, '11-BLWN', 'Bulawan CP', 13.75010000, 122.88850000, 1),
(12, '12-CBY', 'Cabuyao CP', 13.80440000, 122.95840000, 0),
(13, '13-CM', 'Caima CP', 13.68570000, 122.87240000, 1),
(14, '14-CLGBN', 'Calagbangan CP', 13.84070000, 122.95710000, 0),
(15, '15-CLMPN', 'Calampinay CP', 13.79280000, 123.04020000, 1),
(16, '16-CRYRY', 'Carayrayan CP', 13.71950000, 122.87670000, 0),
(17, '17-CTM', 'Cotmo CP', 13.81590000, 123.03910000, 1),
(18, '18-GB', 'Gabi CP', 13.73740000, 122.86980000, 0),
(19, '19-GNGN', 'Gaongan CP', 13.76020000, 122.96680000, 1),
(20, '20-IMPG', 'Impig CP', 13.78860000, 122.98550000, 0),
(21, '21-LPLP', 'Lipilip CP', 13.69480000, 122.88960000, 1),
(22, '22-LBGNJ', 'Lubigan Jr. CP', 13.73100000, 122.92080000, 0),
(23, '23-LBGNS', 'Lubigan Sr. CP', 13.74320000, 122.93930000, 1),
(24, '24-MLGC', 'Malaguico CP', 13.78840000, 122.95200000, 0),
(26, '26-MNNGL', 'Manangle CP', 13.76830000, 122.91900000, 0),
(27, '27-MNGP', 'Mangapo CP', 13.75710000, 122.98900000, 1),
(28, '28-MNGG', 'Mangga CP', 13.78060000, 123.04080000, 0),
(29, '29-MNLBN', 'Manlubang CP', 13.70700000, 122.88490000, 1),
(30, '30-MNTL', 'Mantila CP', 13.78341330, 123.01992620, 0),
(31, '31-NRTHC', 'North Centro CP', 13.77010000, 122.97620000, 1),
(32, '32-NRTHV', 'North Villazar CP', 13.87370000, 122.95620000, 0),
(33, '33-SGRDF', 'Sagrada Familia CP', 13.81320000, 122.99860000, 1),
(34, '34-SLND', 'Salanda CP', 13.80580000, 122.94650000, 0),
(35, '35-SLVCN', 'Salvacion CP', 13.82350000, 123.01700000, 1),
(36, '36-SNSDR', 'San Isidro CP', 13.76580000, 123.00170000, 0),
(37, '37-SNVCN', 'San Vicente CP', 13.89200000, 122.96470000, 1),
(38, '38-SRRNZ', 'Serranzana CP', 13.80340000, 123.01950000, 0),
(39, '39-STHCN', 'South Centro CP', 13.76440000, 122.97600000, 1),
(40, '40-STHVL', 'South Villazar CP', 13.85490000, 122.95220000, 0),
(41, '41-TSN', 'Taisan CP', 13.76820000, 122.94880000, 1),
(42, '42-TR', 'Tara CP', 13.74760000, 122.97380000, 0),
(43, '43-TBL', 'Tible CP', 13.89200000, 122.96470000, 1),
(44, '44-TLTL', 'Tula-tula CP', 13.84970000, 123.00730000, 0),
(45, '45-VGN', 'Vigaan CP', 13.84440000, 122.98410000, 1),
(46, '46-YB', 'Yabo CP', 13.79360000, 122.93270000, 0),
(47, '31-NRTHC', 'North Centro CP - A', 13.77050000, 122.97670000, 0),
(48, '31-NRTHC', 'North Centro CP - B', 13.76980000, 122.97580000, 0),
(49, '31-NRTHC', 'North Centro CP - C', 13.77030000, 122.97540000, 0),
(50, '39-STHCN', 'South Centro CP - A', 13.76480000, 122.97640000, 0),
(51, '39-STHCN', 'South Centro CP - B', 13.76400000, 122.97560000, 0),
(52, '39-STHCN', 'South Centro CP - C', 13.76370000, 122.97630000, 0),
(53, '25-MLBG', 'Malubago Main Collection Point', 13.68000000, 122.81500000, 1);

-- --------------------------------------------------------

--
-- Table structure for table `collection_schedule`
--

CREATE TABLE `collection_schedule` (
  `schedule_id` int(11) NOT NULL,
  `barangay_id` varchar(10) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `session` enum('AM','PM') NOT NULL DEFAULT 'AM',
  `created_by` int(11) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `collection_schedule`
--

INSERT INTO `collection_schedule` (`schedule_id`, `barangay_id`, `type_id`, `scheduled_date`, `session`, `created_by`, `start_time`, `end_time`, `status`) VALUES
(1427, '20-IMPG', NULL, '2025-10-08', 'AM', NULL, '08:00:00', '10:00:00', 'pending'),
(1428, '42-TR', NULL, '2025-10-08', 'AM', NULL, '10:00:00', '12:00:00', 'pending'),
(1429, '22-LBGNJ', NULL, '2025-10-08', 'AM', NULL, '09:00:00', '10:00:00', 'pending'),
(1430, '26-MNNGL', NULL, '2025-10-08', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1431, '31-NRTHC', NULL, '2025-10-08', 'AM', NULL, '06:00:00', '07:00:00', 'pending'),
(1432, '31-NRTHC', NULL, '2025-10-08', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1433, '31-NRTHC', NULL, '2025-10-08', 'AM', NULL, '13:00:00', '14:00:00', 'pending'),
(1434, '31-NRTHC', NULL, '2025-10-08', 'AM', NULL, '16:00:00', '17:00:00', 'pending'),
(1435, '39-STHCN', NULL, '2025-10-08', 'AM', NULL, '07:00:00', '08:00:00', 'pending'),
(1436, '39-STHCN', NULL, '2025-10-08', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1437, '39-STHCN', NULL, '2025-10-08', 'AM', NULL, '14:00:00', '15:00:00', 'pending'),
(1438, '39-STHCN', NULL, '2025-10-08', 'AM', NULL, '17:00:00', '18:00:00', 'pending'),
(1439, '20-IMPG', NULL, '2025-10-10', 'AM', NULL, '09:00:00', '10:00:00', 'pending'),
(1440, '25-MLBG', NULL, '2025-10-10', 'AM', NULL, '08:00:00', '10:00:00', 'pending'),
(1441, '42-TR', NULL, '2025-10-10', 'AM', NULL, '10:00:00', '12:00:00', 'pending'),
(1442, '05-AZCN', NULL, '2025-10-10', 'AM', NULL, '13:00:00', '15:00:00', 'pending'),
(1443, '11-BLWN', NULL, '2025-10-10', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1444, '31-NRTHC', NULL, '2025-10-10', 'AM', NULL, '06:00:00', '07:00:00', 'pending'),
(1445, '31-NRTHC', NULL, '2025-10-10', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1446, '31-NRTHC', NULL, '2025-10-10', 'AM', NULL, '13:00:00', '14:00:00', 'pending'),
(1447, '31-NRTHC', NULL, '2025-10-10', 'AM', NULL, '16:00:00', '17:00:00', 'pending'),
(1448, '39-STHCN', NULL, '2025-10-10', 'AM', NULL, '07:00:00', '08:00:00', 'pending'),
(1449, '39-STHCN', NULL, '2025-10-10', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1450, '39-STHCN', NULL, '2025-10-10', 'AM', NULL, '14:00:00', '15:00:00', 'pending'),
(1451, '39-STHCN', NULL, '2025-10-10', 'AM', NULL, '17:00:00', '18:00:00', 'pending'),
(1452, '20-IMPG', NULL, '2025-10-13', 'AM', NULL, '08:00:00', '10:00:00', 'pending'),
(1453, '42-TR', NULL, '2025-10-13', 'AM', NULL, '10:00:00', '12:00:00', 'pending'),
(1454, '07-BNHN', NULL, '2025-10-13', 'AM', NULL, '08:00:00', '09:00:00', 'pending'),
(1455, '13-CM', NULL, '2025-10-13', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1456, '06-BGNGS', NULL, '2025-10-13', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1457, '31-NRTHC', NULL, '2025-10-13', 'AM', NULL, '06:00:00', '07:00:00', 'pending'),
(1458, '31-NRTHC', NULL, '2025-10-13', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1459, '31-NRTHC', NULL, '2025-10-13', 'AM', NULL, '13:00:00', '14:00:00', 'pending'),
(1460, '31-NRTHC', NULL, '2025-10-13', 'AM', NULL, '16:00:00', '17:00:00', 'pending'),
(1461, '39-STHCN', NULL, '2025-10-13', 'AM', NULL, '07:00:00', '08:00:00', 'pending'),
(1462, '39-STHCN', NULL, '2025-10-13', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1463, '39-STHCN', NULL, '2025-10-13', 'AM', NULL, '14:00:00', '15:00:00', 'pending'),
(1464, '39-STHCN', NULL, '2025-10-13', 'AM', NULL, '17:00:00', '18:00:00', 'pending'),
(1465, '25-MLBG', NULL, '2025-10-14', 'AM', NULL, '08:00:00', '10:00:00', 'pending'),
(1466, '16-CRYRY', NULL, '2025-10-14', 'AM', NULL, '08:00:00', '09:00:00', 'pending'),
(1467, '21-LPLP', NULL, '2025-10-14', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1468, '23-LBGNS', NULL, '2025-10-14', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1469, '31-NRTHC', NULL, '2025-10-14', 'AM', NULL, '06:00:00', '07:00:00', 'pending'),
(1470, '31-NRTHC', NULL, '2025-10-14', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1471, '31-NRTHC', NULL, '2025-10-14', 'AM', NULL, '13:00:00', '14:00:00', 'pending'),
(1472, '31-NRTHC', NULL, '2025-10-14', 'AM', NULL, '16:00:00', '17:00:00', 'pending'),
(1473, '39-STHCN', NULL, '2025-10-14', 'AM', NULL, '07:00:00', '08:00:00', 'pending'),
(1474, '39-STHCN', NULL, '2025-10-14', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1475, '39-STHCN', NULL, '2025-10-14', 'AM', NULL, '14:00:00', '15:00:00', 'pending'),
(1476, '39-STHCN', NULL, '2025-10-14', 'AM', NULL, '17:00:00', '18:00:00', 'pending'),
(1477, '20-IMPG', NULL, '2025-10-15', 'AM', NULL, '08:00:00', '10:00:00', 'pending'),
(1478, '42-TR', NULL, '2025-10-15', 'AM', NULL, '10:00:00', '12:00:00', 'pending'),
(1479, '46-YB', NULL, '2025-10-15', 'AM', NULL, '09:00:00', '10:00:00', 'pending'),
(1480, '34-SLND', NULL, '2025-10-15', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1481, '31-NRTHC', NULL, '2025-10-15', 'AM', NULL, '06:00:00', '07:00:00', 'pending'),
(1482, '31-NRTHC', NULL, '2025-10-15', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1483, '31-NRTHC', NULL, '2025-10-15', 'AM', NULL, '13:00:00', '14:00:00', 'pending'),
(1484, '31-NRTHC', NULL, '2025-10-15', 'AM', NULL, '16:00:00', '17:00:00', 'pending'),
(1485, '39-STHCN', NULL, '2025-10-15', 'AM', NULL, '07:00:00', '08:00:00', 'pending'),
(1486, '39-STHCN', NULL, '2025-10-15', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1487, '39-STHCN', NULL, '2025-10-15', 'AM', NULL, '14:00:00', '15:00:00', 'pending'),
(1488, '39-STHCN', NULL, '2025-10-15', 'AM', NULL, '17:00:00', '18:00:00', 'pending'),
(1489, '19-GNGN', NULL, '2025-10-16', 'AM', NULL, '08:00:00', '11:00:00', 'pending'),
(1490, '09-BLSR', NULL, '2025-10-16', 'AM', NULL, '09:00:00', '10:00:00', 'pending'),
(1491, '02-ALTZ', NULL, '2025-10-16', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1492, '31-NRTHC', NULL, '2025-10-16', 'AM', NULL, '06:00:00', '07:00:00', 'pending'),
(1493, '31-NRTHC', NULL, '2025-10-16', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1494, '31-NRTHC', NULL, '2025-10-16', 'AM', NULL, '13:00:00', '14:00:00', 'pending'),
(1495, '31-NRTHC', NULL, '2025-10-16', 'AM', NULL, '16:00:00', '17:00:00', 'pending'),
(1496, '39-STHCN', NULL, '2025-10-16', 'AM', NULL, '07:00:00', '08:00:00', 'pending'),
(1497, '39-STHCN', NULL, '2025-10-16', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1498, '39-STHCN', NULL, '2025-10-16', 'AM', NULL, '14:00:00', '15:00:00', 'pending'),
(1499, '39-STHCN', NULL, '2025-10-16', 'AM', NULL, '17:00:00', '18:00:00', 'pending'),
(1500, '20-IMPG', NULL, '2025-10-17', 'AM', NULL, '09:00:00', '10:00:00', 'pending'),
(1501, '25-MLBG', NULL, '2025-10-17', 'AM', NULL, '08:00:00', '10:00:00', 'pending'),
(1502, '42-TR', NULL, '2025-10-17', 'AM', NULL, '10:00:00', '12:00:00', 'pending'),
(1503, '05-AZCN', NULL, '2025-10-17', 'AM', NULL, '13:00:00', '15:00:00', 'pending'),
(1504, '40-STHVL', NULL, '2025-10-17', 'AM', NULL, '09:00:00', '11:00:00', 'pending'),
(1505, '31-NRTHC', NULL, '2025-10-17', 'AM', NULL, '06:00:00', '07:00:00', 'pending'),
(1506, '31-NRTHC', NULL, '2025-10-17', 'AM', NULL, '10:00:00', '11:00:00', 'pending'),
(1507, '31-NRTHC', NULL, '2025-10-17', 'AM', NULL, '13:00:00', '14:00:00', 'pending'),
(1508, '31-NRTHC', NULL, '2025-10-17', 'AM', NULL, '16:00:00', '17:00:00', 'pending'),
(1509, '39-STHCN', NULL, '2025-10-17', 'AM', NULL, '07:00:00', '08:00:00', 'pending'),
(1510, '39-STHCN', NULL, '2025-10-17', 'AM', NULL, '11:00:00', '12:00:00', 'pending'),
(1511, '39-STHCN', NULL, '2025-10-17', 'AM', NULL, '14:00:00', '15:00:00', 'pending'),
(1512, '39-STHCN', NULL, '2025-10-17', 'AM', NULL, '17:00:00', '18:00:00', 'pending'),
(1576, '20-IMPG', NULL, '2025-11-21', 'AM', NULL, '09:00:00', '10:00:00', 'approved'),
(1577, '25-MLBG', NULL, '2025-11-21', 'AM', NULL, '08:00:00', '10:00:00', 'approved'),
(1578, '42-TR', NULL, '2025-11-21', 'AM', NULL, '10:00:00', '12:00:00', 'approved'),
(1579, '31-NRTHC', NULL, '2025-11-21', 'AM', NULL, '06:00:00', '07:00:00', 'approved'),
(1580, '31-NRTHC', NULL, '2025-11-21', 'AM', NULL, '10:00:00', '11:00:00', 'approved'),
(1581, '39-STHCN', NULL, '2025-11-21', 'AM', NULL, '07:00:00', '08:00:00', 'approved'),
(1582, '39-STHCN', NULL, '2025-11-21', 'AM', NULL, '11:00:00', '12:00:00', 'approved'),
(1583, '46-YB', NULL, '2025-11-21', 'AM', NULL, '09:00:00', '10:00:00', 'approved'),
(1584, '20-IMPG', NULL, '2025-11-24', 'AM', NULL, '08:00:00', '10:00:00', 'approved'),
(1585, '42-TR', NULL, '2025-11-24', 'AM', NULL, '10:00:00', '12:00:00', 'approved'),
(1586, '31-NRTHC', NULL, '2025-11-24', 'AM', NULL, '06:00:00', '07:00:00', 'approved'),
(1587, '31-NRTHC', NULL, '2025-11-24', 'AM', NULL, '10:00:00', '11:00:00', 'approved'),
(1588, '39-STHCN', NULL, '2025-11-24', 'AM', NULL, '07:00:00', '08:00:00', 'approved'),
(1589, '39-STHCN', NULL, '2025-11-24', 'AM', NULL, '11:00:00', '12:00:00', 'approved'),
(1590, '30-MNTL', NULL, '2025-11-24', 'AM', NULL, '09:00:00', '10:00:00', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `collection_team`
--

CREATE TABLE `collection_team` (
  `team_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `truck_id` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `session` enum('AM','PM') NOT NULL DEFAULT 'AM',
  `attendance_snapshot` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `collection_team`
--

INSERT INTO `collection_team` (`team_id`, `schedule_id`, `truck_id`, `driver_id`, `session`, `attendance_snapshot`, `status`) VALUES
(1163, 1427, 1, 16, 'AM', NULL, 'pending'),
(1164, 1428, 1, 16, 'AM', NULL, 'pending'),
(1165, 1429, 2, 17, 'AM', NULL, 'accepted'),
(1166, 1430, 2, 17, 'AM', NULL, 'accepted'),
(1167, 1431, 1, 16, 'AM', NULL, 'pending'),
(1168, 1432, 1, 16, 'AM', NULL, 'pending'),
(1169, 1433, 1, 16, 'AM', NULL, 'pending'),
(1170, 1434, 1, 16, 'AM', NULL, 'pending'),
(1171, 1435, 1, 16, 'AM', NULL, 'pending'),
(1172, 1436, 1, 16, 'AM', NULL, 'pending'),
(1173, 1437, 1, 16, 'AM', NULL, 'pending'),
(1174, 1438, 1, 16, 'AM', NULL, 'pending'),
(1175, 1439, 1, 16, 'AM', NULL, 'pending'),
(1176, 1440, 1, 16, 'AM', NULL, 'pending'),
(1177, 1441, 1, 16, 'AM', NULL, 'pending'),
(1178, 1442, 1, 16, 'AM', NULL, 'pending'),
(1179, 1443, 2, 17, 'AM', NULL, 'pending'),
(1180, 1444, 1, 16, 'AM', NULL, 'pending'),
(1181, 1445, 1, 16, 'AM', NULL, 'pending'),
(1182, 1446, 1, 16, 'AM', NULL, 'pending'),
(1183, 1447, 1, 16, 'AM', NULL, 'pending'),
(1184, 1448, 1, 16, 'AM', NULL, 'pending'),
(1185, 1449, 1, 16, 'AM', NULL, 'pending'),
(1186, 1450, 1, 16, 'AM', NULL, 'pending'),
(1187, 1451, 1, 16, 'AM', NULL, 'pending'),
(1188, 1452, 1, 16, 'AM', NULL, 'pending'),
(1189, 1453, 1, 16, 'AM', NULL, 'pending'),
(1190, 1454, 2, 17, 'AM', NULL, 'pending'),
(1191, 1455, 2, 17, 'AM', NULL, 'pending'),
(1192, 1456, 2, 17, 'AM', NULL, 'pending'),
(1193, 1457, 1, 16, 'AM', NULL, 'pending'),
(1194, 1458, 1, 16, 'AM', NULL, 'pending'),
(1195, 1459, 1, 16, 'AM', NULL, 'pending'),
(1196, 1460, 1, 16, 'AM', NULL, 'pending'),
(1197, 1461, 1, 16, 'AM', NULL, 'pending'),
(1198, 1462, 1, 16, 'AM', NULL, 'pending'),
(1199, 1463, 1, 16, 'AM', NULL, 'pending'),
(1200, 1464, 1, 16, 'AM', NULL, 'pending'),
(1201, 1465, 1, 16, 'AM', NULL, 'pending'),
(1202, 1466, 2, 17, 'AM', NULL, 'pending'),
(1203, 1467, 2, 17, 'AM', NULL, 'pending'),
(1204, 1468, 2, 17, 'AM', NULL, 'pending'),
(1205, 1469, 1, 16, 'AM', NULL, 'pending'),
(1206, 1470, 1, 16, 'AM', NULL, 'pending'),
(1207, 1471, 1, 16, 'AM', NULL, 'pending'),
(1208, 1472, 1, 16, 'AM', NULL, 'pending'),
(1209, 1473, 1, 16, 'AM', NULL, 'pending'),
(1210, 1474, 1, 16, 'AM', NULL, 'pending'),
(1211, 1475, 1, 16, 'AM', NULL, 'pending'),
(1212, 1476, 1, 16, 'AM', NULL, 'pending'),
(1213, 1477, 1, 16, 'AM', NULL, 'pending'),
(1214, 1478, 1, 16, 'AM', NULL, 'pending'),
(1215, 1479, 2, 17, 'AM', NULL, 'pending'),
(1216, 1480, 2, 17, 'AM', NULL, 'pending'),
(1217, 1481, 1, 16, 'AM', NULL, 'pending'),
(1218, 1482, 1, 16, 'AM', NULL, 'pending'),
(1219, 1483, 1, 16, 'AM', NULL, 'pending'),
(1220, 1484, 1, 16, 'AM', NULL, 'pending'),
(1221, 1485, 1, 16, 'AM', NULL, 'pending'),
(1222, 1486, 1, 16, 'AM', NULL, 'pending'),
(1223, 1487, 1, 16, 'AM', NULL, 'pending'),
(1224, 1488, 1, 16, 'AM', NULL, 'pending'),
(1225, 1489, 1, 16, 'AM', NULL, 'pending'),
(1226, 1490, 2, 17, 'AM', NULL, 'pending'),
(1227, 1491, 2, 17, 'AM', NULL, 'pending'),
(1228, 1492, 1, 16, 'AM', NULL, 'pending'),
(1229, 1493, 1, 16, 'AM', NULL, 'pending'),
(1230, 1494, 1, 16, 'AM', NULL, 'pending'),
(1231, 1495, 1, 16, 'AM', NULL, 'pending'),
(1232, 1496, 1, 16, 'AM', NULL, 'pending'),
(1233, 1497, 1, 16, 'AM', NULL, 'pending'),
(1234, 1498, 1, 16, 'AM', NULL, 'pending'),
(1235, 1499, 1, 16, 'AM', NULL, 'pending'),
(1236, 1500, 1, 16, 'AM', NULL, 'pending'),
(1237, 1501, 1, 16, 'AM', NULL, 'pending'),
(1238, 1502, 1, 16, 'AM', NULL, 'pending'),
(1239, 1503, 1, 16, 'AM', NULL, 'pending'),
(1240, 1504, 2, 17, 'AM', NULL, 'pending'),
(1241, 1505, 1, 16, 'AM', NULL, 'pending'),
(1242, 1506, 1, 16, 'AM', NULL, 'pending'),
(1243, 1507, 1, 16, 'AM', NULL, 'pending'),
(1244, 1508, 1, 16, 'AM', NULL, 'pending'),
(1245, 1509, 1, 16, 'AM', NULL, 'pending'),
(1246, 1510, 1, 16, 'AM', NULL, 'pending'),
(1247, 1511, 1, 16, 'AM', NULL, 'pending'),
(1248, 1512, 1, 16, 'AM', NULL, 'pending'),
(1312, 1576, 1, 16, 'AM', '{\"driver_attendance_id\":2,\"collector_attendance_ids\":[3,4,5]}', 'approved'),
(1313, 1577, 1, 16, 'AM', '{\"driver_attendance_id\":2,\"collector_attendance_ids\":[3,4,5]}', 'approved'),
(1314, 1578, 1, 16, 'AM', '{\"driver_attendance_id\":2,\"collector_attendance_ids\":[3,4,5]}', 'approved'),
(1315, 1579, 1, 16, 'AM', '{\"driver_attendance_id\":2,\"collector_attendance_ids\":[3,4,5]}', 'approved'),
(1316, 1580, 1, 16, 'AM', '{\"driver_attendance_id\":2,\"collector_attendance_ids\":[3,4,5]}', 'approved'),
(1317, 1581, 1, 16, 'AM', '{\"driver_attendance_id\":2,\"collector_attendance_ids\":[3,4,5]}', 'approved'),
(1318, 1582, 1, 16, 'AM', '{\"driver_attendance_id\":2,\"collector_attendance_ids\":[3,4,5]}', 'approved'),
(1319, 1583, 2, 17, 'AM', '{\"driver_attendance_id\":1,\"collector_attendance_ids\":[6]}', 'approved'),
(1320, 1584, 1, 16, 'AM', '{\"driver_attendance_id\":13,\"collector_attendance_ids\":[11,10]}', 'approved'),
(1321, 1585, 1, 16, 'AM', '{\"driver_attendance_id\":13,\"collector_attendance_ids\":[11,10]}', 'approved'),
(1322, 1586, 1, 16, 'AM', '{\"driver_attendance_id\":13,\"collector_attendance_ids\":[11,10]}', 'approved'),
(1323, 1587, 1, 16, 'AM', '{\"driver_attendance_id\":13,\"collector_attendance_ids\":[11,10]}', 'approved'),
(1324, 1588, 1, 16, 'AM', '{\"driver_attendance_id\":13,\"collector_attendance_ids\":[11,10]}', 'approved'),
(1325, 1589, 1, 16, 'AM', '{\"driver_attendance_id\":13,\"collector_attendance_ids\":[11,10]}', 'approved'),
(1326, 1590, 2, 17, 'AM', '{\"driver_attendance_id\":12,\"collector_attendance_ids\":[9,8]}', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `collection_team_member`
--

CREATE TABLE `collection_team_member` (
  `team_member_id` int(11) NOT NULL,
  `team_id` int(11) DEFAULT NULL,
  `collector_id` int(11) DEFAULT NULL,
  `response_status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `collection_team_member`
--

INSERT INTO `collection_team_member` (`team_member_id`, `team_id`, `collector_id`, `response_status`) VALUES
(3463, 1163, 28, 'pending'),
(3464, 1163, 29, 'pending'),
(3465, 1163, 30, 'accepted'),
(3466, 1164, 28, 'pending'),
(3467, 1164, 29, 'pending'),
(3468, 1164, 30, 'accepted'),
(3469, 1165, 33, 'pending'),
(3470, 1165, 34, 'pending'),
(3471, 1165, 29, 'pending'),
(3472, 1166, 33, 'pending'),
(3473, 1166, 34, 'pending'),
(3474, 1166, 29, 'pending'),
(3475, 1167, 28, 'pending'),
(3476, 1167, 29, 'pending'),
(3477, 1167, 30, 'accepted'),
(3478, 1168, 28, 'pending'),
(3479, 1168, 29, 'pending'),
(3480, 1168, 30, 'accepted'),
(3481, 1169, 28, 'pending'),
(3482, 1169, 29, 'pending'),
(3483, 1169, 30, 'accepted'),
(3484, 1170, 28, 'pending'),
(3485, 1170, 29, 'pending'),
(3486, 1170, 30, 'accepted'),
(3487, 1171, 28, 'pending'),
(3488, 1171, 29, 'pending'),
(3489, 1171, 30, 'accepted'),
(3490, 1172, 28, 'pending'),
(3491, 1172, 29, 'pending'),
(3492, 1172, 30, 'accepted'),
(3493, 1173, 28, 'pending'),
(3494, 1173, 29, 'pending'),
(3495, 1173, 30, 'accepted'),
(3496, 1174, 28, 'pending'),
(3497, 1174, 29, 'pending'),
(3498, 1174, 30, 'accepted'),
(3499, 1175, 28, 'pending'),
(3500, 1175, 29, 'pending'),
(3501, 1175, 30, 'pending'),
(3502, 1176, 28, 'pending'),
(3503, 1176, 29, 'pending'),
(3504, 1176, 30, 'pending'),
(3505, 1177, 28, 'pending'),
(3506, 1177, 29, 'pending'),
(3507, 1177, 30, 'pending'),
(3508, 1178, 28, 'pending'),
(3509, 1178, 29, 'pending'),
(3510, 1178, 30, 'pending'),
(3511, 1179, 33, 'pending'),
(3512, 1179, 34, 'pending'),
(3513, 1179, 35, 'pending'),
(3514, 1180, 28, 'pending'),
(3515, 1180, 29, 'pending'),
(3516, 1180, 30, 'pending'),
(3517, 1181, 28, 'pending'),
(3518, 1181, 29, 'pending'),
(3519, 1181, 30, 'pending'),
(3520, 1182, 28, 'pending'),
(3521, 1182, 29, 'pending'),
(3522, 1182, 30, 'pending'),
(3523, 1183, 28, 'pending'),
(3524, 1183, 29, 'pending'),
(3525, 1183, 30, 'pending'),
(3526, 1184, 28, 'pending'),
(3527, 1184, 29, 'pending'),
(3528, 1184, 30, 'pending'),
(3529, 1185, 28, 'pending'),
(3530, 1185, 29, 'pending'),
(3531, 1185, 30, 'pending'),
(3532, 1186, 28, 'pending'),
(3533, 1186, 29, 'pending'),
(3534, 1186, 30, 'pending'),
(3535, 1187, 28, 'pending'),
(3536, 1187, 29, 'pending'),
(3537, 1187, 30, 'pending'),
(3538, 1188, 28, 'pending'),
(3539, 1188, 29, 'pending'),
(3540, 1188, 30, 'pending'),
(3541, 1189, 28, 'pending'),
(3542, 1189, 29, 'pending'),
(3543, 1189, 30, 'pending'),
(3544, 1190, 33, 'pending'),
(3545, 1190, 34, 'pending'),
(3546, 1190, 35, 'pending'),
(3547, 1191, 33, 'pending'),
(3548, 1191, 34, 'pending'),
(3549, 1191, 35, 'pending'),
(3550, 1192, 33, 'pending'),
(3551, 1192, 34, 'pending'),
(3552, 1192, 35, 'pending'),
(3553, 1193, 28, 'pending'),
(3554, 1193, 29, 'pending'),
(3555, 1193, 30, 'pending'),
(3556, 1194, 28, 'pending'),
(3557, 1194, 29, 'pending'),
(3558, 1194, 30, 'pending'),
(3559, 1195, 28, 'pending'),
(3560, 1195, 29, 'pending'),
(3561, 1195, 30, 'pending'),
(3562, 1196, 28, 'pending'),
(3563, 1196, 29, 'pending'),
(3564, 1196, 30, 'pending'),
(3565, 1197, 28, 'pending'),
(3566, 1197, 29, 'pending'),
(3567, 1197, 30, 'pending'),
(3568, 1198, 28, 'pending'),
(3569, 1198, 29, 'pending'),
(3570, 1198, 30, 'pending'),
(3571, 1199, 28, 'pending'),
(3572, 1199, 29, 'pending'),
(3573, 1199, 30, 'pending'),
(3574, 1200, 28, 'pending'),
(3575, 1200, 29, 'pending'),
(3576, 1200, 30, 'pending'),
(3577, 1201, 28, 'pending'),
(3578, 1201, 29, 'pending'),
(3579, 1201, 30, 'pending'),
(3580, 1202, 33, 'pending'),
(3581, 1202, 34, 'pending'),
(3582, 1202, 35, 'pending'),
(3583, 1203, 33, 'pending'),
(3584, 1203, 34, 'pending'),
(3585, 1203, 35, 'pending'),
(3586, 1204, 33, 'pending'),
(3587, 1204, 34, 'pending'),
(3588, 1204, 35, 'pending'),
(3589, 1205, 28, 'pending'),
(3590, 1205, 29, 'pending'),
(3591, 1205, 30, 'pending'),
(3592, 1206, 28, 'pending'),
(3593, 1206, 29, 'pending'),
(3594, 1206, 30, 'pending'),
(3595, 1207, 28, 'pending'),
(3596, 1207, 29, 'pending'),
(3597, 1207, 30, 'pending'),
(3598, 1208, 28, 'pending'),
(3599, 1208, 29, 'pending'),
(3600, 1208, 30, 'pending'),
(3601, 1209, 28, 'pending'),
(3602, 1209, 29, 'pending'),
(3603, 1209, 30, 'pending'),
(3604, 1210, 28, 'pending'),
(3605, 1210, 29, 'pending'),
(3606, 1210, 30, 'pending'),
(3607, 1211, 28, 'pending'),
(3608, 1211, 29, 'pending'),
(3609, 1211, 30, 'pending'),
(3610, 1212, 28, 'pending'),
(3611, 1212, 29, 'pending'),
(3612, 1212, 30, 'pending'),
(3613, 1213, 28, 'pending'),
(3614, 1213, 29, 'pending'),
(3615, 1213, 30, 'pending'),
(3616, 1214, 28, 'pending'),
(3617, 1214, 29, 'pending'),
(3618, 1214, 30, 'pending'),
(3619, 1215, 33, 'pending'),
(3620, 1215, 34, 'pending'),
(3621, 1215, 35, 'pending'),
(3622, 1216, 33, 'pending'),
(3623, 1216, 34, 'pending'),
(3624, 1216, 35, 'pending'),
(3625, 1217, 28, 'pending'),
(3626, 1217, 29, 'pending'),
(3627, 1217, 30, 'pending'),
(3628, 1218, 28, 'pending'),
(3629, 1218, 29, 'pending'),
(3630, 1218, 30, 'pending'),
(3631, 1219, 28, 'pending'),
(3632, 1219, 29, 'pending'),
(3633, 1219, 30, 'pending'),
(3634, 1220, 28, 'pending'),
(3635, 1220, 29, 'pending'),
(3636, 1220, 30, 'pending'),
(3637, 1221, 28, 'pending'),
(3638, 1221, 29, 'pending'),
(3639, 1221, 30, 'pending'),
(3640, 1222, 28, 'pending'),
(3641, 1222, 29, 'pending'),
(3642, 1222, 30, 'pending'),
(3643, 1223, 28, 'pending'),
(3644, 1223, 29, 'pending'),
(3645, 1223, 30, 'pending'),
(3646, 1224, 28, 'pending'),
(3647, 1224, 29, 'pending'),
(3898, 1312, 30, 'approved'),
(3899, 1312, 35, 'approved'),
(3900, 1312, 29, 'approved'),
(3901, 1313, 30, 'approved'),
(3902, 1313, 35, 'approved'),
(3903, 1313, 29, 'approved'),
(3904, 1314, 30, 'approved'),
(3905, 1314, 35, 'approved'),
(3906, 1314, 29, 'approved'),
(3907, 1315, 30, 'approved'),
(3908, 1315, 35, 'approved'),
(3909, 1315, 29, 'approved'),
(3910, 1316, 30, 'approved'),
(3911, 1316, 35, 'approved'),
(3912, 1316, 29, 'approved'),
(3913, 1317, 30, 'approved'),
(3914, 1317, 35, 'approved'),
(3915, 1317, 29, 'approved'),
(3916, 1318, 30, 'approved'),
(3917, 1318, 35, 'approved'),
(3918, 1318, 29, 'approved'),
(3919, 1319, 33, 'approved'),
(3920, 1320, 30, 'approved'),
(3921, 1320, 35, 'approved'),
(3922, 1321, 30, 'approved'),
(3923, 1321, 35, 'approved'),
(3924, 1322, 30, 'approved'),
(3925, 1322, 35, 'approved'),
(3926, 1323, 30, 'approved'),
(3927, 1323, 35, 'approved'),
(3928, 1324, 30, 'approved'),
(3929, 1324, 35, 'approved'),
(3930, 1325, 30, 'approved'),
(3931, 1325, 35, 'approved'),
(3932, 1326, 31, 'approved'),
(3933, 1326, 28, 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `collection_type`
--

CREATE TABLE `collection_type` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_route`
--

CREATE TABLE `daily_route` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `cluster_id` varchar(50) DEFAULT NULL,
  `barangay_id` varchar(50) DEFAULT NULL,
  `barangay_name` varchar(100) DEFAULT NULL,
  `truck_id` bigint(20) DEFAULT NULL,
  `team_id` bigint(20) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','missed','cancelled') NOT NULL DEFAULT 'scheduled',
  `source` enum('generated','manual') NOT NULL DEFAULT 'generated',
  `version` int(11) NOT NULL DEFAULT 1,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `duration_min` int(11) DEFAULT NULL,
  `capacity_used_kg` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_route`
--

INSERT INTO `daily_route` (`id`, `date`, `cluster_id`, `barangay_id`, `barangay_name`, `truck_id`, `team_id`, `start_time`, `end_time`, `status`, `source`, `version`, `distance_km`, `duration_min`, `capacity_used_kg`, `notes`, `created_at`, `updated_at`) VALUES
(530, '2025-10-08', '1C-PB', '20-IMPG', 'Impig', 1, 1163, '08:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(531, '2025-10-08', '1C-PB', '42-TR', 'Tara', 1, 1164, '10:00:00', '12:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(532, '2025-10-08', '3C-CB', '22-LBGNJ', 'Lubigan Jr.', 2, 1165, '09:00:00', '10:00:00', 'in_progress', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 02:05:37'),
(533, '2025-10-08', '3C-CB', '26-MNNGL', 'Manangle', 2, 1166, '10:00:00', '11:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(534, '2025-10-08', '1C-PB', '31-NRTHC', 'North Centro', 1, 1167, '06:00:00', '07:00:00', 'completed', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 01:32:39'),
(535, '2025-10-08', '1C-PB', '31-NRTHC', 'North Centro', 1, 1168, '10:00:00', '11:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(536, '2025-10-08', '1C-PB', '31-NRTHC', 'North Centro', 1, 1169, '13:00:00', '14:00:00', 'scheduled', 'generated', 5, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(537, '2025-10-08', '1C-PB', '31-NRTHC', 'North Centro', 1, 1170, '16:00:00', '17:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(538, '2025-10-08', '1C-PB', '39-STHCN', 'South Centro', 1, 1171, '07:00:00', '08:00:00', 'in_progress', 'generated', 7, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 01:32:40'),
(539, '2025-10-08', '1C-PB', '39-STHCN', 'South Centro', 1, 1172, '11:00:00', '12:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(540, '2025-10-08', '1C-PB', '39-STHCN', 'South Centro', 1, 1173, '14:00:00', '15:00:00', 'scheduled', 'generated', 9, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(541, '2025-10-08', '1C-PB', '39-STHCN', 'South Centro', 1, 1174, '17:00:00', '18:00:00', 'scheduled', 'generated', 10, NULL, NULL, NULL, NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(542, '2025-10-10', '1C-PB', '20-IMPG', 'Impig', 1, 1175, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(543, '2025-10-10', '1C-PB', '25-MLBG', 'Malubago', 1, 1176, '08:00:00', '10:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(544, '2025-10-10', '1C-PB', '42-TR', 'Tara', 1, 1177, '10:00:00', '12:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(545, '2025-10-10', '1C-PB', '05-AZCN', 'Azucena', 1, 1178, '13:00:00', '15:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(546, '2025-10-10', '3C-CB', '11-BLWN', 'Bulawan', 2, 1179, '11:00:00', '12:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(547, '2025-10-10', '1C-PB', '31-NRTHC', 'North Centro', 1, 1180, '06:00:00', '07:00:00', 'scheduled', 'generated', 5, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(548, '2025-10-10', '1C-PB', '31-NRTHC', 'North Centro', 1, 1181, '10:00:00', '11:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(549, '2025-10-10', '1C-PB', '31-NRTHC', 'North Centro', 1, 1182, '13:00:00', '14:00:00', 'scheduled', 'generated', 7, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(550, '2025-10-10', '1C-PB', '31-NRTHC', 'North Centro', 1, 1183, '16:00:00', '17:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(551, '2025-10-10', '1C-PB', '39-STHCN', 'South Centro', 1, 1184, '07:00:00', '08:00:00', 'scheduled', 'generated', 9, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(552, '2025-10-10', '1C-PB', '39-STHCN', 'South Centro', 1, 1185, '11:00:00', '12:00:00', 'scheduled', 'generated', 10, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(553, '2025-10-10', '1C-PB', '39-STHCN', 'South Centro', 1, 1186, '14:00:00', '15:00:00', 'scheduled', 'generated', 11, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(554, '2025-10-10', '1C-PB', '39-STHCN', 'South Centro', 1, 1187, '17:00:00', '18:00:00', 'scheduled', 'generated', 12, NULL, NULL, NULL, NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(555, '2025-10-13', '1C-PB', '20-IMPG', 'Impig', 1, 1188, '08:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(556, '2025-10-13', '1C-PB', '42-TR', 'Tara', 1, 1189, '10:00:00', '12:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(557, '2025-10-13', '3C-CB', '07-BNHN', 'Binahian', 2, 1190, '08:00:00', '09:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(558, '2025-10-13', '3C-CB', '13-CM', 'Caima', 2, 1191, '10:00:00', '11:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(559, '2025-10-13', '3C-CB', '06-BGNGS', 'Bagong Sirang', 2, 1192, '11:00:00', '12:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(560, '2025-10-13', '1C-PB', '31-NRTHC', 'North Centro', 1, 1193, '06:00:00', '07:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(561, '2025-10-13', '1C-PB', '31-NRTHC', 'North Centro', 1, 1194, '10:00:00', '11:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(562, '2025-10-13', '1C-PB', '31-NRTHC', 'North Centro', 1, 1195, '13:00:00', '14:00:00', 'scheduled', 'generated', 5, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(563, '2025-10-13', '1C-PB', '31-NRTHC', 'North Centro', 1, 1196, '16:00:00', '17:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(564, '2025-10-13', '1C-PB', '39-STHCN', 'South Centro', 1, 1197, '07:00:00', '08:00:00', 'scheduled', 'generated', 7, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(565, '2025-10-13', '1C-PB', '39-STHCN', 'South Centro', 1, 1198, '11:00:00', '12:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(566, '2025-10-13', '1C-PB', '39-STHCN', 'South Centro', 1, 1199, '14:00:00', '15:00:00', 'scheduled', 'generated', 9, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(567, '2025-10-13', '1C-PB', '39-STHCN', 'South Centro', 1, 1200, '17:00:00', '18:00:00', 'scheduled', 'generated', 10, NULL, NULL, NULL, NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(568, '2025-10-14', '1C-PB', '25-MLBG', 'Malubago', 1, 1201, '08:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(569, '2025-10-14', '3C-CB', '16-CRYRY', 'Carayrayan', 2, 1202, '08:00:00', '09:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(570, '2025-10-14', '3C-CB', '21-LPLP', 'Lipilip', 2, 1203, '10:00:00', '11:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(571, '2025-10-14', '3C-CB', '23-LBGNS', 'Lubigan Sr.', 2, 1204, '11:00:00', '12:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(572, '2025-10-14', '1C-PB', '31-NRTHC', 'North Centro', 1, 1205, '06:00:00', '07:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(573, '2025-10-14', '1C-PB', '31-NRTHC', 'North Centro', 1, 1206, '10:00:00', '11:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(574, '2025-10-14', '1C-PB', '31-NRTHC', 'North Centro', 1, 1207, '13:00:00', '14:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(575, '2025-10-14', '1C-PB', '31-NRTHC', 'North Centro', 1, 1208, '16:00:00', '17:00:00', 'scheduled', 'generated', 5, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(576, '2025-10-14', '1C-PB', '39-STHCN', 'South Centro', 1, 1209, '07:00:00', '08:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(577, '2025-10-14', '1C-PB', '39-STHCN', 'South Centro', 1, 1210, '11:00:00', '12:00:00', 'scheduled', 'generated', 7, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(578, '2025-10-14', '1C-PB', '39-STHCN', 'South Centro', 1, 1211, '14:00:00', '15:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(579, '2025-10-14', '1C-PB', '39-STHCN', 'South Centro', 1, 1212, '17:00:00', '18:00:00', 'scheduled', 'generated', 9, NULL, NULL, NULL, NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(580, '2025-10-15', '1C-PB', '20-IMPG', 'Impig', 1, 1213, '08:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(581, '2025-10-15', '1C-PB', '42-TR', 'Tara', 1, 1214, '10:00:00', '12:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(582, '2025-10-15', '4C-CC', '46-YB', 'Yabo', 2, 1215, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(583, '2025-10-15', '4C-CC', '34-SLND', 'Salanda', 2, 1216, '10:00:00', '11:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(584, '2025-10-15', '1C-PB', '31-NRTHC', 'North Centro', 1, 1217, '06:00:00', '07:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(585, '2025-10-15', '1C-PB', '31-NRTHC', 'North Centro', 1, 1218, '10:00:00', '11:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(586, '2025-10-15', '1C-PB', '31-NRTHC', 'North Centro', 1, 1219, '13:00:00', '14:00:00', 'scheduled', 'generated', 5, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(587, '2025-10-15', '1C-PB', '31-NRTHC', 'North Centro', 1, 1220, '16:00:00', '17:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(588, '2025-10-15', '1C-PB', '39-STHCN', 'South Centro', 1, 1221, '07:00:00', '08:00:00', 'scheduled', 'generated', 7, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(589, '2025-10-15', '1C-PB', '39-STHCN', 'South Centro', 1, 1222, '11:00:00', '12:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(590, '2025-10-15', '1C-PB', '39-STHCN', 'South Centro', 1, 1223, '14:00:00', '15:00:00', 'scheduled', 'generated', 9, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(591, '2025-10-15', '1C-PB', '39-STHCN', 'South Centro', 1, 1224, '17:00:00', '18:00:00', 'scheduled', 'generated', 10, NULL, NULL, NULL, NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(592, '2025-10-16', '1C-PB', '19-GNGN', 'Gaongan', 1, 1225, '08:00:00', '11:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(593, '2025-10-16', '4C-CC', '09-BLSR', 'Bolo Sur', 2, 1226, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(594, '2025-10-16', '4C-CC', '02-ALTZ', 'Alteza', 2, 1227, '10:00:00', '11:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(595, '2025-10-16', '1C-PB', '31-NRTHC', 'North Centro', 1, 1228, '06:00:00', '07:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(596, '2025-10-16', '1C-PB', '31-NRTHC', 'North Centro', 1, 1229, '10:00:00', '11:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(597, '2025-10-16', '1C-PB', '31-NRTHC', 'North Centro', 1, 1230, '13:00:00', '14:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(598, '2025-10-16', '1C-PB', '31-NRTHC', 'North Centro', 1, 1231, '16:00:00', '17:00:00', 'scheduled', 'generated', 5, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(599, '2025-10-16', '1C-PB', '39-STHCN', 'South Centro', 1, 1232, '07:00:00', '08:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(600, '2025-10-16', '1C-PB', '39-STHCN', 'South Centro', 1, 1233, '11:00:00', '12:00:00', 'scheduled', 'generated', 7, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(601, '2025-10-16', '1C-PB', '39-STHCN', 'South Centro', 1, 1234, '14:00:00', '15:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(602, '2025-10-16', '1C-PB', '39-STHCN', 'South Centro', 1, 1235, '17:00:00', '18:00:00', 'scheduled', 'generated', 9, NULL, NULL, NULL, NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(603, '2025-10-17', '1C-PB', '20-IMPG', 'Impig', 1, 1236, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(604, '2025-10-17', '1C-PB', '25-MLBG', 'Malubago', 1, 1237, '08:00:00', '10:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(605, '2025-10-17', '1C-PB', '42-TR', 'Tara', 1, 1238, '10:00:00', '12:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(606, '2025-10-17', '1C-PB', '05-AZCN', 'Azucena', 1, 1239, '13:00:00', '15:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(607, '2025-10-17', '4C-CC', '40-STHVL', 'South Villazar', 2, 1240, '09:00:00', '11:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(608, '2025-10-17', '1C-PB', '31-NRTHC', 'North Centro', 1, 1241, '06:00:00', '07:00:00', 'scheduled', 'generated', 5, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(609, '2025-10-17', '1C-PB', '31-NRTHC', 'North Centro', 1, 1242, '10:00:00', '11:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(610, '2025-10-17', '1C-PB', '31-NRTHC', 'North Centro', 1, 1243, '13:00:00', '14:00:00', 'scheduled', 'generated', 7, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(611, '2025-10-17', '1C-PB', '31-NRTHC', 'North Centro', 1, 1244, '16:00:00', '17:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(612, '2025-10-17', '1C-PB', '39-STHCN', 'South Centro', 1, 1245, '07:00:00', '08:00:00', 'scheduled', 'generated', 9, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(613, '2025-10-17', '1C-PB', '39-STHCN', 'South Centro', 1, 1246, '11:00:00', '12:00:00', 'scheduled', 'generated', 10, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(614, '2025-10-17', '1C-PB', '39-STHCN', 'South Centro', 1, 1247, '14:00:00', '15:00:00', 'scheduled', 'generated', 11, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(615, '2025-10-17', '1C-PB', '39-STHCN', 'South Centro', 1, 1248, '17:00:00', '18:00:00', 'scheduled', 'generated', 12, NULL, NULL, NULL, NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(616, '2025-11-21', '1C-PB', '20-IMPG', 'Impig', 1, 1163, '09:00:00', '10:00:00', 'completed', 'generated', 1, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 12:23:37'),
(617, '2025-11-21', '1C-PB', '25-MLBG', 'Malubago', 2, 1164, '08:00:00', '10:00:00', 'completed', 'generated', 2, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 11:28:42'),
(618, '2025-11-21', '1C-PB', '42-TR', 'Tara', 1, 1165, '10:00:00', '12:00:00', 'scheduled', 'generated', 3, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(619, '2025-11-21', '1C-PB', '05-AZCN', 'Azucena', 2, 1166, '13:00:00', '15:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(620, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 1, 1167, '06:00:00', '07:00:00', 'completed', 'generated', 5, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 10:01:20'),
(621, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 2, 1168, '10:00:00', '11:00:00', 'in_progress', 'generated', 6, NULL, NULL, NULL, '{\"truck_full\":false,\"truck_full_timestamp\":\"2025-11-23T00:30:41+01:00\",\"truck_full_collector_id\":30,\"truck_full_cleared_at\":\"2025-11-22T23:31:24.784Z\"}', '2025-11-22 05:24:45', '2025-11-22 12:31:24'),
(622, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 1, 1169, '13:00:00', '14:00:00', 'scheduled', 'generated', 7, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(623, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 2, 1170, '16:00:00', '17:00:00', 'scheduled', 'generated', 8, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(624, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 1, 1171, '07:00:00', '08:00:00', 'completed', 'generated', 9, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 10:15:52'),
(625, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 2, 1172, '11:00:00', '12:00:00', 'scheduled', 'generated', 10, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(626, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 1, 1173, '14:00:00', '15:00:00', 'scheduled', 'generated', 11, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(627, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 2, 1174, '17:00:00', '18:00:00', 'scheduled', 'generated', 12, NULL, NULL, NULL, NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(632, '2025-11-21', '1C-PB', '20-IMPG', 'Impig', 1, 1163, '09:00:00', '10:00:00', 'scheduled', 'generated', 13, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(633, '2025-11-21', '1C-PB', '25-MLBG', 'Malubago', 2, 1164, '08:00:00', '10:00:00', 'in_progress', 'generated', 14, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-24 08:39:01'),
(634, '2025-11-21', '1C-PB', '42-TR', 'Tara', 1, 1165, '10:00:00', '12:00:00', 'scheduled', 'generated', 15, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(635, '2025-11-21', '1C-PB', '05-AZCN', 'Azucena', 2, 1166, '13:00:00', '15:00:00', 'scheduled', 'generated', 16, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(636, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 1, 1167, '06:00:00', '07:00:00', 'scheduled', 'generated', 17, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(637, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 2, 1168, '10:00:00', '11:00:00', 'scheduled', 'generated', 18, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(638, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 1, 1169, '13:00:00', '14:00:00', 'scheduled', 'generated', 19, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(639, '2025-11-21', '1C-PB', '31-NRTHC', 'North Centro', 2, 1170, '16:00:00', '17:00:00', 'scheduled', 'generated', 20, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(640, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 1, 1171, '07:00:00', '08:00:00', 'scheduled', 'generated', 21, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(641, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 2, 1172, '11:00:00', '12:00:00', 'scheduled', 'generated', 22, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(642, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 1, 1173, '14:00:00', '15:00:00', 'scheduled', 'generated', 23, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(643, '2025-11-21', '1C-PB', '39-STHCN', 'South Centro', 2, 1174, '17:00:00', '18:00:00', 'scheduled', 'generated', 24, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(644, '2025-11-21', '2C-CA', '44-TLTL', 'Tula-tula', 1, 1175, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(645, '2025-11-21', '3C-CB', '21-LPLP', 'Lipilip', 2, 1176, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(646, '2025-11-21', '4C-CC', '46-YB', 'Yabo', 1, 1177, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(647, '2025-11-21', '5C-CD', '28-MNGG', 'Mangga', 2, 1178, '09:00:00', '10:00:00', 'scheduled', 'generated', 1, NULL, NULL, NULL, NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(683, '2025-11-24', '1C-PB', '20-IMPG', 'Impig', 1, 1320, '08:00:00', '10:00:00', 'in_progress', 'generated', 1, NULL, NULL, NULL, '{\"truck_full\":false,\"truck_full_timestamp\":\"2025-11-25T02:02:34+01:00\",\"truck_full_collector_id\":30,\"truck_full_cleared_at\":\"2025-11-25T01:03:32.250Z\"}', '2025-11-24 05:52:42', '2025-11-24 14:03:32'),
(684, '2025-11-24', '1C-PB', '42-TR', 'Tara', 1, 1321, '10:00:00', '12:00:00', 'scheduled', 'generated', 2, NULL, NULL, NULL, NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(685, '2025-11-24', '1C-PB', '31-NRTHC', 'North Centro', 1, 1322, '06:00:00', '07:00:00', 'in_progress', 'generated', 3, NULL, NULL, NULL, '{\"emergency\":{\"active\":true,\"impact\":\"delay\",\"type\":\"weather\",\"type_label\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"attachment\":null,\"log_id\":7}}', '2025-11-24 05:52:42', '2025-11-24 13:54:37'),
(686, '2025-11-24', '1C-PB', '31-NRTHC', 'North Centro', 1, 1323, '10:00:00', '11:00:00', 'scheduled', 'generated', 4, NULL, NULL, NULL, NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(687, '2025-11-24', '1C-PB', '39-STHCN', 'South Centro', 1, 1324, '07:00:00', '08:00:00', 'completed', 'generated', 5, NULL, NULL, NULL, NULL, '2025-11-24 05:52:42', '2025-11-24 14:02:20'),
(688, '2025-11-24', '1C-PB', '39-STHCN', 'South Centro', 1, 1325, '11:00:00', '12:00:00', 'scheduled', 'generated', 6, NULL, NULL, NULL, NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(689, '2025-11-24', '5C-CD', '30-MNTL', 'Mantila', 2, 1326, '09:00:00', '10:00:00', 'in_progress', 'generated', 1, NULL, NULL, NULL, NULL, '2025-11-24 05:52:42', '2025-11-24 05:56:13');

-- --------------------------------------------------------

--
-- Table structure for table `daily_route_stop`
--

CREATE TABLE `daily_route_stop` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `daily_route_id` bigint(20) UNSIGNED NOT NULL,
  `seq` int(11) NOT NULL,
  `collection_point_id` bigint(20) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `window_start` time DEFAULT NULL,
  `window_end` time DEFAULT NULL,
  `eta` datetime DEFAULT NULL,
  `etd` datetime DEFAULT NULL,
  `planned_volume_kg` int(11) DEFAULT NULL,
  `status` enum('pending','visited','skipped') NOT NULL DEFAULT 'pending',
  `proof_photo_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_route_stop`
--

INSERT INTO `daily_route_stop` (`id`, `daily_route_id`, `seq`, `collection_point_id`, `name`, `lat`, `lng`, `window_start`, `window_end`, `eta`, `etd`, `planned_volume_kg`, `status`, `proof_photo_url`, `created_at`, `updated_at`) VALUES
(1010, 530, 1, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1011, 531, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1012, 532, 1, 22, 'Lubigan Jr. CP', 13.7310000, 122.9208000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1013, 533, 1, 26, 'Manangle CP', 13.7683000, 122.9190000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1014, 534, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-10-08 00:17:53', '2025-10-08 01:31:48'),
(1015, 534, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-10-08 00:17:53', '2025-10-08 01:31:56'),
(1016, 534, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-10-08 00:17:53', '2025-10-08 01:32:00'),
(1017, 534, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-10-08 00:17:53', '2025-10-08 01:31:58'),
(1018, 535, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1019, 535, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1020, 535, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1021, 535, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1022, 536, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1023, 536, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1024, 536, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1025, 536, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1026, 537, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1027, 537, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1028, 537, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1029, 537, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1030, 538, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1031, 538, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1032, 538, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1033, 538, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1034, 539, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1035, 539, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1036, 539, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1037, 539, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1038, 540, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1039, 540, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1040, 540, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1041, 540, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1042, 541, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1043, 541, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1044, 541, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1045, 541, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-08 00:17:53', '2025-10-08 00:17:53'),
(1046, 542, 1, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1047, 543, 1, 53, 'Malubago Main Collection Point', 13.6800000, 122.8150000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1048, 544, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1049, 545, 1, 5, 'Azucena Central CP', 13.7774000, 122.9662000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1050, 546, 1, 11, 'Bulawan CP', 13.7501000, 122.8885000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1051, 547, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1052, 547, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1053, 547, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1054, 547, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1055, 548, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1056, 548, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1057, 548, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1058, 548, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1059, 549, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1060, 549, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1061, 549, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1062, 549, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1063, 550, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1064, 550, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1065, 550, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1066, 550, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1067, 551, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1068, 551, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1069, 551, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1070, 551, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1071, 552, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1072, 552, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1073, 552, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1074, 552, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1075, 553, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1076, 553, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1077, 553, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1078, 553, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1079, 554, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1080, 554, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1081, 554, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1082, 554, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-09 01:49:04', '2025-10-09 01:49:04'),
(1083, 555, 1, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1084, 556, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1085, 557, 1, 7, 'Binahian CP', 13.7374000, 122.8698000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1086, 558, 1, 13, 'Caima CP', 13.6857000, 122.8724000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1087, 559, 1, 6, 'Bagong Sirang CP', 13.7189000, 122.9027000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1088, 560, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1089, 560, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1090, 560, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1091, 560, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1092, 561, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1093, 561, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1094, 561, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1095, 561, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1096, 562, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1097, 562, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1098, 562, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1099, 562, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1100, 563, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1101, 563, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1102, 563, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1103, 563, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1104, 564, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1105, 564, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1106, 564, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1107, 564, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1108, 565, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1109, 565, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1110, 565, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1111, 565, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1112, 566, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1113, 566, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1114, 566, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1115, 566, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1116, 567, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1117, 567, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1118, 567, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1119, 567, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-12 01:49:03', '2025-10-12 01:49:03'),
(1120, 568, 1, 53, 'Malubago Main Collection Point', 13.6800000, 122.8150000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1121, 569, 1, 16, 'Carayrayan CP', 13.7195000, 122.8767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1122, 570, 1, 21, 'Lipilip CP', 13.6948000, 122.8896000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1123, 571, 1, 23, 'Lubigan Sr. CP', 13.7432000, 122.9393000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1124, 572, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1125, 572, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1126, 572, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1127, 572, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1128, 573, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1129, 573, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1130, 573, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1131, 573, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1132, 574, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1133, 574, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1134, 574, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1135, 574, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1136, 575, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1137, 575, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1138, 575, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1139, 575, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1140, 576, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1141, 576, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1142, 576, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1143, 576, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1144, 577, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1145, 577, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1146, 577, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1147, 577, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1148, 578, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1149, 578, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1150, 578, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1151, 578, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1152, 579, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1153, 579, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1154, 579, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1155, 579, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-13 01:49:03', '2025-10-13 01:49:03'),
(1156, 580, 1, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1157, 581, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1158, 582, 1, 46, 'Yabo CP', 13.7936000, 122.9327000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1159, 583, 1, 34, 'Salanda CP', 13.8058000, 122.9465000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1160, 584, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1161, 584, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1162, 584, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1163, 584, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1164, 585, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1165, 585, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1166, 585, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1167, 585, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1168, 586, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1169, 586, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1170, 586, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1171, 586, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1172, 587, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1173, 587, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1174, 587, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1175, 587, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1176, 588, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1177, 588, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1178, 588, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1179, 588, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1180, 589, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1181, 589, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1182, 589, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1183, 589, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1184, 590, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1185, 590, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1186, 590, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1187, 590, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1188, 591, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1189, 591, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1190, 591, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1191, 591, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-14 01:49:03', '2025-10-14 01:49:03'),
(1192, 592, 1, 19, 'Gaongan CP', 13.7602000, 122.9668000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1193, 593, 1, 9, 'Bolo Sur CP', 13.8044000, 122.9584000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1194, 594, 1, 2, 'Alteza Corner CP', 13.7921000, 122.9718000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1195, 595, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1196, 595, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1197, 595, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1198, 595, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1199, 596, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1200, 596, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1201, 596, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1202, 596, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1203, 597, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1204, 597, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1205, 597, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1206, 597, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1207, 598, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1208, 598, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1209, 598, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1210, 598, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1211, 599, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1212, 599, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1213, 599, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1214, 599, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1215, 600, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1216, 600, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1217, 600, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1218, 600, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1219, 601, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1220, 601, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1221, 601, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1222, 601, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1223, 602, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1224, 602, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1225, 602, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1226, 602, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-15 01:49:03', '2025-10-15 01:49:03'),
(1227, 603, 1, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1228, 604, 1, 53, 'Malubago Main Collection Point', 13.6800000, 122.8150000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1229, 605, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1230, 606, 1, 5, 'Azucena Central CP', 13.7774000, 122.9662000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1231, 607, 1, 40, 'South Villazar CP', 13.8549000, 122.9522000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1232, 608, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1233, 608, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1234, 608, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1235, 608, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1236, 609, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1237, 609, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1238, 609, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1239, 609, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1240, 610, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1241, 610, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1242, 610, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1243, 610, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1244, 611, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1245, 611, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1246, 611, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1247, 611, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1248, 612, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1249, 612, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1250, 612, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1251, 612, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1252, 613, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1253, 613, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1254, 613, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1255, 613, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1256, 614, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1257, 614, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1258, 614, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1259, 614, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1260, 615, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1261, 615, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1262, 615, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1263, 615, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-10-16 01:49:04', '2025-10-16 01:49:04'),
(1264, 616, 2, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 12:23:29'),
(1265, 617, 2, 53, 'Malubago Main Collection Point', 13.6800000, 122.8150000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 11:28:35'),
(1266, 618, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1267, 619, 1, 5, 'Azucena Central CP', 13.7774000, 122.9662000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1268, 620, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 09:46:21'),
(1269, 620, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 09:46:47'),
(1270, 620, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 09:46:48'),
(1271, 620, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 09:46:48'),
(1272, 621, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 12:24:00'),
(1273, 621, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 12:30:23'),
(1274, 621, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 12:31:10'),
(1275, 621, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 12:31:30'),
(1276, 622, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1277, 622, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1278, 622, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1279, 622, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1280, 623, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1281, 623, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1282, 623, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1283, 623, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1284, 624, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 10:15:25'),
(1285, 624, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 10:15:25'),
(1286, 624, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 10:15:26'),
(1287, 624, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 05:24:45', '2025-11-22 10:15:27'),
(1288, 625, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1289, 625, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1290, 625, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1291, 625, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1292, 626, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1293, 626, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1294, 626, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1295, 626, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1296, 627, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1297, 627, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1298, 627, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1299, 627, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-22 05:24:45', '2025-11-22 05:24:45'),
(1304, 617, 1, NULL, 'Mantila - Truck Full Destination', 13.6550000, 122.7650000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 10:33:40', '2025-11-22 11:28:33'),
(1305, 616, 1, NULL, 'Mantila - Truck Full Destination', 13.6550000, 122.7650000, NULL, NULL, NULL, NULL, NULL, 'visited', NULL, '2025-11-22 11:35:20', '2025-11-22 11:50:10'),
(1306, 632, 1, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1307, 633, 1, 53, 'Malubago Main Collection Point', 13.6800000, 122.8150000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1308, 634, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1309, 635, 1, 5, 'Azucena Central CP', 13.7774000, 122.9662000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1310, 636, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1311, 636, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1312, 636, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1313, 636, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1314, 637, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1315, 637, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1316, 637, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1317, 637, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1318, 638, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1319, 638, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1320, 638, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1321, 638, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1322, 639, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1323, 639, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1324, 639, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1325, 639, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1326, 640, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1327, 640, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1328, 640, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17');
INSERT INTO `daily_route_stop` (`id`, `daily_route_id`, `seq`, `collection_point_id`, `name`, `lat`, `lng`, `window_start`, `window_end`, `eta`, `etd`, `planned_volume_kg`, `status`, `proof_photo_url`, `created_at`, `updated_at`) VALUES
(1329, 640, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1330, 641, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1331, 641, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1332, 641, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1333, 641, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1334, 642, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1335, 642, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1336, 642, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1337, 642, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1338, 643, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1339, 643, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1340, 643, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1341, 643, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1342, 644, 1, 44, 'Tula-tula CP', 13.8497000, 123.0073000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1343, 645, 1, 21, 'Lipilip CP', 13.6948000, 122.8896000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1344, 646, 1, 46, 'Yabo CP', 13.7936000, 122.9327000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1345, 647, 1, 28, 'Mangga CP', 13.7806000, 123.0408000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-23 14:19:17', '2025-11-23 14:19:17'),
(1441, 683, 1, 20, 'Impig CP', 13.7886000, 122.9855000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1442, 684, 1, 42, 'Tara CP', 13.7476000, 122.9738000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1443, 685, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1443_1764016291.jpg', '2025-11-24 05:52:42', '2025-11-24 09:31:31'),
(1444, 685, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1444_1764018104.jpg', '2025-11-24 05:52:42', '2025-11-24 10:01:44'),
(1445, 685, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1445_1764032182.jpg', '2025-11-24 05:52:42', '2025-11-24 13:56:22'),
(1446, 685, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1446_1764032211.jpg', '2025-11-24 05:52:42', '2025-11-24 13:56:51'),
(1447, 686, 1, 31, 'North Centro CP', 13.7701000, 122.9762000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1448, 686, 2, 47, 'North Centro CP - A', 13.7705000, 122.9767000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1449, 686, 3, 48, 'North Centro CP - B', 13.7698000, 122.9758000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1450, 686, 4, 49, 'North Centro CP - C', 13.7703000, 122.9754000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1451, 687, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1451_1764032429.jpg', '2025-11-24 05:52:42', '2025-11-24 14:00:29'),
(1452, 687, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1452_1764032440.jpg', '2025-11-24 05:52:42', '2025-11-24 14:00:40'),
(1453, 687, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1453_1764032452.jpg', '2025-11-24 05:52:42', '2025-11-24 14:00:52'),
(1454, 687, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'visited', 'uploads/route_proofs/stop_1454_1764032503.jpg', '2025-11-24 05:52:42', '2025-11-24 14:01:43'),
(1455, 688, 1, 39, 'South Centro CP', 13.7644000, 122.9760000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1456, 688, 2, 50, 'South Centro CP - A', 13.7648000, 122.9764000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1457, 688, 3, 51, 'South Centro CP - B', 13.7640000, 122.9756000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1458, 688, 4, 52, 'South Centro CP - C', 13.7637000, 122.9763000, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42'),
(1459, 689, 1, 30, 'Mantila CP', 13.7834133, 123.0199262, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-11-24 05:52:42', '2025-11-24 05:52:42');

-- --------------------------------------------------------

--
-- Table structure for table `email_verification`
--

CREATE TABLE `email_verification` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `verification_code` varchar(6) NOT NULL,
  `expiry_time` datetime NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_verification`
--

INSERT INTO `email_verification` (`id`, `email`, `verification_code`, `expiry_time`, `verified`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, 'ianjayanonuevo26@gmail.com', '645215', '2025-09-28 06:25:17', 0, NULL, '2025-09-28 04:10:17', '2025-09-28 04:14:56'),
(2, 'ianjayanonuevo26@gmail.com', '646102', '2025-09-28 06:31:02', 1, '2025-09-28 12:16:40', '2025-09-28 04:16:02', '2025-09-28 04:16:40'),
(3, 'ianjayanonuevo26@gmail.com', '154300', '2025-09-28 07:49:54', 0, NULL, '2025-09-28 05:34:54', '2025-09-28 05:34:54'),
(4, 'ianjayanonuevo26@gmail.com', '818998', '2025-09-28 08:48:58', 0, NULL, '2025-09-28 06:33:58', '2025-09-28 06:33:58'),
(5, 'ianjayanonuevo26@gmail.com', '525657', '2025-09-28 08:57:32', 1, '2025-09-28 14:43:08', '2025-09-28 06:42:32', '2025-09-28 06:43:08'),
(6, 'ianjayanonuevo26@gmail.com', '739741', '2025-09-28 09:02:41', 1, '2025-09-28 14:48:11', '2025-09-28 06:47:41', '2025-09-28 06:48:11'),
(7, 'ianjayanonuevo26@gmail.com', '466797', '2025-09-28 09:06:17', 1, '2025-09-28 14:52:12', '2025-09-28 06:51:17', '2025-09-28 06:52:12'),
(8, 'emeir.amado@cbsua.edu.ph', '838696', '2025-09-30 17:29:22', 1, '2025-09-30 17:14:54', '2025-09-30 17:14:22', '2025-09-30 17:14:54');

-- --------------------------------------------------------

--
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `verification_code` varchar(6) NOT NULL,
  `expiry_time` datetime NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `used` tinyint(1) DEFAULT 0,
  `resend_count` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_sent_at` datetime DEFAULT current_timestamp(),
  `verified_at` datetime DEFAULT NULL,
  `used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_verifications`
--

INSERT INTO `email_verifications` (`id`, `email`, `verification_code`, `expiry_time`, `verified`, `used`, `resend_count`, `created_at`, `last_sent_at`, `verified_at`, `used_at`) VALUES
(1, 'lumierethefirst@gmail.com', '395412', '2025-10-03 21:59:20', 1, 0, 3, '2025-10-03 11:51:58', '2025-10-03 21:44:20', '2025-10-03 21:44:45', NULL),
(4, 'ianjayanonuevo26@gmail.com', '642267', '2025-10-03 16:43:24', 1, 1, 0, '2025-10-03 16:28:24', '2025-10-03 16:28:24', '2025-10-03 16:29:05', '2025-10-03 16:29:05'),
(5, 'kolektrash@gmail.com', '766098', '2025-10-04 00:39:55', 1, 1, 1, '2025-10-03 16:39:00', '2025-10-04 00:24:55', '2025-10-04 00:25:28', '2025-10-04 00:25:29'),
(6, 'koluytr@gmail.com', '030643', '2025-10-03 17:18:04', 0, 0, 0, '2025-10-03 17:03:04', '2025-10-03 17:03:04', NULL, NULL),
(7, 'xepywafa@forexzig.com', '128884', '2025-10-03 17:24:14', 0, 0, 0, '2025-10-03 17:09:14', '2025-10-03 17:09:14', NULL, NULL),
(10, 'ianjayauevo26@gmail.com', '063119', '2025-10-05 16:11:38', 1, 1, 0, '2025-10-05 15:56:38', '2025-10-05 15:56:38', '2025-10-05 16:02:59', '2025-10-05 16:02:59'),
(11, 'emeiramado2004@gmail.com', '749088', '2025-10-07 14:47:24', 1, 1, 4, '2025-10-06 14:19:57', '2025-10-07 14:32:24', '2025-10-07 14:32:49', '2025-10-07 14:32:49'),
(16, 'nikopalenquez1@gmail.com', '704911', '2025-10-08 00:05:02', 1, 1, 1, '2025-10-07 23:08:34', '2025-10-07 23:35:02', '2025-10-07 23:35:34', '2025-10-07 23:35:34'),
(17, 'nikopalenquez01@gmail.com', '082259', '2025-10-07 23:49:50', 1, 1, 0, '2025-10-07 23:19:50', '2025-10-07 23:19:50', '2025-10-07 23:20:31', '2025-10-07 23:20:31'),
(18, 'rinnorsantos14@gmail.com', '614483', '2025-10-07 23:56:06', 1, 0, 0, '2025-10-07 23:26:06', '2025-10-07 23:26:06', '2025-10-07 23:26:38', NULL),
(20, 'nevirew795@wivstore.com', '518147', '2025-11-05 15:33:35', 0, 0, 0, '2025-11-05 22:03:35', '2025-11-05 22:03:35', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `barangay` varchar(100) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`feedback_id`, `user_id`, `name`, `barangay`, `rating`, `message`, `created_at`) VALUES
(1, 60, 'Ian Jay', 'South Centro', 5, 'asdasd', '2025-10-03 07:12:41'),
(2, 10, 'Daniela Corral', 'South Centro', 5, 'HAHHAA', '2025-10-03 07:13:26'),
(3, 75, 'Ian  Jay', 'Impig', 3, 'Wala', '2025-10-03 10:40:28'),
(4, 60, 'Ian Jay', 'South Centro', 5, 'Wala, pogi mo po', '2025-10-03 19:19:20'),
(5, 69, 'Emeir  Amado', 'Binahian', 1, 'Ulol pangit service', '2025-10-04 00:52:27'),
(6, 60, 'Ian Jay', 'South Centro', 3, 'dsfdsfdsf', '2025-10-05 19:28:24'),
(7, 10, 'Daniela Corral', 'South Centro', 5, 'asaa', '2025-10-06 00:32:58'),
(8, 10, 'Daniela Corral', 'South Centro', 5, 'asdasd', '2025-10-06 00:41:15'),
(9, 68, 'Daniela Corral', 'Gaongan', 5, 'gjhgj', '2025-10-06 01:14:34'),
(10, 68, 'Daniela Corral', 'Gaongan', 5, 'hakjha', '2025-10-06 01:18:04'),
(11, 68, 'Daniela Corral', 'Gaongan', 5, 'asassa', '2025-10-06 01:22:37'),
(12, 68, 'Daniela Corral', 'Gaongan', 5, 'assadsas', '2025-10-06 01:22:47'),
(13, 68, 'Daniela Corral', 'Gaongan', 5, 'asdasd', '2025-10-06 01:22:52'),
(14, 10, 'Daniela Corral', 'South Centro', 2, 'aaaa', '2025-10-06 01:34:05'),
(15, 68, 'Daniela Corral', 'Gaongan', 5, 'asdas', '2025-10-06 04:33:39'),
(16, 60, 'Ian Jay', 'South Centro', 5, 'Gdhdbfh', '2025-10-06 05:45:13'),
(17, 68, 'Daniela Corral', 'Gaongan', 4, 'HAHAHAHA legend never dies', '2025-10-06 09:52:22'),
(18, 10, 'Daniela Corral', 'South Centro', 1, 'asdasdxcaxcaa', '2025-10-06 10:47:22');

-- --------------------------------------------------------

--
-- Table structure for table `gps_route_log`
--

CREATE TABLE `gps_route_log` (
  `log_id` int(11) NOT NULL,
  `team_id` int(11) DEFAULT NULL,
  `truck_id` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `speed` decimal(5,2) DEFAULT NULL,
  `accuracy` decimal(5,2) DEFAULT NULL,
  `heading` decimal(6,2) DEFAULT NULL,
  `battery` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gps_route_log`
--

INSERT INTO `gps_route_log` (`log_id`, `team_id`, `truck_id`, `driver_id`, `latitude`, `longitude`, `timestamp`, `speed`, `accuracy`, `heading`, `battery`) VALUES
(2117, 1174, 1, 16, 13.75874340, 122.96469390, '2025-10-08 00:20:16', NULL, 20.00, NULL, NULL),
(2118, 1174, 1, 16, 13.75874120, 122.96469640, '2025-10-08 00:20:25', 0.03, 24.33, NULL, NULL),
(2119, 1174, 1, 16, 13.75874130, 122.96469450, '2025-10-08 00:20:35', 0.02, 20.00, NULL, NULL),
(2120, 1174, 1, 16, 13.75874230, 122.96469350, '2025-10-08 00:20:45', 0.02, 20.00, NULL, NULL),
(2121, 1174, 1, 16, 13.75874250, 122.96469260, '2025-10-08 00:20:54', 0.01, 20.00, NULL, NULL),
(2122, 1174, 1, 16, 13.75874200, 122.96469440, '2025-10-08 00:21:02', 0.02, 20.00, NULL, NULL),
(2123, 1174, 1, 16, 13.75874210, 122.96469420, '2025-10-08 00:21:11', 0.00, 20.00, NULL, NULL),
(2124, 1174, 1, 16, 13.75874230, 122.96469350, '2025-10-08 00:21:20', 0.01, 20.00, NULL, NULL),
(2125, 1174, 1, 16, 13.75873960, 122.96469240, '2025-10-08 00:21:29', 0.03, 23.92, NULL, NULL),
(2126, 1174, 1, 16, 13.75874020, 122.96469170, '2025-10-08 00:21:38', 0.01, 23.82, NULL, NULL),
(2127, 1174, 1, 16, 13.75873950, 122.96469070, '2025-10-08 00:21:47', 0.01, 23.68, NULL, NULL),
(2128, 1174, 1, 16, 13.75874200, 122.96469400, '2025-10-08 00:21:56', 0.05, 20.00, NULL, NULL),
(2129, 1174, 1, 16, 13.75874240, 122.96469370, '2025-10-08 00:22:05', 0.01, 20.00, NULL, NULL),
(2130, 1174, 1, 16, 13.75873920, 122.96469100, '2025-10-08 00:22:15', 0.05, 23.71, NULL, NULL),
(2131, 1174, 1, 16, 13.75874220, 122.96469350, '2025-10-08 00:22:24', 0.04, 20.00, NULL, NULL),
(2132, 1174, 1, 16, 13.75874230, 122.96469340, '2025-10-08 00:22:33', 0.00, 20.00, NULL, NULL),
(2133, 1174, 1, 16, 13.75874230, 122.96469360, '2025-10-08 00:22:42', 0.00, 20.00, NULL, NULL),
(2134, 1174, 1, 16, 13.75873910, 122.96469240, '2025-10-08 00:22:51', 0.04, 23.91, NULL, NULL),
(2135, 1174, 1, 16, 13.75874270, 122.96469400, '2025-10-08 00:23:00', 0.05, 20.00, NULL, NULL),
(2136, 1174, 1, 16, 13.75874260, 122.96469370, '2025-10-08 00:23:09', 0.00, 20.00, NULL, NULL),
(2137, 1174, 1, 16, 13.75874250, 122.96469400, '2025-10-08 00:23:18', 0.00, 20.00, NULL, NULL),
(2138, 1174, 1, 16, 13.75873950, 122.96469070, '2025-10-08 00:23:27', 0.05, 23.68, NULL, NULL),
(2139, 1174, 1, 16, 13.75874220, 122.96469360, '2025-10-08 00:23:36', 0.05, 20.00, NULL, NULL),
(2140, 1174, 1, 16, 13.75873960, 122.96469100, '2025-10-08 00:23:45', 0.04, 23.72, NULL, NULL),
(2141, 1174, 1, 16, 13.75873960, 122.96469100, '2025-10-08 00:23:55', 0.00, 23.72, NULL, NULL),
(2142, 1174, 1, 16, 13.75874250, 122.96469400, '2025-10-08 00:24:04', 0.05, 20.00, NULL, NULL),
(2143, 1174, 1, 16, 13.75874210, 122.96469420, '2025-10-08 00:24:13', 0.00, 20.00, NULL, NULL),
(2144, 1174, 1, 16, 13.75874230, 122.96469350, '2025-10-08 00:24:23', 0.01, 20.00, NULL, NULL),
(2145, 1174, 1, 16, 13.75874220, 122.96469370, '2025-10-08 00:24:32', 0.00, 20.00, NULL, NULL),
(2146, 1174, 1, 16, 13.75874230, 122.96469350, '2025-10-08 00:24:41', 0.00, 20.00, NULL, NULL),
(2147, 1174, 1, 16, 13.75874230, 122.96469350, '2025-10-08 00:24:50', 0.00, 20.00, NULL, NULL),
(2148, 1174, 1, 16, 13.75874240, 122.96469350, '2025-10-08 00:24:59', 0.00, 20.00, NULL, NULL),
(2149, 1174, 1, 16, 13.75874240, 122.96469350, '2025-10-08 00:25:08', 0.00, 20.00, NULL, NULL),
(2150, 1174, 1, 16, 13.75874050, 122.96468950, '2025-10-08 00:25:17', 0.05, 23.24, NULL, NULL),
(2151, 1174, 1, 16, 13.75874260, 122.96469270, '2025-10-08 00:25:26', 0.04, 23.28, NULL, NULL),
(2152, 1174, 1, 16, 13.75874070, 122.96469170, '2025-10-08 00:25:35', 0.02, 23.71, NULL, NULL),
(2153, 1174, 1, 16, 13.75874350, 122.96469350, '2025-10-08 00:25:44', 0.04, 20.00, NULL, NULL),
(2154, 1174, 1, 16, 13.75874100, 122.96468890, '2025-10-08 00:25:53', 0.06, 20.42, NULL, NULL),
(2155, 1174, 1, 16, 13.75874350, 122.96469320, '2025-10-08 00:26:02', 0.06, 20.00, NULL, NULL),
(2156, 1174, 1, 16, 13.75874280, 122.96469410, '2025-10-08 00:26:11', 0.01, 20.00, NULL, NULL),
(2157, 1174, 1, 16, 13.75874230, 122.96469410, '2025-10-08 00:26:20', 0.01, 20.00, NULL, NULL),
(2158, 1174, 1, 16, 13.75874260, 122.96469180, '2025-10-08 00:26:30', 0.03, 20.00, NULL, NULL),
(2159, 1174, 1, 16, 13.75874320, 122.96469270, '2025-10-08 00:26:38', 0.01, 20.00, NULL, NULL),
(2160, 1174, 1, 16, 13.75874300, 122.96469380, '2025-10-08 00:26:47', 0.01, 20.00, NULL, NULL),
(2161, 1174, 1, 16, 13.75874280, 122.96469200, '2025-10-08 00:26:56', 0.02, 20.00, NULL, NULL),
(2162, 1174, 1, 16, 13.75874270, 122.96469200, '2025-10-08 00:27:05', 0.00, 20.00, NULL, NULL),
(2163, 1174, 1, 16, 13.75874280, 122.96469370, '2025-10-08 00:27:14', 0.02, 20.00, NULL, NULL),
(2164, 1174, 1, 16, 13.75874260, 122.96469330, '2025-10-08 00:27:24', 0.00, 20.00, NULL, NULL),
(2165, 1174, 1, 16, 13.78488840, 122.98014640, '2025-10-08 00:51:10', NULL, 54.04, NULL, NULL),
(2166, 1174, 1, 16, 13.78480380, 122.98012840, '2025-10-08 00:51:11', NULL, 29.73, NULL, NULL),
(2167, 1174, 1, 16, 13.78475970, 122.98010990, '2025-10-08 00:51:20', NULL, 28.91, NULL, NULL),
(2168, 1174, 1, 16, 13.78487031, 122.98048935, '2025-10-08 01:31:25', NULL, 97.00, NULL, NULL),
(2169, 1174, 1, 16, 13.78487031, 122.98048935, '2025-10-08 01:31:48', NULL, 97.00, NULL, NULL),
(2170, 1174, 1, 16, 13.78487031, 122.98048935, '2025-10-08 01:32:05', NULL, 97.00, NULL, NULL),
(2171, 1174, 1, 16, 13.78487184, 122.98047704, '2025-10-08 01:32:28', NULL, 105.00, NULL, NULL),
(2172, 1166, 2, 17, 13.78479060, 122.98010490, '2025-10-08 02:05:39', NULL, 16.41, NULL, NULL),
(2173, 1166, 2, 17, 13.78479320, 122.98011010, '2025-10-08 02:05:50', 0.11, 13.38, NULL, NULL),
(2174, 1166, 2, 17, 13.78479470, 122.98010740, '2025-10-08 02:05:55', 0.06, 14.99, NULL, NULL),
(2175, 1166, 2, 17, 13.78477890, 122.98010420, '2025-10-08 02:06:01', 0.09, 24.13, NULL, NULL),
(2176, 1166, 2, 17, 13.78479020, 122.98010470, '2025-10-08 02:06:12', 0.07, 12.80, NULL, NULL),
(2177, 1166, 2, 17, 13.78480590, 122.98009950, '2025-10-08 02:06:23', 0.34, 20.00, NULL, NULL),
(2178, 1166, 2, 17, 13.78480240, 122.98010720, '2025-10-08 02:06:28', 0.13, 14.40, NULL, NULL),
(2179, 1166, 2, 17, 13.78480110, 122.98010690, '2025-10-08 02:06:34', 0.03, 14.16, NULL, NULL),
(2180, 1166, 2, 17, 13.78060880, 122.98318890, '2025-10-08 02:06:37', NULL, 999.99, NULL, NULL),
(2181, 1166, 2, 17, 13.78479460, 122.98011020, '2025-10-08 02:06:46', 0.10, 13.38, NULL, NULL),
(2182, 1166, 2, 17, 13.78479160, 122.98010330, '2025-10-08 02:06:52', 0.11, 20.00, NULL, NULL),
(2183, 1166, 2, 17, 13.78480250, 122.98010560, '2025-10-08 02:06:57', 0.23, 14.08, NULL, NULL),
(2184, 1166, 2, 17, 13.78479150, 122.98010300, '2025-10-08 02:07:02', 0.21, 20.00, NULL, NULL),
(2185, 1166, 2, 17, 13.78479360, 122.98010880, '2025-10-08 02:07:07', 0.12, 13.36, NULL, NULL),
(2186, 1166, 2, 17, 13.78479560, 122.98010990, '2025-10-08 02:07:13', 0.05, 13.38, NULL, NULL),
(2187, 1166, 2, 17, 13.78479560, 122.98010990, '2025-10-08 02:07:18', 0.00, 13.38, NULL, NULL),
(2188, 1166, 2, 17, 13.78481540, 122.98009540, '2025-10-08 02:07:23', 0.49, 14.17, NULL, NULL),
(2189, 1166, 2, 17, 13.78481200, 122.98010130, '2025-10-08 02:07:28', 0.11, 15.14, NULL, NULL),
(2190, 1166, 2, 17, 13.78478890, 122.98010880, '2025-10-08 02:07:34', 0.48, 20.00, NULL, NULL),
(2191, 1166, 2, 17, 13.78480490, 122.98010600, '2025-10-08 02:07:39', 0.30, 15.41, NULL, NULL),
(2192, 1166, 2, 17, 13.78481000, 122.98011120, '2025-10-08 02:07:45', 0.13, 25.82, NULL, NULL),
(2193, 1166, 2, 17, 13.78480700, 122.98010640, '2025-10-08 02:07:51', 0.15, 13.15, NULL, NULL),
(2194, 1166, 2, 17, 13.78481260, 122.98010410, '2025-10-08 02:07:57', 0.07, 9.90, NULL, NULL),
(2195, 1166, 2, 17, 13.78481240, 122.98010500, '2025-10-08 02:08:03', 0.07, 10.54, NULL, NULL),
(2196, 1166, 2, 17, 13.78479620, 122.98010780, '2025-10-08 02:08:14', 0.06, 20.00, NULL, NULL),
(2197, 1166, 2, 17, 13.78479170, 122.98011610, '2025-10-08 02:08:19', 0.17, 14.55, NULL, NULL),
(2198, 1166, 2, 17, 13.78478940, 122.98010900, '2025-10-08 02:08:25', 0.13, 20.00, NULL, NULL),
(2199, 1166, 2, 17, 13.78478900, 122.98011030, '2025-10-08 02:08:30', 0.02, 20.00, NULL, NULL),
(2200, 1166, 2, 17, 13.78479100, 122.98010940, '2025-10-08 02:08:36', 0.04, 20.00, NULL, NULL),
(2201, 1166, 2, 17, 13.78479100, 122.98010940, '2025-10-08 02:08:41', 0.00, 20.00, NULL, NULL),
(2202, 1166, 2, 17, 13.78060880, 122.98318890, '2025-10-08 02:08:45', NULL, 999.99, NULL, NULL),
(2203, 1166, 2, 17, 13.78479120, 122.98010730, '2025-10-08 02:08:48', 0.04, 14.33, NULL, NULL),
(2204, 1166, 2, 17, 13.78479080, 122.98010800, '2025-10-08 02:08:54', 0.01, 20.00, NULL, NULL),
(2205, 1166, 2, 17, 13.78479260, 122.98010850, '2025-10-08 02:09:05', 0.11, 20.00, NULL, NULL),
(2206, 1166, 2, 17, 13.78479390, 122.98010880, '2025-10-08 02:09:10', 0.03, 13.45, NULL, NULL),
(2207, 1166, 2, 17, 13.78479220, 122.98010760, '2025-10-08 02:09:16', 0.04, 20.00, NULL, NULL),
(2208, 1166, 2, 17, 13.78479210, 122.98010760, '2025-10-08 02:09:21', 0.00, 20.00, NULL, NULL),
(2209, 1166, 2, 17, 13.78479270, 122.98010870, '2025-10-08 02:09:27', 0.02, 20.00, NULL, NULL),
(2210, 1166, 2, 17, 13.78479280, 122.98010860, '2025-10-08 02:09:32', 0.00, 20.00, NULL, NULL),
(2211, 1166, 2, 17, 13.78479210, 122.98010880, '2025-10-08 02:09:38', 0.01, 20.00, NULL, NULL),
(2212, 1166, 2, 17, 13.78479210, 122.98010880, '2025-10-08 02:09:43', 0.00, 20.00, NULL, NULL),
(2213, 1166, 2, 17, 13.78479300, 122.98011080, '2025-10-08 02:09:50', 0.04, 13.45, NULL, NULL),
(2214, 1166, 2, 17, 13.78479110, 122.98010430, '2025-10-08 02:09:56', 0.09, 20.00, NULL, NULL),
(2215, 1166, 2, 17, 13.78479260, 122.98011040, '2025-10-08 02:10:01', 0.13, 13.42, NULL, NULL),
(2216, 1166, 2, 17, 13.78479510, 122.98010950, '2025-10-08 02:10:07', 0.05, 13.38, NULL, NULL),
(2217, 1166, 2, 17, 13.78479510, 122.98010940, '2025-10-08 02:10:12', 0.00, 13.38, NULL, NULL),
(2218, 1166, 2, 17, 13.78479290, 122.98010670, '2025-10-08 02:10:18', 0.07, 20.00, NULL, NULL),
(2219, 1166, 2, 17, 13.78479520, 122.98010960, '2025-10-08 02:10:23', 0.06, 13.39, NULL, NULL),
(2220, 1166, 2, 17, 13.78479370, 122.98010690, '2025-10-08 02:10:29', 0.05, 20.00, NULL, NULL),
(2221, 1166, 2, 17, 13.78479570, 122.98010990, '2025-10-08 02:10:34', 0.07, 13.39, NULL, NULL),
(2222, 1166, 2, 17, 13.78480840, 122.98009900, '2025-10-08 02:10:40', 0.33, 13.86, NULL, NULL),
(2223, 1166, 2, 17, 13.78480800, 122.98009890, '2025-10-08 02:10:45', 0.01, 13.53, NULL, NULL),
(2224, 1166, 2, 17, 13.78479580, 122.98010830, '2025-10-08 02:10:52', 0.30, 13.35, NULL, NULL),
(2225, 1166, 2, 17, 13.78479410, 122.98010910, '2025-10-08 02:10:58', 0.04, 17.10, NULL, NULL),
(2226, 1166, 2, 17, 13.78478880, 122.98011380, '2025-10-08 02:11:09', 0.32, 13.40, NULL, NULL),
(2227, 1166, 2, 17, 13.78479990, 122.98010910, '2025-10-08 02:11:14', 0.21, 13.56, NULL, NULL),
(2228, 1166, 2, 17, 13.78479280, 122.98010860, '2025-10-08 02:11:20', 0.14, 20.00, NULL, NULL),
(2229, 1166, 2, 17, 13.78479250, 122.98011210, '2025-10-08 02:11:25', 0.06, 17.64, NULL, NULL),
(2230, 1166, 2, 17, 13.78479110, 122.98010990, '2025-10-08 02:11:31', 0.05, 20.00, NULL, NULL),
(2231, 1166, 2, 17, 13.78478840, 122.98011280, '2025-10-08 02:11:36', 0.07, 13.38, NULL, NULL),
(2232, 1166, 2, 17, 13.78478860, 122.98011130, '2025-10-08 02:11:42', 0.03, 20.00, NULL, NULL),
(2233, 1166, 2, 17, 13.78479050, 122.98010940, '2025-10-08 02:11:47', 0.05, 20.00, NULL, NULL),
(2234, 1166, 2, 17, 13.78479170, 122.98010490, '2025-10-08 02:11:54', 0.09, 20.00, NULL, NULL),
(2235, 1166, 2, 17, 13.78479980, 122.98010970, '2025-10-08 02:12:00', 0.13, 12.98, NULL, NULL),
(2236, 1166, 2, 17, 13.78479730, 122.98011080, '2025-10-08 02:12:05', 0.05, 12.92, NULL, NULL),
(2237, 1166, 2, 17, 13.78479230, 122.98010690, '2025-10-08 02:12:11', 0.13, 20.00, NULL, NULL),
(2238, 1166, 2, 17, 13.78480070, 122.98010820, '2025-10-08 02:12:16', 0.16, 13.43, NULL, NULL),
(2239, 1166, 2, 17, 13.78479430, 122.98010870, '2025-10-08 02:12:22', 0.12, 12.36, NULL, NULL),
(2240, 1166, 2, 17, 13.78480050, 122.98010890, '2025-10-08 02:12:27', 0.11, 12.19, NULL, NULL),
(2241, 1166, 2, 17, 13.78479070, 122.98010690, '2025-10-08 02:12:33', 0.19, 20.00, NULL, NULL),
(2242, 1166, 2, 17, 13.78479330, 122.98010810, '2025-10-08 02:12:38', 0.05, 12.56, NULL, NULL),
(2243, 1166, 2, 17, 13.78479040, 122.98010830, '2025-10-08 02:12:43', 0.05, 20.00, NULL, NULL),
(2244, 1166, 2, 17, 13.78479980, 122.98010490, '2025-10-08 02:12:56', 0.10, 15.66, NULL, NULL),
(2245, 1166, 2, 17, 13.78479890, 122.98010500, '2025-10-08 02:13:02', 0.01, 15.97, NULL, NULL),
(2246, 1166, 2, 17, 13.78479870, 122.98010510, '2025-10-08 02:13:07', 0.01, 15.75, NULL, NULL),
(2247, 1166, 2, 17, 13.78479040, 122.98010650, '2025-10-08 02:13:13', 0.17, 16.40, NULL, NULL),
(2248, 1166, 2, 17, 13.78479920, 122.98010100, '2025-10-08 02:13:18', 0.18, 15.80, NULL, NULL),
(2249, 1166, 2, 17, 13.78479890, 122.98010300, '2025-10-08 02:13:24', 0.04, 14.68, NULL, NULL),
(2250, 1166, 2, 17, 13.78479830, 122.98010100, '2025-10-08 02:13:29', 0.04, 14.37, NULL, NULL),
(2251, 1166, 2, 17, 13.78479740, 122.98010560, '2025-10-08 02:13:35', 0.09, 15.32, NULL, NULL),
(2252, 1166, 2, 17, 13.78479090, 122.98010630, '2025-10-08 02:13:46', 0.15, 20.00, NULL, NULL),
(2253, 1166, 2, 17, 13.78479650, 122.98010340, '2025-10-08 02:13:51', 0.11, 15.48, NULL, NULL),
(2254, 1166, 2, 17, 13.78479230, 122.98010590, '2025-10-08 02:14:03', 0.07, 20.00, NULL, NULL),
(2255, 1166, 2, 17, 13.78479040, 122.98010410, '2025-10-08 02:14:04', 0.05, 20.00, NULL, NULL),
(2256, 1166, 2, 17, 13.78479350, 122.98010560, '2025-10-08 02:14:14', 0.03, 20.00, NULL, NULL),
(2257, 1166, 2, 17, 13.78479340, 122.98010550, '2025-10-08 02:14:19', 0.00, 20.00, NULL, NULL),
(2258, 1166, 2, 17, 13.78479510, 122.98010600, '2025-10-08 02:14:25', 0.03, 20.00, NULL, NULL),
(2259, 1166, 2, 17, 13.78479510, 122.98010600, '2025-10-08 02:14:30', 0.00, 20.00, NULL, NULL),
(2260, 1166, 2, 17, 13.78479520, 122.98010550, '2025-10-08 02:14:35', 0.01, 20.00, NULL, NULL),
(2261, 1166, 2, 17, 13.78479520, 122.98010550, '2025-10-08 02:14:40', 0.00, 20.00, NULL, NULL),
(2262, 1166, 2, 17, 13.78478900, 122.98010870, '2025-10-08 02:14:46', 0.13, 20.00, NULL, NULL),
(2263, 1166, 2, 17, 13.78479310, 122.98010580, '2025-10-08 02:14:51', 0.09, 20.00, NULL, NULL),
(2264, 1166, 2, 17, 13.78479600, 122.98010580, '2025-10-08 02:14:58', 0.06, 14.41, NULL, NULL),
(2265, 1166, 2, 17, 13.78479780, 122.98010550, '2025-10-08 02:15:04', 0.03, 14.53, NULL, NULL),
(2266, 1166, 2, 17, 13.78479780, 122.98010550, '2025-10-08 02:15:09', 0.00, 14.53, NULL, NULL),
(2267, 1166, 2, 17, 13.78479000, 122.98010450, '2025-10-08 02:15:15', 0.14, 20.00, NULL, NULL),
(2268, 1166, 2, 17, 13.78479660, 122.98010550, '2025-10-08 02:15:20', 0.13, 15.32, NULL, NULL),
(2269, 1166, 2, 17, 13.78478900, 122.98010620, '2025-10-08 02:15:26', 0.14, 20.00, NULL, NULL),
(2270, 1166, 2, 17, 13.78479590, 122.98010610, '2025-10-08 02:15:31', 0.13, 13.62, NULL, NULL),
(2271, 1166, 2, 17, 13.78479010, 122.98010870, '2025-10-08 02:15:36', 0.12, 20.00, NULL, NULL),
(2272, 1166, 2, 17, 13.78478980, 122.98010740, '2025-10-08 02:15:41', 0.03, 20.00, NULL, NULL),
(2273, 1166, 2, 17, 13.78479080, 122.98010800, '2025-10-08 02:15:47', 0.02, 20.00, NULL, NULL),
(2274, 1166, 2, 17, 13.78478980, 122.98010550, '2025-10-08 02:15:52', 0.05, 20.00, NULL, NULL),
(2275, 1166, 2, 17, 13.78479280, 122.98011100, '2025-10-08 02:16:00', 0.11, 16.61, NULL, NULL),
(2276, 1166, 2, 17, 13.78479410, 122.98010620, '2025-10-08 02:16:43', 0.07, 20.00, NULL, NULL),
(2277, 1166, 2, 17, 13.78479490, 122.98010620, '2025-10-08 02:16:43', 0.09, 20.00, NULL, NULL),
(2278, 1166, 2, 17, 13.78479640, 122.98010870, '2025-10-08 02:16:43', 0.05, 16.77, NULL, NULL),
(2279, 1166, 2, 17, 13.78479780, 122.98010450, '2025-10-08 02:16:43', 0.08, 20.00, NULL, NULL),
(2280, 1166, 2, 17, 13.78479750, 122.98010510, '2025-10-08 02:16:43', 0.11, 20.00, NULL, NULL),
(2281, 1166, 2, 17, 13.78479030, 122.98010490, '2025-10-08 02:16:43', 0.13, 20.00, NULL, NULL),
(2282, 1166, 2, 17, 13.78479070, 122.98010780, '2025-10-08 02:16:49', 0.15, 20.00, NULL, NULL),
(2283, 1166, 2, 17, 13.78480030, 122.98010430, '2025-10-08 02:16:54', 0.18, 16.60, NULL, NULL),
(2284, 1166, 2, 17, 13.78478860, 122.98011160, '2025-10-08 02:17:01', 0.24, 20.00, NULL, NULL),
(2285, 1166, 2, 17, 13.78479010, 122.98010530, '2025-10-08 02:17:07', 0.09, 20.00, NULL, NULL),
(2286, 1166, 2, 17, 13.78479870, 122.98010520, '2025-10-08 02:17:43', NULL, 14.80, NULL, NULL),
(2287, 1166, 2, 17, 13.78060880, 122.98318890, '2025-10-08 02:20:39', NULL, 999.99, NULL, NULL),
(2288, 1166, 2, 17, 13.78479730, 122.98010500, '2025-10-08 02:21:41', NULL, 20.00, NULL, NULL),
(2289, 1166, 2, 17, 13.78479730, 122.98010500, '2025-10-08 02:21:46', 0.00, 20.00, NULL, NULL),
(2290, 1166, 2, 17, 13.78479810, 122.98010480, '2025-10-08 02:21:52', 0.02, 20.00, NULL, NULL),
(2291, 1166, 2, 17, 13.78479810, 122.98010480, '2025-10-08 02:21:57', 0.00, 20.00, NULL, NULL),
(2292, 1166, 2, 17, 13.78479170, 122.98010450, '2025-10-08 02:22:03', 0.11, 20.00, NULL, NULL),
(2293, 1166, 2, 17, 13.78454980, 122.98348090, '2025-10-08 02:22:09', 0.25, 6.50, NULL, NULL),
(2294, 1166, 2, 17, 13.78455000, 122.98348170, '2025-10-08 02:22:15', 0.00, 6.38, NULL, NULL),
(2295, 1166, 2, 17, 13.78479660, 122.98023140, '2025-10-08 02:22:21', 0.00, 17.16, NULL, NULL),
(2296, 1166, 2, 17, 13.78472660, 122.98123460, '2025-10-08 02:22:26', 0.00, 13.83, NULL, NULL),
(2297, 1166, 2, 17, 13.78470500, 122.98151270, '2025-10-08 02:22:32', 0.01, 11.51, NULL, NULL),
(2298, 1166, 2, 17, 13.78455150, 122.98346710, '2025-10-08 02:22:37', 0.19, 8.40, NULL, NULL),
(2299, 1166, 2, 17, 13.78546450, 122.98565610, '2025-10-08 02:22:43', 0.20, 6.49, NULL, NULL),
(2300, 1166, 2, 17, 13.78554310, 122.98578820, '2025-10-08 02:22:48', 0.00, 6.32, NULL, NULL),
(2301, 1166, 2, 17, 13.78564970, 122.98588510, '2025-10-08 02:22:53', 0.00, 6.03, NULL, NULL),
(2302, 1166, 2, 17, 13.78469010, 122.97999300, '2025-10-08 02:22:58', 0.03, 8.26, NULL, NULL),
(2303, 1166, 2, 17, 13.78455120, 122.97982930, '2025-10-08 02:23:04', 0.01, 8.68, NULL, NULL),
(2304, 1166, 2, 17, 13.78453280, 122.97984720, '2025-10-08 02:23:09', 0.01, 1.80, NULL, NULL),
(2305, 1166, 2, 17, 13.78452180, 122.97983340, '2025-10-08 02:23:14', 0.00, 1.80, NULL, NULL),
(2306, 1166, 2, 17, 13.78451680, 122.97982680, '2025-10-08 02:23:19', 0.00, 1.90, NULL, NULL),
(2307, 1166, 2, 17, 13.78451500, 122.97982170, '2025-10-08 02:23:25', 0.00, 2.32, NULL, NULL),
(2308, 1166, 2, 17, 13.78451500, 122.97982170, '2025-10-08 02:23:30', 0.00, 2.53, NULL, NULL),
(2309, 1166, 2, 17, 13.78451500, 122.97982170, '2025-10-08 02:23:35', 0.00, 2.42, NULL, NULL),
(2310, 1166, 2, 17, 13.78453660, 122.97985830, '2025-10-08 02:23:40', 0.00, 1.70, NULL, NULL),
(2311, 1166, 2, 17, 13.78454000, 122.97985830, '2025-10-08 02:23:46', 0.00, 1.70, NULL, NULL),
(2312, 1166, 2, 17, 13.78454000, 122.97985830, '2025-10-08 02:23:51', 0.00, 1.70, NULL, NULL),
(2313, 1166, 2, 17, 13.78451190, 122.97984710, '2025-10-08 02:23:56', 0.01, 2.32, NULL, NULL),
(2314, 1166, 2, 17, 13.78451040, 122.97985230, '2025-10-08 02:24:02', 0.03, 3.42, NULL, NULL),
(2315, 1166, 2, 17, 13.78452230, 122.97983150, '2025-10-08 02:24:08', 0.01, 3.56, NULL, NULL),
(2316, 1166, 2, 17, 13.78450590, 122.97978560, '2025-10-08 02:24:13', 0.01, 1.97, NULL, NULL),
(2317, 1166, 2, 17, 13.78449400, 122.97976850, '2025-10-08 02:24:19', 0.00, 2.50, NULL, NULL),
(2318, 1166, 2, 17, 13.78447230, 122.97977610, '2025-10-08 02:24:25', 0.01, 2.63, NULL, NULL),
(2319, 1166, 2, 17, 13.78446010, 122.97977650, '2025-10-08 02:24:31', 0.00, 1.86, NULL, NULL),
(2320, 1166, 2, 17, 13.78447460, 122.97980730, '2025-10-08 02:24:36', 0.02, 2.60, NULL, NULL),
(2321, 1166, 2, 17, 13.78447510, 122.97984650, '2025-10-08 02:24:42', 0.03, 3.98, NULL, NULL),
(2322, 1166, 2, 17, 13.78451670, 122.97989500, '2025-10-08 02:24:47', 0.00, 4.38, NULL, NULL),
(2323, 1166, 2, 17, 13.78456420, 122.97997950, '2025-10-08 02:24:53', 0.02, 4.62, NULL, NULL),
(2324, 1166, 2, 17, 13.78457940, 122.97999260, '2025-10-08 02:24:58', 0.01, 3.00, NULL, NULL),
(2325, 1166, 2, 17, 13.78461260, 122.97999730, '2025-10-08 02:25:04', 0.03, 10.73, NULL, NULL),
(2326, 1166, 2, 17, 13.78461290, 122.97997030, '2025-10-08 02:25:09', 0.01, 2.07, NULL, NULL),
(2327, 1166, 2, 17, 13.78461780, 122.97996550, '2025-10-08 02:25:14', 0.00, 2.01, NULL, NULL),
(2328, 1166, 2, 17, 13.78461570, 122.97993700, '2025-10-08 02:25:20', 0.03, 3.72, NULL, NULL),
(2329, 1166, 2, 17, 13.75874110, 122.96468950, '2025-10-08 06:48:10', NULL, 14.45, NULL, NULL),
(2330, 1166, 2, 17, 13.75873190, 122.96462430, '2025-10-08 06:48:15', 0.19, 14.20, NULL, NULL),
(2331, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 08:45:12', NULL, 500.00, NULL, NULL),
(2332, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 08:45:29', NULL, 500.00, NULL, NULL),
(2333, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:46:05', NULL, 159.00, NULL, NULL),
(2334, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:46:26', NULL, 159.00, NULL, NULL),
(2335, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:46:36', NULL, 159.00, NULL, NULL),
(2336, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:46:45', NULL, 159.00, NULL, NULL),
(2337, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:46:51', NULL, 159.00, NULL, NULL),
(2338, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:46:54', NULL, 159.00, NULL, NULL),
(2339, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:50:48', NULL, 159.00, NULL, NULL),
(2340, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 09:51:16', NULL, 159.00, NULL, NULL),
(2341, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 09:53:28', NULL, 500.00, NULL, NULL),
(2342, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 09:55:24', NULL, 500.00, NULL, NULL),
(2343, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 09:56:13', NULL, 500.00, NULL, NULL),
(2344, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 09:58:52', NULL, 500.00, NULL, NULL),
(2345, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 09:59:06', NULL, 500.00, NULL, NULL),
(2346, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:01:17', NULL, 159.00, NULL, NULL),
(2347, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:15:07', NULL, 159.00, NULL, NULL),
(2348, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:15:32', NULL, 159.00, NULL, NULL),
(2349, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:15:51', NULL, 159.00, NULL, NULL),
(2350, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:17:59', NULL, 159.00, NULL, NULL),
(2351, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:32:38', NULL, 159.00, NULL, NULL),
(2352, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:32:46', NULL, 159.00, NULL, NULL),
(2353, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:33:47', NULL, 159.00, NULL, NULL),
(2354, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:35:06', NULL, 159.00, NULL, NULL),
(2355, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:37:43', NULL, 159.00, NULL, NULL),
(2356, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:38:09', NULL, 159.00, NULL, NULL),
(2357, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:38:18', NULL, 159.00, NULL, NULL),
(2358, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:40:44', NULL, 159.00, NULL, NULL),
(2359, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 10:41:08', NULL, 159.00, NULL, NULL),
(2360, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:28:02', NULL, 159.00, NULL, NULL),
(2361, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:28:26', NULL, 159.00, NULL, NULL),
(2362, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:28:40', NULL, 159.00, NULL, NULL),
(2363, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:28:49', NULL, 159.00, NULL, NULL),
(2364, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:31:42', NULL, 159.00, NULL, NULL),
(2365, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:35:07', NULL, 159.00, NULL, NULL),
(2366, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:35:27', NULL, 159.00, NULL, NULL),
(2367, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 11:37:51', NULL, 500.00, NULL, NULL),
(2368, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:42:02', NULL, 159.00, NULL, NULL),
(2369, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:42:06', NULL, 159.00, NULL, NULL),
(2370, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 11:44:30', NULL, 500.00, NULL, NULL),
(2371, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 11:44:47', NULL, 500.00, NULL, NULL),
(2372, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 11:45:22', NULL, 500.00, NULL, NULL),
(2373, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:46:00', NULL, 159.00, NULL, NULL),
(2374, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:48:13', NULL, 159.00, NULL, NULL),
(2375, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:48:52', NULL, 159.00, NULL, NULL),
(2376, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:50:18', NULL, 159.00, NULL, NULL),
(2377, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:50:19', NULL, 159.00, NULL, NULL),
(2378, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 11:58:20', NULL, 500.00, NULL, NULL),
(2379, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 11:58:30', NULL, 159.00, NULL, NULL),
(2380, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 12:23:13', NULL, 500.00, NULL, NULL),
(2381, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:23:36', NULL, 159.00, NULL, NULL),
(2382, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:24:21', NULL, 159.00, NULL, NULL),
(2383, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:24:32', NULL, 159.00, NULL, NULL),
(2384, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:27:35', NULL, 159.00, NULL, NULL),
(2385, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:27:48', NULL, 159.00, NULL, NULL),
(2386, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:29:53', NULL, 159.00, NULL, NULL),
(2387, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-22 12:30:06', NULL, 500.00, NULL, NULL),
(2388, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:30:28', NULL, 159.00, NULL, NULL),
(2389, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:30:37', NULL, 159.00, NULL, NULL),
(2390, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:30:45', NULL, 159.00, NULL, NULL),
(2391, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:31:19', NULL, 159.00, NULL, NULL),
(2392, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:31:34', NULL, 159.00, NULL, NULL),
(2393, 1318, 1, 16, 13.68718806, 123.09720434, '2025-11-22 12:31:41', NULL, 159.00, NULL, NULL),
(2394, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-24 08:39:06', NULL, 500.00, NULL, NULL),
(2395, 1318, 1, 16, 13.68742800, 123.09631300, '2025-11-24 08:39:21', NULL, 500.00, NULL, NULL),
(2396, 1326, 2, 17, 13.68742800, 123.09631300, '2025-11-24 05:56:14', NULL, 500.00, NULL, NULL),
(2397, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 05:58:36', NULL, 500.00, NULL, NULL),
(2398, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 06:04:32', NULL, 500.00, NULL, NULL),
(2399, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 09:29:30', NULL, 159.00, NULL, NULL),
(2400, 1325, 1, 16, 0.00000000, 0.00000000, '2025-11-24 09:29:46', NULL, 150.00, NULL, NULL),
(2401, 1325, 1, 16, 0.00000000, 122.97620000, '2025-11-24 09:30:05', NULL, 150.00, NULL, NULL),
(2402, 1325, 1, 16, 0.00000000, 122.97620000, '2025-11-24 09:30:27', NULL, 150.00, NULL, NULL),
(2403, 1325, 1, 16, 13.77010000, 122.97620000, '2025-11-24 09:30:32', NULL, 150.00, NULL, NULL),
(2404, 1325, 1, 16, 13.77010000, 122.97620000, '2025-11-24 09:31:48', NULL, 150.00, NULL, NULL),
(2405, 1325, 1, 16, 13.77010000, 122.97620000, '2025-11-24 10:03:06', NULL, 150.00, NULL, NULL),
(2406, 1325, 1, 16, 13.77010000, 122.97620000, '2025-11-24 10:39:42', NULL, 150.00, NULL, NULL),
(2407, 1325, 1, 16, 13.77010000, 122.97620000, '2025-11-24 10:42:07', NULL, 150.00, NULL, NULL),
(2408, 1325, 1, 16, 13.77010000, 122.97620000, '2025-11-24 10:46:02', NULL, 150.00, NULL, NULL),
(2409, 1325, 1, 16, 13.77010000, 122.97620000, '2025-11-24 10:46:41', NULL, 150.00, NULL, NULL),
(2410, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:16:56', NULL, 500.00, NULL, NULL),
(2411, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:18:18', NULL, 500.00, NULL, NULL),
(2412, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 11:19:45', NULL, 159.00, NULL, NULL),
(2413, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:38:28', NULL, 500.00, NULL, NULL),
(2414, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:38:32', NULL, 500.00, NULL, NULL),
(2415, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:43:52', NULL, 500.00, NULL, NULL),
(2416, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 11:43:57', NULL, 159.00, NULL, NULL),
(2417, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 11:44:23', NULL, 159.00, NULL, NULL),
(2418, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:56:08', NULL, 500.00, NULL, NULL),
(2419, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:56:45', NULL, 500.00, NULL, NULL),
(2420, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 11:57:48', NULL, 500.00, NULL, NULL),
(2421, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:01:56', NULL, 500.00, NULL, NULL),
(2422, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:02:29', NULL, 500.00, NULL, NULL),
(2423, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:14:03', NULL, 500.00, NULL, NULL),
(2424, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:14:15', NULL, 500.00, NULL, NULL),
(2425, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:26:45', NULL, 500.00, NULL, NULL),
(2426, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:38:07', NULL, 500.00, NULL, NULL),
(2427, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:38:28', NULL, 500.00, NULL, NULL),
(2428, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 12:46:48', NULL, 500.00, NULL, NULL),
(2429, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 12:48:30', NULL, 159.00, NULL, NULL),
(2430, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 12:50:09', NULL, 159.00, NULL, NULL),
(2431, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 12:53:44', NULL, 159.00, NULL, NULL),
(2432, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 12:55:01', NULL, 159.00, NULL, NULL),
(2433, 1325, 1, 16, 13.68718806, 123.09720434, '2025-11-24 13:35:08', NULL, 159.00, NULL, NULL),
(2434, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:41:02', NULL, 500.00, NULL, NULL),
(2435, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:53:50', NULL, 500.00, NULL, NULL),
(2436, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:53:53', NULL, 500.00, NULL, NULL),
(2437, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:54:37', NULL, 500.00, NULL, NULL),
(2438, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:55:05', NULL, 500.00, NULL, NULL),
(2439, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:55:28', NULL, 500.00, NULL, NULL),
(2440, 1325, 1, 16, 13.77030000, 122.97540000, '2025-11-24 13:55:41', NULL, 150.00, NULL, NULL),
(2441, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:56:02', NULL, 500.00, NULL, NULL),
(2442, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:58:18', NULL, 500.00, NULL, NULL),
(2443, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:58:22', NULL, 500.00, NULL, NULL),
(2444, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:58:37', NULL, 500.00, NULL, NULL),
(2445, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 13:59:06', NULL, 500.00, NULL, NULL),
(2446, 1325, 1, 16, 13.68742800, 123.09631300, '2025-11-24 14:02:15', NULL, 500.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `iec_material`
--

CREATE TABLE `iec_material` (
  `material_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `material_type` varchar(50) DEFAULT NULL,
  `upload_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `iec_view`
--

CREATE TABLE `iec_view` (
  `view_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `viewed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `issue_reports`
--

CREATE TABLE `issue_reports` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reporter_name` varchar(255) NOT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `issue_type` varchar(256) NOT NULL,
  `exact_location` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','active','resolved','closed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `resolution_photo_url` varchar(500) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `location_lat` decimal(10,8) DEFAULT NULL,
  `location_lng` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `issue_reports`
--

INSERT INTO `issue_reports` (`id`, `reporter_id`, `reporter_name`, `barangay`, `issue_type`, `exact_location`, `description`, `photo_url`, `status`, `created_at`, `updated_at`, `resolved_at`, `resolved_by`, `resolution_notes`, `resolution_photo_url`, `priority`, `location_lat`, `location_lng`) VALUES
(19, 68, 'Daniela Corral', 'Gaongan', 'Unpleasant odors from trash areas', 'Centro 2 Gaongan', 'asdasda', NULL, 'resolved', '2025-10-06 10:15:31', '2025-10-07 08:12:58', '2025-10-07 08:12:58', 1, 'okay na ang issue mo tanga', 'uploads/issue_resolutions/resolution_19_1759824777.jpg', 'medium', NULL, NULL),
(20, 68, 'Daniela Corral', 'Gaongan', 'Rude or unprofessional service from collectors', 'Tara Sipocot', 'Kupall', 'uploads/issue_reports/issue_68_1759745763_68e396e3b5599.jpg', 'resolved', '2025-10-06 10:16:03', '2025-10-07 08:12:49', '2025-10-07 08:12:49', 1, NULL, 'uploads/issue_resolutions/resolution_20_1759824769.jpg', 'medium', NULL, NULL),
(21, 10, 'Daniela Corral', '39-STHCN', 'Missed or delayed pickups', 'Centro 2 Gaongan', 'barangay head', 'uploads/issue_reports/issue_10_1759746544_68e399f07e374.jpg', 'resolved', '2025-10-06 10:29:04', '2025-10-07 08:12:39', '2025-10-07 08:12:39', 1, NULL, 'uploads/issue_resolutions/resolution_21_1759824759.jpg', 'medium', NULL, NULL),
(22, 68, 'Daniela Corral', 'Gaongan', 'idkkashjdlkajhsdka', 'Centro 2 Gaongan', 'sfdsad', 'uploads/issue_reports/issue_68_1759808324_68e48b4456901.jpg', 'active', '2025-10-07 03:38:44', '2025-10-07 03:39:58', NULL, 1, NULL, NULL, 'medium', NULL, NULL),
(23, 68, 'Emeir Amado', 'Gaongan', 'idkkashjdlkajhsdka', 'Centro 2 Gaongan', '1.36', NULL, 'pending', '2025-10-07 05:37:00', '2025-10-07 05:37:00', NULL, NULL, NULL, NULL, 'medium', NULL, NULL),
(24, 10, 'Ian Jay Anonuevo', '39-STHCN', 'test bh', 'gaongan city', 'bh bh', NULL, 'closed', '2025-10-07 06:32:37', '2025-10-07 07:50:50', '2025-10-07 07:50:50', 1, NULL, NULL, 'medium', NULL, NULL),
(25, 68, 'Emeir Amado', 'Gaongan', 'Overflowing or insufficient bins', 'Centro 2 City', 'HAHAHAHA', 'uploads/issue_reports/issue_68_1759843381_68e5143533d01.jpg', 'pending', '2025-10-07 13:23:01', '2025-10-07 13:23:01', NULL, NULL, NULL, NULL, 'medium', NULL, NULL),
(26, 68, 'Emeir Amado', 'Gaongan', 'Missed or delayed pickups', 'Tara Sipocot', 'October 8', NULL, 'pending', '2025-10-07 21:20:42', '2025-10-07 21:20:42', NULL, NULL, NULL, NULL, 'medium', NULL, NULL),
(27, 68, 'Emeir Amado', 'Gaongan', 'Missed or delayed pickups', 'Tara Sipocot', 'Namiss u', NULL, 'pending', '2025-10-08 00:37:10', '2025-11-21 06:41:42', NULL, 1, NULL, NULL, 'medium', NULL, NULL),
(28, 68, 'Emeir Amado', 'Gaongan', 'Missed or delayed pickups', 'south centro', 'hjghfgh', NULL, 'resolved', '2025-10-08 01:35:05', '2025-10-08 02:22:51', '2025-10-08 02:22:51', 1, NULL, 'uploads/issue_resolutions/resolution_28_1759890171.png', 'medium', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notification_id` int(11) NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `response_status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`notification_id`, `recipient_id`, `message`, `created_at`, `response_status`) VALUES
(11527, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1092,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1093,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1096,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1097,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1098,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1099,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1100,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1101,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1102,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1103,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-06 16:08:12', 'read'),
(11528, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1092,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1093,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1096,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1097,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1098,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1099,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1100,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1101,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1102,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1103,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-06 16:08:12', 'read'),
(11529, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1092,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1093,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1096,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1097,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1098,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1099,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1100,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1101,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1102,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1103,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-06 16:08:12', 'read'),
(11530, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1094,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1095,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-06 16:08:12', 'read'),
(11531, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1094,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1095,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-06 16:08:12', 'read'),
(11532, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1094,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1095,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-06 16:08:12', 'read'),
(11533, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1094,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1095,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-06 16:08:12', 'read'),
(11534, 31, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1092,\"barangay\":\"Impig\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"reassigned\"},{\"team_id\":1093,\"barangay\":\"Tara\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1096,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"reassigned\"},{\"team_id\":1097,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1098,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"reassigned\"},{\"team_id\":1099,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"reassigned\"},{\"team_id\":1100,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"reassigned\"},{\"team_id\":1101,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"reassigned\"},{\"team_id\":1102,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"reassigned\"},{\"team_id\":1103,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"reassigned\"}]}', '2025-10-06 16:08:54', 'read'),
(11535, 1, '{\"type\":\"route_started\",\"route_id\":492,\"barangay\":\"Manangle\",\"message\":\"Route started for Manangle! Please go to route run page to manage stops.\",\"redirect_url\":\"/collector/route/492\"}', '2025-10-07 02:43:17', 'unread'),
(11536, 1, '{\"type\":\"route_started\",\"route_id\":492,\"barangay\":\"Manangle\",\"message\":\"Route started for Manangle! Please go to route run page to manage stops.\",\"redirect_url\":\"/collector/route/492\"}', '2025-10-07 02:43:17', 'unread'),
(11537, 1, '{\"type\":\"route_started\",\"route_id\":492,\"barangay\":\"Manangle\",\"message\":\"Route started for Manangle! Please go to route run page to manage stops.\",\"redirect_url\":\"/collector/route/492\"}', '2025-10-07 02:43:17', 'unread'),
(11539, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1104,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1107,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1108,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1109,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1110,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1111,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1112,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1113,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1114,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 17:30:07', 'read'),
(11540, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1104,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1107,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1108,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1109,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1110,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1111,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1112,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1113,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1114,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 17:30:07', 'unread'),
(11541, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1104,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1107,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1108,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1109,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1110,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1111,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1112,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1113,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1114,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 17:30:07', 'unread'),
(11542, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1105,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1106,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 17:30:07', 'read'),
(11543, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1105,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1106,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 17:30:07', 'unread'),
(11544, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1105,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1106,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 17:30:07', 'unread'),
(11545, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1105,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1106,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 17:30:07', 'unread'),
(11547, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1115,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1118,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1119,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1120,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1121,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1122,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1123,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1124,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1125,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:49:56', 'unread'),
(11548, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1115,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1118,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1119,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1120,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1121,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1122,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1123,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1124,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1125,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:49:56', 'unread'),
(11549, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1115,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1118,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1119,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1120,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1121,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1122,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1123,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1124,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1125,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:49:56', 'unread'),
(11550, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1116,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1117,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:49:56', 'read'),
(11551, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1116,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1117,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:49:56', 'unread'),
(11552, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1116,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1117,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:49:56', 'unread'),
(11553, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1116,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1117,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:49:56', 'unread'),
(11555, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1126,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1129,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1130,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1131,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1132,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1133,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1134,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1135,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1136,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:55:00', 'unread'),
(11556, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1126,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1129,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1130,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1131,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1132,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1133,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1134,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1135,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1136,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:55:00', 'unread'),
(11557, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1126,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1129,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1130,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1131,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1132,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1133,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1134,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1135,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1136,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:55:00', 'unread'),
(11558, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1127,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1128,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:55:00', 'read'),
(11559, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1127,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1128,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:55:00', 'unread'),
(11560, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1127,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1128,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:55:00', 'unread'),
(11561, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1127,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1128,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:55:00', 'unread'),
(11563, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1137,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1140,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1141,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1142,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1143,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1144,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1145,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1146,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1147,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:56:50', 'unread'),
(11564, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1137,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1140,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1141,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1142,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1143,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1144,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1145,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1146,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1147,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:56:50', 'unread'),
(11565, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1137,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1140,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1141,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1142,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1143,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1144,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1145,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1146,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1147,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-07 23:56:50', 'unread'),
(11566, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1138,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1139,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:56:50', 'read'),
(11567, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1138,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1139,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:56:50', 'unread'),
(11568, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1138,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1139,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:56:50', 'unread'),
(11569, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1138,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1139,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-07 23:56:50', 'unread'),
(11571, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1148,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1151,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1152,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1153,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1154,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1155,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1156,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1157,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1158,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:06:34', 'unread'),
(11572, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1148,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1151,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1152,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1153,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1154,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1155,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1156,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1157,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1158,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:06:34', 'unread'),
(11573, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1148,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1151,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1152,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1153,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1154,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1155,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1156,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1157,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1158,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-09\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:06:34', 'unread'),
(11574, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1149,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1150,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:06:34', 'read'),
(11575, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1149,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1150,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:06:34', 'unread'),
(11576, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1149,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1150,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:06:34', 'unread'),
(11577, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-09\",\"assignments\":[{\"team_id\":1149,\"barangay\":\"Gabi\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1150,\"barangay\":\"Manlubang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-09\",\"time\":\"10:30:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:06:34', 'unread'),
(11579, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1159,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1160,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:16:17', 'unread'),
(11580, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1159,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1160,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:16:17', 'read'),
(11581, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1159,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1160,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:16:17', 'read'),
(11582, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1161,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1162,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:16:17', 'read'),
(11583, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1161,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1162,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:16:17', 'unread'),
(11584, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1161,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1162,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:16:17', 'unread'),
(11585, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1161,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1162,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:16:17', 'read'),
(11587, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1163,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1164,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1167,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1168,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1169,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1170,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1171,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1172,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1173,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1174,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:17:34', 'unread'),
(11588, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1163,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1164,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1167,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1168,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1169,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1170,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1171,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1172,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1173,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1174,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:17:34', 'read');
INSERT INTO `notification` (`notification_id`, `recipient_id`, `message`, `created_at`, `response_status`) VALUES
(11589, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1163,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1164,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1167,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1168,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1169,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1170,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1171,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1172,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1173,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1174,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-08 00:17:34', 'read'),
(11590, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1165,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1166,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:17:34', 'read'),
(11591, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1165,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1166,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:17:34', 'unread'),
(11592, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1165,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1166,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:17:34', 'unread'),
(11593, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1165,\"barangay\":\"Lubigan Jr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1166,\"barangay\":\"Manangle\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-08 00:17:34', 'read'),
(11594, 31, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1163,\"barangay\":\"Impig\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"reassigned\"},{\"team_id\":1164,\"barangay\":\"Tara\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1165,\"barangay\":\"Lubigan Jr.\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"reassigned\"},{\"team_id\":1166,\"barangay\":\"Manangle\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1167,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"reassigned\"},{\"team_id\":1168,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1169,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"reassigned\"},{\"team_id\":1170,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"reassigned\"},{\"team_id\":1171,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"reassigned\"},{\"team_id\":1172,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"reassigned\"},{\"team_id\":1173,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"reassigned\"},{\"team_id\":1174,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"reassigned\"}]}', '2025-10-08 01:53:41', 'read'),
(11595, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-08\",\"assignments\":[{\"team_id\":1163,\"barangay\":\"Impig\",\"date\":\"2025-10-08\",\"time\":\"08:00:00\",\"type\":\"reassigned\"},{\"team_id\":1164,\"barangay\":\"Tara\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1165,\"barangay\":\"Lubigan Jr.\",\"date\":\"2025-10-08\",\"time\":\"09:00:00\",\"type\":\"reassigned\"},{\"team_id\":1166,\"barangay\":\"Manangle\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1167,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"06:00:00\",\"type\":\"reassigned\"},{\"team_id\":1168,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"10:00:00\",\"type\":\"reassigned\"},{\"team_id\":1169,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"13:00:00\",\"type\":\"reassigned\"},{\"team_id\":1170,\"barangay\":\"North Centro\",\"date\":\"2025-10-08\",\"time\":\"16:00:00\",\"type\":\"reassigned\"},{\"team_id\":1171,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"07:00:00\",\"type\":\"reassigned\"},{\"team_id\":1172,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"11:00:00\",\"type\":\"reassigned\"},{\"team_id\":1173,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"14:00:00\",\"type\":\"reassigned\"},{\"team_id\":1174,\"barangay\":\"South Centro\",\"date\":\"2025-10-08\",\"time\":\"17:00:00\",\"type\":\"reassigned\"}]}', '2025-10-08 01:56:16', 'unread'),
(11597, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-10\",\"assignments\":[{\"team_id\":1175,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1176,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1177,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1178,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1180,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1181,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1182,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1183,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1184,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1185,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1186,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1187,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-09 01:49:02', 'unread'),
(11598, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-10\",\"assignments\":[{\"team_id\":1175,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1176,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1177,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1178,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1180,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1181,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1182,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1183,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1184,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1185,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1186,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1187,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-09 01:49:02', 'unread'),
(11599, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-10\",\"assignments\":[{\"team_id\":1175,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1176,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1177,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1178,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1180,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1181,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1182,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1183,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1184,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1185,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1186,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1187,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-10\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-09 01:49:02', 'unread'),
(11600, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-10\",\"assignments\":[{\"team_id\":1179,\"barangay\":\"Bulawan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-10\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-09 01:49:02', 'unread'),
(11601, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-10\",\"assignments\":[{\"team_id\":1179,\"barangay\":\"Bulawan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-10\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-09 01:49:02', 'unread'),
(11602, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-10\",\"assignments\":[{\"team_id\":1179,\"barangay\":\"Bulawan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-10\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-09 01:49:02', 'unread'),
(11603, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-10\",\"assignments\":[{\"team_id\":1179,\"barangay\":\"Bulawan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-10\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-09 01:49:02', 'unread'),
(11605, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-13\",\"assignments\":[{\"team_id\":1188,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1189,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1193,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1194,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1195,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1196,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1197,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1198,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1199,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1200,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-12 01:49:01', 'unread'),
(11606, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-13\",\"assignments\":[{\"team_id\":1188,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1189,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1193,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1194,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1195,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1196,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1197,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1198,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1199,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1200,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-12 01:49:01', 'unread'),
(11607, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-13\",\"assignments\":[{\"team_id\":1188,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1189,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1193,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1194,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1195,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1196,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1197,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1198,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1199,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1200,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-13\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-12 01:49:01', 'unread'),
(11608, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-13\",\"assignments\":[{\"team_id\":1190,\"barangay\":\"Binahian\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1191,\"barangay\":\"Caima\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1192,\"barangay\":\"Bagong Sirang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-12 01:49:01', 'unread'),
(11609, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-13\",\"assignments\":[{\"team_id\":1190,\"barangay\":\"Binahian\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1191,\"barangay\":\"Caima\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1192,\"barangay\":\"Bagong Sirang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-12 01:49:01', 'unread'),
(11610, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-13\",\"assignments\":[{\"team_id\":1190,\"barangay\":\"Binahian\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1191,\"barangay\":\"Caima\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1192,\"barangay\":\"Bagong Sirang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-12 01:49:01', 'unread'),
(11611, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-13\",\"assignments\":[{\"team_id\":1190,\"barangay\":\"Binahian\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1191,\"barangay\":\"Caima\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1192,\"barangay\":\"Bagong Sirang\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-13\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-12 01:49:01', 'unread'),
(11613, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-14\",\"assignments\":[{\"team_id\":1201,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1205,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1206,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1207,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1208,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1209,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1210,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1211,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1212,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-13 01:49:01', 'unread'),
(11614, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-14\",\"assignments\":[{\"team_id\":1201,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1205,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1206,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1207,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1208,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1209,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1210,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1211,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1212,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-13 01:49:01', 'unread'),
(11615, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-14\",\"assignments\":[{\"team_id\":1201,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1205,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1206,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1207,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1208,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1209,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1210,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1211,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1212,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-14\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-13 01:49:01', 'unread'),
(11616, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-14\",\"assignments\":[{\"team_id\":1202,\"barangay\":\"Carayrayan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1203,\"barangay\":\"Lipilip\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1204,\"barangay\":\"Lubigan Sr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-13 01:49:01', 'unread'),
(11617, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-14\",\"assignments\":[{\"team_id\":1202,\"barangay\":\"Carayrayan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1203,\"barangay\":\"Lipilip\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1204,\"barangay\":\"Lubigan Sr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-13 01:49:01', 'unread'),
(11618, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-14\",\"assignments\":[{\"team_id\":1202,\"barangay\":\"Carayrayan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1203,\"barangay\":\"Lipilip\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1204,\"barangay\":\"Lubigan Sr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-13 01:49:01', 'unread'),
(11619, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-14\",\"assignments\":[{\"team_id\":1202,\"barangay\":\"Carayrayan\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"08:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1203,\"barangay\":\"Lipilip\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1204,\"barangay\":\"Lubigan Sr.\",\"cluster\":\"3C-CB\",\"date\":\"2025-10-14\",\"time\":\"11:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-13 01:49:01', 'unread'),
(11621, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-15\",\"assignments\":[{\"team_id\":1213,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1214,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1217,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1218,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1219,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1220,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1221,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1222,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1223,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1224,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-14 01:49:01', 'unread'),
(11622, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-15\",\"assignments\":[{\"team_id\":1213,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1214,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1217,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1218,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1219,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1220,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1221,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1222,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1223,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1224,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-14 01:49:01', 'unread'),
(11623, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-15\",\"assignments\":[{\"team_id\":1213,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1214,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1217,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1218,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1219,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1220,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1221,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1222,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1223,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1224,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-15\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-14 01:49:01', 'unread'),
(11624, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-15\",\"assignments\":[{\"team_id\":1215,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1216,\"barangay\":\"Salanda\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-14 01:49:01', 'unread'),
(11625, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-15\",\"assignments\":[{\"team_id\":1215,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1216,\"barangay\":\"Salanda\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-14 01:49:01', 'unread'),
(11626, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-15\",\"assignments\":[{\"team_id\":1215,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1216,\"barangay\":\"Salanda\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-14 01:49:01', 'unread'),
(11627, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-15\",\"assignments\":[{\"team_id\":1215,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1216,\"barangay\":\"Salanda\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-15\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-14 01:49:01', 'unread'),
(11629, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-16\",\"assignments\":[{\"team_id\":1225,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1228,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1229,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1230,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1231,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1232,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1233,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1234,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1235,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-15 01:49:01', 'unread'),
(11630, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-16\",\"assignments\":[{\"team_id\":1225,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1228,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1229,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1230,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1231,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1232,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1233,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1234,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1235,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-15 01:49:01', 'unread'),
(11631, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-16\",\"assignments\":[{\"team_id\":1225,\"barangay\":\"Gaongan\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1228,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1229,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1230,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1231,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1232,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1233,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1234,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1235,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-16\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-15 01:49:01', 'unread'),
(11632, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-16\",\"assignments\":[{\"team_id\":1226,\"barangay\":\"Bolo Sur\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1227,\"barangay\":\"Alteza\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-15 01:49:01', 'unread'),
(11633, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-16\",\"assignments\":[{\"team_id\":1226,\"barangay\":\"Bolo Sur\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1227,\"barangay\":\"Alteza\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-15 01:49:01', 'unread'),
(11634, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-16\",\"assignments\":[{\"team_id\":1226,\"barangay\":\"Bolo Sur\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1227,\"barangay\":\"Alteza\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-15 01:49:01', 'unread'),
(11635, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-16\",\"assignments\":[{\"team_id\":1226,\"barangay\":\"Bolo Sur\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"},{\"team_id\":1227,\"barangay\":\"Alteza\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-16\",\"time\":\"10:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-15 01:49:01', 'unread'),
(11636, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1236,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1237,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1238,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1239,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1241,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1242,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1243,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1244,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1245,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1246,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1247,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1248,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-16 01:49:02', 'read'),
(11637, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1236,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1237,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1238,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1239,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1241,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1242,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1243,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1244,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1245,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1246,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1247,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1248,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-16 01:49:02', 'unread'),
(11638, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1236,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1237,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1238,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1239,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1241,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1242,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1243,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1244,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1245,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1246,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1247,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1248,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-16 01:49:02', 'unread');
INSERT INTO `notification` (`notification_id`, `recipient_id`, `message`, `created_at`, `response_status`) VALUES
(11639, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1236,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1237,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1238,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1239,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1241,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1242,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1243,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1244,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1245,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1246,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1247,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1248,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-10-17\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-10-16 01:49:02', 'unread'),
(11640, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1240,\"barangay\":\"South Villazar\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-16 01:49:02', 'unread'),
(11641, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1240,\"barangay\":\"South Villazar\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-16 01:49:02', 'unread'),
(11642, 34, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1240,\"barangay\":\"South Villazar\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-16 01:49:02', 'unread'),
(11643, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-10-17\",\"assignments\":[{\"team_id\":1240,\"barangay\":\"South Villazar\",\"cluster\":\"4C-CC\",\"date\":\"2025-10-17\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-10-16 01:49:02', 'unread'),
(11644, 91, '{\"type\":\"attendance_request\",\"request_id\":1,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-21 05:11:02\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251121171102_8af0b2f0.jpg\"}', '2025-11-21 05:11:02', 'unread'),
(11645, 16, '{\"type\":\"attendance_reviewed\",\"request_id\":1,\"decision\":\"declined\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:15:30\",\"review_note\":null}', '2025-11-21 05:15:30', 'read'),
(11646, 91, '{\"type\":\"attendance_request\",\"request_id\":2,\"user_id\":30,\"name\":\"Joseph Osela\",\"submitted_at\":\"2025-11-21 05:11:43\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_30_20251121171143_a4fafe38.png\"}', '2025-11-21 05:11:43', 'unread'),
(11647, 91, '{\"type\":\"attendance_request\",\"request_id\":3,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-21 05:23:41\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251121172341_d20ee693.png\"}', '2025-11-21 05:23:41', 'unread'),
(11648, 16, '{\"type\":\"attendance_reviewed\",\"request_id\":3,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:26:03\",\"review_note\":null}', '2025-11-21 05:26:03', 'read'),
(11649, 91, '{\"type\":\"attendance_request\",\"request_id\":4,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-21 05:11:13\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251121171113_a4136a62.jpg\"}', '2025-11-21 05:11:13', 'unread'),
(11650, 16, '{\"type\":\"attendance_reviewed\",\"request_id\":4,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:11:58\",\"review_note\":null}', '2025-11-21 05:11:58', 'unread'),
(11651, 91, '{\"type\":\"attendance_request\",\"request_id\":5,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-21 05:12:19\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251121171219_366fc01f.png\"}', '2025-11-21 05:12:19', 'unread'),
(11652, 91, '{\"type\":\"attendance_request\",\"request_id\":6,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-21 05:12:53\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251121171253_088c8984.jpg\"}', '2025-11-21 05:12:53', 'unread'),
(11653, 91, '{\"type\":\"attendance_request\",\"request_id\":7,\"user_id\":17,\"name\":\"Ronald Frondozo\",\"submitted_at\":\"2025-11-21 05:13:21\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_17_20251121171321_7d202f1f.png\"}', '2025-11-21 05:13:21', 'unread'),
(11654, 91, '{\"type\":\"attendance_request\",\"request_id\":8,\"user_id\":30,\"name\":\"Joseph Osela\",\"submitted_at\":\"2025-11-21 05:13:45\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_30_20251121171345_e9054bce.png\"}', '2025-11-21 05:13:45', 'unread'),
(11655, 91, '{\"type\":\"attendance_request\",\"request_id\":9,\"user_id\":35,\"name\":\"Rosario Mabini\",\"submitted_at\":\"2025-11-21 05:14:12\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_35_20251121171412_57bba6cf.jpg\"}', '2025-11-21 05:14:12', 'unread'),
(11656, 91, '{\"type\":\"attendance_request\",\"request_id\":10,\"user_id\":29,\"name\":\"Rico Maralit\",\"submitted_at\":\"2025-11-21 05:14:34\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_29_20251121171434_ab2ce96e.png\"}', '2025-11-21 05:14:34', 'unread'),
(11657, 91, '{\"type\":\"attendance_request\",\"request_id\":11,\"user_id\":33,\"name\":\"Joseph Collantes\",\"submitted_at\":\"2025-11-21 05:18:08\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_33_20251121171808_402ff41b.png\"}', '2025-11-21 05:18:08', 'unread'),
(11658, 16, '{\"type\":\"attendance_reviewed\",\"request_id\":6,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:18:14\",\"review_note\":null}', '2025-11-21 05:18:14', 'unread'),
(11659, 17, '{\"type\":\"attendance_reviewed\",\"request_id\":7,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:18:15\",\"review_note\":null}', '2025-11-21 05:18:15', 'unread'),
(11660, 30, '{\"type\":\"attendance_reviewed\",\"request_id\":8,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:18:16\",\"review_note\":null}', '2025-11-21 05:18:16', 'unread'),
(11661, 35, '{\"type\":\"attendance_reviewed\",\"request_id\":9,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:18:17\",\"review_note\":null}', '2025-11-21 05:18:17', 'unread'),
(11662, 29, '{\"type\":\"attendance_reviewed\",\"request_id\":10,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:18:18\",\"review_note\":null}', '2025-11-21 05:18:18', 'unread'),
(11663, 33, '{\"type\":\"attendance_reviewed\",\"request_id\":11,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:18:19\",\"review_note\":null}', '2025-11-21 05:18:19', 'unread'),
(11664, 91, '{\"type\":\"attendance_request\",\"request_id\":12,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-21 05:12:28\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251121171228_f0ef3f91.jpg\"}', '2025-11-21 05:12:28', 'unread'),
(11665, 91, '{\"type\":\"attendance_request\",\"request_id\":13,\"user_id\":17,\"name\":\"Ronald Frondozo\",\"submitted_at\":\"2025-11-21 05:12:59\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_17_20251121171259_9592d81e.jpg\"}', '2025-11-21 05:12:59', 'unread'),
(11666, 91, '{\"type\":\"attendance_request\",\"request_id\":14,\"user_id\":30,\"name\":\"Joseph Osela\",\"submitted_at\":\"2025-11-21 05:13:28\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_30_20251121171328_3899acf8.png\"}', '2025-11-21 05:13:28', 'unread'),
(11667, 91, '{\"type\":\"attendance_request\",\"request_id\":15,\"user_id\":35,\"name\":\"Rosario Mabini\",\"submitted_at\":\"2025-11-21 05:14:04\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_35_20251121171404_d4ea96e8.png\"}', '2025-11-21 05:14:04', 'unread'),
(11668, 91, '{\"type\":\"attendance_request\",\"request_id\":16,\"user_id\":29,\"name\":\"Rico Maralit\",\"submitted_at\":\"2025-11-21 05:14:33\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_29_20251121171433_caf7aadd.jpg\"}', '2025-11-21 05:14:33', 'unread'),
(11669, 91, '{\"type\":\"attendance_request\",\"request_id\":17,\"user_id\":33,\"name\":\"Joseph Collantes\",\"submitted_at\":\"2025-11-21 05:15:04\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_33_20251121171504_585ea45f.png\"}', '2025-11-21 05:15:04', 'unread'),
(11670, 16, '{\"type\":\"attendance_reviewed\",\"request_id\":12,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:15:39\",\"review_note\":null}', '2025-11-21 05:15:39', 'unread'),
(11671, 17, '{\"type\":\"attendance_reviewed\",\"request_id\":13,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:25:46\",\"review_note\":null}', '2025-11-21 05:25:46', 'unread'),
(11672, 16, '{\"type\":\"attendance_reviewed\",\"request_id\":12,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:26:29\",\"review_note\":null}', '2025-11-21 05:26:29', 'unread'),
(11673, 30, '{\"type\":\"attendance_reviewed\",\"request_id\":14,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:26:30\",\"review_note\":null}', '2025-11-21 05:26:30', 'unread'),
(11674, 35, '{\"type\":\"attendance_reviewed\",\"request_id\":15,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:26:31\",\"review_note\":null}', '2025-11-21 05:26:31', 'unread'),
(11675, 29, '{\"type\":\"attendance_reviewed\",\"request_id\":16,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:26:32\",\"review_note\":null}', '2025-11-21 05:26:32', 'unread'),
(11676, 33, '{\"type\":\"attendance_reviewed\",\"request_id\":17,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-21 05:26:33\",\"review_note\":null}', '2025-11-21 05:26:33', 'unread'),
(11677, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1249,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1250,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1251,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1252,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1253,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1254,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1255,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1256,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1257,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1258,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1259,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1260,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:27:02', 'read'),
(11678, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1249,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1250,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1251,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1252,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1253,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1254,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1255,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1256,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1257,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1258,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1259,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1260,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:27:02', 'unread'),
(11679, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1249,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1250,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1251,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1252,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1253,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1254,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1255,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1256,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1257,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1258,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1259,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1260,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:27:02', 'unread'),
(11680, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1249,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1250,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1251,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1252,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1253,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1254,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1255,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1256,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1257,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1258,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1259,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1260,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:27:02', 'unread'),
(11681, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1261,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:27:02', 'unread'),
(11682, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1261,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:27:02', 'read'),
(11683, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1262,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1263,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1264,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1265,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1266,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1267,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1268,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1269,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1270,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1271,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1272,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1273,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:36:49', 'read'),
(11684, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1262,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1263,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1264,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1265,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1266,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1267,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1268,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1269,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1270,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1271,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1272,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1273,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:36:49', 'unread'),
(11685, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1262,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1263,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1264,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1265,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1266,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1267,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1268,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1269,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1270,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1271,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1272,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1273,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:36:49', 'unread'),
(11686, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1262,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1263,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1264,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1265,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1266,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1267,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1268,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1269,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1270,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1271,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1272,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1273,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:36:49', 'unread'),
(11687, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1274,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:36:49', 'unread'),
(11688, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1274,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:36:49', 'unread'),
(11689, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1275,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1276,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1277,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1278,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1279,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1280,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1281,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1282,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1283,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1284,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1285,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1286,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:46:37', 'read'),
(11690, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1275,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1276,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1277,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1278,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1279,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1280,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1281,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1282,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1283,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1284,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1285,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1286,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:46:37', 'unread'),
(11691, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1275,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1276,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1277,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1278,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1279,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1280,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1281,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1282,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1283,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1284,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1285,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1286,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:46:37', 'unread'),
(11692, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1275,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1276,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1277,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1278,\"barangay\":\"Azucena\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1279,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1280,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1281,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"13:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1282,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"16:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1283,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1284,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1285,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"14:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1286,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"17:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:46:37', 'unread'),
(11693, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1287,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:46:37', 'unread'),
(11694, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1287,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:46:37', 'unread'),
(11695, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1288,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1289,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1290,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1291,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1292,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1293,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1294,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:51:24', 'read'),
(11696, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1288,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1289,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1290,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1291,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1292,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1293,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1294,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:51:24', 'unread'),
(11697, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1288,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1289,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1290,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1291,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1292,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1293,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1294,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:51:24', 'unread'),
(11698, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1288,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1289,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1290,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1291,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1292,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1293,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1294,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 05:51:24', 'unread'),
(11699, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1295,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:51:24', 'unread'),
(11700, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1295,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 05:51:24', 'unread'),
(11701, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1296,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1297,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1298,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1299,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1300,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1301,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1302,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:05:43', 'unread'),
(11702, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1296,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1297,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1298,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1299,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1300,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1301,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1302,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:05:43', 'unread'),
(11703, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1296,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1297,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1298,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1299,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1300,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1301,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1302,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:05:43', 'unread'),
(11704, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1296,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1297,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1298,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1299,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1300,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1301,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1302,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:05:43', 'unread');
INSERT INTO `notification` (`notification_id`, `recipient_id`, `message`, `created_at`, `response_status`) VALUES
(11705, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1303,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 06:05:43', 'unread'),
(11706, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1303,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 06:05:43', 'unread'),
(11707, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1304,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1305,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1306,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1307,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1308,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1309,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1310,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:08:29', 'unread'),
(11708, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1304,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1305,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1306,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1307,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1308,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1309,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1310,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:08:29', 'unread'),
(11709, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1304,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1305,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1306,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1307,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1308,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1309,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1310,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:08:29', 'unread'),
(11710, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1304,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1305,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1306,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1307,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1308,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1309,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1310,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:08:29', 'unread'),
(11711, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1311,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 06:08:29', 'unread'),
(11712, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1311,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 06:08:29', 'unread'),
(11713, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1312,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1313,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1314,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1315,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1316,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1317,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1318,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:24:07', 'unread'),
(11714, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1312,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1313,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1314,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1315,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1316,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1317,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1318,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:24:07', 'read'),
(11715, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1312,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1313,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1314,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1315,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1316,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1317,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1318,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:24:07', 'unread'),
(11716, 29, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1312,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1313,\"barangay\":\"Malubago\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1314,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1315,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1316,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1317,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1318,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-21\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-21 06:24:07', 'unread'),
(11717, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1319,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 06:24:07', 'unread'),
(11718, 33, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-21\",\"assignments\":[{\"team_id\":1319,\"barangay\":\"Yabo\",\"cluster\":\"4C-CC\",\"date\":\"2025-11-21\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-21 06:24:07', 'unread'),
(11719, 16, '{\"type\":\"truck_full_request\",\"title\":\"Truck capacity reached\",\"message\":\"Collectors reported the truck is full. Please coordinate landfill trip.\",\"route_id\":617,\"team_id\":1164,\"note\":\"Collector reported truck capacity reached\",\"collector_id\":30,\"collector_name\":\"Joseph\",\"barangay_id\":\"25-MLBG\",\"barangay_name\":\"Malubago\",\"timestamp\":\"2025-11-22T22:22:55+01:00\"}', '2025-11-22 10:22:55', 'unread'),
(11720, 16, '{\"type\":\"truck_full_request\",\"title\":\"Truck capacity reached\",\"message\":\"Collectors reported the truck is full. Please coordinate landfill trip.\",\"route_id\":617,\"team_id\":1164,\"note\":\"Collector reported truck capacity reached\",\"collector_id\":30,\"collector_name\":\"Joseph\",\"barangay_id\":\"25-MLBG\",\"barangay_name\":\"Malubago\",\"timestamp\":\"2025-11-22T22:33:40+01:00\"}', '2025-11-22 10:33:40', 'unread'),
(11721, 16, '{\"type\":\"truck_full_request\",\"title\":\"Truck capacity reached\",\"message\":\"Collectors reported the truck is full. Please coordinate landfill trip.\",\"route_id\":616,\"team_id\":1163,\"note\":\"Collector reported truck capacity reached\",\"collector_id\":30,\"collector_name\":\"Joseph\",\"barangay_id\":\"20-IMPG\",\"barangay_name\":\"Impig\",\"timestamp\":\"2025-11-22T23:35:20+01:00\"}', '2025-11-22 11:35:20', 'unread'),
(11722, 16, '{\"type\":\"truck_full_request\",\"title\":\"Truck capacity reached\",\"message\":\"Collectors reported the truck is full. Please coordinate landfill trip.\",\"route_id\":621,\"team_id\":1168,\"note\":\"Collector reported truck capacity reached\",\"collector_id\":30,\"collector_name\":\"Joseph\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"timestamp\":\"2025-11-23T00:24:25+01:00\"}', '2025-11-22 12:24:25', 'unread'),
(11723, 16, '{\"type\":\"truck_full_request\",\"title\":\"Truck capacity reached\",\"message\":\"Collectors reported the truck is full. Please coordinate landfill trip.\",\"route_id\":621,\"team_id\":1168,\"note\":\"Collector reported truck capacity reached\",\"collector_id\":30,\"collector_name\":\"Joseph\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"timestamp\":\"2025-11-23T00:30:41+01:00\"}', '2025-11-22 12:30:41', 'unread'),
(11724, 91, '{\"type\":\"attendance_request\",\"request_id\":18,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-23 05:13:43\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251123171343_2efa833e.jpg\"}', '2025-11-23 05:13:43', 'unread'),
(11725, 16, '{\"type\":\"attendance_reviewed\",\"request_id\":18,\"decision\":\"approved\",\"reviewed_by\":91,\"reviewer_name\":\"Emeir Amado\",\"reviewed_at\":\"2025-11-23 05:14:27\",\"review_note\":null}', '2025-11-23 05:14:27', 'unread'),
(11726, 91, '{\"type\":\"attendance_request\",\"request_id\":19,\"user_id\":16,\"name\":\"Paul Ezra Bermal\",\"submitted_at\":\"2025-11-24 05:11:14\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_16_20251124171114_93e3a3cd.jpg\"}', '2025-11-24 05:11:14', 'unread'),
(11727, 91, '{\"type\":\"attendance_request\",\"request_id\":20,\"user_id\":17,\"name\":\"Ronald Frondozo\",\"submitted_at\":\"2025-11-24 05:12:08\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_17_20251124171208_1266a851.jpg\"}', '2025-11-24 05:12:08', 'unread'),
(11728, 91, '{\"type\":\"attendance_request\",\"request_id\":21,\"user_id\":30,\"name\":\"Joseph Osela\",\"submitted_at\":\"2025-11-24 05:14:15\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_30_20251124171415_5401d8d6.jpg\"}', '2025-11-24 05:14:15', 'unread'),
(11729, 91, '{\"type\":\"attendance_request\",\"request_id\":22,\"user_id\":35,\"name\":\"Rosario Mabini\",\"submitted_at\":\"2025-11-24 05:15:02\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_35_20251124171502_f37cca48.jpg\"}', '2025-11-24 05:15:02', 'unread'),
(11730, 91, '{\"type\":\"attendance_request\",\"request_id\":23,\"user_id\":31,\"name\":\"Michael Abres\",\"submitted_at\":\"2025-11-24 05:16:44\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_31_20251124171644_01f6d167.jpg\"}', '2025-11-24 05:16:44', 'unread'),
(11731, 91, '{\"type\":\"attendance_request\",\"request_id\":24,\"user_id\":28,\"name\":\"Alvin Monida\",\"submitted_at\":\"2025-11-24 05:18:46\",\"remarks\":null,\"schedule_id\":null,\"photo_path\":\"uploads\\/attendance\\/attendance_28_20251124171846_9c9a047e.jpg\"}', '2025-11-24 05:18:46', 'unread'),
(11732, 16, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-24\",\"assignments\":[{\"team_id\":1320,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1321,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1322,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1323,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1324,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1325,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-24 05:32:14', 'unread'),
(11733, 30, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-24\",\"assignments\":[{\"team_id\":1320,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1321,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1322,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1323,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1324,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1325,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-24 05:32:14', 'unread'),
(11734, 35, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-24\",\"assignments\":[{\"team_id\":1320,\"barangay\":\"Impig\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"08:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1321,\"barangay\":\"Tara\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"10:00:00\",\"type\":\"fixed_days\",\"truck\":\"ABC-1234\"},{\"team_id\":1322,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"06:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1323,\"barangay\":\"North Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"10:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1324,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"07:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"},{\"team_id\":1325,\"barangay\":\"South Centro\",\"cluster\":\"1C-PB\",\"date\":\"2025-11-24\",\"time\":\"11:00:00\",\"type\":\"daily_priority\",\"truck\":\"ABC-1234\"}]}', '2025-11-24 05:32:14', 'unread'),
(11735, 17, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-24\",\"assignments\":[{\"team_id\":1326,\"barangay\":\"Mantila\",\"cluster\":\"5C-CD\",\"date\":\"2025-11-24\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-24 05:32:14', 'unread'),
(11736, 31, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-24\",\"assignments\":[{\"team_id\":1326,\"barangay\":\"Mantila\",\"cluster\":\"5C-CD\",\"date\":\"2025-11-24\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-24 05:32:14', 'unread'),
(11737, 28, '{\"type\":\"daily_assignments\",\"date\":\"2025-11-24\",\"assignments\":[{\"team_id\":1326,\"barangay\":\"Mantila\",\"cluster\":\"5C-CD\",\"date\":\"2025-11-24\",\"time\":\"09:00:00\",\"type\":\"weekly_cluster\",\"truck\":\"XYZ-5678\"}]}', '2025-11-24 05:32:14', 'unread'),
(11738, 91, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Flat Tire reported. Expect delays while the team resolves the issue. Details: Wala\",\"route_id\":685,\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Flat Tire\",\"notes\":\"Wala\",\"delay_minutes\":null,\"reported_at\":\"2025-11-24T22:42:28+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":1}', '2025-11-24 10:42:28', 'unread'),
(11739, 91, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Flat Tire reported. Expect delays while the team resolves the issue. Details: Wala\",\"route_id\":685,\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Flat Tire\",\"notes\":\"Wala\",\"delay_minutes\":null,\"reported_at\":\"2025-11-24T22:42:53+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":2}', '2025-11-24 10:42:53', 'unread'),
(11740, 91, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Medical Emergency reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Medical Emergency\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-24T23:18:50+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":3}', '2025-11-24 11:18:50', 'unread'),
(11741, 91, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Flat Tire reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":null,\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Flat Tire\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-24T23:38:40+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":4,\"affected_barangays\":[\"31-NRTHC\"]}', '2025-11-24 11:38:40', 'unread'),
(11742, 91, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Accident reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":null,\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Accident\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-24T23:44:02+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":5,\"affected_barangays\":[\"31-NRTHC\"]}', '2025-11-24 11:44:02', 'unread'),
(11743, 91, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Medical Emergency reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":null,\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Medical Emergency\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-24T23:57:54+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":6,\"affected_barangays\":[\"31-NRTHC\"]}', '2025-11-24 11:57:54', 'unread'),
(11744, 70, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11745, 75, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11746, 79, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11747, 88, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11748, 89, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11749, 60, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11750, 10, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11751, 91, '{\"type\":\"route_emergency\",\"title\":\"Collection delayed\",\"message\":\"North Centro route: Severe Weather reported. Expect delays while the team resolves the issue.\",\"route_id\":685,\"route_date\":\"2025-11-24\",\"barangay_id\":\"31-NRTHC\",\"barangay_name\":\"North Centro\",\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"delay_minutes\":null,\"reported_at\":\"2025-11-25T00:02:03+01:00\",\"reported_by\":16,\"reported_name\":\"Paul Ezra Bermal\",\"attachment\":null,\"log_id\":7,\"affected_barangays\":[\"31-NRTHC\",\"20-IMPG\",\"39-STHCN\",\"42-TR\"]}', '2025-11-24 12:02:03', 'unread'),
(11752, 16, '{\"type\":\"truck_full_request\",\"title\":\"Truck capacity reached\",\"message\":\"Collectors reported the truck is full. Please coordinate landfill trip.\",\"route_id\":683,\"team_id\":1320,\"note\":\"Collector reported truck capacity reached\",\"collector_id\":30,\"collector_name\":\"Joseph\",\"barangay_id\":\"20-IMPG\",\"barangay_name\":\"Impig\",\"timestamp\":\"2025-11-25T02:02:34+01:00\"}', '2025-11-24 14:02:34', 'unread');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `reset_code` varchar(6) NOT NULL,
  `expiry_time` datetime NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `email`, `reset_code`, `expiry_time`, `verified`, `used`, `created_at`) VALUES
(1, 'ianjayanonuevo26@gmail.com', '803272', '2025-10-07 23:39:41', 1, 1, '2025-10-07 15:09:41'),
(6, 'carljames@gmail.com', '710752', '2025-09-01 20:34:36', 1, 1, '2025-09-01 12:19:36'),
(11, 'cssndrjoyce.04@gmail.com', '965038', '2025-09-01 21:16:55', 1, 1, '2025-09-01 13:01:55'),
(13, 'emeir.amado@cbsua.edu.ph', '798071', '2025-10-01 01:30:25', 1, 1, '2025-09-30 17:15:25'),
(14, 'reimeamado@gmail.com', '110767', '2025-10-07 23:48:13', 1, 1, '2025-10-07 15:18:13'),
(15, 'njy.nnv@gmail.com', '755128', '2025-10-07 23:57:04', 1, 1, '2025-10-07 15:27:04'),
(24, 'ianjay.anonuevo@cbsua.edu.ph', '861457', '2025-10-03 23:47:27', 1, 1, '2025-10-03 15:32:27'),
(27, 'kolektrash@gmail.com', '382855', '2025-10-04 08:40:52', 1, 1, '2025-10-04 00:25:52'),
(35, 'emeiramado2004@gmail.com', '724539', '2025-10-07 22:48:39', 1, 1, '2025-10-07 14:33:39'),
(44, 'nikopalenquez01@gmail.com', '157058', '2025-10-08 08:02:22', 1, 1, '2025-10-07 23:32:22');

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `permission_id` int(11) NOT NULL,
  `permission_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pickup_requests`
--

CREATE TABLE `pickup_requests` (
  `id` int(11) NOT NULL,
  `requester_id` int(11) NOT NULL,
  `requester_name` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `pickup_date` date NOT NULL,
  `waste_type` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','scheduled','completed','declined') DEFAULT 'pending',
  `scheduled_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `declined_reason` text DEFAULT NULL,
  `admin_remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `processed_by` int(11) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `location_lat` decimal(10,8) DEFAULT NULL,
  `location_lng` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pickup_requests`
--

INSERT INTO `pickup_requests` (`id`, `requester_id`, `requester_name`, `barangay`, `contact_number`, `pickup_date`, `waste_type`, `notes`, `status`, `scheduled_date`, `completed_date`, `declined_reason`, `admin_remarks`, `created_at`, `updated_at`, `processed_by`, `priority`, `location_lat`, `location_lng`) VALUES
(1, 10, 'Daniela Corral', 'North Centro', '09706683456', '2025-09-27', 'Bulky', 'wala', 'scheduled', NULL, NULL, NULL, 'Request scheduled by admin', '2025-09-27 15:12:53', '2025-09-27 16:53:54', NULL, 'medium', NULL, NULL),
(2, 10, 'Daniela Corral', 'South Centro', '09782039324', '2025-10-03', 'asda', '', 'pending', NULL, NULL, NULL, NULL, '2025-10-03 04:36:54', '2025-10-03 04:36:54', NULL, 'medium', NULL, NULL),
(3, 10, 'Daniela Corral', 'South Centro', '09567678890', '2025-10-05', 'vbv', 'vcccvbvvvc', 'pending', NULL, NULL, NULL, NULL, '2025-10-05 19:41:05', '2025-10-05 19:41:05', NULL, 'medium', NULL, NULL),
(4, 10, 'Daniela Corral', 'South Centro', '09782039324', '2025-10-06', 'asda', '', 'pending', NULL, NULL, NULL, NULL, '2025-10-06 11:48:09', '2025-10-06 11:48:09', NULL, 'medium', NULL, NULL),
(5, 10, 'Daniela Corral', 'South Centro', '09782039324', '2025-10-30', 'asda', 'qsqsqsq', 'pending', NULL, NULL, NULL, NULL, '2025-10-06 12:19:22', '2025-10-06 12:19:22', NULL, 'medium', NULL, NULL),
(6, 10, 'Daniela Corral', 'South Centro', '09782039324', '2025-10-30', 'Laboy', '', 'pending', NULL, NULL, NULL, NULL, '2025-10-06 16:31:49', '2025-10-06 16:31:49', NULL, 'medium', NULL, NULL),
(7, 10, 'Ian Jay Anonuevo', 'South Centro', '09782039324', '2025-10-07', 'Pa baby', '', 'scheduled', NULL, NULL, NULL, 'Request scheduled by admin', '2025-10-07 08:54:42', '2025-10-07 08:55:36', NULL, 'medium', NULL, NULL),
(8, 10, 'Ian Jay Anonuevo', 'South Centro', '09782039324', '2025-10-07', 'Philip James', '', 'pending', NULL, NULL, NULL, NULL, '2025-10-07 13:34:43', '2025-10-07 13:34:43', NULL, 'medium', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `predefined_schedules`
--

CREATE TABLE `predefined_schedules` (
  `schedule_template_id` int(11) NOT NULL,
  `barangay_id` varchar(50) NOT NULL,
  `barangay_name` varchar(100) NOT NULL,
  `cluster_id` varchar(50) NOT NULL,
  `schedule_type` enum('daily_priority','fixed_days','weekly_cluster') NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `session` enum('AM','PM') NOT NULL DEFAULT 'AM',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `frequency_per_day` int(11) DEFAULT 1,
  `week_of_month` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `predefined_schedules`
--

INSERT INTO `predefined_schedules` (`schedule_template_id`, `barangay_id`, `barangay_name`, `cluster_id`, `schedule_type`, `day_of_week`, `session`, `start_time`, `end_time`, `frequency_per_day`, `week_of_month`, `is_active`, `created_at`, `updated_at`) VALUES
(11, '20-IMPG', 'Impig', '1C-PB', 'fixed_days', 'Monday', 'AM', '08:00:00', '10:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(12, '20-IMPG', 'Impig', '1C-PB', 'fixed_days', 'Wednesday', 'AM', '08:00:00', '10:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(13, '20-IMPG', 'Impig', '1C-PB', 'fixed_days', 'Friday', 'AM', '09:00:00', '10:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-10-07 12:32:56'),
(14, '25-MLBG', 'Malubago', '1C-PB', 'fixed_days', 'Tuesday', 'AM', '08:00:00', '10:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(15, '25-MLBG', 'Malubago', '1C-PB', 'fixed_days', 'Friday', 'AM', '08:00:00', '10:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(16, '42-TR', 'Tara', '1C-PB', 'fixed_days', 'Monday', 'AM', '10:00:00', '12:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(17, '42-TR', 'Tara', '1C-PB', 'fixed_days', 'Wednesday', 'AM', '10:00:00', '12:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(18, '42-TR', 'Tara', '1C-PB', 'fixed_days', 'Friday', 'AM', '10:00:00', '12:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(19, '19-GNGN', 'Gaongan', '1C-PB', 'fixed_days', 'Thursday', 'AM', '08:00:00', '11:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-09-10 03:35:54'),
(20, '05-AZCN', 'Azucena', '1C-PB', 'fixed_days', 'Friday', 'PM', '13:00:00', '15:00:00', 1, NULL, 1, '2025-09-10 03:35:54', '2025-11-21 16:32:12'),
(59, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Monday', 'AM', '06:00:00', '07:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(60, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Monday', 'AM', '10:00:00', '11:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(61, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Monday', 'PM', '13:00:00', '14:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(62, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Monday', 'PM', '16:00:00', '17:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(63, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Tuesday', 'AM', '06:00:00', '07:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(64, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Tuesday', 'AM', '10:00:00', '11:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(65, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Tuesday', 'PM', '13:00:00', '14:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(66, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Tuesday', 'PM', '16:00:00', '17:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(67, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Wednesday', 'AM', '06:00:00', '07:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(68, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Wednesday', 'AM', '10:00:00', '11:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(69, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Wednesday', 'PM', '13:00:00', '14:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(70, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Wednesday', 'PM', '16:00:00', '17:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(71, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Thursday', 'AM', '06:00:00', '07:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(72, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Thursday', 'AM', '10:00:00', '11:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(73, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Thursday', 'PM', '13:00:00', '14:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(74, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Thursday', 'PM', '16:00:00', '17:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(75, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Friday', 'AM', '06:00:00', '07:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(76, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Friday', 'AM', '10:00:00', '11:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(77, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Friday', 'PM', '13:00:00', '14:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(78, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Friday', 'PM', '16:00:00', '17:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(79, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Monday', 'AM', '07:00:00', '08:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(80, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Monday', 'AM', '11:00:00', '12:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(81, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Monday', 'PM', '14:00:00', '15:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(82, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Monday', 'PM', '17:00:00', '18:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(83, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Tuesday', 'AM', '07:00:00', '08:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(84, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Tuesday', 'AM', '11:00:00', '12:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(85, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Tuesday', 'PM', '14:00:00', '15:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(86, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Tuesday', 'PM', '17:00:00', '18:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(87, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Wednesday', 'AM', '07:00:00', '08:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(88, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Wednesday', 'AM', '11:00:00', '12:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(89, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Wednesday', 'PM', '14:00:00', '15:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(90, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Wednesday', 'PM', '17:00:00', '18:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(91, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Thursday', 'AM', '07:00:00', '08:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(92, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Thursday', 'AM', '11:00:00', '12:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(93, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Thursday', 'PM', '14:00:00', '15:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(94, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Thursday', 'PM', '17:00:00', '18:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(95, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Friday', 'AM', '07:00:00', '08:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(96, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Friday', 'AM', '11:00:00', '12:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-09-10 04:06:35'),
(97, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Friday', 'PM', '14:00:00', '15:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(98, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Friday', 'PM', '17:00:00', '18:00:00', 4, NULL, 1, '2025-09-10 04:06:35', '2025-11-21 16:32:12'),
(260, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Saturday', 'AM', '06:00:00', '07:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(261, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Saturday', 'AM', '10:00:00', '11:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(262, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Saturday', 'PM', '13:00:00', '14:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(263, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Saturday', 'PM', '16:00:00', '17:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(264, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Sunday', 'AM', '06:00:00', '07:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(265, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Sunday', 'AM', '10:00:00', '11:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(266, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Sunday', 'PM', '13:00:00', '14:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(267, '31-NRTHC', 'North Centro', '1C-PB', 'daily_priority', 'Sunday', 'PM', '16:00:00', '17:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(268, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Saturday', 'AM', '07:00:00', '08:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(269, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Saturday', 'AM', '11:00:00', '12:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(270, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Saturday', 'PM', '14:00:00', '15:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(271, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Saturday', 'PM', '17:00:00', '18:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(272, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Sunday', 'AM', '07:00:00', '08:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(273, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Sunday', 'AM', '11:00:00', '12:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-19 09:55:55'),
(274, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Sunday', 'PM', '14:00:00', '15:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(275, '39-STHCN', 'South Centro', '1C-PB', 'daily_priority', 'Sunday', 'PM', '17:00:00', '18:00:00', 4, NULL, 1, '2025-11-19 09:55:55', '2025-11-21 16:32:12'),
(284, '33-SGRDF', 'Sagrada Familia', '2C-CA', 'weekly_cluster', 'Monday', 'AM', '09:00:00', '10:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(285, '12-CBY', 'Cabuyao', '2C-CA', 'weekly_cluster', 'Tuesday', 'AM', '09:00:00', '10:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(286, '10-BLN', 'Bulan', '2C-CA', 'weekly_cluster', 'Wednesday', 'AM', '09:00:00', '10:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(287, '45-VGN', 'Vigaan', '2C-CA', 'weekly_cluster', 'Thursday', 'AM', '09:00:00', '10:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(288, '44-TLTL', 'Tula-tula', '2C-CA', 'weekly_cluster', 'Friday', 'AM', '09:00:00', '10:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(289, '35-SLVCN', 'Salvacion', '2C-CA', 'weekly_cluster', 'Saturday', 'AM', '09:00:00', '10:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(290, '01-ALDZR', 'Aldezar', '2C-CA', 'weekly_cluster', 'Sunday', 'AM', '09:00:00', '10:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(291, '38-SRRNZ', 'Serranzana', '2C-CA', 'weekly_cluster', 'Sunday', 'AM', '10:00:00', '11:00:00', 1, 1, 1, '2025-11-19 10:05:07', '2025-11-19 10:05:07'),
(292, '07-BNHN', 'Binahian', '3C-CB', 'weekly_cluster', 'Monday', 'AM', '09:00:00', '10:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(293, '13-CM', 'Caima', '3C-CB', 'weekly_cluster', 'Tuesday', 'AM', '09:00:00', '10:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(294, '06-BGNGS', 'Bagong Sirang', '3C-CB', 'weekly_cluster', 'Wednesday', 'AM', '09:00:00', '10:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(295, '16-CRYRY', 'Carayrayan', '3C-CB', 'weekly_cluster', 'Thursday', 'AM', '09:00:00', '10:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(296, '21-LPLP', 'Lipilip', '3C-CB', 'weekly_cluster', 'Friday', 'AM', '09:00:00', '10:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(297, '23-LBGNS', 'Lubigan Sr.', '3C-CB', 'weekly_cluster', 'Saturday', 'AM', '09:00:00', '10:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(298, '22-LBGNJ', 'Lubigan Jr.', '3C-CB', 'weekly_cluster', 'Saturday', 'AM', '10:00:00', '11:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(299, '26-MNNGL', 'Manangle', '3C-CB', 'weekly_cluster', 'Sunday', 'AM', '09:00:00', '10:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(300, '18-GB', 'Gabi', '3C-CB', 'weekly_cluster', 'Sunday', 'AM', '10:00:00', '11:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(301, '29-MNLBN', 'Manlubang', '3C-CB', 'weekly_cluster', 'Sunday', 'AM', '11:00:00', '12:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-19 10:06:13'),
(302, '11-BLWN', 'Bulawan', '3C-CB', 'weekly_cluster', 'Sunday', 'PM', '13:00:00', '14:00:00', 1, 2, 1, '2025-11-19 10:06:13', '2025-11-21 16:32:12'),
(303, '43-TBL', 'Tible', '4C-CC', 'weekly_cluster', 'Monday', 'AM', '09:00:00', '10:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(304, '32-NRTHV', 'North Villazar', '4C-CC', 'weekly_cluster', 'Tuesday', 'AM', '09:00:00', '10:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(305, '14-CLGBN', 'Calagbangan', '4C-CC', 'weekly_cluster', 'Wednesday', 'AM', '09:00:00', '10:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(306, '08-BLNRT', 'Bolo Norte', '4C-CC', 'weekly_cluster', 'Thursday', 'AM', '09:00:00', '10:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(307, '46-YB', 'Yabo', '4C-CC', 'weekly_cluster', 'Friday', 'AM', '09:00:00', '10:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(308, '34-SLND', 'Salanda', '4C-CC', 'weekly_cluster', 'Saturday', 'AM', '09:00:00', '10:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(309, '09-BLSR', 'Bolo Sur', '4C-CC', 'weekly_cluster', 'Sunday', 'AM', '09:00:00', '10:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(310, '02-ALTZ', 'Alteza', '4C-CC', 'weekly_cluster', 'Sunday', 'AM', '10:00:00', '11:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(311, '40-STHVL', 'South Villazar', '4C-CC', 'weekly_cluster', 'Sunday', 'AM', '11:00:00', '12:00:00', 1, 3, 1, '2025-11-19 10:06:58', '2025-11-19 10:06:58'),
(312, '30-MNTL', 'Mantila', '5C-CD', 'weekly_cluster', 'Monday', 'AM', '09:00:00', '10:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(313, '36-SNSDR', 'San Isidro', '5C-CD', 'weekly_cluster', 'Tuesday', 'AM', '09:00:00', '10:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(314, '27-MNGP', 'Mangapo', '5C-CD', 'weekly_cluster', 'Wednesday', 'AM', '09:00:00', '10:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(315, '04-AWYN', 'Awayan', '5C-CD', 'weekly_cluster', 'Thursday', 'AM', '09:00:00', '10:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(316, '28-MNGG', 'Mangga', '5C-CD', 'weekly_cluster', 'Friday', 'AM', '09:00:00', '10:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(317, '15-CLMPN', 'Calampinay', '5C-CD', 'weekly_cluster', 'Saturday', 'AM', '09:00:00', '10:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(318, '17-CTM', 'Cotmo', '5C-CD', 'weekly_cluster', 'Saturday', 'AM', '10:00:00', '11:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(319, '03-ANB', 'Anib', '5C-CD', 'weekly_cluster', 'Sunday', 'AM', '09:00:00', '10:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(320, '37-SNVCN', 'San Vicente', '5C-CD', 'weekly_cluster', 'Sunday', 'AM', '10:00:00', '11:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(321, '24-MLGC', 'Malaguico', '5C-CD', 'weekly_cluster', 'Sunday', 'AM', '11:00:00', '12:00:00', 1, 4, 1, '2025-11-19 10:07:44', '2025-11-19 10:07:44'),
(322, '05-AZCN', 'Azucena', '1C-PB', 'daily_priority', 'Saturday', 'AM', '08:00:00', '09:00:00', 1, NULL, 0, '2025-11-24 00:34:17', '2025-11-24 00:35:07');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(2, 'barangay_head'),
(3, 'truck_driver'),
(4, 'garbage_collector'),
(5, 'resident'),
(6, 'support'),
(7, 'foreman');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `route_emergency_log`
--

CREATE TABLE `route_emergency_log` (
  `id` int(11) NOT NULL,
  `route_id` bigint(20) UNSIGNED NOT NULL,
  `reported_by` int(11) DEFAULT NULL,
  `emergency_type` varchar(50) NOT NULL,
  `impact` enum('delay','cancel') NOT NULL DEFAULT 'delay',
  `notes` text DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `delay_minutes` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `route_emergency_log`
--

INSERT INTO `route_emergency_log` (`id`, `route_id`, `reported_by`, `emergency_type`, `impact`, `notes`, `attachment_path`, `delay_minutes`, `created_at`, `resolved_at`, `resolved_by`) VALUES
(1, 685, 16, 'Flat Tire', 'delay', 'Wala', NULL, NULL, '2025-11-24 21:42:28', NULL, NULL),
(2, 685, 16, 'Flat Tire', 'delay', 'Wala', NULL, NULL, '2025-11-24 21:42:53', NULL, NULL),
(3, 685, 16, 'Medical Emergency', 'delay', NULL, NULL, NULL, '2025-11-24 22:18:50', NULL, NULL),
(4, 685, 16, 'Flat Tire', 'delay', NULL, NULL, NULL, '2025-11-24 22:38:40', NULL, NULL),
(5, 685, 16, 'Accident', 'delay', NULL, NULL, NULL, '2025-11-24 22:44:02', NULL, NULL),
(6, 685, 16, 'Medical Emergency', 'delay', NULL, NULL, NULL, '2025-11-24 22:57:54', NULL, NULL),
(7, 685, 16, 'Severe Weather', 'delay', NULL, NULL, NULL, '2025-11-24 23:02:03', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `route_generation_run`
--

CREATE TABLE `route_generation_run` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('pending','success','partial','failed') NOT NULL,
  `policy` enum('preserve_manual','overwrite_generated') NOT NULL DEFAULT 'preserve_manual',
  `scope` enum('all','cluster','route') NOT NULL DEFAULT 'all',
  `scope_id` varchar(50) DEFAULT NULL,
  `diff_hash` char(64) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `route_generation_run`
--

INSERT INTO `route_generation_run` (`id`, `date`, `status`, `policy`, `scope`, `scope_id`, `diff_hash`, `summary`, `created_at`) VALUES
(61, '2025-09-16', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 11 stops', '2025-09-16 12:56:33'),
(62, '2025-09-17', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 12 routes, 12 stops', '2025-09-16 12:59:39'),
(63, '2025-09-18', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 1 routes, 1 stops', '2025-09-16 18:14:12'),
(64, '2025-09-24', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 18 routes, 18 stops', '2025-09-24 00:14:14'),
(65, '2025-09-25', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 11 stops', '2025-09-24 00:16:09'),
(66, '2025-09-23', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 18 routes, 42 stops', '2025-09-24 01:24:46'),
(67, '2025-09-25', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-09-24 01:32:59'),
(68, '2025-10-03', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 13 routes, 37 stops', '2025-10-01 16:05:53'),
(69, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-10-05 16:22:54'),
(70, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-10-05 16:23:38'),
(71, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 10 routes, 34 stops', '2025-10-05 16:49:50'),
(72, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 10 routes, 34 stops', '2025-10-05 16:49:51'),
(73, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 10 routes, 34 stops', '2025-10-05 16:49:51'),
(74, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 10 routes, 34 stops', '2025-10-05 16:49:52'),
(75, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 10 routes, 34 stops', '2025-10-05 16:49:52'),
(76, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 10 routes, 34 stops', '2025-10-05 16:49:58'),
(77, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 17 routes, 41 stops', '2025-10-05 17:40:59'),
(78, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 17 routes, 41 stops', '2025-10-05 18:27:46'),
(79, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 10 routes, 34 stops', '2025-10-06 02:41:18'),
(80, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-10-06 02:51:57'),
(81, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-10-06 03:37:03'),
(82, '2025-10-07', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-10-06 03:50:25'),
(83, '2025-10-08', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 12 routes, 36 stops', '2025-10-06 16:08:14'),
(84, '2025-10-09', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-10-07 17:30:09'),
(85, '2025-10-08', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 18 routes, 42 stops', '2025-10-07 23:50:48'),
(86, '2025-10-08', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 12 routes, 36 stops', '2025-10-08 00:17:53'),
(87, '2025-10-10', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 13 routes, 37 stops', '2025-10-09 01:49:04'),
(88, '2025-10-13', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 13 routes, 37 stops', '2025-10-12 01:49:03'),
(89, '2025-10-14', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 12 routes, 36 stops', '2025-10-13 01:49:03'),
(90, '2025-10-15', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 12 routes, 36 stops', '2025-10-14 01:49:03'),
(91, '2025-10-16', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 11 routes, 35 stops', '2025-10-15 01:49:03'),
(92, '2025-10-17', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 13 routes, 37 stops', '2025-10-16 01:49:04'),
(93, '2025-11-21', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 16 routes, 40 stops', '2025-11-22 05:24:45'),
(94, '2025-11-21', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 16 routes, 40 stops', '2025-11-23 14:19:17'),
(95, '2025-11-24', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 14 routes, 38 stops', '2025-11-24 05:37:37'),
(96, '2025-11-24', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 14 routes, 38 stops', '2025-11-24 05:47:08'),
(97, '2025-11-24', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 7 routes, 19 stops', '2025-11-24 05:48:12'),
(98, '2025-11-24', 'success', 'preserve_manual', 'all', NULL, NULL, 'Generated 7 routes, 19 stops', '2025-11-24 05:52:42');

-- --------------------------------------------------------

--
-- Table structure for table `task_events`
--

CREATE TABLE `task_events` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `event_type` varchar(64) NOT NULL,
  `before_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before_json`)),
  `after_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_events`
--

INSERT INTO `task_events` (`id`, `assignment_id`, `user_id`, `event_type`, `before_json`, `after_json`, `created_at`) VALUES
(1, 750, NULL, 'stop_status_updated', NULL, '{\"stop_id\":4,\"status\":\"visited\"}', '2025-09-11 17:15:26'),
(2, 750, NULL, 'stop_status_updated', NULL, '{\"stop_id\":15,\"status\":\"visited\"}', '2025-09-11 17:15:36'),
(3, 750, NULL, 'stop_status_updated', NULL, '{\"stop_id\":37,\"status\":\"visited\"}', '2025-09-11 17:23:11'),
(4, 798, NULL, 'stop_status_updated', NULL, '{\"stop_id\":139,\"status\":\"visited\"}', '2025-09-16 04:51:33'),
(5, 802, NULL, 'stop_status_updated', NULL, '{\"stop_id\":143,\"status\":\"visited\"}', '2025-09-16 04:51:49'),
(6, 795, NULL, 'stop_status_updated', NULL, '{\"stop_id\":136,\"status\":\"visited\"}', '2025-09-16 04:51:53'),
(7, 798, NULL, 'stop_status_updated', NULL, '{\"stop_id\":150,\"status\":\"visited\"}', '2025-09-16 04:54:17'),
(8, 814, NULL, 'stop_status_updated', NULL, '{\"stop_id\":254,\"status\":\"visited\"}', '2025-09-17 14:52:43'),
(9, 806, NULL, 'stop_status_updated', NULL, '{\"stop_id\":246,\"status\":\"visited\"}', '2025-09-17 14:59:16'),
(10, 809, NULL, 'stop_status_updated', NULL, '{\"stop_id\":249,\"status\":\"visited\"}', '2025-09-17 15:04:28'),
(11, 884, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":280,\"status\":\"in_progress\",\"note\":\"\"}', '2025-09-23 16:17:03'),
(12, 884, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":280,\"status\":\"in_progress\",\"note\":\"\"}', '2025-09-23 16:17:15'),
(13, 884, '16', 'truck_full', NULL, '{\"route_id\":280,\"note\":\"\"}', '2025-09-23 16:17:15'),
(14, 884, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":280,\"status\":\"pending\",\"note\":\"\"}', '2025-09-23 16:40:37'),
(15, 884, '16', 'truck_full', NULL, '{\"route_id\":280,\"note\":\"\"}', '2025-09-23 16:40:37'),
(16, 884, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":280,\"status\":\"pending\",\"note\":\"\"}', '2025-09-23 16:42:04'),
(17, 884, '16', 'truck_full', NULL, '{\"route_id\":280,\"note\":\"\"}', '2025-09-23 16:42:04'),
(18, 884, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":280,\"status\":\"pending\",\"note\":\"\"}', '2025-09-23 16:43:59'),
(19, 884, '16', 'truck_full', NULL, '{\"route_id\":280,\"note\":\"\"}', '2025-09-23 16:43:59'),
(20, 884, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":280,\"status\":\"completed\",\"note\":\"\"}', '2025-09-23 16:44:35'),
(21, 884, '16', 'truck_full', NULL, '{\"route_id\":280,\"note\":\"\"}', '2025-09-23 16:44:35'),
(22, 884, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":280,\"status\":\"completed\",\"note\":\"\"}', '2025-09-23 16:57:30'),
(23, 884, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":280,\"status\":\"in_progress\",\"note\":\"\"}', '2025-09-23 17:01:18'),
(24, 884, NULL, 'stop_status_updated', NULL, '{\"stop_id\":280,\"status\":\"visited\"}', '2025-09-23 17:05:10'),
(25, 881, NULL, 'stop_status_updated', NULL, '{\"stop_id\":277,\"status\":\"visited\"}', '2025-09-23 17:06:05'),
(26, 891, NULL, 'update_status', '{\"status\":\"pending\"}', '{\"status\":\"accepted\"}', '2025-09-25 05:41:25'),
(27, 891, NULL, 'update_status', '{\"status\":\"accepted\"}', '{\"status\":\"assigned\"}', '2025-09-25 05:41:26'),
(28, 884, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":309,\"status\":\"pending\",\"note\":\"\"}', '2025-09-25 13:03:05'),
(29, 884, '16', 'truck_full', NULL, '{\"route_id\":309,\"note\":\"\"}', '2025-09-25 13:03:05'),
(30, 881, '61', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":306,\"status\":\"pending\",\"note\":\"\"}', '2025-09-25 13:24:23'),
(31, 881, '61', 'truck_full', NULL, '{\"route_id\":306,\"note\":\"\"}', '2025-09-25 13:24:23'),
(32, 884, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":309,\"status\":\"pending\",\"note\":\"\"}', '2025-09-25 14:06:05'),
(33, 884, '16', 'truck_full', NULL, '{\"route_id\":309,\"note\":\"\"}', '2025-09-25 14:06:05'),
(34, 884, '60', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":309,\"status\":\"pending\",\"note\":\"\"}', '2025-09-25 14:07:35'),
(35, 884, '60', 'truck_full', NULL, '{\"route_id\":309,\"note\":\"\"}', '2025-09-25 14:07:35'),
(36, 884, '60', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":309,\"status\":\"pending\",\"note\":\"\"}', '2025-09-25 14:08:14'),
(37, 884, '60', 'truck_full', NULL, '{\"route_id\":309,\"note\":\"\"}', '2025-09-25 14:08:14'),
(38, 884, '60', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":309,\"status\":\"pending\",\"note\":\"\"}', '2025-09-25 15:05:10'),
(39, 884, '60', 'truck_full', NULL, '{\"route_id\":309,\"note\":\"\"}', '2025-09-25 15:05:10'),
(40, 884, NULL, 'stop_status_updated', NULL, '{\"stop_id\":333,\"status\":\"visited\"}', '2025-09-25 15:15:27'),
(41, 884, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":309,\"status\":\"pending\",\"note\":\"\"}', '2025-09-27 11:15:40'),
(42, 884, '16', 'truck_full', NULL, '{\"route_id\":309,\"note\":\"\"}', '2025-09-27 11:15:40'),
(43, 885, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":310,\"status\":\"pending\",\"note\":\"\"}', '2025-09-27 11:18:36'),
(44, 885, '16', 'truck_full', NULL, '{\"route_id\":310,\"note\":\"\"}', '2025-09-27 11:18:36'),
(45, 885, '10', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":310,\"status\":\"pending\",\"note\":\"\"}', '2025-09-27 11:29:29'),
(46, 885, '10', 'truck_full', NULL, '{\"route_id\":310,\"note\":\"\"}', '2025-09-27 11:29:29'),
(47, 885, '60', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":310,\"status\":\"pending\",\"note\":\"\"}', '2025-09-27 11:35:08'),
(48, 885, '60', 'truck_full', NULL, '{\"route_id\":310,\"note\":\"\"}', '2025-09-27 11:35:08'),
(49, 885, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":310,\"status\":\"pending\",\"note\":\"\"}', '2025-09-27 12:36:33'),
(50, 885, '16', 'truck_full', NULL, '{\"route_id\":310,\"note\":\"\"}', '2025-09-27 12:36:33'),
(51, 885, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":310,\"status\":\"pending\",\"note\":\"\"}', '2025-09-27 12:45:17'),
(52, 885, '16', 'truck_full', NULL, '{\"route_id\":310,\"note\":\"\"}', '2025-09-27 12:45:17'),
(53, 891, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":316,\"status\":\"pending\",\"note\":\"\"}', '2025-10-01 16:53:56'),
(54, 891, '16', 'truck_full', NULL, '{\"route_id\":316,\"note\":\"\"}', '2025-10-01 16:53:56'),
(55, 891, NULL, 'stop_status_updated', NULL, '{\"stop_id\":361,\"status\":\"visited\"}', '2025-10-02 16:03:35'),
(56, 891, NULL, 'stop_status_updated', NULL, '{\"stop_id\":362,\"status\":\"visited\"}', '2025-10-02 16:03:39'),
(57, 891, NULL, 'stop_status_updated', NULL, '{\"stop_id\":363,\"status\":\"visited\"}', '2025-10-02 16:03:43'),
(58, 891, NULL, 'stop_status_updated', NULL, '{\"stop_id\":364,\"status\":\"visited\"}', '2025-10-02 16:03:46'),
(59, 891, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":316,\"status\":\"pending\",\"note\":\"\"}', '2025-10-02 19:23:53'),
(60, 891, '16', 'truck_full', NULL, '{\"route_id\":316,\"note\":\"\"}', '2025-10-02 19:23:53'),
(61, 891, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":316,\"status\":\"pending\",\"note\":\"\"}', '2025-10-03 18:40:51'),
(62, 891, '16', 'truck_full', NULL, '{\"route_id\":316,\"note\":\"\"}', '2025-10-03 18:40:51'),
(63, 891, '16', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":316,\"status\":\"completed\",\"note\":\"\"}', '2025-10-03 18:42:04'),
(64, 991, NULL, 'stop_status_updated', NULL, '{\"stop_id\":366,\"status\":\"visited\"}', '2025-10-03 19:05:17'),
(65, 1084, NULL, 'stop_status_updated', NULL, '{\"stop_id\":865,\"status\":\"visited\"}', '2025-10-06 05:54:44'),
(66, 1084, NULL, 'stop_status_updated', NULL, '{\"stop_id\":866,\"status\":\"visited\"}', '2025-10-06 05:55:59'),
(67, 1084, NULL, 'stop_status_updated', NULL, '{\"stop_id\":867,\"status\":\"visited\"}', '2025-10-06 05:56:05'),
(68, 1084, NULL, 'stop_status_updated', NULL, '{\"stop_id\":868,\"status\":\"visited\"}', '2025-10-06 05:56:07'),
(69, 1096, NULL, 'stop_status_updated', NULL, '{\"stop_id\":901,\"status\":\"visited\"}', '2025-10-06 23:36:40'),
(70, 1096, NULL, 'stop_status_updated', NULL, '{\"stop_id\":902,\"status\":\"visited\"}', '2025-10-06 23:36:43'),
(71, 1096, NULL, 'stop_status_updated', NULL, '{\"stop_id\":903,\"status\":\"visited\"}', '2025-10-06 23:36:45'),
(72, 1096, NULL, 'stop_status_updated', NULL, '{\"stop_id\":904,\"status\":\"visited\"}', '2025-10-06 23:36:47'),
(73, 1094, NULL, 'stop_status_updated', NULL, '{\"stop_id\":899,\"status\":\"visited\"}', '2025-10-07 01:32:40'),
(74, 1094, '17', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":491,\"status\":\"completed\",\"note\":\"\"}', '2025-10-07 01:32:44'),
(75, 1095, '17', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started by driver\"}', '2025-10-07 02:14:35'),
(76, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started by driver\"}', '2025-10-07 02:20:57'),
(77, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:27:03'),
(78, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:27:55'),
(79, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:28:29'),
(80, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:34:23'),
(81, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:36:21'),
(82, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:42:17'),
(83, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:42:55'),
(84, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:47:50'),
(85, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:48:27'),
(86, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:53:02'),
(87, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 04:54:30'),
(88, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 05:02:59'),
(89, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 05:03:33'),
(90, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 05:06:00'),
(91, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Route started for Manangle\"}', '2025-10-07 05:18:12'),
(92, 1094, '17', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":491,\"status\":\"in_progress\",\"note\":\"Route started for Lubigan Jr.\"}', '2025-10-07 11:02:11'),
(93, 1094, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":491,\"status\":\"completed\",\"note\":\"\"}', '2025-10-07 12:44:02'),
(94, 1094, '17', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":491,\"status\":\"completed\",\"note\":\"\"}', '2025-10-07 12:51:17'),
(95, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"pending\",\"note\":\"Driver ended route - returning to pending\"}', '2025-10-07 13:03:12'),
(96, 1095, '17', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Driver started Manangle\"}', '2025-10-07 13:15:22'),
(97, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"pending\",\"note\":\"Driver ended route - returning to pending\"}', '2025-10-07 13:15:46'),
(98, 1095, '17', 'route_status_updated', '{\"status\":\"\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":\"Driver started Manangle\"}', '2025-10-07 13:17:25'),
(99, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 15:01:57'),
(100, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 15:03:06'),
(101, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 15:12:23'),
(102, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 15:19:30'),
(103, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 15:21:47'),
(104, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 15:38:45'),
(105, 1095, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":492,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 15:50:44'),
(106, 1096, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":493,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 16:18:13'),
(107, 1096, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":493,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 17:43:15'),
(108, 1096, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":493,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 18:01:15'),
(109, 1096, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":493,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 18:04:23'),
(110, 1096, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":493,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 18:05:37'),
(111, 1096, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":493,\"status\":\"completed\",\"note\":\"\"}', '2025-10-07 18:05:40'),
(112, 1100, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 18:46:40'),
(113, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 18:54:41'),
(114, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 18:58:59'),
(115, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:00:19'),
(116, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:01:52'),
(117, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:06:57'),
(118, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:11:27'),
(119, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:13:29'),
(120, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:16:03'),
(121, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:16:48'),
(122, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:17:30'),
(123, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:17:49'),
(124, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:20:43'),
(125, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:23:15'),
(126, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:23:46'),
(127, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:37:38'),
(128, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 19:47:35'),
(129, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 20:02:06'),
(130, 1100, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 20:05:56'),
(131, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 20:28:46'),
(132, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 20:29:15'),
(133, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 20:35:06'),
(134, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 20:58:53'),
(135, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:08:04'),
(136, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:09:02'),
(137, 1100, '28', 'stop_status_updated', NULL, '{\"stop_id\":917,\"status\":\"visited\"}', '2025-10-07 21:16:41'),
(138, 1100, '28', 'stop_status_updated', NULL, '{\"stop_id\":918,\"status\":\"visited\"}', '2025-10-07 21:16:52'),
(139, 1100, '28', 'stop_status_updated', NULL, '{\"stop_id\":919,\"status\":\"visited\"}', '2025-10-07 21:17:06'),
(140, 1100, '28', 'stop_status_updated', NULL, '{\"stop_id\":920,\"status\":\"visited\"}', '2025-10-07 21:17:13'),
(141, 1100, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":497,\"status\":\"completed\",\"note\":null}', '2025-10-07 21:17:33'),
(142, 1092, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":489,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:33:31'),
(143, 1092, '28', 'stop_status_updated', NULL, '{\"stop_id\":897,\"status\":\"visited\"}', '2025-10-07 21:33:46'),
(144, 1092, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":489,\"status\":\"completed\",\"note\":null}', '2025-10-07 21:33:57'),
(145, 1093, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":490,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:35:26'),
(146, 1093, '28', 'stop_status_updated', NULL, '{\"stop_id\":898,\"status\":\"visited\"}', '2025-10-07 21:35:54'),
(147, 1093, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":490,\"status\":\"completed\",\"note\":null}', '2025-10-07 21:36:11'),
(148, 1097, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":494,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:36:11'),
(149, 1097, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":494,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:42:04'),
(150, 1097, '28', 'stop_status_updated', NULL, '{\"stop_id\":905,\"status\":\"visited\"}', '2025-10-07 21:43:19'),
(151, 1097, '28', 'stop_status_updated', NULL, '{\"stop_id\":906,\"status\":\"visited\"}', '2025-10-07 21:43:26'),
(152, 1097, '28', 'stop_status_updated', NULL, '{\"stop_id\":907,\"status\":\"visited\"}', '2025-10-07 21:43:40'),
(153, 1097, '28', 'stop_status_updated', NULL, '{\"stop_id\":908,\"status\":\"visited\"}', '2025-10-07 21:43:46'),
(154, 1097, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":494,\"status\":\"completed\",\"note\":null}', '2025-10-07 21:44:10'),
(155, 1101, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":498,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:44:11'),
(156, 1101, '28', 'stop_status_updated', NULL, '{\"stop_id\":921,\"status\":\"visited\"}', '2025-10-07 21:44:36'),
(157, 1101, '28', 'stop_status_updated', NULL, '{\"stop_id\":922,\"status\":\"visited\"}', '2025-10-07 21:44:37'),
(158, 1101, '28', 'stop_status_updated', NULL, '{\"stop_id\":923,\"status\":\"visited\"}', '2025-10-07 21:44:38'),
(159, 1101, '28', 'stop_status_updated', NULL, '{\"stop_id\":924,\"status\":\"visited\"}', '2025-10-07 21:44:39'),
(160, 1101, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":498,\"status\":\"completed\",\"note\":null}', '2025-10-07 21:44:57'),
(161, 1098, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":495,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 21:44:57'),
(162, 1098, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":495,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 22:03:43'),
(163, 1098, '28', 'stop_status_updated', NULL, '{\"stop_id\":909,\"status\":\"visited\"}', '2025-10-07 22:08:26'),
(164, 1098, '28', 'stop_status_updated', NULL, '{\"stop_id\":910,\"status\":\"visited\"}', '2025-10-07 22:08:46'),
(165, 1098, '28', 'stop_status_updated', NULL, '{\"stop_id\":911,\"status\":\"visited\"}', '2025-10-07 22:08:54'),
(166, 1098, '28', 'stop_status_updated', NULL, '{\"stop_id\":912,\"status\":\"visited\"}', '2025-10-07 22:08:55'),
(167, 1098, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":495,\"status\":\"completed\",\"note\":null}', '2025-10-07 22:09:06'),
(168, 1102, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":499,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 22:19:50'),
(169, 1102, '28', 'stop_status_updated', NULL, '{\"stop_id\":925,\"status\":\"visited\"}', '2025-10-07 22:36:51'),
(170, 1102, '28', 'stop_status_updated', NULL, '{\"stop_id\":926,\"status\":\"visited\"}', '2025-10-07 22:36:53'),
(171, 1102, '28', 'stop_status_updated', NULL, '{\"stop_id\":927,\"status\":\"visited\"}', '2025-10-07 22:36:59'),
(172, 1102, '28', 'stop_status_updated', NULL, '{\"stop_id\":928,\"status\":\"visited\"}', '2025-10-07 22:37:00'),
(173, 1102, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":499,\"status\":\"completed\",\"note\":null}', '2025-10-07 22:37:14'),
(174, 1102, NULL, 'route_submitted', NULL, '{\"route_id\":\"499\",\"total_stops\":4,\"visited\":4}', '2025-10-07 22:37:14'),
(175, 1099, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":496,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 22:37:14'),
(176, 1103, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":500,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 23:17:37'),
(177, 1103, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":500,\"status\":\"in_progress\",\"note\":null}', '2025-10-07 23:23:45'),
(178, 1167, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":534,\"status\":\"in_progress\",\"note\":null}', '2025-10-08 00:20:13'),
(179, 1167, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":534,\"status\":\"in_progress\",\"note\":null}', '2025-10-08 00:50:49'),
(180, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":534,\"status\":\"in_progress\",\"note\":null}', '2025-10-08 00:50:52'),
(181, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":534,\"status\":\"in_progress\",\"note\":null}', '2025-10-08 01:31:22'),
(182, 1167, '16', 'stop_status_updated', NULL, '{\"stop_id\":1014,\"status\":\"visited\"}', '2025-10-08 01:31:48'),
(183, 1167, '16', 'stop_status_updated', NULL, '{\"stop_id\":1015,\"status\":\"visited\"}', '2025-10-08 01:31:56'),
(184, 1167, '16', 'stop_status_updated', NULL, '{\"stop_id\":1017,\"status\":\"visited\"}', '2025-10-08 01:31:58'),
(185, 1167, '16', 'stop_status_updated', NULL, '{\"stop_id\":1016,\"status\":\"visited\"}', '2025-10-08 01:32:00'),
(186, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":534,\"status\":\"completed\",\"note\":null}', '2025-10-08 01:32:39'),
(187, 1171, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":538,\"status\":\"in_progress\",\"note\":null}', '2025-10-08 01:32:40'),
(188, 1165, '17', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":532,\"status\":\"in_progress\",\"note\":null}', '2025-10-08 02:04:19'),
(189, 1165, '17', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":532,\"status\":\"in_progress\",\"note\":null}', '2025-10-08 02:05:37'),
(190, 1167, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 19:25:17'),
(191, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 19:29:48'),
(192, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 20:45:57'),
(193, 1167, '30', 'stop_status_updated', NULL, '{\"stop_id\":1268,\"status\":\"visited\"}', '2025-11-22 20:46:21'),
(194, 1167, '30', 'stop_status_updated', NULL, '{\"stop_id\":1269,\"status\":\"visited\"}', '2025-11-22 20:46:47'),
(195, 1167, '30', 'stop_status_updated', NULL, '{\"stop_id\":1270,\"status\":\"visited\"}', '2025-11-22 20:46:48'),
(196, 1167, '30', 'stop_status_updated', NULL, '{\"stop_id\":1271,\"status\":\"visited\"}', '2025-11-22 20:46:48'),
(197, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 20:47:38'),
(198, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 20:50:47'),
(199, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 20:51:16'),
(200, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 20:53:27'),
(201, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"completed\",\"note\":null}', '2025-11-22 20:53:30'),
(202, 1167, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 20:53:45'),
(203, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"completed\",\"note\":null}', '2025-11-22 20:53:47'),
(204, 1167, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":620,\"status\":\"completed\",\"note\":null}', '2025-11-22 20:55:25'),
(205, 1167, '16', 'route_submitted', NULL, '{\"route_id\":\"620\",\"total_stops\":4,\"visited\":4}', '2025-11-22 20:55:25'),
(206, 1167, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":620,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 20:56:11'),
(207, 1167, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":620,\"status\":\"completed\",\"note\":null}', '2025-11-22 20:56:14'),
(208, 1167, '16', 'route_submitted', NULL, '{\"route_id\":\"620\",\"total_stops\":4,\"visited\":4}', '2025-11-22 20:56:14'),
(209, 1167, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":620,\"status\":\"completed\",\"note\":null}', '2025-11-22 20:58:54'),
(210, 1167, '16', 'route_submitted', NULL, '{\"route_id\":\"620\",\"total_stops\":4,\"visited\":4}', '2025-11-22 20:58:54'),
(211, 1167, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":620,\"status\":\"completed\",\"note\":null}', '2025-11-22 20:59:08'),
(212, 1167, '16', 'route_submitted', NULL, '{\"route_id\":\"620\",\"total_stops\":4,\"visited\":4}', '2025-11-22 20:59:08'),
(213, 1167, '16', 'route_status_updated', '{\"status\":\"completed\"}', '{\"route_id\":620,\"status\":\"completed\",\"note\":null}', '2025-11-22 21:01:20'),
(214, 1167, '16', 'route_submitted', NULL, '{\"route_id\":\"620\",\"total_stops\":4,\"visited\":4}', '2025-11-22 21:01:20'),
(215, 1171, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":624,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 21:15:05'),
(216, 1171, '30', 'stop_status_updated', NULL, '{\"stop_id\":1284,\"status\":\"visited\"}', '2025-11-22 21:15:25'),
(217, 1171, '30', 'stop_status_updated', NULL, '{\"stop_id\":1285,\"status\":\"visited\"}', '2025-11-22 21:15:25'),
(218, 1171, '30', 'stop_status_updated', NULL, '{\"stop_id\":1286,\"status\":\"visited\"}', '2025-11-22 21:15:26'),
(219, 1171, '30', 'stop_status_updated', NULL, '{\"stop_id\":1287,\"status\":\"visited\"}', '2025-11-22 21:15:27'),
(220, 1171, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":624,\"status\":\"completed\",\"note\":null}', '2025-11-22 21:15:52'),
(221, 1171, '16', 'route_submitted', NULL, '{\"route_id\":\"624\",\"total_stops\":4,\"visited\":4}', '2025-11-22 21:15:52'),
(222, 1164, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":617,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 21:15:53'),
(223, 1164, '30', 'collector_reported_truck_full', NULL, '{\"route_id\":617,\"driver_id\":16,\"note\":\"Collector reported truck capacity reached\",\"collector_name\":\"Joseph\"}', '2025-11-22 21:22:55'),
(224, 1164, '30', 'collector_reported_truck_full', NULL, '{\"route_id\":617,\"driver_id\":16,\"note\":\"Collector reported truck capacity reached\",\"collector_name\":\"Joseph\"}', '2025-11-22 21:33:40'),
(225, 1164, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":617,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 21:35:06'),
(226, 1164, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":617,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 22:27:56'),
(227, 1164, '30', 'stop_status_updated', NULL, '{\"stop_id\":1304,\"status\":\"visited\"}', '2025-11-22 22:28:33'),
(228, 1164, '30', 'stop_status_updated', NULL, '{\"stop_id\":1265,\"status\":\"visited\"}', '2025-11-22 22:28:35'),
(229, 1164, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":617,\"status\":\"completed\",\"note\":null}', '2025-11-22 22:28:42'),
(230, 1164, '16', 'route_submitted', NULL, '{\"route_id\":\"617\",\"total_stops\":2,\"visited\":2}', '2025-11-22 22:28:42'),
(231, 1176, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":629,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 22:28:42'),
(232, 1163, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":616,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 22:35:06'),
(233, 1163, '30', 'collector_reported_truck_full', NULL, '{\"route_id\":616,\"driver_id\":16,\"note\":\"Collector reported truck capacity reached\",\"collector_name\":\"Joseph\"}', '2025-11-22 22:35:20'),
(234, 1163, '30', 'stop_status_updated', NULL, '{\"stop_id\":1305,\"status\":\"visited\"}', '2025-11-22 22:50:10'),
(235, 1163, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":616,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 23:23:09'),
(236, 1163, '30', 'stop_status_updated', NULL, '{\"stop_id\":1264,\"status\":\"visited\"}', '2025-11-22 23:23:29'),
(237, 1163, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":616,\"status\":\"completed\",\"note\":null}', '2025-11-22 23:23:37'),
(238, 1163, '16', 'route_submitted', NULL, '{\"route_id\":\"616\",\"total_stops\":2,\"visited\":2}', '2025-11-22 23:23:37'),
(239, 1168, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":621,\"status\":\"in_progress\",\"note\":null}', '2025-11-22 23:23:37'),
(240, 1168, '30', 'stop_status_updated', NULL, '{\"stop_id\":1272,\"status\":\"visited\"}', '2025-11-22 23:24:00'),
(241, 1168, '30', 'collector_reported_truck_full', NULL, '{\"route_id\":621,\"driver_id\":16,\"note\":\"Collector reported truck capacity reached\",\"collector_name\":\"Joseph\"}', '2025-11-22 23:24:25'),
(242, 1168, '30', 'stop_status_updated', NULL, '{\"stop_id\":1273,\"status\":\"visited\"}', '2025-11-22 23:30:23'),
(243, 1168, '30', 'collector_reported_truck_full', NULL, '{\"route_id\":621,\"driver_id\":16,\"note\":\"Collector reported truck capacity reached\",\"collector_name\":\"Joseph\"}', '2025-11-22 23:30:41'),
(244, 1168, '30', 'stop_status_updated', NULL, '{\"stop_id\":1274,\"status\":\"visited\"}', '2025-11-22 23:31:10'),
(245, 1168, '30', 'stop_status_updated', NULL, '{\"stop_id\":1275,\"status\":\"visited\"}', '2025-11-22 23:31:30'),
(246, 1164, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":633,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 19:39:01'),
(247, 1326, '17', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":689,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 16:56:13'),
(248, 1322, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 16:58:36'),
(249, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 20:29:26'),
(250, 1322, '30', 'stop_status_updated', NULL, '{\"stop_id\":1443,\"status\":\"visited\"}', '2025-11-24 20:31:31'),
(251, 1322, '30', 'stop_status_updated', NULL, '{\"stop_id\":1444,\"status\":\"visited\"}', '2025-11-24 21:01:45'),
(252, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 21:39:41'),
(253, 1322, '16', 'route_emergency_reported', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"impact\":\"delay\",\"reason\":\"Flat Tire\",\"notes\":\"Wala\",\"attachment\":null}', '2025-11-24 21:42:28'),
(254, 1322, '16', 'route_emergency_reported', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"impact\":\"delay\",\"reason\":\"Flat Tire\",\"notes\":\"Wala\",\"attachment\":null}', '2025-11-24 21:42:53'),
(255, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 22:16:04'),
(256, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 22:16:49'),
(257, 1322, '16', 'route_emergency_reported', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"impact\":\"delay\",\"reason\":\"Medical Emergency\",\"notes\":\"\",\"attachment\":null}', '2025-11-24 22:18:50'),
(258, 1322, '16', 'route_emergency_reported', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"impact\":\"delay\",\"reason\":\"Flat Tire\",\"notes\":\"\",\"attachment\":null}', '2025-11-24 22:38:40'),
(259, 1322, '16', 'route_emergency_reported', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"impact\":\"delay\",\"reason\":\"Accident\",\"notes\":\"\",\"attachment\":null}', '2025-11-24 22:44:02'),
(260, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 22:56:44'),
(261, 1322, '16', 'route_emergency_reported', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"impact\":\"delay\",\"reason\":\"Medical Emergency\",\"notes\":\"\",\"attachment\":null}', '2025-11-24 22:57:54'),
(262, 1322, '16', 'route_emergency_reported', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"impact\":\"delay\",\"reason\":\"Severe Weather\",\"notes\":\"\",\"attachment\":null}', '2025-11-24 23:02:03'),
(263, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-24 23:26:40'),
(264, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-25 00:35:07'),
(265, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-25 00:41:01'),
(266, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-25 00:53:53'),
(267, 1322, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":685,\"status\":\"in_progress\",\"note\":null}', '2025-11-25 00:54:37'),
(268, 1322, '30', 'stop_status_updated', NULL, '{\"stop_id\":1445,\"status\":\"visited\"}', '2025-11-25 00:56:22'),
(269, 1322, '30', 'stop_status_updated', NULL, '{\"stop_id\":1446,\"status\":\"visited\"}', '2025-11-25 00:56:51'),
(270, 1324, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":687,\"status\":\"in_progress\",\"note\":null}', '2025-11-25 00:58:21'),
(271, 1324, '30', 'stop_status_updated', NULL, '{\"stop_id\":1451,\"status\":\"visited\"}', '2025-11-25 01:00:29'),
(272, 1324, '30', 'stop_status_updated', NULL, '{\"stop_id\":1452,\"status\":\"visited\"}', '2025-11-25 01:00:40'),
(273, 1324, '30', 'stop_status_updated', NULL, '{\"stop_id\":1453,\"status\":\"visited\"}', '2025-11-25 01:00:52'),
(274, 1324, '30', 'stop_status_updated', NULL, '{\"stop_id\":1454,\"status\":\"visited\"}', '2025-11-25 01:01:43'),
(275, 1324, '16', 'route_status_updated', '{\"status\":\"in_progress\"}', '{\"route_id\":687,\"status\":\"completed\",\"note\":null}', '2025-11-25 01:02:20'),
(276, 1324, '16', 'route_submitted', NULL, '{\"route_id\":\"687\",\"total_stops\":4,\"visited\":4}', '2025-11-25 01:02:20'),
(277, 1320, '16', 'route_status_updated', '{\"status\":\"scheduled\"}', '{\"route_id\":683,\"status\":\"in_progress\",\"note\":null}', '2025-11-25 01:02:20'),
(278, 1320, '30', 'collector_reported_truck_full', NULL, '{\"route_id\":683,\"driver_id\":16,\"note\":\"Collector reported truck capacity reached\",\"collector_name\":\"Joseph\"}', '2025-11-25 01:02:34');

-- --------------------------------------------------------

--
-- Table structure for table `truck`
--

CREATE TABLE `truck` (
  `truck_id` int(11) NOT NULL,
  `plate_num` varchar(20) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `truck_type` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `truck`
--

INSERT INTO `truck` (`truck_id`, `plate_num`, `capacity`, `truck_type`, `status`) VALUES
(1, 'ABC-1234', 5000, 'Dump Truck', 'Available'),
(2, 'XYZ-5678', 3000, 'Garbage Truck', 'Available');

-- --------------------------------------------------------

--
-- Table structure for table `truck_malfunction`
--

CREATE TABLE `truck_malfunction` (
  `malfunction_id` int(11) NOT NULL,
  `truck_id` int(11) DEFAULT NULL,
  `malfunction_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `resolved` tinyint(1) DEFAULT NULL,
  `resolved_at` date DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `status` enum('On Duty','Off Duty','On Leave') DEFAULT NULL,
  `online_status` enum('online','offline') DEFAULT 'offline',
  `email_norm` varchar(255) GENERATED ALWAYS AS (lcase(trim(`email`))) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `email`, `password`, `role_id`, `status`, `online_status`) VALUES
(1, 'admin', 'admin@gmail.com', '$2y$10$QIeP1OVt6MM.lmNlJorPAOUxNCYmOZStgIZNAOHTZnJDWwxnV2qyq', 1, NULL, 'online'),
(3, 'admin', 'njy.nnv@gmail.com', '$2y$10$DTWreJ2agwiY.RUuan9DQO4H1uVDFgf.zeDlq9Xsugkbqcq.kyd0G', 1, NULL, 'offline'),
(10, 'barangayhead', 'bh@gmail.com', '$2y$10$LaI6NqGKAVnyJukvi1.ieeheTHygmoFkjtMImfn71s1enWFcAAfuy', 2, NULL, 'offline'),
(16, 'Paul123', 'paulbermal@gmail.com', '$2y$10$eytboxNv1wzJy/CmcrcIxOB3jv/D17ibUsAZcKtLM6es1O7UXdpRG', 3, 'On Duty', 'offline'),
(17, 'Ronald123', 'ronaldfrondozo@gmail.com', '$2y$10$eytboxNv1wzJy/CmcrcIxOB3jv/D17ibUsAZcKtLM6es1O7UXdpRG', 3, 'On Duty', 'offline'),
(28, 'Alvin', 'alvinmonida@gmail.com', '$2y$10$KHLR4xizvKJvTyfQlvnMBelgeTK4pq/sW93Q.JOJUBkCsMF2qlyvS', 4, 'On Duty', 'offline'),
(29, 'Rico', 'ricomaralit@gmail.com', '$2y$10$BH1dy4njVraysT1ZLinu/uxhJwgAMGmzgt8d7eff1jwWslFH4Z6G2', 4, 'On Duty', 'offline'),
(30, 'Joseph', 'josephosela@gmail.com', '$2y$10$dGDBkkWBq/ccokX4CLV/Gug92Ld0PMErZ28wItqwUpCalUYzqZaaG', 4, 'On Duty', 'online'),
(31, 'Michael', 'michaelabres@gmail.com', '$2y$10$utMxS8Z/2mIKVrdmFh4wVuPtVlvbItwKVSEGTvTaWKXvw1aw6yyNi', 4, 'Off Duty', 'offline'),
(32, 'Arnel', 'arnelcada@gmail.com', '$2y$10$utMxS8Z/2mIKVrdmFh4wVuPtVlvbItwKVSEGTvTaWKXvw1aw6yyNi', 4, 'Off Duty', 'offline'),
(33, 'Joseph1', 'josephcollantes@gmail.com', '$2y$10$uy5j7FSSP7KfThLfoyWKgeahRf7irAsbhFr0wQbXFVnDAoX41cZlK', 4, 'Off Duty', 'offline'),
(34, 'Joel', 'joelosela@gmail.com', '$2y$10$w1G/3uI.c477eVeFixTibeNudGKEbPjF93pN4aTDA3iwm64tAsGae', 4, 'Off Duty', 'offline'),
(35, 'Rosario', 'rosariomabini@gmail.com', '$2y$10$jsuThzIkBASeDMrgrIUh.eRnhpgfBtcXW9YXLNSdd/66HVo/BDqhC', 4, 'Off Duty', 'offline'),
(36, 'Ernie', 'erniecandelaria@gmail.com', '$2y$10$Zzx9P6sAtG3xkKXi320fuO/y92Ti.3faL0d0mFnvXoLtvopysfEru', 4, 'Off Duty', 'offline'),
(55, 'IanJay', 'njy.nnv@gmail.com', '$2y$10$DTWreJ2agwiY.RUuan9DQO4H1uVDFgf.zeDlq9Xsugkbqcq.kyd0G', 2, NULL, 'offline'),
(57, 'Carls', 'carljames@gmail.com', '$2y$10$6U/.19kS/RfyJ//Q1eD16.XgFOI1.iJGjicenW4V/Tt1BDLlDebqG', 5, NULL, 'offline'),
(58, 'Tia', 'ianjay.anonuevo@cbsua.edu.ph', '$2y$10$JywZHEQPhuiJemOvtyA4ROrasS2wv9NjdsSVCx..vbMHyx4lzYGZe', 5, NULL, 'offline'),
(59, 'Cassy', 'cssndrjoyce.04@gmail.com', '$2y$10$BCDu07FKBhVjuEsnqp/HXOBI3h5lC8qjGVVDl7Fw307Sb6csPkrv6', 5, NULL, 'offline'),
(60, 'IanJay26', 'moyile6626@cnguopin.com', '$2y$10$LaI6NqGKAVnyJukvi1.ieeheTHygmoFkjtMImfn71s1enWFcAAfuy', 5, NULL, 'online'),
(61, 'Zia', 'moyile6626@cnguopin.com', '$2y$10$r5FWiE.CH3SuRTaPDFn0du7ztleqVe7xLUMpEnmWGQzWC2GqNdtgG', 5, NULL, 'offline'),
(62, 'test_resident', '', 'password', 3, NULL, 'offline'),
(67, 'Elmer', 'emeir.amado@cbsua.edu.ph', '$2y$10$4kGFUKKTW4rVjyw2HwjAD.upR1kUHUebOvl6qV3c793F0CGWG8M4W', 5, NULL, 'offline'),
(68, 'Emiruuu', 'reimeamado@gmail.com', '$2y$10$KNDkjIlT9MaNp0NOnVlHDOP.Lcqt5rXNbnN73ptb3nTQXI0jyarnG', 5, NULL, 'offline'),
(69, 'Miruuu', 'reimeamado@gmail.com', '$2y$10$KNDkjIlT9MaNp0NOnVlHDOP.Lcqt5rXNbnN73ptb3nTQXI0jyarnG', 5, NULL, 'offline'),
(70, 'Nori', 'santosrinnor0@gmail.com', '$2y$10$DTWreJ2agwiY.RUuan9DQO4H1uVDFgf.zeDlq9Xsugkbqcq.kyd0G', 5, NULL, 'offline'),
(71, 'randy123', 'bh@gmail.com', '$2y$10$QlwznaidTscL2da4JNZTH.lYEJ8VdRZxbojocMPsbl2eUvqigbpay', 5, NULL, 'offline'),
(72, 'angela', 'bh@gmail.com', '$2y$10$liFFG5SDTnmHsTQ5M8rCd.NcFjrhyiTNXCwgzDEs.G/EJH2Zy8l0G', 5, NULL, 'offline'),
(73, 'ronald1245', 'bh@gmail.com', '$2y$10$zQxTi1SgeCFsLq28KM4wc.el2bEsOKv.SPGmikycxfswH79uFWdSi', 5, NULL, 'offline'),
(74, 'admin12', 'bh@gmail.com', '$2y$10$tJza/C6.DoDPXi4DhyVItuPjyYJ6YHIvFHggnbgd5lfZ3/vPsY5tO', 5, NULL, 'offline'),
(75, 'Ian26', 'ianjay.anonuevo@cbsua.edu.ph', '$2y$10$JywZHEQPhuiJemOvtyA4ROrasS2wv9NjdsSVCx..vbMHyx4lzYGZe', 5, NULL, 'offline'),
(76, 'Emiruuu', 'bh@gmail.com', '$2y$10$ONHbyLMwU.R2CiU4O2KnkO1iPECWlFhaUhVLne5PxUq0Ejm4K.0/m', 5, NULL, 'offline'),
(77, 'Emiruuu', 'bh@gmail.com', '$2y$10$JeF1qGcTxhot4ZIeb2K95OmkDACmuLFpzdI1wDP17QCXN.0LXHS22', 5, NULL, 'offline'),
(78, 'Miruuu', 'reimeamado@gmail.com', '$2y$10$KNDkjIlT9MaNp0NOnVlHDOP.Lcqt5rXNbnN73ptb3nTQXI0jyarnG', 5, NULL, 'offline'),
(79, 'Nori', 'santosrinnor0@gmail.com', '$2y$10$CKz205YZ/Vq.UKJGWwZBUeRI6qxCfgev144DpjCDm31tYbJkBSGI6', 5, NULL, 'offline'),
(80, 'Miruuu', 'reimeamado@gmail.com', '$2y$10$KNDkjIlT9MaNp0NOnVlHDOP.Lcqt5rXNbnN73ptb3nTQXI0jyarnG', 5, NULL, 'offline'),
(81, 'Emiruuu', 'reimeamado@gmail.com', '$2y$10$KNDkjIlT9MaNp0NOnVlHDOP.Lcqt5rXNbnN73ptb3nTQXI0jyarnG', 5, NULL, 'offline'),
(82, 'Emiruuu', 'reimeamado@gmail.com', '$2y$10$KNDkjIlT9MaNp0NOnVlHDOP.Lcqt5rXNbnN73ptb3nTQXI0jyarnG', 5, NULL, 'offline'),
(83, 'Ianzkie', 'ianjayanonuevo26@gmail.com', '$2y$10$rc2dTe3jzOmFcgWWazdHOuuyJgv1wUqrukDWa1p04eRi.MvErrIrO', 5, NULL, 'offline'),
(84, 'Zai', 'kolektrash@gmail.com', '$2y$10$6WEaL2pdE1SnxsltAL3O/OpzviW5b157M6Xrvqc/P3lKVwsjYk8Cu', 5, NULL, 'offline'),
(85, 'adminisp', 'ianjayauevo26@gmail.com', '$2y$10$60rmyJKw2SDy9M5u9sBY2.4EDtGjsYdmtZmEqcFLOd7C3GzThED/e', 5, NULL, 'offline'),
(86, 'Alexis', 'alexsenpai@gmail.com', '$2y$10$9njSNTTFj4Ck0Rb1uwxVM.I.T/zpSpJ17r8WERHXNuuYzqpnjAQ3a', 4, NULL, 'offline'),
(87, 'Emirv', 'emeiramado2004@gmail.com', '$2y$10$VCxkwWJggSBuBbIgeoax6OPetj5bO6A/Fo/yy58rMj4RtaKiVpY7W', 5, NULL, 'offline'),
(88, 'Benejose', 'nikopalenquez01@gmail.com', '$2y$10$963aa0q3dfXNJGQ8EGhOBeY716S1USqftJRHshQpjleShEODA0XIK', 5, NULL, 'offline'),
(89, 'BeneJosejr', 'nikopalenquez1@gmail.com', '$2y$10$CBnhagBk6p4EqJv/zymUxOWFObUvJGpJ61D9RnTyo0IF7rxkoIJaq', 5, NULL, 'offline'),
(90, 'support', 'support@koletrash.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 6, '', 'offline'),
(91, 'foreman', 'foreman@gmail.com', '$2y$10$zOgVez8hOmb79o4YPfFDZ.len8JnoPGH0avUjcPzXiHT8FNB9SuOm', 7, NULL, 'offline');

-- --------------------------------------------------------

--
-- Table structure for table `user_profile`
--

CREATE TABLE `user_profile` (
  `user_id` int(11) NOT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `profile_image_updated_at` datetime DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `contact_num` varchar(20) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `barangay_id` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profile`
--

INSERT INTO `user_profile` (`user_id`, `firstname`, `lastname`, `profile_image`, `profile_image_updated_at`, `birthdate`, `contact_num`, `gender`, `address`, `status`, `barangay_id`) VALUES
(3, 'Ian Jay', 'Anonuevo', NULL, NULL, NULL, '0999999', NULL, 'Umalo', NULL, '02-ALTZ'),
(10, 'Ian Jay', 'Anonuevo', 'uploads/profile_images/resident_10_30132c6c.jpg', '2025-10-10 00:06:21', '2015-03-11', NULL, 'Male', 'Alteaza', 'online', '39-STHCN'),
(16, 'Paul Ezra', 'Bermal', 'uploads/profile_images/resident_16_24c85321.png', '2025-11-05 00:49:34', NULL, '09765762334', 'Male', 'Calagbangan Sipocot Camarines Sur', 'online', '14-CLGBN'),
(17, 'Ronald', 'Frondozo', NULL, NULL, NULL, '09876776652', 'Male', 'North Centro Sipocot Camarines Sur', 'online', '31-NRTHC'),
(28, 'Alvin ', 'Monida', NULL, NULL, '0000-00-00', '09567611243', 'Male', 'Caima Sipocot Camarines Sur', 'online', '13-CM'),
(29, 'Rico', 'Maralit', NULL, NULL, '0000-00-00', '09878665541', 'Male', 'Azucena Sipocot Camarines Sur', 'online', '05-AZCN'),
(30, 'Joseph', 'Osela', NULL, NULL, '0000-00-00', '09855434576', 'Male', 'Malubago Sipocot Camarines Sur', 'online', '25-MLBG'),
(31, 'Michael', 'Abres', NULL, NULL, '0000-00-00', '09768761234', 'Male', 'Impig Sipocot Camarines Sur', 'online', '20-IMPG'),
(32, 'Arnel', 'Cada Jr.', NULL, NULL, '0000-00-00', '09676756422', 'Male', 'South Centro Sipocot Camarines Sur', 'online', '39-STHCN'),
(33, 'Joseph ', 'Collantes', NULL, NULL, '0000-00-00', '09676756422', 'Male', 'Alteza Sipocot Camarines Sur', 'online', '02-ALTZ'),
(34, 'Joel', 'Osela', NULL, NULL, '0000-00-00', '09223354341', 'Male', 'North Centro Sipocot Camarines Sur', 'online', '31-NRTHC'),
(35, 'Rosario', 'Mabini', NULL, NULL, '0000-00-00', '09112231234', 'Male', 'Malubago Sipocot Camarines Sur', 'online', '25-MLBG'),
(36, 'Ernie', 'Candelaria', NULL, NULL, '0000-00-00', '09883443233', 'Male', 'Gaongan Sipocot Camarines Sur', 'online', '19-GNGN'),
(55, 'Ian Jays', 'Anonuevo', NULL, NULL, '2003-07-26', '09706681326', 'Male', 'Umalo', 'online', '01-ALDZR'),
(57, 'Carl', 'James', NULL, NULL, NULL, '09085463731', NULL, 'Umalo Libmanan', NULL, '11-BLWN'),
(58, 'Tia', 'Anonuevo', NULL, NULL, NULL, '09706681326', NULL, 'Umalos zone4', NULL, '13-CM'),
(59, 'Cassandra', 'Anonuevo', NULL, NULL, NULL, '09123456789', NULL, 'Umalo Libmanan', NULL, '12-CBY'),
(60, 'Ian', 'Jay', NULL, NULL, NULL, '09706681326', NULL, 'Bolu Sur Zone 4', NULL, '39-STHCN'),
(61, 'Zia', 'Chao', NULL, NULL, NULL, '09706681326', NULL, 'Gaongan Sur Zone 4', NULL, '19-GNGN'),
(67, 'Emeir ', 'Nava', NULL, NULL, NULL, '09787877777', NULL, 'Gaongan  Libmanan ', NULL, '07-BNHN'),
(68, 'Emiru', 'Amado', 'uploads/profile_images/resident_68_33894204.jpg', '2025-11-04 11:06:39', NULL, '09704910445', NULL, 'Centro 2 Gaongan', NULL, '19-GNGN'),
(69, 'Emeir ', 'Amado', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Gaongan ', NULL, '07-BNHN'),
(70, 'Rinnor ', 'Santos', NULL, NULL, NULL, '09123456789', NULL, 'Zone, 1 Impig, Sipocot, Camarines Sur', NULL, '20-IMPG'),
(71, 'Daniela', 'ADSASD', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Tara', NULL, '17-CTM'),
(72, 'Angila', 'HJAKSJdh', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Tara', NULL, '01-ALDZR'),
(73, 'Daniela', 'Asda', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Tara', NULL, '15-CLMPN'),
(74, 'Daniela', 'Corralasdas', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Tara', NULL, '17-CTM'),
(75, 'Ian ', 'Jay', NULL, NULL, NULL, '09787877777', NULL, 'Umalo Libmanan ', NULL, '20-IMPG'),
(76, 'Daniela', 'asda', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Tara', NULL, '02-ALTZ'),
(77, 'Daniela', 'ADSASD', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Gaongan', NULL, '01-ALDZR'),
(78, 'Emeir ', 'Amado', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Gaongan ', NULL, '07-BNHN'),
(79, 'Rinnor', 'Santos', NULL, NULL, NULL, '09123456789', NULL, 'Zone, 1 Impig, Sipocot, Camarines Sur', NULL, '20-IMPG'),
(80, 'Emeir ', 'Amado', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Gaongan ', NULL, '07-BNHN'),
(81, 'Daniela', 'Corral', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Tara', NULL, '01-ALDZR'),
(82, 'Daniela', 'Corral', NULL, NULL, NULL, '09704910445', NULL, 'Centro 2 Gaongan', NULL, '02-ALTZ'),
(83, 'Xai', 'Anonuevo', NULL, NULL, NULL, '09706681326', NULL, 'Umalo Libmanan', NULL, '09-BLSR'),
(84, 'Zai', 'Alay', NULL, NULL, NULL, '09787877777', NULL, 'Calampinay Zone 4', NULL, '15-CLMPN'),
(85, 'Lan', 'Nava', NULL, NULL, NULL, '09787877777', NULL, 'Umalo Libmanan ', NULL, '05-AZCN'),
(86, 'Alex', 'Calma', NULL, NULL, '2002-07-21', '09277587493', 'Male', 'Umalo Libmanan', 'online', '01-ALDZR'),
(87, 'Emeir', 'Odama', NULL, NULL, NULL, '09704910445', NULL, 'Sitio Uno ni', NULL, '05-AZCN'),
(88, 'Bene', 'Jose jr', NULL, NULL, NULL, '09387173097', NULL, 'Zone 1, Impig, Sipocot Camarines Sur ', NULL, '20-IMPG'),
(89, 'Bene', 'Jose Jr', NULL, NULL, NULL, '09387173097', NULL, 'Zone 1,  Impig Sipocot Camarines Sur ', NULL, '20-IMPG'),
(90, 'Support', 'Staff', NULL, NULL, NULL, '+63-912-345-6789', NULL, 'Support Office, City Hall', 'Active', NULL),
(91, 'Emeir', 'Amado', NULL, NULL, '2000-02-28', '09704910445', 'Male', 'Centro 2 Gaongan', 'online', '19-GNGN');

-- --------------------------------------------------------

--
-- Table structure for table `waste_log`
--

CREATE TABLE `waste_log` (
  `log_id` int(11) NOT NULL,
  `collection_id` int(11) DEFAULT NULL,
  `collector_id` int(11) DEFAULT NULL,
  `waste_type` varchar(50) DEFAULT NULL,
  `volume` decimal(10,2) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `unique_attendance` (`user_id`,`attendance_date`,`session`),
  ADD KEY `idx_user_date` (`user_id`,`attendance_date`),
  ADD KEY `idx_date` (`attendance_date`),
  ADD KEY `idx_recorded_by` (`recorded_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_session` (`session`),
  ADD KEY `idx_verification_status` (`verification_status`);

--
-- Indexes for table `attendance_request`
--
ALTER TABLE `attendance_request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attendance_schedule` (`schedule_id`),
  ADD KEY `idx_attendance_status` (`request_status`),
  ADD KEY `idx_attendance_user` (`user_id`,`submitted_at`),
  ADD KEY `idx_attendance_foreman` (`foreman_id`,`reviewed_at`);

--
-- Indexes for table `barangay`
--
ALTER TABLE `barangay`
  ADD PRIMARY KEY (`barangay_id`),
  ADD KEY `cluster_id` (`cluster_id`),
  ADD KEY `barangay_head_id` (`barangay_head_id`);

--
-- Indexes for table `barangay_head`
--
ALTER TABLE `barangay_head`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `cluster`
--
ALTER TABLE `cluster`
  ADD PRIMARY KEY (`cluster_id`);

--
-- Indexes for table `collection`
--
ALTER TABLE `collection`
  ADD PRIMARY KEY (`collection_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `collector_id` (`collector_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `collection_point`
--
ALTER TABLE `collection_point`
  ADD PRIMARY KEY (`point_id`),
  ADD KEY `barangay_id` (`barangay_id`);

--
-- Indexes for table `collection_schedule`
--
ALTER TABLE `collection_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `barangay_id` (`barangay_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `collection_team`
--
ALTER TABLE `collection_team`
  ADD PRIMARY KEY (`team_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `truck_id` (`truck_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `collection_team_member`
--
ALTER TABLE `collection_team_member`
  ADD PRIMARY KEY (`team_member_id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `collector_id` (`collector_id`);

--
-- Indexes for table `collection_type`
--
ALTER TABLE `collection_type`
  ADD PRIMARY KEY (`type_id`);

--
-- Indexes for table `daily_route`
--
ALTER TABLE `daily_route`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_route_date_cluster_version` (`date`,`cluster_id`,`version`),
  ADD KEY `idx_route_date` (`date`),
  ADD KEY `idx_route_status` (`status`),
  ADD KEY `idx_route_source` (`source`),
  ADD KEY `idx_route_truck` (`truck_id`),
  ADD KEY `idx_route_team` (`team_id`),
  ADD KEY `idx_route_cluster` (`cluster_id`);

--
-- Indexes for table `daily_route_stop`
--
ALTER TABLE `daily_route_stop`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_route_stop_seq` (`daily_route_id`,`seq`),
  ADD KEY `idx_route_stop_route` (`daily_route_id`);

--
-- Indexes for table `email_verification`
--
ALTER TABLE `email_verification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_code` (`verification_code`),
  ADD KEY `idx_expiry` (`expiry_time`);

--
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`);

--
-- Indexes for table `gps_route_log`
--
ALTER TABLE `gps_route_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `idx_truck_time` (`truck_id`,`timestamp`),
  ADD KEY `idx_driver_time` (`driver_id`,`timestamp`);

--
-- Indexes for table `iec_material`
--
ALTER TABLE `iec_material`
  ADD PRIMARY KEY (`material_id`);

--
-- Indexes for table `iec_view`
--
ALTER TABLE `iec_view`
  ADD PRIMARY KEY (`view_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `issue_reports`
--
ALTER TABLE `issue_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reporter_id` (`reporter_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_issue_type` (`issue_type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_barangay` (`barangay`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `recipient_id` (`recipient_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `reset_code` (`reset_code`),
  ADD KEY `expiry_time` (`expiry_time`),
  ADD KEY `idx_password_resets_email_code` (`email`,`reset_code`),
  ADD KEY `idx_password_resets_expiry` (`expiry_time`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`permission_id`);

--
-- Indexes for table `pickup_requests`
--
ALTER TABLE `pickup_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_requester_id` (`requester_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_pickup_date` (`pickup_date`),
  ADD KEY `idx_barangay` (`barangay`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `predefined_schedules`
--
ALTER TABLE `predefined_schedules`
  ADD PRIMARY KEY (`schedule_template_id`),
  ADD UNIQUE KEY `unique_barangay_day_time` (`barangay_id`,`day_of_week`,`start_time`),
  ADD KEY `cluster_id` (`cluster_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `route_emergency_log`
--
ALTER TABLE `route_emergency_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_route` (`route_id`),
  ADD KEY `idx_impact` (`impact`);

--
-- Indexes for table `route_generation_run`
--
ALTER TABLE `route_generation_run`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_generation_date` (`date`);

--
-- Indexes for table `task_events`
--
ALTER TABLE `task_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assignment` (`assignment_id`),
  ADD KEY `idx_event_type` (`event_type`);

--
-- Indexes for table `truck`
--
ALTER TABLE `truck`
  ADD PRIMARY KEY (`truck_id`);

--
-- Indexes for table `truck_malfunction`
--
ALTER TABLE `truck_malfunction`
  ADD PRIMARY KEY (`malfunction_id`),
  ADD KEY `truck_id` (`truck_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `barangay_id` (`barangay_id`);

--
-- Indexes for table `waste_log`
--
ALTER TABLE `waste_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `collection_id` (`collection_id`),
  ADD KEY `collector_id` (`collector_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `attendance_request`
--
ALTER TABLE `attendance_request`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `collection`
--
ALTER TABLE `collection`
  MODIFY `collection_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `collection_point`
--
ALTER TABLE `collection_point`
  MODIFY `point_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `collection_schedule`
--
ALTER TABLE `collection_schedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1591;

--
-- AUTO_INCREMENT for table `collection_team`
--
ALTER TABLE `collection_team`
  MODIFY `team_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1327;

--
-- AUTO_INCREMENT for table `collection_team_member`
--
ALTER TABLE `collection_team_member`
  MODIFY `team_member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3934;

--
-- AUTO_INCREMENT for table `collection_type`
--
ALTER TABLE `collection_type`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_route`
--
ALTER TABLE `daily_route`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=690;

--
-- AUTO_INCREMENT for table `daily_route_stop`
--
ALTER TABLE `daily_route_stop`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1460;

--
-- AUTO_INCREMENT for table `email_verification`
--
ALTER TABLE `email_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `gps_route_log`
--
ALTER TABLE `gps_route_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2447;

--
-- AUTO_INCREMENT for table `iec_material`
--
ALTER TABLE `iec_material`
  MODIFY `material_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `iec_view`
--
ALTER TABLE `iec_view`
  MODIFY `view_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `issue_reports`
--
ALTER TABLE `issue_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11753;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pickup_requests`
--
ALTER TABLE `pickup_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `predefined_schedules`
--
ALTER TABLE `predefined_schedules`
  MODIFY `schedule_template_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=323;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `route_emergency_log`
--
ALTER TABLE `route_emergency_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `route_generation_run`
--
ALTER TABLE `route_generation_run`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `task_events`
--
ALTER TABLE `task_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=279;

--
-- AUTO_INCREMENT for table `truck`
--
ALTER TABLE `truck`
  MODIFY `truck_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `truck_malfunction`
--
ALTER TABLE `truck_malfunction`
  MODIFY `malfunction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `waste_log`
--
ALTER TABLE `waste_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_recorder_ref` FOREIGN KEY (`recorded_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attendance_user_ref` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance_request`
--
ALTER TABLE `attendance_request`
  ADD CONSTRAINT `fk_attendance_foreman` FOREIGN KEY (`foreman_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `fk_attendance_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `daily_route` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attendance_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `barangay`
--
ALTER TABLE `barangay`
  ADD CONSTRAINT `barangay_ibfk_1` FOREIGN KEY (`cluster_id`) REFERENCES `cluster` (`cluster_id`),
  ADD CONSTRAINT `barangay_ibfk_2` FOREIGN KEY (`barangay_head_id`) REFERENCES `barangay_head` (`user_id`);

--
-- Constraints for table `collection`
--
ALTER TABLE `collection`
  ADD CONSTRAINT `collection_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `collection_schedule` (`schedule_id`),
  ADD CONSTRAINT `collection_ibfk_2` FOREIGN KEY (`collector_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `collection_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `collection_team`
--
ALTER TABLE `collection_team`
  ADD CONSTRAINT `collection_team_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `collection_schedule` (`schedule_id`),
  ADD CONSTRAINT `collection_team_ibfk_2` FOREIGN KEY (`truck_id`) REFERENCES `truck` (`truck_id`),
  ADD CONSTRAINT `collection_team_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `collection_team_member`
--
ALTER TABLE `collection_team_member`
  ADD CONSTRAINT `collection_team_member_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `collection_team` (`team_id`),
  ADD CONSTRAINT `collection_team_member_ibfk_2` FOREIGN KEY (`collector_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `daily_route_stop`
--
ALTER TABLE `daily_route_stop`
  ADD CONSTRAINT `fk_daily_route_stop_route` FOREIGN KEY (`daily_route_id`) REFERENCES `daily_route` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `gps_route_log`
--
ALTER TABLE `gps_route_log`
  ADD CONSTRAINT `gps_route_log_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `collection_team` (`team_id`);

--
-- Constraints for table `iec_view`
--
ALTER TABLE `iec_view`
  ADD CONSTRAINT `iec_view_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `iec_view_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `iec_material` (`material_id`);

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`),
  ADD CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`);

--
-- Constraints for table `truck_malfunction`
--
ALTER TABLE `truck_malfunction`
  ADD CONSTRAINT `truck_malfunction_ibfk_1` FOREIGN KEY (`truck_id`) REFERENCES `truck` (`truck_id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);

--
-- Constraints for table `waste_log`
--
ALTER TABLE `waste_log`
  ADD CONSTRAINT `waste_log_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`collection_id`),
  ADD CONSTRAINT `waste_log_ibfk_2` FOREIGN KEY (`collector_id`) REFERENCES `user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
