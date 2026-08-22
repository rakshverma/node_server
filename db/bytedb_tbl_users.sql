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
-- Table structure for table `tbl_users`
--

DROP TABLE IF EXISTS `tbl_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `email` varchar(60) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `phone_number` varchar(12) DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `added_by` int DEFAULT NULL,
  `inserted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_users`
--

LOCK TABLES `tbl_users` WRITE;
/*!40000 ALTER TABLE `tbl_users` DISABLE KEYS */;
INSERT INTO `tbl_users` VALUES (1,1,'jalajjha9@gmail.com','$2a$10$WyVtLflZ4LfJpW4w7RA3le.6l/2nP42HRHRWNR7rPFah4yAxQ8HBa','Jalaj Jha D','9620067963',1,NULL,'2023-02-04 21:18:51','2023-03-27 18:25:21'),(5,2,'jalaj.jha1@gmail.com','test123','Franchise One','9620067961',1,1,'2023-03-24 23:26:58','2023-03-27 18:20:40'),(6,2,'jalaj.jha2@gmail.com','test123','Jalaj Jha','9620067962',1,1,'2023-03-24 23:41:20','2023-03-27 18:20:40'),(7,2,'jalaj.jha5@gmail.com','test123','Jalaj Jhaaa','9620067965',1,1,'2023-03-25 10:31:55','2023-03-27 18:20:40'),(8,2,'jalaj.jha6@gmail.com','test123','Jalaj Jha','9620067964',1,1,'2023-03-25 18:38:28','2023-03-26 20:12:00'),(9,3,'jalaj.jha10@gmail.com','$2a$10$IBj4ohRwJBxkAto/QLlm5uawoEmLLB53OaHpGvu12ulGC1fudx4Gq','Delivery Boy One','9620067969',1,1,'2023-03-26 20:24:17','2023-03-26 20:24:17'),(44,4,'testone@yopmail.com','$2a$10$MwLIUyBDBreODRb7wzcK1uedcYPwjqrKOonzn0XoWnaVYPEFfe4mq','Test One','9620067963',1,NULL,'2023-09-11 13:12:12','2023-09-11 13:12:12'),(46,3,'deliveryboy2@yopmail.com','$2a$10$mus5B7zim3nTkAuFZdYhOO.7/Ya3OwyITf5EH6O8H.1jkBAtW9t22','Delivery Boy Two','3444545454',1,1,'2023-09-15 00:08:45','2023-09-15 00:08:45');
/*!40000 ALTER TABLE `tbl_users` ENABLE KEYS */;
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
