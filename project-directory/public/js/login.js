// public/js/login.js
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const Email = loginForm.Email.value;
    const Password = loginForm.Password.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Email, Password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const { user, token } = await response.json();

        // Store token in local storage
        localStorage.setItem('token', token);

        // Redirect to personalized dashboard with user id
        const userId = user.id;
        alert('Login successful! Redirecting to dashboard.');
        window.location.href = `/dashboard/${userId}`;

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
});
