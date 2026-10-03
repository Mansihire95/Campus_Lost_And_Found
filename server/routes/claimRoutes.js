const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getClaimsForItem,
  approveClaim,
  rejectClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All claim routes require authentication

router.post('/', createClaim);
router.get('/my', getMyClaims);
router.get('/item/:itemId', getClaimsForItem);
router.patch('/:id/approve', approveClaim);
router.patch('/:id/reject', rejectClaim);

module.exports = router;
