import { mainName } from './app.js'

document.addEventListener('click', async (e) => {
  if (e.target.matches('.btn-block')) {
    const id = e.target.dataset.id
    const name = e.target.dataset.name

    const res = await fetch('/block', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: id, sender: name, mainName }),
    })

    alert(`Đã chặn người dùng: ${name}`)
    localStorage.setItem('isBlock', 'true')
    window.location.reload()
  }
})


document.addEventListener('click', async (e) => {
  if (e.target.matches('.btn-unblock')) {
    const id = e.target.dataset.id
    const name = e.target.dataset.name

    const res = await fetch('/unblock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: id, sender: name, mainName }),
    })
    alert(`Đã bỏ chặn người dùng: ${name}`)
    localStorage.setItem('isBlock', 'false')
    window.location.reload()
  }
})