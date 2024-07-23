// public/js/signup.js
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');

signupForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const fullName = signupForm.fullName.value;
    const Email = signupForm.Email.value;
    const Password = signupForm.Password.value;

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, Email, Password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Signup failed');
        }

        const userData = await response.json();
        const token = userData.token;

        // Store token in localStorage
        localStorage.setItem('token', token);

        alert('Signup successful! Redirecting to login page.');
        window.location.href = '/login'; // Redirect to login page after successful signup
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
});
