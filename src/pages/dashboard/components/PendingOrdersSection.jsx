import React from 'react';

const PendingOrdersSection = ({ orders, rejectedOrders = [] }) => {
  const hasPending = orders && orders.length > 0;
  const hasRejected = rejectedOrders && rejectedOrders.length > 0;
  if (!hasPending && !hasRejected) return null;

  return (
    <div className="space-y-4">
      {/* Pending Orders */}
      {hasPending && (
        <div className="bg-white rounded-2xl border border-yellow-200/60 shadow-sm p-5">
          <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-yellow-500 text-xl">hourglass_top</span>
            طلبات قيد المراجعة
            <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
          </h2>
          <div className="space-y-3">
            {orders.map(order => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-yellow-100 bg-yellow-50/30"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-heading-dark text-sm truncate">{order.productTitle || order.items?.[0]?.title || (order.itemType === 'roadmap' ? 'مسار' : 'دورة')}</h4>
                  <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                    #{order.id.slice(0, 8)} • {order.totalAmount} ج.م
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 self-start sm:self-center shrink-0">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  قيد المراجعة
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3 text-center">
            سيتم التفعيل تلقائياً بعد موافقة الإدارة على طلبك
          </p>
        </div>
      )}

      {/* Rejected Orders */}
      {hasRejected && (
        <div className="bg-white rounded-2xl border border-red-200/60 shadow-sm p-5">
          <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-500 text-xl">cancel</span>
            طلبات مرفوضة
            <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{rejectedOrders.length}</span>
          </h2>
          <div className="space-y-3">
            {rejectedOrders.map(order => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-100 bg-red-50/30"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-heading-dark text-sm truncate">{order.productTitle || order.items?.[0]?.title || (order.itemType === 'roadmap' ? 'مسار' : 'دورة')}</h4>
                  <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                    #{order.id.slice(0, 8)} • {order.totalAmount} ج.م
                  </p>
                </div>
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 self-start sm:self-center shrink-0">
                  <span className="material-symbols-outlined text-xs">close</span>
                  مرفوض
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrdersSection;

