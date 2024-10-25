const CurrencyConverter = require("currency-converter-lt");

const convertMoney = async (amount, fromCurrency, toCurrency) => {
  try {
    const currencyConverter = new CurrencyConverter({
      from: fromCurrency,
      to: toCurrency,
      amount: amount,
    });
    const result = await currencyConverter.convert();
    return result;
  } catch (error) {
    return error;
  }
};

module.exports = {
  convertMoney,
};
