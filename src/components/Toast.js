import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const props = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
}

const propsNotAutoClose = {
  position: "top-center",
  autoClose: false,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
}

export const showToast = ({ type, message, isNotAutoClose }) => {
  let prop = props
  if (!!isNotAutoClose) 
    prop = propsNotAutoClose

  switch (type) {
    case 'success':
      toast.success(message, prop);
      break;
    case 'warn':
      toast.warn(message, prop);
      break;
    case 'error':
      toast.error(message, prop);
      break;
    default:
      toast.info(message, prop);
  }
};
export default function Toast() {
  return <ToastContainer
    position="top-center"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover={false}
  />;
}
