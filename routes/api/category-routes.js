const router = require("express").Router();
const { Category, Product } = require("../../models");

// Routes for /api/categories endpoint
// ====================================

// Find all categories & include associated products
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [Product],
    });
    if (!categories) {
      res.status(404).json("Error: No categories found");
      console.error(`\x1b[33m[Error viewing all categories: Not found]\x1b[0m`);
      return;
    }
    console.log(`\x1b[32m[Viewing all categories]\x1b[0m`);
    // Format categories and associated products for console table
    res.status(200).json(categories);
    function TableItem(
      categories,
      category_id,
      products,
      product_id,
      prices,
      stocks
    ) {
      this.categories = categories;
      this.category_id = category_id;
      this.products = products;
      this.product_id = product_id;
      this.prices = prices;
      this.stocks = stocks;
    }
    const tableData = [];
    categories.forEach((category) => {
      if (category.products.length > 0) {
        category.products.forEach((product) => {
          tableData.push(
            new TableItem(
              category.category_name,
              category.id,
              product.product_name,
              product.id,
              product.price,
              product.stock
            )
          );
        });
      } else {
        tableData.push(
          new TableItem(
            category.category_name,
            category.id,
            "None",
            "N/A",
            "N/A",
            "N/A"
          )
        );
      }
    });
    console.table(tableData);
  } catch (err) {
    res.status(500).json(err);
    console.error(`\x1b[31m[Error finding all categories: ${err}]\x1b[0m`);
  }
});

// Find one category by id & include associated products
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
      },
      include: [Product],
    });
    if (!category) {
      res
        .status(404)
        .json(`Error: Could not find category with id ${req.params.id}`);
      console.error(
        `\x1b[31m[Error finding category with id ${req.params.id}: Not found]\x1b[0m`
      );
      return;
    }
    res.status(200).json(category);
    console.log(
      `\x1b[32m[Viewing category ${category.id}: ${category.category_name}]\x1b[0m`
    );

    // Format products for console table, if any
    if (category.products.length > 0) {
      function TableItem(products, product_id, prices, stocks) {
        this.products = products;
        this.product_id = product_id;
        this.prices = prices;
        this.stocks = stocks;
      }
      const products = category.products.map((product) => product.product_name);
      const productIds = category.products.map((product) => product.id);
      const prices = category.products.map((product) => product.price);
      const stocks = category.products.map((product) => product.stock);
      const tableData = products.map(
        (product, index) =>
          new TableItem(
            product,
            productIds[index],
            prices[index],
            stocks[index]
          )
      );
      console.table(tableData);
    } else {
      console.log(
        `\x1b[33m[Currently no products in category ${category.id}]\x1b[0m`
      );
    }
  } catch (err) {
    res.status(500).json(err);
    console.error(
      `\x1b[31m[Error finding category with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
  }
});

// Create a new category
// req.body example: { "category_name": "Electronics" }
router.post("/", async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
    console.log(
      `\x1b[32m[Successfully created category ${newCategory.id}: ${newCategory.category_name}]\x1b[0m`
    );
  } catch (err) {
    res.status(500).json(err);
    console.error(
      `\x1b[31m[Error creating a new category: ${err.name}]\n[${err.message}]\x1b[0m`
    );
  }
});

// Update a category by id
// req.body example: { "category_name": "Appliances" }
router.put("/:id", async (req, res) => {
  try {
    // Find category to update
    const category = await Category.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!category) {
      res
        .status(404)
        .json(`Error: Could not find category with id ${req.params.id}`);
      console.error(
        `\x1b[31m[Error updating category with id ${req.params.id}: Not found]\x1b[0m`
      );
      return;
    }
    // Update category name
    const newName = req.body.category_name;
    const [updatedCount] = await Category.update(
      { category_name: newName },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    if (updatedCount === 0) {
      throw new Error(`category_name ${newName} is invalid or already exists`);
    }
    res.status(200).json({
      message: `Successfully updated category ${req.params.id}, ${category.category_name} to ${newName}`,
    });
    console.log(
      `\x1b[32m[Successfully updated category ${req.params.id}]\n[${category.category_name} > ${newName}]\x1b[0m`
    );
  } catch (err) {
    res.status(500).json(`${err}`);
    console.error(
      `\x1b[31m[Error updating category with id ${req.params.id}]\n[${err.message}]\x1b[0m`
    );
  }
});

// Delete a category by id
router.delete("/:id", async (req, res) => {
  try {
    // Find category to delete
    const category = await Category.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!category) {
      res
        .status(404)
        .json(`Error: Could not find category with id ${req.params.id}`);
      console.error(
        `\x1b[31m[Error deleting category with id ${req.params.id}: Not found]\x1b[0m`
      );
      return;
    }
    // Delete category
    const deletedCategory = await Category.destroy({
      where: {
        id: category.id,
      },
    });
    if (!deletedCategory) {
      throw err;
    }
    res.status(200).json({
      message: `Successfully deleted category ${req.params.id}, ${category.category_name}`,
    });
    console.log(
      `\x1b[32m[Successfully deleted category ${req.params.id}: ${category.category_name}]\x1b[0m`
    );
  } catch (err) {
    res.status(500).json(`${err}`);
    console.error(
      `\x1b[31m[Error deleting category with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
  }
});

module.exports = router;
