export const RELATED_MODEL_SECTIONS = {
  Asset: "assets",
  Income: "income",
  Liability: "liability",
  PartnershipAccount: "partnership",
  CashBook: "cashbook",
  Capital: "capital",
  Owner: "owner",
  Employee: "employee",
  PropertyAccount: "property-accounts",
};

export const RELATED_MODEL_LABELS = {
  Asset: "Asset",
  Income: "Income",
  Liability: "Liability",
  PartnershipAccount: "Partnership Account",
  CashBook: "Cash Book",
  Capital: "Capital",
  Owner: "Owner",
  Employee: "Employee",
  PropertyAccount: "Property Account",
};

export const getFinancialPaymentsDetailsPath = (relatedModel, relatedId) =>
  `/financial-payments/related/${relatedModel}/${relatedId}/details`;

export const getMasterDataBackPath = (relatedModel) => {
  const section = RELATED_MODEL_SECTIONS[relatedModel];
  return section ? `/master-data?section=${section}` : "/master-data";
};
