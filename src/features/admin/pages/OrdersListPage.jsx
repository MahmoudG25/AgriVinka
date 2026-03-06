import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import { addToast, openModal } from '../../../app/store/slices/uiSlice';
import DataTable from '../components/DataTable';
import { orderService } from '../../../services/firestore/orderService';
import { MdCheckCircle, MdCancel, MdVisibility, MdAccessTime } from 'react-icons/md';

import { MdWarning } from 'react-icons/md';

const OrdersListPage = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, order: null, newStatus: null });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      logger.error('Failed to fetch orders:', error);
      dispatch(addToast({ type: 'error', message: 'فشل تحميل الطلبات' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (order, newStatus) => {
    setConfirmModal({ isOpen: true, order, newStatus });
  };

  const executeStatusUpdate = async () => {
    if (!confirmModal.order || !confirmModal.newStatus) return;

    const { order, newStatus } = confirmModal;
    const isApproval = newStatus === 'approved';

    setConfirmModal({ isOpen: false, order: null, newStatus: null });

    try {
      if (isApproval) {
        await orderService.approveOrder(order.id, order);
      } else {
        if (newStatus === 'rejected') {
          await orderService.rejectOrder(order.id);
        } else {
          await orderService.updateStatus(order.id, newStatus);
        }
      }
      dispatch(addToast({ type: 'success', message: `تم ${isApproval ? 'قبول' : 'رفض'} الطلب بنجاح` }));
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    } catch (error) {
      logger.error('Update failed:', error);
      dispatch(addToast({ type: 'error', message: 'فشل تحديث الحالة' }));
    }
  };

  const handleViewReceipt = (order) => {
    if (!order.receiptUrl) {
      return dispatch(addToast({ type: 'info', message: 'لا يوجد إيصال مرفق' }));
    }

    // Check if it's a valid URL (roughly)
    if (order.receiptUrl.startsWith('http')) {
      window.open(order.receiptUrl, '_blank');
    } else {
      // It's likely a legacy order with just a filename
      dispatch(addToast({ type: 'warning', message: `ملف قديم (غير مرفوع): ${order.receiptUrl}` }));
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><MdCheckCircle /> مقبول</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full"><MdCancel /> مرفوض</span>;
      default: return <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full"><MdAccessTime /> معلق</span>;
    }
  };

  const columns = [
    {
      header: 'رقم الطلب',
      accessor: 'id',
      render: (item) => <span className="text-xs text-gray-400 font-mono">#{item.id.slice(0, 8)}</span>
    },
    {
      header: 'العميل',
      accessor: 'customerName',
      render: (item) => (
        <div>
          <p className="font-bold text-sm text-heading-dark">{item.customerName || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{item.customerEmail}</p>
        </div>
      )
    },
    {
      header: 'المنتج',
      accessor: 'item',
      render: (item) => (
        <div className="text-sm">
          <p className="font-bold text-gray-800 line-clamp-1">{item.productTitle || item.items?.[0]?.title || 'غير معروف'}</p>
          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${item.itemType === 'roadmap' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {item.itemType === 'roadmap' ? 'مسار' : 'دورة'}
          </span>
        </div>
      )
    },
    {
      header: 'المبلغ',
      accessor: 'totalAmount',
      render: (item) => <span className="font-bold text-heading-dark">{item.totalAmount} ج.م</span>
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (item) => getStatusBadge(item.status)
    },
    {
      header: 'الإيصال',
      accessor: 'receiptUrl',
      render: (item) => (
        item.receiptUrl ? (
          <button onClick={() => handleViewReceipt(item)} className="text-primary hover:text-accent text-sm underline">
            عرض
          </button>
        ) : <span className="text-gray-400 text-xs">لا يوجد</span>
      )
    },
    {
      header: 'إجراءات',
      accessor: 'actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate(item, 'approved')}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="قبول"
              >
                <MdCheckCircle size={20} />
              </button>
              <button
                onClick={() => handleStatusUpdate(item, 'rejected')}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="رفض"
              >
                <MdCancel size={20} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) return <div>Loading...</div>;

  const handleDeleteOrder = (order) => {
    dispatch(openModal({
      type: 'CONFIRM',
      props: {
        title: 'حذف الطلب',
        message: `هل أنت متأكد من حذف طلب "${order.customerName}" نهائياً؟`,
        confirmText: 'حذف',
        isDestructive: true,
        onConfirm: async () => {
          try {
            await orderService.deleteOrder(order.id);
            dispatch(addToast({ type: 'success', message: 'تم حذف الطلب بنجاح' }));
            setOrders(prev => prev.filter(o => o.id !== order.id));
          } catch (error) {
            logger.error('Delete failed:', error);
            dispatch(addToast({ type: 'error', message: 'فشل حذف الطلب' }));
          }
        }
      }
    }));
  };

  const handleEditOrder = (order) => {
    // Re-use the modal to edit the Access Link
    dispatch(openModal({
      type: 'CONFIRM',
      props: {
        title: 'تعديل رابط الوصول',
        message: `تعديل رابط الوصول للطلب رقم #${order.id.slice(0, 8)}`,
        confirmText: 'حفظ',
        isDestructive: false,

        showInput: true,
        inputLabel: 'رابط الوصول',
        inputPlaceholder: 'https://cloud.shamsalarab.com/access/...',
        inputHelp: 'تحديث الرابط الذي يظهر للمستخدم في صفحة النجاح.',
        // Pre-fill if possible? Currently our simple modal might not support pre-fill without more changes.
        // But the user can type the new one.

        onConfirm: async (inputValue) => {
          try {
            // We just update the access link, status remains same
            await orderService.updateStatus(order.id, order.status, inputValue);
            dispatch(addToast({ type: 'success', message: 'تم تحديث الرابط بنجاح' }));
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, accessLink: inputValue } : o));
          } catch (error) {
            logger.error('Update failed:', error);
            dispatch(addToast({ type: 'error', message: 'فشل تحديث الرابط' }));
          }
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading-dark">إدارة الطلبات</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-light pb-4 overflow-x-auto">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === status
              ? 'bg-heading-dark text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            {status === 'all' ? 'الكل' :
              status === 'pending' ? 'معلق' :
                status === 'approved' ? 'مقبول' : 'مرفوض'}
          </button>
        ))}
      </div>

      <DataTable
        title={`الطلبات (${filteredOrders.length})`}
        data={filteredOrders}
        columns={columns}
        onDelete={handleDeleteOrder}
        onEdit={handleEditOrder}
      />

      {/* Dynamic Local Confirm Modal */}
      {confirmModal.isOpen && confirmModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full p-6 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full mb-4 ${confirmModal.newStatus === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <MdWarning size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirmModal.newStatus === 'approved' ? 'قبول الطلب' : 'رفض الطلب'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                هل أنت متأكد من {confirmModal.newStatus === 'approved' ? 'قبول' : 'رفض'} طلب "{confirmModal.order.customerName}"؟
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, order: null, newStatus: null })}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={executeStatusUpdate}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-white shadow-lg transition-shadow ${confirmModal.newStatus === 'rejected'
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                    : 'bg-primary hover:bg-accent shadow-blue-500/30'
                    }`}
                >
                  {confirmModal.newStatus === 'approved' ? 'قبول' : 'رفض'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersListPage;
