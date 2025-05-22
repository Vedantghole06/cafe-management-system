import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

const QRCard = ({
  qr,
  editState = {},
  onStartEdit,
  onCancelEdit,
  onChangeEdit,
  onSaveEdit,
  onDelete,
  onDownload
}) => {
  const isEditing = editState.editing || false;
  const value = editState.value || '';
  const qrRef = useRef(null);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transition-all duration-300 hover:border-teal-500">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-gray-200">{qr.id}</h3>
      </div>
      
      <div className="p-5">
        <div className="flex flex-col items-center">
          {/* QR Code */}
          <div className="bg-white p-3 rounded-md mb-5" ref={qrRef}>
            <QRCodeCanvas 
              value={qr.value} 
              size={150} 
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={false}
            />
          </div>
          
          {/* QR Value or Edit Form */}
          <div className="w-full">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-200"
                  value={value}
                  onChange={(e) => onChangeEdit(e.target.value)}
                  placeholder="Enter QR code value"
                />
                <div className="flex justify-between gap-3">
                  <button
                    className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-4 py-2 rounded-md transition-colors duration-200 font-medium w-full flex items-center justify-center"
                    onClick={onSaveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md transition-colors duration-200 font-medium w-full flex items-center justify-center"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-900 p-3 rounded-md border border-gray-700 break-all">
                  <p className="text-sm text-gray-400">{qr.value}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-md transition-colors duration-200 text-sm flex items-center justify-center"
                    onClick={() => onDownload(qr, qrRef)}
                  >
                    Download
                  </button>
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-md transition-colors duration-200 text-sm flex items-center justify-center"
                    onClick={onStartEdit}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-md transition-colors duration-200 text-sm flex items-center justify-center"
                    onClick={onDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCard;