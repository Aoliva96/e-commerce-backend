// NOTE: Future development - refactor error handling to be more reliable

const router = require("express").Router();
const { Category, Product } = require("../../models");
const { formatAllCategories, formatSingleCategory } = require("./helpers");

// Routes for /api/categories endpoint
// ====================================

// Find all categories, include associated products
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [Product],
    });
    if (!categories) {
      res.status(404).json("Error: No categories found");
      console.error(`\x1b[33m[Error viewing all categories: Not found]\x1b[0m`);
      throw new Error("No categories found");
    }
    console.log(`\x1b[32m[Viewing all categories]\x1b[0m`);
    res.status(200).json(categories);
    // Call helper function to format output for console table
    const tableData = formatAllCategories(categories);
    console.table(tableData);
  } catch (err) {
    res.status(500).json(err);
    console.error(`\x1b[31m[Error finding all categories: ${err}]\x1b[0m`);
  }
});

// Find one category by id, include associated products
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
      },
      include: [Product],
    });
    if (!category) {
      res.status(404).json(`Error: No category found with id ${req.params.id}`);
      console.error(
        `\x1b[31m[Error finding category with id ${req.params.id}: Not found]\x1b[0m`
      );
      throw new Error(`No category found with id ${req.params.id}`);
    }
    res.status(200).json(category);
    console.log(
      `\x1b[32m[Viewing category ${category.id}: ${category.category_name}]\x1b[0m`
    );
    // Call helper function to format output for console table
    const tableData = formatSingleCategory(category);
    console.table(tableData);
  } catch (err) {
    res.status(500).json(err);
    console.error(
      `\x1b[31m[Error finding category with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
  }
});

// Create new category
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

// Update category by id
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
      throw new Error(`No category found with id ${req.params.id}`);
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

// Delete category by id
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
      throw new Error(`No category found with id ${req.params.id}`);
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
