
// login
window.openLogin = function () {
  document.getElementById('loginModal').style.display = 'block';
}
window.closeLogin = function () {
  document.getElementById('loginModal').style.display = 'none';
}

const loginForm = window.loginForm
const registerForm = window.registerForm
if( loginForm) {

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  console.log("Login with:", email, password)

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        redirect: 'manual',
    })

        if (!res.ok) {
            console.log("❌ LOGIN FAILED - HTTP error")
            alert(`Email hoặc mật khẩu không đúng!`)
            return
        }
        
    alert('Đăng nhập thành công!')
    document.getElementById('loginModal').style.display = 'none';
    await window.location.reload()

})

}
// logout

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault()
      fetch('/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/')
        .catch((err) => console.error(err))
    })
  }
})


// register
window.openRegister = function () {
  document.getElementById('registerModal').style.display = 'block';
}
window.closeRegister = function () {
  document.getElementById('registerModal').style.display = 'none';
}

if ( registerForm ) {
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const fullName = document.getElementById('fullName').value
  const email = document.getElementById('emailR').value
  const password = document.getElementById('passwordR').value

  const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
        redirect: 'manual',
    })
        if (!res.ok) {
            console.log("❌ LOGIN FAILED - HTTP error")
            alert(`Email hoặc mật khẩu không đúng!`)
            return
        }

    alert('Đăng ký thành công!')
    document.getElementById('loginModal').style.display = 'none';
    await window.location.reload()

})
}