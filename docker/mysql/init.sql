CREATE DATABASE IF NOT EXISTS bird CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 权限初始化（仅用于容器内可用用户）
CREATE USER IF NOT EXISTS 'bird_user'@'%' IDENTIFIED BY 'bird_pass';
GRANT ALL PRIVILEGES ON bird.* TO 'bird_user'@'%';
FLUSH PRIVILEGES;
