/**
 * Utility function to generate pagination links for HTTP Link header
 * @param baseUrl The base URL for the resource
 * @param limitVal The limit value for pagination
 * @param offsetVal The offset value for pagination
 * @param totalCount The total count of items
 * @returns Array of link strings for the Link header
 */
export function getLinksForHeader(
  baseUrl: string,
  limitVal: number,
  offsetVal: number,
  totalCount: number
): string[] {
  const links: string[] = [];

  // First page (offset = 0)
  links.push(`<${baseUrl}?offset=0&limit=${limitVal}>; rel="first"`);

  // Previous page
  if (offsetVal > 0) {
    const prevOffset = Math.max(0, offsetVal - limitVal);
    links.push(
      `<${baseUrl}?offset=${prevOffset}&limit=${limitVal}>; rel="prev"`
    );
  }

  // Next page
  if (offsetVal + limitVal < totalCount) {
    const nextOffset = offsetVal + limitVal;
    links.push(
      `<${baseUrl}?offset=${nextOffset}&limit=${limitVal}>; rel="next"`
    );
  }

  // Last page
  const lastOffset = Math.max(0, totalCount - limitVal);
  links.push(`<${baseUrl}?offset=${lastOffset}&limit=${limitVal}>; rel="last"`);

  return links;
}
