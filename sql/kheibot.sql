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
  `descr` text COLLATE utf8_persian_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_persian_ci;

INSERT INTO `files` (`id`, `name`, `amount`, `descr`) VALUES
(1,	'upload_f5dfa676779fcfab8d74ddcd0a1bf5f1.pdf',	140000,	'جزوه جبرخطی فصل ۳'),
(2,	'upload_a56797db2bf332bd5aadc36d604da60f.pdf',	150000,	'جزوه مربوط به درس هدیه های آسمان فصل یک');

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
(1,	1,	'جبرخطی'),
(2,	1,	'دوم متوسطه'),
(3,	2,	'متوسطه اول'),
(4,	2,	' هشتم'),
(5,	2,	' هدیه های آسمان');

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
(0,	0,	'bc1510e9a23052dd8cedff6bdffe08a8',	'1.398183529.23118974371',	140000,	'',	'',	'',	0);

-- 2019-05-27 04:52:23