import type { GetPaymentsOptions, GetPaymentsResult, MakePaymentResponse, Payment } from "@/shared/types";
import axiosInstance from "./axios-instance";

let instance: PaymentsService | null = null;

class PaymentsService {
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }
  async GetPayments(options: GetPaymentsOptions = {}): Promise<GetPaymentsResult> {
    const response = await axiosInstance.get<GetPaymentsResult>("/transactions", {
      params: {
        page: options?.page ?? 1,
        per_page: options?.perPage ?? 6,
        state: options?.state ?? 'all' as GetPaymentsOptions['state'],
      },
    });

    return response as unknown as Promise<GetPaymentsResult>;
  }

  async MakePayment(transactionIds: number[]) {
    const response = await axiosInstance.post<MakePaymentResponse>("/pay-dues", {
      payments: transactionIds,
    });

    return response as unknown as MakePaymentResponse;
  }
}


const paymentsService = new PaymentsService();

export default paymentsService;