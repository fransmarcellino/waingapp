const chat = document.getElementById("chat");

let messages = [];

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value;

  if (!text) return;

  // encrypt
  const encrypted = await encryptMessage(text);

  // simpan (simulasi kirim ke server)
  messages.push(encrypted);

  render();

  input.value = "";
}

async function render() {
  chat.innerHTML = "";

  for (let msg of messages) {
    const text = await decryptMessage(msg);

    const div = document.createElement("div");
    div.className = "msg";
    div.innerText = text;

    chat.appendChild(div);
  }
}
