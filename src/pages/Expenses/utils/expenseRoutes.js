import {
  EXPENSE_CATEGORY_ENDPOINTS,
  formatPayeeTypeLabel,
} from '../../Vouchers/utils/expensePayeeTypes';

export const EXPENSE_TYPE_TO_SLUG = {
  procurement: 'procurement',
  warehouse: 'warehouse',
  sales_distribution: 'sales-distribution',
  operational: 'operational',
  miscellaneous: 'miscellaneous',
  logistics: 'logistics',
  financial: 'financial',
};

export const SLUG_TO_EXPENSE_TYPE = Object.fromEntries(
  Object.entries(EXPENSE_TYPE_TO_SLUG).map(([type, slug]) => [slug, type])
);

export const slugToExpenseType = (slug) => SLUG_TO_EXPENSE_TYPE[slug] || slug;

export const expenseTypeToSlug = (expenseType) =>
  EXPENSE_TYPE_TO_SLUG[expenseType] || expenseType;

export const getExpenseListPath = (expenseType) =>
  EXPENSE_CATEGORY_ENDPOINTS[expenseType] ||
  `/expenses/${expenseTypeToSlug(expenseType)}`;

export const getExpenseDetailsPath = (expenseType, id) =>
  `${getExpenseListPath(expenseType)}/${id}`;

export const getExpenseTransactionDetailsPath = (expenseType, id) =>
  `${getExpenseListPath(expenseType)}/${id}/transaction-details`;

export const getExpenseTypeLabel = (expenseType) =>
  formatPayeeTypeLabel(expenseType);
