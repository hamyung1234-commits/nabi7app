import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency, formatPercent } from '../types';

interface CompanyInput {
  id: string;
  stockName: string;
  industry: string;
  currentPrice: number;
  parValue: number;
  totalShares: number;
  floatingShares: number;
  totalCapital: number;
  totalDebt: number;
  revenue: number;
  operatingProfit: number;
  netProfit: number;
  industryPER: number;
  targetPrice: number;
  memo: string;
}

interface CompanyCalculations {
  capital: number;
  marketCap: number;
  operatingProfitRate: number;
  eps: number;
  bps: number;
  per: number;
  pbr: number;
  roe: number;
  fairPrice: number;
  debtRatio: number;
}

function calculateCompany(input: CompanyInput): CompanyCalculations {
  const capital = input.parValue * input.totalShares;
  const marketCap = input.currentPrice * input.totalShares;
  const operatingProfitRate = input.revenue > 0 ? (input.operatingProfit / input.revenue) * 100 : 0;
  const eps = input.totalShares > 0 ? input.netProfit / input.totalShares : 0;
  const bps = input.totalShares > 0 ? input.totalCapital / input.totalShares : 0;
  const per = eps !== 0 ? input.currentPrice / eps : 0;
  const pbr = bps !== 0 ? input.currentPrice / bps : 0;
  const roe = bps !== 0 ? eps / bps : 0;
  const fairPrice = bps !== 0 ? input.netProfit * (input.currentPrice / bps) : 0;
  const debtRatio = input.totalCapital > 0 ? (input.totalDebt / input.totalCapital) * 100 : 0;
  return { capital, marketCap, operatingProfitRate, eps, bps, per, pbr, roe, fairPrice, debtRatio };
}

