function initializePayment() {
    const bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
    if (!bookingDetails) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    displayTicketPreview(bookingDetails);
    displayBookingSummary(bookingDetails);

    // Add input listeners for payment form validation
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    const upiId = document.getElementById('upiId');

    cardNumber.addEventListener('input', formatCardNumber);
    expiryDate.addEventListener('input', formatExpiryDate);
    cardNumber.addEventListener('blur', validateCardNumber);
    expiryDate.addEventListener('blur', validateExpiryDate);
    cvv.addEventListener('blur', validateCVV);
    upiId.addEventListener('blur', validateUPIId);

    // Add input event listeners for real-time validation
    document.querySelector('.pay-now-btn').disabled = true;
    
    const inputs = {
        card: ['cardNumber', 'expiryDate', 'cvv', 'cardName'],
        upi: ['upiId']
    };

    Object.entries(inputs).forEach(([method, fields]) => {
        fields.forEach(field => {
            const input = document.getElementById(field);
            input.addEventListener('input', () => validateForm(method));
        });
    });
}

function displayTicketPreview(booking) {
    const ticketPreview = document.getElementById('ticketSummary');
    
    ticketPreview.innerHTML = `
        <div class="ticket-content">
            <div class="ticket-left">
                <img src="${booking.movie.poster_path}" alt="${booking.movie.title}">
            </div>
            <div class="ticket-info">
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Movie</span>
                    <span class="ticket-info-value">${booking.movie.title}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Date</span>
                    <span class="ticket-info-value">${new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Time</span>
                    <span class="ticket-info-value">${booking.time}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Theater</span>
                    <span class="ticket-info-value">${booking.theater.name}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Seats</span>
                    <span class="ticket-info-value">${booking.seats.map(seat => seat.id).join(', ')}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Amount</span>
                    <span class="ticket-info-value">₹${booking.total}</span>
                </div>
            </div>
        </div>
    `;
}

function displayBookingSummary(booking) {
    const summaryDetails = document.getElementById('summaryDetails');
    const totalAmount = booking.total;
    
    summaryDetails.innerHTML = `
        <div class="summary-row">
            <span>Movie</span>
            <span>${booking.movie.title}</span>
        </div>
        <div class="summary-row">
            <span>Date & Time</span>
            <span>${new Date(booking.date).toLocaleDateString()} at ${booking.time}</span>
        </div>
        <div class="summary-row">
            <span>Theater</span>
            <span>${booking.theater.name}</span>
        </div>
        <div class="summary-row">
            <span>Seats</span>
            <span>${booking.seats.map(seat => seat.id).join(', ')}</span>
        </div>
        <div class="summary-row total">
            <span>Total Amount</span>
            <span>₹${totalAmount}</span>
        </div>
    `;

    document.getElementById('totalAmount').textContent = `₹${totalAmount}`;
}

function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-option').forEach(el => {
        el.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    document.getElementById('cardPayment').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('upiPayment').style.display = method === 'upi' ? 'block' : 'none';
}

const VALID_UPI_HANDLES = ['sbi', 'icici', 'ybl', 'bob', 'axis', 'hdfc', 'kotak', 'paytm'];
let paymentAttempts = 0;

function validateUpiId(upiId) {
    const upiRegex = /^([0-9]{10}|[a-zA-Z0-9._-]+)@([a-zA-Z]+)$/;
    if (!upiRegex.test(upiId)) {
        showToast('Invalid UPI ID format', 'error');
        return false;
    }

    const [, , handle] = upiId.match(upiRegex);
    if (!VALID_UPI_HANDLES.includes(handle.toLowerCase())) {
        showToast(`Invalid UPI handle. Use: ${VALID_UPI_HANDLES.join(', ')}`, 'error');
        return false;
    }
    return true;
}

function detectCardType(cardNumber) {
    const patterns = {
        VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
        MASTERCARD: /^5[1-5][0-9]{14}$/,
        RUPAY: /^6[0-9]{15}$/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(cardNumber)) return type;
    }
    return null;
}

