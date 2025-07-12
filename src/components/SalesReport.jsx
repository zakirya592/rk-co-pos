import React, { useState, useEffect } from "react";
import { Card, Input, Select, SelectItem, Button, CardBody } from '@nextui-org/react';
import { FaCalendarAlt } from 'react-icons/fa';
import userRequest from '../utils/userRequest';

const SalesReport = () => {
  const [selectedView, setSelectedView] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize dates on component mount
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    // Set date ranges based on selected view
    const today = new Date();
    let start, end;

    switch (selectedView) {
      case 'day':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    fetchSalesData();
  }, [selectedView]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const res = await userRequest.get(
        `/sales/by-customer`,
        {
          params: {
            startDate,
            endDate,
            paymentStatus: '',
            minTotalAmount: '',
            maxTotalAmount: '',
            minTotalDue: '',
            maxTotalDue: '',
            invoiceNumber: '',
            customer: '',
          },
        }
      );
      setSalesData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    fetchSalesData();
  };

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex gap-4 mb-4">
          <Select
            label="View By"
            value={selectedView}
            onValueChange={(value) => {
              setSelectedView(value);
              fetchSalesData();
            }}
            className="w-40"
          >
            <SelectItem key="day" value="day">Day</SelectItem>
            <SelectItem key="month" value="month">Month</SelectItem>
            <SelectItem key="year" value="year">Year</SelectItem>
          </Select>
          
          {selectedView === 'day' ? (
            <div className="flex gap-2">
              <Select
                label="Select Day of Week"
                value={startDate}
                onValueChange={(value) => {
                  const today = new Date();
                  const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  selectedDate.setDate(today.getDate() - today.getDay() + parseInt(value));
                  setStartDate(selectedDate.toISOString().split('T')[0]);
                  handleDateChange('start', selectedDate.toISOString().split('T')[0]);
                }}
                className="w-40"
              >
                <SelectItem key="0" value="1">Monday</SelectItem>
                <SelectItem key="1" value="2">Tuesday</SelectItem>
                <SelectItem key="2" value="3">Wednesday</SelectItem>
                <SelectItem key="3" value="4">Thursday</SelectItem>
                <SelectItem key="4" value="5">Friday</SelectItem>
                <SelectItem key="5" value="6">Saturday</SelectItem>
                <SelectItem key="6" value="7">Sunday</SelectItem>
              </Select>
            </div>
          ) : null}
          
          <Button
            color="primary"
            onClick={fetchSalesData}
            isLoading={loading}
          >
            Fetch Data
          </Button>
        </div>

        {/* Sales Data Table will go here */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Sales Data</h3>
          {loading ? (
            <div className="flex justify-center items-center">
              <FaCalendarAlt className="animate-spin text-2xl" />
            </div>
          ) : (
            <div>
              {/* Add your sales data table here */}
              <pre>{JSON.stringify(salesData, null, 2)}</pre>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default SalesReport;
