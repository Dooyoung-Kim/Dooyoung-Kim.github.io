/**
 * Claude Code API Integration
 * Provides code assistance and generation using Claude API
 */

class ClaudeCodeAPI {
    constructor() {
        this.apiKey = null; // Will be set by user
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Check if API key is stored in localStorage
        const storedKey = localStorage.getItem('claude_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
            this.isInitialized = true;
        }
        
        // Create UI if not exists
        this.createUI();
    }

    createUI() {
        // Create floating button
        const button = document.createElement('button');
        button.id = 'claude-code-btn';
        button.className = 'claude-code-button';
        button.innerHTML = '<i class="fas fa-code"></i>';
        button.title = 'Claude Code Assistant';
        button.addEventListener('click', () => this.togglePanel());
        document.body.appendChild(button);

        // Create panel
        const panel = document.createElement('div');
        panel.id = 'claude-code-panel';
        panel.className = 'claude-code-panel';
        panel.innerHTML = `
            <div class="claude-code-header">
                <h3><i class="fas fa-robot"></i> Claude Code Assistant</h3>
                <button class="claude-code-close" onclick="claudeAPI.closePanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="claude-code-content">
                ${!this.isInitialized ? this.renderSetup() : this.renderChat()}
            </div>
        `;
        document.body.appendChild(panel);
    }

    renderSetup() {
        return `
            <div class="claude-code-setup">
                <p>Enter your Claude API key to use the code assistant:</p>
                <input type="password" id="claude-api-key-input" placeholder="sk-ant-..." class="claude-input">
                <button onclick="claudeAPI.saveApiKey()" class="claude-btn-primary">Save & Connect</button>
                <p class="claude-note">Your API key is stored locally in your browser and never sent to our servers.</p>
                <p class="claude-note">
                    <a href="https://console.anthropic.com/" target="_blank">Get your API key from Anthropic Console</a>
                </p>
            </div>
        `;
    }

    renderChat() {
        return `
            <div class="claude-code-chat">
                <div id="claude-messages" class="claude-messages"></div>
                <div class="claude-input-area">
                    <textarea id="claude-user-input" placeholder="Ask me anything about code, or request code generation..." rows="3" class="claude-textarea"></textarea>
                    <button onclick="claudeAPI.sendMessage()" class="claude-btn-send">
                        <i class="fas fa-paper-plane"></i> Send
                    </button>
                </div>
                <button onclick="claudeAPI.clearChat()" class="claude-btn-clear">Clear Chat</button>
            </div>
        `;
    }

    saveApiKey() {
        const input = document.getElementById('claude-api-key-input');
        const key = input.value.trim();
        
        if (!key || !key.startsWith('sk-ant-')) {
            alert('Please enter a valid Claude API key (starts with sk-ant-)');
            return;
        }
        
        this.apiKey = key;
        localStorage.setItem('claude_api_key', key);
        this.isInitialized = true;
        
        // Re-render panel
        const content = document.querySelector('.claude-code-content');
        content.innerHTML = this.renderChat();
    }

    togglePanel() {
        const panel = document.getElementById('claude-code-panel');
        panel.classList.toggle('active');
    }

    closePanel() {
        const panel = document.getElementById('claude-code-panel');
        panel.classList.remove('active');
    }

    async sendMessage() {
        const input = document.getElementById('claude-user-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const messagesDiv = document.getElementById('claude-messages');
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'claude-message claude-message-user';
        userMsg.innerHTML = `<div class="claude-message-content">${this.escapeHtml(message)}</div>`;
        messagesDiv.appendChild(userMsg);
        
        // Clear input
        input.value = '';
        
        // Add loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'claude-message claude-message-assistant';
        loadingMsg.id = 'claude-loading';
        loadingMsg.innerHTML = '<div class="claude-message-content"><i class="fas fa-spinner fa-spin"></i> Thinking...</div>';
        messagesDiv.appendChild(loadingMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        try {
            const response = await this.callClaudeAPI(message);
            
            // Remove loading message
            document.getElementById('claude-loading').remove();
            
            // Add assistant response
            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'claude-message claude-message-assistant';
            assistantMsg.innerHTML = `<div class="claude-message-content">${this.formatResponse(response)}</div>`;
            messagesDiv.appendChild(assistantMsg);
            
        } catch (error) {
            document.getElementById('claude-loading').remove();
            const errorMsg = document.createElement('div');
            errorMsg.className = 'claude-message claude-message-error';
            errorMsg.innerHTML = `<div class="claude-message-content">Error: ${this.escapeHtml(error.message)}</div>`;
            messagesDiv.appendChild(errorMsg);
        }
        
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async callClaudeAPI(userMessage) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [
                    {
                        role: 'user',
                        content: `You are a helpful coding assistant. Help with the following request:\n\n${userMessage}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.content[0].text;
    }

    formatResponse(text) {
        // Format code blocks
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Format inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Format line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearChat() {
        const messagesDiv = document.getElementById('claude-messages');
        messagesDiv.innerHTML = '';
    }
}

// Initialize Claude API
const claudeAPI = new ClaudeCodeAPI();

// Add Enter key support for textarea
document.addEventListener('keydown', (e) => {
    const textarea = document.getElementById('claude-user-input');
    if (textarea && document.activeElement === textarea && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        claudeAPI.sendMessage();
    }
});

