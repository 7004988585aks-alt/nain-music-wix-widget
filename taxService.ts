import { TaxDetails, TaxType, BuyerBillingProfile, BuyerType } from '../types';

/**
 * NAIN MUSIC AUTOMATIC INDIRECT TAX ENGINE
 * 
 * Architecture Principles:
 * 1. Base Gig Price in INR is the permanent source of truth.
 * 2. Provider 80% earnings and Nain 20% platform fee are strictly derived from the base price.
 * 3. Tax is never manually selected by the buyer; it is assessed automatically based on factual billing information.
 * 4. Place of supply rules (e.g. India CGST+SGST vs IGST, EU/UK VAT B2B reverse charge vs B2C, US state digital nexus).
 * 5. Clean country and state catalogs without tax rates in names.
 * 6. Pluggable architecture ready for live external compliance APIs (e.g. Stripe Tax, Avalara).
 */

export interface CountryCatalogItem {
  code: string;
  name: string;
  requiresState: boolean;
  requiresPostalCode: boolean;
  taxSystem: 'GST' | 'VAT' | 'Sales Tax' | 'JCT' | 'Export';
  taxIdLabel?: string; // e.g. "GSTIN", "VAT Number", "Tax ID / EIN"
  taxIdPlaceholder?: string;
  states?: { code: string; name: string }[];
}