export default function CompanyInfoPage() {
  const { companies, setCompanies } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyInput>>({
    stockName: '', industry: '', currentPrice: 0, parValue: 0, totalShares: 0, floatingShares: 0,
    totalCapital: 0, totalDebt: 0, revenue: 0, operatingProfit: 0, netProfit: 0, industryPER: 0, targetPrice: 0, memo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCompany: CompanyInput = {
      id: generateId(),
      stockName: formData.stockName || '',
      industry: formData.industry || '',
      currentPrice: Number(formData.currentPrice) || 0,
      parValue: Number(formData.parValue) || 0,
      totalShares: Number(formData.totalShares) || 0,
      floatingShares: Number(formData.floatingShares) || 0,
      totalCapital: Number(formData.totalCapital) || 0,
      totalDebt: Number(formData.totalDebt) || 0,
      revenue: Number(formData.revenue) || 0,
      operatingProfit: Number(formData.operatingProfit) || 0,
      netProfit: Number(formData.netProfit) || 0,
      industryPER: Number(formData.industryPER) || 0,
      targetPrice: Number(formData.targetPrice) || 0,
      memo: formData.memo || '',
    };
    setCompanies((prev: any) => [...prev, newCompany]);
    setFormData({ stockName: '', industry: '', currentPrice: 0, parValue: 0, totalShares: 0, floatingShares: 0, totalCapital: 0, totalDebt: 0, revenue: 0, operatingProfit: 0, netProfit: 0, industryPER: 0, targetPrice: 0, memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setCompanies((prev: any) => prev.filter((c: any) => c.id !== id));
  };

  const handleInputChange = (field: keyof CompanyInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const previewCalc = useMemo(() => {
    if (formData.stockName) {
      return calculateCompany({
        id: '', ...formData,
        currentPrice: Number(formData.currentPrice) || 0,
        parValue: Number(formData.parValue) || 0,
        totalShares: Number(formData.totalShares) || 0,
        totalCapital: Number(formData.totalCapital) || 0,
        totalDebt: Number(formData.totalDebt) || 0,
        revenue: Number(formData.revenue) || 0,
        operatingProfit: Number(formData.operatingProfit) || 0,
        netProfit: Number(formData.netProfit) || 0,
        floatingShares: Number(formData.floatingShares) || 0,
        industryPER: Number(formData.industryPER) || 0,
        targetPrice: Number(formData.targetPrice) || 0,
      } as CompanyInput);
    }
    return null;
  }, [formData]);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">기업 정보</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : '+ 기업 추가'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">종목명</label>
                <input type="text" className="form-input" value={formData.stockName} onChange={e => handleInputChange('stockName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">업종</label>
                <input type="text" className="form-input" value={formData.industry} onChange={e => handleInputChange('industry', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">현재 주가</label>
                <input type="number" className="form-input" value={formData.currentPrice} onChange={e => handleInputChange('currentPrice', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">액면가</label>
                <input type="number" className="form-input" value={formData.parValue} onChange={e => handleInputChange('parValue', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">총 주식수</label>
                <input type="number" className="form-input" value={formData.totalShares} onChange={e => handleInputChange('totalShares', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">자본금</label>
                <input type="number" className="form-input" value={formData.totalCapital} onChange={e => handleInputChange('totalCapital', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">부채총계</label>
                <input type="number" className="form-input" value={formData.totalDebt} onChange={e => handleInputChange('totalDebt', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">매출액</label>
                <input type="number" className="form-input" value={formData.revenue} onChange={e => handleInputChange('revenue', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">영업이익</label>
                <input type="number" className="form-input" value={formData.operatingProfit} onChange={e => handleInputChange('operatingProfit', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">순이익</label>
                <input type="number" className="form-input" value={formData.netProfit} onChange={e => handleInputChange('netProfit', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">업종 PER</label>
                <input type="number" className="form-input" value={formData.industryPER} onChange={e => handleInputChange('industryPER', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">목표가</label>
                <input type="number" className="form-input" value={formData.targetPrice} onChange={e => handleInputChange('targetPrice', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">메모</label>
                <textarea className="form-input" rows={3} value={formData.memo} onChange={e => handleInputChange('memo', e.target.value)} placeholder="기업 관련 참고 사항을 입력하세요" style={{ resize: 'vertical' }} />
              </div>
            </div>

            {previewCalc && (
              <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>계산된 값</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-md)', fontSize: 'var(--font-sm)' }}>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>자본금:</span> {formatCurrency(previewCalc.capital)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>시총:</span> {formatCurrency(previewCalc.marketCap)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>영업이익률:</span> {formatPercent(previewCalc.operatingProfitRate)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>EPS:</span> {formatCurrency(previewCalc.eps)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>BPS:</span> {formatCurrency(previewCalc.bps)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>PER:</span> {previewCalc.per.toFixed(2)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>PBR:</span> {previewCalc.pbr.toFixed(2)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>ROE:</span> {formatPercent(previewCalc.roe)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>부채비율:</span> {formatPercent(previewCalc.debtRatio)}</div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>저장</button>
          </form>
        )}

        {companies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">B</div>
            <p className="empty-state-text">기업 정보가 없습니다.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>종목</th>
                  <th>업종</th>
                  <th>주가</th>
                  <th>PER</th>
                  <th>PBR</th>
                  <th>EPS</th>
                  <th>BPS</th>
                  <th>ROE</th>
                  <th>부채비율</th>
                  <th>메모</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company: any) => {
                  const calc = calculateCompany(company);
                  return (
                    <tr key={company.id}>
                      <td><strong>{company.stockName}</strong></td>
                      <td>{company.industry}</td>
                      <td className="calculated-value">{formatCurrency(company.currentPrice)}</td>
                      <td>{calc.per.toFixed(2)}</td>
                      <td>{calc.pbr.toFixed(2)}</td>
                      <td>{formatCurrency(calc.eps)}</td>
                      <td>{formatCurrency(calc.bps)}</td>
                      <td>{formatPercent(calc.roe)}</td>
                      <td>{formatPercent(calc.debtRatio)}</td>
                      <td style={{ maxWidth: '150px', fontSize: 'var(--font-xs)', color: company.memo ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{company.memo || '-'}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => handleDelete(company.id)}>삭제</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}