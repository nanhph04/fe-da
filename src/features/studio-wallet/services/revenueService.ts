export class RevenueService {
  static unavailable(): never {
    throw new Error("Studio revenue API is not available in the current finance-service contract. Use EarningsService summary/monthly/top-videos until backend adds revenue endpoints.");
  }
}
