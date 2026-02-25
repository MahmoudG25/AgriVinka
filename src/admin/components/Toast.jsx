import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import { MdCheckCircle, MdError, MdInfo, MdClose } from 'react-icons/md';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContainer = () => {
  const toasts = useSelector(state => state.ui.toasts);
  const dispatch = useDispatch();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={() => dispatch(removeToast(toast.id))} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <MdCheckCircle size={20} className="text-green-500" />,
    error: <MdError size={20} className="text-red-500" />,
    info: <MdInfo size={20} className="text-blue-500" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={clsx(
        "flex items-center gap-3 bg-white shadow-lg rounded-lg p-4 border border-border-light min-w-[300px]",
        "transition-all hover:shadow-xl"
      )}
    >
      <div className="flex-shrink-0">
        {icons[toast.type] || icons.info}
      </div>
      <div className="flex-grow text-sm font-medium text-gray-700">
        {toast.message}
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
        <MdClose size={18} />
      </button>
    </motion.div>
  );
};

export default ToastContainer;
