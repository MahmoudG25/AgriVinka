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
            {orders.map(order => {
              const isTraining = order.itemType === 'training';
              return (
              <div
                key={order.id}
                className="flex flex-col gap-2 p-4 rounded-xl border border-yellow-100 bg-yellow-50/30"
              >
                {/* Type Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isTraining
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <span className="material-symbols-outlined text-xs">{isTraining ? 'work' : 'shopping_cart'}</span>
                    {isTraining ? 'طلب تدريب عملي' : 'طلب شراء'}
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    قيد المراجعة
                  </span>
                </div>

                {/* Title & Details */}
                <div className="min-w-0">
                  <h4 className="font-bold text-heading-dark text-sm truncate">
                    {order.productTitle || order.items?.[0]?.title || (order.itemType === 'roadmap' ? 'مسار' : 'دورة')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
                    <span dir="ltr">#{order.id.slice(0, 8)}</span>
                    <span>•</span>
                    {isTraining ? (
                      <>
                        <span className="material-symbols-outlined text-[11px]">calendar_today</span>
                        {order.createdAt?.seconds
                          ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'تاريخ غير محدد'}
                      </>
                    ) : (
                      <span>{order.totalAmount} ج.م</span>
                    )}
                  </p>
                  {isTraining && order.adminMessage && (
                    <p className="text-[11px] text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[11px] align-middle ml-1">info</span>
                      {order.adminMessage}
                    </p>
                  )}
                </div>
              </div>
            )})}
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
            {rejectedOrders.map(order => {
              const isTraining = order.itemType === 'training';
              return (
              <div
                key={order.id}
                className="flex flex-col gap-2 p-4 rounded-xl border border-red-100 bg-red-50/30"
              >
                {/* Type Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isTraining
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <span className="material-symbols-outlined text-xs">{isTraining ? 'work' : 'shopping_cart'}</span>
                    {isTraining ? 'طلب تدريب عملي' : 'طلب شراء'}
                  </span>
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">close</span>
                    مرفوض
                  </span>
                </div>

                {/* Title & Details */}
                <div className="min-w-0">
                  <h4 className="font-bold text-heading-dark text-sm truncate">
                    {order.productTitle || order.items?.[0]?.title || (order.itemType === 'roadmap' ? 'مسار' : 'دورة')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
                    <span dir="ltr">#{order.id.slice(0, 8)}</span>
                    <span>•</span>
                    {isTraining ? (
                      <>
                        <span className="material-symbols-outlined text-[11px]">calendar_today</span>
                        {order.createdAt?.seconds
                          ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'تاريخ غير محدد'}
                      </>
                    ) : (
                      <span>{order.totalAmount} ج.م</span>
                    )}
                  </p>
                  {isTraining && order.adminMessage && (
                    <p className="text-[11px] text-red-600 mt-1 bg-red-50 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[11px] align-middle ml-1">info</span>
                      {order.adminMessage}
                    </p>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrdersSection;

