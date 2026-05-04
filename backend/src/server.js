import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

// ✅ BACKEND SHOULD NEVER RUN ON 5173
const PORT = process.env.PORT || 5001;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
``