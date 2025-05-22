import { QRCodeCanvas } from 'qrcode.react';

const QRCard = ({
  qr,
  editState = {},
  onStartEdit,
  onCancelEdit,
  onChangeEdit,
  onSaveEdit,
  onDelete
}) => {
  const isEditing = editState.editing || false;
  const value = editState.value || '';

  return (
    <div className="bg-white p-4 rounded-xl shadow w-full sm:w-auto">
      <h3 className="font-bold text-lg mb-2 text-center">{qr.id}</h3>
      <QRCodeCanvas value={qr.value} size={128} className="mx-auto" />
      <div className="mt-4">
        {isEditing ? (
          <>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={value}
              onChange={(e) => onChangeEdit(e.target.value)}
            />
            <div className="flex justify-between gap-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded w-full"
                onClick={onSaveEdit}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded w-full"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 truncate">{qr.value}</p>
            <div className="flex justify-between mt-2 gap-2">
              <button
                className="text-blue-600 underline text-sm"
                onClick={onStartEdit}
              >
                Edit
              </button>
              <button
                className="text-red-600 underline text-sm"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QRCard;
