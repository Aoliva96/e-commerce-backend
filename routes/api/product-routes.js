const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");
const { formatAllProducts, formatSingleProduct } = require("./helpers");

// Routes for /api/products endpoint
// ==================================

// Get all products, include associated categories & tags
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, Tag],
    });
    if (products.length === 0) {
      console.error(`\x1b[33m[Error viewing all products: Not found]\x1b[0m`);
      return res.status(404).json({ error: "No products found" });
    }

    // Log success message and formatted console table
    console.log(`\x1b[32m[Viewing all products]\x1b[0m`);
    const tableData = formatAllProducts(products);
    console.table(tableData);

    // Send response
    return res.status(200).json(products);
  } catch (err) {
    console.error(`\x1b[31m[Error viewing all products: ${err}]\x1b[0m`);
    return res.status(500).json({
      message: "Error viewing all products",
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Get one product by id, include associated category & tags
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
      include: [Category, Tag],
    });
    if (!product) {
      console.error(
        `\x1b[33m[Error viewing product with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res
        .status(404)
        .json({ error: `No product found with id ${req.params.id}` });
    }

    // Log success message and formatted console table
    console.log(
      `\x1b[32m[Viewing product ${product.id}: ${product.product_name}]\x1b[0m`
    );
    const tableData = formatSingleProduct(product);
    console.table(tableData);

    // Send response
    return res.status(200).json(product);
  } catch (err) {
    console.error(
      `\x1b[31m[Error viewing product with id ${req.params.id}: ${err.name}]\n[${err.message}\x1b[0m`
    );
    return res.status(500).json({
      message: `Error viewing product with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Create new product
/* req.body example:
    {
      "product_name": "Basketball",
      "price": 100.00,
      "stock": 3,
      "tagIds": [3, 7, 8],
      "category_id": 4
    }
*/
router.post("/", async (req, res) => {
  // Check for required fields
  if (
    !req.body.product_name ||
    !req.body.price ||
    !req.body.stock ||
    !req.body.category_id
  ) {
    console.error(
      `\x1b[33m[Error: Request must include product_name, price, stock and category_id]\x1b[0m`
    );
    return res.status(400).json({
      error: "Request must include product_name, price, stock and category_id",
    });
  }

  try {
    // Create product
    const product = await Product.create(req.body);
    if (req.body.tagIds && req.body.tagIds.length > 0) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Log success message
    console.log(
      `\x1b[32m[Successfully created product ${product.id}: ${product.product_name}, in category ${product.category_id}]\x1b[0m`
    );

    // Send response
    return res
      .status(201)
      .json({ message: `Successfully created new product`, product });
  } catch (err) {
    console.error(
      `\x1b[31m[Error creating new product: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: "Error creating new product",
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Update product by id
/* req.body example:
  {
    "product_name": "Rob Zombie Greatest Hits CD",
    "price": 25.00,
    "stock": 35,
    "tagIds": [1, 8],
    "category_id": 3
  }
*/
router.put("/:id", async (req, res) => {
  try {
    // Find product to update
    const originalProduct = await Product.findOne({
      where: {
        id: req.params.id,
      },
      include: [Category],
    });
    if (!originalProduct) {
      console.error(
        `\x1b[33m[Error updating product with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res.status(404).json({
        error: `Could not update product with id ${req.params.id}: Not found`,
      });
    }

    // Update product data
    const updatedCount = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
    });

    // Collect tag data
    const tagIds = req.body.tagIds;
    const productTags = await ProductTag.findAll({
      where: { product_id: req.params.id },
    });
    const currentTagIds = productTags.map(({ tag_id }) => tag_id);

    // Determine which tags to add/remove
    const newTagIds = tagIds.filter(
      (tag_id) => !currentTagIds.includes(tag_id)
    );
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !tagIds.includes(tag_id))
      .map(({ id }) => id);

    // Update product tags
    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(
        newTagIds.map((tag_id) => ({ product_id: req.params.id, tag_id }))
      ),
    ]);

    // Check for no change to product or tags
    if (updatedCount[1] === 0 && productTagsToRemove.length === 0) {
      console.error(
        `\x1b[33m[Error updating product with id ${req.params.id}: Request invalid or already exists]\x1b[0m`
      );
      return res.status(400).json({
        error: `Request is invalid or already exists`,
      });
    }

    // Collect updated product data
    const updatedProduct = await Product.findOne({
      where: {
        id: req.params.id,
      },
      include: [Category],
    });

    // Log success message
    console.log(
      `\x1b[32m[Successfully updated product ${req.params.id}]\n[Name: ${originalProduct.product_name} > ${updatedProduct.product_name}]\n[Price: ${originalProduct.price} > ${updatedProduct.price}]\n[Stock: ${originalProduct.stock} > ${updatedProduct.stock}]\n[Category: ${originalProduct.category.category_name} > ${updatedProduct.category.category_name}]\n[Tags: ${currentTagIds} > ${tagIds}]\x1b[0m`
    );

    // Send response
    return res.status(200).json({
      message: `Successfully updated product ${req.params.id}`,
      update: updatedProduct,
      original: { originalProduct, tags: originalProduct.tags },
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error updating product with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error updating product with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Delete product by id
router.delete("/:id", async (req, res) => {
  try {
    // Find product to delete
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!product) {
      console.error(
        `\x1b[33m[Error deleting product with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res.status(404).json({
        error: `Could not delete product with id ${req.params.id}: Not found`,
      });
    }

    // Delete product
    await product.destroy();

    // Log success message
    console.log(
      `\x1b[32m[Successfully deleted product ${req.params.id}: ${product.product_name}]\x1b[0m`
    );

    // Send response
    return res.status(200).json({
      message: `Successfully deleted product ${req.params.id}, ${product.product_name}`,
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error deleting product with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error deleting product with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
  }
});

module.exports = router;
