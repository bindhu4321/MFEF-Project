const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'bindhu',
    database: process.env.DB_NAME || 'small_business_finance',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true
  });

  try {
    console.log('[Seed] Seeding database...');

    // Clear existing records to ensure fresh clean state
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE revenue');
    await pool.query('TRUNCATE TABLE expenses');
    await pool.query('TRUNCATE TABLE investments');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // Passwords hashed with bcrypt
    const adminHash = await bcrypt.hash('adminPassword123!', 10);
    const userHash = await bcrypt.hash('userPassword123!', 10);

    // Insert Users
    const [adminRes] = await pool.query(
      `INSERT INTO users (name, email, password, role, business_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Admin User', 'admin@business.com', adminHash, 'admin', 'Apex Financial Systems', '+1 555-010-0001']
    );

    const [userRes1] = await pool.query(
      `INSERT INTO users (name, email, password, role, business_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Sarah Jenkins', 'sarah@apex.com', userHash, 'user', 'Apex Digital Studio', '+1 555-014-2234']
    );

    const [userRes2] = await pool.query(
      `INSERT INTO users (name, email, password, role, business_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['David Vance', 'david@vancetech.io', userHash, 'user', 'Vance Tech Logistics', '+1 555-018-8833']
    );

    const sarahId = userRes1.insertId;
    const davidId = userRes2.insertId;

    // Sarah's Revenue records: [title, amount, category, date, payment_method, invoice_number, notes]
    const sarahRevenues = [
      ['Enterprise Cloud Migration', 18500.00, 'Consulting', '2026-01-15', 'Bank Transfer', 'INV-2026-001', 'Q1 Cloud architecture project phase 1'],
      ['Monthly SaaS Subscriptions - Jan', 12450.00, 'Subscriptions', '2026-01-30', 'Stripe', 'INV-2026-002', 'Automated recurring platform billing'],
      ['Custom Mobile App Development', 22000.00, 'Development', '2026-02-10', 'Bank Transfer', 'INV-2026-003', 'Deliverable milestone 1 for FinCorp'],
      ['Monthly SaaS Subscriptions - Feb', 13100.00, 'Subscriptions', '2026-02-28', 'Stripe', 'INV-2026-004', 'Automated recurring platform billing'],
      ['Cybersecurity Audit Retainer', 8500.00, 'Security', '2026-03-05', 'Bank Transfer', 'INV-2026-005', 'Annual network vulnerability assessment'],
      ['Monthly SaaS Subscriptions - Mar', 14200.00, 'Subscriptions', '2026-03-25', 'Stripe', 'INV-2026-006', 'Monthly tier upgrade subscriptions'],
      ['UI/UX Redesign Contract', 16000.00, 'Design', '2026-04-12', 'Bank Transfer', 'INV-2026-007', 'Website and portal redesign sprint'],
      ['Monthly SaaS Subscriptions - Apr', 14800.00, 'Subscriptions', '2026-04-30', 'Stripe', 'INV-2026-008', 'Enterprise seats billing'],
      ['E-Commerce Backend Integration', 19500.00, 'Development', '2026-05-18', 'Bank Transfer', 'INV-2026-009', 'Shopify Plus custom checkout API'],
      ['DevOps Maintenance Retainer', 9000.00, 'Maintenance', '2026-06-10', 'Credit Card', 'INV-2026-010', 'Q2 Dedicated SRE retainer'],
      ['Monthly SaaS Subscriptions - Jun', 15600.00, 'Subscriptions', '2026-06-30', 'Stripe', 'INV-2026-011', 'Mid-year subscriber renewals'],
      ['AI Model Training Workshop', 11500.00, 'Training', '2026-07-20', 'Bank Transfer', 'INV-2026-012', 'Corporate AI enablement for client team'],
      ['Monthly SaaS Subscriptions - Jul', 16200.00, 'Subscriptions', '2026-07-31', 'Stripe', 'INV-2026-013', 'Platform tier renewals'],
      ['System Performance Optimization', 14000.00, 'Consulting', '2026-08-15', 'Bank Transfer', 'INV-2026-014', 'Postgres and Redis cache optimizations'],
      ['Monthly SaaS Subscriptions - Aug', 17000.00, 'Subscriptions', '2026-08-31', 'Stripe', 'INV-2026-015', 'Platform subscription growth'],
      ['Annual Software Licensing Fee', 32000.00, 'Licensing', '2026-09-10', 'Wire Transfer', 'INV-2026-016', 'Healthcare analytics on-prem license'],
      ['Monthly SaaS Subscriptions - Sep', 17500.00, 'Subscriptions', '2026-09-30', 'Stripe', 'INV-2026-017', 'Active recurring ARR payments'],
      ['Cloud Infrastructure Automation', 21000.00, 'Consulting', '2026-10-15', 'Bank Transfer', 'INV-2026-018', 'Terraform and Kubernetes infrastructure build'],
      ['Monthly SaaS Subscriptions - Oct', 18200.00, 'Subscriptions', '2026-10-31', 'Stripe', 'INV-2026-019', 'Enterprise tier renewals']
    ];

    for (const r of sarahRevenues) {
      await pool.query(
        `INSERT INTO revenue (user_id, title, amount, category, date, payment_method, invoice_number, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sarahId, ...r]
      );
    }

    // Sarah's Expense records: [title, amount, category, date, vendor, payment_method, receipt_number, notes]
    const sarahExpenses = [
      ['Commercial Office Lease - Jan', 4500.00, 'Rent', '2026-01-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-101', 'Monthly prime downtown studio lease'],
      ['Engineering Team Payroll - Jan', 16800.00, 'Payroll', '2026-01-28', 'Apex Payroll Corp', 'Direct Deposit', 'REC-2026-102', 'Full-time software engineers and QA salaries'],
      ['AWS Cloud Infrastructure - Jan', 2150.00, 'Cloud Services', '2026-01-31', 'Amazon Web Services', 'Company Card', 'REC-2026-103', 'EC2, RDS, and S3 hosting services'],
      ['Commercial Office Lease - Feb', 4500.00, 'Rent', '2026-02-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-104', 'Monthly studio lease'],
      ['Engineering Team Payroll - Feb', 16800.00, 'Payroll', '2026-02-28', 'Apex Payroll Corp', 'Direct Deposit', 'REC-2026-105', 'Core team monthly payroll'],
      ['Google Workspace & GitHub Tools', 850.00, 'Software', '2026-02-15', 'Google / Microsoft', 'Company Card', 'REC-2026-106', 'Dev tools and productivity suite'],
      ['Digital Marketing & Search Ads', 3400.00, 'Marketing', '2026-03-12', 'Google Ads', 'Company Card', 'REC-2026-107', 'Q1 targeted B2B Google & LinkedIn campaigns'],
      ['Engineering Team Payroll - Mar', 17200.00, 'Payroll', '2026-03-28', 'Apex Payroll Corp', 'Direct Deposit', 'REC-2026-108', 'Payroll plus performance bonuses'],
      ['Commercial Office Lease - Mar', 4500.00, 'Rent', '2026-03-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-109', 'Monthly studio lease'],
      ['High-End M3 Max Developer Laptops', 7200.00, 'Equipment', '2026-04-05', 'Apple Store', 'Credit Card', 'REC-2026-110', '2x developer workstations'],
      ['Legal & Compliance Advisory', 2600.00, 'Legal', '2026-04-20', 'Morrison & Partners', 'Bank Transfer', 'REC-2026-111', 'IP patent filing and contract drafting'],
      ['Commercial Office Lease - Apr', 4500.00, 'Rent', '2026-04-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-112', 'Monthly studio lease'],
      ['Engineering Team Payroll - Apr', 17200.00, 'Payroll', '2026-04-28', 'Apex Payroll Corp', 'Direct Deposit', 'REC-2026-113', 'Full team payroll'],
      ['AWS Cloud Infrastructure - May', 2340.00, 'Cloud Services', '2026-05-31', 'Amazon Web Services', 'Company Card', 'REC-2026-114', 'Multi-region failover cluster'],
      ['Commercial Office Lease - May', 4500.00, 'Rent', '2026-05-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-115', 'Monthly studio lease'],
      ['Engineering Team Payroll - Jun', 17500.00, 'Payroll', '2026-06-28', 'Apex Payroll Corp', 'Direct Deposit', 'REC-2026-116', 'Mid-year payroll'],
      ['Accounting & Tax Filing Services', 3100.00, 'Accounting', '2026-07-15', 'Deloitte Advisory', 'Bank Transfer', 'REC-2026-117', 'CPA quarterly filing and audit prep'],
      ['Commercial Office Lease - Jul', 4500.00, 'Rent', '2026-07-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-118', 'Monthly studio lease'],
      ['Engineering Team Payroll - Jul', 17500.00, 'Payroll', '2026-07-28', 'Apex Payroll Corp', 'Direct Deposit', 'REC-2026-119', 'Core team payroll'],
      ['Commercial Office Lease - Aug', 4500.00, 'Rent', '2026-08-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-120', 'Monthly studio lease'],
      ['Marketing Campaign & Sponsorships', 4800.00, 'Marketing', '2026-09-18', 'TechCon Events', 'Credit Card', 'REC-2026-121', 'Tech summit booth and sponsor passes'],
      ['Commercial Office Lease - Sep', 4500.00, 'Rent', '2026-09-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-122', 'Monthly studio lease'],
      ['Commercial Office Lease - Oct', 4500.00, 'Rent', '2026-10-02', 'Skyline Properties', 'Bank Transfer', 'REC-2026-123', 'Monthly studio lease'],
      ['Engineering Team Payroll - Oct', 18000.00, 'Payroll', '2026-10-28', 'Apex Payroll Corp', 'Direct Deposit', 'REC-2026-124', 'Core development payroll with new hire']
    ];

    for (const e of sarahExpenses) {
      await pool.query(
        `INSERT INTO expenses (user_id, title, amount, category, date, vendor, payment_method, receipt_number, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sarahId, ...e]
      );
    }

    // Sarah's Investments: [title, amount_invested, current_value, asset_type, date, expected_return_rate, status, notes]
    const sarahInvestments = [
      ['Vanguard S&P 500 Index Fund (VOO)', 45000.00, 52400.00, 'Index Fund / Stocks', '2026-01-10', 12.50, 'Active', 'Long-term corporate reserve treasury investment'],
      ['Local Commercial Tech Park REIT', 30000.00, 32800.00, 'Real Estate', '2026-02-15', 8.20, 'Active', 'Quarterly dividend yielding real estate trust'],
      ['On-Premise GPU Server Cluster', 25000.00, 21500.00, 'Equipment & Tech', '2026-03-20', 15.00, 'Active', 'Dedicated deep learning training hardware cluster'],
      ['US 6-Month Treasury Bills', 50000.00, 51350.00, 'Government Bonds', '2026-04-01', 5.40, 'Matured', 'Low-risk cash reserve hedge'],
      ['Cybersecurity Early-Stage Venture Note', 20000.00, 26000.00, 'Venture Capital', '2026-05-10', 25.00, 'Active', 'Strategic equity partner investment']
    ];

    for (const inv of sarahInvestments) {
      await pool.query(
        `INSERT INTO investments (user_id, title, amount_invested, current_value, asset_type, date, expected_return_rate, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sarahId, ...inv]
      );
    }

    // David's sample records for multi-user segregation testing
    await pool.query(
      `INSERT INTO revenue (user_id, title, amount, category, date, payment_method, invoice_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [davidId, 'Fleet Logistics Software Tier 1', 14200.00, 'Software', '2026-03-10', 'Bank Transfer', 'INV-D-01', 'Logistics route optimization SaaS']
    );

    await pool.query(
      `INSERT INTO expenses (user_id, title, amount, category, date, vendor, payment_method, receipt_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [davidId, 'Warehouse Server Colocation', 3200.00, 'Hosting', '2026-03-15', 'Rackspace', 'Credit Card', 'REC-D-01', 'Monthly dedicated rack space']
    );

    await pool.query(
      `INSERT INTO investments (user_id, title, amount_invested, current_value, asset_type, date, expected_return_rate, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [davidId, 'Logistics Warehouse Expansion Fund', 60000.00, 64500.00, 'Real Estate', '2026-02-01', 9.50, 'Active', 'Warehouse expansion participation']
    );

    console.log('[Seed] Database seeded successfully!');
    console.log('--- Admin Account ---');
    console.log('Email: admin@business.com | Password: adminPassword123!');
    console.log('--- User Account 1 ---');
    console.log('Email: sarah@apex.com | Password: userPassword123!');
    console.log('--- User Account 2 ---');
    console.log('Email: david@vancetech.io | Password: userPassword123!');

    await pool.end();
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
}

seed();
