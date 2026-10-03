const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  deactivateUser,
  getAdminItems,
  deleteAdminItem,
  getAdminClaims,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All admin routes require authentication + ADMIN role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/deactivate', deactivateUser);
router.get('/items', getAdminItems);
router.delete('/items/:id', deleteAdminItem);
router.get('/claims', getAdminClaims);

module.exports = router;