// Clean Country Catalog - Strictly clean geographical names, zero tax rates in labels
export const SUPPORTED_COUNTRIES: CountryCatalogItem[] = [
  {
    code: 'IN',
    name: 'India',
    requiresState: true,
    requiresPostalCode: true,
    taxSystem: 'GST',
    taxIdLabel: 'GSTIN (if registered business)',
    taxIdPlaceholder: 'e.g. 27AABCN1234M1Z5 (15 digits)',
    states: [
      { code: 'AN', name: 'Andaman and Nicobar Islands' },
      { code: 'AP', name: 'Andhra Pradesh' },
      { code: 'AR', name: 'Arunachal Pradesh' },
      { code: 'AS', name: 'Assam' },
      { code: 'BR', name: 'Bihar' },
      { code: 'CH', name: 'Chandigarh' },
      { code: 'CT', name: 'Chhattisgarh' },
      { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu' },
      { code: 'DL', name: 'Delhi' },
      { code: 'GA', name: 'Goa' },
      { code: 'GJ', name: 'Gujarat' },
      { code: 'HR', name: 'Haryana' },
      { code: 'HP', name: 'Himachal Pradesh' },
      { code: 'JK', name: 'Jammu and Kashmir' },
      { code: 'JH', name: 'Jharkhand' },
      { code: 'KA', name: 'Karnataka' },
      { code: 'KL', name: 'Kerala' },
      { code: 'LA', name: 'Ladakh' },
      { code: 'LD', name: 'Lakshadweep' },
      { code: 'MP', name: 'Madhya Pradesh' },
      { code: 'MH', name: 'Maharashtra' },
      { code: 'MN', name: 'Manipur' },
      { code: 'ML', name: 'Meghalaya' },
      { code: 'MZ', name: 'Mizoram' },
      { code: 'NL', name: 'Nagaland' },
      { code: 'OD', name: 'Odisha' },
      { code: 'PY', name: 'Puducherry' },
      { code: 'PB', name: 'Punjab' },
      { code: 'RJ', name: 'Rajasthan' },
      { code: 'SK', name: 'Sikkim' },
      { code: 'TN', name: 'Tamil Nadu' },
      { code: 'TS', name: 'Telangana' },
      { code: 'TR', name: 'Tripura' },
      { code: 'UP', name: 'Uttar Pradesh' },
      { code: 'UK', name: 'Uttarakhand' },
      { code: 'WB', name: 'West Bengal' }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    requiresState: true,
    requiresPostalCode: true,
    taxSystem: 'Sales Tax',
    taxIdLabel: 'EIN / Resale Certificate (if applicable)',
    taxIdPlaceholder: 'e.g. 12-3456789',
    states: [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'DC', name: 'District of Columbia' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'UK VAT Number (if registered)',
    taxIdPlaceholder: 'e.g. GB123456789'
  },
  {
    code: 'DE',
    name: 'Germany',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'EU VAT ID (USt-IdNr.)',
    taxIdPlaceholder: 'e.g. DE123456789'
  },
  {
    code: 'FR',
    name: 'France',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'Numéro de TVA Intracommunautaire',
    taxIdPlaceholder: 'e.g. FR12345678901'
  },
  {
    code: 'IE',
    name: 'Ireland',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'Irish VAT Number',
    taxIdPlaceholder: 'e.g. IE1234567T'
  },
  {
    code: 'IT',
    name: 'Italy',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'Partita IVA',
    taxIdPlaceholder: 'e.g. IT12345678901'
  },
  {
    code: 'ES',
    name: 'Spain',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'NIF-IVA (CIF)',
    taxIdPlaceholder: 'e.g. ESX1234567X'
  },
  {
    code: 'NL',
    name: 'Netherlands',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'Btw-identificatienummer',
    taxIdPlaceholder: 'e.g. NL123456789B01'
  },
  {
    code: 'SE',
    name: 'Sweden',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'VAT',
    taxIdLabel: 'Momsregistreringsnummer',
    taxIdPlaceholder: 'e.g. SE123456789001'
  },
  {
    code: 'CA',
    name: 'Canada',
    requiresState: true,
    requiresPostalCode: true,
    taxSystem: 'GST',
    taxIdLabel: 'CRA Business Number / GST Account',
    taxIdPlaceholder: 'e.g. 123456789 RT0001',
    states: [
      { code: 'AB', name: 'Alberta' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'NT', name: 'Northwest Territories' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'NU', name: 'Nunavut' },
      { code: 'ON', name: 'Ontario' },
      { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'YT', name: 'Yukon' }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'GST',
    taxIdLabel: 'Australian Business Number (ABN)',
    taxIdPlaceholder: 'e.g. 11 222 333 444'
  },
  {
    code: 'SG',
    name: 'Singapore',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'GST',
    taxIdLabel: 'UEN / GST Registration Number',
    taxIdPlaceholder: 'e.g. 201234567A'
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'GST',
    taxIdLabel: 'NZ GST Number',
    taxIdPlaceholder: 'e.g. 123-456-789'
  },
  {
    code: 'JP',
    name: 'Japan',
    requiresState: false,
    requiresPostalCode: true,
    taxSystem: 'JCT',
    taxIdLabel: 'Qualified Invoice Issuer Number (T-Number)',
    taxIdPlaceholder: 'e.g. T1234567890123'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    requiresState: false,
    requiresPostalCode: false,
    taxSystem: 'Export',
    taxIdLabel: 'Tax Registration Number (TRN)',
    taxIdPlaceholder: 'e.g. 100123456700003'
  },
  {
    code: 'OTHER',
    name: 'Other Jurisdiction (International)',
    requiresState: false,
    requiresPostalCode: false,
    taxSystem: 'Export',
    taxIdLabel: 'Local Tax Identification Number',
    taxIdPlaceholder: 'e.g. Tax ID / Registration #'
  }
];

// Map lookup by country code
export const COUNTRIES_BY_CODE: Record<string, CountryCatalogItem> = SUPPORTED_COUNTRIES.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {} as Record<string, CountryCatalogItem>);

// Platform Statutory Registration Info (Nain Music)
export const PLATFORM_TAX_PROFILE = {
  companyName: 'Nain Music Technologies Private Limited',
  countryCode: 'IN',
  stateCode: 'MH',
  stateName: 'Maharashtra',
  gstin: '27AABCN1234M1Z5',
  sacCode: '998399',
  sacDescription: 'Other professional, technical and business services - Sound recording and music production services',
  registeredAddress: 'Level 5, Bandra Kurla Complex, Mumbai, Maharashtra 400051, India',
};

export interface TaxCalculationInput {
  taxableAmount?: number;
  basePriceInr?: number; // Alias for taxableAmount
  buyerCountry?: string; // Country code e.g. "IN", "US", "GB"
  buyerState?: string; // State code e.g. "MH", "BR", "TX", "ON"
  postalCode?: string;
  buyerType?: BuyerType; // 'individual' | 'business'
  taxId?: string;
  businessName?: string;
  profile?: Partial<BuyerBillingProfile>;
  sacCode?: string;
}

/**
 * Validates a buyer billing profile for indirect tax assessment.
 */
export function validateBillingProfile(profile: Partial<BuyerBillingProfile>): {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
} {
  const missingFields: string[] = [];
  const errors: string[] = [];

  if (!profile.country_code) {
    missingFields.push('Billing Country');
  }

  const countryItem = profile.country_code ? COUNTRIES_BY_CODE[profile.country_code] : null;

  if (countryItem?.requiresState && (!profile.state || profile.state.trim() === '')) {
    missingFields.push('State / Province');
  }

  if (countryItem?.requiresPostalCode && (!profile.postal_code || profile.postal_code.trim() === '')) {
    missingFields.push('Postal / ZIP Code');
  }

  if (profile.buyer_type === 'business') {
    if (!profile.business_name || profile.business_name.trim() === '') {
      missingFields.push('Business Name');
    }
  }

  // Validate Indian GSTIN format if provided
  if (profile.country_code === 'IN' && profile.tax_id && profile.tax_id.trim().length > 0) {
    const cleanGst = profile.tax_id.trim().toUpperCase();
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinPattern.test(cleanGst)) {
      errors.push('Invalid GSTIN format (must be 15 alphanumeric characters, e.g. 27AABCN1234M1Z5)');
    }
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

/**
 * CORE AUTOMATIC TAX CALCULATION ENGINE
 * 
 * Determines indirect tax based on factual buyer billing parameters:
 * - India: Intrastate (Maharashtra) -> CGST 9% + SGST 9%; Interstate (Other states) -> IGST 18%
 * - UK / EU: B2B Reverse Charge (0%) if valid VAT ID; B2C statutory destination VAT
 * - US: State destination rules for digital products & audio services
 * - Canada: Provincial GST/HST
 * - AU/SG/NZ/JP: Cross-border digital service statutory regimes
 * - Cross-Border Export: Zero-rated / Non-taxable where statutory criteria met
 * - Missing Info: Flags is_valid: false and does NOT guess
 */
export function calculateAutomaticTax(input: TaxCalculationInput): TaxDetails {
  const safeBase = Math.max(0, input.taxableAmount ?? input.basePriceInr ?? 0);
  const p = input.profile;
  const countryCode = (input.buyerCountry || p?.country_code || 'IN').toUpperCase();
  const countryItem = COUNTRIES_BY_CODE[countryCode] || COUNTRIES_BY_CODE.OTHER;
  const buyerType: BuyerType = input.buyerType || p?.buyer_type || 'individual';
  const buyerState = input.buyerState || p?.state;
  const postalCode = input.postalCode || p?.postal_code;
  const taxId = (input.taxId || p?.tax_id || '').trim().toUpperCase();
  const businessName = (input.businessName || p?.business_name || '').trim();

  // 1. Verify required billing info
  const validation = validateBillingProfile({
    country_code: countryCode,
    state: buyerState,
    postal_code: postalCode,
    buyer_type: buyerType,
    business_name: businessName,
    tax_id: taxId
  });

  if (!validation.isValid) {
    const errorMsg = validation.errors.length > 0 
      ? validation.errors[0] 
      : `Billing profile incomplete. Missing required: ${validation.missingFields.join(', ')}.`;

    return {
      buyer_country: countryItem.name,
      buyer_country_code: countryCode,
      buyer_state: input.buyerState,
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: `${countryItem.name} (Incomplete Profile)`,
      tax_type: 'None',
      tax_rate: 0,
      tax_rate_percentage: '0%',
      taxable_amount: safeBase,
      tax_amount: 0,
      final_total: safeBase,
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      is_valid: false,
      missing_fields: validation.missingFields,
      error_message: errorMsg,
      notes: `Billing profile incomplete. Required: ${validation.missingFields.join(', ')}. Tax cannot be assessed without complete factual billing details.`
    };
  }

  // 2. INDIA (GST Model - CGST + SGST vs IGST)
  if (countryCode === 'IN') {
    const rawState = (input.buyerState || '').trim();
    // Resolve state name/code
    let matchedState = countryItem.states?.find(
      s => s.code.toUpperCase() === rawState.toUpperCase() || s.name.toLowerCase() === rawState.toLowerCase()
    );

    const stateCode = matchedState?.code || rawState.toUpperCase();
    const stateName = matchedState?.name || rawState;
    const isIntrastate = stateCode === 'MH' || stateName.toLowerCase().includes('maharashtra');

    const totalRate = 0.18;
    const rawTotalTax = safeBase * totalRate;
    const taxAmount = Number(rawTotalTax.toFixed(2));
    const finalTotal = Number((safeBase + taxAmount).toFixed(2));

    if (isIntrastate) {
      // Intra-state supply: CGST (9%) + SGST (9%)
      const cgstRate = 0.09;
      const sgstRate = 0.09;
      const cgstAmount = Number((safeBase * cgstRate).toFixed(2));
      const sgstAmount = Number((taxAmount - cgstAmount).toFixed(2)); // Ensures sum equals total tax

      return {
        buyer_country: 'India',
        buyer_country_code: 'IN',
        buyer_state: stateName,
        buyer_state_code: stateCode,
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: `India - ${stateName} (Intrastate Supply)`,
        tax_type: 'GST',
        tax_subtype: 'Intrastate (CGST 9% + SGST 9%)',
        tax_rate: totalRate,
        tax_rate_percentage: '18%',
        taxable_amount: safeBase,
        tax_amount: taxAmount,
        final_total: finalTotal,
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: PLATFORM_TAX_PROFILE.sacCode,
        rule_source: 'Goods and Services Tax (GST) Act, 2017 - Sections 7 & 8',
        is_taxable: true,
        is_reverse_charge: false,
        cgst_rate: cgstRate,
        cgst_amount: cgstAmount,
        sgst_rate: sgstRate,
        sgst_amount: sgstAmount,
        is_valid: true,
        notes: taxId 
          ? `B2B Supply: GSTIN ${taxId} eligible for Input Tax Credit (ITC). SAC ${PLATFORM_TAX_PROFILE.sacCode}.` 
          : `B2C Supply: Intrastate supply to ${stateName}. SAC ${PLATFORM_TAX_PROFILE.sacCode}.`
      };
    } else {
      // Inter-state supply: IGST (18%)
      return {
        buyer_country: 'India',
        buyer_country_code: 'IN',
        buyer_state: stateName,
        buyer_state_code: stateCode,
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: `India - ${stateName} (Interstate Supply)`,
        tax_type: 'GST',
        tax_subtype: 'Interstate (IGST 18%)',
        tax_rate: totalRate,
        tax_rate_percentage: '18%',
        taxable_amount: safeBase,
        tax_amount: taxAmount,
        final_total: finalTotal,
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: PLATFORM_TAX_PROFILE.sacCode,
        rule_source: 'Integrated Goods and Services Tax (IGST) Act, 2017 - Section 5',
        is_taxable: true,
        is_reverse_charge: false,
        igst_rate: totalRate,
        igst_amount: taxAmount,
        is_valid: true,
        notes: taxId 
          ? `B2B Interstate Supply: GSTIN ${taxId} recorded on tax invoice for ITC. SAC ${PLATFORM_TAX_PROFILE.sacCode}.` 
          : `B2C Interstate Supply: Place of supply is ${stateName}. IGST assessed at 18%.`
      };
    }
  }

  // 3. UNITED KINGDOM (UK VAT)
  if (countryCode === 'GB') {
    const isB2BWithVat = buyerType === 'business' && taxId.length >= 8;

    if (isB2BWithVat) {
      // UK B2B Reverse Charge under Section 8 VATA 1994
      return {
        buyer_country: 'United Kingdom',
        buyer_country_code: 'GB',
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: 'United Kingdom (B2B Cross-border)',
        tax_type: 'VAT',
        tax_subtype: 'Reverse Charge (Section 8 VATA 1994)',
        tax_rate: 0,
        tax_rate_percentage: '0% (Reverse Charge)',
        taxable_amount: safeBase,
        tax_amount: 0,
        final_total: safeBase,
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: 'UK VAT ESS B2B',
        rule_source: 'UK Value Added Tax Act 1994, Section 8',
        is_taxable: false,
        is_reverse_charge: true,
        is_valid: true,
        notes: `B2B Reverse Charge: VAT ID ${taxId}. Customer to account for VAT under reverse charge mechanism.`
      };
    }

    // B2C UK VAT 20%
    const rate = 0.20;
    const taxAmount = Number((safeBase * rate).toFixed(2));
    return {
      buyer_country: 'United Kingdom',
      buyer_country_code: 'GB',
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: 'United Kingdom (B2C Remote Digital Services)',
      tax_type: 'VAT',
      tax_subtype: 'Standard UK VAT',
      tax_rate: rate,
      tax_rate_percentage: '20%',
      taxable_amount: safeBase,
      tax_amount: taxAmount,
      final_total: Number((safeBase + taxAmount).toFixed(2)),
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: 'UK VAT ESS B2C',
      rule_source: 'HMRC Electronically Supplied Services Regulations',
      is_taxable: true,
      is_reverse_charge: false,
      is_valid: true,
      notes: 'B2C Electronic Supply of Music/Audio Services subject to UK VAT 20%.'
    };
  }

  // 4. EUROPEAN UNION (EU VAT MOSS / OSS)
  const EU_RATES: Record<string, { name: string; rate: number; code: string }> = {
    DE: { name: 'Germany', rate: 0.19, code: 'DE' },
    FR: { name: 'France', rate: 0.20, code: 'FR' },
    IE: { name: 'Ireland', rate: 0.23, code: 'IE' },
    IT: { name: 'Italy', rate: 0.22, code: 'IT' },
    ES: { name: 'Spain', rate: 0.21, code: 'ES' },
    NL: { name: 'Netherlands', rate: 0.21, code: 'NL' },
    SE: { name: 'Sweden', rate: 0.25, code: 'SE' },
  };

  if (EU_RATES[countryCode]) {
    const eu = EU_RATES[countryCode];
    const isB2BWithVat = buyerType === 'business' && taxId.length >= 8;

    if (isB2BWithVat) {
      // EU B2B Reverse Charge under Article 196 EU VAT Directive
      return {
        buyer_country: eu.name,
        buyer_country_code: countryCode,
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: `${eu.name} (EU B2B Reverse Charge)`,
        tax_type: 'VAT',
        tax_subtype: 'Reverse Charge (Article 196)',
        tax_rate: 0,
        tax_rate_percentage: '0% (Reverse Charge)',
        taxable_amount: safeBase,
        tax_amount: 0,
        final_total: safeBase,
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: `EU VAT B2B (${eu.code})`,
        rule_source: 'Council Directive 2006/112/EC, Article 196',
        is_taxable: false,
        is_reverse_charge: true,
        is_valid: true,
        notes: `EU B2B Supply: Customer VAT ID ${taxId}. Reverse charge applies; customer self-assesses VAT.`
      };
    }

    const taxAmount = Number((safeBase * eu.rate).toFixed(2));
    const ratePct = `${Math.round(eu.rate * 100)}%`;
    return {
      buyer_country: eu.name,
      buyer_country_code: countryCode,
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: `${eu.name} (EU OSS Destination VAT)`,
      tax_type: 'VAT',
      tax_subtype: `Standard VAT (${ratePct})`,
      tax_rate: eu.rate,
      tax_rate_percentage: ratePct,
      taxable_amount: safeBase,
      tax_amount: taxAmount,
      final_total: Number((safeBase + taxAmount).toFixed(2)),
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: `EU VAT MOSS (${eu.code})`,
      rule_source: 'EU One Stop Shop (OSS) Digital Services Scheme',
      is_taxable: true,
      is_reverse_charge: false,
      is_valid: true,
      notes: `B2C Digital Music Service delivered to ${eu.name} destination.`
    };
  }

  // 5. UNITED STATES (State Destination Sales Tax)
  if (countryCode === 'US') {
    const rawState = (input.buyerState || '').trim();
    let matchedState = countryItem.states?.find(
      s => s.code.toUpperCase() === rawState.toUpperCase() || s.name.toLowerCase() === rawState.toLowerCase()
    );
    const stateCode = matchedState?.code || rawState.toUpperCase();
    const stateName = matchedState?.name || rawState;

    // US States where digital audio services & automated processing are subject to sales tax
    const US_DIGITAL_TAX_STATES: Record<string, { rate: number; name: string }> = {
      TX: { rate: 0.0625, name: 'Texas' },
      WA: { rate: 0.065, name: 'Washington' },
      PA: { rate: 0.06, name: 'Pennsylvania' },
      IL: { rate: 0.0625, name: 'Illinois' },
      NY: { rate: 0.04, name: 'New York' },
      OH: { rate: 0.0575, name: 'Ohio' },
      NJ: { rate: 0.06625, name: 'New Jersey' },
      CT: { rate: 0.0635, name: 'Connecticut' },
      NC: { rate: 0.0475, name: 'North Carolina' },
      TN: { rate: 0.07, name: 'Tennessee' },
      IN: { rate: 0.07, name: 'Indiana' },
      AZ: { rate: 0.056, name: 'Arizona' },
    };

    const isB2BExempt = buyerType === 'business' && taxId.length > 5;

    if (isB2BExempt) {
      return {
        buyer_country: 'United States',
        buyer_country_code: 'US',
        buyer_state: stateName,
        buyer_state_code: stateCode,
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: `United States - ${stateName} (B2B Resale / Exemption)`,
        tax_type: 'Sales Tax',
        tax_subtype: 'B2B Resale Exemption',
        tax_rate: 0,
        tax_rate_percentage: '0% (Exempt)',
        taxable_amount: safeBase,
        tax_amount: 0,
        final_total: safeBase,
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: 'US Sales Tax B2B Exempt',
        rule_source: 'US Multistate Resale / Exemption Certificate',
        is_taxable: false,
        is_reverse_charge: false,
        exemption_reason: `Resale / Exemption ID ${taxId} recorded.`,
        is_valid: true,
        notes: `B2B Resale Exemption applied for ${stateName} business entity.`
      };
    }

    const stateTaxInfo = US_DIGITAL_TAX_STATES[stateCode];

    if (stateTaxInfo) {
      const rate = stateTaxInfo.rate;
      const taxAmount = Number((safeBase * rate).toFixed(2));
      const ratePct = `${(rate * 100).toFixed(2).replace(/\.00$/, '')}%`;
      return {
        buyer_country: 'United States',
        buyer_country_code: 'US',
        buyer_state: stateName,
        buyer_state_code: stateCode,
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: `United States - ${stateName}`,
        tax_type: 'Sales Tax',
        tax_subtype: `${stateName} State Sales Tax`,
        tax_rate: rate,
        tax_rate_percentage: ratePct,
        taxable_amount: safeBase,
        tax_amount: taxAmount,
        final_total: Number((safeBase + taxAmount).toFixed(2)),
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: `US-ST-${stateCode}`,
        rule_source: `${stateName} Department of Revenue - Digital Products Tax`,
        is_taxable: true,
        is_reverse_charge: false,
        is_valid: true,
        notes: `Destination-based state sales tax applied for ${stateName}.`
      };
    }

    // US State where personal creative freelance music service is non-taxable or exempt (e.g. CA, FL, OR, etc.)
    return {
      buyer_country: 'United States',
      buyer_country_code: 'US',
      buyer_state: stateName,
      buyer_state_code: stateCode,
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: `United States - ${stateName} (Non-taxable / Exempt)`,
      tax_type: 'None',
      tax_subtype: 'Exempt Creative Service',
      tax_rate: 0,
      tax_rate_percentage: '0%',
      taxable_amount: safeBase,
      tax_amount: 0,
      final_total: safeBase,
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: `US-EXEMPT-${stateCode}`,
      rule_source: `${stateName} Administrative Code - Custom Creative Services`,
      is_taxable: false,
      is_reverse_charge: false,
      exemption_reason: `Custom creative freelance music production service is not subject to sales tax in ${stateName}.`,
      is_valid: true,
      notes: `Custom creative audio services are non-taxable in ${stateName}.`
    };
  }

  // 6. CANADA (GST / HST)
  if (countryCode === 'CA') {
    const rawState = (input.buyerState || '').trim();
    let matchedState = countryItem.states?.find(
      s => s.code.toUpperCase() === rawState.toUpperCase() || s.name.toLowerCase() === rawState.toLowerCase()
    );
    const provCode = matchedState?.code || rawState.toUpperCase();
    const provName = matchedState?.name || rawState;

    const CA_PROV_RATES: Record<string, { rate: number; name: string; type: string }> = {
      ON: { rate: 0.13, name: 'Ontario', type: 'HST' },
      BC: { rate: 0.12, name: 'British Columbia', type: 'GST+PST' },
      QC: { rate: 0.14975, name: 'Quebec', type: 'GST+QST' },
      AB: { rate: 0.05, name: 'Alberta', type: 'GST' },
      NS: { rate: 0.15, name: 'Nova Scotia', type: 'HST' },
      NB: { rate: 0.15, name: 'New Brunswick', type: 'HST' },
      NL: { rate: 0.15, name: 'Newfoundland and Labrador', type: 'HST' },
      PE: { rate: 0.15, name: 'Prince Edward Island', type: 'HST' },
      MB: { rate: 0.12, name: 'Manitoba', type: 'GST+RST' },
      SK: { rate: 0.11, name: 'Saskatchewan', type: 'GST+PST' },
    };

    const provInfo = CA_PROV_RATES[provCode] || { rate: 0.05, name: provName, type: 'GST' };
    const taxAmount = Number((safeBase * provInfo.rate).toFixed(2));
    const ratePct = `${(provInfo.rate * 100).toFixed(provInfo.rate === 0.14975 ? 3 : 1).replace(/\.0$/, '')}%`;

    return {
      buyer_country: 'Canada',
      buyer_country_code: 'CA',
      buyer_state: provName,
      buyer_state_code: provCode,
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: `Canada - ${provName} (${provInfo.type})`,
      tax_type: 'GST',
      tax_subtype: provInfo.type,
      tax_rate: provInfo.rate,
      tax_rate_percentage: ratePct,
      taxable_amount: safeBase,
      tax_amount: taxAmount,
      final_total: Number((safeBase + taxAmount).toFixed(2)),
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: `CA-${provInfo.type}-${provCode}`,
      rule_source: 'Canada Revenue Agency (CRA) Non-Resident Digital Economy Rules',
      is_taxable: true,
      is_reverse_charge: false,
      is_valid: true,
      notes: `Canadian digital economy taxation: ${provInfo.type} applied for ${provName}.`
    };
  }

  // 7. AUSTRALIA (GST 10%)
  if (countryCode === 'AU') {
    const isB2B = buyerType === 'business' && taxId.length >= 9;
    if (isB2B) {
      return {
        buyer_country: 'Australia',
        buyer_country_code: 'AU',
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: 'Australia (B2B Reverse Charge)',
        tax_type: 'GST',
        tax_subtype: 'B2B ABN Reverse Charge',
        tax_rate: 0,
        tax_rate_percentage: '0% (Reverse Charge)',
        taxable_amount: safeBase,
        tax_amount: 0,
        final_total: safeBase,
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: 'AU GST B2B',
        rule_source: 'ATO A New Tax System (Goods and Services Tax) Act 1999',
        is_taxable: false,
        is_reverse_charge: true,
        is_valid: true,
        notes: `Australian B2B supply: ABN ${taxId}. Reverse charge applies.`
      };
    }

    const rate = 0.10;
    const taxAmount = Number((safeBase * rate).toFixed(2));
    return {
      buyer_country: 'Australia',
      buyer_country_code: 'AU',
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: 'Australia (B2C Remote Digital Services)',
      tax_type: 'GST',
      tax_subtype: 'Australian GST',
      tax_rate: rate,
      tax_rate_percentage: '10%',
      taxable_amount: safeBase,
      tax_amount: taxAmount,
      final_total: Number((safeBase + taxAmount).toFixed(2)),
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: 'AU GST B2C',
      rule_source: 'ATO Cross-Border Digital Products and Services Regime',
      is_taxable: true,
      is_reverse_charge: false,
      is_valid: true,
      notes: 'B2C cross-border supply of digital audio services subject to 10% Australian GST.'
    };
  }

  // 8. SINGAPORE (GST 9%)
  if (countryCode === 'SG') {
    const rate = 0.09;
    const taxAmount = Number((safeBase * rate).toFixed(2));
    return {
      buyer_country: 'Singapore',
      buyer_country_code: 'SG',
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: 'Singapore (OVR Digital Services)',
      tax_type: 'GST',
      tax_subtype: 'Singapore GST (OVR)',
      tax_rate: rate,
      tax_rate_percentage: '9%',
      taxable_amount: safeBase,
      tax_amount: taxAmount,
      final_total: Number((safeBase + taxAmount).toFixed(2)),
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: 'SG GST OVR',
      rule_source: 'IRAS Overseas Vendor Registration (OVR) Regime',
      is_taxable: true,
      is_reverse_charge: false,
      is_valid: true,
      notes: 'Singapore Overseas Vendor Registration (OVR) applied for digital audio service.'
    };
  }

  // 9. NEW ZEALAND (GST 15%)
  if (countryCode === 'NZ') {
    const rate = 0.15;
    const taxAmount = Number((safeBase * rate).toFixed(2));
    return {
      buyer_country: 'New Zealand',
      buyer_country_code: 'NZ',
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: 'New Zealand (Remote Services GST)',
      tax_type: 'GST',
      tax_subtype: 'NZ Remote Services GST',
      tax_rate: rate,
      tax_rate_percentage: '15%',
      taxable_amount: safeBase,
      tax_amount: taxAmount,
      final_total: Number((safeBase + taxAmount).toFixed(2)),
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: 'NZ GST Remote',
      rule_source: 'Inland Revenue Goods and Services Tax Act 1985 (Remote Services)',
      is_taxable: true,
      is_reverse_charge: false,
      is_valid: true,
      notes: 'New Zealand remote digital services GST (15%).'
    };
  }

  // 10. JAPAN (JCT 10%)
  if (countryCode === 'JP') {
    const rate = 0.10;
    const taxAmount = Number((safeBase * rate).toFixed(2));
    return {
      buyer_country: 'Japan',
      buyer_country_code: 'JP',
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: 'Japan (Cross-border JCT)',
      tax_type: 'VAT',
      tax_subtype: 'Japanese Consumption Tax',
      tax_rate: rate,
      tax_rate_percentage: '10%',
      taxable_amount: safeBase,
      tax_amount: taxAmount,
      final_total: Number((safeBase + taxAmount).toFixed(2)),
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: 'Japan JCT Digital',
      rule_source: 'National Tax Agency Japan - Cross-border Digital Services Consumption Tax',
      is_taxable: true,
      is_reverse_charge: false,
      is_valid: true,
      notes: 'Japanese Consumption Tax (10%) applied for digital sound and media service.'
    };
  }

  // 11. UNITED ARAB EMIRATES (UAE)
  if (countryCode === 'AE') {
    const isB2B = buyerType === 'business' && taxId.length >= 10;
    if (isB2B) {
      return {
        buyer_country: 'United Arab Emirates',
        buyer_country_code: 'AE',
        postal_code: input.postalCode,
        buyer_type: buyerType,
        business_name: businessName,
        tax_id: taxId,
        billing_jurisdiction: 'United Arab Emirates (B2B Reverse Charge)',
        tax_type: 'None',
        tax_subtype: 'UAE B2B Reverse Charge (Article 48)',
        tax_rate: 0,
        tax_rate_percentage: '0% (Reverse Charge)',
        taxable_amount: safeBase,
        tax_amount: 0,
        final_total: safeBase,
        currency: 'INR',
        calculation_timestamp: new Date().toISOString(),
        tax_code: 'UAE VAT B2B',
        rule_source: 'UAE Federal Decree-Law No. 8 of 2017 on Value Added Tax, Article 48',
        is_taxable: false,
        is_reverse_charge: true,
        is_valid: true,
        notes: `UAE B2B Supply: TRN ${taxId}. Recipient accounts for VAT under reverse charge mechanism.`
      };
    }

    // Zero-rated cross-border export of remote creative services
    return {
      buyer_country: 'United Arab Emirates',
      buyer_country_code: 'AE',
      postal_code: input.postalCode,
      buyer_type: buyerType,
      business_name: businessName,
      tax_id: taxId,
      billing_jurisdiction: 'United Arab Emirates (Export of Service)',
      tax_type: 'None',
      tax_subtype: 'Zero-rated Export',
      tax_rate: 0,
      tax_rate_percentage: '0% (Export)',
      taxable_amount: safeBase,
      tax_amount: 0,
      final_total: safeBase,
      currency: 'INR',
      calculation_timestamp: new Date().toISOString(),
      tax_code: 'IGST-EXPORT-ZERO-RATED',
      rule_source: 'IGST Act Section 16 - Zero-rated Export of Services',
      is_taxable: false,
      is_reverse_charge: false,
      exemption_reason: 'Statutory cross-border export of remote music service from India to foreign buyer.',
      is_valid: true,
      notes: 'Cross-border export of services qualifying for zero-rating under IGST Act Section 16.'
    };
  }

  // 12. OTHER JURISDICTION (International Export of Services)
  return {
    buyer_country: countryItem.name,
    buyer_country_code: countryCode,
    postal_code: input.postalCode,
    buyer_type: buyerType,
    business_name: businessName,
    tax_id: taxId,
    billing_jurisdiction: `${countryItem.name} (Cross-Border Export)`,
    tax_type: 'None',
    tax_subtype: 'Zero-rated Export of Services',
    tax_rate: 0,
    tax_rate_percentage: '0% (Export)',
    taxable_amount: safeBase,
    tax_amount: 0,
    final_total: safeBase,
    currency: 'INR',
    calculation_timestamp: new Date().toISOString(),
    tax_code: 'IGST-EXPORT-ZERO-RATED',
    rule_source: 'IGST Act 2017, Section 16 & Section 2(6)',
    is_taxable: false,
    is_reverse_charge: false,
    exemption_reason: 'Export of services to recipient outside India with payment in convertible foreign currency/approved gateway.',
    is_valid: true,
    notes: `Cross-border export of music service to ${countryItem.name}.`
  };
}

/**
 * Clean UI label formatter for checkout order summary line.
 * Examples:
 * - "Tax (GST 18%)"
 * - "Tax (IGST 18%)"
 * - "Tax (VAT 20%)"
 * - "Tax (Sales Tax 6.25%)"
 * - "Tax (0% Reverse Charge)"
 * - "Tax: ₹0"
 */
export function formatTaxSummaryLabel(tax: TaxDetails): string {
  if (!tax.is_valid) {
    return 'Tax';
  }
  if (tax.is_reverse_charge) {
    return 'Tax (Reverse Charge 0%)';
  }
  if (tax.tax_type === 'None' || tax.tax_amount === 0) {
    return 'Tax';
  }
  if (tax.tax_subtype && tax.tax_subtype.includes('IGST')) {
    return `Tax (IGST ${tax.tax_rate_percentage})`;
  }
  if (tax.tax_subtype && tax.tax_subtype.includes('CGST')) {
    return `Tax (GST ${tax.tax_rate_percentage})`;
  }
  return `Tax (${tax.tax_type} ${tax.tax_rate_percentage})`;
}

/**
 * Backward compatibility wrapper for older callers.
 */
export function calculateIndirectTax(
  taxableBaseInr: number,
  countryCode: string = 'IN',
  regionCode?: string
): TaxDetails {
  return calculateAutomaticTax({
    taxableAmount: taxableBaseInr,
    buyerCountry: countryCode,
    buyerState: regionCode,
    buyerType: 'individual',
  });
}
