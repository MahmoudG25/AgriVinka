import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../../app/store/slices/uiSlice';
import { MdWarning } from 'react-icons/md';

const ConfirmModal = () => {
  const { isOpen, type, props } = useSelector(state => state.ui.modal);
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = React.useState('');

  if (!isOpen || type !== 'CONFIRM') return null;

  const { title, message, onConfirm, confirmText = 'تأكيد', cancelText = 'إلغاء', isDestructive = false } = props;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(inputValue); // Pass input value
    dispatch(closeModal());
    setInputValue(''); // Reset
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl  w-full p-6 animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <MdWarning size={32} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>

          {props.showInput && (
            <div className="w-full mb-6">
              <label className="block text-left text-sm font-bold text-gray-700 mb-2">{props.inputLabel || 'Input'}</label>
              <input
                type="text"
                placeholder={props.inputPlaceholder || ''}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-right"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{props.inputHelp}</p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={() => dispatch(closeModal())}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => handleConfirm()}
              // We need to pass the input value to handleConfirm
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-white shadow-lg shadow-blue-500/30 transition-shadow ${isDestructive
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                : 'bg-primary hover:bg-accent'
                }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
