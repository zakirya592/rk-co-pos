export const EXPENSE_PAYEE_TYPES = [
  { key: 'procurement', label: 'Procurement' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'sales_distribution', label: 'Sales Distribution' },
  { key: 'operational', label: 'Operational' },
  { key: 'miscellaneous', label: 'Miscellaneous' },
  { key: 'logistics', label: 'Logistics' },
  { key: 'financial', label: 'Financial' },
];

export const EXPENSE_CATEGORY_ENDPOINTS = {
  procurement: '/expenses/procurement',
  warehouse: '/expenses/warehouse',
  sales_distribution: '/expenses/sales-distribution',
  operational: '/expenses/operational',
  miscellaneous: '/expenses/miscellaneous',
  logistics: '/expenses/logistics',
  financial: '/expenses/financial',
};

export const EXPENSE_PAYEE_TYPE_KEYS = EXPENSE_PAYEE_TYPES.map((type) => type.key);

export const isExpensePayeeType = (payeeType) =>
  EXPENSE_PAYEE_TYPE_KEYS.includes(payeeType);

export const normalizeCategoryExpensesResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (data?.data?.expenses && Array.isArray(data.data.expenses)) {
    return data.data.expenses;
  }
  if (Array.isArray(data)) return data;
  return [];
};

export const formatPayeeTypeLabel = (payeeType) => {
  const match = EXPENSE_PAYEE_TYPES.find((type) => type.key === payeeType);
  if (match) return match.label;
  if (!payeeType) return 'Payee';
  return payeeType
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const getExpenseDisplayName = (expense, payeeType) => {
  if (!expense) return '';

  const amount = expense.totalCost ?? expense.totalAmount;
  const withAmount = (label) =>
    label && amount != null ? `${label} - ${amount}` : label || '';

  if (expense.referCode) {
    if (expense.description) return `${expense.referCode} - ${expense.description}`;
    return expense.referCode;
  }

  switch (payeeType) {
    case 'procurement': {
      const invoice = expense.invoiceNo || expense.purchaseOrderNo;
      const supplier = expense.supplier?.name;
      if (invoice && supplier) return withAmount(`${invoice} - ${supplier}`);
      if (invoice) return withAmount(invoice);
      if (supplier) return withAmount(supplier);
      break;
    }
    case 'warehouse': {
      const warehouse = expense.warehouse?.name;
      const subType = expense.expenseSubType;
      if (warehouse && subType) return withAmount(`${warehouse} - ${subType}`);
      if (warehouse) return withAmount(warehouse);
      if (subType) return withAmount(subType);
      break;
    }
    case 'logistics': {
      const transporter = expense.transporter?.name;
      const route = expense.route;
      if (route && transporter) return withAmount(`${route} - ${transporter}`);
      if (route) return withAmount(route);
      if (transporter) return withAmount(transporter);
      break;
    }
    case 'sales_distribution': {
      const label =
        expense.description || expense.expenseSubType || expense.customer?.name;
      if (label) return withAmount(String(label));
      break;
    }
    case 'operational': {
      const label = expense.department || expense.expenseSubType || expense.notes;
      if (label) return withAmount(String(label));
      break;
    }
    case 'miscellaneous': {
      const label = expense.description || expense.expenseSubType;
      if (label) return withAmount(String(label));
      break;
    }
    case 'financial': {
      const label = expense.expenseSubType?.replace(/_/g, ' ');
      if (label) return withAmount(label);
      break;
    }
    default:
      break;
  }

  if (expense.description) return withAmount(expense.description);
  if (amount != null) {
    return withAmount(formatPayeeTypeLabel(payeeType || expense.expenseType));
  }
  return expense._id || '';
};
