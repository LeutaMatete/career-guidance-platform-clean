import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Notifications = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [userProfile]);

  const loadNotifications = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        where('studentId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notificationsList = [];
      querySnapshot.forEach((doc) => {
        notificationsList.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date().toISOString()
      });
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read);
      const updatePromises = unreadNotifications.map(notif =>
        updateDoc(doc(db, 'notifications', notif.id), {
          read: true,
          readAt: new Date().toISOString()
        })
      );
      await Promise.all(updatePromises);
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return notif.type === filter;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admission': return '🎓';
      case 'job': return '💼';
      case 'document': return '📄';
      case 'system': return '⚙️';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'admission': return '#28a745';
      case 'job': return '#007bff';
      case 'document': return '#ffc107';
      case 'system': return '#6c757d';
      case 'reminder': return '#17a2b8';
      default: return '#999';
    }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div>
      <div className="table-header">
        <h3>Notifications</h3>
        <div className="table-actions">
          {unreadCount > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>
          )}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread ({unreadCount})</option>
            <option value="read">Read</option>
            <option value="admission">Admissions</option>
            <option value="job">Jobs</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h4>No notifications found</h4>
          <p>You're all caught up! New notifications will appear here.</p>
        </div>
      ) : (
        <div className="document-list">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className="document-item"
              style={{ 
                borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                opacity: notification.read ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {getNotificationIcon(notification.type)}
                </span>
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: notification.read ? '#666' : '#333' }}>
                    {notification.title}
                  </h5>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    {notification.message}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {!notification.read && (
                <button 
                  className="action-btn edit-btn"
                  onClick={() => markAsRead(notification.id)}
                  style={{ fontSize: '0.8rem' }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h4>📊 Notification Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
              {notifications.length}
            </div>
            <div>Total</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {unreadCount}
            </div>
            <div>Unread</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              {notifications.filter(n => n.type === 'admission').length}
            </div>
            <div>Admissions</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
              {notifications.filter(n => n.type === 'job').length}
            </div>
            <div>Jobs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;