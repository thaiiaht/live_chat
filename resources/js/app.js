window.openChat = function () {
  document.getElementById('chatCard').style.display = 'block'
  document.getElementById('chatTrigger').style.display = 'none'
}

window.closeChat = function () {
  document.getElementById('chatCard').style.display = 'none'
  document.getElementById('chatTrigger').style.display = 'block'
}


// Post Message
let chatId = null
let ownToken = null
let mainName = null

  window.addEventListener('DOMContentLoaded', () => {
    console.log('Chat iframe loaded')
    window.parent.postMessage({ type: 'ready' }, '*')
  })

window.addEventListener('message', async (event) => {
    const { roomId, token, url } = event.data
      const hostname = new URL(url).hostname
      mainName = hostname.replace(/^www\./, '').split('.')[0]
    chatId = roomId
    ownToken = token
    console.log(ownToken)
    console.log(mainName)
    await listenUser()
    if ( !ownToken || ownToken === 'null') {
      currentUser = getOrCreateGuest()
      ownToken = currentUser.id
      const res = await fetch('/guessJoin', {
        method: 'POST',
        headers: { 'content-Type': 'application/json' },
        body: JSON.stringify({ guestId: currentUser.id, guest: currentUser.sender, role: currentUser.role, mainName }),
      })
      const data = await res.json()
      if (data.status === 'ok') { 
          await initApp()
      } 
    } else {
    const res = await fetch('/join', {
        method: 'POST',
        headers: { 'content-Type': 'application/json' },
        body: JSON.stringify({ token, roomId, mainName }),
    })
    const data = await res.json() 
    if (data.status === 'ok') { 
        await initApp()
    }
  }
})

function getOrCreateGuest() {
  const stored = localStorage.getItem('guestInfo')
  if (stored) return JSON.parse(stored)

  const newGuest = {
    id: 'guest_' + Math.random().toString(36).substring(2, 10),
    sender: 'Guest-' + Math.random().toString(36).substring(2, 6),
    role: 'guest',
  }
  localStorage.setItem('guestInfo', JSON.stringify(newGuest))
  return newGuest
}


let currentUser = null 

import { Transmit } from "@adonisjs/transmit-client"
const transmit = new Transmit({ baseUrl: window.location.origin })

async function listenUser() {
  const sub = transmit.subscription(`join/${mainName}/${ownToken}`)
  sub.onMessage((msg) => { 
    if ( msg.event === 'user_joined') {
      currentUser = msg.data
      console.log( currentUser)
     }})
  await sub.create()
    
}
// Transmit

