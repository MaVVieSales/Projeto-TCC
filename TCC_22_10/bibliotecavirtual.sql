-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para bibliotecavirtual
DROP DATABASE IF EXISTS `bibliotecavirtual`;
CREATE DATABASE IF NOT EXISTS `bibliotecavirtual` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `bibliotecavirtual`;

-- Copiando estrutura para tabela bibliotecavirtual.administrador
DROP TABLE IF EXISTS `administrador`;
CREATE TABLE IF NOT EXISTS `administrador` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `senhaAdm` varchar(256) NOT NULL DEFAULT '',
  `nome` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `foto` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.administrador: ~12 rows (aproximadamente)
INSERT INTO `administrador` (`id`, `senhaAdm`, `nome`, `email`, `foto`) VALUES
	(9, '77036333413071ceee0e2cd1a16d89a9a36154b49f3e636c064a5d9f7c226a47', 'Caio Henrique Matos de Aquino', 'caio.aquino@gmail.com', NULL),
	(10, '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', 'C', 'C', NULL),
	(11, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881', '1', '1', NULL),
	(12, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'C', 'caio@@gmail.com', NULL),
	(13, '77036333413071ceee0e2cd1a16d89a9a36154b49f3e636c064a5d9f7c226a47', 'kleber', 'caio.Árnoldo@gmail.com', NULL),
	(14, '77036333413071ceee0e2cd1a16d89a9a36154b49f3e636c064a5d9f7c226a47', 'kleber', 'joao,vitor@gmail.com', NULL),
	(15, '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', '1', '2', NULL),
	(16, 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35', '1', 'texto', NULL),
	(17, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', '123', '123', NULL),
	(18, '3e8de44a9af7cacd095c19c76f058fac793ddd45beee6cab1fcb22bfcdae8fea', 'Matheus Oliveira', 'matheus@gmail.com', NULL),
	(19, '2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6', 'e', 'e@gmail.com', NULL),
	(20, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Eduarda Scaliz', 'dudascaliz@gmail.com', '/uploads/fotos/adm_20.jpg');

-- Copiando estrutura para tabela bibliotecavirtual.avaliacoes
DROP TABLE IF EXISTS `avaliacoes`;
CREATE TABLE IF NOT EXISTS `avaliacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `livro_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `estrelas` int(11) NOT NULL CHECK (`estrelas` between 1 and 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_avaliacao` (`livro_id`,`usuario_id`),
  KEY `fk_avaliacao_usuario` (`usuario_id`),
  CONSTRAINT `fk_avaliacao_livro` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_avaliacao_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.avaliacoes: ~6 rows (aproximadamente)
INSERT INTO `avaliacoes` (`id`, `livro_id`, `usuario_id`, `estrelas`, `created_at`) VALUES
	(18, 171, 27, 5, '2025-10-03 16:36:25'),
	(19, 168, 1, 1, '2025-10-03 18:22:32'),
	(20, 167, 1, 2, '2025-10-03 19:09:28'),
	(21, 171, 30, 1, '2025-10-08 13:12:36'),
	(22, 168, 30, 5, '2025-10-08 13:20:22'),
	(23, 170, 30, 3, '2025-10-08 13:20:38'),
	(24, 169, 30, 4, '2025-10-22 16:01:43');

-- Copiando estrutura para tabela bibliotecavirtual.favoritos
DROP TABLE IF EXISTS `favoritos`;
CREATE TABLE IF NOT EXISTS `favoritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `livro_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_favorito` (`livro_id`,`usuario_id`),
  KEY `fk_fav_usuario` (`usuario_id`),
  CONSTRAINT `fk_fav_livro` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fav_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.favoritos: ~5 rows (aproximadamente)
INSERT INTO `favoritos` (`id`, `livro_id`, `usuario_id`, `created_at`) VALUES
	(17, 170, 1, '2025-09-24 20:11:12'),
	(30, 168, 27, '2025-10-03 16:35:43'),
	(31, 171, 27, '2025-10-03 16:36:17'),
	(38, 171, 1, '2025-10-08 12:15:14'),
	(41, 167, 30, '2025-10-22 15:58:32'),
	(42, 170, 30, '2025-10-22 15:58:42'),
	(43, 169, 30, '2025-10-22 15:58:47');

-- Copiando estrutura para tabela bibliotecavirtual.favoritos_tcc
DROP TABLE IF EXISTS `favoritos_tcc`;
CREATE TABLE IF NOT EXISTS `favoritos_tcc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tcc_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_favoritos_tcc_tccs` (`tcc_id`),
  KEY `FK_favoritos_tcc_usuarios` (`usuario_id`),
  CONSTRAINT `FK_favoritos_tcc_tccs` FOREIGN KEY (`tcc_id`) REFERENCES `tccs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_favoritos_tcc_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.favoritos_tcc: ~4 rows (aproximadamente)
INSERT INTO `favoritos_tcc` (`id`, `tcc_id`, `usuario_id`) VALUES
	(41, 4, 27),
	(43, 4, 1),
	(83, 1, 30),
	(84, 3, 30);

-- Copiando estrutura para tabela bibliotecavirtual.livros
DROP TABLE IF EXISTS `livros`;
CREATE TABLE IF NOT EXISTS `livros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(50) NOT NULL DEFAULT '',
  `editora` varchar(50) NOT NULL DEFAULT '',
  `autor` varchar(50) NOT NULL DEFAULT '',
  `genero` varchar(50) NOT NULL DEFAULT '',
  `capa` longtext NOT NULL,
  `quantidade_total` int(11) NOT NULL DEFAULT 0,
  `quantidade_disponivel` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.livros: ~7 rows (aproximadamente)
INSERT INTO `livros` (`id`, `titulo`, `editora`, `autor`, `genero`, `capa`, `quantidade_total`, `quantidade_disponivel`) VALUES
	(167, 'Concrete Mathematics: A Foundation for Computer Sc', 'Addison-Wesley, 1994', 'Ronald L. Graham, Donald Ervin Knuth, Oren Patashn', 'Computers', 'https://books.google.com.br/books/content?id=pntQAAAAMAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72C5DcQFf0PK2Veyhk_EtmFY80Beyry0arLqj5914k7FGRDBLBKvG5CO018_k_ezEWBgCIkNQ1uug5-5LxMoEeze9R9G468GRZg9_7y2JZY-Tt_gI0LD3wzNSVNBWolI3uCd7fU', 2, 2),
	(168, 'Zen Speaks: Shouts of Nothingness', 'Anchor Books, 1994', 'Zhizhong Cai', 'Zen Buddhism', 'https://books.google.com.br/books/content?id=TN4GAAAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71ndici3wabK1r412ivKpKOwLbhomRwMR74rtD5pUh7F3-x2vJGKtFz0p8L97k-HbVf9WE2yPZ7UANSzdqHnAy8NuQ5RWRiRIuWz12Fxsa6_Z5--DSlkyb4RlAX-KC9BcRWwzGt', 2, 2),
	(169, 'How to Make a Few Billion Dollars', 'Greenleaf Book Group Press, 2024', 'Brad Jacobs', 'Business & Economics', 'https://books.google.com.br/books/content?id=SIsn0AEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE7318iSTY_KAe5sgJu3BAz2UknPZnADY3HpZIm7rnyx5iS4DlwArmAFCUrKkrcpd4AIyLV70LHkuIgYF2ycxG2u5reabE-tOB4lEUdysIRIJtUWnj0v_wDXZ3KP7pBmeUJwceU9i', 2, 2),
	(170, 'The Hunger Games: The First Book of the Hunger Gam', 'Scholastic Press, 2008', 'Suzanne Collins', 'Ficção', 'https://books.google.com.br/books/content?id=sJdUAzLUNyAC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70Ziv-i2F1SOhf6vuABJUSg8i2CjfKVhuJ_X93lIhee5MKMORRvy4a4d3D3AHwDgvKKmQVowt1cg1q2rh30VHej8NjFL1PqvvSHAlyeeV8SYrpptyMU2YaYEshN34QJgQizWgqV', 2, 2),
	(171, 'Harry Potter e a Pedra FilosofalVolume 1 de Harry', 'Rocco, 2000', 'J. K. Rowling', 'Fantasia', 'https://books.google.com.br/books/content?id=DqvrPgAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71py5SmDZvwLAXeyitly8FNRIfuzl7YxEUVUdNxkPqOjXWrHmxYluW08nF7ZJ_adyWbvShhEamzqUQh6FRZwjlcvMgQxj5XE9c_Yf-wm8ij5OMb3Yc2jU1o1WlfrjhFPPkCX8CS', 4, 3),
	(173, 'Drácula', 'Instituto Brasileiro de Cultura Ltda, 2021', 'Bram Stoker', 'Fantasia', 'https://books.google.com.br/books/content?id=pSW6zwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE707Ly-XWNNjof-NMnbmSFLw05tfC7ZSokEPY6WbPYLtCp1zTYcK3lnZfR2DAZErKbH9GqnAaz156Cxzpv9LK7Cb0ZJJ000rMO8gnP0lCVOovK6-fAORLYdym2UmV1xCxsVn8-nP', 4, 4),
	(178, 'A garota no trem', 'Editora Record, 2015', 'Paula Hawkins', 'Suspense', 'https://books.google.com.br/googlebooks/images/no_cover_thumb.gif', 5, 5);

-- Copiando estrutura para tabela bibliotecavirtual.pre_reservas
DROP TABLE IF EXISTS `pre_reservas`;
CREATE TABLE IF NOT EXISTS `pre_reservas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `livro_id` int(11) NOT NULL,
  `data_retirada_max` datetime NOT NULL,
  `data_reserva` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('aguardando','retirado','devolvido') DEFAULT 'aguardando',
  `data_retirada` datetime DEFAULT NULL,
  `data_devolucao` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_usuario` (`usuario_id`),
  KEY `FK_pre_reservas_livros` (`livro_id`),
  CONSTRAINT `FK_pre_reservas_livros` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.pre_reservas: ~10 rows (aproximadamente)
INSERT INTO `pre_reservas` (`id`, `usuario_id`, `livro_id`, `data_retirada_max`, `data_reserva`, `status`, `data_retirada`, `data_devolucao`) VALUES
	(103, 30, 167, '2025-10-29 16:21:26', '2025-10-22 13:21:03', 'devolvido', '2025-10-22 16:21:26', '2025-10-22 16:22:09'),
	(105, 30, 171, '2025-10-29 16:27:08', '2025-10-22 13:22:36', 'devolvido', '2025-10-22 16:27:08', '2025-10-25 16:27:00');

-- Copiando estrutura para tabela bibliotecavirtual.tccs
DROP TABLE IF EXISTS `tccs`;
CREATE TABLE IF NOT EXISTS `tccs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(50) NOT NULL,
  `autor` varchar(150) NOT NULL,
  `ano` varchar(50) NOT NULL,
  `curso` varchar(50) NOT NULL,
  `link` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.tccs: ~8 rows (aproximadamente)
INSERT INTO `tccs` (`id`, `titulo`, `autor`, `ano`, `curso`, `link`) VALUES
	(1, 'Projetos Desenvolvidos', 'Duda', '2021 - 2022', 'Técnico em Química', 'https://drive.google.com/file/d/1aW_MVwzXjJbKsVSMVh9HP5WVVUXfcgQB/view?usp=drive_link'),
	(2, 'Projetos Desenvolvidos 2', 'Nicole', '2021 - 2024', 'Técnico em Química', 'https://drive.google.com/file/d/1aW_MVwzXjJbKsVSMVh9HP5WVVUXfcgQB/view?usp=drive_link'),
	(3, 'Projetos Eletro', 'Mavi', '2023', 'Técnico em Eletro', 'https://drive.google.com/file/d/1aW_MVwzXjJbKsVSMVh9HP5WVVUXfcgQB/view?usp=drive_link'),
	(4, 'Projetos dev', 'Gigi', '2021 - 2022', 'Técnico em DEV', 'https://drive.google.com/file/d/1aW_MVwzXjJbKsVSMVh9HP5WVVUXfcgQB/view?usp=drive_link'),
	(5, 'Projetos Desenvolvidos 2', 'Duda', '2020 - 2021', 'Técnico em Química', 'https://drive.google.com/file/d/1aW_MVwzXjJbKsVSMVh9HP5WVVUXfcgQB/view?usp=drive_link'),
	(6, 'teste', 'Nicole', '2023', 'Técnico em Cinema', 'https://drive.google.com/file/d/1aW_MVwzXjJbKsVSMVh9HP5WVVUXfcgQB/view?usp=drive_link'),
	(7, 'eueueue', 'Gigi', 'dfjhgj', 'fgnxh', 'cncn'),
	(8, 'Projetos Eletro4', '', '2020', 'Técnico em Eletro', 'https://drive.google.com/file/d/1aW_MVwzXjJbKsVSMVh9HP5WVVUXfcgQB/view?usp=drive_link');

-- Copiando estrutura para tabela bibliotecavirtual.usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL DEFAULT '0',
  `email` varchar(150) NOT NULL DEFAULT '0',
  `senha_hash` varchar(255) NOT NULL DEFAULT '0',
  `matricula` int(11) NOT NULL DEFAULT 0,
  `foto` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela bibliotecavirtual.usuarios: ~10 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha_hash`, `matricula`, `foto`) VALUES
	(1, 'Duda Linda e Legal', 'duda@gmail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 123, 'fotos/user_1.jpeg'),
	(24, 'nicole', 'nicole@gmail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 565565656, NULL),
	(25, 'd2', 'd@com.br', '730f75dafd73e047b86acb2dbd74e75dcb93272fa084a9082848f2341aa1abb6', 1, NULL),
	(26, 'Maria Vitoria', 'maria.vitoria@gmail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 1234, NULL),
	(27, 'Matheus Oliveira', 'matheus@gmail.com.br', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 21474, 'fotos/user_27.png'),
	(28, 'e', 'aa@gmail.com', '3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea', 2, NULL),
	(29, 'e', 'ffi@gail.com', '252f10c83610ebca1a059c0bae8255eba2f95be4d1d7bcfa89d7248a82d9f111', 2, NULL),
	(30, 'Eduarda Scaliz', 'duda2@gmail.com', '46570d94c61cc921fa76ca1ab2c4cdc193e2625eab726cd231b6cc9e09e2e2c0', 1234, 'fotos/user_30.jpeg'),
	(31, 'Teste', 'teste@gmail.com', '0b6722a8adfb93540bc8b6008e2e82d9940e1f5a2c48af03e0dc04524ffecd0e', 123, NULL),
	(32, 'f', 'f@gmail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 123789, NULL),
	(33, 'Maria Vitoria', 'maria.love@gmail.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 1233, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
