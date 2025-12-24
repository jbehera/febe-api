import dotenv from 'dotenv';
dotenv.config();
import { logger } from "../utils/logger";

import "../services/email/email-worker";

logger.info("Email Worker process started");
