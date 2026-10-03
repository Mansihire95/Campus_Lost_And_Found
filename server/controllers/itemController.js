const Item = require('../models/Item');

// ─── GET /api/items ────────────────────────────────────────────────────────────
// Query params: type, category, status, search, location, page, limit, sort
const getItems = async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      search,
      location,
      page = 1,
      limit = 12,
      sort = 'newest',
    } = req.query;

    const filter = {};

    if (type && ['LOST', 'FOUND'].includes(type)) filter.type = type;
    if (category) filter.category = category;
    if (status && ['ACTIVE', 'RESOLVED'].includes(status)) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('reportedBy', 'name role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments(filter),
    ]);

    res.json({
      items,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Failed to fetch items.' });
  }
};

// ─── GET /api/items/:id ────────────────────────────────────────────────────────
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'reportedBy',
      'name role universityId'
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Find possible matches (same category, similar location)
    const matches = await Item.find({
      _id: { $ne: item._id },
      type: item.type === 'LOST' ? 'FOUND' : 'LOST',
      category: item.category,
      status: 'ACTIVE',
      location: { $regex: item.location.split(' ')[0], $options: 'i' },
    })
      .limit(3)
      .select('title category location date image type');

    res.json({ item, possibleMatches: matches });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Failed to fetch item.' });
  }
};

// ─── POST /api/items/lost ─────────────────────────────────────────────────────
const createLostItem = async (req, res) => {
  try {
    const { title, category, description, location, date, time, color, additionalDetails } = req.body;

    if (!title || !category || !description || !location || !date) {
      return res.status(400).json({ message: 'Title, category, description, location, and date are required.' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await Item.create({
      type: 'LOST',
      title,
      category,
      description,
      location,
      date,
      time,
      color,
      additionalDetails,
      image,
      reportedBy: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    console.error('Create lost item error:', error);
    res.status(500).json({ message: 'Failed to create lost item report.' });
  }
};

// ─── POST /api/items/found ────────────────────────────────────────────────────
const createFoundItem = async (req, res) => {
  try {
    const { title, category, description, location, date, time, color, additionalDetails } = req.body;

    if (!title || !category || !description || !location || !date) {
      return res.status(400).json({ message: 'Title, category, description, location, and date are required.' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await Item.create({
      type: 'FOUND',
      title,
      category,
      description,
      location,
      date,
      time,
      color,
      additionalDetails,
      image,
      reportedBy: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    console.error('Create found item error:', error);
    res.status(500).json({ message: 'Failed to create found item report.' });
  }
};

// ─── PUT /api/items/:id ───────────────────────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Only reporter or admin can edit
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to edit this item.' });
    }

    if (item.status === 'RESOLVED') {
      return res.status(400).json({ message: 'Cannot edit a resolved item.' });
    }

    const { title, category, description, location, date, time, color, additionalDetails } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : item.image;

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { title, category, description, location, date, time, color, additionalDetails, image },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item.' });
  }
};

// ─── DELETE /api/items/:id ────────────────────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this item.' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item.' });
  }
};

// ─── PATCH /api/items/:id/resolve ─────────────────────────────────────────────
const resolveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to resolve this item.' });
    }

    item.status = 'RESOLVED';
    await item.save();

    res.json({ message: 'Item marked as resolved.', item });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Item not found.' });
    }
    console.error('Resolve item error:', error);
    res.status(500).json({ message: 'Failed to resolve item.' });
  }
};

// ─── GET /api/items/my ────────────────────────────────────────────────────────
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Failed to fetch your items.' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createLostItem,
  createFoundItem,
  updateItem,
  deleteItem,
  resolveItem,
  getMyItems,
};
