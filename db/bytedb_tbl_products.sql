-- MySQL dump 10.13  Distrib 8.0.31, for macos12 (x86_64)
--
-- Host: 127.0.0.1    Database: bytedb
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_products`
--

DROP TABLE IF EXISTS `tbl_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` longtext NOT NULL,
  `images` longtext NOT NULL,
  `status` tinyint DEFAULT '1' COMMENT '1 = active\n2 = inactive',
  `inserted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_products`
--

LOCK TABLES `tbl_products` WRITE;
/*!40000 ALTER TABLE `tbl_products` DISABLE KEYS */;
INSERT INTO `tbl_products` VALUES (1,2,'Test','This shops are located in Newtown, Kalighat road, and Behala Bokultala. We serve Black Bengal mutton. The country side goat breed is usually colored black An adult goat weights upto 6-8 Kg','[\"files-1676925273648.jpeg\"]',0,'2023-02-20 20:34:33','2023-05-19 21:28:41'),(2,1,'Test Two','testing','[\"files-1676925600620.jpeg\"]',0,'2023-02-20 20:40:00','2023-05-19 21:20:19'),(3,2,'Test Three','testing','[\"files-1676925716241.jpeg\"]',0,'2023-02-20 20:41:56','2023-05-19 21:10:16'),(4,2,'Test Four','testing','[\"files-1676925775410.jpeg\"]',0,'2023-02-20 20:42:55','2023-05-19 21:05:50'),(5,2,'ttttt','testttttt','[\"files-1676925865292.jpeg\"]',0,'2023-02-20 20:44:25','2023-05-19 21:20:32'),(6,2,'ttttttt','testttttt','[\"files-1676925996389.jpeg\"]',0,'2023-02-20 20:46:36','2023-05-19 21:20:47'),(7,7,'Desi Chicken','This is desi chicken test description. This is desi chicken test description. This is desi chicken test description. This is desi chicken test description. This is desi chicken test description. This is desi chicken test description. ','[\"files-1684527826094.png\"]',1,'2023-02-20 20:47:57','2023-05-19 20:23:46'),(8,2,'Black Bengal Mutton','This is black bengal mutton test description. This is black bengal mutton test description. This is black bengal mutton test description. This is black bengal mutton test description. This is black bengal mutton test description. This is black bengal mutton test description. ','[\"files-1684527685487.png\",\"files-1684527685488.png\"]',1,'2023-03-15 00:28:22','2023-05-19 20:21:25'),(9,2,'Mutton Keema','This is test description for mutton keema. This is test description for mutton keema. This is test description for mutton keema. This is test description for mutton keema. This is test description for mutton keema. ','[\"files-1684527593628.png\",\"files-1684527593629.png\",\"files-1684527593631.png\"]',1,'2023-03-25 10:17:14','2023-05-19 20:19:53'),(10,2,'Desi Goat Meat','This is test description for goat meat. This is test description for goat meat. This is test description for goat meat. This is test description for goat meat. This is test description for goat meat. ','[\"files-1684527969100.png\"]',1,'2023-05-19 20:26:09','2023-05-19 20:26:09'),(11,7,'Chicken Keema','This is test description for chicken keema. This is test description for chicken keema. This is test description for chicken keema. This is test description for chicken keema. This is test description for chicken keema. \r\nThis is test description for chicken keema. This is test description for chicken keema. This is test description for chicken keema. ','[\"files-1684528097680.png\"]',1,'2023-05-19 20:28:17','2023-05-19 20:28:17');
/*!40000 ALTER TABLE `tbl_products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-16 11:02:04
