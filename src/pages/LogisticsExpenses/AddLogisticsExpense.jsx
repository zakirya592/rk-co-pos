import React, { useEffect, useState, useMemo } from 'react';
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
    Chip,
} from '@nextui-org/react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const AddLogisticsExpense = () => {
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
        departureDate: new Date().toISOString().split('T')[0],
        arrivalDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const calcTotalCost = useMemo(() => {
        const t = (Number(formData.freightCost) || 0)
            + (Number(formData.borderCrossingCharges) || 0)
            + (Number(formData.transporterCommission) || 0)
            + (Number(formData.serviceFee) || 0)
            + (Number(formData.transitWarehouseCharges) || 0)
            + (Number(formData.localTransportCharges) || 0);
        return t;
    }, [formData]);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [currencyRes, shipmentsRes, warehousesRes, transportersRes] = await Promise.all([
                    userRequest.get('/currencies'),
                    userRequest.get('/shipments'),
                    userRequest.get('/warehouses'),
                    userRequest.get('/transporters'),
                ]);
                const list = currencyRes.data.data || [];
                setCurrencies(list);
                const pkr = list.find(c => c.code === 'PKR');
                setFormData(prev => ({ ...prev, currency: pkr?._id || (list[0]?._id || '') }));

                // Shipments & Warehouses for Selects
                setShipments(shipmentsRes.data?.data || []);
                setWarehouses(warehousesRes.data?.data || []);
                setTransporters(transportersRes.data?.data || []);
            } catch (e) {
                console.error(e);
                toast.error('Failed to load initial data');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

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
            ].includes(name) ? Number(value) || 0 : value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // simple required fields validation
            const missing = [];
            if (!formData.transporter) missing.push('transporter');
            if (!formData.route?.trim()) missing.push('route');
            if (!(Number(formData.freightCost) > 0)) missing.push('freightCost (> 0)');
            if (!formData.currency) missing.push('currency');
            if (!formData.paymentMethod) missing.push('paymentMethod');
            if (missing.length) {
                toast.error(`Please provide: ${missing.join(', ')}`);
                setIsSubmitting(false);
                return;
            }
            const payload = {
                ...formData,
                departureDate: formData.departureDate ? new Date(formData.departureDate).toISOString() : null,
                arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate).toISOString() : null,
                linkedShipment: formData.linkedShipment || undefined,
                linkedWarehouse: formData.linkedWarehouse || undefined,
                transporter: formData.transporter || undefined,
            };
            await userRequest.post('/expenses/logistics', payload);
            toast.success('Logistics expense added successfully');
            navigate('/expenses/logistics');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add logistics expense');
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
                <Button
                    isIconOnly
                    variant="light"
                    className="mr-2"
                    onPress={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold">Add Logistics Expense</h1>
            </div>

            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardBody className="space-y-4">
                            <h2 className="text-lg font-semibold">Basic Information</h2>
                            <Divider />
                            <div className="mt-4">
                                <Input
                                    name="route"
                                    label="Route"
                                    placeholder="Karachi to Lahore via GT Road"
                                    labelPlacement="outside"
                                    value={formData.route}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mt-4">
                                <Input
                                    name="vehicleContainerNo"
                                    label="Vehicle/Container No"
                                    placeholder="KHI-1234"
                                    labelPlacement="outside"
                                    value={formData.vehicleContainerNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mt-2">
                                <Select
                                    label="Transporter"
                                    placeholder="Select transporter"
                                    labelPlacement="outside"
                                    selectedKeys={formData.transporter ? [formData.transporter] : []}
                                    onChange={(e) => setFormData((p) => ({ ...p, transporter: e.target.value }))}
                                >
                                    {transporters.map((t) => (
                                        <SelectItem key={t._id} value={t._id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="date"
                                    name="departureDate"
                                    label="Departure Date"
                                    labelPlacement="outside"
                                    value={formData.departureDate}
                                    onChange={handleChange}
                                />
                                <Input
                                    type="date"
                                    name="arrivalDate"
                                    label="Arrival Date"
                                    labelPlacement="outside"
                                    value={formData.arrivalDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mt-4">
                                <Select
                                    label="Transport Status"
                                    labelPlacement="outside"
                                    selectedKeys={[formData.transportStatus]}
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            transportStatus: e.target.value,
                                        }))
                                    }
                                >
                                    <SelectItem key="pending" value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem key="in_transit" value="in_transit">
                                        In Transit
                                    </SelectItem>
                                    <SelectItem key="delivered" value="delivered">
                                        Delivered
                                    </SelectItem>
                                    <SelectItem key="cancelled" value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </Select>
                            </div>

                            <Textarea
                                name="notes"
                                label="Notes"
                                placeholder="Additional notes..."
                                labelPlacement="outside"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="space-y-4">
                            <h2 className="text-lg font-semibold">Financial Details</h2>
                            <Divider />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    name="freightCost"
                                    label="Freight Cost"
                                    labelPlacement="outside"
                                    value={formData.freightCost}
                                    onChange={handleChange}
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    name="borderCrossingCharges"
                                    label="Border Crossing Charges"
                                    labelPlacement="outside"
                                    value={formData.borderCrossingCharges}
                                    onChange={handleChange}
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    name="transporterCommission"
                                    label="Transporter Commission"
                                    labelPlacement="outside"
                                    value={formData.transporterCommission}
                                    onChange={handleChange}
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    name="serviceFee"
                                    label="Service Fee"
                                    labelPlacement="outside"
                                    value={formData.serviceFee}
                                    onChange={handleChange}
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    name="transitWarehouseCharges"
                                    label="Transit Warehouse Charges"
                                    labelPlacement="outside"
                                    value={formData.transitWarehouseCharges}
                                    onChange={handleChange}
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    name="localTransportCharges"
                                    label="Local Transport Charges"
                                    labelPlacement="outside"
                                    value={formData.localTransportCharges}
                                    onChange={handleChange}
                                    min={0}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Currency"
                                    placeholder="Select currency"
                                    labelPlacement="outside"
                                    selectedKeys={formData.currency ? [formData.currency] : []}
                                    onChange={(e) =>
                                        setFormData((p) => ({ ...p, currency: e.target.value }))
                                    }
                                >
                                    {currencies.map((c) => (
                                        <SelectItem
                                            key={c._id}
                                            value={c._id}
                                        >{`${c.code} - ${c.name}`}</SelectItem>
                                    ))}
                                </Select>

                                <Input
                                    type="number"
                                    name="exchangeRate"
                                    label="Exchange Rate"
                                    placeholder="1.00"
                                    labelPlacement="outside"
                                    value={formData.exchangeRate}
                                    onChange={handleChange}
                                    min={0}
                                    step={0.01}
                                />
                            </div>

                            <div className="text-right text-sm text-gray-600">
                                Estimated total:{" "}
                                <span className="font-semibold">
                                    {calcTotalCost.toLocaleString()}
                                </span>
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
                                selectedKeys={
                                    formData.linkedShipment ? [formData.linkedShipment] : []
                                }
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, linkedShipment: e.target.value }))
                                }
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
                                selectedKeys={
                                    formData.linkedWarehouse ? [formData.linkedWarehouse] : []
                                }
                                onChange={(e) =>
                                    setFormData((p) => ({
                                        ...p,
                                        linkedWarehouse: e.target.value,
                                    }))
                                }
                            >
                                {warehouses.map((w) => (
                                    <SelectItem key={w._id} value={w._id}>
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="Payment Method"
                                placeholder="Select payment method"
                                labelPlacement="outside"
                                selectedKeys={[formData.paymentMethod]}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, paymentMethod: e.target.value }))
                                }
                            >
                                <SelectItem key="cash" value="cash">
                                    Cash
                                </SelectItem>
                                <SelectItem key="bank" value="bank">
                                    Bank Transfer
                                </SelectItem>
                                <SelectItem key="credit" value="credit">
                                    Credit
                                </SelectItem>
                                <SelectItem key="mixed" value="mixed">
                                    Mixed
                                </SelectItem>
                            </Select>
                        </div>
                    </CardBody>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        variant="flat"
                        onPress={() => navigate(-1)}
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        type="submit"
                        isLoading={isSubmitting}
                        startContent={!isSubmitting && <FaSave />}
                    >
                        {isSubmitting ? "Saving..." : "Save Expense"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddLogisticsExpense;
