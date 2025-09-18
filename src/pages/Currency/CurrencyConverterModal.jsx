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

const CurrencyConverterModal = ({ isOpen, onClose }) => {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await userRequest.get("/currencies");
        setCurrencies(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      }
    };
    fetchCurrencies();
  }, []);

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
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="flex-1"
            >
              {currencies.map((c) => (
                <SelectItem key={c._id} value={c._id}>
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
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="flex-1"
            >
              {currencies.map((c) => (
                <SelectItem key={c._id} value={c._id}>
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
