import mongoose from "mongoose";
import { DB_URI } from "@/utils/env.utils";
import logger from "./logger";

const connectDB = async () => {
	try {
		const connect = await mongoose.connect(DB_URI);
		logger.info(
			`\x1b[36m%s\x1b[0m`,
			`DB: MongoDB Connected: ${connect.connection.host}`
		);
	} catch (error: any) {
		logger.error(
			`\x1b[31m%s\x1b[0m`,
			`DB: MongoDB Connection Failure: ${error.message}`
		);
		process.exit(1);
	}
};

export default connectDB;
