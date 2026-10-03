const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createLostItem,
  createFoundItem,
  updateItem,
  deleteItem,
  resolveItem,
  getMyItems,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public
router.get('/', getItems);
router.get('/my', protect, getMyItems);
router.get('/:id', getItemById);

// Protected
router.post('/lost', protect, upload.single('image'), createLostItem);
router.post('/found', protect, upload.single('image'), createFoundItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);
router.patch('/:id/resolve', protect, resolveItem);

module.exports = router;
