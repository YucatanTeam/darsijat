-- Adminer 4.7.1 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `files_id` int(11) unsigned NOT NULL,
  `tag` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `files_id` (`files_id`),
  CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`files_id`) REFERENCES `files` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `chat_id` int(10) unsigned NOT NULL,
  `files_id` int(11) unsigned NOT NULL,
  `status` tinyint(4) NOT NULL,
  `details` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `files_id` (`files_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`files_id`) REFERENCES `files` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2019-05-24 18:40:48