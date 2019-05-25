-- Adminer 4.7.1 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_persian_ci NOT NULL,
  `amount` int(11) NOT NULL,
  `desc` text COLLATE utf8_persian_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_persian_ci;


DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `files_id` int(11) unsigned NOT NULL,
  `tag` text CHARACTER SET utf8 COLLATE utf8_persian_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `files_id` (`files_id`),
  CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`files_id`) REFERENCES `files` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `status` int(11) NOT NULL,
  `track_id` int(11) NOT NULL,
  `id` text CHARACTER SET utf8 COLLATE utf8_persian_ci NOT NULL,
  `order_id` text CHARACTER SET utf8 COLLATE utf8_persian_ci NOT NULL,
  `amount` int(11) NOT NULL,
  `card_no` text CHARACTER SET utf8 COLLATE utf8_persian_ci NOT NULL,
  `hash_card_no` text CHARACTER SET utf8 COLLATE utf8_persian_ci NOT NULL,
  `date` text CHARACTER SET utf8 COLLATE utf8_persian_ci NOT NULL,
  `verify` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2019-05-25 21:58:00