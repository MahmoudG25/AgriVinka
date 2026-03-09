import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { MdDragIndicator, MdDelete, MdLock, MdLockOpen } from 'react-icons/md';

const DragDropList = ({
  items,
  onReorder,
  onRemove,
  onToggleLock,
  renderItem // Optional custom renderer
}) => {
  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="space-y-3">
      {items.map((item) => (
        <Reorder.Item key={item.id} value={item} className="bg-white border border-border-light rounded-xl p-4 shadow-sm flex items-center gap-4 cursor-default">
          <DragHandle />

          <div className="flex-grow">
            {renderItem ? renderItem(item) : (
              <p className="font-bold text-heading-dark">{item.title}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleLock && (
              <button
                type="button" // Prevent form submit
                onClick={() => onToggleLock(item.id)}
                className={`p-2 rounded-lg transition-colors ${item.locked ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'}`}
                title={item.locked ? "Unlock Module" : "Lock Module"}
              >
                {item.locked ? <MdLock /> : <MdLockOpen />}
              </button>
            )}

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <MdDelete />
              </button>
            )}
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

const DragHandle = () => {
  const controls = useDragControls();

  return (
    <div
      className="cursor-move text-gray-400 hover:text-gray-600 touch-none"
      onPointerDown={(e) => controls.start(e)}
    >
      <MdDragIndicator size={20} />
    </div>
  );
}

export default DragDropList;
