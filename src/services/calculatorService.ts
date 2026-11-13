import type { BrokerType, TaxStatus } from '../types';

export interface BrokerageCalculationResult {
  shares: number;
  buyPrice: number;
  sellPrice: number;
  grossBuyValue: number;
  grossSellValue: number;
  buyCommission: number;
  buyFed: number;
  buyCdc: number;
  totalBuyCost: number;
  sellCommission: number;
  sellFed: number;
  sellCdc: number;
  totalSellDeductions: number;
  netSellProceeds: number;
  totalRoundTripFees: number;
  grossProfit: number;
  cgtRate: number;
  cgtTax: number;
  netProfit: number;
  netReturnPercent: number;
  breakevenSellPrice: number;
}

export function calculatePsxTrade({
  shares,
  buyPrice,
  sellPrice,
  taxStatus = 'FILER',
  broker: _broker = 'KTrade',
}: {
  shares: number;
  buyPrice: number;
  sellPrice: number;
  taxStatus?: TaxStatus;
  broker?: BrokerType;
}): BrokerageCalculationResult {
  const grossBuyValue = shares * buyPrice;
  const grossSellValue = shares * sellPrice;

  const commissionRate = 0.0015;
  const minCommissionPerShare = 0.05;

  const buyCommission = Math.max(shares * minCommissionPerShare, grossBuyValue * commissionRate);
  const buyFed = buyCommission * 0.16;
  const buyCdc = shares * 0.005;
  const totalBuyCost = grossBuyValue + buyCommission + buyFed + buyCdc;

  const sellCommission = Math.max(shares * minCommissionPerShare, grossSellValue * commissionRate);
  const sellFed = sellCommission * 0.16;
  const sellCdc = shares * 0.005;
  const totalSellDeductions = sellCommission + sellFed + sellCdc;
  const netSellProceeds = grossSellValue - totalSellDeductions;

  const totalRoundTripFees = buyCommission + buyFed + buyCdc + totalSellDeductions;
  const grossProfit = grossSellValue - grossBuyValue;
  const profitBeforeTax = grossProfit - totalRoundTripFees;

  const cgtRate = taxStatus === 'FILER' ? 0.15 : 0.30;
  const cgtTax = profitBeforeTax > 0 ? profitBeforeTax * cgtRate : 0;
  const netProfit = profitBeforeTax - cgtTax;
  const netReturnPercent = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;

  const effRate = 1 - (commissionRate * 1.16);
  const breakevenSellPrice = Number(((totalBuyCost + (shares * 0.005)) / (shares * effRate)).toFixed(2));

  return {
    shares,
    buyPrice,
    sellPrice,
    grossBuyValue,
    grossSellValue,
    buyCommission,
    buyFed,
    buyCdc,
    totalBuyCost,
    sellCommission,
    sellFed,
    sellCdc,
    totalSellDeductions,
    netSellProceeds,
    totalRoundTripFees,
    grossProfit,
    cgtRate: cgtRate * 100,
    cgtTax,
    netProfit,
    netReturnPercent,
    breakevenSellPrice,
  };
}

export function calculateDividendPurification({
  shares,
  dividendPerShare,
  purificationPercent,
  taxStatus = 'FILER',
}: {
  shares: number;
  dividendPerShare: number;
  purificationPercent: number;
  taxStatus?: TaxStatus;
}) {
  const grossDividend = shares * dividendPerShare;
  const whtRate = taxStatus === 'FILER' ? 0.15 : 0.30;
  const whtTax = grossDividend * whtRate;
  const netDividendReceived = grossDividend - whtTax;

  const charityPurificationAmount = grossDividend * (purificationPercent / 100);
  const netHalalDividend = netDividendReceived - charityPurificationAmount;

  return {
    grossDividend,
    whtTax,
    netDividendReceived,
    charityPurificationAmount,
    netHalalDividend,
    purificationPercent,
  };
}

export function calculateAverageDown({
  firstShares,
  firstPrice,
  secondShares,
  secondPrice,
}: {
  firstShares: number;
  firstPrice: number;
  secondShares: number;
  secondPrice: number;
}) {
  const firstTotal = firstShares * firstPrice;
  const secondTotal = secondShares * secondPrice;
  const totalShares = firstShares + secondShares;
  const totalInvestment = firstTotal + secondTotal;
  const newAveragePrice = totalShares > 0 ? totalInvestment / totalShares : 0;
  const priceReduction = firstPrice - newAveragePrice;
  const percentageDropNeeded = ((firstPrice - newAveragePrice) / firstPrice) * 100;

  return {
    totalShares,
    totalInvestment,
    newAveragePrice: Number(newAveragePrice.toFixed(2)),
    priceReduction: Number(priceReduction.toFixed(2)),
    percentageDropNeeded: Number(percentageDropNeeded.toFixed(2)),
  };
}
