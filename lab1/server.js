import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import apiRoutes from "./routes/api.js";

// Get current directory path (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Create necessary directories if they don't exist
const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "public", "uploads");

fs.ensureDirSync(dataDir);
fs.ensureDirSync(uploadsDir);

// Create initial JSON and XML files if they don't exist
const jsonFilePath = path.join(dataDir, "passports.json");
const xmlFilePath = path.join(dataDir, "passports.xml");

if (!fs.existsSync(jsonFilePath)) {
	fs.writeJsonSync(jsonFilePath, []);
}

if (!fs.existsSync(xmlFilePath)) {
	fs.writeFileSync(
		xmlFilePath,
		'<?xml version="1.0" encoding="UTF-8"?>\n<passports>\n</passports>'
	);
}

// API routes
app.use("/api", apiRoutes);

// Fallback route for SPA
app.get(/(.*)/, (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
