-- Adminer 4.7.1 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_persian_ci NOT NULL,
  `amount` text COLLATE utf8_persian_ci NOT NULL,
  `desc` text COLLATE utf8_persian_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_persian_ci;

INSERT INTO `files` (`id`, `name`, `amount`, `desc`) VALUES
(2,	'22328323226.pdf',	'15000',	'ok for this file');

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
  `id` text NOT NULL,
  `order_id` text NOT NULL,
  `amount` int(11) NOT NULL,
  `card_no` text NOT NULL,
  `hash_card_no` text NOT NULL,
  `date` text NOT NULL,
  `verify` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2019-05-25 18:38:42