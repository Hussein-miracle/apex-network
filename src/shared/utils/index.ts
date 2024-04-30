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


export const convertIsoDateToFormattedDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
  // Extract the day, month, and year
  const day = date.getDate();
  // Note: getMonth() returns a zero-based index, so January is 0, February is 1, etc.
  const month = date.getMonth();
  const year = date.getFullYear();
  // Format the date into the desired format
  return `${day} ${monthNames[month]}, ${year}`;
}

export const convertDatesToPaymentStatus = (paymentExpectedAt: string, paymentMadeAt: string | null): PaymentStatus => {
  const currentDate = new Date().getTime();
  const expectedDate = new Date(new Date(paymentExpectedAt).toISOString()).getTime();
  let madeDate: number | null = null;
  if (paymentMadeAt) {
    madeDate = new Date(paymentMadeAt).getTime();
  }
  // const madeDate = new Date(paymentMadeAt).getTime();



  if (!!madeDate && currentDate > expectedDate) return 'overdue';



  if (!paymentExpectedAt && currentDate <= expectedDate) return 'unpaid';

  return 'paid';
}


export const pxToRem = (val: number) => {
  return val / 16 + 'rem'
}