-- Small Business Financial Management System
-- Database Schema: small_business_finance

CREATE DATABASE IF NOT EXISTS `small_business_finance` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `small_business_finance`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `business_name` VARCHAR(150) NULL,
  `phone` VARCHAR(30) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Revenue Table
CREATE TABLE IF NOT EXISTS `revenue` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `date` DATE NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Bank Transfer',
  `invoice_number` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_revenue_user` (`user_id`),
  INDEX `idx_revenue_date` (`date`),
  INDEX `idx_revenue_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `date` DATE NOT NULL,
  `vendor` VARCHAR(100) NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Company Card',
  `receipt_number` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_expenses_user` (`user_id`),
  INDEX `idx_expenses_date` (`date`),
  INDEX `idx_expenses_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Investments Table
CREATE TABLE IF NOT EXISTS `investments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `amount_invested` DECIMAL(12, 2) NOT NULL,
  `current_value` DECIMAL(12, 2) NOT NULL,
  `asset_type` VARCHAR(80) NOT NULL,
  `date` DATE NOT NULL,
  `expected_return_rate` DECIMAL(5, 2) DEFAULT 0.00,
  `status` ENUM('Active', 'Matured', 'Liquidated', 'Pending') NOT NULL DEFAULT 'Active',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_investments_user` (`user_id`),
  INDEX `idx_investments_status` (`status`),
  INDEX `idx_investments_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

