import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Building2, 
  FileText, 
  CheckCircle2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Order } from '../../types';
import { PLATFORM_TAX_PROFILE } from '../../utils/taxService';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const invoiceNumber = order.invoice_number || `INV-2026-${order.order_number.replace(/[^0-9]/g, '').slice(-5)}`;
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const tax = order.tax_details;
  const billing = order.billing_profile;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
      >
        
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="invoice-modal-title" className="text-sm font-bold text-white">
                Statutory Tax Invoice & Official Receipt
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {invoiceNumber} • {order.order_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              title="Print or Save Invoice as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 space-y-6 bg-slate-900 overflow-y-auto max-h-[75vh]">
          
          {/* Company & Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-black text-lg tracking-wider text-white">NAIN</span>
                <span className="font-light text-lg tracking-widest text-amber-400">MUSIC</span>
              </div>
              <p className="text-xs font-semibold text-slate-300">{PLATFORM_TAX_PROFILE.companyName}</p>
              <p className="text-[11px] text-slate-400">{PLATFORM_TAX_PROFILE.registeredAddress}</p>
              <div className="mt-2 space-y-0.5 text-[11px] font-mono text-slate-400">
                <p><span className="text-slate-500">GSTIN:</span> <span className="text-amber-400 font-semibold">{PLATFORM_TAX_PROFILE.gstin}</span></p>
                <p><span className="text-slate-500">SAC Code:</span> {PLATFORM_TAX_PROFILE.sacCode} (Sound Recording & Music Production)</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-800 text-emerald-300 mb-1">
                Payment Confirmed & Secured
              </div>
              <p className="text-xs text-slate-400">Invoice Number: <span className="font-mono text-white font-semibold">{invoiceNumber}</span></p>
              <p className="text-xs text-slate-400">Order Reference: <span className="font-mono text-amber-300">{order.order_number}</span></p>
              <p className="text-xs text-slate-400">Invoice Date: <span className="text-slate-200">{invoiceDate}</span></p>
              <p className="text-xs text-slate-400">Gateway Ref: <span className="font-mono text-slate-300 text-[11px]">{order.payment_reference || 'CONFIRMED'}</span></p>
            </div>
          </div>

          {/* Billed To (Buyer Factual Profile) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Billed To (Customer Details)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-bold text-white text-sm">
                  {billing?.business_name || order.buyer_name}
                </p>
                {billing?.business_name && (
                  <p className="text-slate-400 text-[11px]">Attn: {order.buyer_name}</p>
                )}
                <p className="text-slate-400 mt-0.5">{order.buyer_email}</p>
                {billing?.address_line1 && (
                  <p className="text-slate-400 mt-0.5">{billing.address_line1}</p>
                )}
              </div>
              <div className="space-y-0.5 text-slate-300 sm:text-right">
                <p>
                  <span className="text-slate-500">Jurisdiction: </span>
                  <span className="font-semibold text-white">
                    {billing?.state ? `${billing.state}, ` : ''}{billing?.country || tax?.buyer_country || order.buyer_location}
                  </span>
                </p>
                {billing?.postal_code && (
                  <p><span className="text-slate-500">Postal / ZIP: </span><span className="font-mono">{billing.postal_code}</span></p>
                )}
                <p><span className="text-slate-500">Classification: </span>{billing?.buyer_type === 'business' ? 'Business Entity' : 'Individual Consumer'}</p>
                {billing?.tax_id && (
                  <p className="text-amber-400 font-mono font-semibold">
                    <span className="text-slate-500">Tax ID / GSTIN: </span>{billing.tax_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-semibold">Service Description</th>
                  <th className="p-3 font-semibold text-center">SAC / Code</th>
                  <th className="p-3 font-semibold text-right">Qty</th>
                  <th className="p-3 font-semibold text-right">Taxable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-3">
                    <p className="font-bold text-white">{order.gig_title}</p>
                    <p className="text-[11px] text-slate-400">Package: {order.package_name || 'Standard Pro'}</p>
                  </td>
                  <td className="p-3 text-center font-mono text-[11px] text-slate-400">
                    {tax?.tax_code || PLATFORM_TAX_PROFILE.sacCode}
                  </td>
                  <td className="p-3 text-right">1</td>
                  <td className="p-3 text-right font-mono font-semibold text-white">
                    ₹{order.price_inr.toLocaleString('en-IN')}
                  </td>
                </tr>

                {/* Extras if any */}
                {order.selected_extras && order.selected_extras.map((extra, idx) => (
                  <tr key={idx} className="bg-slate-950/30">
                    <td className="p-3 pl-5 text-[11px] text-slate-300">
                      • Extra: {extra.name}
                    </td>
                    <td className="p-3 text-center font-mono text-[11px] text-slate-500">
                      {PLATFORM_TAX_PROFILE.sacCode}
                    </td>
                    <td className="p-3 text-right text-slate-400">1</td>
                    <td className="p-3 text-right font-mono text-slate-300">
                      ₹{extra.price_inr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}

                {/* Buyer Protection Fee (Free) */}
                <tr className="bg-slate-950/20 text-slate-400">
                  <td className="p-3">
                    Buyer Protection Fee
                  </td>
                  <td className="p-3 text-center font-mono text-[11px] text-slate-500">—</td>
                  <td className="p-3 text-right">1</td>
                  <td className="p-3 text-right text-emerald-400 font-medium">Free (0%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations & Tax Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            
            {/* Tax Engine Notes & Rule Citation */}
            <div className="sm:max-w-xs space-y-2 text-[11px] text-slate-400 leading-relaxed">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Statutory Tax Assessment
              </div>
              <p className="text-[11px]">
                {tax?.notes || 'Indirect tax calculated automatically based on billing jurisdiction and statutory place of supply.'}
              </p>
              {tax?.rule_source && (
                <p className="text-[10px] text-slate-500 font-mono">
                  Statute: {tax.rule_source}
                </p>
              )}
              {tax?.is_reverse_charge && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-semibold">
                  Customer to account for VAT under Reverse Charge mechanism.
                </div>
              )}
            </div>

            {/* Financial Ledger Summary */}
            <div className="sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-800">
                <span>Base Taxable Amount:</span>
                <span className="font-mono text-slate-200">
                  ₹{(tax ? tax.taxable_amount : order.price_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Specific CGST / SGST breakdown for intra-state Maharashtra */}
              {tax?.cgst_amount !== undefined && tax?.sgst_amount !== undefined ? (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>CGST (9%):</span>
                    <span className="font-mono text-slate-200">₹{tax.cgst_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SGST (9%):</span>
                    <span className="font-mono text-slate-200">₹{tax.sgst_amount.toFixed(2)}</span>
                  </div>
                </>
              ) : tax && tax.tax_amount > 0 ? (
                <div className="flex justify-between text-slate-400">
                  <span>{tax.tax_type} ({tax.tax_rate_percentage}):</span>
                  <span className="font-mono text-slate-200">₹{tax.tax_amount.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>Indirect Tax:</span>
                  <span className="text-slate-400 font-mono">₹0.00 {tax?.is_reverse_charge ? '(Reverse Charge)' : '(Exempt)'}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-amber-400 text-base">
                  ₹{order.total_price_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 text-right pt-1">
                Payment Method: <span className="capitalize text-slate-300 font-semibold">{order.payment_method || 'Official Gateway'}</span>
              </div>
            </div>

          </div>

          {/* Statutory Footer */}
          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center leading-relaxed">
            This is a computer-generated official tax invoice and payment receipt issued by Nain Music Technologies Private Limited. No physical signature is required. Tax collected is remitted to appropriate government statutory authorities under applicable indirect tax legislation.
          </div>

        </div>

      </div>
    </div>
  );
};
