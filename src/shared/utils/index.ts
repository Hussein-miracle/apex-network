import { toast } from "vue3-toastify";
import type { Payment, PaymentStatus } from "../types";

const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


export function addThousandSeparator(integer: string, separator: string) {
  return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`);
}

export const formatPaymentTableData = (data: Payment[]) => {
  return data.map((item) => {
    return {
      ...item,
      _selected: false,
    }
  })
}


export const generateArray = (start: number, end: number): number[] => {
  const array = []
  for (let i = start; i <= end; i++) {
    array.push(i)
  }
  return array
}


export const convertIsoDateToFormattedDate = (isoDateString: string | null): string => {

  if (!isoDateString) return 'N/A';

  const date = new Date(isoDateString);
  // Extract the day, month, and year
  const day = date.getDate();
  // Note: getMonth() returns a zero-based index, so January is 0, February is 1, etc.
  const month = date.getMonth();
  const year = date.getFullYear();
  // Format the date into the desired format
  return `${day} ${monthNames[month]}, ${year}`;
}

export const convertDatesToPaymentStatus = (paymentExpectedAt: string, paymentMadeAt: string | null): PaymentStatus | undefined => {
  let status: PaymentStatus;

  console.log('paymentExpectedAt', paymentExpectedAt);
  // console.log('paymentExpectedAt', paymentExpectedAt);

  console.log('paymentMadeAt', paymentMadeAt);
  const currentDate = new Date().getTime();
  const expectedDate = new Date(new Date(paymentExpectedAt).toISOString()).getTime();
  let madeDate: number | null = null;

  if (!!paymentMadeAt) {
    madeDate = new Date(paymentMadeAt).getTime();
  }
  // const madeDate = new Date(paymentMadeAt).getTime();



  if ((!!madeDate && madeDate > expectedDate)) {
    return 'overdue';
  };



  if (!madeDate && currentDate <= expectedDate) return 'unpaid';

  if (!!madeDate && madeDate <= expectedDate) return 'paid';
}


export const pxToRem = (val: number) => {
  return val / 16 + 'rem'
}

export const errorToast = (message: string, toastOptions: any = {}) => {
  toast.error(message, {
    autoClose: 5000,
    position: 'top-right',
    ...toastOptions
  });
}

export const successToast = (message: string, toastOptions: any = {}) => {
  toast.success(message, {
    autoClose: 5000,
    position: 'top-right',
    ...toastOptions
  });
}
export const warnToast = (message: string, toastOptions: any = {}) => {
  toast.warn(message, {
    autoClose: 5000,
    position: 'top-right',
    ...toastOptions
  });
}