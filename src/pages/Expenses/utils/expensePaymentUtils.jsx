import React from 'react';

const getPaymentInfo = (expense) => expense?.paymentInfo ?? null;

export const getExpenseAmount = (expense) => {
  const info = getPaymentInfo(expense);
  if (info?.expenseAmount != null) {
    return Number(info.expenseAmount) || 0;
  }
  return Number(expense?.amountInPKR ?? expense?.totalCost) || 0;
};

export const getPaidAmount = (expense) => {
  const info = getPaymentInfo(expense);
  if (!info) return 0;
  return Number(info.totalPaid ?? info.paidAmount) || 0;
};

export const getRemainingAmount = (expense) => {
  const info = getPaymentInfo(expense);
  if (!info) return 0;
  return Number(info.remainingBalance) || 0;
};

export const renderTotalAmountCell = (expense) => (
  <div className="flex flex-col">
    <p className="text-bold text-sm">
      PKR {getExpenseAmount(expense).toLocaleString()}
    </p>
  </div>
);

export const renderAmountCell = (expense) => {
  const pkrAmount = getExpenseAmount(expense);
  const foreignTotal = Number(expense?.totalCost) || 0;
  const currencySymbol = expense?.currency?.symbol || 'Rs';
  const currencyCode = expense?.currency?.code;
  const showForeign =
    currencyCode &&
    currencyCode !== 'PKR' &&
    foreignTotal > 0 &&
    foreignTotal !== pkrAmount;

  if (!showForeign) {
    return renderTotalAmountCell(expense);
  }

  return (
    <div className="flex flex-col">
      <p className="text-bold text-sm">
        {currencySymbol} {foreignTotal.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500">PKR {pkrAmount.toLocaleString()}</p>
    </div>
  );
};

export const renderPaidAmountCell = (expense) => (
  <div className="flex flex-col">
    <p className="text-bold text-sm text-green-600">
      PKR {getPaidAmount(expense).toLocaleString()}
    </p>
  </div>
);

export const renderRemainingAmountCell = (expense) => (
  <div className="flex flex-col">
    <p
      className={`text-bold text-sm ${
        getRemainingAmount(expense) > 0 ? 'text-amber-600' : 'text-gray-700'
      }`}
    >
      PKR {getRemainingAmount(expense).toLocaleString()}
    </p>
  </div>
);

export const PAID_AMOUNT_COLUMN = { name: 'PAID AMOUNT', uid: 'paidAmount' };
export const REMAINING_AMOUNT_COLUMN = { name: 'REMAINING AMOUNT', uid: 'remainingAmount' };
