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
const senderId = window.senderId
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
   // Subcribe kênh chat chung
  const subscription = transmit.subscription(`/chats/messages/${chatId}`)
  subscription.onMessage((data) => 
    appendMessage(data))
  await subscription.create()

  // Subcribe kênh riêng của user hiện tại
  const userSub = transmit.subscription(`/user/${senderId}`)
    userSub.onMessage((data) => {
      if (data.type === 'blocked') {
        alert( "Bạn đã bị block")
        location.reload() 
      }
    })
    await userSub.create()
  
    // Kênh xoá tin nhắn
    const deletedSub = transmit.subscription('messages: deleted')
    deletedSub.onMessage(({ senderId }) => {
      document.querySelectorAll(`[data-sender="${senderId}"]`).forEach(el => el.remove())
    })
    await deletedSub.create()
  }
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
      body: JSON.stringify({ senderId: senderId, sender: guestName, body })
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
    el.setAttribute('data-sender', msg.senderId || '')
      el.classList.add('user-message')
      el.style.color = 'black'
      el.innerHTML = `<div><i class="fa-solid fa-circle-user fa-xl"></i>
      <small>${new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}</small>
        <b>${escapeHtml(msg.sender)}</b> <p>${escapeHtml(msg.body)}</p></div> 
          <div class="more-btn" onclick="toggleMenu(this)">⋮
            <div class="menu">
                <div class="setMod" onclick="setMod()">
                  <i class="fa-solid fa-wrench" style="color: #74C0FC;"></i>
                  Set Mod
                </div>
                <div class="block" onclick="blockUser('${msg.senderId}', '${escapeHtml(msg.sender)}')">
                  <i class="fa-solid fa-ban"></i>
                  Block
                </div>
            </div>
        </div>
        `
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

document.addEventListener('click', function(event) {
  if (!event.target.closest('.more-btn')) {
      closeAllMenus();
  }
});

window.toggleMenu = function (button) {
  event.stopPropagation(); // Ngăn event bubbling
  
  // Đóng tất cả menu khác
  closeAllMenus();
  
  // Toggle menu hiện tại
  const menu = button.querySelector('.menu');
  if (menu.style.display === 'block') {
      menu.style.display = 'none';
  } else {
      menu.style.display = 'block';
      
// Kiểm tra nếu menu bị tràn ra ngoài màn hình
        const rect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
      
      // Nếu menu tràn bên trái, hiển thị bên phải
      if (rect.left < 0) {
          menu.style.right = 'auto';
          menu.style.left = 'calc(100% + 5px)';
      }

      // Nếu menu tràn xuống dưới, hiển thị lên trên
      if (rect.bottom > windowHeight) {
          menu.style.top = 'auto';
          menu.style.bottom = '0';
      }
  }
}

window.closeAllMenus = function() {
  const allMenus = document.querySelectorAll('.menu');
  allMenus.forEach(menu => {
      menu.style.display = 'none';
      // Reset position
      menu.style.right = 'calc(100% + 5px)'; 
      menu.style.left = 'auto';  
      menu.style.top = '0';
      menu.style.bottom = 'auto';
  });
}

window.setMod = function () {
  alert('Đã set mod!');
  closeAllMenus();
}

window.blockUser= async function (targetId, targetName) {
  const res = await fetch('/block', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId: targetId, sender: targetName }),
  })
    alert('Đã chặn người dùng!');
    closeAllMenus();
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