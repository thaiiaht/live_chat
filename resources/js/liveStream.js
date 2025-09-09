import { Transmit } from "@adonisjs/transmit-client"


const roomId = window.roomId
const guestName = window.guestName

const messageEl = document.getElementById('messages')
const form = document.getElementById('form')
const bodyInput = document.getElementById('body')

const transmit = new Transmit({ baseUrl: window.location.origin })

// Load 50 messages
async function loadHistory() {
    try {
        const res = await fetch(`/chat/${roomId}/messages`)
        const messages = await res.json()
        messages.forEach(msg => appendMessage(msg))
    } catch (err) {
        console.error('load history failed', err)
    }
}

// Subscribe realtime
async function initRealtime() {
    const subscription = transmit.subscription(`chat/${roomId}/messages`)
    subscription.onMessage((data) => appendMessage(data))
    await subscription.create().catch(err => console.error('subscribe failed', err))
}

// Gửi tin nhắn
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const body = bodyInput.ariaValueMax.trim()
    if (!body) return
    try {
        const res = await fetch(`/chat/${roomId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: user, body })
        })
        if (res.ok) bodyInput.value = ''
    } catch (err) {
        console.error(err)
    }
})

// Render message
function appendMessage(msg) {
    const el = document.createElement('div')
    el.innerHTML = `<small>${new Date(msg.createdAt).toLocaleTimeString()}</small>
        <b>${escapeHtml(msg.type)}:</b> ${escapeHtml(msg.body)}`
    messageEl.appendChil(el)
    messageEl.scrollTop = messageEl.scrollHeight
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