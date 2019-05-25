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

INSERT INTO `tags` (`id`, `files_id`, `tag`) VALUES
(6,	2,	'دوره متوسطه'),
(7,	2,	'یازدهم'),
(8,	2,	'انسانی');

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

INSERT INTO `transactions` (`status`, `track_id`, `id`, `order_id`, `amount`, `card_no`, `hash_card_no`, `date`, `verify`) VALUES
(0,	0,	'4e8e60773606f1cdef5c01b9bf59e098',	'2.23.48656446924',	15000,	'',	'',	'',	0),
(0,	0,	'bb3c95ede22628012e3f5b4a3ae14c92',	'2.23.11115277595',	15000,	'',	'',	'',	0),
(0,	0,	'463610a40163ce6cf994ffaeda377fca',	'2.23.21059532830',	15000,	'',	'',	'',	0),
(0,	0,	'a3be0a009ee60b1b173206559e0fdc5a',	'2.23.10856972725',	15000,	'',	'',	'',	0),
(0,	0,	'6a14fef0323814868d911e9e7ef83592',	'2.23.15982357567',	15000,	'',	'',	'',	0),
(0,	0,	'e2918e3bec808231785b12d5cc3fe833',	'2.23.54553941582',	15000,	'',	'',	'',	0),
(100,	61342,	'ec671f0ed64f234116018b8c6cf6c3bf',	'2.23.14447666030',	15000,	'123456******1234',	'',	'1558912601',	1);

-- 2019-05-25 20:17:22