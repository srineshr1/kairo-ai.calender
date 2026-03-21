/**
 * Manual test script for notification system
 * 
 * To test notifications in the browser:
 * 
 * 1. Open dev console and run:
 *    window.testNotifications()
 * 
 * 2. This will create sample notifications of each type
 * 
 * 3. Click the bell icon in TopBar to see the notification panel
 * 
 * 4. Test interactions:
 *    - Mark individual notifications as read (click on them)
 *    - Delete notifications (click X button)
 *    - Clear all notifications (click "Clear all")
 * 
 * 5. Refresh page to verify localStorage persistence
 * 
 * 6. To test auto-generation:
 *    - Create an event 15 minutes in the future
 *    - Wait for the notification trigger (checks every minute)
 *    - Create an overdue event and wait until 9 AM
 */

import { useNotificationStore } from './store/useNotificationStore'

// Expose test function globally
window.testNotifications = () => {
  const { addNotification } = useNotificationStore.getState()
  
  // Test reminder notification
  addNotification({
    type: 'reminder',
    title: 'Event starting soon',
    message: 'Stand-up starts in 15 minutes',
    eventId: 'test-event-1',
  })
  
  // Test overdue notification
  setTimeout(() => {
    addNotification({
      type: 'overdue',
      title: 'Overdue tasks',
      message: 'You have 3 overdue tasks',
    })
  }, 500)
  
  // Test WhatsApp notification
  setTimeout(() => {
    addNotification({
      type: 'whatsapp',
      title: 'WhatsApp Sync Complete',
      message: 'Added 5 events from your groups',
    })
  }, 1000)
  
  // Test system notification
  setTimeout(() => {
    addNotification({
      type: 'system',
      title: 'Welcome back!',
      message: 'Your calendar has been synced successfully',
    })
  }, 1500)
  
  console.log('✅ 4 test notifications created!')
  console.log('Click the bell icon in TopBar to view them')
}

console.log('📢 Notification test helper loaded!')
console.log('Run window.testNotifications() to create sample notifications')
