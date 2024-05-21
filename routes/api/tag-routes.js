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
      console.error(`\x1b[33m[Error viewing all tags: Not found]\x1b[0m`);
      return res.status(404).json({ error: "No tags found" });
    }

    // Log success message and formatted console table
    console.log(`\x1b[32m[Viewing all tags]\x1b[0m`);
    const tableData = formatAllTags(tags);
    console.table(tableData);

    // Send response
    return res.status(200).json(tags);
  } catch (err) {
    console.error(`\x1b[31m[Error viewing all tags: ${err}]\x1b[0m`);
    res.status(500).json({
      message: "Error viewing all tags",
      error: `${err.name}, ${err.message}`,
    });
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
      console.error(
        `\x1b[33m[Error viewing tag with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res
        .status(404)
        .json({ error: `No tag found with id ${req.params.id}` });
    }

    // Log success message and formatted console table
    console.log(`\x1b[32m[Viewing tag ${tag.id}: ${tag.tag_name}]\x1b[0m`);
    const tableData = formatSingleTag(tag);
    console.table(tableData);

    // Send response
    return res.status(200).json(tag);
  } catch (err) {
    console.error(
      `\x1b[31m[Error viewing tag with id ${req.params.id}: ${err.name}\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error viewing tag with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Create new tag
// req.body example: { "tag_name": "black" }
router.post("/", async (req, res) => {
  if (!req.body.tag_name) {
    console.error(
      `\x1b[33m[Error: Request must include valid tag_name]\x1b[0m`
    );
    return res.status(400).json({
      error: "Request must include valid tag_name",
    });
  }

  try {
    // Create tag
    const newTag = await Tag.create(req.body);

    // Log success message
    console.log(
      `\x1b[32m[Successfully created tag ${newTag.id}: ${newTag.tag_name}]\x1b[0m`
    );

    // Send response
    return res.status(201).json(newTag);
  } catch (err) {
    console.error(
      `\x1b[31m[Error creating new tag: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: "Error creating new tag",
      error: `${err.name}, ${err.message}`,
    });
  }
});

// Update tag by id
// req.body example: { "tag_name": "on sale" }
router.put("/:id", async (req, res) => {
  try {
    // Find tag to update
    const originalTag = await Tag.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!originalTag) {
      console.error(
        `\x1b[33m[Error updating tag with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res
        .status(404)
        .json(
          `Error: Could not update tag with id ${req.params.id}: Not found`
        );
    }

    // Update tag
    const updatedCount = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
    });

    // Check for no change to tag
    if (updatedCount[1] === 0) {
      console.error(
        `\x1b[33m[Error updating tag with id ${req.params.id}: Request invalid or already exists]\x1b[0m`
      );
      return res.status(400).json({
        error: `Request is invalid or already exists`,
      });
    }

    // Collect updated tag data
    const updatedTag = await Tag.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Log success message
    console.log(
      `\x1b[32m[Successfully updated tag ${req.params.id}]\n[Name: ${originalTag.tag_name} > ${updatedTag.tag_name}]\x1b[0m`
    );

    // Send response
    return res.status(200).json({
      message: `Successfully updated tag ${req.params.id}`,
      update: updatedTag,
      original: originalTag,
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error updating tag with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error updating tag with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
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
      console.error(
        `\x1b[33m[Error deleting tag with id ${req.params.id}: Not found]\x1b[0m`
      );
      return res.status(404).json({
        error: `Could not delete tag with id ${req.params.id}: Not found`,
      });
    }

    // Delete tag
    await Tag.destroy({
      where: {
        id: tag.id,
      },
    });

    // Log success message
    console.log(
      `\x1b[32m[Successfully deleted tag ${req.params.id}: ${tag.tag_name}]\x1b[0m`
    );

    // Send response
    return res.status(200).json({
      message: `Successfully deleted tag ${req.params.id}, ${tag.tag_name}`,
    });
  } catch (err) {
    console.error(
      `\x1b[31m[Error deleting tag with id ${req.params.id}: ${err.name}]\n[${err.message}]\x1b[0m`
    );
    return res.status(500).json({
      message: `Error deleting tag with id ${req.params.id}`,
      error: `${err.name}, ${err.message}`,
    });
  }
});

module.exports = router;
