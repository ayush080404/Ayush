import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Mount all routes under /api
app.use("/api", routes);

export default app;
``