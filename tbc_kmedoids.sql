-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 02, 2024 at 06:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tbc_kmedoids`
--

-- --------------------------------------------------------

--
-- Table structure for table `tb_jenis`
--

CREATE TABLE `tb_jenis` (
  `id` int(11) NOT NULL,
  `Kecamatan` varchar(50) DEFAULT NULL,
  `TBC_Paru` int(11) DEFAULT NULL,
  `TBC_Ekstraparu` int(11) DEFAULT NULL,
  `TBC_Milier` int(11) DEFAULT NULL,
  `TBC_Meningitis` int(11) DEFAULT NULL,
  `TBC_Kelenjar` int(11) DEFAULT NULL,
  `TBC_Usus` int(11) DEFAULT NULL,
  `TBC_Tulang` int(11) DEFAULT NULL,
  `TBC_Kulit` int(11) DEFAULT NULL,
  `Jumlah` int(11) DEFAULT NULL,
  `tahun` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_jenis`
--

INSERT INTO `tb_jenis` (`id`, `Kecamatan`, `TBC_Paru`, `TBC_Ekstraparu`, `TBC_Milier`, `TBC_Meningitis`, `TBC_Kelenjar`, `TBC_Usus`, `TBC_Tulang`, `TBC_Kulit`, `Jumlah`, `tahun`) VALUES
(1, 'Banda Mulia', 8, 2, 1, 1, 2, 1, 1, 0, 16, 2019),
(2, 'Banda Mulia', 9, 2, 1, 1, 3, 1, 1, 0, 18, 2020),
(3, 'Banda Mulia', 10, 2, 1, 1, 3, 1, 1, 0, 19, 2021),
(4, 'Banda Mulia', 11, 2, 1, 1, 3, 1, 1, 0, 20, 2022),
(5, 'Banda Mulia', 13, 2, 1, 1, 4, 1, 1, 0, 23, 2023),
(6, 'Banda Mulia', 15, 2, 1, 1, 4, 1, 1, 0, 25, 2024),
(7, 'Bandar Pusaka', 10, 2, 1, 1, 3, 1, 1, 0, 19, 2019),
(8, 'Bandar Pusaka', 11, 2, 1, 1, 3, 1, 1, 0, 20, 2020),
(9, 'Bandar Pusaka', 12, 2, 1, 1, 3, 1, 1, 0, 21, 2021),
(10, 'Bandar Pusaka', 13, 2, 1, 1, 3, 1, 1, 0, 22, 2022),
(11, 'Bandar Pusaka', 14, 2, 1, 1, 4, 1, 1, 0, 24, 2023),
(12, 'Bandar Pusaka', 16, 2, 1, 1, 4, 1, 1, 0, 26, 2024),
(13, 'Bendahara', 14, 3, 2, 2, 4, 2, 1, 1, 29, 2019),
(14, 'Bendahara', 15, 3, 2, 2, 4, 2, 1, 1, 30, 2020),
(15, 'Bendahara', 16, 3, 2, 2, 4, 2, 1, 1, 31, 2021),
(16, 'Bendahara', 17, 3, 2, 2, 4, 2, 1, 1, 32, 2022),
(17, 'Bendahara', 19, 3, 2, 2, 5, 2, 1, 1, 35, 2023),
(18, 'Bendahara', 21, 3, 2, 2, 5, 2, 1, 1, 37, 2024),
(19, 'Karang Baru', 15, 3, 2, 1, 4, 2, 1, 0, 28, 2019),
(20, 'Karang Baru', 12, 2, 1, 1, 3, 1, 1, 0, 21, 2020),
(21, 'Karang Baru', 14, 2, 2, 1, 3, 2, 1, 0, 25, 2021),
(22, 'Karang Baru', 16, 3, 2, 1, 4, 2, 1, 1, 30, 2022),
(23, 'Karang Baru', 18, 3, 2, 1, 4, 2, 1, 1, 32, 2023),
(24, 'Karang Baru', 20, 3, 2, 1, 4, 2, 2, 1, 35, 2024),
(25, 'Kejuruan Muda', 13, 3, 2, 2, 4, 2, 1, 1, 28, 2019),
(26, 'Kejuruan Muda', 14, 3, 2, 2, 4, 2, 1, 1, 29, 2020),
(27, 'Kejuruan Muda', 15, 3, 2, 2, 4, 2, 1, 1, 30, 2021),
(28, 'Kejuruan Muda', 16, 3, 2, 2, 4, 2, 1, 1, 31, 2022),
(29, 'Kejuruan Muda', 18, 3, 2, 2, 5, 2, 1, 1, 34, 2023),
(30, 'Kejuruan Muda', 20, 3, 2, 2, 5, 2, 1, 1, 36, 2024),
(31, 'Kota Kualasimpang', 16, 3, 2, 2, 4, 2, 1, 1, 31, 2019),
(32, 'Kota Kualasimpang', 17, 3, 2, 2, 4, 2, 1, 1, 32, 2020),
(33, 'Kota Kualasimpang', 18, 3, 2, 2, 4, 2, 1, 1, 33, 2021),
(34, 'Kota Kualasimpang', 19, 3, 2, 2, 4, 2, 1, 1, 34, 2022),
(35, 'Kota Kualasimpang', 21, 3, 2, 2, 5, 2, 1, 1, 37, 2023),
(36, 'Kota Kualasimpang', 23, 3, 2, 2, 5, 2, 1, 1, 39, 2024),
(37, 'Kuala Simpang', 18, 4, 3, 2, 5, 3, 2, 1, 38, 2019),
(38, 'Kuala Simpang', 20, 4, 3, 2, 5, 3, 2, 1, 40, 2020),
(39, 'Kuala Simpang', 22, 4, 3, 2, 5, 3, 2, 1, 42, 2021),
(40, 'Kuala Simpang', 24, 4, 3, 2, 5, 3, 2, 1, 44, 2022),
(41, 'Kuala Simpang', 26, 4, 3, 2, 6, 3, 2, 1, 47, 2023),
(42, 'Kuala Simpang', 28, 4, 3, 2, 6, 3, 2, 1, 49, 2024),
(43, 'Manyak Payed', 11, 2, 1, 1, 3, 1, 1, 0, 20, 2019),
(44, 'Manyak Payed', 12, 2, 1, 1, 3, 1, 1, 0, 21, 2020),
(45, 'Manyak Payed', 13, 2, 1, 1, 3, 1, 1, 0, 22, 2021),
(46, 'Manyak Payed', 14, 2, 1, 1, 3, 1, 1, 0, 23, 2022),
(47, 'Manyak Payed', 15, 2, 1, 1, 4, 1, 1, 0, 25, 2023),
(48, 'Manyak Payed', 17, 2, 1, 1, 4, 1, 1, 0, 27, 2024),
(49, 'Rantau', 20, 4, 3, 2, 5, 3, 2, 1, 40, 2019),
(50, 'Rantau', 18, 3, 2, 2, 4, 2, 1, 0, 32, 2020),
(51, 'Rantau', 20, 4, 2, 2, 5, 3, 1, 0, 37, 2021),
(52, 'Rantau', 22, 4, 3, 2, 5, 3, 2, 1, 42, 2022),
(53, 'Rantau', 24, 4, 3, 2, 6, 3, 2, 1, 45, 2023),
(54, 'Rantau', 26, 4, 3, 2, 6, 3, 2, 1, 47, 2024),
(55, 'Sekerak', 7, 2, 1, 1, 2, 1, 1, 0, 15, 2019),
(56, 'Sekerak', 8, 2, 1, 1, 2, 1, 1, 0, 16, 2020),
(57, 'Sekerak', 9, 2, 1, 1, 2, 1, 1, 0, 17, 2021),
(58, 'Sekerak', 10, 2, 1, 1, 2, 1, 1, 0, 18, 2022),
(59, 'Sekerak', 11, 2, 1, 1, 3, 1, 1, 0, 20, 2023),
(60, 'Sekerak', 12, 2, 1, 1, 3, 1, 1, 0, 21, 2024),
(61, 'Seruway', 12, 3, 2, 2, 4, 2, 1, 1, 27, 2019),
(62, 'Seruway', 11, 2, 1, 1, 3, 1, 0, 0, 19, 2020),
(63, 'Seruway', 12, 3, 2, 1, 3, 1, 1, 0, 23, 2021),
(64, 'Seruway', 14, 3, 2, 1, 4, 2, 1, 0, 27, 2022),
(65, 'Seruway', 15, 3, 2, 1, 4, 2, 1, 0, 28, 2023),
(66, 'Seruway', 16, 3, 2, 1, 4, 2, 1, 1, 30, 2024),
(67, 'Tamiang Hulu', 10, 2, 1, 1, 3, 1, 1, 1, 20, 2019),
(68, 'Tamiang Hulu', 9, 2, 1, 1, 3, 1, 1, 0, 18, 2020),
(69, 'Tamiang Hulu', 10, 2, 1, 1, 3, 1, 1, 0, 19, 2021),
(70, 'Tamiang Hulu', 11, 3, 1, 1, 3, 2, 1, 0, 22, 2022),
(71, 'Tamiang Hulu', 12, 3, 1, 1, 4, 2, 1, 0, 24, 2023),
(72, 'Tamiang Hulu', 14, 3, 1, 1, 4, 2, 1, 0, 26, 2024),
(73, 'Tenggulun', 9, 2, 1, 1, 3, 1, 1, 0, 18, 2019),
(74, 'Tenggulun', 10, 2, 1, 1, 3, 1, 1, 0, 19, 2020),
(75, 'Tenggulun', 11, 2, 1, 1, 3, 1, 1, 0, 20, 2021),
(76, 'Tenggulun', 12, 2, 1, 1, 3, 1, 1, 0, 21, 2022),
(77, 'Tenggulun', 13, 2, 1, 1, 4, 1, 1, 0, 23, 2023),
(78, 'Tenggulun', 14, 2, 1, 1, 4, 1, 1, 0, 24, 2024);

