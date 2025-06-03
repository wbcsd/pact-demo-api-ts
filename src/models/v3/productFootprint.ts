export type NonEmptyString = string;
export type Urn = string;
export type Uri = string;
export type Decimal = string;
export type PositiveNonZeroDecimal = string;
export type PositiveOrZeroDecimal = string;
export type NegativeOrZeroDecimal = string;
export type NegativeNonZeroDecimal = string;

export interface ProductFootprint {
  id: string;
  specVersion: string;
  precedingPfIds?: string[];
  created: string;
  status: "Active" | "Deprecated";
  validityPeriodStart?: string;
  validityPeriodEnd?: string;
  companyName: NonEmptyString;
  companyIds: Urn[];
  productDescription: string;
  productIds: Urn[];
  productClassifications: Urn[];
  productNameCompany: NonEmptyString;
  comment?: string;
  pcf: CarbonFootprint;
  extensions?: DataModelExtension[];
}

export interface CarbonFootprint {
  declaredUnitOfMeasurement:
    | "liter"
    | "kilogram"
    | "cubic meter"
    | "kilowatt hour"
    | "megajoule"
    | "ton kilometer"
    | "square meter"
    | "piece"
    | "hour"
    | "megabit second";
  declaredUnitAmount: PositiveNonZeroDecimal;
  productMassPerDeclaredUnit: Decimal;
  referencePeriodStart: string;
  referencePeriodEnd: string;
  geographyRegionOrSubregion?:
    | "Africa"
    | "Americas"
    | "Asia"
    | "Europe"
    | "Oceania"
    | "Australia and New Zealand"
    | "Central Asia"
    | "Eastern Asia"
    | "Eastern Europe"
    | "Latin America and the Caribbean"
    | "Melanesia"
    | "Micronesia"
    | "Northern Africa"
    | "Northern America"
    | "Northern Europe"
    | "Polynesia"
    | "South-eastern Asia"
    | "Southern Asia"
    | "Southern Europe"
    | "Sub-Saharan Africa"
    | "Western Asia"
    | "Western Europe";
  geographyCountry?: string;
  geographyCountrySubdivision?: string;
  boundaryProcessesDescription?: string;
  pcfExcludingBiogenicUptake: Decimal;
  pcfIncludingBiogenicUptake: Decimal;
  fossilCarbonContent: PositiveOrZeroDecimal;
  biogenicCarbonContent?: PositiveOrZeroDecimal;
  recycledCarbonContent?: PositiveOrZeroDecimal;
  fossilGhgEmissions: PositiveOrZeroDecimal;
  landUseChangeGhgEmissions?: PositiveOrZeroDecimal;
  landCarbonLeakage?: PositiveOrZeroDecimal;
  landManagementFossilGhgEmissions?: PositiveOrZeroDecimal;
  landManagementBiogenicCO2Emissions?: PositiveOrZeroDecimal;
  landManagementBiogenicCO2Removals?: NegativeOrZeroDecimal;
  biogenicCO2Uptake?: NegativeOrZeroDecimal;
  biogenicNonCO2Emissions?: PositiveOrZeroDecimal;
  landAreaOccupation?: PositiveOrZeroDecimal;
  aircraftGhgEmissions?: PositiveOrZeroDecimal;
  packagingEmissionsIncluded: boolean;
  packagingGhgEmissions?: PositiveOrZeroDecimal;
  packagingBiogenicCarbonContent?: PositiveOrZeroDecimal;
  outboundLogisticsGhgEmissions?: PositiveOrZeroDecimal;
  ccsTechnologicalCO2CaptureIncluded: boolean;
  ccsTechnologicalCO2Capture?: NegativeOrZeroDecimal;
  technologicalCO2CaptureOrigin?: string;
  technologicalCO2Removals?: PositiveOrZeroDecimal;
  ccuCarbonContent?: PositiveOrZeroDecimal;
  ccuCalculationApproach?: "Cut-off" | "Credit";
  ccuCreditCertification?: Uri;
  ipccCharacterizationFactors: string[];
  crossSectoralStandards: (
    | "ISO14067"
    | "ISO14083"
    | "ISO14040-44"
    | "GHGP-Product"
    | "PEF"
    | "PACT-1.0"
    | "PACT-2.0"
    | "PACT-3.0"
  )[];
  productOrSectorSpecificRules?: ProductOrSectorSpecificRule[];
  exemptedEmissionsPercent: Decimal;
  exemptedEmissionsDescription?: string;
  allocationRulesDescription?: string;
  secondaryEmissionFactorSources?: EmissionFactorSource[];
  primaryDataShare?: Decimal;
  dqi?: DataQualityIndicators;
  verification?: Verification;
}

export interface DataModelExtension {
  specVersion: string;
  dataSchema: Uri;
  documentation?: Uri;
  data: Record<string, unknown>;
}

export interface ProductOrSectorSpecificRule {
  operator: "PEF" | "EPD International" | "Other";
  ruleNames: NonEmptyString[];
  otherOperatorName?: NonEmptyString;
}

export interface EmissionFactorSource {
  name: NonEmptyString;
  version: NonEmptyString;
}

export interface DataQualityIndicators {
  technologicalDQR: Decimal;
  geographicalDQR: Decimal;
  temporalDQR: Decimal;
}

export interface Verification {
  coverage?: "PCF calculation model" | "PCF program" | "product level";
  providerName?: string;
  completedAt?: string;
  standardName?: string;
  comments?: string;
}

export interface BaseEvent {
  type: string;
  specversion: string;
  id: string;
  source: string;
  time: string;
  data: Record<string, unknown>;
}

export interface PublishedEvent extends BaseEvent {
  type: "org.wbcsd.pact.ProductFootprint.PublishedEvent.3";
  data: {
    pfIds: string[];
  };
}

export interface RequestCreatedEvent extends BaseEvent {
  type: "org.wbcsd.pact.ProductFootprint.RequestCreatedEvent.3";
  data: {
    productId?: Urn[];
    companyId?: Urn[];
    geography?: string[];
    classification?: Urn[];
    validOn?: string;
    validAfter?: string;
    validBefore?: string;
    status?: "Active" | "Deprecated";
    comment?: string;
  };
}

export interface RequestFulfilledEvent extends BaseEvent {
  type: "org.wbcsd.pact.ProductFootprint.RequestFulfilledEvent.3";
  data: {
    requestEventId: string;
    pfs: ProductFootprint[];
  };
}

export interface RequestRejectedEvent extends BaseEvent {
  type: "org.wbcsd.pact.ProductFootprint.RequestRejectedEvent.3";
  data: {
    requestEventId: string;
    error: Error;
  };
}

export interface Error {
  code:
    | "BadRequest"
    | "AccessDenied"
    | "TokenExpired"
    | "NotFound"
    | "InternalError"
    | "NotImplemented";
  message: string;
}

export interface ListFootprintsResponse {
  data: ProductFootprint[];
}

export interface GetFootprintResponse {
  data: ProductFootprint;
}
