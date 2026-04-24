import { useState, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3500);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium animate-slide-in
              ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {n.type === 'success' ? <CheckCircle size={18} /> : n.type === 'error' ? <XCircle size={18} /> : <Info size={18} />}
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