function updateCardTypeUI(cardNumber) {
    const cardType = detectCardType(cardNumber);
    const cardLabel = document.querySelector('.card-type');
    if (cardLabel) {
        cardLabel.textContent = cardType || 'Invalid Card';
        cardLabel.className = `card-type ${cardType ? 'valid' : 'invalid'}`;
    }
}

function formatCardNumber(e) {
    // Only allow numbers and limit to 16 digits
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = value;
    
    // Update card type UI
    const cardType = detectCardType(value);
    updateCardTypeUI(value);

    // Show visual feedback when complete
    e.target.classList.toggle('complete', value.length === 16);
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
    validateExpiryDate(e);
}

function validateCardNumber(e) {
    const cardNumber = e.target.value;
    const cardType = detectCardType(cardNumber);
    let errorMessage = '';
    
    const isValid = cardNumber.length === 16 && cardType;
    toggleFieldValidation(e.target, isValid, errorMessage);
    e.target.classList.toggle('complete', isValid);
    validateForm('card');
    return isValid;
}

function validateExpiryDate(e) {
    const value = e.target.value;
    const [month, year] = value.split('/').map(n => parseInt(n));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    let errorMessage = '';

    const isValid = /^\d{2}\/\d{2}$/.test(value) && 
                   month >= 1 && month <= 12 && 
                   (year > currentYear || (year === currentYear && month >= currentMonth));

    toggleFieldValidation(e.target, isValid, errorMessage);
    e.target.classList.toggle('complete', isValid);
    validateForm('card');
    return isValid;
}

function validateCVV(e) {
    const value = e.target.value;
    let errorMessage = '';
    const isValid = /^\d{3}$/.test(value);

    toggleFieldValidation(e.target, isValid, errorMessage);
    e.target.classList.toggle('complete', isValid);
    validateForm('card');
    return isValid;
}

function validateUPIId(e) {
    const value = e.target.value;
    const upiRegex = /^([0-9]{10}|[a-zA-Z0-9._-]+)@([a-zA-Z]+)$/;
    let errorMessage = '';
    const [, , handle] = (value.match(upiRegex) || []);
    const isValid = upiRegex.test(value) && VALID_UPI_HANDLES.includes(handle?.toLowerCase());

    toggleFieldValidation(e.target, isValid, errorMessage);
    e.target.classList.toggle('complete', isValid);
    validateForm('upi');
    return isValid;
}

function toggleFieldValidation(element, isValid, errorMessage) {
    const inputGroup = element.closest('.form-group');
    const existingError = inputGroup.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    element.classList.toggle('invalid', !isValid);
    
    if (!isValid) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
        inputGroup.appendChild(errorElement);
    }
}

function validateForm(method) {
    const btn = document.querySelector('.pay-now-btn');
    let isValid = true;

    if (method === 'card') {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');

        // Remove cardName validation, only check other fields
        isValid = cardNumber.value.replace(/\s/g, '').length === 16 &&
                 /^\d{2}\/\d{2}$/.test(expiryDate.value) &&
                 /^\d{3}$/.test(cvv.value);

        // Add visual feedback for valid fields
        if (isValid) {
            [cardNumber, expiryDate, cvv].forEach(input => {
                input.classList.add('complete');
            });
        }
    } else if (method === 'upi') {
        const upiId = document.getElementById('upiId');
        const upiRegex = /^([0-9]{10}|[a-zA-Z0-9._-]+)@([a-zA-Z]+)$/;
        const [, , handle] = (upiId.value.match(upiRegex) || []);
        isValid = upiRegex.test(upiId.value) && VALID_UPI_HANDLES.includes(handle?.toLowerCase());
    }

    btn.disabled = !isValid;
    return isValid;
}

function processPayment() {
    const selectedMethod = document.querySelector('.payment-option.selected');
    if (!selectedMethod) {
        showToast('Please select a payment method', 'error');
        return;
    }

    const method = selectedMethod.dataset.method;
    if (!validateForm(method)) {
        showToast('Please fix all errors before proceeding', 'error');
        return;
    }

    paymentAttempts++;
    
    // Show loading animation
    const loader = document.createElement('div');
    loader.className = 'payment-loader';
    loader.innerHTML = '<div class="loader"></div><div>Processing payment...</div>';
    document.body.appendChild(loader);

    // Random failure with 20% probability
    const shouldFail = Math.random() < 0.2;  // 20% chance of failure

    setTimeout(() => {
        loader.remove();
        if (shouldFail) {
            showToast('Transaction failed! Please try again.', 'error');
            showPaymentFailure();
        } else {
            const confirmedBooking = createConfirmedBooking();
            showPaymentSuccess(confirmedBooking);
        }
    }, 2000);
}

