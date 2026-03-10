const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submitBtn');

// A simple regular expression to check if an email looks like "name@domain.com"
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to validate the whole form to enable/disable the submit button
function checkFormValidity() {
    if (usernameInput.classList.contains('valid') && emailInput.classList.contains('valid')) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// 1. Username Validation
usernameInput.addEventListener('input', () => {
    const value = usernameInput.value.trim();
    
    if (value.length >= 4) {
        usernameInput.classList.remove('invalid');
        usernameInput.classList.add('valid');
    } else {
        usernameInput.classList.remove('valid');
        usernameInput.classList.add('invalid');
    }
    checkFormValidity();
});

// 2. Email Validation
emailInput.addEventListener('input', () => {
    const value = emailInput.value.trim();
    
    if (emailRegex.test(value)) {
        emailInput.classList.remove('invalid');
        emailInput.classList.add('valid');
    } else {
        emailInput.classList.remove('valid');
        emailInput.classList.add('invalid');
    }
    checkFormValidity();
});