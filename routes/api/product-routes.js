// NOTE: Future development - refactor error handling to be more reliable
// NOTE: Update route not working, need to debug

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
      console.error(`\x1b[33m[Error viewing all products: Not found]\x1b[0m`);
      res.status(404).json("Error: No products found");
      throw new Error("No products found");
    }
    console.log(`\x1b[32m[Viewing all products]\x1b[0m`);
    // Call helper function to format output for console table
    const tableData = formatAllProducts(products);
    console.table(tableData);
    res.status(200).json(products);
  } catch (err) {
    console.error(`\x1b[31m[Error finding all products: ${err}]\x1b[0m`);
    res.status(500).json(err);
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
      "tagIds": [3, 7, 8],
      "category_id": 4
    }
*/
// NOTE: Fragile solution, requires all fields to be present & only works with bulkCreate for unknown reasons.
router.post("/", async (req, res) => {
  if (
    !req.body.product_name ||
    !req.body.price ||
    !req.body.stock ||
    !req.body.category_id
  ) {
    console.error(
      `\x1b[31m[Error: Request must include product_name, price, stock and category_id]\x1b[0m`
    );
    res.status(400).json({
      error: "Request must include product_name, price, stock and category_id",
    });
    return;
  }
  try {
    const product = await Product.bulkCreate([req.body]);
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product[0].id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }
    console.log(
      `\x1b[32m[Successfully created product ${product[0].id}: ${product[0].product_name}, in category ${product[0].category_id}]\x1b[0m`
    );
    res.status(200).json(product);
  } catch (err) {
    console.error(
      `\x1b[31m[Error creating a new product: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    res.status(500).json(err);
  }
});

// Update product by id
/* req.body example:
    {
      "product_name": "Rob Zombie Vinyl Record",
      "price": 90.00,
      "stock": 2,
      "tagIds": [1, 8],
      "category_id": 3
    }
*/
// Experiment
// ==================================
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
    // Debug build/save method - hangs on save
    const updatedProduct = Product.build({
      id: req.params.id,
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
    });
    console.log("debug - updatedProduct: ", updatedProduct);
    console.log("debug - instance: ", updatedProduct instanceof Product);
    await updatedProduct.save();
    console.log("debug - updatedProduct: ", updatedProduct);

    // await Product.update(
    //   {
    //     product_name: req.body.product_name,
    //     price: req.body.price,
    //     stock: req.body.stock,
    //     category_id: req.body.category_id,
    //   },
    //   {
    //     where: {
    //       id: req.params.id,
    //     },
    //   }
    // );
    // Update product tags
    if (req.body.tagIds && req.body.tagIds.length) {
      // Get current product tags
      const productTags = await ProductTag.findAll({
        where: {
          product_id: req.params.id,
        },
      });
      // Create array of current tag ids
      const currentTagIds = productTags.map((tag) => tag.tag_id);
      // Create array of new tag ids
      const newTagIds = req.body.tagIds.filter(
        (tag_id) => !currentTagIds.includes(tag_id)
      );
      // Create new product tags
      const newProductTags = newTagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
      // Bulk create new product tags
      await ProductTag.bulkCreate(newProductTags);
    }
    res.status(200).json({
      message: `Successfully updated product ${req.params.id}, ${req.body.product_name}`,
      update: req.body,
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error updating product with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    res.status(500).json(err);
  }
});

// My version (hangs on response)
// ==================================
// router.put("/:id", async (req, res) => {
//   try {
//     // Find product to update
//     const product = await Product.findOne({
//       where: {
//         id: req.params.id,
//       },
//     });
//     if (!product) {
//       console.error(
//         `\x1b[31m[Error updating product with id ${req.params.id}: Not found]\x1b[0m`
//       );
//       res
//         .status(404)
//         .json(`Error: Could not find product with id ${req.params.id}`);
//       throw new Error(`No product found with id ${req.params.id}`);
//     }

//     console.log("debug - product found");

//     // Get tagIds from req.body
//     const tagIds = req.body.tagIds;
//     // Get current product tags
//     const productTags = await ProductTag.findAll({
//       where: {
//         product_id: req.params.id,
//       },
//     });
//     // Create array of current tag ids
//     const currentTagIds = productTags.map((tag) => tag.tag_id);
//     // Create array of new tag ids
//     const newTagIds = tagIds.filter(
//       (tag_id) => !currentTagIds.includes(tag_id)
//     );

//     console.log("debug - req.body: ", req.body);
//     console.log("debug - currentTagIds: ", currentTagIds);
//     console.log("debug - newTagIds: ", newTagIds); // Last log reached

//     // Update product data
//     const updatedCount = await Product.update(
//       {
//         product_name: req.body.product_name,
//         price: req.body.price,
//         stock: req.body.stock,
//         category_id: req.body.category_id,
//       },
//       {
//         where: {
//           id: req.params.id,
//         },
//       }
//     );

//     console.log("debug - updatedCount: ", updatedCount); // Not reached

//     if (updatedCount === 0) {
//       throw new Error(`product_name ${newName} is invalid or already exists`);
//     }
//     if (tagIds && tagIds.length) {
//       const productTagIdArr = newTagIds.map((tag_id) => {
//         return {
//           product_id: req.params.id,
//           tag_id,
//         };
//       });
//       try {
//         await ProductTag.bulkCreate({
//           include: [Tag, productTagIdArr],
//           where: {
//             product_id: req.params.id,
//           },
//         });
//       } catch (err) {
//         console.error(
//           `\x1b[31m[Error updating product tags: ${err.name}]\n[${err.message}]\x1b[0m`
//         );
//         throw new Error(`Error updating product tags: ${err}`);
//       }
//     }
//     console.log(
//       `\x1b[32m[Successfully updated product ${req.params.id}: ${product.product_name}]\x1b[0m`
//     );
//     res.status(200).json({
//       message: `Successfully updated product ${req.params.id}, ${product.product_name}`,
//       update: product,
//     });
//   } catch (err) {
//     if (!res.status(404)) {
//       console.error(
//         `\x1b[31m[Error updating product with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
//       );
//       res.status(500).json(`${err}`);
//     }
//   }
// });

// Start code version (hangs on response)
// ==================================
// router.put("/:id", (req, res) => {
//   Product.update(req.body, {
//     where: {
//       id: req.params.id,
//     },
//   })
//     .then((product) => {
//       if (req.body.tagIds && req.body.tagIds.length) {
//         ProductTag.findAll({
//           where: { product_id: req.params.id },
//         }).then((productTags) => {
//           // Create filtered list of new tag_ids
//           const productTagIds = productTags.map(({ tag_id }) => tag_id);
//           const newProductTags = req.body.tagIds
//             .filter((tag_id) => !productTagIds.includes(tag_id))
//             .map((tag_id) => {
//               return {
//                 product_id: req.params.id,
//                 tag_id,
//               };
//             });

//           // Figure out which ones to remove
//           const productTagsToRemove = productTags
//             .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
//             .map(({ id }) => id);
//           // run both actions
//           return Promise.all([
//             ProductTag.destroy({ where: { id: productTagsToRemove } }),
//             ProductTag.bulkCreate(newProductTags),
//           ]);
//         });
//       }

//       return res.json(product);
//     })
//     .catch((err) => {
//       res.status(400).json(err);
//     });
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
