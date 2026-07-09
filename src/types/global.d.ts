interface MidtransSnapResult {
  order_id: string;
  transaction_status: string;
  [key: string]: unknown;
}

interface Window {
  snap?: {
    pay: (
      snapToken: string,
      options?: {
        onSuccess?: (result: MidtransSnapResult) => void;
        onPending?: (result: MidtransSnapResult) => void;
        onError?: (result: MidtransSnapResult) => void;
        onClose?: () => void;
      }
    ) => void;
  };
}
