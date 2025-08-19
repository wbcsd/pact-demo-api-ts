import { Request, Response } from "express";
import { footprintsV3 } from "../../utils/footprints";
import { getLinksForHeader } from "../../utils/headers";

// Controller to fetch a single footprint by ID
export const getFootprintById = (req: Request, res: Response) => {
  const { id } = req.params;
  const footprint = footprintsV3.find((fp) => fp.id === id);

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
  const {
    limit,
    offset,
    productId,
    companyId,
    geography,
    classification,
    validOn,
    validAfter,
    validBefore,
    status,
  } = req.query;
  let filteredFootprints = [...footprintsV3];

  // Filter by productId if provided (can be string or array of strings)
  if (productId) {
    const productIds = Array.isArray(productId) ? productId : [productId];
    filteredFootprints = filteredFootprints.filter((footprint) =>
      productIds.some(
        (id) => typeof id === "string" && footprint.productIds.includes(id)
      )
    );
  }

  // Filter by companyId if provided (can be string or array of strings)
  if (companyId) {
    const companyIds = Array.isArray(companyId) ? companyId : [companyId];
    filteredFootprints = filteredFootprints.filter((footprint) =>
      companyIds.some(
        (id) => typeof id === "string" && footprint.companyIds.includes(id)
      )
    );
  }

  // Filter by geography if provided (can be string or array of strings)
  if (geography) {
    const geographies = Array.isArray(geography) ? geography : [geography];
    filteredFootprints = filteredFootprints.filter((footprint) =>
      geographies.some(
        (geo) =>
          typeof geo === "string" &&
          footprint.pcf.geographyRegionOrSubregion === geo
      )
    );
  }

  // Filter by classification if provided (can be string or array of strings)
  if (classification) {
    const classifications = Array.isArray(classification)
      ? classification
      : [classification];
    filteredFootprints = filteredFootprints.filter((footprint) =>
      classifications.some(
        (classif) =>
          typeof classif === "string" &&
          footprint.productClassifications.includes(classif)
      )
    );
  }

  // Filter by validOn if provided (single date string)
  if (validOn && typeof validOn === "string") {
    const validOnDate = new Date(validOn);

    // Check if the provided date is valid
    if (!isNaN(validOnDate.getTime())) {
      filteredFootprints = filteredFootprints.filter((footprint) => {
        // Skip footprints without validity period
        if (!footprint.validityPeriodStart || !footprint.validityPeriodEnd) {
          return false;
        }

        const startDate = new Date(footprint.validityPeriodStart);
        const endDate = new Date(footprint.validityPeriodEnd);

        // Check if validOn date falls within the validity period
        return validOnDate >= startDate && validOnDate <= endDate;
      });
    }
  }

  // Filter by validAfter if provided (single date string)
  if (validAfter && typeof validAfter === "string") {
    const validAfterDate = new Date(validAfter);

    // Check if the provided date is valid
    if (!isNaN(validAfterDate.getTime())) {
      filteredFootprints = filteredFootprints.filter((footprint) => {
        // Skip footprints without validityPeriodStart
        if (!footprint.validityPeriodStart) {
          return false;
        }

        const startDate = new Date(footprint.validityPeriodStart);

        // Check if validityPeriodStart > validAfter
        return startDate > validAfterDate;
      });
    }
  }

  // Filter by validBefore if provided (single date string)
  if (validBefore && typeof validBefore === "string") {
    const validBeforeDate = new Date(validBefore);

    // Check if the provided date is valid
    if (!isNaN(validBeforeDate.getTime())) {
      filteredFootprints = filteredFootprints.filter((footprint) => {
        // Skip footprints without validityPeriodEnd
        if (!footprint.validityPeriodEnd) {
          return false;
        }

        const endDate = new Date(footprint.validityPeriodEnd);

        // Check if validityPeriodEnd < validBefore
        return endDate < validBeforeDate;
      });
    }
  }

  // Filter by status if provided (single string only)
  if (status && typeof status === "string") {
    filteredFootprints = filteredFootprints.filter(
      (footprint) => footprint.status === status
    );
  }

  // Total count before pagination
  const totalCount = filteredFootprints.length;

  // Determine limit and offset values (defaults: limit = totalCount, offset = 0)
  const limitVal =
    limit && typeof limit === "string" ? parseInt(limit, 10) : totalCount;
  const offsetVal =
    offset && typeof offset === "string" ? parseInt(offset, 10) : 0;

  // Slice the array using offset and limit
  const pagedFootprints = filteredFootprints.slice(
    offsetVal,
    offsetVal + limitVal
  );

  // Build pagination Link header
  // Get the public base URL from environnment variable or otherwise derive from headers.
  const baseUrl = (process.env.BASE_URL || req.protocol + "://" + req.headers.host) + req.path;
  const links: string[] = getLinksForHeader(
    baseUrl,
    limitVal,
    offsetVal,
    totalCount
  );

  res.setHeader("Link", links.join(", "));

  res.status(200).json({ data: pagedFootprints });
};
