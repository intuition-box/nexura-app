import express from "express";
import cors from "cors";
import { port } from "@/utils/env.utils";
import DB from "@/config/db";
import logger from "@/config/logger";
import appRoutes from "@/routes";
import helmet from "helmet";

const server = express();

server.use(cors({ origin: ["http://localhost:5173", "https://nexura-app.vercel.app"] }));
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api", appRoutes);

server.listen(port, async () => {
	await DB();
	logger.info(`Server is running on port ${port}`);
});
