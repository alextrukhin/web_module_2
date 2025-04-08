import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import xml2js from "xml2js";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up router
const router = express.Router();

// File paths
const dataDir = path.join(__dirname, "..", "data");
const jsonFilePath = path.join(dataDir, "passports.json");
const xmlFilePath = path.join(dataDir, "passports.xml");
const uploadsDir = path.join(__dirname, "..", "public", "uploads");

// Configure multer for file upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, "photo-" + uniqueSuffix + ext);
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB max file size
	},
	fileFilter: (req, file, cb) => {
		const filetypes = /jpeg|jpg|png|gif/;
		const mimetype = filetypes.test(file.mimetype);
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);

		if (mimetype && extname) {
			return cb(null, true);
		}

		cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"));
	},
});

// Helper function to read JSON data
async function readJsonData() {
	try {
		const data = await fs.readJson(jsonFilePath);
		return data;
	} catch (error) {
		console.error("Error reading JSON file:", error);
		return [];
	}
}

// Helper function to write JSON data
async function writeJsonData(data) {
	try {
		await fs.writeJson(jsonFilePath, data, { spaces: 2 });
		return true;
	} catch (error) {
		console.error("Error writing JSON file:", error);
		return false;
	}
}

// Helper function to read XML data
async function readXmlData() {
	try {
		const xmlData = await fs.readFile(xmlFilePath, "utf8");
		const parser = new xml2js.Parser({ explicitArray: false });
		const result = await parser.parseStringPromise(xmlData);

		if (!result.passports) {
			return [];
		}

		if (!result.passports.passport) {
			return [];
		}

		// Ensure we always return an array
		return Array.isArray(result.passports.passport)
			? result.passports.passport
			: [result.passports.passport];
	} catch (error) {
		console.error("Error reading XML file:", error);
		return [];
	}
}

// Helper function to write XML data
async function writeXmlData(data) {
	try {
		const builder = new xml2js.Builder({
			rootName: "passports",
			xmldec: { version: "1.0", encoding: "UTF-8" },
		});
		const xml = builder.buildObject({ passport: data });

		await fs.writeFile(xmlFilePath, xml);
		return true;
	} catch (error) {
		console.error("Error writing XML file:", error);
		return false;
	}
}

// GET data in specific format (JSON or XML)
// This specific route must come before the parametrized route
router.get("/passports/format/:format", async (req, res) => {
	try {
		const format = req.params.format.toLowerCase();

		if (format === "json") {
			const data = await fs.readFile(jsonFilePath, "utf8");
			res.type("text").send(data);
		} else if (format === "xml") {
			const data = await fs.readFile(xmlFilePath, "utf8");
			res.type("text").send(data);
		} else {
			res.status(400).json({
				message: 'Invalid format. Use "json" or "xml".',
			});
		}
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving data",
			error: error.message,
		});
	}
});

// GET all passport records
router.get("/passports", async (req, res) => {
	try {
		const data = await readJsonData();
		res.json(data);
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving passport records",
			error: error.message,
		});
	}
});

// GET a single passport record by ID
router.get("/passports/:id", async (req, res) => {
	try {
		const data = await readJsonData();
		const record = data.find((item) => item.id === req.params.id);

		if (!record) {
			return res.status(404).json({ message: "Record not found" });
		}

		res.json(record);
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving passport record",
			error: error.message,
		});
	}
});

// POST - Create a new passport record
router.post("/passports", upload.single("photo"), async (req, res) => {
	try {
		// Create new record
		const newRecord = {
			id: uuidv4(),
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			middleName: req.body.middleName,
			address: req.body.address,
			idNumber: req.body.idNumber,
			photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
			createdAt: new Date().toISOString(),
		};

		// Update JSON data
		const jsonData = await readJsonData();
		jsonData.push(newRecord);
		await writeJsonData(jsonData);

		// Update XML data
		const xmlData = await readXmlData();
		xmlData.push(newRecord);
		await writeXmlData(xmlData);

		res.status(201).json({
			message: "Record created successfully",
			record: newRecord,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error creating passport record",
			error: error.message,
		});
	}
});

// PUT - Update a passport record
router.put("/passports/:id", upload.single("photo"), async (req, res) => {
	try {
		const recordId = req.params.id;

		// Read current data
		const jsonData = await readJsonData();
		const recordIndex = jsonData.findIndex((item) => item.id === recordId);

		if (recordIndex === -1) {
			return res.status(404).json({ message: "Record not found" });
		}

		// Get the existing record
		const existingRecord = jsonData[recordIndex];

		// Prepare updated record
		const updatedRecord = {
			...existingRecord,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			middleName: req.body.middleName,
			address: req.body.address,
			idNumber: req.body.idNumber,
			updatedAt: new Date().toISOString(),
		};

		// Update photo if a new one was uploaded
		if (req.file) {
			// Delete old photo if exists
			if (existingRecord.photoUrl) {
				const oldPhotoPath = path.join(
					__dirname,
					"..",
					"public",
					existingRecord.photoUrl
				);
				if (fs.existsSync(oldPhotoPath)) {
					await fs.unlink(oldPhotoPath);
				}
			}

			updatedRecord.photoUrl = `/uploads/${req.file.filename}`;
		}

		// Update JSON data
		jsonData[recordIndex] = updatedRecord;
		await writeJsonData(jsonData);

		// Update XML data
		const xmlData = await readXmlData();
		const xmlRecordIndex = xmlData.findIndex(
			(item) => item.id === recordId
		);

		if (xmlRecordIndex !== -1) {
			xmlData[xmlRecordIndex] = updatedRecord;
			await writeXmlData(xmlData);
		}

		res.json({
			message: "Record updated successfully",
			record: updatedRecord,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error updating passport record",
			error: error.message,
		});
	}
});

// DELETE - Delete a passport record
router.delete("/passports/:id", async (req, res) => {
	try {
		const recordId = req.params.id;

		// Read current data
		const jsonData = await readJsonData();
		const recordIndex = jsonData.findIndex((item) => item.id === recordId);

		if (recordIndex === -1) {
			return res.status(404).json({ message: "Record not found" });
		}

		// Get the record to be deleted (to access photo URL)
		const recordToDelete = jsonData[recordIndex];

		// Delete photo file if it exists
		if (recordToDelete.photoUrl) {
			const photoPath = path.join(
				__dirname,
				"..",
				"public",
				recordToDelete.photoUrl
			);
			if (fs.existsSync(photoPath)) {
				await fs.unlink(photoPath);
			}
		}

		// Update JSON data
		jsonData.splice(recordIndex, 1);
		await writeJsonData(jsonData);

		// Update XML data
		const xmlData = await readXmlData();
		const xmlRecordIndex = xmlData.findIndex(
			(item) => item.id === recordId
		);

		if (xmlRecordIndex !== -1) {
			xmlData.splice(xmlRecordIndex, 1);
			await writeXmlData(xmlData);
		}

		res.json({ message: "Record deleted successfully" });
	} catch (error) {
		res.status(500).json({
			message: "Error deleting passport record",
			error: error.message,
		});
	}
});

export default router;
