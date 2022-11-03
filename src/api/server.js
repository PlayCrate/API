const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const graf = require("./routes/grafana");
const { grafana } = require("../../config.json");

app.use(morgan("dev"));
app.use(cors());
app.use(graf);

app.listen(grafana.port, () => {
  console.log(`Server is running on port ${grafana.port}`);
});
