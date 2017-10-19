exports.typeDefs = `
# Possible build statuses.
enum BuildStatus {
  pending
  claimed
  pulling
  building
  pushing
  succeeded
  cancelled
  failed
}
`;
