import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardBody, Button, Chip, Divider, Spinner } from '@nextui-org/react';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value ?? 'N/A'}</span>
  </div>
);

const LogisticsExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [expense, setExpense] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await userRequest.get(`/expenses/logistics/${id}`);
        setExpense(res.data.data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-4">
        <Button onPress={() => navigate(-1)} variant="flat">Back</Button>
        <p className="mt-4 text-red-500">Expense not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button isIconOnly variant="light" className="mr-2" onPress={() => navigate(-1)}>
            <FaArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold">Logistics Expense Details</h1>
        </div>
        <Button color="primary" startContent={<FaEdit />} as={Link} to={`/expenses/logistics/edit/${expense._id}`}>
          Edit
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">Overview</h2>
          <Divider />
          <Row label="Route" value={expense.route} />
          <Row label="Vehicle/Container" value={expense.vehicleContainerNo} />
          <Row label="Departure Date" value={expense.departureDate ? new Date(expense.departureDate).toLocaleString() : 'N/A'} />
          <Row label="Arrival Date" value={expense.arrivalDate ? new Date(expense.arrivalDate).toLocaleString() : 'N/A'} />
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Transport Status</span>
            <Chip className="capitalize" color="primary" size="sm" variant="flat">{expense.transportStatus || 'N/A'}</Chip>
          </div>
          <Row label="Notes" value={expense.notes} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">Financials</h2>
          <Divider />
          <Row label="Freight Cost" value={`${expense.currency?.symbol ?? '$'} ${((expense.freightCost ?? 0).toLocaleString?.()) ?? String(expense.freightCost ?? 0)}`} />
          <Row label="Border Crossing" value={`${expense.currency?.symbol ?? '$'} ${((expense.borderCrossingCharges ?? 0).toLocaleString?.()) ?? String(expense.borderCrossingCharges ?? 0)}`} />
          <Row label="Transporter Commission" value={`${expense.currency?.symbol ?? '$'} ${((expense.transporterCommission ?? 0).toLocaleString?.()) ?? String(expense.transporterCommission ?? 0)}`} />
          <Row label="Service Fee" value={`${expense.currency?.symbol ?? '$'} ${((expense.serviceFee ?? 0).toLocaleString?.()) ?? String(expense.serviceFee ?? 0)}`} />
          <Row label="Transit Warehouse" value={`${expense.currency?.symbol ?? '$'} ${((expense.transitWarehouseCharges ?? 0).toLocaleString?.()) ?? String(expense.transitWarehouseCharges ?? 0)}`} />
          <Row label="Local Transport" value={`${expense.currency?.symbol ?? '$'} ${((expense.localTransportCharges ?? 0).toLocaleString?.()) ?? String(expense.localTransportCharges ?? 0)}`} />
          <Divider />
          <Row label="Total Cost" value={`${expense.currency?.symbol ?? '$'} ${((expense.totalCost ?? 0).toLocaleString?.()) ?? String(expense.totalCost ?? 0)}`} />
          <Row label="Amount in PKR" value={`PKR ${((expense.amountInPKR ?? 0).toLocaleString?.()) ?? String(expense.amountInPKR ?? 0)}`} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">Links & Payment</h2>
          <Divider />
          <Row
            label="Linked Shipment"
            value={(() => {
              const s = expense.linkedShipment;
              if (!s) return 'N/A';
              if (typeof s === 'string') return s;
              return s.shipmentId || s.trackingNumber || s.ref || s._id || 'N/A';
            })()}
          />
          <Row
            label="Linked Warehouse"
            value={(() => {
              const w = expense.linkedWarehouse;
              if (!w) return 'N/A';
              if (typeof w === 'string') return w;
              return w.name || w.code || w._id || 'N/A';
            })()}
          />
          <Row
            label="Transporter"
            value={(() => {
              const t = expense.transporter;
              if (!t) return 'N/A';
              if (typeof t === 'string') return t;
              return t.name || t._id || 'N/A';
            })()}
          />
          <Row label="Payment Method" value={expense.paymentMethod} />
          <Row label="Created At" value={expense.createdAt ? new Date(expense.createdAt).toLocaleString() : 'N/A'} />
          <Row label="Updated At" value={expense.updatedAt ? new Date(expense.updatedAt).toLocaleString() : 'N/A'} />
          <Row label="Supporting Doc Upload" value={expense.supportingDocument?.uploadDate ? new Date(expense.supportingDocument.uploadDate).toLocaleString() : 'N/A'} />
        </CardBody>
      </Card>
    </div>
  );
};

export default LogisticsExpenseDetails;
