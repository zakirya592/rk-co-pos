import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import userRequest from "../../utils/userRequest";
import { useQuery } from "react-query";


const fetchCurrencie = async () => {
  const res = await userRequest.get("/currencies");
   return res.data.data|| [];
};

const CurrencyConverterModal = ({ isOpen, onClose }) => {
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log(fromCurrency, "fromCurrency");
  
   const { data: currencies = [] } = useQuery(["currencies"], fetchCurrencie);  

  const handleConvert = async () => {
    if (!fromCurrency || !toCurrency || !amount) {
      setResult(null);
      return;
    }
    try {
      setLoading(true);
      const res = await userRequest.get(
        `/currencies/convert?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&amount=${amount}`
      );
      setResult(res.data.data.to.amount || null);
      
    } catch (error) {
      console.error("Conversion failed:", error);
      setResult("Error converting currency.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-convert when inputs change
  useEffect(() => {
    handleConvert();
  }, [fromCurrency, toCurrency, amount]);

  const singleSelection = (value) =>
    value ? new Set([value]) : new Set();

  const onSelectChange = (setter) => (keys) => {
    const [firstKey] = Array.from(keys);
    setter(firstKey || "");
  };

  const renderSelectedCurrency = (value) => {
    const cur = currencies.find((c) => c._id === value);
    if (!cur) return null;
    return `${cur.name} (${cur.code})`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="font-bold text-xl">
          Currency Converter
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex gap-4">
            <Select
              label="From"
              selectedKeys={singleSelection(fromCurrency)}
              onSelectionChange={onSelectChange(setFromCurrency)}
              renderValue={() => renderSelectedCurrency(fromCurrency)}
              className="flex-1"
            >
              {currencies.map((c) => (
                <SelectItem key={c._id}>
                  {c.name} ({c.code})
                </SelectItem>
              ))}
            </Select>
            <Input
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex gap-4">
            <Select
              label="To"
              selectedKeys={singleSelection(toCurrency)}
              onSelectionChange={onSelectChange(setToCurrency)}
              renderValue={() => renderSelectedCurrency(toCurrency)}
              className="flex-1"
            >
              {currencies.map((c) => (
                <SelectItem key={c._id}>
                  {c.name} ({c.code})
                </SelectItem>
              ))}
            </Select>

            <Input
              type="number"
              isLoading={loading}
              label="Converted Amount"
              value={loading ? "" : result || ""}
              readOnly
              className="flex-1"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CurrencyConverterModal;
