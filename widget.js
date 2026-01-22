(function () {
    // 1. Client ID Validation
    const scriptTag = document.currentScript;
    const clientId = scriptTag.getAttribute('data-id');
    const backendUrl = 'https://gravixapp.netlify.app/api/chat';

    if (!clientId) return console.error("Qgent: Client ID missing!");

    // 2. Load Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // 3. Inject Premium CSS
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --qg-primary: #0066ff;
            --qg-font: 'Outfit', sans-serif;
            --qg-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }

        #qgent-container {
            font-family: var(--qg-font);
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            pointer-events: none; /* Allow clicking through container area */
        }

        #qgent-container > * {
            pointer-events: auto; /* Re-enable clicks on children */
        }

        /* --- Toggle Button --- */
        .qgent-button {
            width: 64px;
            height: 64px;
            background: var(--qg-primary);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(0, 102, 255, 0.25);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .qgent-button:hover {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 0 12px 32px rgba(0, 102, 255, 0.35);
        }

        .qgent-button:active {
            transform: scale(0.95);
        }

        /* --- Chat Window --- */
        .qgent-window {
            position: absolute;
            bottom: 84px;
            right: 0;
            width: 380px;
            height: 600px;
            max-height: calc(100vh - 120px);
            background: #ffffff;
            border-radius: 24px;
            box-shadow: var(--qg-shadow);
            border: 1px solid rgba(0,0,0,0.06);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform-origin: bottom right;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0;
            transform: scale(0.9) translateY(20px);
            pointer-events: none;
            visibility: hidden;
        }

        .qgent-window.open {
            opacity: 1;
            transform: scale(1) translateY(0);
            pointer-events: auto;
            visibility: visible;
        }

        /* --- Header --- */
        .qgent-header {
            padding: 24px;
            background: linear-gradient(135deg, var(--qg-primary), #2563eb);
            color: white;
            display: flex;
            align-items: center;
            gap: 16px;
            position: relative;
        }

        .qgent-avatar {
            width: 44px;
            height: 44px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(4px);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 600;
        }

        .qgent-info h3 { margin: 0; font-size: 16px; font-weight: 600; line-height: 1.2; }
        .qgent-info p { margin: 2px 0 0; font-size: 12px; opacity: 0.8; font-weight: 400; display: flex; align-items: center; gap: 4px; }
        .qgent-status-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; display: inline-block; }

        /* --- Close Button --- */
        .qgent-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            transition: 0.2s;
        }
        .qgent-close:hover { background: rgba(255,255,255,0.1); color: white; }

        /* --- Messages Area --- */
        .qgent-messages {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 16px;
            scroll-behavior: smooth;
        }

        .qgent-messages::-webkit-scrollbar { width: 5px; }
        .qgent-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

        .qgent-msg {
            max-width: 85%;
            padding: 12px 18px;
            font-size: 14px;
            line-height: 1.5;
            position: relative;
            animation: slideIn 0.3s ease-out forwards;
            opacity: 0;
            transform: translateY(10px);
        }

        @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }

        .qgent-msg.user {
            background: var(--qg-primary);
            color: white;
            align-self: flex-end;
            border-radius: 20px 20px 4px 20px;
            box-shadow: 0 4px 12px rgba(0, 102, 255, 0.15);
        }

        .qgent-msg.bot {
            background: white;
            color: #1e293b;
            align-self: flex-start;
            border-radius: 20px 20px 20px 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            border: 1px solid rgba(0,0,0,0.04);
        }

        .qgent-img {
            max-width: 100%;
            border-radius: 12px;
            margin-top: 8px;
            border: 1px solid rgba(0,0,0,0.1);
        }

        /* --- Input Area --- */
        .qgent-input-area {
            padding: 20px;
            background: white;
            border-top: 1px solid rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .qgent-input-wrapper {
            flex: 1;
            position: relative;
            background: #f1f5f9;
            border-radius: 24px;
            transition: 0.3s;
            border: 1px solid transparent;
        }

        .qgent-input-wrapper:focus-within {
            background: white;
            border-color: var(--qg-primary);
            box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .qgent-input {
            width: 100%;
            border: none;
            background: transparent;
            padding: 14px 18px;
            font-family: var(--qg-font);
            font-size: 14px;
            outline: none;
            color: #0f172a;
        }

        .qgent-send-btn {
            background: var(--qg-primary);
            border: none;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.3s;
            box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);
        }

        .qgent-send-btn:hover { transform: scale(1.05); }
        .qgent-send-btn:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; box-shadow: none; }

        /* --- Footer --- */
        .qgent-footer {
            text-align: center;
            padding: 8px;
            font-size: 10px;
            color: #94a3b8;
            background: #f8fafc;
            border-top: 1px solid rgba(0,0,0,0.03);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
        }
        
        /* Mobile */
        @media (max-width: 480px) {
            .qgent-window { width: 100vw; height: 100vh; max-height: none; bottom: 0; right: 0; border-radius: 0; }
            #qgent-container { z-index: 2147483647; bottom: 0; right: 0; }
        }
    `;
    document.head.appendChild(style);

    // 4. Create UI Structure
    const container = document.createElement('div');
    container.id = 'qgent-container';

    // Toggle Icon (Message/Close)
    const chatIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    const closeIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    container.innerHTML = `
        <div class="qgent-window" id="qg-window">
            <div class="qgent-header" id="qg-header">
                <div class="qgent-avatar" id="qg-avatar">AI</div>
                <div class="qgent-info">
                    <h3 id="qg-bot-name">Support Agent</h3>
                    <p><span class="qgent-status-dot"></span> Online</p>
                </div>
                <button class="qgent-close" id="qg-close-btn">${closeIcon}</button>
            </div>
            
            <div class="qgent-messages" id="qg-msgs"></div>
            
            <div class="qgent-input-area">
                <div class="qgent-input-wrapper">
                    <input type="text" class="qgent-input" id="qg-input" placeholder="Type your message...">
                </div>
                <button class="qgent-send-btn" id="qg-send" disabled>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            
            <div class="qgent-footer">Powered by Questra</div>
        </div>

        <button class="qgent-button" id="qg-btn">
            ${chatIcon}
        </button>
    `;
    document.body.appendChild(container);

    // 5. Logic & State
    let isOpen = false;
    const btn = document.getElementById('qg-btn');
    const win = document.getElementById('qg-window');
    const closeBtn = document.getElementById('qg-close-btn');
    const input = document.getElementById('qg-input');
    const sendBtn = document.getElementById('qg-send');
    const msgs = document.getElementById('qg-msgs');

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            win.classList.add('open');
            btn.innerHTML = closeIcon;
            btn.style.transform = 'rotate(90deg)';
        } else {
            win.classList.remove('open');
            btn.innerHTML = chatIcon;
            btn.style.transform = 'rotate(0deg)';
        }
    }

    btn.onclick = toggleChat;
    closeBtn.onclick = toggleChat;

    // Input Handling
    input.addEventListener('input', () => {
        sendBtn.disabled = !input.value.trim();
    });

    async function handleSend() {
        const text = input.value.trim();
        if (!text) return;

        addMessage('user', text);
        input.value = '';
        sendBtn.disabled = true;

        // Show typing indicator
        const typingId = showTyping();

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: clientId, message: text, session_id: 'sess_' + Math.random().toString(36).substr(2, 9) })
            });
            const data = await response.json();
            removeTyping(typingId);
            addMessage('bot', data.reply);
        } catch (e) {
            removeTyping(typingId);
            addMessage('bot', "Connecton error. Please try again.");
            console.error(e);
        }
    }

    sendBtn.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

    function addMessage(role, text) {
        const div = document.createElement('div');
        div.className = `qgent-msg ${role}`;

        // Image parsing
        const imgRegex = /\[IMAGE:\s*(.*?)\]/g;
        let formatted = text.replace(imgRegex, (m, url) => `<img src="${url}" class="qgent-img" onerror="this.style.display='none'">`);

        div.innerHTML = formatted.replace(/\n/g, '<br>');
        msgs.appendChild(div);

        // Scroll to bottom
        setTimeout(() => msgs.scrollTop = msgs.scrollHeight, 10);
    }

    function showTyping() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'qgent-msg bot';
        div.id = id;
        div.innerHTML = `<span style="opacity:0.6;font-size:12px">Typing...</span>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        return id;
    }

    function removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // 6. Init Config (Handshake)
    async function initWidget() {
        try {
            const res = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: clientId, action: 'GET_CONFIG' })
            });
            const config = await res.json();

            // Apply Configuration
            const primary = config.primary_color || '#0066ff';
            document.documentElement.style.setProperty('--qg-primary', primary);

            document.getElementById('qg-bot-name').innerText = config.bot_name || 'Assistant';
            if (config.bot_avatar) {
                document.getElementById('qg-avatar').innerHTML = `<img src="${config.bot_avatar}" style="width:100%;height:100%;border-radius:12px;object-fit:cover">`;
            }

            addMessage('bot', config.welcome_message || "Hello! How can I help you today?");
        } catch (e) {
            console.warn("Qgent Config Error:", e);
            document.documentElement.style.setProperty('--qg-primary', '#0066ff');
            addMessage('bot', "Hello! How can I help you?");
        }
    }

    // Auto-open if parameter present (optional feature)
    if (new URLSearchParams(window.location.search).has('open_chat')) {
        setTimeout(toggleChat, 1000);
    }

    initWidget();
})();
