export interface ProductFootprint {
  id: string;
  specVersion: string;
  version: number;
  created: string;
  updated?: string;
  status: "Active" | "Deprecated";
  statusComment?: string;
  validityPeriodStart?: string;
  validityPeriodEnd?: string;
  companyName: string;
  companyIds: string[];
  productDescription: string;
  productIds: string[];
  productCategoryCpc: string;
  productNameCompany: string;
  comment: string;
  pcf: CarbonFootprint;
  extensions?: DataModelExtension[];
}

export interface CarbonFootprint {
  declaredUnit: string;
  unitaryProductAmount: string;
  pCfExcludingBiogenic: string;
  pCfIncludingBiogenic?: string;
  fossilGhgEmissions: string;
  fossilCarbonContent: string;
  biogenicCarbonContent: string;
  dLucGhgEmissions?: string;
  landManagementGhgEmissions?: string;
  otherBiogenicGhgEmissions?: string;
  iLucGhgEmissions?: string;
  biogenicCarbonWithdrawal?: string;
  aircraftGhgEmissions?: string;
  characterizationFactors: string;
  ipccCharacterizationFactorsSources: string[];
  crossSectoralStandardsUsed: string[];
  productOrSectorSpecificRules: ProductOrSectorSpecificRule[];
  biogenicAccountingMethodology?: string;
  boundaryProcessesDescription: string;
  referencePeriodStart: string;
  referencePeriodEnd: string;
  secondaryEmissionFactorSources?: EmissionFactorDS[];
  exemptedEmissionsPercent: number;
  exemptedEmissionsDescription: string;
  packagingEmissionsIncluded: boolean;
  packagingGhgEmissions?: string;
  allocationRulesDescription?: string;
  uncertaintyAssessmentDescription?: string;
  primaryDataShare?: number;
  dqi?: DataQualityIndicators;
  assurance?: Assurance;
}

export interface DataModelExtension {
  specVersion: string; // Matches the VersionString schema
  dataSchema: string;
  documentation?: string; // Nullable
  data: Record<string, unknown>;
}

export interface ProductOrSectorSpecificRule {
  operator: "PEF" | "EPD International" | "Other";
  ruleNames: string[]; // Matches NonEmptyStringVec schema
  otherOperatorName?: string; // Nullable
}

export interface EmissionFactorDS {
  name: string; // Matches NonEmptyString schema
  version: string; // Matches NonEmptyString schema
}

export interface DataQualityIndicators {
  coveragePercent: number; // Matches Percent schema (0.0 - 100.0)
  technologicalDQR: number; // Matches FloatBetween1And3 schema (1.0 - 3.0)
  temporalDQR: number; // Matches FloatBetween1And3 schema (1.0 - 3.0)
  geographicalDQR: number; // Matches FloatBetween1And3 schema (1.0 - 3.0)
  completenessDQR: number; // Matches FloatBetween1And3 schema (1.0 - 3.0)
  reliabilityDQR: number; // Matches FloatBetween1And3 schema (1.0 - 3.0)
}

export interface Assurance {
  assurance: boolean;
  providerName: string;
  coverage?:
    | "corporate level"
    | "product line"
    | "PCF system"
    | "product level"; // Nullable
  level?: "limited" | "reasonable"; // Nullable
  boundary?: "Gate-to-Gate" | "Cradle-to-Gate"; // Nullable
  completedAt?: string; // Nullable, matches date-time format
  standardName?: string; // Nullable
  comments?: string; // Nullable
}
