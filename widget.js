(function() {
    // 1. Client ID Validation 4
    const scriptTag = document.currentScript;
    const clientId = scriptTag.getAttribute('data-id');
    const backendUrl = 'https://gravixapp.netlify.app/api/chat'; 

    if (!clientId) return console.error("Qgent: Client ID missing!");

    // 2. Load Google Fonts (Light weights for premium feel)
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // 3. Inject Ultra-Premium CSS
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --qg-primary: #3b82f6; 
            --qg-accent: #60a5fa;
            --qg-bg-glass: rgba(15, 23, 42, 0.65);
            --qg-border-glass: rgba(255, 255, 255, 0.08);
            --qg-text-main: #f8fafc;
            --qg-text-sub: #94a3b8;
            --qg-font: 'Outfit', sans-serif;
            --qg-easing: cubic-bezier(0.16, 1, 0.3, 1); /* GSAP-like power2.out */
        }

        #qgent-container {
            font-family: var(--qg-font);
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            pointer-events: none;
        }

        #qgent-container * { box-sizing: border-box; }
        #qgent-container > * { pointer-events: auto; }

        /* --- Toggle Button (Glowing Orb) --- */
        .qgent-button {
            width: 60px;
            height: 60px;
            background: rgba(59, 130, 246, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.2);
            transition: all 0.5s var(--qg-easing);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            position: relative;
            z-index: 20;
        }

        .qgent-button::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            opacity: 0;
            filter: blur(10px);
            transition: 0.5s;
            z-index: -1;
        }

        .qgent-button:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        .qgent-button:hover::before { opacity: 0.5; }
        .qgent-button:active { transform: scale(0.95); }

        /* --- Main Window (Dark Glass) --- */
        .qgent-window {
            position: absolute;
            bottom: 90px;
            right: 0;
            width: 360px;
            height: 520px;
            background: linear-gradient(160deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-radius: 32px;
            border: 1px solid var(--qg-border-glass);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
            display: none;
            flex-direction: column;
            overflow: hidden;
            transform-origin: bottom right;
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            transition: all 0.6s var(--qg-easing);
        }

        .qgent-window.open {
            display: flex; /* Changed from just visible to flex to allow display toggling */
            opacity: 1;
            transform: scale(1) translateY(0);
        }

        /* --- Header (Hidden in Welcome Mode) --- */
        .qgent-header {
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            background: rgba(0,0,0,0.2);
        }

        .qgent-header-title { font-size: 14px; font-weight: 500; color: white; letter-spacing: 0.5px; }

        /* --- Welcome View (The "Hero" State) --- */
        .qgent-welcome {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
            transition: 0.4s;
        }

        .qgent-orb {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: royalblue;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(59, 130, 246, 1), rgba(15, 23, 42, 1));
            box-shadow: 0 0 60px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.5);
            margin-bottom: 24px;
            animation: orbFloat 6s ease-in-out infinite;
        }

        @keyframes orbFloat {
            0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 0 60px rgba(59, 130, 246, 0.5); }
            50% { transform: translateY(-10px) scale(1.05); box-shadow: 0 0 80px rgba(59, 130, 246, 0.7); }
        }

        .qgent-welcome h2 {
            font-size: 24px;
            font-weight: 300;
            color: white;
            margin: 0 0 8px;
            opacity: 0;
            animation: fadeInUp 0.8s 0.2s forwards var(--qg-easing);
        }

        .qgent-welcome h3 {
            font-size: 24px;
            font-weight: 500;
            background: linear-gradient(to right, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
            opacity: 0;
            animation: fadeInUp 0.8s 0.3s forwards var(--qg-easing);
        }

        /* --- Chat View (History) --- */
        .qgent-chat-area {
            flex: 1;
            display: none; /* Hidden by default */
            flex-direction: column;
            overflow: hidden;
        }

        .qgent-messages {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .qgent-msg {
            max-width: 85%;
            padding: 12px 18px;
            font-size: 14px;
            font-weight: 300;
            line-height: 1.6;
            animation: msgPop 0.4s var(--qg-easing) forwards;
        }

        .qgent-msg.user {
            align-self: flex-end;
            background: #3b82f6;
            color: white;
            border-radius: 20px 20px 4px 20px;
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
        }

        .qgent-msg.bot {
            align-self: flex-start;
            background: rgba(255,255,255,0.08);
            color: #e2e8f0;
            border-radius: 20px 20px 20px 4px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.05);
        }

        @keyframes msgPop {
            from { opacity: 0; transform: translateY(15px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* --- Unified Input Area --- */
        .qgent-input-container {
            padding: 24px;
            background: rgba(0,0,0,0.2);
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .qgent-input-box {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            transition: 0.3s;
        }

        .qgent-input-box:focus-within {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.2);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .qgent-input {
            width: 100%;
            background: transparent;
            border: none;
            padding: 12px 16px;
            color: white;
            font-family: var(--qg-font);
            font-size: 14px;
            font-weight: 300;
            outline: none;
        }
        .qgent-input::placeholder { color: rgba(255,255,255,0.3); }

        .qgent-tools {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 8px;
            margin-top: 4px;
        }

        .qgent-tool-group { display: flex; gap: 8px; }

        .qgent-tool-btn {
            background: rgba(255,255,255,0.05);
            border: none;
            border-radius: 12px;
            padding: 8px 12px;
            color: rgba(255,255,255,0.6);
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: 0.2s;
        }
        .qgent-tool-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        
        .qgent-send-btn {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 12px;
            padding: 8px 20px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .qgent-send-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }
        .qgent-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Mobile */
        @media (max-width: 480px) {
            .qgent-window { width: 100vw; height: 100vh; bottom: 0; right: 0; border-radius: 0; }
            #qgent-container { bottom: 20px; right: 20px; }
        }
    `;
    document.head.appendChild(style);

    // 4. Icons
    const ICONS = {
        chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
        close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        attach: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
        mic: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
        arrowUp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`
    };

    // 5. Structure
    const container = document.createElement('div');
    container.id = 'qgent-container';
    container.innerHTML = `
        <div class="qgent-window" id="qg-window">
            
            <div class="qgent-header" id="qg-header" style="display:none;">
                <div class="qgent-header-title">Qgent Assistant</div>
                <div style="width:24px;"></div> <!-- Spacer -->
            </div>

            <!-- Welcome State -->
            <div class="qgent-welcome" id="qg-welcome">
                <div class="qgent-orb"></div>
                <h2>Hi there,</h2>
                <h3>what's on your mind?</h3>
            </div>

            <!-- Chat State -->
            <div class="qgent-chat-area" id="qg-chat-area">
                <div class="qgent-messages" id="qg-msgs"></div>
            </div>

            <!-- Input (Floating) -->
            <div class="qgent-input-container">
                <div class="qgent-input-box">
                    <input type="text" class="qgent-input" id="qg-input" placeholder="Ask me anything...">
                    <div class="qgent-tools">
                        <div class="qgent-tool-group">
                            <button class="qgent-tool-btn">${ICONS.attach} Attach</button>
                            <button class="qgent-tool-btn">${ICONS.mic} Voice</button>
                        </div>
                        <button class="qgent-send-btn" id="qg-send" disabled>${ICONS.arrowUp} Send</button>
                    </div>
                </div>
                <div style="text-align:center; margin-top:12px; font-size:10px; color:rgba(255,255,255,0.2); letter-spacing:1px; text-transform:uppercase;">Powered by Questra</div>
            </div>
        </div>

        <button class="qgent-button" id="qg-btn">
            ${ICONS.chat}
        </button>
    `;
    document.body.appendChild(container);

    // 6. Logic
    let isOpen = false;
    let hasStartedChat = false;
    
    const ui = {
        btn: document.getElementById('qg-btn'),
        win: document.getElementById('qg-window'),
        input: document.getElementById('qg-input'),
        send: document.getElementById('qg-send'),
        msgs: document.getElementById('qg-msgs'),
        welcome: document.getElementById('qg-welcome'),
        chatArea: document.getElementById('qg-chat-area'),
        header: document.getElementById('qg-header')
    };

    function toggleChat() {
        isOpen = !isOpen;
        if(isOpen) {
            ui.win.classList.add('open');
            ui.win.style.display = 'flex';
            setTimeout(() => ui.win.style.opacity = '1', 10);
            ui.btn.innerHTML = ICONS.close;
        } else {
            ui.win.classList.remove('open');
            ui.win.style.opacity = '0';
            setTimeout(() => ui.win.style.display = 'none', 500);
            ui.btn.innerHTML = ICONS.chat;
        }
    }
    ui.btn.onclick = toggleChat;

    ui.input.addEventListener('input', () => {
        ui.send.disabled = !ui.input.value.trim();
    });

    function switchToChatMode() {
        if(hasStartedChat) return;
        hasStartedChat = true;
        
        // GSAP-style transition
        ui.welcome.style.opacity = '0';
        ui.welcome.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            ui.welcome.style.display = 'none';
            ui.header.style.display = 'flex';
            ui.chatArea.style.display = 'flex';
            
            // Add subtle entry for chat area
            ui.chatArea.style.opacity = '0';
            setTimeout(() => ui.chatArea.style.opacity = '1', 50);
        }, 400);
    }

    async function handleSend() {
        const text = ui.input.value.trim();
        if(!text) return;

        switchToChatMode();
        
        addMessage('user', text);
        ui.input.value = '';
        ui.send.disabled = true;

        showTyping();

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: clientId, message: text, session_id: 'sess_' + Date.now() })
            });
            const data = await response.json();
            removeTyping();
            addMessage('bot', data.reply);
        } catch(e) {
            removeTyping();
            addMessage('bot', "Could not connect to Qgent Neural Core.");
        }
    }

    ui.send.onclick = handleSend;
    ui.input.onkeypress = (e) => { if(e.key === 'Enter') handleSend(); };

    function addMessage(role, text) {
        const div = document.createElement('div');
        div.className = `qgent-msg ${role}`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        ui.msgs.appendChild(div);
        setTimeout(() => ui.msgs.scrollTop = ui.msgs.scrollHeight, 10);
    }

    let typingEl = null;
    function showTyping() {
        if(typingEl) return;
        typingEl = document.createElement('div');
        typingEl.className = 'qgent-msg bot';
        typingEl.innerHTML = '<span style="opacity:0.7; font-size:12px">Thinking...</span>';
        ui.msgs.appendChild(typingEl);
        ui.msgs.scrollTop = ui.msgs.scrollHeight;
    }

    function removeTyping() {
        if(typingEl) { typingEl.remove(); typingEl = null; }
    }

    // Auto-open logic
    if(new URLSearchParams(window.location.search).has('open_chat')) {
        setTimeout(toggleChat, 1000);
    }

})();
