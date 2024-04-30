import type { GetPaymentsOptions, GetPaymentsResult } from "@/shared/types";
import axiosInstance from "./axios-instance";

let instance: PaymentsService | null = null;

class PaymentsService {
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }
  async GetPayments(options: GetPaymentsOptions = {}) {
    const response = await axiosInstance.get<GetPaymentsResult>("/transactions", {
      params: {
        page: options?.page ?? 1,
        perPage: options?.perPage ?? 6,
        state: options?.state ?? 'all' as GetPaymentsOptions['state'],
      },
    });

    return response;
  }

  async MakePayment(transactionIds: number[]) {
    const response = await axiosInstance.post<any>("/pay-dues", {
      payments: transactionIds,
    });

    return response;
  }
}


const paymentsService = new PaymentsService();

export default paymentsService;