import FundingInstrument from "./funding-instrument";

var EXPECTED_CREDIT_DAYS_OFFSET = 1;
var BankAccount = FundingInstrument.extend({
  expectedCreditDaysOffset: EXPECTED_CREDIT_DAYS_OFFSET,
});

export default BankAccount;
