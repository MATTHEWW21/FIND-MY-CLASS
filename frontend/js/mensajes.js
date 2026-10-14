document.addEventListener("DOMContentLoaded", () => {
    const chatInputField = document.getElementById("chat-input-field");
    const btnSendMsg = document.getElementById("btn-send-msg");
    const chatMessagesArea = document.getElementById("chat-messages");

    // Función para enviar mensaje
    const sendMessage = () => {
        if (!chatInputField) return;
        const text = chatInputField.value.trim();

        if (text !== "") {
            const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newBubble = document.createElement("div");
            newBubble.className = "message-bubble sent";
            newBubble.innerHTML = `
                <p>${text}</p>
                <span class="msg-time">${timeNow} ✓</span>
            `;

            if (chatMessagesArea) {
                chatMessagesArea.appendChild(newBubble);
                chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
            }

            chatInputField.value = "";
        }
    };

    if (btnSendMsg) {
        btnSendMsg.addEventListener("click", sendMessage);
    }

    if (chatInputField) {
        chatInputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }
});