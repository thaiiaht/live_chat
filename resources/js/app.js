window.openChat = function () {
  document.getElementById('chatCard').style.display = 'block'
  document.getElementById('chatTrigger').style.display = 'none'
}

window.closeChat = function () {
  document.getElementById('chatCard').style.display = 'none'
  document.getElementById('chatTrigger').style.display = 'block'
}

import { Transmit } from "@adonisjs/transmit-client"

const chatId = window.roomId
const form = document.getElementById('form')
const bodyInput = document.getElementById('body')
const guestName = window.guestName
const messagesEl = document.getElementById('messages')
const transmit = new Transmit({ baseUrl: window.location.origin })


// Load 50 tin nhắn đầu 
async function loadHistory() {
  try {
    const res = await fetch(`/chats/messages/${chatId}`)
    const messages = await res.json()
    messages.forEach((msg) => appendMessage(msg))
  } catch (err) {
    console.error('load history failed', err)
  }
}

// Subscribe realtime
async function initRealtime() {
try {
  const subscription = transmit.subscription(`/chats/messages/${chatId}`)
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
  if (!body) {
    return
  }
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
  if (msg.type === 'user') {
  el.classList.add('user-message')
  el.style.color = 'black'
  el.innerHTML = `<i class="fa-solid fa-circle-user fa-xl"></i>
  <small>${new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}</small>
    <b>${escapeHtml(msg.sender)}</b> <p>${escapeHtml(msg.body)}</p>`
  } 
  else {
  el.classList.add('donate-message');
  el.innerHTML = `<small>${new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}</small>
  <i class="fa-solid fa-coins fa-xl" style="color: #FFD43B;"></i>
  <p>${escapeHtml(msg.body)}</p>`
  }
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
async function initApp() {
  await loadHistory()
  await initRealtime()
}

initApp()