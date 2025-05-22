import { useState, useEffect } from 'react';
import QRCard from './components/QRCard';

const LOCAL_KEY = 'qr-codes';
const BASE_MENU_URL = 'https://your-cafe-menu.com/menu'; // Replace with your real menu URL

function App() {
  const [qrList, setQrList] = useState([]);
  const [id, setId] = useState('');
  const [editStates, setEditStates] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from storage
    setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      setQrList(saved);
      setIsLoading(false);
    }, 500);
  }, []);

  const saveToLocal = (data) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleGenerate = () => {
    if (!id) {
      showNotification('Please enter a table ID', 'error');
      return;
    }

    const generatedValue = `${BASE_MENU_URL}?table=${id}`;
    const existingIndex = qrList.findIndex((qr) => qr.id === id);
    let updatedList;

    if (existingIndex >= 0) {
      updatedList = qrList.map((qr) => 
        qr.id === id ? { ...qr, value: generatedValue } : qr
      );
      showNotification(`QR code for "${id}" updated successfully`);
    } else {
      updatedList = [...qrList, { id, value: generatedValue }];
      showNotification(`QR code for "${id}" generated successfully`);
    }

    setQrList(updatedList);
    saveToLocal(updatedList);
    setId('');
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
    if (!newValue) {
      showNotification('QR code value cannot be empty', 'error');
      return;
    }
    
    const updated = qrList.map((qr) =>
      qr.id === qrId ? { ...qr, value: newValue } : qr
    );
    setQrList(updated);
    saveToLocal(updated);
    handleCancelEdit(qrId);
    showNotification(`QR code for "${qrId}" updated successfully`);
  };

  const handleDeleteQR = (qrId) => {
    const updated = qrList.filter((qr) => qr.id !== qrId);
    setQrList(updated);
    saveToLocal(updated);

    setEditStates((prev) => {
      const newState = { ...prev };
      delete newState[qrId];
      return newState;
    });
    
    showNotification(`QR code for "${qrId}" deleted successfully`, 'info');
  };

  const handleDownloadQR = (qr, qrRef) => {
    if (!qrRef.current) return;
    
    try {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) return;
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.download = `qr-code-${qr.id}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification(`QR code for "${qr.id}" downloaded successfully`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      showNotification('Failed to download QR code', 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md ${
          notification.type === 'error' ? 'bg-red-900 text-red-100' : 
          notification.type === 'info' ? 'bg-blue-900 text-blue-100' : 
          'bg-teal-900 text-teal-100'
        } transition-all duration-300 transform`}>
          <p className="text-sm">{notification.message}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Cafe QR Manager</h1>
          <p className="text-gray-400">Generate and manage QR codes for your cafe tables</p>
        </header>

        {/* QR Generator */}
        <div className="bg-gray-800 rounded-lg p-6 mb-10 border border-gray-700">
          <h2 className="text-xl font-medium text-gray-200 mb-4">Generate New QR Code</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Table ID (e.g., table-1)"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-200"
            />
            <button
              onClick={handleGenerate}
              className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-md transition-colors duration-200 font-medium whitespace-nowrap"
            >
              {qrList.some((qr) => qr.id === id) ? 'Update QR' : 'Generate QR'}
            </button>
          </div>
        </div>

        {/* QR Code List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-200">Your QR Codes</h2>
            {qrList.length > 0 && (
              <div className="text-gray-400 text-sm">
                {qrList.length} QR Code{qrList.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-2 border-gray-600 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
          ) : qrList.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <p className="text-gray-400 mb-6">No QR codes yet. Create your first one using the form above.</p>
              <button
                onClick={() => setId('table-1')}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Create Sample QR
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrList.map((qr) => (
                <QRCard
                  key={qr.id}
                  qr={qr}
                  editState={editStates[qr.id]}
                  onStartEdit={() => handleStartEdit(qr.id)}
                  onCancelEdit={() => handleCancelEdit(qr.id)}
                  onChangeEdit={(val) => handleEditChange(qr.id, val)}
                  onSaveEdit={() => handleSaveEdit(qr.id)}
                  onDelete={() => handleDeleteQR(qr.id)}
                  onDownload={handleDownloadQR}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Cafe QR Manager</p>
        </footer>
      </div>
    </div>
  );
}

export default App;