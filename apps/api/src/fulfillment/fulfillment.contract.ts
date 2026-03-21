export interface FulfillmentSubmissionResponse {
  claimedOrders: number;
  submittedOrders: number;
  failedOrders: number;
}

export interface FulfillmentStatusSyncResponse {
  checkedOrders: number;
  updatedOrders: number;
  fulfilledOrders: number;
  failedOrders: number;
}
