import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  ListChecks, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Check,
  AlertTriangle,
  Lock,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Globe,
  MapPin,
  Building2,
  FileText
} from 'lucide-react';
import { useGig } from '../../context/GigContext';
import { formatCurrency, formatGigPrice, USD_TO_INR_RATE } from '../../data/servicesData';
import { convertInrToUsd, fetchLiveExchangeRates, ExchangeRatesData } from '../../utils/exchangeRates';
import { Gig, PackageType, Order, CustomOffer, TaxDetails } from '../../types';
import { 
  calculateAutomaticTax, 
  validateBillingProfile, 
  formatTaxSummaryLabel 
} from '../../utils/taxService';
import { BuyerBillingProfileModal } from '../profile/BuyerBillingProfileModal';
import { OrderInvoiceModal } from './OrderInvoiceModal';

interface OrderModalProps {
  gig?: Gig | null;
  packageType?: PackageType;
  selectedExtraIds?: string[];
  customOffer?: CustomOffer | null;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PAYPAL_CLIENT_ID = (import.meta.env.VITE_PAYPAL_CLIENT_ID as string) || 'BAAfBtuXj7RlrJaExR6pC_jqwhcCCVFNYBDI3tRH0slwNwqwzVBZCZygryhA3aoi7Bh_dCy2Tz2-Z6S0FQ';

const loadPayPalScript = (clientId: string, currency: string = 'USD'): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).paypal?.Buttons) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('paypal-sdk-script') as HTMLScriptElement | null;
    if (existingScript) {
      if ((window as any).paypal?.Buttons) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const OrderModal: React.FC<OrderModalProps> = ({
  gig,
  packageType = 'standard',
  selectedExtraIds = [],
  customOffer,
  onClose,
  onOrderCreated,
}) => {
  const { 
    createOrderFromPackage, 
    createOrderFromCustomOffer,
    submitOrderRequirements, 
    selectedCurrency,
    setSelectedCurrency,
    liveRates: contextLiveRates,
    getGigCapacity,
    buyerBillingProfile,
    updateBuyerBillingProfile
  } = useGig();

  const isCustomOffer = Boolean(customOffer);

  const selectedPkg = gig?.packages.find(p => p.package_type === packageType) || gig?.packages[0];
  const selectedExtras = gig ? gig.extras.filter(e => selectedExtraIds.includes(e.id)) : [];
  const extrasTotalInr = isCustomOffer ? 0 : selectedExtras.reduce((sum, e) => sum + e.price_inr, 0);

  // 1. Permanent Internal Base Pricing in INR
  const pkgPriceInr = isCustomOffer 
    ? (customOffer?.price_inr || 0)
    : (selectedPkg?.price_inr || 0);
  const basePriceInr = pkgPriceInr + extrasTotalInr;

  // 2. Buyer Currency Determination
  // Selected buyer currency must control the entire buyer-facing checkout
  const isUsd = selectedCurrency === 'USD';

  // 3. Buyer-Selected Currency Breakdown (USD)
  const pkgPriceUsd = isCustomOffer
    ? (customOffer?.price_usd !== undefined && customOffer.price_usd > 0
        ? customOffer.price_usd
        : Number(((customOffer?.price_inr || 0) / USD_TO_INR_RATE).toFixed(2)))
    : (selectedPkg?.price_usd !== undefined && selectedPkg.price_usd > 0
        ? selectedPkg.price_usd
        : Number(((selectedPkg?.price_inr || 0) / USD_TO_INR_RATE).toFixed(2)));

  const extrasTotalUsd = isCustomOffer
    ? 0
    : Number(
        selectedExtras
          .reduce(
            (sum, e) =>
              sum +
              ((e as any).price_usd !== undefined && (e as any).price_usd > 0
                ? (e as any).price_usd
                : e.price_inr / USD_TO_INR_RATE),
            0
          )
          .toFixed(2)
      );

  const basePriceUsd = Number((pkgPriceUsd + extrasTotalUsd).toFixed(2));
  const baseUsdString = basePriceUsd.toFixed(2);

  // Profile modal & validation states
  const [isBillingProfileModalOpen, setIsBillingProfileModalOpen] = useState<boolean>(false);
  const [billingPromptReason, setBillingPromptReason] = useState<string | undefined>(undefined);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  // Profile validation check
  const profileValidation = useMemo(() => {
    return validateBillingProfile(buyerBillingProfile);
  }, [buyerBillingProfile]);

  // Modular Automatic Indirect Tax Calculation Layer
  // Evaluates statutory rules (India CGST/SGST/IGST, UK/EU VAT, US Sales Tax, B2B Reverse Charge)
  // strictly against the saved buyer billing profile. The buyer NEVER chooses a tax rate.
  const taxDetails: TaxDetails = useMemo(() => {
    return calculateAutomaticTax({
      basePriceInr,
      profile: buyerBillingProfile,
      sacCode: '998399'
    });
  }, [basePriceInr, buyerBillingProfile]);

  const taxAmountInr = taxDetails.tax_amount;
  const finalPayableInr = taxDetails.final_total;

  // Consistent statutory tax calculation in USD matching the statutory tax rate
  // Never mixes USD price with INR tax/total, and no gateway markup on top
  const taxRate = taxDetails.tax_rate || 0;
  const taxAmountUsd = Number((basePriceUsd * taxRate).toFixed(2));
  const taxUsdString = taxAmountUsd.toFixed(2);

  // Total Payable in USD
  const finalPayableUsd = Number((basePriceUsd + taxAmountUsd).toFixed(2));
  const totalUsdString = finalPayableUsd.toFixed(2);
  const usdAmount = finalPayableUsd;
  const usdString = totalUsdString;

  // Dynamic live exchange rate state for reference telemetry
  const [ratesData, setRatesData] = useState<ExchangeRatesData | null>(contextLiveRates);
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(!contextLiveRates);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Keep local rate synced with context and ensure fresh rate is fetched
  useEffect(() => {
    let isMounted = true;
    if (contextLiveRates) {
      setRatesData(contextLiveRates);
      setIsRatesLoading(false);
    } else {
      setIsRatesLoading(true);
      fetchLiveExchangeRates()
        .then((fresh) => {
          if (isMounted) {
            setRatesData(fresh);
            setIsRatesLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Live rates fetch failed in OrderModal', err);
            setRatesError('Failed to fetch real-time exchange rates.');
            setIsRatesLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [contextLiveRates]);

  const dynamicUsdRate = ratesData?.rates?.USD || (1 / USD_TO_INR_RATE);

  const deliveryDays = isCustomOffer
    ? (customOffer?.delivery_days || 5)
    : (selectedPkg?.delivery_days || 3);

  const revisionsAllowed = isCustomOffer
    ? (customOffer?.revisions || 3)
    : (selectedPkg?.revisions || 2);

  // Check capacity for the target gig
  const targetGigId = gig?.id || customOffer?.gig_id;
  const capacityInfo = targetGigId ? getGigCapacity(targetGigId) : null;
  const isFullyBooked = capacityInfo ? capacityInfo.isFullyBooked : false;

  const [currentStep, setCurrentStep] = useState<'checkout' | 'requirements' | 'confirmed'>('checkout');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [buyerName] = useState(customOffer?.buyer_name || 'Sarah Jenkins (Indie Artist)');
  const [orderError, setOrderError] = useState<string | null>(null);

  // Payment Options: 'razorpay' | 'paypal' - synchronized with selected buyer currency
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'razorpay' | 'paypal'>(
    selectedCurrency === 'USD' ? 'paypal' : 'razorpay'
  );

  // Auto-align default payment gateway when buyer switches currency
  useEffect(() => {
    if (selectedCurrency === 'USD') {
      setSelectedPaymentMethod('paypal');
    } else if (selectedCurrency === 'INR') {
      setSelectedPaymentMethod('razorpay');
    }
  }, [selectedCurrency]);

  // In-flight payment state
  const [isPaying, setIsPaying] = useState(false);
  const [isPaypalReady, setIsPaypalReady] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<{
    type: 'cancelled' | 'failed';
    message: string;
  } | null>(null);

  // Guard against duplicate activations
  const isActivatingRef = useRef(false);
  const processedPaymentIdsRef = useRef<Set<string>>(new Set());

  // Mount official PayPal Checkout Buttons when PayPal option is selected
  useEffect(() => {
    if (currentStep !== 'checkout' || selectedPaymentMethod !== 'paypal' || isFullyBooked) {
      return;
    }

    let isMounted = true;
    setIsPaypalReady(false);

    const initPaypal = async () => {
      try {
        const loaded = await loadPayPalScript(PAYPAL_CLIENT_ID, 'USD');
        if (!isMounted) return;

        if (!loaded || !(window as any).paypal?.Buttons) {
          setPaymentNotice({
            type: 'failed',
            message: 'Could not load the official PayPal Checkout SDK. Please check your internet connection or ad-blocker and retry.'
          });
          return;
        }

        setIsPaypalReady(true);

        const container = document.getElementById('paypal-button-container');
        if (!container) return;
        container.innerHTML = '';

        (window as any).paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 46,
          },
          createOrder: (_data: any, actions: any) => {
            // Check billing profile completeness before proceeding
            if (!profileValidation.isValid || !taxDetails.is_valid) {
              setBillingPromptReason(
                taxDetails.error_message || 'Please complete your billing profile (Country, State/Region, and Postal Code) before completing checkout.'
              );
              setIsBillingProfileModalOpen(true);
              throw new Error('Billing profile incomplete: ' + (taxDetails.error_message || 'Missing required fields'));
            }

            // Re-verify capacity right before opening PayPal window
            if (targetGigId) {
              const liveCapacity = getGigCapacity(targetGigId);
              if (liveCapacity.isFullyBooked) {
                setOrderError('Capacity reached: This provider has reached their maximum active projects. Orders cannot be accepted.');
                throw new Error('Provider capacity reached');
              }
            }
            setOrderError(null);
            setPaymentNotice(null);

            return actions.order.create({
              purchase_units: [
                {
                  description: isCustomOffer 
                    ? (customOffer?.title || 'Custom Music Offer') 
                    : (gig?.service_title ? `I will ${gig.service_title}` : 'Nain Music Service'),
                  amount: {
                    currency_code: 'USD',
                    value: usdString,
                    breakdown: {
                      item_total: {
                        currency_code: 'USD',
                        value: baseUsdString,
                      },
                      tax_total: {
                        currency_code: 'USD',
                        value: taxUsdString,
                      },
                    },
                  },
                  custom_id: targetGigId || 'custom',
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              setIsPaying(true);
              const details = await actions.order.capture();
              const captureId = details?.id || data?.orderID;

              if (details && (details.status === 'COMPLETED' || captureId)) {
                executeOrderCreationAfterConfirmedPayment(captureId, 'paypal');
              } else {
                setIsPaying(false);
                setPaymentNotice({
                  type: 'failed',
                  message: 'PayPal payment could not be captured. No order was created.'
                });
              }
            } catch (err: any) {
              setIsPaying(false);
              setPaymentNotice({
                type: 'failed',
                message: err?.message || 'PayPal payment capture encountered an error. No order was created.'
              });
            }
          },
          onCancel: () => {
            setIsPaying(false);
            setPaymentNotice({
              type: 'cancelled',
              message: 'PayPal payment was cancelled or closed. No order was created and no funds were deducted. You can retry payment whenever you are ready.'
            });
          },
          onError: (err: any) => {
            setIsPaying(false);
            setPaymentNotice({
              type: 'failed',
              message: err?.message || 'PayPal Checkout encountered an issue. No order was created. Please try again.'
            });
          },
        }).render('#paypal-button-container');
      } catch (err) {
        console.error('PayPal init error:', err);
      }
    };

    initPaypal();

    return () => {
      isMounted = false;
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [currentStep, selectedPaymentMethod, isFullyBooked, finalPayableInr, usdAmount, usdString, baseUsdString, taxUsdString]);

  const handlePayWithRazorpay = async () => {
    // Check billing profile completeness before proceeding
    if (!profileValidation.isValid || !taxDetails.is_valid) {
      setBillingPromptReason(
        taxDetails.error_message || 'Please complete your billing profile (Country, State/Region, and Postal Code) before completing checkout.'
      );
      setIsBillingProfileModalOpen(true);
      return;
    }

    if (isFullyBooked) {
      setOrderError('Cannot place order: This music service is currently fully booked.');
      return;
    }

    if (targetGigId) {
      const liveCapacity = getGigCapacity(targetGigId);
      if (liveCapacity.isFullyBooked) {
        setOrderError('Capacity reached: This provider has reached their maximum active projects. Please try another service or check back soon.');
        return;
      }
    }

    setOrderError(null);
    setPaymentNotice(null);
    setIsPaying(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        setIsPaying(false);
        setPaymentNotice({
          type: 'failed',
          message: 'Could not load the Razorpay checkout gateway. Please check your internet connection or ad-blocker settings and retry.'
        });
        return;
      }

      const keyId = (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_test_1DP5mmOlF5G5ag';
      const amountInPaise = Math.round(finalPayableInr * 100);

      const rzpOptions = {
        key: keyId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Nain Music',
        description: isCustomOffer 
          ? (customOffer?.title || 'Custom Offer') 
          : (gig?.service_title ? `I will ${gig.service_title}` : 'Music Service Order'),
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=128&auto=format&fit=crop&q=80',
        prefill: {
          name: buyerName,
          email: 'sarah@indieartist.com',
        },
        notes: {
          gig_id: targetGigId || 'custom',
          package_type: isCustomOffer ? 'custom' : packageType,
          base_inr: basePriceInr.toString(),
          tax_inr: taxAmountInr.toString(),
          total_inr: finalPayableInr.toString(),
          tax_type: taxDetails.tax_type,
          tax_rate: taxDetails.tax_rate_percentage,
          billing_jurisdiction: taxDetails.billing_jurisdiction,
        },
        theme: {
          color: '#f59e0b'
        },
        modal: {
          ondismiss: () => {
            // User closed/cancelled/abandoned Razorpay modal without completing payment
            setIsPaying(false);
            setPaymentNotice({
              type: 'cancelled',
              message: 'Payment was not completed. The Razorpay payment window was closed or cancelled. No order was created and no funds were charged. You can retry payment whenever you are ready.'
            });
          }
        },
        handler: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
          if (!response || !response.razorpay_payment_id) {
            setIsPaying(false);
            setPaymentNotice({
              type: 'failed',
              message: 'Payment confirmation reference was not received from Razorpay. No order was created.'
            });
            return;
          }

          // ONLY after genuine successful Razorpay payment confirmation do we create/activate the order:
          executeOrderCreationAfterConfirmedPayment(response.razorpay_payment_id, 'razorpay');
        }
      };

      const rzpInstance = new (window as any).Razorpay(rzpOptions);
      rzpInstance.on('payment.failed', (response: any) => {
        setIsPaying(false);
        const reason = response.error?.description || response.error?.reason || 'Payment failed or was declined by the bank.';
        setPaymentNotice({
          type: 'failed',
          message: `Razorpay payment failed: ${reason}. No order has been created. Please retry with a valid payment method.`
        });
      });

      rzpInstance.open();
    } catch (err: any) {
      setIsPaying(false);
      setPaymentNotice({
        type: 'failed',
        message: err?.message || 'Failed to open Razorpay payment gateway. Please retry.'
      });
    }
  };

  const executeOrderCreationAfterConfirmedPayment = (paymentId: string, method: 'razorpay' | 'paypal') => {
    // Prevent duplicate activations
    if (isActivatingRef.current || processedPaymentIdsRef.current.has(paymentId)) {
      console.warn('Prevented duplicate order activation for payment ID:', paymentId);
      return;
    }
    isActivatingRef.current = true;
    processedPaymentIdsRef.current.add(paymentId);

    setIsPaying(false);
    setPaymentNotice(null);

    try {
      const paymentDetails = {
        reference: paymentId,
        method,
        amount: finalPayableInr,
        taxDetails,
        billingProfile: buyerBillingProfile
      };

      let order: Order;
      if (isCustomOffer && customOffer) {
        order = createOrderFromCustomOffer(
          customOffer.id, 
          buyerName, 
          'sarah@indieartist.com',
          paymentDetails
        );
      } else if (gig) {
        order = createOrderFromPackage(
          gig.id, 
          packageType, 
          selectedExtraIds, 
          buyerName, 
          'sarah@indieartist.com',
          paymentDetails
        );
      } else {
        setOrderError('Invalid service configuration');
        isActivatingRef.current = false;
        return;
      }

      setCreatedOrder(order);

      const hasRequirements = isCustomOffer 
        ? (customOffer?.requirements && customOffer.requirements.length > 0)
        : (gig?.requirements && gig.requirements.length > 0);

      if (hasRequirements) {
        setCurrentStep('requirements');
      } else {
        setCurrentStep('confirmed');
        onOrderCreated(order);
      }
    } catch (err: any) {
      isActivatingRef.current = false;
      setOrderError(err?.message || `Payment verified (${paymentId}) but order activation encountered an issue. Please contact support.`);
    }
  };

  const handleSubmitIntake = () => {
    if (!createdOrder) return;
    submitOrderRequirements(createdOrder.id, answers);
    setCurrentStep('confirmed');
    onOrderCreated(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              {isCustomOffer ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentStep === 'requirements'
                  ? 'Project Intake Requirements'
                  : currentStep === 'confirmed'
                  ? 'Order Confirmed & Active'
                  : isCustomOffer 
                  ? 'Accept & Pay Custom Offer' 
                  : 'Order Checkout & Payment'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isCustomOffer 
                  ? 'Private proposal from verified provider' 
                  : 'Direct checkout populated from Gig package'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* STEP 1: CHECKOUT & PAYMENT OPTIONS */}
          {currentStep === 'checkout' && (
            <div className="space-y-4">
              
              {/* Capacity Alert if full */}
              {isFullyBooked && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-rose-300 block">Service Currently Fully Booked</span>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      This provider is currently handling their maximum project capacity ({capacityInfo?.currentActiveProjects} of {capacityInfo?.maxActiveProjects} active projects). Orders cannot be placed at this time.
                    </p>
                  </div>
                </div>
              )}

              {/* General Order Error */}
              {orderError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Payment Cancelled Notice */}
              {paymentNotice && paymentNotice.type === 'cancelled' && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <span className="font-bold text-amber-300 block">Payment Incomplete</span>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      {paymentNotice.message}
                    </p>
                    {selectedPaymentMethod === 'razorpay' ? (
                      <button
                        type="button"
                        onClick={handlePayWithRazorpay}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 mt-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Click here to retry Razorpay payment
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-300 block">
                        Select an option below to retry PayPal checkout.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Failed Notice */}
              {paymentNotice && paymentNotice.type === 'failed' && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <span className="font-bold text-rose-300 block">Payment Declined / Failed</span>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      {paymentNotice.message}
                    </p>
                    {selectedPaymentMethod === 'razorpay' && (
                      <button
                        type="button"
                        onClick={handlePayWithRazorpay}
                        className="text-[11px] font-bold text-rose-300 hover:text-rose-200 underline flex items-center gap-1 mt-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Click here to retry payment
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Buyer Selected Checkout Currency Selector */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Buyer Checkout Currency</span>
                    <span className="text-[10px] text-slate-400">Controls entire checkout, tax breakdown & gateway</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCurrency('USD');
                      setSelectedPaymentMethod('paypal');
                      setOrderError(null);
                      setPaymentNotice(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isUsd
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>$ USD</span>
                    <span className="text-[10px] font-normal opacity-85">(PayPal)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCurrency('INR');
                      setSelectedPaymentMethod('razorpay');
                      setOrderError(null);
                      setPaymentNotice(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      !isUsd
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>₹ INR</span>
                    <span className="text-[10px] font-normal opacity-85">(Razorpay)</span>
                  </button>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                  {isCustomOffer ? <Sparkles className="w-3 h-3" /> : null}
                  {isCustomOffer ? 'Tailored Custom Offer' : 'Order Summary'}
                </span>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {isCustomOffer ? customOffer?.title : `I will ${gig?.service_title}`}
                </h4>

                <p className="text-xs text-slate-400">
                  Service Category: <strong className="text-slate-200">{isCustomOffer ? customOffer?.service_name : gig?.service_type}</strong>
                </p>

                {isCustomOffer ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {customOffer?.description}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-300">
                      <span className="font-semibold text-amber-400">Custom Scope Price</span>
                      <span className="font-mono font-bold text-white">
                        {isUsd
                          ? `$${pkgPriceUsd.toFixed(2)} USD`
                          : `₹${pkgPriceInr.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-300">
                    <span className="capitalize font-semibold text-amber-400">{selectedPkg?.name} ({packageType})</span>
                    <span className="font-mono font-bold text-white">
                      {isUsd
                        ? `$${pkgPriceUsd.toFixed(2)} USD`
                        : `₹${pkgPriceInr.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                )}

                {/* Extras list if standard gig */}
                {!isCustomOffer && selectedExtras.map(ext => {
                  const extUsdVal = (ext as any).price_usd !== undefined && (ext as any).price_usd > 0
                    ? (ext as any).price_usd
                    : ext.price_inr / USD_TO_INR_RATE;
                  return (
                    <div key={ext.id} className="flex items-center justify-between text-xs text-slate-400">
                      <span>+ Extra: {ext.name}</span>
                      <span className="font-mono">
                        {isUsd
                          ? `+$${extUsdVal.toFixed(2)} USD`
                          : `+₹${ext.price_inr.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Delivery info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Delivery Time:</span>
                  </div>
                  <span className="font-bold text-white">{deliveryDays} Days</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Revisions:</span>
                  </div>
                  <span className="font-bold text-white">{revisionsAllowed === -1 ? 'Unlimited' : `${revisionsAllowed} Revisions`}</span>
                </div>
              </div>

              {/* Buyer Account Billing Profile & Statutory Tax Assessment */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    Buyer Billing Profile & Tax Assessment:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingPromptReason(undefined);
                      setIsBillingProfileModalOpen(true);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1 transition"
                  >
                    <span>Edit Profile</span>
                  </button>
                </div>

                {/* Profile Incomplete Banner or Active Profile Details */}
                {!profileValidation.isValid ? (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Billing Information Incomplete</p>
                        <p className="text-[11px] text-amber-300/90 leading-relaxed mt-0.5">
                          {taxDetails.error_message || 'Please provide your Country, State/Province, and Postal Code so statutory indirect tax can be automatically determined.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingPromptReason('Please complete your required billing address before paying.');
                        setIsBillingProfileModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition"
                    >
                      Complete Billing Profile Now
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Billed To</span>
                        <span className="font-semibold text-white">
                          {buyerBillingProfile.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {buyerBillingProfile.buyer_type === 'business' 
                            ? `Business: ${buyerBillingProfile.business_name || 'Registered Entity'}` 
                            : 'Individual Buyer'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Jurisdiction</span>
                        <span className="font-semibold text-slate-200">
                          {buyerBillingProfile.state ? `${buyerBillingProfile.state}, ` : ''}{buyerBillingProfile.country}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          PIN/ZIP: {buyerBillingProfile.postal_code || '—'}
                        </span>
                      </div>
                    </div>

                    {buyerBillingProfile.tax_id && (
                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Tax ID / GSTIN:</span>
                        <span className="font-mono text-amber-400 font-semibold">{buyerBillingProfile.tax_id}</span>
                      </div>
                    )}

                    {/* Statutory Indirect Tax Result Badge */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Statutory Tax:</span>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          {taxDetails.tax_type === 'None' ? 'Exempt / 0%' : `${taxDetails.tax_type} (${taxDetails.tax_rate_percentage})`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SAC Code: {taxDetails.tax_code}
                      </span>
                    </div>

                    {taxDetails.notes && (
                      <p className="text-[10px] text-slate-400 leading-normal pt-1 border-t border-slate-800/60 font-mono">
                        Rule: {taxDetails.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isUsd ? 'Payment Summary (USD)' : 'Payment Summary (INR)'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    {isUsd ? 'Currency: USD ($)' : 'Currency: INR (₹)'}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Gig Price:</span>
                  <span className="font-bold text-white font-mono">
                    {isUsd ? `$${baseUsdString} USD` : `₹${basePriceInr.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <span>{formatTaxSummaryLabel(taxDetails)}:</span>
                    {taxDetails.tax_rate > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({taxDetails.tax_rate_percentage})
                      </span>
                    )}
                  </span>
                  <span className={`font-mono font-semibold ${(isUsd ? taxAmountUsd : taxAmountInr) > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {isUsd 
                      ? (taxAmountUsd > 0 ? `+$${taxUsdString} USD` : '$0.00 USD')
                      : (taxAmountInr > 0 ? `+₹${taxAmountInr.toLocaleString('en-IN')}` : '₹0')}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>Buyer Protection Fee:</span>
                  <span className="text-emerald-400 font-semibold">{isUsd ? 'Free ($0.00)' : 'Free (₹0)'}</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-white pt-2.5 border-t border-slate-900">
                  <span>Total Payable:</span>
                  <div className="text-right">
                    {isUsd ? (
                      <>
                        <span className="font-mono text-amber-400 text-base block">
                          ${totalUsdString} USD
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal block font-mono">
                          Internal Ledger Base: ₹{finalPayableInr.toLocaleString('en-IN')} INR
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-amber-400 text-base block">
                          ₹{finalPayableInr.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal block font-mono">
                          Indian Domestic Checkout (UPI / Cards)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Protection Callout */}
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Payment Protection:</strong> Your payment is processed securely. After the provider completes the order and you accept the delivery, the provider’s 80% earnings enter a 7-day clearing period before becoming available for withdrawal.
                  </span>
                </div>
              </div>

              {/* EXACTLY 2 PAYMENT OPTIONS: PAY WITH RAZORPAY & PAY WITH PAYPAL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    Select Payment Method:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    2 Verified Gateways
                  </span>
                </div>

                {/* Option 1: Pay with Razorpay */}
                <div 
                  onClick={() => {
                    if (!isPaying) {
                      setSelectedPaymentMethod('razorpay');
                      if (selectedCurrency !== 'INR') {
                        setSelectedCurrency('INR');
                      }
                      setOrderError(null);
                      setPaymentNotice(null);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    selectedPaymentMethod === 'razorpay'
                      ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center ${
                        selectedPaymentMethod === 'razorpay'
                          ? 'border-amber-500 bg-amber-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {selectedPaymentMethod === 'razorpay' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-white">Pay with Razorpay</h5>
                          <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-semibold">
                            INR (₹) • UPI & Cards
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Pay in INR (₹) via Google Pay, PhonePe, Paytm, BHIM UPI, Visa, Mastercard, RuPay, NetBanking, and Indian Wallets.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-white shrink-0 ml-2">
                      ₹{finalPayableInr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Active Razorpay Actions */}
                  {selectedPaymentMethod === 'razorpay' && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
                        <span>Gateway: Razorpay Official Checkout</span>
                        <span className="text-amber-400 font-mono font-semibold">Charge: ₹{finalPayableInr.toLocaleString('en-IN')}</span>
                      </div>

                      <button
                        type="button"
                        disabled={isFullyBooked || isPaying}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayWithRazorpay();
                        }}
                        className={`w-full py-3.5 font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                          isFullyBooked
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : isPaying
                            ? 'bg-amber-600/80 text-slate-950 cursor-wait'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                        }`}
                      >
                        {isFullyBooked ? (
                          <span>Currently Fully Booked</span>
                        ) : isPaying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Opening Razorpay Gateway...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Pay ₹{finalPayableInr.toLocaleString('en-IN')} with Razorpay</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Option 2: Pay with PayPal */}
                <div 
                  onClick={() => {
                    if (!isPaying) {
                      setSelectedPaymentMethod('paypal');
                      if (selectedCurrency !== 'USD') {
                        setSelectedCurrency('USD');
                      }
                      setOrderError(null);
                      setPaymentNotice(null);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    selectedPaymentMethod === 'paypal'
                      ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center ${
                        selectedPaymentMethod === 'paypal'
                          ? 'border-amber-500 bg-amber-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {selectedPaymentMethod === 'paypal' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-white">Pay with PayPal</h5>
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            USD ($) • International
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Official PayPal Checkout for international buyers. Pay with PayPal balance, credit/debit cards, or Pay Later in USD ($).
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-mono font-bold text-white block">
                        ${totalUsdString} USD
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Official PayPal
                      </span>
                    </div>
                  </div>

                  {/* Active PayPal Actions */}
                  {selectedPaymentMethod === 'paypal' && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>Gateway: Official PayPal SDK</span>
                        </div>
                        <span className="text-amber-400 font-mono font-bold">Payable: ${totalUsdString} USD</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-900 font-mono">
                        <span>Base: ${baseUsdString} USD</span>
                        <span>{taxDetails.tax_type} ({taxDetails.tax_rate_percentage}): +${taxUsdString} USD</span>
                      </div>

                      {isFullyBooked ? (
                        <div className="p-3 rounded-xl bg-slate-800 text-slate-400 text-xs text-center">
                          Cannot checkout: Provider is currently fully booked.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {!isPaypalReady && (
                            <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2 bg-slate-950/50 rounded-xl border border-slate-800">
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                              <span>Loading official PayPal Checkout...</span>
                            </div>
                          )}
                          {/* PayPal SDK mounts buttons here */}
                          <div id="paypal-button-container" className="min-h-[46px] w-full" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Strict Pre-Payment Rule Assurance */}
              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  No order or project status will be activated until official payment confirmation is received.
                </span>
              </div>

            </div>
          )}

          {/* STEP 2: ORDER INTAKE REQUIREMENTS */}
          {currentStep === 'requirements' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Check className="w-3 h-3" />
                  Payment Confirmed & Protected
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-amber-400" />
                  Submit Project Requirements
                </h4>
                <p className="text-xs text-slate-400">
                  Provide project materials and specifications so work can begin immediately.
                </p>
              </div>

              {/* Custom Offer Requirements */}
              {isCustomOffer && customOffer?.requirements && (
                <div className="space-y-3">
                  {customOffer.requirements.map((reqText, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <label className="text-xs font-semibold text-slate-200 block">
                        {idx + 1}. {reqText}
                      </label>
                      <input
                        type="text"
                        placeholder="Paste link (Google Drive/Dropbox) or provide details..."
                        value={answers[`custom_req_${idx}`] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [`custom_req_${idx}`]: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Standard Gig Requirements */}
              {!isCustomOffer && gig && (
                <div className="space-y-3">
                  {gig.requirements.map((req) => (
                    <div key={req.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-200">
                          {req.question}
                        </label>
                        {req.required && (
                          <span className="text-[10px] text-amber-400 font-bold uppercase">Required</span>
                        )}
                      </div>

                      {req.type === 'file_upload' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Paste cloud stem download link (Google Drive / WeTransfer)..."
                            value={answers[req.id] || ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => setAnswers(prev => ({ ...prev, [req.id]: 'https://drive.google.com/drive/folders/sample_stems_24bit' }))}
                            className="text-[10px] text-amber-400 hover:underline"
                          >
                            + Autofill demo stems folder link
                          </button>
                        </div>
                      )}

                      {req.type === 'text' && (
                        <textarea
                          rows={2}
                          value={answers[req.id] || ''}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [req.id]: e.target.value }))}
                          placeholder="Type details or BPM / Key info here..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitIntake}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                Submit Requirements & Start Order
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMED */}
          {currentStep === 'confirmed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Order Confirmed & Payment Protected</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your payment via {createdOrder?.payment_method === 'paypal' ? 'PayPal' : 'Razorpay'} was confirmed. The order is now live and in progress in your Order Workspace.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-2 max-w-sm mx-auto font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Order Number:</span>
                  <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {createdOrder?.order_number || createdOrder?.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Payment Gateway:</span>
                  <span className="font-bold text-white capitalize bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {createdOrder?.payment_method === 'paypal' ? 'PayPal' : 'Razorpay'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Payment Reference:</span>
                  <span className="font-mono text-emerald-400 text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {createdOrder?.payment_reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-400">
                    {createdOrder?.status || 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Paid / Payment Protected
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gig Price:</span>
                  <span className="font-mono text-white">
                    {createdOrder?.payment_method === 'paypal' || isUsd
                      ? `$${baseUsdString} USD`
                      : `₹${createdOrder?.price_inr?.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {createdOrder?.tax_details && createdOrder.tax_details.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax ({createdOrder.tax_details.tax_type} {createdOrder.tax_details.tax_rate_percentage}):</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {createdOrder?.payment_method === 'paypal' || isUsd
                        ? `+$${taxUsdString} USD`
                        : `+₹${createdOrder.tax_details.tax_amount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-900">
                  <span className="text-slate-300 font-bold">Total Amount Paid:</span>
                  <div className="text-right font-mono font-bold text-amber-400">
                    {createdOrder?.payment_method === 'paypal' || isUsd ? (
                      <>
                        <span className="text-base block">${totalUsdString} USD</span>
                        <span className="text-[11px] text-slate-400 font-normal block font-mono">
                          (Internal Base: ₹{createdOrder?.total_price_inr?.toLocaleString('en-IN')} INR)
                        </span>
                      </>
                    ) : (
                      <span>₹{createdOrder?.total_price_inr?.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-900 text-slate-400">
                  <span>Payment Protection:</span>
                  <span className="text-emerald-400 font-semibold">Protected (7-day provider clearing)</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (createdOrder) {
                      onOrderCreated(createdOrder);
                    }
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Order Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Buyer Billing Profile Modal */}
      {isBillingProfileModalOpen && (
        <BuyerBillingProfileModal
          isOpen={isBillingProfileModalOpen}
          onClose={() => setIsBillingProfileModalOpen(false)}
          reasonPrompt={billingPromptReason}
        />
      )}

      {/* Statutory Tax Invoice Modal */}
      {isInvoiceModalOpen && createdOrder && (
        <OrderInvoiceModal
          order={createdOrder}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
};
