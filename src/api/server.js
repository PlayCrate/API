const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const graf = require("./routes/grafana");
const twitter = require("./routes/following");
const { server } = require("../../config.json");

app.use(morgan("dev"));
app.use(
  cors({
    origin:
      server.type === "production"
        ? ["https://grafana.kattah.me", "https://roblox.com"]
        : "*",
  })
);
app.use([graf, twitter]);

app.listen(server.port, () => {
  console.log(`Server is running on port ${server.port}`);
});
