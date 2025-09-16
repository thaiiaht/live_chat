// login
function openLogin() {
  document.getElementById('loginModal').style.display = 'block';
}
function closeLogin() {
  document.getElementById('loginModal').style.display = 'none';
}

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
            resources/js(`Email hoặc mật khẩu không đúng!`)
            return
        }

    const data = await res.json()

    alert('Đăng nhập thành công!')
    localStorage.setItem('token', data.token)
    document.getElementById('loginModal').style.display = 'none';
    await window.location.reload()

})

async function logout() {
  const res = await fetch('/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    }
  })
  if (res.ok) {
    localStorage.removeItem("token") 
    window.location.reload()
  } else {
    console.error("Logout failed", res.status)
  }
}


// register
function openRegister() {
  document.getElementById('registerModal').style.display = 'block';
}
function closeRegister() {
  document.getElementById('registerModal').style.display = 'none';
}

// document.getElementById('registerForm').addEventListener('submit', (e) => {
//   e.preventDefault()
//   const email = document.getElementById('email').value
//   const password = document.getElementById('password').value
//   console.log("Login with:", email, password)
//   // TODO: gọi API login
// })

async function checkMe() {
    const token = localStorage.getItem('token');
    if(!token) return;

    try {
        const res = await fetch('/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
    } catch(err) {
        console.error(err);
    }
}

function showUser(user) {
  if (user) {
    document.getElementById('username').textContent = user.fullName;
    document.getElementById('userDiv').style.display = 'block';
    document.getElementById('loginDiv').style.display = 'none';
    document.getElementById('registerDiv').style.display = 'none';
  }
  else {
    document.getElementById('userDiv').style.display = 'none';
    document.getElementById('loginDiv').style.display = 'block';
    document.getElementById('registerDiv').style.display = 'block';
  }
}

async function initApp() {
  const user = await checkMe();
  showUser(user);
}

initApp();