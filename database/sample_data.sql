USE `small_business_finance`;

INSERT INTO users (name, email, password, role, business_name, phone)
VALUES
  ('Admin User', 'admin@business.com', '$2a$10$Q6n0pE8O2N2Y0m8bGzQW3u6bVdC3Y2JdC3E8z3m1b2x4n3M2fV7O', 'admin', 'Apex Financial Systems', '+1 555-010-0001'),
  ('Sarah Jenkins', 'sarah@apex.com', '$2a$10$Q6n0pE8O2N2Y0m8bGzQW3u6bVdC3Y2JdC3E8z3m1b2x4n3M2fV7O', 'user', 'Apex Digital Studio', '+1 555-014-2234');

INSERT INTO financial_categories (user_id, type, name, description)
VALUES
  (1, 'revenue', 'Consulting', 'Professional consulting revenue'),
  (1, 'revenue', 'Subscriptions', 'Recurring subscription revenue'),
  (1, 'expense', 'Payroll', 'Employee compensation'),
  (1, 'expense', 'Rent', 'Office and workspace costs'),
  (1, 'investment', 'Equipment', 'Capital equipment investment');

INSERT INTO transactions (user_id, type, reference_id, category_id, amount, description, transaction_date)
VALUES
  (1, 'revenue', 1, 1, 18500.00, 'Consulting revenue', '2026-01-15'),
  (1, 'expense', 1, 3, 16800.00, 'Payroll expense', '2026-01-28'),
  (1, 'investment', 1, 5, 7200.00, 'Laptop investment', '2026-04-05');
