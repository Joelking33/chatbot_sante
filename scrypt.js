
  const conversations = [];
  let currentConvId = null;
  let darkMode = true;

  function getTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  }

  function renderConvList() {
    const list = document.getElementById('conv-list');
    if (conversations.length === 0) {
      list.innerHTML = '<div class="no-conv">Aucune conversation</div>';
      return;
    }
    list.innerHTML = conversations.map(c => `
      <div class="conv-item ${c.id === currentConvId ? 'active' : ''}" onclick="switchConv('${c.id}')">
        <div class="conv-title">${c.title}</div>
        <div class="conv-date">Aujourd'hui</div>
      </div>
    `).join('');
  }

  function renderMessages() {
    const msgsEl = document.getElementById('messages');
    const conv = conversations.find(c => c.id === currentConvId);

    if (!conv || conv.messages.length === 0) {
      msgsEl.innerHTML = `
        <div class="welcome">
          <div class="welcome-icon"><img src="img/Sanovia.jpeg" alt="Sanovia" style="width:100%;height:100%;object-fit:cover;"></div>
          <h2>Sanovia</h2>
          <p>Bonjour ! Je suis Sanovia, votre assistant santé. Comment puis-je vous aider aujourd'hui ?</p>
        </div>`;
      return;
    }

    msgsEl.innerHTML = conv.messages.map(m => `
      <div class="msg-row ${m.role}">
        ${m.role === 'bot' ? '<div class="bot-avatar">🧠</div>' : ''}
        <div>
          <div class="bubble ${m.role}">${m.text}</div>
          <div class="bubble-time">${m.time}</div>
        </div>
      </div>
    `).join('');

    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function newConversation() {
    const id = 'conv_' + Date.now();
    conversations.unshift({ id, title: 'Nouvelle conversation', messages: [] });
    currentConvId = id;
    renderConvList();
    renderMessages();
    closeSidebar();
  }

  function switchConv(id) {
    currentConvId = id;
    renderConvList();
    renderMessages();
    closeSidebar();
  }

  async function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text) return;

    if (!currentConvId) newConversation();

    const conv = conversations.find(c => c.id === currentConvId);
    if (conv.title === 'Nouvelle conversation') {
      conv.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
    }

    conv.messages.push({ role: 'user', text, time: getTime() });
    input.value = '';
    input.style.height = 'auto';
    renderConvList();
    renderMessages();

    // Typing indicator
    const msgsEl = document.getElementById('messages');
    const typing = document.createElement('div');
    typing.className = 'msg-row bot';
    typing.id = 'typing';
    typing.innerHTML = `<div class="bot-avatar">🧠</div><div class="bubble bot" style="color:var(--text-secondary);font-style:italic;">En train d'écrire...</div>`;
    msgsEl.appendChild(typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "Tu es Sanovia, un assistant santé bienveillant et professionnel. Réponds en français de manière claire, empathique et informative. Ne fournis jamais de diagnostic médical définitif, mais aide l'utilisateur à mieux comprendre sa santé et oriente-le vers des professionnels si nécessaire.",
          messages: conv.messages.filter(m => m.role !== 'bot').concat([]).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Désolé, je n'ai pas pu traiter votre message.";

      document.getElementById('typing')?.remove();
      conv.messages.push({ role: 'bot', text: reply, time: getTime() });
    } catch (e) {
      document.getElementById('typing')?.remove();
      conv.messages.push({ role: 'bot', text: "Réponse reçue.", time: getTime() });
    }

    renderConvList();
    renderMessages();
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const hamburger = document.getElementById('hamburger');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    hamburger.classList.toggle('open');
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
  }

  function toggleTheme() {
    darkMode = !darkMode;
    document.documentElement.style.setProperty('--bg-primary', darkMode ? '#0d1117' : '#f5f7fa');
    document.documentElement.style.setProperty('--bg-secondary', darkMode ? '#161b22' : '#ffffff');
    document.documentElement.style.setProperty('--bg-sidebar', darkMode ? '#0d1117' : '#f0f2f5');
    document.documentElement.style.setProperty('--bg-message-bot', darkMode ? '#1c2333' : '#f0f2f5');
    document.documentElement.style.setProperty('--bg-input', darkMode ? '#161b22' : '#f5f7fa');
    document.documentElement.style.setProperty('--text-primary', darkMode ? '#e6edf3' : '#1a1a2e');
    document.documentElement.style.setProperty('--text-secondary', darkMode ? '#8b949e' : '#666');
    document.documentElement.style.setProperty('--border', darkMode ? '#21262d' : '#d0d7de');
    document.querySelector('.theme-btn').innerHTML = darkMode ? '<i class="fa-solid fa-sun" style="color: rgb(42, 91, 177);"></i>' : '<i class="fa-solid fa-moon" style="color: rgb(42, 91, 177);"></i>';
  }

  // Init
  renderConvList();
  renderMessages();
