(function() {
  'use strict';
  
  let form_errors = [];
  
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const commentsInput = document.getElementById('comments');
  const charCounter = document.getElementById('char-counter');
  const errorOutput = document.getElementById('error-output');
  const infoOutput = document.getElementById('info-output');
  const formErrorsField = document.getElementById('form-errors-field');
  
  function updateCharCounter() {
    const maxLength = parseInt(commentsInput.getAttribute('maxlength'));
    const currentLength = commentsInput.value.length;
    const remaining = maxLength - currentLength;
    
    charCounter.textContent = `${remaining} characters remaining`;
    charCounter.classList.remove('warning', 'error');
    
    if (remaining <= 100 && remaining > 0) {
      charCounter.classList.add('warning');
    } else if (remaining <= 0) {
      charCounter.classList.add('error');
      charCounter.textContent = 'Character limit reached!';
    }
  }
  
  function setupInputMasking(input) {
    const pattern = input.getAttribute('data-pattern');
    if (!pattern) return;
    
    const regex = new RegExp(`^${pattern}$`);
    
    input.addEventListener('keypress', function(e) {
      const char = e.key;
      if (char.length > 1) return;
      
      if (!regex.test(char) && char !== ' ') {
        e.preventDefault();
        input.classList.add('flash-error');
        setTimeout(() => input.classList.remove('flash-error'), 500);
        showError(`Invalid character: "${char}" is not allowed in this field.`);
        logError(input.id, 'invalid_character', `User attempted to enter invalid character: ${char}`);
      }
    });
  }
  
  function setCustomValidation(input) {
    input.addEventListener('blur', function() {
      if (!input.checkValidity()) {
        const validity = input.validity;
        let message = '';
        
        if (validity.valueMissing) {
          message = `${input.labels[0].textContent.replace('*', '').trim()} is required.`;
          logError(input.id, 'value_missing', message);
        } else if (validity.tooShort) {
          message = `${input.labels[0].textContent.replace('*', '').trim()} must be at least ${input.minLength} characters.`;
          logError(input.id, 'too_short', message);
        } else if (validity.tooLong) {
          message = `${input.labels[0].textContent.replace('*', '').trim()} must be no more than ${input.maxLength} characters.`;
          logError(input.id, 'too_long', message);
        } else if (validity.typeMismatch) {
          message = `Please enter a valid ${input.type}.`;
          logError(input.id, 'type_mismatch', message);
        } else if (validity.patternMismatch) {
          message = `${input.labels[0].textContent.replace('*', '').trim()} contains invalid characters.`;
          logError(input.id, 'pattern_mismatch', message);
        }
        
        input.setCustomValidity(message);
        showError(message);
      } else {
        input.setCustomValidity('');
        if (input.value.trim() !== '') {
          showInfo(`${input.labels[0].textContent.replace('*', '').trim()} looks good!`);
        }
      }
    });
    
    input.addEventListener('input', function() {
      input.setCustomValidity('');
    });
  }
  
  function logError(fieldId, errorType, errorMessage) {
    const timestamp = new Date().toISOString();
    const errorEntry = {
      field: fieldId,
      error_type: errorType,
      message: errorMessage,
      timestamp: timestamp
    };
    
    const existingIndex = form_errors.findIndex(
      e => e.field === fieldId && e.error_type === errorType
    );
    
    if (existingIndex === -1) {
      form_errors.push(errorEntry);
    } else {
      form_errors[existingIndex].timestamp = timestamp;
    }
  }
  
  function showError(message) {
    errorOutput.textContent = message;
    errorOutput.classList.remove('fade-out');
    setTimeout(() => {
      errorOutput.classList.add('fade-out');
      setTimeout(() => {
        errorOutput.textContent = '';
        errorOutput.classList.remove('fade-out');
      }, 500);
    }, 3000);
  }
  
  function showInfo(message) {
    infoOutput.textContent = message;
    infoOutput.classList.remove('fade-out');
    setTimeout(() => {
      infoOutput.classList.add('fade-out');
      setTimeout(() => {
        infoOutput.textContent = '';
        infoOutput.classList.remove('fade-out');
      }, 500);
    }, 2000);
  }
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    errorOutput.textContent = '';
    infoOutput.textContent = '';
    
    let isValid = true;
    const inputs = [nameInput, emailInput, phoneInput, commentsInput];
    
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        isValid = false;
        const validity = input.validity;
        let message = '';
        
        if (validity.valueMissing) {
          message = `${input.labels[0].textContent.replace('*', '').trim()} is required.`;
          logError(input.id, 'value_missing', message);
        } else if (validity.tooShort) {
          message = `${input.labels[0].textContent.replace('*', '').trim()} must be at least ${input.minLength} characters.`;
          logError(input.id, 'too_short', message);
        } else if (validity.tooLong) {
          message = `${input.labels[0].textContent.replace('*', '').trim()} must be no more than ${input.maxLength} characters.`;
          logError(input.id, 'too_long', message);
        } else if (validity.typeMismatch) {
          message = `Please enter a valid ${input.type}.`;
          logError(input.id, 'type_mismatch', message);
        }
        
        showError(message);
      }
    });
    
    if (!isValid) {
      showError('Please fix the errors before submitting.');
      return;
    }
    
    formErrorsField.value = JSON.stringify(form_errors);
    showInfo('Form is valid! Submitting...');
    setTimeout(() => form.submit(), 1000);
  });
  
  updateCharCounter();
  commentsInput.addEventListener('input', updateCharCounter);
  setupInputMasking(nameInput);
  setupInputMasking(phoneInput);
  setCustomValidation(nameInput);
  setCustomValidation(emailInput);
  setCustomValidation(phoneInput);
  setCustomValidation(commentsInput);
})();
