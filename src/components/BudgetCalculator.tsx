import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function BudgetCalculator() {
  const navigate = useNavigate();
  const [vehiclePrice, setVehiclePrice] = useState("25000");
  const [downPayment, setDownPayment] = useState("5000");
  const [loanTerm, setLoanTerm] = useState("72");
  const [interestRate, setInterestRate] = useState("6.49");

  const [includeTradeIn, setIncludeTradeIn] = useState(false);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [includeSalesTax, setIncludeSalesTax] = useState(false);

  const [biweeklyPayment, setBiweeklyPayment] = useState(0);

  const SALES_TAX_RATE = 0.13; // 13% HST

  const calculatePayment = useCallback(() => {
    const price = parseFloat(vehiclePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const term = parseInt(loanTerm);
    const rate = parseFloat(interestRate) / 100;

    const tradeIn = includeTradeIn ? (parseFloat(tradeInValue.toString()) || 0) : 0;

    // Apply sales tax to the vehicle price if toggle is enabled
    const taxablePrice = includeSalesTax ? price * (1 + SALES_TAX_RATE) : price;
    const loanAmount = taxablePrice - down - tradeIn;
    const monthlyRate = rate / 12;

    let monthlyPayment = 0;
    if (loanAmount > 0 && rate > 0) {
      monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    }

    // Convert monthly to bi-weekly
    const biweekly = (monthlyPayment * 12) / 26;
    setBiweeklyPayment(biweekly);
  }, [vehiclePrice, downPayment, loanTerm, interestRate, includeTradeIn, tradeInValue, includeSalesTax]);

  useEffect(() => {
    calculatePayment();
  }, [calculatePayment]);

  const [animationKey, setAnimationKey] = useState(0);
  const prevPayment = useRef(biweeklyPayment);

  useEffect(() => {
    if (prevPayment.current !== biweeklyPayment) {
      setAnimationKey((k) => k + 1);
      prevPayment.current = biweeklyPayment;
    }
  }, [biweeklyPayment]);

  const handleShopByBudget = () => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'search_inventory',
        search_query: 'budget_calculator',
        selected_filters: {
          max_price: parseFloat(vehiclePrice),
          calculated_payment: biweeklyPayment.toFixed(2)
        }
      });
    }
    navigate(`/inventory?maxPrice=${vehiclePrice}`);
  };

  return (
    <section id="financing" className="py-16 bg-muted text-foreground border-y border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-6">Flexible Financing Options</h2>
            <p className="text-xl text-muted-foreground mb-8">
              We work with multiple lenders to get you the best rates and terms. No matter your credit situation, we'll find a solution that works for you.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">All Credit Types Accepted</h3>
                  <p className="text-muted-foreground">Good credit, bad credit, or no credit - we can help</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Competitive Interest Rates</h3>
                  <p className="text-muted-foreground">Starting as low as 3.99% APR for qualified buyers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Flexible Terms</h3>
                  <p className="text-muted-foreground">Choose from 24 to 84 month financing options</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Trade-Ins Welcome</h3>
                  <p className="text-muted-foreground">Get top dollar for your current vehicle</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/pre-approval')}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors font-semibold shadow-sm"
            >
              Apply for Financing
            </button>
          </div>

          <div className="bg-card rounded-xl p-6 sm:p-8 text-card-foreground shadow-lg border">
            <h3 className="text-2xl font-bold mb-6">Payment Calculator</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="vehiclePrice" className="block text-sm font-medium mb-2">Vehicle Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="vehiclePrice"
                    type="number"
                    value={vehiclePrice}
                    onChange={(e) => setVehiclePrice(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="downPayment" className="block text-sm font-medium mb-2">Down Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="loanTerm" className="block text-sm font-medium mb-2">Term (Months)</Label>
                <Select value={loanTerm} onValueChange={setLoanTerm}>
                  <SelectTrigger id="loanTerm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="48">48 months</SelectItem>
                    <SelectItem value="60">60 months</SelectItem>
                    <SelectItem value="72">72 months</SelectItem>
                    <SelectItem value="84">84 months</SelectItem>
                    <SelectItem value="96">96 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interestRate" className="block text-sm font-medium mb-2">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="salesTax"
                    checked={includeSalesTax}
                    onCheckedChange={setIncludeSalesTax}
                  />
                  <Label htmlFor="salesTax" className="cursor-pointer">Include Sales Tax (13% HST)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tradeIn"
                    checked={includeTradeIn}
                    onCheckedChange={setIncludeTradeIn}
                  />
                  <Label htmlFor="tradeIn" className="cursor-pointer">Include Trade-In</Label>
                </div>

                {includeTradeIn && (
                  <div className="mt-2">
                    <Label htmlFor="tradeInValue" className="block text-sm font-medium mb-2">Trade-In Value</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                      <Input
                        id="tradeInValue"
                        type="number"
                        value={tradeInValue}
                        onChange={(e) => setTradeInValue(Number(e.target.value))}
                        onFocus={(e) => {
                          if (tradeInValue === 0) {
                            e.target.value = '';
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            setTradeInValue(0);
                          }
                        }}
                        className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-medium">Estimated Bi-Weekly Payment:</span>
                  <span key={animationKey} className="text-3xl font-bold text-primary animate-count">
                    ${biweeklyPayment.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right w-full">at {interestRate}% APR {includeSalesTax && "(incl. 13% HST)"}</p>
              </div>

              <button
                onClick={handleShopByBudget}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md mt-4 hover:bg-primary/90 transition-colors font-semibold shadow-sm"
              >
                Shop by Estimate
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
