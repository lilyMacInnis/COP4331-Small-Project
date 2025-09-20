// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone validation regex (flexible for various formats)
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

const urlBase = 'http://cop4331projectdomain.xyz/LAMPAPI';
const extension = 'php';

function validateField(fieldId, inputId, errorId, validationFn, errorMessage) {
    const input = document.getElementById(inputId);
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    const isValid = validationFn(input.value.trim());
    
    if (!isValid) {
        error.textContent = errorMessage;
        error.style.display = "block";
        field.style.backgroundColor = "rgba(255,0,0,0.5)";
        field.style.paddingBottom = "0.3vh";
        input.style.backgroundColor = "rgba(255,0,0,0.1)";
        return false;
    } else {
        error.style.display = "none";
        field.style.backgroundColor = "rgba(0,0,0,0)";
        field.style.paddingBottom = "1vh";
        input.style.backgroundColor = "rgba(0,0,0,0)";
        return true;
    }
}

function validateForm() {
    let isValid = true;
    
    // Check if user is logged in
    const userId = getUserId();
    if (!userId) {
        return false; // getUserId() already handles the redirect
    }
    
    // Validate first name
    isValid = validateField(
        'createFname', 
        'createFnameInput', 
        'fnRequirement',
        (value) => value.length > 0,
        '*First name must include at least 1 character.'
    ) && isValid;
    
    // Validate last name
    isValid = validateField(
        'createLname', 
        'createLnameInput', 
        'lnRequirement',
        (value) => value.length > 0,
        '*Last name must include at least 1 character.'
    ) && isValid;
    
    // Validate email
    isValid = validateField(
        'createEmail', 
        'createEmailInput', 
        'emRequirement',
        (value) => emailRegex.test(value),
        '*Please enter a valid email address.'
    ) && isValid;
    
    // Validate phone
    const phoneValue = document.getElementById('createPhoneInput').value.trim().replace(/[\s\-\(\)]/g, '');
    isValid = validateField(
        'createPhone', 
        'createPhoneInput', 
        'phoneRequirement',
        (value) => {
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
            return cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone);
        },
        '*Please enter a valid phone number (10-15 digits).'
    ) && isValid;
    
    return isValid;
}

function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    element.style.color = isError ? 'red' : 'green';
    
    // Hide the message after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function clearMessages() {
    document.getElementById('generalError').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

function handleCreateContact() {
    clearMessages();
    
    // Validate form first
    if (!validateForm()) {
        showMessage('generalError', 'Please fix the errors above.', true);
        return;
    }
    
    // Disable button during submission
    const button = document.getElementById('createBtn');
    const originalText = button.textContent;
    button.textContent = 'Creating...';
    button.disabled = true;
    
    // Get form data
    const contactData = {
        FirstName: document.getElementById('createFnameInput').value.trim(),
        LastName: document.getElementById('createLnameInput').value.trim(),
        Email: document.getElementById('createEmailInput').value.trim(),
        Phone: document.getElementById('createPhoneInput').value.trim(),
        UserID: getUserId() // Gets user ID from localStorage
    };

	let jsonPayload = JSON.stringify(contactData);
	
	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				showMessage('successMessage', 'Contact created successfully!');
                // Clear the form
                document.getElementById('contactForm').reset();
                window.location.href = 'contacts.html';
			}else {
                if (result.field) {
                    handleServerFieldError(result.field, result.error);
                } else {
                    showMessage('generalError', result.error || 'Failed to create contact.', true);
                }
            }
		};
		xhr.send(jsonPayload);
	}
	catch(error)
	{
		console.error('Error creating contact:', error);
        showMessage('generalError', 'Network error. Please try again.', true);
	}finally {
        // Re-enable button
        button.textContent = originalText;
        button.disabled = false;
    }
}

function handleServerFieldError(field, message) {
    const fieldMapping = {
        'FirstName': { field: 'createFname', input: 'createFnameInput', error: 'fnRequirement' },
        'LastName': { field: 'createLname', input: 'createLnameInput', error: 'lnRequirement' },
        'Email': { field: 'createEmail', input: 'createEmailInput', error: 'emRequirement' },
        'Phone': { field: 'createPhone', input: 'createPhoneInput', error: 'phoneRequirement' }
    };
    
    const mapping = fieldMapping[field];
    if (mapping) {
        document.getElementById(mapping.error).textContent = message;
        document.getElementById(mapping.error).style.display = 'block';
        document.getElementById(mapping.field).style.backgroundColor = 'rgba(255,0,0,0.5)';
        document.getElementById(mapping.input).style.backgroundColor = 'rgba(255,0,0,0.1)';
    } else {
        showMessage('generalError', message, true);
    }
}

function getUserId() {
    const userId = localStorage.getItem('userId');
    
    if (!userId || userId < 1) {
        alert('You must be logged in to add contacts.');
        window.location.href = 'login.html';
        return null;
    }
    
    return parseInt(userId);
}

// Mobile image handling
function changeBgForMobile() {
    let registerImage = document.getElementById('signupBook');
    
    if (window.innerWidth <= 768) {
        registerImage.src = 'images/register_bg_mobile.png';
    } else {
        registerImage.src = 'images/signup_bg.png';
    }
}

window.addEventListener('load', changeBgForMobile);
window.addEventListener('resize', changeBgForMobile);

// Add real-time validation on blur
document.getElementById('createFnameInput').addEventListener('blur', () => {
    validateField('createFname', 'createFnameInput', 'fnRequirement', 
        (value) => value.length > 0, '*First name must include at least 1 character.');
});

document.getElementById('createLnameInput').addEventListener('blur', () => {
    validateField('createLname', 'createLnameInput', 'lnRequirement', 
        (value) => value.length > 0, '*Last name must include at least 1 character.');
});

document.getElementById('createEmailInput').addEventListener('blur', () => {
    validateField('createEmail', 'createEmailInput', 'emRequirement', 
        (value) => emailRegex.test(value), '*Please enter a valid email address.');
});

document.getElementById('createPhoneInput').addEventListener('blur', () => {
    validateField('createPhone', 'createPhoneInput', 'phoneRequirement', 
        (value) => {
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
            return cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone);
        }, '*Please enter a valid phone number (10-15 digits).');
});