const mongoose = require("mongoose");
require("dotenv").config();
const getLoggers = require("../utils/logger");
const logger = getLoggers("MONGOOSE");
const URI =
  process.env.DATABASE_URI ||
  "mongodb+srv://tamlqhse182931:6Pikk8NHRgL2RcZ7@cluster0.dielg.mongodb.net/";

const DBName = process.env.DATABASE_NAME || "Cluster0";

class BaseDatabaseTransaction {
  constructor() {
    this.session = null;
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(URI, { dbName: DBName });
      logger.info(`Successfully connected to the database ${DBName}`);
    } catch (error) {
      logger.error("Database connection error:", error.message);
      throw new Error(error.message);
    }
  }

  async startTransaction() {
    try {
      this.session = await mongoose.startSession();
      this.session.startTransaction();
      return this.session;
    } catch (error) {
      logger.error("Error starting transaction:", error.message);
      throw new Error(error.message);
    }
  }

  async commitTransaction() {
    try {
      if (this.session) {
        await this.session.commitTransaction();
        logger.info("Commit change to database successfully!");
      }
    } catch (error) {
      logger.error("Error committing transaction:", error.message);
      throw new Error(error.message);
    } finally {
      await this.endSession(); // Ensure session is ended after commit
    }
  }

  async abortTransaction() {
    try {
      if (this.session) {
        await this.session.abortTransaction();
        logger.info("Transaction aborted!");
      }
    } catch (error) {
      logger.error("Error aborting transaction:", error.message);
      throw new Error(error.message);
    } finally {
      await this.endSession(); // Ensure session is ended after abort
    }
  }

  async endSession() {
    if (this.session) {
      await this.session.endSession();
      this.session = null; // Clear session reference
      logger.info("Session ended.");
    }
  }
}

module.exports = BaseDatabaseTransaction;