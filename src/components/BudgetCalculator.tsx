import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const BudgetCalculator = () => {
  const navigate = useNavigate();
  const [vehiclePrice, setVehiclePrice] = useState(25000);
  const [downPayment, setDownPayment] = useState(0);
  const [loanTerm, setLoanTerm] = useState("72");
  const [interestRate, setInterestRate] = useState("7.99");
  const [includeTradeIn, setIncludeTradeIn] = useState(false);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const calculatePayment = () => {
    const price = parseFloat(vehiclePrice.toString()) || 0;
    const down = parseFloat(downPayment.toString()) || 0;
    const term = parseInt(loanTerm);
    const rate = parseFloat(interestRate) / 100;
    const tradeIn = includeTradeIn ? (parseFloat(tradeInValue.toString()) || 0) : 0;

    const loanAmount = price - down - tradeIn;
    const monthlyRate = rate / 12;

    let payment = 0;
    if (loanAmount > 0 && rate > 0) {
      payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    }

    setMonthlyPayment(payment);
  };

  useEffect(() => {
    calculatePayment();
  }, [vehiclePrice, downPayment, loanTerm, interestRate, includeTradeIn, tradeInValue]);

  const handleShopByBudget = () => {
    // Track budget search event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'search_inventory',
        search_query: 'budget_calculator',
        selected_filters: {
          max_price: vehiclePrice,
          calculated_payment: monthlyPayment.toFixed(2)
        }
      });
    }

    // Navigate to inventory with price filter
    navigate(`/inventory?maxPrice=${vehiclePrice}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-4xl font-heading font-bold mb-4">Know Your Buying Power</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Calculate your estimated monthly payment and find vehicles within your budget. 
          Get pre-qualified in minutes with no impact to your credit score.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="vehiclePrice">Vehicle Price</Label>
              <Input
                id="vehiclePrice"
                type="number"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
                placeholder="$ 25,000"
              />
            </div>

            <div>
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input
                id="downPayment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                placeholder="$ 0"
              />
            </div>

            <div>
              <Label htmlFor="loanTerm">Loan Term</Label>
              <Select value={loanTerm} onValueChange={setLoanTerm}>
                <SelectTrigger id="loanTerm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="96">96 Months</SelectItem>
                  <SelectItem value="84">84 Months</SelectItem>
                  <SelectItem value="72">72 Months</SelectItem>
                  <SelectItem value="60">60 Months</SelectItem>
                  <SelectItem value="48">48 Months</SelectItem>
                  <SelectItem value="36">36 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (APR)</Label>
              <Select value={interestRate} onValueChange={setInterestRate}>
                <SelectTrigger id="interestRate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14.99">Poor (14.99%)</SelectItem>
                  <SelectItem value="9.99">Fair (9.99%)</SelectItem>
                  <SelectItem value="7.99">Good (7.99%)</SelectItem>
                  <SelectItem value="6.49">Excellent (6.49%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="tradeIn"
                checked={includeTradeIn}
                onCheckedChange={setIncludeTradeIn}
              />
              <Label htmlFor="tradeIn" className="cursor-pointer">Include Trade-In</Label>
            </div>

            {includeTradeIn && (
              <div>
                <Label htmlFor="tradeInValue">Trade-In Value</Label>
                <Input
                  id="tradeInValue"
                  type="number"
                  value={tradeInValue}
                  onChange={(e) => setTradeInValue(Number(e.target.value))}
                  placeholder="$ 0"
                />
              </div>
            )}

            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <div className="text-3xl font-heading font-bold text-primary mb-1">
                ${monthlyPayment.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                at {interestRate}% APR
              </div>
            </div>

            <Button 
              onClick={handleShopByBudget} 
              className="w-full" 
              size="lg"
            >
              Shop by Estimated Budget
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Payment estimates are for informational purposes only and do not represent a financing offer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetCalculator;
