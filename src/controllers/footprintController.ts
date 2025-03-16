import { Request, Response } from "express";
import { footprints } from "../utils/footprints";

// Controller to fetch a single footprint by ID
export const getFootprintById = (req: Request, res: Response) => {
  const { id } = req.params;
  const footprint = footprints.find((fp) => fp.id === id);

  if (footprint) {
    res.status(200).json({ data: footprint });
  } else {
    res.status(404).json({
      code: "NoSuchFootprint",
      message: `Footprint with id ${id} not found.`,
    });
  }
};

// Controller to fetch all footprints with optional filtering and pagination
export const getFootprints = (req: Request, res: Response) => {
  const { limit, page, $filter } = req.query;
  let filteredFootprints = [...footprints];

  // (Optional filtering logic can be added here)

  // Total count before pagination
  const totalCount = filteredFootprints.length;

  // Determine limit and page values (defaults: limit = totalCount, page = 1)
  const limitVal =
    limit && typeof limit === "string" ? parseInt(limit, 10) : totalCount;
  const pageVal = page && typeof page === "string" ? parseInt(page, 10) : 1;

  // Calculate offset and slice the array
  const offset = (pageVal - 1) * limitVal;
  const pagedFootprints = filteredFootprints.slice(offset, offset + limitVal);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limitVal);

  // Build pagination Link header
  // TODO get the base URL from an env variable because the infra setup with api gateway > alb > ecs fargate
  const baseUrl = `https://ie8onambsh.execute-api.eu-north-1.amazonaws.com/prod/2/footprints`;
  const links: string[] = getLinksFoHeader(
    baseUrl,
    limitVal,
    pageVal,
    totalPages
  );

  res.setHeader("Link", links.join(", "));

  res.status(200).json({ data: pagedFootprints });
};

function getLinksFoHeader(
  baseUrl: string,
  limitVal: number,
  pageVal: number,
  totalPages: number
) {
  const links: string[] = [];

  // First page
  links.push(`<${baseUrl}?page=1&limit=${limitVal}>; rel="first"`);
  // Previous page
  if (pageVal > 1) {
    links.push(
      `<${baseUrl}?page=${pageVal - 1}&limit=${limitVal}>; rel="prev"`
    );
  }
  // Next page
  if (pageVal < totalPages) {
    links.push(
      `<${baseUrl}?page=${pageVal + 1}&limit=${limitVal}>; rel="next"`
    );
  }
  // Last page
  links.push(`<${baseUrl}?page=${totalPages}&limit=${limitVal}>; rel="last"`);
  return links;
}
