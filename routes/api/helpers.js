// NOTE: Future development - convert helper functions to classes

// Formatting helper functions for console table data
// ===================================================

// Function for ALL categories and associated products
function formatAllCategories(categories) {
  function CategoryTable(category, c_id, product, p_id, price, stock) {
    this.category = category;
    this.c_id = c_id;
    this.product = product;
    this.p_id = p_id;
    this.price = price;
    this.stock = stock;
  }
  const tableData = [];
  categories.forEach((category) => {
    if (category.products.length > 0) {
      category.products.forEach((product) => {
        tableData.push(
          new CategoryTable(
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
        new CategoryTable(
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
  return tableData;
}

// Function for SINGLE category and associated products
function formatSingleCategory(category) {
  if (category.products.length > 0) {
    function CategoryTable(product, p_id, price, stock) {
      this.product = product;
      this.p_id = p_id;
      this.price = price;
      this.stock = stock;
    }
    const products = category.products.map((product) => product.product_name);
    const productIds = category.products.map((product) => product.id);
    const prices = category.products.map((product) => product.price);
    const stocks = category.products.map((product) => product.stock);
    const tableData = products.map(
      (product, index) =>
        new CategoryTable(
          product,
          productIds[index],
          prices[index],
          stocks[index]
        )
    );
    return tableData;
  } else {
    const tableData = [
      {
        product: "None",
        p_id: "N/A",
        price: "N/A",
        stock: "N/A",
      },
    ];
    console.log(
      `\x1b[33m[Currently no products in category ${category.id}]\x1b[0m`
    );
    return tableData;
  }
}

// Function for ALL products and associated categories/tags
function formatAllProducts(products) {
  function ProductTable(product, p_id, price, stock, tags, category, c_id) {
    this.product = product;
    this.p_id = p_id;
    this.price = price;
    this.stock = stock;
    this.tags = tags;
    this.category = category;
    this.c_id = c_id;
  }
  const tableData = [];
  products.forEach((product) => {
    let tags = "";
    if (product.tags.length > 0) {
      tags = product.tags.map((tag) => tag.tag_name).join(", ");
      tableData.push(
        new ProductTable(
          product.product_name,
          product.id,
          product.price,
          product.stock,
          tags,
          product.category.category_name,
          product.category.id
        )
      );
    } else {
      tableData.push(
        new ProductTable(
          product.product_name,
          product.id,
          product.price,
          product.stock,
          "None",
          product.category.category_name,
          product.category.id
        )
      );
    }
  });
  return tableData;
}

// Function for SINGLE product and associated category/tags
function formatSingleProduct(product) {
  function ProductTable(product, p_id, price, stock, tags, category, c_id) {
    this.product = product;
    this.p_id = p_id;
    this.price = price;
    this.stock = stock;
    this.tags = tags;
    this.category = category;
    this.c_id = c_id;
  }
  const tableData = [];
  if (product.tags.length > 0) {
    const products = [product.product_name];
    const productIds = [product.id];
    const prices = [product.price];
    const stocks = [product.stock];
    const tags = product.tags.map((tag) => tag.tag_name);
    const categories = [product.category.category_name];
    const categoryIds = [product.category.id];
    tableData.push(
      new ProductTable(
        products[0],
        productIds[0],
        prices[0],
        stocks[0],
        tags.join(", "),
        categories[0],
        categoryIds[0]
      )
    );
  } else {
    tableData.push(
      new ProductTable(
        product.product_name,
        product.id,
        product.price,
        product.stock,
        "None",
        product.category.category_name,
        product.category.id
      )
    );
    console.log(`\x1b[33m[Currently no tags for product ${product.id}]\x1b[0m`);
  }
  return tableData;
}

// Function for ALL tags and associated products
function formatAllTags(tags) {
  function TagTable(tag, t_id, product, p_id, price, stock) {
    this.tag = tag;
    this.t_id = t_id;
    this.product = product;
    this.p_id = p_id;
    this.price = price;
    this.stock = stock;
  }
  const tableData = [];
  tags.forEach((tag) => {
    if (tag.products.length > 0) {
      tag.products.forEach((product) => {
        tableData.push(
          new TagTable(
            tag.tag_name,
            tag.id,
            product.product_name,
            product.id,
            product.price,
            product.stock
          )
        );
      });
    } else {
      tableData.push(
        new TagTable(tag.tag_name, tag.id, "None", "N/A", "N/A", "N/A")
      );
    }
  });
  return tableData;
}

// Function for SINGLE tag and associated products
function formatSingleTag(tag) {
  if (tag.products.length > 0) {
    function TagTable(product, p_id, price, stock) {
      this.product = product;
      this.p_id = p_id;
      this.price = price;
      this.stock = stock;
    }
    const products = tag.products.map((product) => product.product_name);
    const productIds = tag.products.map((product) => product.id);
    const prices = tag.products.map((product) => product.price);
    const stocks = tag.products.map((product) => product.stock);
    const tableData = products.map(
      (product, index) =>
        new TagTable(product, productIds[index], prices[index], stocks[index])
    );
    return tableData;
  } else {
    const tableData = [
      {
        product: "None",
        p_id: "N/A",
        price: "N/A",
        stock: "N/A",
      },
    ];
    console.log(`\x1b[33m[Currently no products with tag ${tag.id}]\x1b[0m`);
    return tableData;
  }
}

// Export helper functions
module.exports = {
  formatAllCategories,
  formatSingleCategory,
  formatAllProducts,
  formatSingleProduct,
  formatAllTags,
  formatSingleTag,
};
