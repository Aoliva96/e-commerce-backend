// NOTE: Future development - refactor error handling to be more reliable

const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");
const { formatAllTags, formatSingleTag } = require("./helpers");

// Routes for /api/tags endpoint
// ==============================

// Find all tags, include associated products
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    if (!tags) {
      res.status(404).json("Error: No tags found");
      console.error(`\x1b[33m[Error viewing all tags: Not found]\x1b[0m`);
      throw new Error("No tags found");
    }
    console.log(`\x1b[32m[Viewing all tags]\x1b[0m`);
    res.status(200).json(tags);
    // Call helper function to format output for console table
    const tableData = formatAllTags(tags);
    console.table(tableData);
  } catch (err) {
    res.status(500).json(err);
    console.error(`\x1b[31m[Error finding all products: ${err}]\x1b[0m`);
  }
});

// Find one tag by id, include associated products
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findOne({
      where: {
        id: req.params.id,
      },
      include: [Product],
    });
    if (!tag) {
      res.status(404).json(`Error: No tag found with id ${req.params.id}`);
      console.error(
        `\x1b[33m[Error finding tag with id ${req.params.id}]\x1b[0m`
      );
      throw new Error(`No tag found with id ${req.params.id}`);
    }
    res.status(200).json(tag);
    console.log(`\x1b[32m[Viewing tag ${tag.id}: ${tag.tag_name}]\x1b[0m`);
    // Call helper function to format output for console table
    const tableData = formatSingleTag(tag);
    console.table(tableData);
  } catch (err) {
    res.status(500).json(err);
    console.error(
      `\x1b[31m[Error finding tag with id ${req.params.id}: ${err.name}]\n[${err.message}\x1b[0m`
    );
  }
});

// Create a new tag
// req.body example: { "tag_name": "black" }
router.post("/", async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
    console.log(
      `\x1b[32m[Successfully created tag ${newTag.id}: ${newTag.tag_name}]\x1b[0m`
    );
  } catch (err) {
    res.status(500).json(err);
    console.error(
      `\x1b[31m[Error creating a new tag: ${err.name}]\n[${err.message}]\x1b[0m`
    );
  }
});

// Update tag by id
// req.body example: { "tag_name": "on sale" }
router.put("/:id", async (req, res) => {
  try {
    // Find tag to update
    const tag = await Tag.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!tag) {
      res
        .status(404)
        .json(`Error: Could not find tag with id ${req.params.id}`);
      console.error(
        `\x1b[31m[Error updating tag with id ${req.params.id}: Not found]\x1b[0m`
      );
      throw new Error(`No tag found with id ${req.params.id}`);
    }
    // Update tag name
    const newName = req.body.tag_name;
    const [updatedCount] = await Tag.update(
      { tag_name: newName },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    if (updatedCount === 0) {
      throw new Error(`tag_name ${newName} is invalid or already exists`);
    }
    res.status(200).json({
      message: `Successfully updated tag ${req.params.id}, ${tag.tag_name} to ${newName}`,
    });
    console.log(
      `\x1b[32m[Successfully updated tag ${req.params.id}]\n[${tag.tag_name} > ${newName}]\x1b[0m`
    );
  } catch (err) {
    res.status(500).json(`${err}`);
    console.error(
      `\x1b[31m[Error updating tag with id ${req.params.id}]\n[${err.message}]\x1b[0m`
    );
  }
});

// Delete tag by id
router.delete("/:id", async (req, res) => {
  try {
    // Find tag to delete
    const tag = await Tag.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!tag) {
      res
        .status(404)
        .json(`Error: Could not find tag with id ${req.params.id}`);
      console.error(
        `\x1b[31m[Error deleting tag with id ${req.params.id}: Not found]\x1b[0m`
      );
      throw new Error(`No tag found with id ${req.params.id}`);
    }
    // Delete tag
    const deletedTag = await Tag.destroy({
      where: {
        id: tag.id,
      },
    });
    if (!deletedTag) {
      throw err;
    }
    res.status(200).json({
      message: `Successfully deleted tag ${req.params.id}, ${tag.tag_name}`,
    });
    console.log(
      `\x1b[32m[Successfully deleted tag ${req.params.id}: ${tag.tag_name}]\x1b[0m`
    );
  } catch (err) {
    res.status(500).json(`${err}`);
    console.error(
      `\x1b[31m[Error deleting tag with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
  }
});

module.exports = router;
