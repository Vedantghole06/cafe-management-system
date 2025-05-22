import { useState, useEffect } from 'react';
import QRCard from './components/QRCard';

function App() {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [qrList, setQrList] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('qr-codes') || '[]');
    setQrList(saved);
  }, []);

  const handleGenerate = () => {
    if (!title || !value) return;
    const newQr = { title, value };
    const updatedList = [newQr, ...qrList];
    setQrList(updatedList);
    localStorage.setItem('qr-codes', JSON.stringify(updatedList));
    setTitle('');
    setValue('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">QR Code Generator</h1>
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Enter URL or data"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate QR Code
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {qrList.map((qr, index) => (
          <QRCard key={index} title={qr.title} value={qr.value} />
        ))}
      </div>
    </div>
  );
}

export default App;
