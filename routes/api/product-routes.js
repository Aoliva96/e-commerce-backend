// NOTE: Future development - refactor error handling to be more reliable
// NOTE: Create & Update routes are not yet working, response timeout, bulkCreate issue?

const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");
const { formatAllProducts, formatSingleProduct } = require("./helpers");

// Routes for /api/products endpoint
// ==================================

// Find all products, include associated categories & tags
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, Tag],
    });
    if (!products) {
      res.status(404).json("Error: No products found");
      console.error(`\x1b[33m[Error viewing all products: Not found]\x1b[0m`);
      throw new Error("No products found");
    }
    console.log(`\x1b[32m[Viewing all products]\x1b[0m`);
    res.status(200).json(products);
    // Call helper function to format output for console table
    const tableData = formatAllProducts(products);
    console.table(tableData);
  } catch (err) {
    res.status(500).json(err);
    console.error(`\x1b[31m[Error finding all products: ${err}]\x1b[0m`);
  }
});

// Find one product by id, include associated category & tags
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
      include: [Category, Tag],
    });
    if (!product) {
      res.status(404).json(`Error: No product found with id ${req.params.id}`);
      console.error(
        `\x1b[33m[Error finding product with id ${req.params.id}]\x1b[0m`
      );
      throw new Error(`No product found with id ${req.params.id}`);
    }
    res.status(200).json(product);
    console.log(
      `\x1b[32m[Viewing product ${product.id}: ${product.product_name}]\x1b[0m`
    );
    // Call helper function to format output for console table
    const tableData = formatSingleProduct(product);
    console.table(tableData);
  } catch (err) {
    res.status(500).json(err);
    console.error(
      `\x1b[31m[Error finding product with id ${req.params.id}: ${err.name}]\n[${err.message}\x1b[0m`
    );
  }
});

// Create new product
/* req.body example:
    {
      "product_name": "Basketball",
      "price": 100.00,
      "stock": 3,
      "tagIds": [3, 7, 8]
    }
*/
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// Update product by id
/* req.body example:
    {
      "product_name": "Rob Zombie Vinyl Record",
      "price": 90.00,
      "stock": 2,
      "tagIds": [1, 8]
    }
*/
router.put("/:id", async (req, res) => {
  try {
    // Find product to update
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!product) {
      console.error(
        `\x1b[31m[Error updating product with id ${req.params.id}: Not found]\x1b[0m`
      );
      res
        .status(404)
        .json(`Error: Could not find product with id ${req.params.id}`);
      throw new Error(`No product found with id ${req.params.id}`);
    }
    // Update product data
    const newName = req.body.product_name;
    const newPrice = req.body.price;
    const newStock = req.body.stock;
    const newTagIds = req.body.tagIds;
    const [updatedCount] = await Product.update(
      { product_name: newName, price: newPrice, stock: newStock },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    if (updatedCount === 0) {
      throw new Error(`product_name ${newName} is invalid or already exists`);
    }
    if (newTagIds && newTagIds.length) {
      const productTagIdArr = newTagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
      try {
        await ProductTag.bulkCreate(productTagIdArr);
      } catch (err) {
        console.error(
          `\x1b[31m[Error updating product tags with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
        );
        throw new Error(
          `Error updating product tags with id ${req.params.id}: ${err}`
        );
      }
    }
    console.log(
      `\x1b[32m[Successfully updated product ${req.params.id}: ${product.product_name}]\x1b[0m`
    );
    res.status(200).json({
      message: `Successfully updated product ${req.params.id}, ${product.product_name}`,
      update: product,
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error updating product with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    res.status(500).json(`${err}`);
  }
});
// .then((product) => {
//   if (req.body.tagIds && req.body.tagIds.length) {
//     ProductTag.findAll({
//       where: { product_id: req.params.id },
//     }).then((productTags) => {
//       // Create filtered list of new tag_ids
//       const productTagIds = productTags.map(({ tag_id }) => tag_id);
//       const newProductTags = req.body.tagIds
//         .filter((tag_id) => !productTagIds.includes(tag_id))
//         .map((tag_id) => {
//           return {
//             product_id: req.params.id,
//             tag_id,
//           };
//         });

//       // Figure out which ones to remove
//       const productTagsToRemove = productTags
//         .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
//         .map(({ id }) => id);
//       // run both actions
//       return Promise.all([
//         ProductTag.destroy({ where: { id: productTagsToRemove } }),
//         ProductTag.bulkCreate(newProductTags),
//       ]);
//     });
//   }

//   return res.json(product);
// })
// .catch((err) => {
//   res.status(400).json(err);
// });

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
      res
        .status(404)
        .json(`Error: Could not find product with id ${req.params.id}`);
      console.error(
        `\x1b[31m[Error deleting product with id ${req.params.id}: Not found]\x1b[0m`
      );
      throw new Error(`No product found with id ${req.params.id}`);
    }
    // Delete product
    const deletedProduct = await Product.destroy({
      where: {
        id: product.id,
      },
    });
    if (!deletedProduct) {
      throw err;
    }
    res.status(200).json({
      message: `Successfully deleted product ${req.params.id}, ${product.product_name}`,
    });
    console.log(
      `\x1b[32m[Successfully deleted product ${req.params.id}: ${product.product_name}]\x1b[0m`
    );
  } catch (err) {
    res.status(500).json(`${err}`);
    console.error(
      `\x1b[31m[Error deleting product with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
  }
});

module.exports = router;
