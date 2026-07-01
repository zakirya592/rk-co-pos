import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { FaExchangeAlt } from 'react-icons/fa';
import { getExpenseTransactionDetailsPath } from '../utils/expenseRoutes';

const ViewExpenseTransactionsButton = ({
  expenseType,
  expenseId,
  label = 'Transactions',
  ...props
}) => {
  const navigate = useNavigate();

  if (!expenseType || !expenseId) return null;

  return (
    <Button
      variant="flat"
      color="secondary"
      startContent={<FaExchangeAlt />}
      onPress={() =>
        navigate(getExpenseTransactionDetailsPath(expenseType, expenseId))
      }
      {...props}
    >
      {label}
    </Button>
  );
};

export default ViewExpenseTransactionsButton;
