/**
 * CHAT SYSTEM - Complete Implementation
 * Real-time customer support with Firebase
 */

class ChatSystem {
  constructor() {
    this.currentChatId = null;
    this.currentUserId = localStorage.getItem('userId');
    this.messages = [];
    this.unreadCount = 0;
  }

  // Initialize chat system
  async init() {
    this.setupChatUI();
    this.listenForNewMessages();
    this.setupChatListeners();
  }

  // Setup chat UI
  setupChatUI() {
    // لا نضيف زر دردشة إضافي - الموقع يستخدم نظام الدردشة المدمج
    return;

    if (!document.getElementById('chat-widget')) {
      document.body.insertAdjacentHTML('beforeend', chatHTML);
    }
  }

  // Toggle chat visibility
  toggleChat() {
    const widget = document.getElementById('chat-widget');
    const button = document.getElementById('chat-button');
    
    if (widget.classList.contains('hidden')) {
      widget.classList.remove('hidden');
      button.classList.add('hidden');
      document.getElementById('chat-input').focus();
    } else {
      widget.classList.add('hidden');
      button.classList.remove('hidden');
    }
  }

  // Send message
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    if (!this.currentUserId) {
      showPopup('تنبيه', 'يجب تسجيل الدخول أولاً', 'info');
      return;
    }

    try {
      const chatRef = db.collection('chat_messages').doc();
      
      await chatRef.set({
        id: chatRef.id,
        userId: this.currentUserId,
        userName: localStorage.getItem('userName') || 'زائر',
        userPhoto: localStorage.getItem('userPhoto') || '',
        message: message,
        timestamp: new Date(),
        isAdmin: false,
        read: false
      });

      input.value = '';
      this.displayMessage(message, true);
      this.scrollToBottom();

      // Show notification
      showNotification('✓ تم إرسال الرسالة', 'success');
    } catch (e) {
      console.error('❌ Error sending message:', e);
      showPopup('خطأ', 'فشل إرسال الرسالة', 'error');
    }
  }

  // Display message in chat
  displayMessage(message, isSent = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `flex ${isSent ? 'justify-end' : 'justify-start'}`;
    messageDiv.innerHTML = `
      <div class="${isSent ? 'bg-gold-text text-black' : 'bg-zinc-800 text-white'} p-3 rounded-lg max-w-xs text-sm">
        ${message}
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  // Listen for new messages
  listenForNewMessages() {
    if (!this.currentUserId) return;

    db.collection('chat_messages')
      .where('userId', '==', this.currentUserId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(snapshot => {
        const messages = [];
        snapshot.forEach(doc => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        
        this.messages = messages.reverse();
        this.renderMessages();
      });
  }

  // Render all messages
  renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    container.innerHTML = this.messages.map(msg => `
      <div class="flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}">
        <div class="${msg.isAdmin ? 'bg-zinc-800 text-white' : 'bg-gold-text text-black'} p-3 rounded-lg max-w-xs text-sm">
          <p class="font-bold text-xs mb-1">${msg.userName}</p>
          <p>${msg.message}</p>
          <p class="text-xs opacity-70 mt-1">${new Date(msg.timestamp).toLocaleTimeString('ar-EG')}</p>
        </div>
      </div>
    `).join('');

    this.scrollToBottom();
  }

  // Scroll to bottom
  scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }

  // Setup chat listeners
  setupChatListeners() {
    const input = document.getElementById('chat-input');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }
  }
}

// Initialize chat system
const chatSystem = new ChatSystem();
document.addEventListener('DOMContentLoaded', () => {
  chatSystem.init();
});
