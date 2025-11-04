export function labelOf(status) {
  if (status === "valid") return "Valid";
  if (status === "not_valid") return "Not Valid";
  if (status === "paid") return "Paid";
  return status;
}
