import { Request, Response } from "express";
import { footprints } from "../../utils/footprints";
import { getLinksForHeader } from "../../utils/headers";

// Controller to fetch a single footprint by ID
export const getFootprintById = (req: Request, res: Response) => {
  const { id } = req.params;
  const footprint = footprints.find((fp) => fp.id === id);

  if (footprint) {
    res.status(200).json({ data: footprint });
  } else {
    // Conformance bug: return wrong error format when footprint is not found
    if (process.env.CONFORMANCE_BUG_FOOTPRINT_NOT_FOUND === "true") {
      res.status(404).json({ error: "Footprint not found" });
      return;
    }
    res.status(404).json({
      code: "NoSuchFootprint",
      message: `Footprint with id ${id} not found.`,
    });
  }
};

// Controller to fetch all footprints with optional filtering and pagination
export const getFootprints = (req: Request, res: Response) => {
  const { limit, offset, $filter } = req.query;
  let filteredFootprints = [...footprints];

  // (Optional filtering logic can be added here)

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
  const baseUrl = process.env.CONFORMANCE_IMPL_RELATIVE_LINKS === "true"
    ? req.path
    : (process.env.BASE_URL || req.protocol + "://" + req.headers.host) + req.path;
  const links: string[] = getLinksForHeader(
    baseUrl,
    limitVal,
    offsetVal,
    totalCount
  );

  res.setHeader("Link", links.join(", "));

  // Conformance bug: strip a required field (pcf) from each footprint in the response
  const responseData = process.env.CONFORMANCE_BUG_FOOTPRINTS_SCHEMA === "true"
    ? pagedFootprints.map(({ created, ...rest }) => rest)
    : pagedFootprints;

  res.status(200).json({ data: responseData });
};
