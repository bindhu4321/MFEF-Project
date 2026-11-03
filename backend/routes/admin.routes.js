const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Protect all admin routes with JWT and admin role authorization
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;

