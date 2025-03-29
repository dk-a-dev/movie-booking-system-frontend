function initializePayment() {
    const bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
    if (!bookingDetails) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    displayTicketPreview(bookingDetails);
    displayBookingSummary(bookingDetails);
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

function processPayment() {
    const selectedMethod = document.querySelector('.payment-option.selected');
    if (!selectedMethod) {
        showToast('Please select a payment method', 'error');
        return;
    }

    // Show loading animation
    const loader = document.createElement('div');
    loader.className = 'payment-loader';
    loader.innerHTML = '<div class="loader"></div><div>Processing payment...</div>';
    document.body.appendChild(loader);
    
    const booking = JSON.parse(localStorage.getItem('bookingDetails'));
    const confirmedBooking = {
        ...booking,
        bookingId: generateBookingId(),
        status: 'confirmed',
        paymentDate: new Date().toISOString()
    };
    
    // Simulate payment processing
    setTimeout(() => {
        try {
            localStorage.setItem('confirmedBooking', JSON.stringify(confirmedBooking));
            loader.remove();
            showPaymentSuccess(confirmedBooking);
        } catch (error) {
            loader.remove();
            showToast('Payment failed. Please try again.', 'error');
        }
    }, 2000);

    // After successful payment
    document.querySelector('.payment-section').style.opacity = '0.5';
    document.querySelector('.payment-form').style.pointerEvents = 'none';
    showPaymentSuccess(confirmedBooking);
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

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : '✕'}</div>
        <div class="toast-message">${message}</div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
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
