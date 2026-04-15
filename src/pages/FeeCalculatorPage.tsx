import { useState, useMemo } from 'react';
import { formatCurrency } from '../types';

// Props for search navigation (fee calculator doesn't have individual items to select)
interface FeeCalculatorPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  onClearSelection?: () => void;
}

export default function FeeCalculatorPage(_props: FeeCalculatorPageProps = {}) {
  const [formData, setFormData] = useState({
    buyPrice: '',
    sellPrice: '',
    quantity: '',
    commissionRate: '0.7',
    depositRate: '10',
    priceDiff: '',
    taxRateManual: '11',
  });

  const calc = useMemo(() => {
    const buyPrice = Number(formData.buyPrice) || 0;
    const sellPrice = Number(formData.sellPrice) || 0;
    const quantity = Number(formData.quantity) || 0;
    const commissionRate = Number(formData.commissionRate) / 100 || 0;
    const depositRate = Number(formData.depositRate) / 100 || 0;
    const priceDiff = Number(formData.priceDiff) || 0;
    const taxRateManual = Number(formData.taxRateManual) || 0;

    const totalAmount = sellPrice * quantity;
    const sellProfit = (sellPrice - buyPrice) * quantity;
    const transactionTax = totalAmount * 0.0035;

    const transferTax11 = sellProfit * 0.11;
    const totalTax11 = transactionTax + transferTax11;
    const profitAfterTax11 = sellProfit - totalTax11;
    const actualFee11 = profitAfterTax11 * 0.5;

    const transferTax22 = sellProfit * 0.22;
    const totalTax22 = transactionTax + transferTax22;
    const profitAfterTax22 = sellProfit - totalTax22;
    const actualFee22 = profitAfterTax22 * 0.3;

    const commission = totalAmount * commissionRate;
    const deposit = totalAmount * depositRate;
    const balance = totalAmount - deposit;

    const taxManual = priceDiff * (taxRateManual / 100 + 0.0035) * quantity;
    const totalDiff = quantity * priceDiff;
    const paybackAmount = totalDiff - taxManual;

    const buyRealPrice = buyPrice * 1.01;
    const sellRealPrice = sellPrice * 0.99;

    return {
      totalAmount, sellProfit, transactionTax,
      transferTax11, totalTax11, profitAfterTax11, actualFee11,
      transferTax22, totalTax22, profitAfterTax22, actualFee22,
      commission, deposit, balance, transferAmount: totalAmount,
      priceDiff, taxManual, totalDiff, paybackAmount, taxRateManual,
      buyRealPrice, sellRealPrice,
    };
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const CalculatorSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="calculator-section">
      <h3>{title}</h3>
      {children}
    </div>
  );

  const CalcRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`calculator-row ${highlight ? 'calculated' : ''}`}>
      <span className="calculator-label">{label}</span>
      <span className={`calculator-value ${highlight ? 'calculated-value' : ''}`}>{value}</span>
    </div>
  );

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">수고비 계산기</h3>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">매수가</label>
            <input type="number" className="form-input" value={formData.buyPrice} onChange={e => handleChange('buyPrice', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">매도가</label>
            <input type="number" className="form-input" value={formData.sellPrice} onChange={e => handleChange('sellPrice', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">수량</label>
            <input type="number" className="form-input" value={formData.quantity} onChange={e => handleChange('quantity', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">수고비율 (%)</label>
            <input type="number" className="form-input" value={formData.commissionRate} onChange={e => handleChange('commissionRate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">계약금율 (%)</label>
            <input type="number" className="form-input" value={formData.depositRate} onChange={e => handleChange('depositRate', e.target.value)} />
          </div>
        </div>

        <div className="calculator-grid">
          <CalculatorSection title="기본 거래">
            <CalcRow label="총거래금액" value={formatCurrency(calc.totalAmount)} highlight />
            <CalcRow label="매도차익" value={formatCurrency(calc.sellProfit)} highlight={calc.sellProfit > 0} />
            <CalcRow label="거래세 (0.35%)" value={formatCurrency(calc.transactionTax)} />
          </CalculatorSection>

          <CalculatorSection title="구간A - 11% 세율 (소기업/개인)">
            <CalcRow label="양도세 (11%)" value={formatCurrency(calc.transferTax11)} />
            <CalcRow label="매도총세금" value={formatCurrency(calc.totalTax11)} />
            <CalcRow label="총세금공제차익" value={formatCurrency(calc.profitAfterTax11)} />
            <CalcRow label="실수령 수수료 (50%)" value={formatCurrency(calc.actualFee11)} highlight />
          </CalculatorSection>

          <CalculatorSection title="구간B - 22% 세율 (대기업)">
            <CalcRow label="양도세 (22%)" value={formatCurrency(calc.transferTax22)} />
            <CalcRow label="매도총세금" value={formatCurrency(calc.totalTax22)} />
            <CalcRow label="총세금공제차익" value={formatCurrency(calc.profitAfterTax22)} />
            <CalcRow label="실수령 수수료 (30%)" value={formatCurrency(calc.actualFee22)} highlight />
          </CalculatorSection>

          <CalculatorSection title="수수료">
            <CalcRow label="매수수고비" value={formatCurrency(calc.commission)} highlight />
            <CalcRow label="계약금" value={formatCurrency(calc.deposit)} />
            <CalcRow label="잔금" value={formatCurrency(calc.balance)} />
            <CalcRow label="원매도 송금액" value={formatCurrency(calc.transferAmount)} />
          </CalculatorSection>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">일반빽 계산</h3>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">주당차액</label>
            <input type="number" className="form-input" value={formData.priceDiff} onChange={e => handleChange('priceDiff', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">양도세율 (%)</label>
            <input type="number" className="form-input" value={formData.taxRateManual} onChange={e => handleChange('taxRateManual', e.target.value)} />
          </div>
        </div>
        <div className="calculator-grid">
          <CalculatorSection title="일반빽 계산">
            <CalcRow label="총차액" value={formatCurrency(calc.totalDiff)} />
            <CalcRow label="세금" value={formatCurrency(calc.taxManual)} />
            <CalcRow label="빽해줄금액" value={formatCurrency(calc.paybackAmount)} highlight />
          </CalculatorSection>

          <CalculatorSection title="증권 플러스">
            <CalcRow label="매수 실입금가" value={formatCurrency(calc.buyRealPrice)} highlight />
            <CalcRow label="매도 실입금가" value={formatCurrency(calc.sellRealPrice)} highlight />
          </CalculatorSection>
        </div>
      </div>
    </div>
  );
}
