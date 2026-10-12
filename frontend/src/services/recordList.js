// List endpoints return either rows directly or a paginated { data, pagination } response.
export function recordList(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(rows)) throw new TypeError('The record API returned an invalid list response.');
  return rows;
}
