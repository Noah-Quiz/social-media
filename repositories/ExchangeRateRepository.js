const { default: mongoose } = require("mongoose");
const ExchangeRate = require("../entities/ExchangeRateEntity");

class ExchangeRateRepository {
  // Create a new exchange rate, marking the previous one as deleted if it exists
  async createNewExchangeRateRepository(data) {
    const session = await mongoose.startSession(); // Start a session for the transaction
    session.startTransaction(); // Begin the transaction

    try {
      // Check if there is an existing rate with the same name
      const previous = await this.getCurrentRateRepository({ name: data.name });

      // If previous rate exists, mark it as soft deleted
      if (previous) {
        await this.softDeleteRateRepository({ name: previous.name }, session); // Pass session for transaction
      }

      // Create the new exchange rate document
      const exchangeRate = await ExchangeRate.create([data], { session }); // Create within the transaction

      // Commit the transaction
      await session.commitTransaction();

      // End the session
      session.endSession();

      return exchangeRate;
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();

      throw new Error("Error creating exchange rate: " + error.message);
    }
  }

  // Get the current non-deleted exchange rate by name or id
  async getCurrentRateRepository({ name, id }) {
    try {
      const query = id
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { name: name };
      const exchangeRate = await ExchangeRate.findOne({
        ...query,
        isDeleted: false,
      });
      return exchangeRate;
    } catch (error) {
      throw new Error(`Error getting rate: ${error.message}`);
    }
  }

  // Soft delete an exchange rate by marking it as isDeleted, can accept either name or id
  async softDeleteRateRepository({ name, id }) {
    try {
      const query = id
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { name: name };
      const exchangeRate = await ExchangeRate.findOneAndUpdate(
        { ...query, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      return exchangeRate;
    } catch (error) {
      throw new Error(`Error soft deleting rate: ${error.message}`);
    }
  }

  // Update the value and/or description of a rate, can accept either name or id
  async updateRateRepository({ name, id }, value, description) {
    try {
      const query = id
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { name: name };
      const exchangeRate = await ExchangeRate.findOne({
        ...query,
        isDeleted: false,
      });

      if (exchangeRate) {
        if (value && value !== exchangeRate.value) {
          exchangeRate.value = value;
        }
        if (description && description !== exchangeRate.description) {
          exchangeRate.description = description;
        }
        await exchangeRate.save();
        return exchangeRate;
      } else {
        throw new Error("Rate not found or is deleted");
      }
    } catch (error) {
      throw new Error(`Error updating rate: ${error.message}`);
    }
  }

  // Method to fetch all exchange rates as a key-value object
  async getAllRatesAsObjectRepository() {
    try {
      // Fetch all non-deleted exchange rates
      const exchangeRates = await ExchangeRate.find({
        isDeleted: false,
      });

      // Aggregate them into an object
      const ratesObject = exchangeRates.reduce((acc, rate) => {
        acc[rate.name] = rate.value;
        return acc;
      }, {});

      return ratesObject;
    } catch (error) {
      throw new Error(`Error fetching all rates: ${error.message}`);
    }
  }
}

module.exports = ExchangeRateRepository;
