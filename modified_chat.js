<script>
    // --- مساعد الزهراء الذكي (النسخة الفولاذية - شغال 100% بدون API Key) ---
    window.isAiChatOpen = false;

    // 1. دالة فتح وقفل الشات (تأكد إن الزرار بينادي عليها)
    window.toggleAIChat = function() {
        const container = document.getElementById("ai-chat-container");
        if (!container) return;
        window.isAiChatOpen = !window.isAiChatOpen;
        container.style.display = window.isAiChatOpen ? "flex" : "none";
        if (window.isAiChatOpen) document.getElementById("ai-input")?.focus();
    };

    // 2. دالة إرسال الرسالة (الزرار الأساسي)
    window.askZahraaAI = async function() {
        const input = document.getElementById("ai-input");
        if (!input) return;
        
        const originalText = input.value.trim();
        if (!originalText) return;

        // عرض رسالة المستخدم
        appendAIMessage(originalText, "user");
        input.value = "";

        // تأثير "بكتبلك الرد" عشان يبان AI حقيقي
        const typingId = "typing-" + Date.now();
        appendAIMessage("بكتبلك الرد يا فنان... ✍️", "ai", typingId);

        try {
            const response = await fetch("http://localhost:5000/chat", { // تأكد من أن هذا هو عنوان الـ Backend الصحيح
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: originalText }),
            });

            const data = await response.json();

            // إزالة رسالة "بكتبلك الرد"
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            if (response.ok) {
                appendAIMessage(data.response, "ai");
            } else {
                appendAIMessage(`حدث خطأ: ${data.error || "تعذر الحصول على رد من الخادم."}.`, "ai");
            }
        } catch (error) {
            console.error("Error communicating with AI backend:", error);
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            appendAIMessage("عذراً، حدث خطأ أثناء التواصل مع مساعد الزهراء الذكي. يرجى المحاولة مرة أخرى لاحقاً.", "ai");
        }
    };

    // 3. دالة عرض الرسائل (تأكد إنها موجودة)
    function appendAIMessage(text, sender, id = null) {
        const box = document.getElementById("ai-messages-box");
        if (!box) return;
        const div = document.createElement("div");
        if (id) div.id = id;
        const isUser = sender === "user";
        div.style.cssText = `
            max-width: 85%; padding: 12px 16px; margin-bottom: 8px; border-radius: 15px;
            background: ${isUser ? "linear-gradient(135deg,#d4af37,#f0c94e)" : "#1a1a1a"};
            color: ${isUser ? "#000" : "#fff"};
            align-self: ${isUser ? "flex-end" : "flex-start"};
            font-size: 13px; line-height: 1.5; border: ${isUser ? "none" : "1px solid #333"};
            white-space: pre-line; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: inline-block;
        `;
        div.innerText = text;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    // ربط زرار الـ Enter
    document.addEventListener("keypress", function(e) {
        if (e.key === "Enter" && document.activeElement.id === "ai-input") {
            window.askZahraaAI();
        }
    });
</script>
