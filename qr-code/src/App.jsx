import { useState, useEffect } from 'react';
import QRCard from './components/QRCard';

const LOCAL_KEY = 'qr-codes';

function App() {
  const [qrList, setQrList] = useState([]);
  const [id, setId] = useState('');
  const [value, setValue] = useState('');
  const [editStates, setEditStates] = useState({}); // { table-1: { editing: true, value: "..." } }

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    setQrList(saved);
  }, []);

  const saveToLocal = (data) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  };

  const handleGenerate = () => {
    if (!id || !value) return;

    const existingIndex = qrList.findIndex((qr) => qr.id === id);
    let updatedList;

    if (existingIndex >= 0) {
      qrList[existingIndex].value = value;
      updatedList = [...qrList];
    } else {
      updatedList = [...qrList, { id, value }];
    }

    setQrList(updatedList);
    saveToLocal(updatedList);
    setId('');
    setValue('');
  };

  const handleStartEdit = (qrId) => {
    setEditStates((prev) => ({
      ...prev,
      [qrId]: { editing: true, value: qrList.find((qr) => qr.id === qrId).value },
    }));
  };

  const handleCancelEdit = (qrId) => {
    setEditStates((prev) => ({
      ...prev,
      [qrId]: { editing: false, value: '' },
    }));
  };

  const handleEditChange = (qrId, newValue) => {
    setEditStates((prev) => ({
      ...prev,
      [qrId]: { ...prev[qrId], value: newValue },
    }));
  };

  const handleSaveEdit = (qrId) => {
    const newValue = editStates[qrId].value;
    const updated = qrList.map((qr) =>
      qr.id === qrId ? { ...qr, value: newValue } : qr
    );
    setQrList(updated);
    saveToLocal(updated);
    handleCancelEdit(qrId);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Cafe QR Manager</h1>
        <input
          type="text"
          placeholder="Enter Table ID (e.g., table-1)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="text"
          placeholder="Enter Data/URL (e.g., menu link)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {qrList.some((qr) => qr.id === id) ? 'Update QR' : 'Generate QR'}
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {qrList.map((qr) => (
          <QRCard
            key={qr.id}
            qr={qr}
            editState={editStates[qr.id]}
            onStartEdit={() => handleStartEdit(qr.id)}
            onCancelEdit={() => handleCancelEdit(qr.id)}
            onChangeEdit={(val) => handleEditChange(qr.id, val)}
            onSaveEdit={() => handleSaveEdit(qr.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
