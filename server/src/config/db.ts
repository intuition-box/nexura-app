import mongoose from "mongoose";
import { DB_URI } from "@/utils/env.utils";
import logger from "./logger";

/** Drop legacy non-sparse unique indexes across all collections so current schema takes effect */
async function fixStaleIndexes() {
	const db = mongoose.connection;
	// Map: collection name → index names to drop if they exist
	const indexFixes: Record<string, string[]> = {
		projects: ["guildId_1", "verifiedId_1", "xUsername_1", "address_1", "email_1"],
		"hub-admins": ["address_1", "xUsername_1"],
		users: ["email_1"],
		campaigns: ["email_1", "address_1"],
	};

	for (const [colName, toDrop] of Object.entries(indexFixes)) {
		try {
			const col = db.collection(colName);
			const indexes = await col.indexes();
			for (const name of toDrop) {
				if (indexes.find((i: any) => i.name === name)) {
					await col.dropIndex(name);
					logger.info(`DB: dropped stale index ${name} on ${colName}`);
				}
			}
		} catch (err: any) {
			// Non-fatal — collection may not exist yet
			logger.warn(`DB: fixStaleIndexes(${colName}) skipped: ${err.message}`);
		}
	}
}

const connectDB = async () => {
	try {
		const connect = await mongoose.connect(DB_URI, { family: 4 });
		logger.info(
			`\x1b[36m%s\x1b[0m`,
			`DB: MongoDB Connected: ${connect.connection.host}`
		);
		await fixStaleIndexes();
	} catch (error: any) {
		logger.error(
			`\x1b[31m%s\x1b[0m`,
			`DB: MongoDB Connection Failure: ${error.message}`
		);
		// Do not exit — let the server keep running so other routes are accessible
	}
};

export default connectDB;
