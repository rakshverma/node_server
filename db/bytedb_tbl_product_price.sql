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
-- Table structure for table `tbl_product_price`
--

DROP TABLE IF EXISTS `tbl_product_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_product_price` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `role_id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `added_by` int NOT NULL,
  `quantity_wise_price` longtext,
  `is_available` tinyint DEFAULT '0',
  `delevery_days` text,
  `inserted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_product_price`
--

LOCK TABLES `tbl_product_price` WRITE;
/*!40000 ALTER TABLE `tbl_product_price` DISABLE KEYS */;
INSERT INTO `tbl_product_price` VALUES (1,7,1,1,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"200\"},{\"quantity\":\"2\",\"unit\":\"kg\",\"price\":\"300\"},{\"quantity\":\"3\",\"unit\":\"kg\",\"price\":\"400\"},{\"quantity\":\"4\",\"unit\":\"kg\",\"price\":\"500\"}]',1,'[\"Monday\",\"Tuesday\",\"Thursday\"]','2023-03-12 01:37:30','2023-08-22 20:08:15'),(2,6,1,1,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"100\"},{\"quantity\":\"2\",\"unit\":\"kg\",\"price\":\"200\"},{\"quantity\":\"3\",\"unit\":\"kg\",\"price\":\"300\"}]',1,'[\"Monday\",\"Tuesday\"]','2023-03-14 19:54:18','2023-03-28 00:46:17'),(3,9,1,1,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"200\",\"shipping\":\"10.40\"},{\"quantity\":\"2\",\"unit\":\"kg\",\"price\":\"300\",\"shipping\":\"10\"},{\"quantity\":\"500\",\"unit\":\"gm\",\"price\":\"100\",\"shipping\":\"20\"}]',1,'[\"Sunday\",\"Monday\",\"Tuesday\"]','2023-03-25 10:21:17','2023-04-07 02:11:18'),(4,8,2,5,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"100\"}]',0,'[\"Monday\",\"Tuesday\"]','2023-03-28 00:43:36','2023-03-28 00:43:36'),(5,7,2,8,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"300\"}]',0,'[\"Tuesday\",\"Wednesday\",\"Thursday\"]','2023-04-03 22:05:28','2023-04-03 22:05:28'),(6,9,2,7,1,1,'[{\"quantity\":\"2\",\"unit\":\"kg\",\"price\":\"200\"}]',0,'[\"Monday\",\"Tuesday\"]','2023-04-03 22:06:26','2023-04-03 22:06:26'),(7,11,1,1,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"250\",\"shipping\":\"20\"},{\"quantity\":\"2\",\"unit\":\"kg\",\"price\":\"400\",\"shipping\":\"10\"},{\"quantity\":\"500\",\"unit\":\"gm\",\"price\":\"100\",\"shipping\":\"30\"}]',1,'[\"Sunday\"]','2023-05-19 21:23:11','2023-08-22 21:05:35'),(8,10,1,1,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"350\",\"shipping\":\"30\"},{\"quantity\":\"2\",\"unit\":\"kg\",\"price\":\"600\",\"shipping\":\"20\"},{\"quantity\":\"500\",\"unit\":\"gm\",\"price\":\"200\",\"shipping\":\"40\"}]',1,'[\"Monday\",\"Tuesday\"]','2023-05-19 21:24:23','2023-08-22 21:17:16'),(9,8,1,1,1,1,'[{\"quantity\":\"1\",\"unit\":\"kg\",\"price\":\"300\",\"shipping\":\"30\"},{\"quantity\":\"2\",\"unit\":\"kg\",\"price\":\"400\",\"shipping\":\"20\"},{\"quantity\":\"500\",\"unit\":\"gm\",\"price\":\"200\",\"shipping\":\"30\"}]',1,'[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\"]','2023-05-19 21:25:46','2023-05-19 21:25:46');
/*!40000 ALTER TABLE `tbl_product_price` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-16 11:02:05
