const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLost,
      totalFound,
      pendingClaims,
      resolvedItems,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'ADMIN' } }),
      Item.countDocuments({ type: 'LOST' }),
      Item.countDocuments({ type: 'FOUND' }),
      Claim.countDocuments({ status: 'PENDING' }),
      Item.countDocuments({ status: 'RESOLVED' }),
    ]);

    res.json({ totalUsers, totalLost, totalFound, pendingClaims, resolvedItems });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: { $ne: 'ADMIN' } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { universityId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, currentPage: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// ─── PATCH /api/admin/users/:id/deactivate ────────────────────────────────────
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot deactivate an admin account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: user.isActive ? 'User reactivated.' : 'User deactivated.',
      isActive: user.isActive,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found.' });
    }
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Failed to update user status.' });
  }
};

// ─── GET /api/admin/items ──────────────────────────────────────────────────────
const getAdminItems = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type && ['LOST', 'FOUND'].includes(type)) filter.type = type;
    if (status && ['ACTIVE', 'RESOLVED'].includes(status)) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('reportedBy', 'name email universityId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments(filter),
    ]);

    res.json({ items, total, currentPage: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('Admin get items error:', error);
    res.status(500).json({ message: 'Failed to fetch items.' });
  }
};

// ─── DELETE /api/admin/items/:id ──────────────────────────────────────────────
const deleteAdminItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Also remove related claims
    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();

    res.json({ message: 'Item and related claims deleted.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Admin delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item.' });
  }
};

// ─── GET /api/admin/claims ─────────────────────────────────────────────────────
const getAdminClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('item', 'title category type location')
        .populate('claimedBy', 'name email universityId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Claim.countDocuments(filter),
    ]);

    res.json({ claims, total, currentPage: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('Admin get claims error:', error);
    res.status(500).json({ message: 'Failed to fetch claims.' });
  }
};

module.exports = { getStats, getUsers, deactivateUser, getAdminItems, deleteAdminItem, getAdminClaims };