-- --------------------------------------------------------

--
-- Table structure for table `tb_usia`
--

CREATE TABLE `tb_usia` (
  `id` int(11) NOT NULL,
  `Kecamatan` varchar(50) NOT NULL,
  `anak_anak` int(11) NOT NULL,
  `remaja` int(11) NOT NULL,
  `dewasa` int(11) NOT NULL,
  `paruh_baya` int(11) NOT NULL,
  `lansia` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `tahun` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tb_usia`
--

INSERT INTO `tb_usia` (`id`, `Kecamatan`, `anak_anak`, `remaja`, `dewasa`, `paruh_baya`, `lansia`, `jumlah`, `tahun`) VALUES
(1, 'Banda Mulia', 3, 4, 5, 3, 1, 16, 2019),
(2, 'Banda Mulia', 4, 5, 6, 3, 2, 20, 2020),
(3, 'Banda Mulia', 4, 5, 7, 3, 2, 21, 2021),
(4, 'Banda Mulia', 5, 6, 7, 3, 2, 23, 2022),
(5, 'Banda Mulia', 6, 7, 8, 3, 2, 26, 2023),
(6, 'Banda Mulia', 6, 7, 9, 3, 2, 27, 2024),
(7, 'Bandar Pusaka', 5, 6, 6, 3, 2, 22, 2019),
(8, 'Bandar Pusaka', 5, 6, 7, 3, 2, 23, 2020),
(9, 'Bandar Pusaka', 6, 7, 8, 3, 2, 26, 2021),
(10, 'Bandar Pusaka', 6, 7, 8, 3, 2, 26, 2022),
(11, 'Bandar Pusaka', 6, 7, 8, 3, 2, 26, 2023),
(12, 'Bandar Pusaka', 7, 7, 9, 3, 2, 28, 2024),
(13, 'Bendahara', 7, 8, 9, 4, 3, 29, 2019),
(14, 'Bendahara', 7, 8, 10, 5, 4, 34, 2020),
(15, 'Bendahara', 8, 9, 11, 5, 4, 37, 2021),
(16, 'Bendahara', 8, 9, 11, 5, 4, 37, 2022),
(17, 'Bendahara', 9, 10, 11, 5, 4, 39, 2023),
(18, 'Bendahara', 10, 10, 12, 5, 4, 41, 2024),
(19, 'Karang Baru', 5, 7, 8, 5, 3, 28, 2019),
(20, 'Karang Baru', 5, 6, 8, 4, 3, 26, 2020),
(21, 'Karang Baru', 5, 7, 9, 5, 3, 29, 2021),
(22, 'Karang Baru', 6, 7, 10, 5, 3, 31, 2022),
(23, 'Karang Baru', 6, 8, 10, 5, 4, 33, 2023),
(24, 'Karang Baru', 7, 8, 11, 5, 4, 35, 2024),
(25, 'Kejuruan Muda', 6, 7, 8, 4, 3, 28, 2019),
(26, 'Kejuruan Muda', 6, 7, 9, 4, 3, 29, 2020),
(27, 'Kejuruan Muda', 7, 8, 9, 4, 3, 31, 2021),
(28, 'Kejuruan Muda', 7, 8, 10, 4, 3, 32, 2022),
(29, 'Kejuruan Muda', 8, 9, 10, 4, 3, 34, 2023),
(30, 'Kejuruan Muda', 9, 9, 11, 4, 3, 36, 2024),
(31, 'Kota Kualasimpang', 7, 8, 9, 4, 3, 31, 2019),
(32, 'Kota Kualasimpang', 7, 8, 10, 4, 3, 32, 2020),
(33, 'Kota Kualasimpang', 8, 9, 10, 4, 3, 34, 2021),
(34, 'Kota Kualasimpang', 8, 9, 11, 4, 3, 35, 2022),
(35, 'Kota Kualasimpang', 8, 10, 11, 4, 3, 36, 2023),
(36, 'Kota Kualasimpang', 9, 10, 12, 4, 3, 38, 2024),
(37, 'Kuala Simpang', 8, 9, 10, 6, 5, 38, 2019),
(38, 'Kuala Simpang', 8, 9, 11, 6, 5, 39, 2020),
(39, 'Kuala Simpang', 9, 10, 12, 6, 5, 42, 2021),
(40, 'Kuala Simpang', 9, 10, 13, 6, 5, 43, 2022),
(41, 'Kuala Simpang', 9, 11, 13, 6, 5, 44, 2023),
(42, 'Kuala Simpang', 10, 11, 14, 6, 5, 46, 2024),
(43, 'Manyak Payed', 5, 6, 6, 3, 2, 22, 2019),
(44, 'Manyak Payed', 5, 6, 7, 3, 2, 23, 2020),
(45, 'Manyak Payed', 5, 7, 8, 3, 2, 25, 2021),
(46, 'Manyak Payed', 6, 7, 8, 3, 2, 26, 2022),
(47, 'Manyak Payed', 6, 8, 9, 3, 2, 28, 2023),
(48, 'Manyak Payed', 7, 8, 9, 3, 2, 29, 2024),
(49, 'Rantau', 8, 10, 12, 6, 4, 40, 2019),
(50, 'Rantau', 8, 10, 12, 5, 4, 39, 2020),
(51, 'Rantau', 9, 11, 13, 6, 4, 43, 2021),
(52, 'Rantau', 10, 12, 14, 6, 5, 47, 2022),
(53, 'Rantau', 11, 13, 14, 6, 5, 49, 2023),
(54, 'Rantau', 12, 13, 15, 6, 5, 51, 2024),
(55, 'Sekerak', 3, 4, 5, 2, 1, 15, 2019),
(56, 'Sekerak', 3, 4, 6, 2, 1, 16, 2020),
(57, 'Sekerak', 3, 5, 6, 2, 1, 17, 2021),
(58, 'Sekerak', 4, 5, 7, 2, 1, 19, 2022),
(59, 'Sekerak', 4, 5, 7, 2, 1, 19, 2023),
(60, 'Sekerak', 4, 5, 8, 2, 1, 20, 2024),
(61, 'Seruway', 6, 7, 8, 4, 2, 27, 2019),
(62, 'Seruway', 6, 7, 8, 3, 2, 26, 2020),
(63, 'Seruway', 6, 8, 9, 4, 3, 30, 2021),
(64, 'Seruway', 7, 8, 10, 4, 3, 32, 2022),
(65, 'Seruway', 7, 9, 10, 5, 3, 34, 2023),
(66, 'Seruway', 7, 9, 11, 5, 3, 35, 2024),
(67, 'Tamiang Hulu', 4, 5, 6, 3, 2, 20, 2019),
(68, 'Tamiang Hulu', 3, 4, 6, 3, 2, 18, 2020),
(69, 'Tamiang Hulu', 4, 5, 7, 3, 2, 21, 2021),
(70, 'Tamiang Hulu', 4, 5, 8, 3, 2, 22, 2022),
(71, 'Tamiang Hulu', 5, 6, 8, 3, 2, 24, 2023),
(72, 'Tamiang Hulu', 5, 6, 9, 3, 2, 25, 2024),
(73, 'Tenggulun', 4, 5, 6, 2, 1, 18, 2019),
(74, 'Tenggulun', 4, 5, 7, 2, 1, 19, 2020),
(75, 'Tenggulun', 4, 6, 7, 2, 1, 20, 2021),
(76, 'Tenggulun', 5, 6, 8, 2, 1, 22, 2022),
(77, 'Tenggulun', 5, 7, 8, 2, 1, 23, 2023),
(78, 'Tenggulun', 5, 7, 9, 2, 1, 24, 2024);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tb_jenis`
--
ALTER TABLE `tb_jenis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tb_usia`
--
ALTER TABLE `tb_usia`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tb_jenis`
--
ALTER TABLE `tb_jenis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=170;

--
-- AUTO_INCREMENT for table `tb_usia`
--
ALTER TABLE `tb_usia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
