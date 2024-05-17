const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const sequelize = require("./config/connection");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_NAME = process.env.DB_NAME;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// Sync sequelize models to db, then start server
console.log(
  `\x1b[32m[sequelize] attempting sync to database \`${DB_NAME}\`\x1b[0m`
);
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () =>
    console.log(
      `\x1b[32m[Sync successful]\n[App listening on PORT:${PORT}]\x1b[0m`
    )
  );
});
