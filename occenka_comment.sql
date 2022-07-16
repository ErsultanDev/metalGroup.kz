CREATE TABLE IF NOT EXISTS `ocenka_comment` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `date` int(10) unsigned NOT NULL,
  `comment_id` mediumint(8) unsigned NOT NULL,
  `ip` int(10) unsigned NOT NULL,
  `ocenka` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1;