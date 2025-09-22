import React, { useEffect, useState, useMemo } from 'react';
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

const EditMiscellaneousExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currencies, setCurrencies] = useState([]);

  const [formData, setFormData] = useState({
    expenseSubType: 'marketing',
    marketingCost: 0,
    promotionCost: 0,
    entertainmentCost: 0,
    hospitalityCost: 0,
    unexpectedCosts: 0,
    adjustments: 0,
    legalFees: 0,
    consultingFees: 0,
    currency: '',
    exchangeRate: 1,
    paymentMethod: 'cash',
    description: '',
    notes: '',
  });

  const totalCost = useMemo(() => {
    const keys = ['marketingCost','promotionCost','entertainmentCost','hospitalityCost','unexpectedCosts','adjustments','legalFees','consultingFees'];
    return keys.reduce((sum, k) => sum + (Number(formData[k]) || 0), 0);
  }, [formData]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [expenseRes, currencyRes] = await Promise.all([
          userRequest.get(`/expenses/miscellaneous/${id}`),
          userRequest.get('/currencies'),
        ]);
        const e = expenseRes.data?.data || {};
        setFormData({
          expenseSubType: e.expenseSubType || 'marketing',
          marketingCost: e.marketingCost || 0,
          promotionCost: e.promotionCost || 0,
          entertainmentCost: e.entertainmentCost || 0,
          hospitalityCost: e.hospitalityCost || 0,
          unexpectedCosts: e.unexpectedCosts || 0,
          adjustments: e.adjustments || 0,
          legalFees: e.legalFees || 0,
          consultingFees: e.consultingFees || 0,
          currency: e.currency?._id || '',
          exchangeRate: e.exchangeRate || 1,
          paymentMethod: e.paymentMethod || 'cash',
          description: e.description || '',
          notes: e.notes || '',
        });
        const list = currencyRes.data?.data || [];
        setCurrencies(list);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load expense');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: [
        'marketingCost',
        'promotionCost',
        'entertainmentCost',
        'hospitalityCost',
        'unexpectedCosts',
        'adjustments',
        'legalFees',
        'consultingFees',
        'exchangeRate',
      ].includes(name)
        ? Number(value) || 0
        : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userRequest.put(`/expenses/miscellaneous/${id}`, {
        ...formData,
      });
      toast.success('Miscellaneous expense updated successfully');
      navigate('/expenses/miscellaneous');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update expense');
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
        <h1 className="text-2xl font-bold">Edit Miscellaneous Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <Select
                label="Expense Type"
                placeholder="Select expense type"
                labelPlacement="outside"
                selectedKeys={[formData.expenseSubType]}
                onChange={(e) => setFormData((prev) => ({ ...prev, expenseSubType: e.target.value }))}
              >
                <SelectItem key="marketing" value="marketing">
                                  Marketing
                                </SelectItem>
                                <SelectItem key="entertainment" value="entertainment">
                                  Entertainment
                                </SelectItem>
                                <SelectItem key="hospitality" value="hospitality">
                                  Hospitality
                                </SelectItem>
                                <SelectItem key="adjustments" value="adjustments">
                                  Adjustments
                                </SelectItem>
                                <SelectItem key="legal" value="legal">
                                  Legal
                                </SelectItem>
                                <SelectItem key="consulting" value="consulting">
                                  Consulting
                                </SelectItem>
                                <SelectItem key="unexpected" value="unexpected">
                                  Unexpected
                                </SelectItem>
              </Select>

              <Textarea name="description" label="Description" placeholder="Describe the expense..." labelPlacement="outside" value={formData.description} onChange={handleChange} />
              <Textarea name="notes" label="Notes" placeholder="Additional notes..." labelPlacement="outside" value={formData.notes} onChange={handleChange} />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Financial Details</h2>
              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  labelPlacement="outside"
                  selectedKeys={formData.currency ? [formData.currency] : []}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                >
                  {currencies.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{`${c.code} - ${c.name}`}</SelectItem>
                  ))}
                </Select>

                <Input type="number" name="exchangeRate" label="Exchange Rate" placeholder="1.00" labelPlacement="outside" value={formData.exchangeRate} onChange={handleChange} min={0} step={0.01} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="number" name="marketingCost" label="Marketing Cost" labelPlacement="outside" value={formData.marketingCost} onChange={handleChange} min={0} />
                <Input type="number" name="promotionCost" label="Promotion Cost" labelPlacement="outside" value={formData.promotionCost} onChange={handleChange} min={0} />
                <Input type="number" name="entertainmentCost" label="Entertainment Cost" labelPlacement="outside" value={formData.entertainmentCost} onChange={handleChange} min={0} />
                <Input type="number" name="hospitalityCost" label="Hospitality Cost" labelPlacement="outside" value={formData.hospitalityCost} onChange={handleChange} min={0} />
                <Input type="number" name="unexpectedCosts" label="Unexpected Costs" labelPlacement="outside" value={formData.unexpectedCosts} onChange={handleChange} min={0} />
                <Input type="number" name="adjustments" label="Adjustments" labelPlacement="outside" value={formData.adjustments} onChange={handleChange} min={0} />
                <Input type="number" name="legalFees" label="Legal Fees" labelPlacement="outside" value={formData.legalFees} onChange={handleChange} min={0} />
                <Input type="number" name="consultingFees" label="Consulting Fees" labelPlacement="outside" value={formData.consultingFees} onChange={handleChange} min={0} />
              </div>

              <Select label="Payment Method" placeholder="Select payment method" labelPlacement="outside" selectedKeys={[formData.paymentMethod]} onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
                <SelectItem key="cash" value="cash">Cash</SelectItem>
                <SelectItem key="bank" value="bank">Bank Transfer</SelectItem>
                <SelectItem key="credit" value="credit">Credit</SelectItem>
                <SelectItem key="mixed" value="mixed">Mixed</SelectItem>
              </Select>

              <div className="text-right text-sm text-gray-600">
                Current total: <span className="font-semibold">{totalCost.toLocaleString()}</span>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="flat" onPress={() => navigate(-1)} isDisabled={isSubmitting}>Cancel</Button>
          <Button color="primary" type="submit" isLoading={isSubmitting} startContent={!isSubmitting && <FaSave />}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
};

export default EditMiscellaneousExpense;