function showPaymentFailure() {
    const container = document.querySelector('.payment-container');
    container.innerHTML = `
        <div class="failure-container">
            <div class="failure-animation">
                <svg class="crossmark" viewBox="0 0 52 52">
                    <circle class="crossmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="crossmark-x" d="M16 16 36 36 M36 16 16 36"/>
                </svg>
            </div>
            <h2>Payment Failed</h2>
            <p>Transaction could not be completed. Please try again.</p>
            <div class="countdown">Redirecting in <span id="countdown">10</span></div>
        </div>
    `;

    let seconds = 10;
    const countdownEl = document.getElementById('countdown');
    const interval = setInterval(() => {
        seconds--;
        countdownEl.textContent = seconds;
        if (seconds === 0) {
            clearInterval(interval);
            window.location.reload();
        }
    }, 1000);
}

function createConfirmedBooking() {
    const booking = JSON.parse(localStorage.getItem('bookingDetails'));
    return {
        ...booking,
        bookingId: generateBookingId(),
        status: 'confirmed',
        paymentDate: new Date().toISOString()
    };
}

function showPaymentSuccess(booking) {
    const container = document.querySelector('.payment-container');
    container.innerHTML = `
        <div class="success-container">
            <div class="success-animation">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>
            
            <div class="ticket">
                <div class="ticket-header">
                    <h2>${booking.movie.title}</h2>
                    <span class="booking-id">Booking ID: ${booking.bookingId}</span>
                </div>
                <div class="ticket-body">
                    <div class="ticket-left">
                        <img src="${booking.movie.poster_path}" alt="${booking.movie.title}">
                    </div>
                    <div class="ticket-info">
                        <div class="info-row">
                            <span>Date:</span>
                            <span>${new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <div class="info-row">
                            <span>Time:</span>
                            <span>${booking.time}</span>
                        </div>
                        <div class="info-row">
                            <span>Seats:</span>
                            <span>${booking.seats.map(seat => seat.id).join(', ')}</span>
                        </div>
                        <div class="info-row total">
                            <span>Total Paid:</span>
                            <span>₹${booking.total}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button onclick="downloadTicket()" class="download-btn">
                    <i class="fas fa-download"></i> Download Ticket
                </button>
                <button onclick="window.location.href='dashboard.html'" class="home-btn">
                    Back to Home
                </button>
            </div>
        </div>
    `;
    
    showToast('Payment successful! Your ticket is ready.', 'success');
    setTimeout(downloadTicket, 1000); // Auto download after 1 second
}

function generateBookingId() {
    return 'BK' + Date.now().toString(36).toUpperCase();
}

// Debounce function to limit toast notifications
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

const showToastDebounced = debounce((message, type) => {
    // Remove any existing toasts first
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : '✕'}</div>
        <div class="toast-message">${message}</div>
    `;
    document.body.appendChild(toast);
    
    // Show toast
    requestAnimationFrame(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    });
}, 300);

// Replace all showToast calls with showToastDebounced
function showToast(message, type = 'success') {
    showToastDebounced(message, type);
}

function downloadTicket() {
    const booking = JSON.parse(localStorage.getItem('confirmedBooking'));
    const ticketContent = `
=== MOVIE TICKET ===
Booking ID: ${booking.bookingId}
Movie: ${booking.movie.title}
Date: ${new Date(booking.date).toLocaleDateString()}
Time: ${booking.time}
Theater: ${booking.theater.name}
Seats: ${booking.seats.map(seat => seat.id).join(', ')}
Amount Paid: ₹${booking.total}
Status: Confirmed
Booked On: ${new Date(booking.paymentDate).toLocaleString()}

Please show this ticket at the counter
=============================
    `.trim();

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movie-ticket-${booking.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Ticket downloaded successfully!');
}

window.onload = initializePayment;
