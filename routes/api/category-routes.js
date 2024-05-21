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
    if (categories.length === 0) {
      console.error(`\x1b[33m[Error viewing all categories: Not found]\x1b[0m`);
      return res.status(404).json({ error: "No categories found" });
    }

    // Log success message and formatted console table
    console.log(`\x1b[32m[Viewing all categories]\x1b[0m`);
    const tableData = formatAllCategories(categories);
    console.table(tableData);

    // Send response
    return res.status(200).json(categories);
  } catch (err) {
    console.error(`\x1b[31m[Error viewing all categories: ${err}]\x1b[0m`);
    return res.status(500).json({
      message: "Error viewing all categories",
      error: `${err.name}, ${err.message}`,
    });
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
      console.error(
        `\x1b[33m[Error viewing category with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res
        .status(404)
        .json({ error: `No category found with id ${req.params.id}` });
    }

    // Log success message and formatted console table
    console.log(`\x1b[32m[Viewing category ${category.id}]\x1b[0m`);
    const tableData = formatSingleCategory(category);
    console.table(tableData);

    // Send response
    return res.status(200).json(category);
  } catch (err) {
    console.error(
      `\x1b[31m[Error viewing category with id ${req.params.id}: ${err.name}\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error viewing category with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Create new category
// req.body example: { "category_name": "Electronics" }
router.post("/", async (req, res) => {
  if (!req.body.category_name) {
    console.error(
      `\x1b[33m[Error: Request must include valid category_name]\x1b[0m`
    );
    return res.status(400).json({
      error: "Request must include valid category_name",
    });
  }

  try {
    // Create category
    const newCategory = await Category.create(req.body);

    // Log success message
    console.log(
      `\x1b[32m[Successfully created category ${newCategory.id}: ${newCategory.category_name}]\x1b[0m`
    );

    // Send response
    return res.status(201).json(newCategory);
  } catch (err) {
    console.error(
      `\x1b[31m[Error creating new category: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: "Error creating new category",
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Update category by id
// req.body example: { "category_name": "Appliances" }
router.put("/:id", async (req, res) => {
  try {
    // Find category to update
    const originalCategory = await Category.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!originalCategory) {
      console.error(
        `\x1b[33m[Error updating category with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res.status(404).json({
        error: `Could not update category with id ${req.params.id}: Not found`,
      });
    }

    // Update category
    const updatedCount = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
    });

    // Check for no change to category
    if (updatedCount[1] === 0) {
      console.error(
        `\x1b[33m[Error updating category with id ${req.params.id}: Request invalid or already exists]\x1b[0m`
      );
      return res.status(400).json({
        error: `Request is invalid or already exists`,
      });
    }

    // Collect updated category data
    const updatedCategory = await Category.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Log success message
    console.log(
      `\x1b[32m[Successfully updated category ${req.params.id}]\n[Name: ${originalCategory.category_name} > ${updatedCategory.category_name}]\x1b[0m`
    );

    // Send response
    return res.status(200).json({
      message: `Successfully updated category ${req.params.id}`,
      update: updatedCategory,
      original: originalCategory,
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error updating category with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error updating category with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
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
      console.error(
        `\x1b[33m[Error deleting category with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res.status(404).json({
        error: `Could not delete category with id ${req.params.id}: Not found`,
      });
    }

    // Delete category
    await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    // Log success message
    console.log(
      `\x1b[32m[Successfully deleted category ${req.params.id}: ${category.category_name}]\x1b[0m`
    );

    // Send response
    return res.status(200).json({
      message: `Successfully deleted category ${req.params.id}, ${category.category_name}`,
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error deleting category with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error deleting category with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
  }
});

module.exports = router;
