import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProductsRepository } from '../repositories/products.repository.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsRepo = new ProductsRepository();

// Categories
export const createCategory = async (req, res) => {
    try {
        console.log(req.body)
        const companyId = req.companyId;
        const category = await productsRepo.createCategory(companyId, req.body);
        return res.status(201).json({
            status: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const companyId = req.companyId;
        const categoriesList = await productsRepo.findAllCategories(companyId);
        return res.status(200).json({
            status: true,
            message: 'Categories fetched successfully',
            data: categoriesList,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// Products
export const createProduct = async (req, res) => {
    try {
        const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;

        const payload = {
            ...req.body,
            images: imagePath,
        };

        const product = await productsRepo.createProduct(payload);

        return res.status(201).json({
            status: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const result = await productsRepo.findAllProducts(req.query);
        return res.status(200).json({
            status: true,
            message: 'Products list fetched successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productsRepo.findProductById(id);

        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'Product details fetched successfully',
            data: product,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await productsRepo.findProductById(id);
        if (!existingProduct) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        const payload = { ...req.body };

        if (req.file) {
            payload.images = `/uploads/products/${req.file.filename}`;

            if (existingProduct.images) {
                const oldImagePath = path.join(__dirname, '../..', existingProduct.images);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updatedProduct = await productsRepo.updateProduct(id, payload);

        return res.status(200).json({
            status: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({ status: false, message: error.message });
    }
};
export const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const existingProduct = await productsRepo.findProductById(id);
        if (!existingProduct) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        const updated = await productsRepo.toggleProductStatus(id, isActive);
        return res.status(200).json({
            status: true,
            message: `Product status updated to ${isActive ? 'active' : 'inactive'}`,
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};