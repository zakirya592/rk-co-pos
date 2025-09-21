import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Spinner,
} from '@nextui-org/react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const EditLogisticsExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currencies, setCurrencies] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transporters, setTransporters] = useState([]);

  const [formData, setFormData] = useState({
    route: '',
    vehicleContainerNo: '',
    freightCost: 0,
    borderCrossingCharges: 0,
    transporterCommission: 0,
    serviceFee: 0,
    transitWarehouseCharges: 0,
    localTransportCharges: 0,
    currency: '',
    exchangeRate: 1,
    linkedShipment: '',
    linkedWarehouse: '',
    transporter: '',
    paymentMethod: 'cash',
    transportStatus: 'pending',
    departureDate: '',
    arrivalDate: '',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [expenseRes, currencyRes, shipmentsRes, warehousesRes, transportersRes] = await Promise.all([
          userRequest.get(`/expenses/logistics/${id}`),
          userRequest.get('/currencies'),
          userRequest.get('/shipments'),
          userRequest.get('/warehouses'),
          userRequest.get('/transporters'),
        ]);
        const e = expenseRes.data.data;
        const list = currencyRes.data.data || [];
        setCurrencies(list);
        setShipments(shipmentsRes.data?.data || []);
        setWarehouses(warehousesRes.data?.data || []);
        setTransporters(transportersRes.data?.data || []);
        setFormData({
          route: e.route || '',
          vehicleContainerNo: e.vehicleContainerNo || '',
          freightCost: e.freightCost || 0,
          borderCrossingCharges: e.borderCrossingCharges || 0,
          transporterCommission: e.transporterCommission || 0,
          serviceFee: e.serviceFee || 0,
          transitWarehouseCharges: e.transitWarehouseCharges || 0,
          localTransportCharges: e.localTransportCharges || 0,
          currency: e.currency?._id || '',
          exchangeRate: e.exchangeRate || 1,
          linkedShipment: e.linkedShipment?._id || e.linkedShipment || '',
          linkedWarehouse: e.linkedWarehouse?._id || e.linkedWarehouse || '',
          transporter: e.transporter?._id || e.transporter || '',
          paymentMethod: e.paymentMethod || 'cash',
          transportStatus: e.transportStatus || 'pending',
          departureDate: formatDateForInput(e.departureDate),
          arrivalDate: formatDateForInput(e.arrivalDate),
          notes: e.notes || '',
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to load logistics expense');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: [
        'freightCost',
        'borderCrossingCharges',
        'transporterCommission',
        'serviceFee',
        'transitWarehouseCharges',
        'localTransportCharges',
        'exchangeRate'
      ].includes(name) ? Number(value)||0 : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        departureDate: formData.departureDate ? new Date(formData.departureDate).toISOString() : null,
        arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate).toISOString() : null,
      };
      await userRequest.put(`/expenses/logistics/${id}`, payload);
      toast.success('Logistics expense updated successfully');
      navigate('/expenses/logistics');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update logistics expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button isIconOnly variant="light" className="mr-2" onPress={() => navigate(-1)}>
          <FaArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Edit Logistics Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <Input name="route" label="Route" placeholder="Karachi to Lahore via GT Road" labelPlacement="outside" value={formData.route} onChange={handleChange} />
              <Input name="vehicleContainerNo" label="Vehicle/Container No" placeholder="KHI-1234" labelPlacement="outside" value={formData.vehicleContainerNo} onChange={handleChange} />
              <Select label="Transporter" placeholder="Select transporter" labelPlacement="outside" selectedKeys={formData.transporter ? [formData.transporter] : []} onChange={(e)=>setFormData(p=>({...p, transporter: e.target.value}))}>
                {transporters.map(t => (
                  <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" name="departureDate" label="Departure Date" labelPlacement="outside" value={formData.departureDate} onChange={handleChange} />
                <Input type="date" name="arrivalDate" label="Arrival Date" labelPlacement="outside" value={formData.arrivalDate} onChange={handleChange} />
              </div>

              <Select label="Transport Status" labelPlacement="outside" selectedKeys={[formData.transportStatus]} onChange={(e)=>setFormData(p=>({...p, transportStatus: e.target.value}))}>
                <SelectItem key="pending" value="pending">Pending</SelectItem>
                <SelectItem key="in_transit" value="in_transit">In Transit</SelectItem>
                <SelectItem key="delivered" value="delivered">Delivered</SelectItem>
                <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
              </Select>

              <Textarea name="notes" label="Notes" placeholder="Additional notes..." labelPlacement="outside" value={formData.notes} onChange={handleChange} />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Financial Details</h2>
              <Divider />

              <div className="grid grid-cols-2 gap-4">
                <Input type="number" name="freightCost" label="Freight Cost" labelPlacement="outside" value={formData.freightCost} onChange={handleChange} min={0} />
                <Input type="number" name="borderCrossingCharges" label="Border Crossing Charges" labelPlacement="outside" value={formData.borderCrossingCharges} onChange={handleChange} min={0} />
                <Input type="number" name="transporterCommission" label="Transporter Commission" labelPlacement="outside" value={formData.transporterCommission} onChange={handleChange} min={0} />
                <Input type="number" name="serviceFee" label="Service Fee" labelPlacement="outside" value={formData.serviceFee} onChange={handleChange} min={0} />
                <Input type="number" name="transitWarehouseCharges" label="Transit Warehouse Charges" labelPlacement="outside" value={formData.transitWarehouseCharges} onChange={handleChange} min={0} />
                <Input type="number" name="localTransportCharges" label="Local Transport Charges" labelPlacement="outside" value={formData.localTransportCharges} onChange={handleChange} min={0} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Currency" placeholder="Select currency" labelPlacement="outside" selectedKeys={formData.currency ? [formData.currency] : []} onChange={(e)=>setFormData(p=>({...p, currency: e.target.value}))}>
                  {currencies.map(c => (
                    <SelectItem key={c._id} value={c._id}>{`${c.code} - ${c.name}`}</SelectItem>
                  ))}
                </Select>

                <Input type="number" name="exchangeRate" label="Exchange Rate" placeholder="1.00" labelPlacement="outside" value={formData.exchangeRate} onChange={handleChange} min={0} step={0.01} />
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-6">
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold">Links & Payment</h2>
            <Divider />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Linked Shipment (optional)"
                placeholder="Select shipment"
                labelPlacement="outside"
                selectedKeys={formData.linkedShipment ? [formData.linkedShipment] : []}
                onChange={(e)=>setFormData(p=>({...p, linkedShipment: e.target.value}))}
              >
                {shipments.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.shipmentId || s.trackingNumber || s._id}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Linked Warehouse (optional)"
                placeholder="Select warehouse"
                labelPlacement="outside"
                selectedKeys={formData.linkedWarehouse ? [formData.linkedWarehouse] : []}
                onChange={(e)=>setFormData(p=>({...p, linkedWarehouse: e.target.value}))}
              >
                {warehouses.map((w) => (
                  <SelectItem key={w._id} value={w._id}>
                    {w.name}
                  </SelectItem>
                ))}
              </Select>
              <Select label="Payment Method" placeholder="Select payment method" labelPlacement="outside" selectedKeys={[formData.paymentMethod]} onChange={(e)=>setFormData(p=>({...p, paymentMethod: e.target.value}))}>
                <SelectItem key="cash" value="cash">Cash</SelectItem>
                <SelectItem key="bank" value="bank">Bank Transfer</SelectItem>
                <SelectItem key="credit" value="credit">Credit</SelectItem>
                <SelectItem key="mixed" value="mixed">Mixed</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="flat" onPress={() => navigate(-1)} isDisabled={isSubmitting}>Cancel</Button>
          <Button color="primary" type="submit" isLoading={isSubmitting} startContent={!isSubmitting && <FaSave />}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
};

export default EditLogisticsExpense;
