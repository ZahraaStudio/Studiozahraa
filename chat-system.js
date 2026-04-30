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
    const chatHTML = `
      <div id="chat-widget" class="fixed bottom-4 right-4 z-1000 hidden">
        <div class="bg-zinc-900 border border-gold-text rounded-2xl shadow-2xl w-96 max-h-96 flex flex-col">
          <!-- Chat Header -->
          <div class="bg-gradient-to-r from-gold-text to-yellow-400 text-black p-4 rounded-t-2xl flex justify-between items-center">
            <h3 class="font-bold">💬 الدعم المباشر</h3>
            <button onclick="chatSystem.toggleChat()" class="text-xl">✕</button>
          </div>

          <!-- Messages Container -->
          <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
            <p class="text-zinc-500 text-center text-sm">مرحباً! كيف يمكننا مساعدتك؟</p>
          </div>

          <!-- Input Area -->
          <div class="p-4 border-t border-zinc-800 bg-black rounded-b-2xl">
            <div class="flex gap-2">
              <input type="text" id="chat-input" placeholder="اكتب رسالتك..." 
                class="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm outline-none focus:border-gold-text">
              <button onclick="chatSystem.sendMessage()" class="gold-bg text-black px-4 py-2 rounded font-bold hover:opacity-90">
                إرسال
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Button -->
      <button id="chat-button" onclick="chatSystem.toggleChat()" 
        class="fixed bottom-4 right-4 z-999 gold-bg text-black p-4 rounded-full shadow-lg hover:opacity-90 font-bold text-xl">
        💬
        <span id="chat-badge" class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
      </button>
    `;

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
