import mongoose from "mongoose";
import { DB_URI } from "@/utils/env.utils";
import logger from "./logger";

/** Drop legacy non-sparse unique indexes on hub collection so sparse ones take effect */
async function fixHubIndexes() {
	try {
		const col = mongoose.connection.collection("projects");
		const indexes = await col.indexes();
		const toDrop = ["guildId_1", "verifiedId_1", "xUsername_1", "address_1", "email_1"];
		for (const name of toDrop) {
			if (indexes.find((i: any) => i.name === name)) {
				await col.dropIndex(name);
				logger.info(`DB: dropped legacy index ${name} on projects collection`);
			}
		}
	} catch (err: any) {
		// Non-fatal — indexes may already be correct or collection may not exist yet
		logger.warn(`DB: fixHubIndexes skipped: ${err.message}`);
	}
}

const connectDB = async () => {
	try {
		const connect = await mongoose.connect(DB_URI, { family: 4 });
		logger.info(
			`\x1b[36m%s\x1b[0m`,
			`DB: MongoDB Connected: ${connect.connection.host}`
		);
		await fixHubIndexes();
	} catch (error: any) {
		logger.error(
			`\x1b[31m%s\x1b[0m`,
			`DB: MongoDB Connection Failure: ${error.message}`
		);
		// Do not exit — let the server keep running so other routes are accessible
	}
};

export default connectDB;
