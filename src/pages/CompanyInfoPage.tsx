import { useState, useMemo, useEffect, useRef } from 'react';
import { useCompanies } from '../hooks/useSupabase';
import { formatCurrency, formatPercent } from '../types';

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

interface CompanyInfoPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

function calculateCompany(input: any): CompanyCalculations {
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

export default function CompanyInfoPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: CompanyInfoPageProps = {}) {
  const { data: companies, loading, error, isSupabaseActive, create, update: updateCompany, delete: deleteCompany, refresh } = useCompanies();
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyInput>>({
    stockName: '', industry: '', currentPrice: 0, parValue: 0, totalShares: 0, floatingShares: 0,
    totalCapital: 0, totalDebt: 0, revenue: 0, operatingProfit: 0, netProfit: 0, industryPER: 0, targetPrice: 0, memo: '',
  });
  
  const hasAutoSelectedRef = useRef(false);
  const lastSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'company') return;
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) return;
    if (!companies || companies.length === 0) return;
    
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    const company = companies.find((c: any) => c.id === selectedItemId);
    if (company) {
      setSelectedCompany(company);
    }
  }, [selectedItemId, selectedItemType, companies]);

  const getRowStyle = (item: any) => {
    if (highlightedItemId && item.id === highlightedItemId) {
      return { background: '#FFF9C4', transition: 'background 0.3s ease' };
    }
    return {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCompany = {
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
    
    await create(newCompany as any);
    setFormData({ stockName: '', industry: '', currentPrice: 0, parValue: 0, totalShares: 0, floatingShares: 0, totalCapital: 0, totalDebt: 0, revenue: 0, operatingProfit: 0, netProfit: 0, industryPER: 0, targetPrice: 0, memo: '' });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCompany(id);
    if (selectedCompany?.id === id) {
      setSelectedCompany(null);
      setIsEditing(false);
    }
  };

  const handleEdit = (company: any) => {
    setFormData({
      stockName: company.stockName || '',
      industry: company.industry || '',
      currentPrice: company.currentPrice || 0,
      parValue: company.parValue || 0,
      totalShares: company.totalShares || 0,
      floatingShares: company.floatingShares || 0,
      totalCapital: company.totalCapital || 0,
      totalDebt: company.totalDebt || 0,
      revenue: company.revenue || 0,
      operatingProfit: company.operatingProfit || 0,
      netProfit: company.netProfit || 0,
      industryPER: company.industryPER || 0,
      targetPrice: company.targetPrice || 0,
      memo: company.memo || '',
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const updatedCompany = {
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

    await updateCompany(selectedCompany.id, updatedCompany as any);
    setIsEditing(false);
    setSelectedCompany(null);
    setFormData({ stockName: '', industry: '', currentPrice: 0, parValue: 0, totalShares: 0, floatingShares: 0, totalCapital: 0, totalDebt: 0, revenue: 0, operatingProfit: 0, netProfit: 0, industryPER: 0, targetPrice: 0, memo: '' });
  };

  const handleInputChange = (field: keyof CompanyInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const previewCalc = useMemo(() => {
    if (formData.stockName) {
      return calculateCompany({
        ...formData,
        currentPrice: Number(formData.currentPrice) || 0,
        parValue: Number(formData.parValue) || 0,
        totalShares: Number(formData.totalShares) || 0,
        totalCapital: Number(formData.totalCapital) || 0,
        totalDebt: Number(formData.totalDebt) || 0,
        revenue: Number(formData.revenue) || 0,
        operatingProfit: Number(formData.operatingProfit) || 0,
        netProfit: Number(formData.netProfit) || 0,
      });
    }
    return null;
  }, [formData]);

  const handleCloseDetail = () => {
    setSelectedCompany(null);
    setIsEditing(false);
    hasAutoSelectedRef.current = false;
    lastSelectedIdRef.current = null;
    if (onClearSelection) onClearSelection();
  };

  const resetForm = () => {
    setFormData({ stockName: '', industry: '', currentPrice: 0, parValue: 0, totalShares: 0, floatingShares: 0, totalCapital: 0, totalDebt: 0, revenue: 0, operatingProfit: 0, netProfit: 0, industryPER: 0, targetPrice: 0, memo: '' });
  };

  // Edit form modal
  const renderEditForm = () => {
    if (!isEditing || !selectedCompany) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '95%', maxWidth: '1100px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>기업 정보 수정</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(false); resetForm(); }}>✕ 취소</button>
          </div>

          <form onSubmit={handleUpdate}>
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
            <div className="form-group">
              <label className="form-label">메모</label>
              <textarea className="form-input" rows={3} value={formData.memo} onChange={e => handleInputChange('memo', e.target.value)} placeholder="기업 관련 참고 사항을 입력하세요" style={{ resize: 'vertical' }} />
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>취소</button>
              <button type="submit" className="btn btn-primary">수정 저장</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Company detail modal
  const renderCompanyDetail = () => {
    if (!selectedCompany || isEditing) return null;
    const calc = calculateCompany(selectedCompany);

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '95%', maxWidth: '1100px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '4px' }}>{selectedCompany.stockName}</h2>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>{selectedCompany.industry}</span>
              {isSupabaseActive && (
                <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Cloud</span>
              )}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="Summary-card">
              <div className="Summary-card-label">현재 주가</div>
              <div className="Summary-card-value" style={{ color: 'var(--color-primary)' }}>{formatCurrency(selectedCompany.currentPrice)}</div>
            </div>
            <div className="Summary-card">
              <div className="Summary-card-label">시가총액</div>
              <div className="Summary-card-value">{formatCurrency(calc.marketCap)}</div>
            </div>
            <div className="Summary-card">
              <div className="Summary-card-label">PER</div>
              <div className="Summary-card-value">{calc.per.toFixed(2)}</div>
            </div>
            <div className="Summary-card">
              <div className="Summary-card-label">PBR</div>
              <div className="Summary-card-value">{calc.pbr.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>기본 정보</h4>
              <div style={{ fontSize: 'var(--font-sm)', lineHeight: 2 }}>
                <div><strong>액면가:</strong> {formatCurrency(selectedCompany.parValue)}</div>
                <div><strong>총 주식수:</strong> {selectedCompany.totalShares?.toLocaleString()}</div>
                <div><strong>유통 주식수:</strong> {selectedCompany.floatingShares?.toLocaleString()}</div>
                <div><strong>자본금:</strong> {formatCurrency(selectedCompany.totalCapital)}</div>
                <div><strong>부채총계:</strong> {formatCurrency(selectedCompany.totalDebt)}</div>
              </div>
            </div>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>손익 계산</h4>
              <div style={{ fontSize: 'var(--font-sm)', lineHeight: 2 }}>
                <div><strong>매출액:</strong> {formatCurrency(selectedCompany.revenue)}</div>
                <div><strong>영업이익:</strong> {formatCurrency(selectedCompany.operatingProfit)}</div>
                <div><strong>순이익:</strong> {formatCurrency(selectedCompany.netProfit)}</div>
                <div><strong>영업이익률:</strong> {formatPercent(calc.operatingProfitRate)}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>투자 지표</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-md)', fontSize: 'var(--font-sm)' }}>
              <div><strong>EPS:</strong> {formatCurrency(calc.eps)}</div>
              <div><strong>BPS:</strong> {formatCurrency(calc.bps)}</div>
              <div><strong>ROE:</strong> {formatPercent(calc.roe)}</div>
              <div><strong>부채비율:</strong> {formatPercent(calc.debtRatio)}</div>
              <div><strong>목표가:</strong> {formatCurrency(selectedCompany.targetPrice)}</div>
            </div>
          </div>

          {selectedCompany.memo && (
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>메모</h4>
              <p style={{ fontSize: 'var(--font-sm)', whiteSpace: 'pre-wrap' }}>{selectedCompany.memo}</p>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selectedCompany)}>✏ 수정</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedCompany.id)}>삭제</button>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>닫기</button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <p>기업 정보를 불러오는 중...</p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Supabase에서 데이터를 가져오는 중입니다</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-md)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <p>데이터 로드 중 오류가 발생했습니다</p>
          <p style={{ fontSize: '12px' }}>{error}</p>
        </div>
        <button className="btn btn-primary" onClick={() => refresh()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">기업 정보</h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            {isSupabaseActive && (
              <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Supabase 연결됨</span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{companies.length}건</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '+ 기업 추가'}
            </button>
          </div>
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
            <div className="form-group">
              <label className="form-label">메모</label>
              <textarea className="form-input" rows={3} value={formData.memo} onChange={e => handleInputChange('memo', e.target.value)} placeholder="기업 관련 참고 사항을 입력하세요" style={{ resize: 'vertical' }} />
            </div>

            {previewCalc && (
              <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>계산된 값</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-md)', fontSize: 'var(--font-sm)' }}>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>시총:</span> {formatCurrency(previewCalc.marketCap)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>영업이익률:</span> {formatPercent(previewCalc.operatingProfitRate)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>EPS:</span> {formatCurrency(previewCalc.eps)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>BPS:</span> {formatCurrency(previewCalc.bps)}</div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>PER:</span> {previewCalc.per.toFixed(2)}</div>
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
          <div className="table-container" style={{ maxHeight: '500px', overflow: 'auto' }}>
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
                    <tr 
                      key={company.id} 
                      onClick={() => setSelectedCompany(company)}
                      style={{ cursor: 'pointer', ...getRowStyle(company) }}
                      onMouseOver={(e) => { if (!highlightedItemId || company.id !== highlightedItemId) { e.currentTarget.style.background = 'var(--color-bg-input)'; } }}
                      onMouseOut={(e) => { if (!highlightedItemId || company.id !== highlightedItemId) { e.currentTarget.style.background = 'transparent'; } }}
                    >
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
                      <td><button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }}>삭제</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {renderCompanyDetail()}
      {renderEditForm()}
    </div>
  );
}
