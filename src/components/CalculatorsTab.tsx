import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { BrokerType, TaxStatus } from '../types';
import { 
  calculatePsxTrade, 
  calculateDividendPurification, 
  calculateAverageDown 
} from '../services/calculatorService';
import { 
  Calculator, 
  HeartHandshake
} from 'lucide-react';

export const CalculatorsTab: React.FC = () => {
  const { user } = useAuth();
  const [selectedCalc, setSelectedCalc] = useState<'brokerage' | 'purification' | 'averagedown'>('brokerage');

  // Brokerage Calculator State
  const [shares, setShares] = useState(100);
  const [buyPrice, setBuyPrice] = useState(104.50);
  const [sellPrice, setSellPrice] = useState(115.00);
  const [taxStatus, setTaxStatus] = useState<TaxStatus>(user.tax_status);
  const [broker, setBroker] = useState<BrokerType>(user.broker);

  // Purification State
  const [divShares, setDivShares] = useState(500);
  const [divPerShare, setDivPerShare] = useState(5.00);
  const [purificationRate, setPurificationRate] = useState(1.5);

  // Average Down State
  const [firstShares, setFirstShares] = useState(100);
  const [firstPrice, setFirstPrice] = useState(115.00);
  const [secondShares, setSecondShares] = useState(100);
  const [secondPrice, setSecondPrice] = useState(98.00);

  // Calculations
  const tradeResult = calculatePsxTrade({
    shares,
    buyPrice,
    sellPrice,
    taxStatus,
    broker,
  });

  const divResult = calculateDividendPurification({
    shares: divShares,
    dividendPerShare: divPerShare,
    purificationPercent: purificationRate,
    taxStatus,
  });

  const avgDownResult = calculateAverageDown({
    firstShares,
    firstPrice,
    secondShares,
    secondPrice,
  });

  return (
    <div className="bg-[#12262A] border border-[#1F383D] rounded-[24px] p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F383D]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#028C8C]" />
            <span>Pakistani & Halal PSX Investor Calculators</span>
          </h2>
          <p className="text-xs text-[#9AA3AF] mt-0.5">
            100% accurate calculations according to SECP, FBR, and PSX KMI Shariah rules
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0F1D21] border border-[#1F383D] rounded-full text-xs">
          <button
            onClick={() => setSelectedCalc('brokerage')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              selectedCalc === 'brokerage' ? 'bg-[#028C8C] text-white shadow-sm' : 'text-[#9AA3AF] hover:text-white'
            }`}
          >
            Brokerage & Tax
          </button>
          <button
            onClick={() => setSelectedCalc('purification')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              selectedCalc === 'purification' ? 'bg-[#028C8C] text-white shadow-sm' : 'text-[#9AA3AF] hover:text-white'
            }`}
          >
            🌙 Dividend Charity & Zakat
          </button>
          <button
            onClick={() => setSelectedCalc('averagedown')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              selectedCalc === 'averagedown' ? 'bg-[#028C8C] text-white shadow-sm' : 'text-[#9AA3AF] hover:text-white'
            }`}
          >
            Average Down
          </button>
        </div>
      </div>

      {/* CALCULATOR 1: PSX BROKERAGE, TAX & BREAKEVEN */}
      {selectedCalc === 'brokerage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 bg-[#0F1D21] p-5 rounded-2xl border border-[#1F383D] text-xs">
            <div className="font-bold text-white text-sm">Trade Input Parameters</div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9AA3AF] mb-1 font-semibold">Broker</label>
                <select
                  value={broker}
                  onChange={e => setBroker(e.target.value as BrokerType)}
                  className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#028C8C]"
                >
                  <option value="KTrade">KTrade (0.15% or Rs 0.05)</option>
                  <option value="Finqalab">Finqalab</option>
                  <option value="Zindagi">Zindagi (JS Global)</option>
                  <option value="AKD Trade">AKD Trade</option>
                  <option value="Arif Habib">Arif Habib</option>
                  <option value="MStock">MStock</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9AA3AF] mb-1 font-semibold">Tax Filer Status</label>
                <select
                  value={taxStatus}
                  onChange={e => setTaxStatus(e.target.value as TaxStatus)}
                  className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#028C8C]"
                >
                  <option value="FILER">Filer (15% CGT Tax)</option>
                  <option value="NON_FILER">Non-Filer (30% CGT Tax)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#9AA3AF] mb-1 font-semibold">Number of Shares</label>
              <input
                type="number"
                min="1"
                value={shares}
                onChange={e => setShares(parseInt(e.target.value) || 1)}
                className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#028C8C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9AA3AF] mb-1 font-semibold">Buy Price (Rs)</label>
                <input
                  type="number"
                  step="0.05"
                  value={buyPrice}
                  onChange={e => setBuyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#028C8C]"
                />
              </div>

              <div>
                <label className="block text-[#9AA3AF] mb-1 font-semibold">Sell Price (Rs)</label>
                <input
                  type="number"
                  step="0.05"
                  value={sellPrice}
                  onChange={e => setSellPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#028C8C]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-[#0F1D21] p-5 rounded-2xl border border-[#1F383D] text-xs font-mono">
            <div className="flex items-center justify-between font-sans">
              <span className="font-bold text-white text-sm">True Net Profit & Fee Breakdown</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#028C8C]/20 text-[#028C8C] text-[11px] font-bold border border-[#028C8C]/30">
                Break-Even: Rs {tradeResult.breakevenSellPrice}
              </span>
            </div>

            <div className="space-y-2 divide-y divide-[#1F383D]">
              <div className="flex justify-between py-1 text-[#E5EBEF]">
                <span>Gross Purchase Value:</span>
                <span>Rs {tradeResult.grossBuyValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#9AA3AF]">
                <span>Buy Brokerage Commission:</span>
                <span>Rs {tradeResult.buyCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#9AA3AF]">
                <span>Sindh/Punjab FED (16% on Commission):</span>
                <span>Rs {tradeResult.buyFed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#9AA3AF]">
                <span>CDC Transaction Charges:</span>
                <span>Rs {tradeResult.buyCdc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-white font-bold">
                <span>Total Invested Buy Cost:</span>
                <span>Rs {tradeResult.totalBuyCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-[#E5EBEF] pt-2">
                <span>Gross Selling Value:</span>
                <span>Rs {tradeResult.grossSellValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#9AA3AF]">
                <span>Sell Commission & FED:</span>
                <span>Rs {(tradeResult.sellCommission + tradeResult.sellFed).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#9AA3AF]">
                <span>Capital Gains Tax ({tradeResult.cgtRate}%):</span>
                <span>Rs {tradeResult.cgtTax.toFixed(2)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              tradeResult.netProfit >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div>
                <div className="text-[11px] uppercase font-sans font-semibold">True Net Profit (In Pocket)</div>
                <div className="text-2xl font-extrabold mt-0.5">
                  {tradeResult.netProfit >= 0 ? '+' : ''}Rs {tradeResult.netProfit.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase font-sans font-semibold">Net Return</div>
                <div className="text-xl font-bold mt-0.5">
                  {tradeResult.netProfit >= 0 ? '+' : ''}{tradeResult.netReturnPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 2: HALAL DIVIDEND PURIFICATION & ZAKAT */}
      {selectedCalc === 'purification' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 bg-[#0F1D21] p-5 rounded-2xl border border-[#1F383D] text-xs">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#028C8C]" />
              <span>Dividend & Purification Parameters</span>
            </div>

            <div>
              <label className="block text-[#9AA3AF] mb-1 font-semibold">Shares Owned</label>
              <input
                type="number"
                value={divShares}
                onChange={e => setDivShares(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#028C8C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9AA3AF] mb-1 font-semibold">Dividend Per Share (PKR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={divPerShare}
                  onChange={e => setDivPerShare(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#028C8C]"
                />
              </div>

              <div>
                <label className="block text-[#9AA3AF] mb-1 font-semibold">Purification Charity %</label>
                <input
                  type="number"
                  step="0.1"
                  value={purificationRate}
                  onChange={e => setPurificationRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0B1012] border border-[#1F383D] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#028C8C]"
                />
                <div className="text-[10px] text-[#9AA3AF] mt-1">e.g. MLCF (1.5%), HUBC (3.2%)</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-[#0F1D21] p-5 rounded-2xl border border-[#1F383D] text-xs font-mono">
            <div className="font-sans font-bold text-white text-sm">Purification & Zakat Audit</div>

            <div className="space-y-2 divide-y divide-[#1F383D]">
              <div className="flex justify-between py-1 text-[#E5EBEF]">
                <span>Gross Dividend Declared:</span>
                <span>Rs {divResult.grossDividend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#9AA3AF]">
                <span>Withholding Tax (WHT {taxStatus === 'FILER' ? '15%' : '30%'}):</span>
                <span>Rs {divResult.whtTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#E5EBEF]">
                <span>Net Dividend Received in Bank:</span>
                <span>Rs {divResult.netDividendReceived.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#F5B301] font-bold">
                <span>Purification Amount (Donate without Sawaab):</span>
                <span>Rs {divResult.charityPurificationAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-[#028C8C] font-extrabold text-sm pt-2">
                <span>Net 100% Halal Dividend Kept:</span>
                <span>Rs {divResult.netHalalDividend.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-[#028C8C]/10 border border-[#028C8C]/20 p-3.5 rounded-2xl font-sans text-xs text-[#E5EBEF]">
              <strong className="text-[#028C8C] block mb-1">Islamic Shariah Guidance:</strong>
              Purification charity is necessary to cleanse interest income earned on conventional bank deposits by PSX companies. Donate this amount to needy individuals or charitable hospitals.
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 3: AVERAGE DOWN */}
      {selectedCalc === 'averagedown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 bg-[#0F1D21] p-5 rounded-2xl border border-[#1F383D] text-xs">
            <div className="font-bold text-white text-sm">Dip Averaging Purchases</div>

            <div className="p-3.5 rounded-2xl bg-[#0B1012] border border-[#1F383D] space-y-2">
              <div className="font-semibold text-[#E5EBEF]">1st Initial Purchase (At Higher Price)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AA3AF] mb-1">Shares</label>
                  <input
                    type="number"
                    value={firstShares}
                    onChange={e => setFirstShares(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#12262A] border border-[#1F383D] rounded-xl p-2 text-white font-mono focus:outline-none focus:border-[#028C8C]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA3AF] mb-1">Buy Price (Rs)</label>
                  <input
                    type="number"
                    value={firstPrice}
                    onChange={e => setFirstPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#12262A] border border-[#1F383D] rounded-xl p-2 text-white font-mono focus:outline-none focus:border-[#028C8C]"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B1012] border border-[#1F383D] space-y-2">
              <div className="font-semibold text-[#028C8C]">2nd Dip Purchase (At Lower Price)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AA3AF] mb-1">New Shares</label>
                  <input
                    type="number"
                    value={secondShares}
                    onChange={e => setSecondShares(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#12262A] border border-[#1F383D] rounded-xl p-2 text-white font-mono focus:outline-none focus:border-[#028C8C]"
                  />
                </div>
                <div>
                  <label className="block text-[#9AA3AF] mb-1">Dip Price (Rs)</label>
                  <input
                    type="number"
                    value={secondPrice}
                    onChange={e => setSecondPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#12262A] border border-[#1F383D] rounded-xl p-2 text-white font-mono focus:outline-none focus:border-[#028C8C]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-[#0F1D21] p-5 rounded-2xl border border-[#1F383D] text-xs font-mono">
            <div className="font-sans font-bold text-white text-sm">New Combined Average</div>

            <div className="p-5 rounded-2xl bg-[#0B1012] border border-[#1F383D] space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-[#9AA3AF]">Total Shares Owned:</span>
                <span className="text-white font-extrabold text-base">{avgDownResult.totalShares} Shares</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-[#9AA3AF]">Total Capital Invested:</span>
                <span className="text-white font-bold">Rs {avgDownResult.totalInvestment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#1F383D]">
                <span className="font-sans text-[#028C8C] font-bold">New Combined Average Price:</span>
                <span className="text-[#028C8C] font-extrabold text-2xl">
                  Rs {avgDownResult.newAveragePrice}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-[#9AA3AF]">Average Price Lowered By:</span>
                <span className="text-[#028C8C] font-bold">
                  -Rs {avgDownResult.priceReduction} (-{avgDownResult.percentageDropNeeded.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