const form = document.getElementById('form')
const bodyInput = document.getElementById('body')
const messagesEl = document.getElementById('messages')
const emojiBtn = document.getElementById('emojiBtn')

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
  const subscription = transmit.subscription(`/chats/messages/${mainName}/${chatId}`)
  subscription.onMessage((data) => 
    appendMessage(data))
  await subscription.create()

  // Subcribe kênh riêng của user hiện tại
  const userSub = transmit.subscription(`/user/${mainName}/${currentUser.id}`)
    userSub.onMessage((data) => {
      if (data.type === 'blocked') {
        alert( "Bạn đã bị block")
        localStorage.setItem('isBlock', 'true')
        location.reload() 
      }
      else {
        localStorage.setItem('isBlock', 'false')
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

window.addEventListener('DOMContentLoaded', () => {
  console.log(localStorage.getItem('isBlock'))
  if (localStorage.getItem('isBlock') === 'true') {
    bodyInput.style.display = 'none'
    emojiBtn.style.display = 'none'
  }
  else {
    bodyInput.style.display = 'block'
    emojiBtn.style.display = 'block'
  }
})

import { Filter } from 'bad-words'
const filter = new Filter();
const bannedWords = [
  'dm', 'đm', 'địt', 'dit', 'ditme', 'đụ', 'đụmẹ', 'đụ má', 'cl', 'cc', 'vl',
  'cặc', 'lon', 'lồn', 'bitch', 'fuck', 'shit', 'ngu', 'vcl', 'óc'
]

// Hàm bỏ dấu (để so sánh không phân biệt dấu)
function removeDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

// ✅ Hàm lọc tiếng Việt + chặn link
function censorVietnamese(text) {
  let censored = text
  const textNoDiacritics = removeDiacritics(text.toLowerCase())

  // 🔹 1. Chặn từ cấm
  bannedWords.forEach((bad) => {
    const badNoDiacritics = removeDiacritics(bad)
    const regex = new RegExp(`\\b${badNoDiacritics}\\b`, 'gi')
    if (regex.test(textNoDiacritics)) {
      const stars = '*'.repeat(bad.length)
      const replaceRegex = new RegExp(bad, 'gi')
      censored = censored.replace(replaceRegex, stars)
      // thay cả bản không dấu
      const replaceRegexNoSign = new RegExp(badNoDiacritics, 'gi')
      censored = censored.replace(replaceRegexNoSign, stars)
    }
  })

  // 🔹 2. Chặn link
  const linkRegex =
    /((https?:\/\/)|(www\.)|([a-zA-Z0-9-]+\.[a-z]{2,}))(\S*)/gi
  censored = censored.replace(linkRegex, '[link blocked 🔒]')

  return censored
}


// Gửi tin nhắn
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const body = bodyInput.value.trim()
  if (!body) {
    return
  }
  const cleanBody = censorVietnamese(body)
  try {
    console.log( currentUser )
    const res = await fetch(`/chats/messages/${chatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: currentUser.id, sender: currentUser.sender, body: cleanBody, mainName })
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
    if ( currentUser.role === 'admin') {
        el.innerHTML = `<div><i class="fa-solid fa-circle-user fa-xl"></i>
        <small>${new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}</small>
          <b>${escapeHtml(msg.sender)}</b> <p>${escapeHtml(msg.body)}</p></div> 
            <div class="more-btn" onclick="toggleMenu(this)">⋮
              <div class="menu">
                  <div class="block" onclick="blockUser('${msg.senderId}', '${escapeHtml(msg.sender)}')">
                    <i class="fa-solid fa-ban"></i>
                    Block
                  </div>
              </div>
          </div>
          `
    } else {
        el.innerHTML = `<div><i class="fa-solid fa-circle-user fa-xl"></i>
        <small>${new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}</small>
          <b>${escapeHtml(msg.sender)}</b> <p>${escapeHtml(msg.body)}</p></div> `
    }
  } else {
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


// donate 
    const gifts = [
            { amount: 25, name: 'Cà Phê' },
            { amount: 50, name: 'Bữa Sáng' },
            { amount: 100, name: 'Bữa Trưa' },
            { amount: 200, name: 'Game Mới' },
            { amount: 500, name: 'Setup' },
            { amount: 1000, name: 'Mega' }
        ];

        let selectedGifts = new Set();
        let totalAmount = 0;
        let isCardOpen = false;

        export function toggleDonationCard() {
            const card = document.getElementById('donationCard');
            
            if (isCardOpen) {
                closeDonationCard();
            } else {
                card.classList.add('show');
                isCardOpen = true;
            }
        }

        window.toggleDonationCard = toggleDonationCard

        export function closeDonationCard() {
            const card = document.getElementById('donationCard');
            card.classList.remove('show');
            isCardOpen = false;
        }

        window.closeDonationCard = closeDonationCard

        export function selectGift(index, element) {
            const gift = gifts[index];
            
            if (selectedGifts.has(index)) {
                selectedGifts.delete(index);
                element.classList.remove('selected');
                totalAmount -= gift.amount;
            } else {
                selectedGifts.add(index);
                element.classList.add('selected');
                totalAmount += gift.amount;
            }
            
            updateTotal();
        }

        window.selectGift = selectGift

        export function updateTotal() {
            const totalElement = document.getElementById('totalAmount');
            const donateBtn = document.getElementById('donateBtn');
            
            if (totalAmount >= 1000) {
                totalElement.textContent = (totalAmount / 1000) + 'M';
            } else {
                totalElement.textContent = totalAmount + 'K';
            }
            
            if (totalAmount > 0) {
                donateBtn.disabled = false;
                donateBtn.textContent = 'Donate';
            } else {
                donateBtn.disabled = true;
                donateBtn.textContent = 'Chọn quà';
            }
        }

        window.updateTotal = updateTotal

        export async function processDonation() {
            const selectedItems = Array.from(selectedGifts).map(index => gifts[index].name);

            const payload = {
                gift: JSON.stringify(selectedItems),
                total: totalAmount,
                sender: currentUser.sender,
                senderId: currentUser.id,
            };
                await fetch(`/donate/messages/${chatId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                closeDonationCard();
        }

        window.processDonation = processDonation

        // Đóng khi click bên ngoài
        document.addEventListener('click', function(event) {
            const container = document.querySelector('.donate-container');
            if (isCardOpen && !container.contains(event.target)) {
                closeDonationCard();
            }
        });

        // Đóng khi nhấn ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && isCardOpen) {
                closeDonationCard();
            }
        });

