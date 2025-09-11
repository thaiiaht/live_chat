import { Transmit } from "@adonisjs/transmit-client"

const chatId = window.roomId
const guestName = window.guestName
const messagesEl = document.getElementById('messages')
const form = document.getElementById('form')
const bodyInput = document.getElementById('body')
const transmit = new Transmit({ baseUrl: window.location.origin })

// Open popup donate

function donate() {
  document.getElementById('registerModal').style.display = 'block';
}


// Load 50 tin nhắn đầu
async function loadHistory() {
  try {
    const res = await fetch(`/chats/messages/${chatId}`)
    const messages = await res.json() // giờ trả mảng trực tiếp
    messages.forEach(msg => appendMessage(msg))
  } catch (err) {
    console.error('load history failed', err)
  }
}

// Subscribe realtime
async function initRealtime() {
try {
  const subscription = transmit.subscription(`/chats/messages/${chatId}`)
  console.log('Creating subscription for chatId:', chatId)

  subscription.onMessage((data) => 
    appendMessage(data))
  await subscription.create()}
  catch (err) {
    console.error('Subscription failed', err)
  }
}

// Gửi tin nhắn
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const body = bodyInput.value.trim()
  if (!body) return
  try {
    const res = await fetch(`/chats/messages/${chatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: guestName, body })
    })
    if (res.ok) bodyInput.value = ''
  } catch (err) {
    console.error(err)
  }
})

// Render message
function appendMessage(msg) {
  const el = document.createElement('div')
  el.style.color = 'black'
  el.innerHTML = `<small>${new Date(msg.createdAt).toLocaleTimeString()}</small>
    <b>${escapeHtml(msg.sender)}:</b> ${escapeHtml(msg.body)}`
  messagesEl.appendChild(el)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

// Escape XSS
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  )
}

// Init
await loadHistory()
await initRealtime()
