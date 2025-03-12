import { Request, Response } from "express";
import { ProductFootprint } from "../models/productFootprint";

// Mock data for demonstration
const footprints: ProductFootprint[] = [
  {
    id: "1",
    specVersion: "2.0.0",
    version: 1,
    created: new Date().toISOString(),
    status: "Active",
    companyName: "Example Company",
    companyIds: ["urn:example:company:1"],
    productDescription: "Example Product",
    productIds: ["urn:example:product:1"],
    productCategoryCpc: "1234",
    productNameCompany: "Example Product Name",
    comment: "No comments",
    pcf: {
      declaredUnit: "kilogram",
      unitaryProductAmount: "1",
      pCfExcludingBiogenic: "10.5",
      fossilGhgEmissions: "10.5",
      fossilCarbonContent: "5.2",
      biogenicCarbonContent: "0",
      characterizationFactors: "AR5",
      ipccCharacterizationFactorsSources: ["AR5"],
      crossSectoralStandardsUsed: ["GHG Protocol Product standard"],
      productOrSectorSpecificRules: [],
      boundaryProcessesDescription: "Description of boundary processes",
      referencePeriodStart: new Date().toISOString(),
      referencePeriodEnd: new Date().toISOString(),
      exemptedEmissionsPercent: 0.5,
      exemptedEmissionsDescription: "Minimal emissions exempted",
      packagingEmissionsIncluded: false,
    },
  },
  {
    id: "1",
    specVersion: "2.0.0",
    version: 1,
    created: new Date("1981-12-11T00:00:00Z").toISOString(),
    status: "Active",
    companyName: "Example Company",
    companyIds: ["urn:example:company:1"],
    productDescription: "Example Product",
    productIds: ["urn:example:product:2"],
    productCategoryCpc: "1234",
    productNameCompany: "Example Product Name",
    comment: "No comments",
    pcf: {
      declaredUnit: "kilogram",
      unitaryProductAmount: "1",
      pCfExcludingBiogenic: "10.5",
      fossilGhgEmissions: "10.5",
      fossilCarbonContent: "5.2",
      biogenicCarbonContent: "0",
      characterizationFactors: "AR5",
      ipccCharacterizationFactorsSources: ["AR5"],
      crossSectoralStandardsUsed: ["GHG Protocol Product standard"],
      productOrSectorSpecificRules: [],
      boundaryProcessesDescription: "Description of boundary processes",
      referencePeriodStart: new Date().toISOString(),
      referencePeriodEnd: new Date().toISOString(),
      exemptedEmissionsPercent: 0.5,
      exemptedEmissionsDescription: "Minimal emissions exempted",
      packagingEmissionsIncluded: false,
    },
  },
];

// Controller to fetch a single footprint by ID
export const getFootprintById = (req: Request, res: Response) => {
  const { id } = req.params;
  const footprint = footprints.find((fp) => fp.id === id);

  if (footprint) {
    res.status(200).json({ data: footprint });
  } else {
    res.status(404).json({
      code: "NotFound",
      message: `Footprint with id ${id} not found.`,
    });
  }
};

// Controller to fetch all footprints with optional filtering and pagination
export const getFootprints = (req: Request, res: Response) => {
  const { limit, $filter } = req.query;
  let filteredFootprints = [...footprints];

  // Example basic filtering logic
  /* console.log($filter);
  if ($filter && typeof $filter === "string") {
    filteredFootprints = filteredFootprints.filter((fp) =>
      fp.companyName.toLowerCase().includes($filter.toLowerCase())
    );
  } */

  // Apply limit
  if (limit && typeof limit === "string") {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      filteredFootprints = filteredFootprints.slice(0, parsedLimit);
    }
  }

  res.status(200).json({ data: filteredFootprints });
};
