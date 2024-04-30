import axios from "axios";



console.log({ VITE_APP_APEX_API_URL: import.meta.env.VITE_APP_APEX_API_URL });

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_APEX_API_URL as string,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json, multipart/form-data",
  },
});



// Add a response interceptor
const _axiosResponseInterceptor = axiosInstance.interceptors.response.use(
  (response) => {
    // console.log({ responseInResponseINTERCEPTOR: response})
    return response.data;
  },
  async (error) => {
    console.log({ errorAxios: error });
    const errorConfig = error?.config;
    const errorResponse = error?.response;
    const netInfo = window?.navigator?.onLine;


    if (errorConfig && !!errorResponse) {
      // console.log('errorConfig', errorConfig);
      // console.log('INTERCEPTOR errorResponse', errorResponse);

      // console.log({ errorResponse }, '500');
    }

    if (errorResponse?.status === 500) {
      // serverErrorToast('Internal Server Error: Please Contact Support.');
      return;
    }

    if (error.code === 'ERR_NETWORK' && !netInfo) {
      // toast.info('Network Error: Check Your Internet Connection.');
      return;
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;



