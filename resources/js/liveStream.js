import { Transmit } from "@adonisjs/transmit-client"

const chatId = window.roomId
const guestName = window.guestName
const messagesEl = document.getElementById('messages')
const form = document.getElementById('form')
const bodyInput = document.getElementById('body')

let lastGuestMessageAt = null
const GUEST_COOLDOWN = 60 * 1000 // 1 phút
let accessToken = null
let currentUser = null

const transmit = new Transmit({ baseUrl: window.location.origin })

// Load 50 tin nhắn đầu
async function loadHistory() {
  try {
    const res = await fetch(`/chats/messages/${chatId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
    if (!res.ok) throw new Error(await res.text())
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
  if (!body) return

   // Nếu là guest thì check cooldown
  if (!accessToken) {
    const now = Date.now()
    if (lastGuestMessageAt && (now - lastGuestMessageAt) < GUEST_COOLDOWN) {
      const remaining = Math.ceil((GUEST_COOLDOWN - (now - lastGuestMessageAt)) / 1000)
      alert(`Bạn phải chờ ${remaining} giây nữa mới được chat tiếp!`)
      return
    }
    lastGuestMessageAt = now
  }
  try {
    const payload = accessToken 
    ? { body, sender: currentUser ? (currentUser.fullName || currentUser.email) : undefined } 
    : { body, sender: guestName }

    const res = await fetch(`/chats/messages/${chatId}`, {
      method: 'POST',
      headers: { 
      'Content-Type': 'application/json' ,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}`} : {}),
      },
      body: JSON.stringify(payload),
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
  el.style.color = 'black'
  el.innerHTML = `<small>${new Date(msg.createdAt).toLocaleTimeString()}</small>
    <b>${escapeHtml(msg.sender)}:</b> ${escapeHtml(msg.body)}`
  } 
  else {
  el.classList.add('donate-message');
  el.innerHTML = `🎁 ${escapeHtml(msg.body)}`
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
  currentUser = await checkMe()
  accessToken = localStorage.getItem('token')

  await loadHistory()
  await initRealtime()
}

await initApp()