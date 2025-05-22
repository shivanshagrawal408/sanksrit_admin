const express = require('express');
const router = express.Router();
const BookCategory = require('../../models/BookCategory');
const BookName = require('../../models/BookName');
const BookChapter = require('../../models/BookChapter');
const BookContent = require('../../models/BookContent');

// Get all categories
router.get('/category', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const categories = await BookCategory.find()
            .select('id name cover_image')
            .sort({ id: 1 })
            .skip(skip)
            .limit(limit);

        const total = await BookCategory.countDocuments();

        res.json({
            success: true,
            data: categories,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// Get books by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = await BookCategory.findOne({ id: req.params.categoryId });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const books = await BookName.find({ category: category._id })
            .select('id name book_image')
            .sort({ id: 1 })
            .skip(skip)
            .limit(limit);

        const total = await BookName.countDocuments({ category: category._id });

        res.json({
            success: true,
            data: books,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching books',
            error: error.message
        });
    }
});

// Get chapters by book
router.get('/category/:categoryId/:nameId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = await BookCategory.findOne({ id: req.params.categoryId });
        const book = await BookName.findOne({ id: req.params.nameId });

        if (!category || !book) {
            return res.status(404).json({
                success: false,
                message: 'Category or book not found'
            });
        }

        const chapters = await BookChapter.find({
            category: category._id,
            book: book._id
        })
        .select('id name')
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit);

        const total = await BookChapter.countDocuments({
            category: category._id,
            book: book._id
        });

        res.json({
            success: true,
            data: chapters,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching chapters',
            error: error.message
        });
    }
});

// Get content by chapter
router.get('/category/:categoryId/:nameId/:chapterId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = await BookCategory.findOne({ id: req.params.categoryId });
        const book = await BookName.findOne({ id: req.params.nameId });
        const chapter = await BookChapter.findOne({ id: req.params.chapterId });

        if (!category || !book || !chapter) {
            return res.status(404).json({
                success: false,
                message: 'Category, book, or chapter not found'
            });
        }

        const content = await BookContent.find({
            category: category._id,
            book: book._id,
            chapter: chapter._id
        })
        .select('id title_hn title_en title_hinglish meaning details extra images video_links')
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit);

        const total = await BookContent.countDocuments({
            category: category._id,
            book: book._id,
            chapter: chapter._id
        });

        res.json({
            success: true,
            data: content,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
});

module.exports = router; 