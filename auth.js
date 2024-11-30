// التحقق من حالة تسجيل الدخول
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'login.html';
    }
}

// تسجيل الدخول
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            }));
            window.location.href = 'index.html';
        } else {
            alert('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
    });
}

// إنشاء حساب جديد
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('كلمتا المرور غير متطابقتين');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(u => u.email === email)) {
            alert('البريد الإلكتروني مستخدم بالفعل');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        localStorage.setItem('currentUser', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }));

        window.location.href = 'index.html';
    });
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// التحقق من حالة تسجيل الدخول عند تحميل الصفحة
checkAuth();
