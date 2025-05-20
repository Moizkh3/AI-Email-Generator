// Add event listener to prevent form submission
document.getElementById('emailForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission
  generateEmail(); // Call the generate email function
});

async function generateEmail() {
    const recipient = document.getElementById("recipient").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const tone = document.getElementById("tone").value.trim();
    const details = document.getElementById("details").value.trim();
    const output = document.getElementById("output");
  
    // ✅ Validate inputs before calling API
    if (!recipient || !subject || !details) {
      output.textContent = "⚠️ Please fill in all required fields (recipient, subject, and details).";
      return; // stop the function
    }
  
    output.textContent = "⏳ Generating email...";
  
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that generates professional, friendly, or apologetic emails based on user input.",
      },
      {
        role: "user",
        content: `Write a ${tone.toLowerCase()} email to ${recipient} with subject "${subject}". Details: ${details}`,
      }
    ];
  
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer ", // 👈 Replace with your API key
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourdomain.com",
          "X-Title": "Smart Email Generator"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-zero:free",
          messages: messages
        })
      });
  
      const data = await res.json();
  
      if (data.choices && data.choices.length > 0) {
        let content = data.choices[0].message.content.trim();
      
        // Format for HTML display
        content = content
          .replace(/```text|```/g, '')           // Remove any code block markers
          .replace(/\\boxed\s*{/, '')            // Cleanup latex-like outputs
          .replace(/}$/, '')
          .trim()
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **bold** to <strong>bold</strong>
          .replace(/^\s*(\d+)\.\s*(.*)$/gm, '<ol><li>$2</li></ol>') // Convert numbered lists
          .replace(/<\/ol>\s*<ol>/g, '') // Clean up consecutive <ol> tags from list conversion
          .replace(/\n/g, '<br>');               // Convert newlines to <br>
      
        output.innerHTML = `
          <div class="email-preview">
            ${content}
          </div>
        `;
      } else {
        output.textContent = "⚠️ No response from AI.";
      }
      
    } catch (err) {
      output.textContent = "❌ Error: " + err.message;
    }
  }
  