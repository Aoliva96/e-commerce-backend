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

// create new product
/* req.body example:
    {
      "product_name": "Basketball",
      "price": 100.00,
      "stock": 3,
      "tagIds": [3, 7, 8]
    }
*/
router.post("/", (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
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
router.put("/:id", (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        ProductTag.findAll({
          where: { product_id: req.params.id },
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
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
