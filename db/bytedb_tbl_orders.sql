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
-- Table structure for table `tbl_orders`
--

DROP TABLE IF EXISTS `tbl_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `franchise_id` int NOT NULL,
  `delevery_boy_id` int DEFAULT NULL,
  `ref_no` varchar(45) DEFAULT NULL,
  `total_price` double NOT NULL,
  `status` tinyint DEFAULT '1' COMMENT '1 = Confirmed\n2 = Completed\n3 = Canceled',
  `phone_number` varchar(45) DEFAULT NULL,
  `shipping_address` longtext,
  `billing_address` longtext,
  `name` varchar(50) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `district` varchar(45) DEFAULT NULL,
  `additional_notes` longtext,
  `pin_code` varchar(45) DEFAULT NULL,
  `delivery_date` longtext,
  `inserted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `landmark` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_orders`
--

LOCK TABLES `tbl_orders` WRITE;
/*!40000 ALTER TABLE `tbl_orders` DISABLE KEYS */;
INSERT INTO `tbl_orders` VALUES (25,44,1,NULL,'JB1025',800,1,'9620067963','44 nazrul pally mahamayatala, Bankura, West Bengal, pin code - 722139','44 nazrul pally mahamayatala, Bankura, West Bengal, pin code - 722139','Jalaj Jha','West Bengal','Bankura','','722139','{\"7\":\"14/09/2023\",\"8\":\"13/09/2023\"}','2023-09-11 21:08:03','2023-09-11 21:08:03','beside vasundhara apartment'),(26,44,1,NULL,'JB1026',250,1,'9620067963','44 nazrul pally mahamayatala, Bankura, West Bengal, pin code - 722139','44 nazrul pally mahamayatala, Bankura, West Bengal, pin code - 722139','Jalaj Jha','West Bengal','Bankura','test order','722139','{\"11\":\"17/09/2023\"}','2023-09-14 18:00:35','2023-09-14 18:00:35','beside vasundhara apartment'),(27,44,5,NULL,'JB1027',100,1,'9620067963','44 nazrul pally, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','teteteteteteetete','700084','{\"8\":\"18/09/2023\"}','2023-09-14 21:34:25','2023-09-14 21:34:25','beside vasundhara'),(28,44,1,NULL,'JB1028',350,1,'9620067963','44 nazrul, Bankura, West Bengal, pin code - 722139','44 nazrul, Bankura, West Bengal, pin code - 722139','Jalaj Jha','West Bengal','Bankura','','722139','{\"10\":\"18/09/2023\"}','2023-09-14 21:37:42','2023-09-14 21:37:42','beside'),(29,44,1,NULL,'JB1029',200,1,'9620067963','test street, Bankura, West Bengal, pin code - 722139','test street, Bankura, West Bengal, pin code - 722139','Test One','West Bengal','Bankura','test','722139','{\"9\":\"17/09/2023\"}','2023-09-14 21:57:19','2023-09-14 21:57:19','test landmark'),(30,44,5,NULL,'JB1030',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Jalaj Jha','West Bengal','South 24 Parganas','dfdsfdsfdsfsfsfsf','700084','{\"8\":\"18/09/2023\"}','2023-09-14 22:09:22','2023-09-14 22:09:22','beside vasundhara apt'),(31,44,5,NULL,'JB1031',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 22:16:51','2023-09-14 22:16:51','beside vasundhara apt'),(32,44,5,NULL,'JB1032',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','test','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:19:29','2023-09-14 23:19:29','beside vasundhara apt'),(33,44,5,NULL,'JB1033',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:26:10','2023-09-14 23:26:10','beside vasundhara apt'),(34,44,5,NULL,'JB1034',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:29:28','2023-09-14 23:29:28','beside vasundhara apt'),(35,44,5,NULL,'JB1035',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:34:32','2023-09-14 23:34:32','beside vasundhara apt'),(36,44,5,NULL,'JB1036',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:35:37','2023-09-14 23:35:37','beside vasundhara apt'),(37,44,5,NULL,'JB1037',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:40:44','2023-09-14 23:40:44','beside vasundhara apt'),(38,44,5,NULL,'JB1038',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:41:58','2023-09-14 23:41:58','beside vasundhara apt'),(39,44,5,NULL,'JB1039',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:54:22','2023-09-14 23:54:22','beside vasundhara apt'),(40,44,5,46,'JB1040',100,1,'9620067963','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','44 nazrul pally mahamayatala, South 24 Parganas, West Bengal, pin code - 700084','Test One','West Bengal','South 24 Parganas','','700084','{\"8\":\"18/09/2023\"}','2023-09-14 23:57:24','2023-09-15 00:15:48','beside vasundhara apt');
/*!40000 ALTER TABLE `tbl_orders` ENABLE KEYS */;
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
