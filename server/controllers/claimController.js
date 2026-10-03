const Claim = require('../models/Claim');
const Item = require('../models/Item');

// ─── POST /api/claims ─────────────────────────────────────────────────────────
const createClaim = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({ message: 'Item ID and message are required.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.status === 'RESOLVED') {
      return res.status(400).json({ message: 'This item has already been resolved.' });
    }

    // Cannot claim your own reported item
    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim an item you reported.' });
    }

    // Check for duplicate claim
    const existingClaim = await Claim.findOne({ item: itemId, claimedBy: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim for this item.' });
    }

    const claim = await Claim.create({
      item: itemId,
      claimedBy: req.user._id,
      message,
    });

    const populated = await claim.populate([
      { path: 'item', select: 'title category type' },
      { path: 'claimedBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Failed to submit claim.' });
  }
};

// ─── GET /api/claims/my ───────────────────────────────────────────────────────
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id })
      .populate('item', 'title category type location date image status')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({ message: 'Failed to fetch your claims.' });
  }
};

// ─── GET /api/claims/item/:itemId ──────────────────────────────────────────────
// Only the item reporter can view claims for their item
const getClaimsForItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view claims for this item.' });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimedBy', 'name universityId role')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Get item claims error:', error);
    res.status(500).json({ message: 'Failed to fetch claims.' });
  }
};

// ─── PATCH /api/claims/:id/approve ────────────────────────────────────────────
const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const item = claim.item;

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to approve this claim.' });
    }

    if (claim.status !== 'PENDING') {
      return res.status(400).json({ message: 'This claim has already been processed.' });
    }

    // Approve this claim
    claim.status = 'APPROVED';
    await claim.save();

    // Mark item as resolved
    item.status = 'RESOLVED';
    await item.save();

    // Reject all other pending claims for the same item
    await Claim.updateMany(
      { item: item._id, _id: { $ne: claim._id }, status: 'PENDING' },
      { status: 'REJECTED' }
    );

    res.json({ message: 'Claim approved. Item marked as resolved.', claim });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Claim not found.' });
    }
    console.error('Approve claim error:', error);
    res.status(500).json({ message: 'Failed to approve claim.' });
  }
};

// ─── PATCH /api/claims/:id/reject ─────────────────────────────────────────────
const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    const item = claim.item;

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to reject this claim.' });
    }

    if (claim.status !== 'PENDING') {
      return res.status(400).json({ message: 'This claim has already been processed.' });
    }

    claim.status = 'REJECTED';
    await claim.save();

    res.json({ message: 'Claim rejected.', claim });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Claim not found.' });
    }
    console.error('Reject claim error:', error);
    res.status(500).json({ message: 'Failed to reject claim.' });
  }
};

module.exports = { createClaim, getMyClaims, getClaimsForItem, approveClaim, rejectClaim };
