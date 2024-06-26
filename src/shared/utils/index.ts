import { toast } from "vue3-toastify";
import type { Payment, PaymentStatus } from "../types";

const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


export function addThousandSeparator(integer: string, separator: string) {
  return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`);
}

export const getPaymentStatus = (paymentExpectedAt: string, paymentMadeAt: string | null) => {
  const currentDate = new Date().getTime();
  const expectedDate = new Date(new Date(paymentExpectedAt).toISOString()).getTime();
  let madeDate: number | null = null;

  if (currentDate > expectedDate) return 'overdue';


  if (!paymentMadeAt) return 'unpaid';

  // if (!(currentDate > expectedDate) && !madeDate) return 'unpaid';


  return 'paid'
}

export const convertDatesToPaymentStatus = (paymentExpectedAt: string, paymentMadeAt: string | null): PaymentStatus => {
  // let status: PaymentStatus;

  // console.log('paymentExpectedAt', paymentExpectedAt);
  // console.log('paymentExpectedAt', paymentExpectedAt);

  //console.log('paymentMadeAt', paymentMadeAt);
  const currentDate = new Date().getTime();
  const expectedDate = new Date(new Date(paymentExpectedAt).toISOString()).getTime();
  // let madeDate: number | null = null;


  // const convertDatesToPaymentStatus = (expected: string, made: string) => {
  //   if (!expected && !made) {
  //     return 'unpaid'
  //   }
  //   if (expected && !made) {
  //     return 'overdue'
  //   }
  //   if (expected && made) {
  //     return 'paid'
  //   }
  //   return 'unpaid'
  // }

  // return convertDatesToPaymentStatus(paymentExpectedAt, paymentMadeAt);


  if (!!paymentMadeAt) {
    // madeDate = new Date(paymentMadeAt).getTime();
    return 'paid'
  }
  // const madeDate = new Date(paymentMadeAt).getTime();



  // if ((!!madeDate && madeDate > expectedDate)) {
  //   return 'overdue';
  // }



  if (currentDate <= expectedDate) return 'unpaid';

  // if (!!madeDate && madeDate <= expectedDate) return 'paid';

  return 'overdue';
}

export const formatPaymentTableData = (data: Payment[]) => {
  return data.map((item) => {
    return {
      ...item,
      _selected: false,
      _payment_status: convertDatesToPaymentStatus(item?.payment_expected_at, item?.payment_made_at),
      // _ps: getPaymentStatus(item.payment_expected_at, item.payment_made_at),
    }
  })
}

export const generatePages = (current_page: number = 1, max_pages_shown: number = 10, total_pages: number = 0) => {

  const difference = Math.floor(max_pages_shown / 2)
  const evenOffset = max_pages_shown % 2 === 0 ? 1 : 0

  if (current_page + difference >= total_pages) {
    return generateArray(total_pages - max_pages_shown + 1, total_pages)
  }
  if (current_page - difference <= 0) {
    return generateArray(1, max_pages_shown)
  }

  return generateArray(
    current_page - difference + evenOffset,
    current_page + difference
  )
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




export const pxToRem = (val: number) => {
  return val / 16 + 'rem'
}

// NOTE: this sis a helper func to format number to money
export const addCommaToNumber = (num: number, decimalplace: number = 2) => {
  return num.toFixed(decimalplace).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};


export const removeItemFromString = (str: string, item: string) => {
  const splittedString = str.split('');
  let removedString = '';

  for (let i = 0; i < splittedString.length; i++) {
    if (splittedString[i] !== item) {
      removedString += splittedString[i];
    }
  }

  return removedString;
}

export const handleDisableLettersAndMultipleDecimal = (
  e: KeyboardEvent
) => {
  //console.log({ e });
  // @ts-ignore
  const value = e.target?.value ?? '';
  if (e.shiftKey === true) {
    if (e.which == 9) {
      return true;
    }
    e.preventDefault();
    return false;
  }
  if (e.which > 57) {

    if (e.which === 190 && value.includes('.')) {
      e.preventDefault();
      return false;
    } else if (e.which === 190 && !value.includes('.')) {
      return true;
    }
    e.preventDefault();
    return false;
  }
  if (e.which == 32) {
    e.preventDefault();
    return false;
  }
  return true;
};
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