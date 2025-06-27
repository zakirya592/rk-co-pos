
import React from 'react';
import { Card, CardBody } from '@nextui-org/react';

const Reports = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600">View sales and inventory reports</p>
      </div>
      
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Reports Dashboard</h3>
            <p className="text-gray-600">Detailed reports and analytics coming soon...</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;
