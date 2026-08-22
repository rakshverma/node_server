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
-- Table structure for table `tbl_order_details`
--

DROP TABLE IF EXISTS `tbl_order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` varchar(45) NOT NULL,
  `shipping_cost` float DEFAULT NULL,
  `price` float DEFAULT NULL,
  `unit` varchar(45) DEFAULT NULL,
  `count` int DEFAULT NULL,
  `delivery_date` varchar(45) DEFAULT NULL,
  `delivery_status` tinyint DEFAULT '1' COMMENT '1 =  processing (by default on order place)\n2 = on the way\n3 = delivered\n4 = canceled',
  `delivery_boy_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_order_details`
--

LOCK TABLES `tbl_order_details` WRITE;
/*!40000 ALTER TABLE `tbl_order_details` DISABLE KEYS */;
INSERT INTO `tbl_order_details` VALUES (36,25,7,'1',NULL,200,'kg',1,'14/09/2023',1,NULL),(37,25,8,'1',NULL,300,'kg',2,'13/09/2023',1,NULL),(38,26,11,'1',NULL,250,'kg',1,'17/09/2023',1,NULL),(39,27,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(40,28,10,'1',NULL,350,'kg',1,'18/09/2023',1,NULL),(41,29,9,'1',NULL,200,'kg',1,'17/09/2023',1,NULL),(42,30,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(43,31,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(44,32,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(45,33,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(46,34,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(47,35,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(48,36,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(49,37,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(50,38,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(51,39,8,'1',NULL,100,'kg',1,'18/09/2023',1,NULL),(52,40,8,'1',NULL,100,'kg',1,'18/09/2023',3,46);
/*!40000 ALTER TABLE `tbl_order_details` ENABLE KEYS */;
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
