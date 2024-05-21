// Formatting helper functions for console table data
// ===================================================

// Function for ALL categories and associated products
function formatAllCategories(categories) {
  class CategoryTable {
    constructor(category, c_id, products) {
      this.category = category;
      this.c_id = c_id;
      this.products = products;
    }
  }

  const tableData = [];
  categories.forEach((category) => {
    if (category.products.length > 0) {
      const products = category.products
        .map((product) => product.product_name)
        .join(", ");
      tableData.push(
        new CategoryTable(category.category_name, category.id, products)
      );
    } else {
      tableData.push(
        new CategoryTable(category.category_name, category.id, "None")
      );
    }
  });
  return tableData;
}

// Function for SINGLE category and associated products
function formatSingleCategory(category) {
  class CategoryTable {
    constructor(product, p_id, price, stock) {
      this.product = product;
      this.p_id = p_id;
      this.price = price;
      this.stock = stock;
    }
  }

  if (category.products.length > 0) {
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
  class ProductTable {
    constructor(product, p_id, price, stock, tags, category, c_id) {
      this.product = product;
      this.p_id = p_id;
      this.price = price;
      this.stock = stock;
      this.tags = tags;
      this.category = category;
      this.c_id = c_id;
    }
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
  class ProductTable {
    constructor(tags, price, stock, category, c_id) {
      this.tags = tags;
      this.price = price;
      this.stock = stock;
      this.category = category;
      this.c_id = c_id;
    }
  }

  if (product.tags.length > 0) {
    const tags = product.tags.map((tag) => tag.tag_name).join(", ");
    const prices = [product.price];
    const stocks = [product.stock];
    const categories = [product.category.category_name];
    const categoryIds = [product.category.id];
    const tableData = prices.map(
      (price, index) =>
        new ProductTable(
          tags,
          price,
          stocks[index],
          categories[index],
          categoryIds[index]
        )
    );
    return tableData;
  } else {
    const tableData = [
      {
        tags: "None",
        price: "N/A",
        stock: "N/A",
        category: "N/A",
        c_id: "N/A",
      },
    ];
    console.log(`\x1b[33m[Currently no tags for product ${product.id}]\x1b[0m`);
    return tableData;
  }
}

// Function for ALL tags and associated products
function formatAllTags(tags) {
  class TagTable {
    constructor(tag, t_id, products) {
      this.tag = tag;
      this.t_id = t_id;
      this.products = products;
    }
  }

  const tableData = [];
  tags.forEach((tag) => {
    if (tag.products.length > 0) {
      const products = tag.products
        .map((product) => product.product_name)
        .join(", ");
      tableData.push(new TagTable(tag.tag_name, tag.id, products));
    } else {
      tableData.push(new TagTable(tag.tag_name, tag.id, "None"));
    }
  });
  return tableData;
}

// Function for SINGLE tag and associated products
function formatSingleTag(tag) {
  class TagTable {
    constructor(product, p_id, price, stock) {
      this.product = product;
      this.p_id = p_id;
      this.price = price;
      this.stock = stock;
    }
  }

  if (tag.products.length > 0) {
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
