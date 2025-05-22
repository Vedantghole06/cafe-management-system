import { QRCodeCanvas } from 'qrcode.react';

const QRCard = ({ title, value }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md w-fit text-center">
      <h2 className="font-semibold mb-2">{title}</h2>
      <QRCodeCanvas value={value} size={128} />
    </div>
  );
};

export default QRCard;
