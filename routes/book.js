const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BookCategory = require('../models/BookCategory');
const BookName = require('../models/BookName');
const BookChapter = require('../models/BookChapter');
const BookContent = require('../models/BookContent');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/books';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Main book page with navigation
router.get('/', (req, res) => {
    res.render('book/index', { activePage: 'book' });
});

// Book Category Routes
router.get('/category', async (req, res) => {
    try {
        const categories = await BookCategory.find().sort({ createdAt: -1 });
        res.render('book/category/index', { 
            categories,
            activePage: 'book',
            activeSection: 'category'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Category
router.get('/category/add', (req, res) => {
    res.render('book/category/add', {
        activePage: 'book',
        activeSection: 'category'
    });
});

router.post('/category/add', upload.single('cover_image'), async (req, res) => {
    try {
        const { name } = req.body;
        let cover_image = '';
        
        if (req.file) {
            cover_image = '/uploads/books/' + req.file.filename;
        }

        const category = new BookCategory({
            name,
            cover_image
        });

        await category.save();
        res.redirect('/book/category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving category: ' + err.message);
    }
});

// Edit Category
router.get('/category/edit/:id', async (req, res) => {
    try {
        const category = await BookCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('book/category/edit', {
            category,
            activePage: 'book',
            activeSection: 'category'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/category/edit/:id', upload.single('cover_image'), async (req, res) => {
    try {
        const { name } = req.body;
        const updateData = { name };
        
        if (req.file) {
            updateData.cover_image = '/uploads/books/' + req.file.filename;
        }

        const category = await BookCategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/book/category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Category
router.post('/category/delete/:id', async (req, res) => {
    try {
        const category = await BookCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        // Check if category has any books
        const hasBooks = await BookName.exists({ category: req.params.id });
        if (hasBooks) {
            return res.status(400).send('Cannot delete category with existing books');
        }

        await category.deleteOne();
        res.redirect('/book/category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Name Routes
router.get('/name', async (req, res) => {
    try {
        const books = await BookName.find()
            .populate('category')
            .sort({ createdAt: -1 });
        res.render('book/name/index', { 
            books,
            activePage: 'book',
            activeSection: 'name'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Book
router.get('/name/add', async (req, res) => {
    try {
        const categories = await BookCategory.find().sort({ name: 1 });
        res.render('book/name/add', {
            categories,
            activePage: 'book',
            activeSection: 'name'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/name/add', upload.single('book_image'), async (req, res) => {
    try {
        const { name, category } = req.body;
        let book_image = '';
        
        if (req.file) {
            book_image = '/uploads/books/' + req.file.filename;
        }

        const book = new BookName({
            name,
            category,
            book_image
        });

        await book.save();
        res.redirect('/book/name');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving book: ' + err.message);
    }
});

// Edit Book
router.get('/name/edit/:id', async (req, res) => {
    try {
        const book = await BookName.findById(req.params.id);
        const categories = await BookCategory.find().sort({ name: 1 });
        
        if (!book) {
            return res.status(404).send('Book not found');
        }
        
        res.render('book/name/edit', {
            book,
            categories,
            activePage: 'book',
            activeSection: 'name'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/name/edit/:id', upload.single('book_image'), async (req, res) => {
    try {
        const { name, category } = req.body;
        const updateData = { name, category };
        
        if (req.file) {
            updateData.book_image = '/uploads/books/' + req.file.filename;
        }

        const book = await BookName.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!book) {
            return res.status(404).send('Book not found');
        }

        res.redirect('/book/name');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Book
router.post('/name/delete/:id', async (req, res) => {
    try {
        const book = await BookName.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Check if book has any chapters
        const hasChapters = await BookChapter.exists({ book: req.params.id });
        if (hasChapters) {
            return res.status(400).send('Cannot delete book with existing chapters');
        }

        await book.deleteOne();
        res.redirect('/book/name');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Chapter Routes
router.get('/chapter', async (req, res) => {
    try {
        const chapters = await BookChapter.find()
            .populate('category')
            .populate('book')
            .sort({ createdAt: -1 });
        res.render('book/chapter/index', { 
            chapters,
            activePage: 'book',
            activeSection: 'chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Chapter
router.get('/chapter/add', async (req, res) => {
    try {
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find().sort({ name: 1 });
        res.render('book/chapter/add', {
            categories,
            books,
            activePage: 'book',
            activeSection: 'chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/chapter/add', async (req, res) => {
    try {
        const { name, category, book } = req.body;

        const chapter = new BookChapter({
            name,
            category,
            book
        });

        await chapter.save();
        res.redirect('/book/chapter');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving chapter: ' + err.message);
    }
});

// Edit Chapter
router.get('/chapter/edit/:id', async (req, res) => {
    try {
        const chapter = await BookChapter.findById(req.params.id);
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find().sort({ name: 1 });
        
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }
        
        res.render('book/chapter/edit', {
            chapter,
            categories,
            books,
            activePage: 'book',
            activeSection: 'chapter'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/chapter/edit/:id', async (req, res) => {
    try {
        const { name, category, book } = req.body;
        const chapter = await BookChapter.findByIdAndUpdate(
            req.params.id,
            { name, category, book },
            { new: true }
        );

        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }

        res.redirect('/book/chapter');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Chapter
router.post('/chapter/delete/:id', async (req, res) => {
    try {
        const chapter = await BookChapter.findById(req.params.id);
        if (!chapter) {
            return res.status(404).send('Chapter not found');
        }

        // Check if chapter has any content
        const hasContent = await BookContent.exists({ chapter: req.params.id });
        if (hasContent) {
            return res.status(400).send('Cannot delete chapter with existing content');
        }

        await chapter.deleteOne();
        res.redirect('/book/chapter');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book Content Routes
router.get('/content', async (req, res) => {
    try {
        const contents = await BookContent.find()
            .populate('category', 'name')
            .populate('book', 'name')
            .populate('chapter', 'name')
            .sort({ createdAt: -1 });
        res.render('book/content/index', { 
            contents,
            activePage: 'book',
            activeSection: 'content'
        });
    } catch (error) {
        console.error('Error fetching contents:', error);
        res.status(500).send('Server error');
    }
});

// Add Content
router.get('/content/add', async (req, res) => {
    try {
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find()
            .populate('category', '_id name')
            .sort({ name: 1 });
        const chapters = await BookChapter.find()
            .populate('book', '_id name')
            .sort({ name: 1 });
            
        res.render('book/content/add', { 
            categories, 
            books, 
            chapters,
            activePage: 'book',
            activeSection: 'content'
        });
    } catch (error) {
        console.error('Error fetching data for content form:', error);
        res.status(500).send('Server error');
    }
});

router.post('/content/add', upload.array('images', 10), async (req, res) => {
    try {
        const { 
            category, book, chapter, 
            title_hn, title_en, title_hinglish,
            meaning, details, extra, video_links 
        } = req.body;
        
        // Process video links
        const videoLinksArray = video_links ? video_links.split('\n').map(link => link.trim()).filter(link => link) : [];
        
        // Process uploaded images
        const imageLinks = req.files ? req.files.map(file => `/uploads/books/${file.filename}`) : [];

        const content = new BookContent({
            category,
            book,
            chapter,
            title_hn,
            title_en,
            title_hinglish,
            meaning,
            details,
            extra,
            images: imageLinks,
            video_links: videoLinksArray
        });

        await content.save();
        res.redirect('/book/content');
    } catch (error) {
        console.error('Error saving content:', error);
        res.status(500).send('Server error');
    }
});

// Edit Content
router.get('/content/edit/:id', async (req, res) => {
    try {
        const content = await BookContent.findById(req.params.id);
        const categories = await BookCategory.find().sort({ name: 1 });
        const books = await BookName.find()
            .populate('category', '_id name')
            .sort({ name: 1 });
        const chapters = await BookChapter.find()
            .populate('book', '_id name')
            .sort({ name: 1 });
        
        if (!content) {
            return res.status(404).send('Content not found');
        }
        
        res.render('book/content/edit', {
            content,
            categories,
            books,
            chapters,
            activePage: 'book',
            activeSection: 'content'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/content/edit/:id', async (req, res) => {
    try {
        const { 
            category, book, chapter, 
            title_hn, title_en, title_hinglish,
            meaning, details, extra 
        } = req.body;

        const content = await BookContent.findByIdAndUpdate(
            req.params.id,
            {
                category, book, chapter,
                title_hn, title_en, title_hinglish,
                meaning, details, extra
            },
            { new: true }
        );

        if (!content) {
            return res.status(404).send('Content not found');
        }

        res.redirect('/book/content');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Content
router.post('/content/delete/:id', async (req, res) => {
    try {
        const content = await BookContent.findById(req.params.id);
        if (!content) {
            return res.status(404).send('Content not found');
        }

        await content.deleteOne();
        res.redirect('/book/content');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 