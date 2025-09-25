import React, { useState, useEffect } from 'react';

function AIReminderSystem({ user, onClose }) {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    type: 'medicine',
    title: '',
    time: '',
    frequency: 'daily',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const reminderTypes = [
    { id: 'medicine', name: 'Medicine', icon: 'medical-outline', color: '#ef4444' },
    { id: 'vaccination', name: 'Vaccination', icon: 'shield-checkmark-outline', color: '#10b981' },
    { id: 'hygiene', name: 'Hygiene', icon: 'water-outline', color: '#3b82f6' },
    { id: 'diet', name: 'Diet', icon: 'nutrition-outline', color: '#f59e0b' },
    { id: 'exercise', name: 'Exercise', icon: 'fitness-outline', color: '#8b5cf6' },
    { id: 'checkup', name: 'Health Checkup', icon: 'heart-outline', color: '#ec4899' }
  ];

  // Mock AI-generated reminders based on user profile
  const generateAIReminders = () => {
    const aiReminders = [
      {
        id: 1,
        type: 'medicine',
        title: 'Take Vitamin D3 supplement',
        time: '09:00',
        frequency: 'daily',
        notes: 'Best absorbed with breakfast. Important for bone health.',
        isActive: true,
        aiGenerated: true
      },
      {
        id: 2,
        type: 'hygiene',
        title: 'Wash hands before meals',
        time: '12:00',
        frequency: 'daily',
        notes: 'Use soap for at least 20 seconds to prevent infections.',
        isActive: true,
        aiGenerated: true
      },
      {
        id: 3,
        type: 'diet',
        title: 'Drink 8 glasses of water',
        time: '18:00',
        frequency: 'daily',
        notes: 'Stay hydrated for better health and skin.',
        isActive: true,
        aiGenerated: true
      }
    ];

    if (user?.age > 50) {
      aiReminders.push({
        id: 4,
        type: 'checkup',
        title: 'Annual health checkup reminder',
        time: '10:00',
        frequency: 'yearly',
        notes: 'Regular checkups help detect health issues early.',
        isActive: true,
        aiGenerated: true
      });
    }

    return aiReminders;
  };

  useEffect(() => {
    // Load existing reminders and generate AI suggestions
    const existingReminders = JSON.parse(localStorage.getItem('healthReminders') || '[]');
    const aiReminders = generateAIReminders();
    setReminders([...existingReminders, ...aiReminders]);
  }, [user]);

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.time) {
      alert('Please fill in title and time');
      return;
    }

    const reminder = {
      id: Date.now(),
      ...newReminder,
      isActive: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    };

    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    
    // Save to localStorage
    const userReminders = updatedReminders.filter(r => !r.aiGenerated);
    localStorage.setItem('healthReminders', JSON.stringify(userReminders));

    // Reset form
    setNewReminder({
      type: 'medicine',
      title: '',
      time: '',
      frequency: 'daily',
      notes: ''
    });
    setShowAddForm(false);

    // Set browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      scheduleNotification(reminder);
    }
  };

  const scheduleNotification = (reminder) => {
    const [hours, minutes] = reminder.time.split(':');
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      new Notification(`Health Reminder: ${reminder.title}`, {
        body: reminder.notes || 'Time for your health activity!',
        icon: '/favicon.ico'
      });
    }, timeUntilReminder);
  };

  const toggleReminder = (id) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, isActive: !reminder.isActive } : reminder
    );
    setReminders(updatedReminders);
    
    const userReminders = updatedReminders.filter(r => !r.aiGenerated);
    localStorage.setItem('healthReminders', JSON.stringify(userReminders));
  };

  const deleteReminder = (id) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    
    const userReminders = updatedReminders.filter(r => !r.aiGenerated);
    localStorage.setItem('healthReminders', JSON.stringify(userReminders));
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          alert('Notifications enabled! You\'ll receive health reminders.');
        }
      });
    }
  };

  const getReminderTypeInfo = (type) => {
    return reminderTypes.find(t => t.id === type) || reminderTypes[0];
  };

  return (
    <div className="ai-reminder-overlay">
      <div className="ai-reminder-modal">
        <div className="ai-reminder-header">
          <h3>
            <ion-icon name="alarm-outline"></ion-icon>
            AI Health Reminders
          </h3>
          <button className="close-reminder-btn" onClick={onClose}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>

        <div className="ai-reminder-content">
          {Notification.permission === 'default' && (
            <div className="notification-prompt">
              <ion-icon name="notifications-outline"></ion-icon>
              <div>
                <h4>Enable Notifications</h4>
                <p>Get timely health reminders on your device</p>
              </div>
              <button onClick={requestNotificationPermission} className="enable-notifications-btn">
                Enable
              </button>
            </div>
          )}

          <div className="reminders-section">
            <div className="section-header">
              <h4>Your Health Reminders</h4>
              <button 
                className="add-reminder-btn"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <ion-icon name="add-outline"></ion-icon>
                Add Reminder
              </button>
            </div>

            {showAddForm && (
              <div className="add-reminder-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                      className="form-select"
                    >
                      {reminderTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                    placeholder="e.g., Take morning medicine"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={newReminder.frequency}
                    onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                    className="form-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={newReminder.notes}
                    onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                    placeholder="Additional notes or instructions"
                    className="form-textarea"
                    rows="2"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button onClick={() => setShowAddForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button onClick={handleAddReminder} className="save-btn">
                    Save Reminder
                  </button>
                </div>
              </div>
            )}

            <div className="reminders-list">
              {reminders.length === 0 ? (
                <div className="no-reminders">
                  <ion-icon name="alarm-outline"></ion-icon>
                  <h4>No reminders yet</h4>
                  <p>Add your first health reminder to get started</p>
                </div>
              ) : (
                reminders.map(reminder => {
                  const typeInfo = getReminderTypeInfo(reminder.type);
                  return (
                    <div key={reminder.id} className={`reminder-card ${!reminder.isActive ? 'inactive' : ''}`}>
                      <div className="reminder-icon" style={{ backgroundColor: typeInfo.color }}>
                        <ion-icon name={typeInfo.icon}></ion-icon>
                      </div>
                      
                      <div className="reminder-info">
                        <div className="reminder-header">
                          <h5>{reminder.title}</h5>
                          {reminder.aiGenerated && (
                            <span className="ai-badge">AI Suggested</span>
                          )}
                        </div>
                        <p className="reminder-time">
                          {reminder.time} • {reminder.frequency}
                        </p>
                        {reminder.notes && (
                          <p className="reminder-notes">{reminder.notes}</p>
                        )}
                      </div>

                      <div className="reminder-actions">
                        <button
                          onClick={() => toggleReminder(reminder.id)}
                          className={`toggle-btn ${reminder.isActive ? 'active' : ''}`}
                          title={reminder.isActive ? 'Disable' : 'Enable'}
                        >
                          <ion-icon name={reminder.isActive ? 'checkmark-outline' : 'close-outline'}></ion-icon>
                        </button>
                        {!reminder.aiGenerated && (
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="delete-btn"
                            title="Delete"
                          >
                            <ion-icon name="trash-outline"></ion-icon>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIReminderSystem;