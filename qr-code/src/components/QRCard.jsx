import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';

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
  const [qrStyle, setQrStyle] = useState({
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    includeMargin: true,
    size: 180, // Normal size that fits well in the card
    level: 'H'
  });

  // QR style presets
  const stylePresets = [
    { name: 'Classic', fgColor: '#000000', bgColor: '#FFFFFF' },
    { name: 'Inverted', fgColor: '#FFFFFF', bgColor: '#000000' },
    { name: 'Teal', fgColor: '#38B2AC', bgColor: '#FFFFFF' },
    { name: 'Midnight', fgColor: '#2C5282', bgColor: '#EBF8FF' },
    { name: 'Forest', fgColor: '#276749', bgColor: '#F0FFF4' }
  ];

  const applyStyle = (style) => {
    setQrStyle({
      ...qrStyle,
      fgColor: style.fgColor,
      bgColor: style.bgColor
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transition-all duration-300 hover:border-teal-500">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-gray-200">{qr.id}</h3>
      </div>
      
      <div className="p-5">
        <div className="flex flex-col items-center">
          {/* QR Code */}
          <div 
            className="p-4 rounded-md mb-5 transition-all duration-300"
            style={{ backgroundColor: qrStyle.bgColor }}
            ref={qrRef}
          >
            <QRCodeCanvas 
              value={qr.value} 
              size={qrStyle.size} 
              bgColor={qrStyle.bgColor}
              fgColor={qrStyle.fgColor}
              level={qrStyle.level}
              includeMargin={qrStyle.includeMargin}
              renderAs="canvas"
            />
          </div>
          
          {/* QR Style Options */}
          <div className="w-full mb-5">
            <div className="flex flex-wrap gap-2 justify-center">
              {stylePresets.map((style, index) => (
                <button
                  key={index}
                  className="w-6 h-6 rounded-full border border-gray-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  style={{ backgroundColor: style.bgColor }}
                  onClick={() => applyStyle(style)}
                  title={style.name}
                >
                  <div 
                    className="w-3 h-3 rounded-full mx-auto"
                    style={{ backgroundColor: style.fgColor }}
                  ></div>
                </button>
              ))}
            </div>
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
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm flex items-center justify-center"
                    onClick={() => onDownload(qr, qrRef, qrStyle)}
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