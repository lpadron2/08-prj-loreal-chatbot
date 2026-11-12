/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

let messages = [{role: 'system', content: `You are a friendly L'Oréal product advisor that is very knowledgeable on L'Oréal's extensive product
    cataloge. You help users find helpful and tailormade recommendations and answer questions regarding L'Oréal's products. Keep answers short, but detailed, warm and family-friendly.
    If a user's query is unrelated to L'Oréal's products or skin care, respond by stating you don't know that and that you answer questions pertaining to L'Oréal and skin care.
    Use plain text only. Do not use Markdown symbols such as **, *, or #. If you provide a list, be sure to leave enough space to make it more readable and include - for each list item.
    Lastly, be sure to include emoji's.`}
  ];

  const workerURL = 'https://worker-lo.lpadron.workers.dev/';


/* Handle form submit */
chatForm.addEventListener("submit", async(e) => {
  e.preventDefault();
  const latestQuestion = userInput.value.trim();

  messages.push({ role: 'user', content: latestQuestion });
  chatWindow.textContent = `${latestQuestion}\n\nThinking...`;

  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content

  try{
    const response = await fetch(workerURL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({messages: messages,}),
    });

    if(!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
    }

    const result = await response.json();
    const replyText = result.choices[0].message.content;

    messages.push({ role: 'assistant', content:replyText});

    // Remove bold Markdown markers if the model includes them anyway.
    const readableReply = replyText
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1");

    // Use textContent so the model's response is displayed safely as text.
    chatWindow.textContent = `${latestQuestion}\n\n${readableReply}`;

  } catch(error) {
    console.error('Error', error);
    chatWindow.textContent = "Sorry, something went wrong. Please try again";
  }

  userInput.value = "";

});
