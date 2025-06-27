
import React from 'react';
import { Card, CardBody } from '@nextui-org/react';

const History = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">History</h1>
        <p className="text-gray-600">View transaction history</p>
      </div>
      
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
            <p className="text-gray-600">Sales history and transaction logs coming soon...</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default History;
