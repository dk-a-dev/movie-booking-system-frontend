const showTimes = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
let selectedSeats = [];
let selectedTime = null;
let selectedDate = null;
let selectedTheater = null;
let selectedSeatType = null;
let numberOfPeople = 1;

function initializeBooking() {
    const movie = JSON.parse(localStorage.getItem('selectedMovie'));
    if (!movie) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Update movie info
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('moviePoster').src = movie.poster_path;
    document.getElementById('movieOverview').textContent = movie.overview;
    document.getElementById('movieRating').innerHTML = `<span>★</span> ${movie.vote_average.toFixed(1)}`;
    document.getElementById('movieGenres').innerHTML = movie.genres
        .map(genre => `<span class="genre-tag">${genre}</span>`)
        .join('');

    // Initially hide booking steps
    hideElements(['showTimes', 'theaterSelect', 'seatsSection', 'bookingSummary']);
    
    // Show date picker
    showElement('datePicker');
    displayDatePicker();
}

function displayDatePicker() {
    const dateGrid = document.getElementById('datePicker');
    const dates = getNextSevenDays();
    
    dates.forEach((date, index) => {
        const dateBox = document.createElement('div');
        dateBox.className = 'date-box' + (index === 0 ? ' selected' : '');
        dateBox.innerHTML = `
            <span class="day">${date.day}</span>
            <span class="date">${date.date} ${date.month}</span>
        `.trim();
        dateBox.onclick = () => selectDate(date.full, dateBox);
        dateGrid.appendChild(dateBox);
    });

    if (dates.length > 0) {
        selectDate(dates[0].full);
    }
}

function selectDate(date) {
    selectedDate = date;
    document.querySelectorAll('.date-box').forEach(box => 
        box.classList.remove('selected'));
    event.target.closest('.date-box').classList.add('selected');
    
    showElement('theaterSelect');
    displayTheaters();
}

function displayTheaters() {
    const theaterList = document.getElementById('theaterList');
    theaterList.innerHTML = theaters.map(theater => `
        <div class="theater-card" onclick="selectTheater(${theater.id})">
            <h3>${theater.name}</h3>
            <p>${theater.location}</p>
            <div class="price-info">
                <span>Premium: ₹${theater.price.premium}</span>
                <span>Standard: ₹${theater.price.standard}</span>
            </div>
        </div>
    `).join('');
}

function selectTheater(theaterId) {
    selectedTheater = theaters.find(t => t.id === theaterId);
    document.querySelectorAll('.theater-card').forEach(card => 
        card.classList.remove('selected'));
    event.target.closest('.theater-card').classList.add('selected');
    
    showElement('showTimes');
    displayShowTimes();
}

function displayShowTimes() {
    const showTimesDiv = document.getElementById('showTimes');
    showTimes.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        timeSlot.onclick = () => selectTime(time);
        showTimesDiv.appendChild(timeSlot);
    });
}

function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Automatically show seat selection
    showElement('seatsSection');
    displaySeats();
    // Smooth scroll to seats section
    document.getElementById('seatsSection').scrollIntoView({ behavior: 'smooth' });
}

function displaySeats() {
    const seatsGrid = document.getElementById('seatsGrid');
    const columnLabels = document.querySelector('.column-labels');
    seatsGrid.innerHTML = '';
    columnLabels.innerHTML = '';
    
    // Add column numbers
    for (let i = 1; i <= 14; i++) {
        columnLabels.innerHTML += `<span>${i}</span>`;
    }
    
    // Create seats
    createSeatSection(seatsGrid, 'A', 'premium', 14);
    createSeatSection(seatsGrid, 'B', 'premium', 14);
    createSeatSection(seatsGrid, 'C', 'standard', 14);
    createSeatSection(seatsGrid, 'D', 'standard', 14);
    
    showElement('seatsSection');
}

function createSeatSection(container, row, type, count) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'seat-row';
    rowDiv.innerHTML = `<div class="row-label">${row}</div>`;
    
    for (let i = 1; i <= count; i++) {
        const seat = document.createElement('div');
        seat.className = `seat ${type}`;
        seat.dataset.id = `${row}${i}`;
        seat.dataset.seatNumber = `${row}${i}`;
        seat.onclick = () => toggleSeat(seat, type);
        
        if (Math.random() < 0.3) seat.classList.add('booked');
        
        rowDiv.appendChild(seat);
    }
    
    container.appendChild(rowDiv);
}

function toggleSeat(seat, type) {
    if (seat.classList.contains('booked')) return;
    
    const isSelected = seat.classList.contains('selected');
    
    if (!isSelected && selectedSeats.length >= numberOfPeople) {
        alert(`You can only select ${numberOfPeople} seats`);
        return;
    }
    
    seat.classList.toggle('selected');
    const seatId = seat.dataset.seatNumber;
    
    if (!isSelected) {
        selectedSeats.push({ id: seatId, type: type });
    } else {
        selectedSeats = selectedSeats.filter(s => s.id !== seatId);
    }
    
    updateTicketPreview();
}

function updateBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const selectedPremium = document.querySelectorAll('.seat.premium.selected').length;
    const selectedStandard = document.querySelectorAll('.seat.standard.selected').length;
    
    const premiumTotal = selectedPremium * selectedTheater.price.premium;
    const standardTotal = selectedStandard * selectedTheater.price.standard;
    const total = premiumTotal + standardTotal;
    
    summary.innerHTML = `
        <h3>Booking Summary</h3>
        <div class="summary-item">
            <span>Premium Seats (${selectedPremium})</span>
            <span>₹${premiumTotal}</span>
        </div>
        <div class="summary-item">
            <span>Standard Seats (${selectedStandard})</span>
            <span>₹${standardTotal}</span>
        </div>
        <div class="summary-item total">
            <span>Total Amount</span>
            <span>₹${total}</span>
        </div>
        <button onclick="confirmBooking()" ${total === 0 ? 'disabled' : ''}>
            Confirm Booking
        </button>
    `;
    
    showElement('bookingSummary');
}

function updateBookingButton() {
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.disabled = !(selectedSeats.length > 0 && selectedTime);
}

function updatePeopleCount(change) {
    const newCount = numberOfPeople + change;
    if (newCount >= 1 && newCount <= 10) {
        numberOfPeople = newCount;
        document.getElementById('peopleCount').textContent = numberOfPeople;
        // Clear selected seats when number of people changes
        clearSelectedSeats();
    }
}

function clearSelectedSeats() {
    selectedSeats = [];
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    updateBookingSummary();
}

function proceedToSummary() {
    if (selectedSeats.length !== numberOfPeople) {
        alert(`Please select exactly ${numberOfPeople} seats`);
        return;
    }
    
    const bookingDetails = {
        movie: JSON.parse(localStorage.getItem('selectedMovie')),
        date: selectedDate,
        time: selectedTime,
        theater: selectedTheater,
        seats: selectedSeats,
        numberOfPeople: numberOfPeople
    };
    
    localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    window.location.href = 'booking-summary.html';
}

function updateTicketPreview() {
    const ticketPreview = document.getElementById('ticketSummary');
    // const paymentSection = document.querySelector('.payment-section');

    // Only show ticket if all selections are made
    if (!selectedSeats.length || !selectedTime || !selectedDate || !selectedTheater) {
        ticketPreview.style.display = 'none';
        if (paymentSection) paymentSection.style.display = 'none';
        return;
    }

    const movie = JSON.parse(localStorage.getItem('selectedMovie'));
    const seatNumbers = selectedSeats.map(seat => seat.id).join(', ');
    const premiumCount = selectedSeats.filter(seat => seat.type === 'premium').length;
    const standardCount = selectedSeats.filter(seat => seat.type === 'standard').length;
    const total = (premiumCount * selectedTheater.price.premium) + 
                 (standardCount * selectedTheater.price.standard);

    ticketPreview.innerHTML = `
        <div class="ticket-content">
            <div class="ticket-left">
                <img src="${movie.poster_path}" alt="${movie.title}">
            </div>
            <div class="ticket-info">
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Movie</span>
                    <span class="ticket-info-value">${movie.title}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Date</span>
                    <span class="ticket-info-value">${new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Time</span>
                    <span class="ticket-info-value">${selectedTime}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Theater</span>
                    <span class="ticket-info-value">${selectedTheater.name}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Seats</span>
                    <span class="ticket-info-value">${seatNumbers}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Amount</span>
                    <span class="ticket-info-value">₹${total}</span>
                </div>
            </div>
        </div>
    `;

    const paymentSection = document.createElement('div');
    paymentSection.className = 'payment-section';
    paymentSection.innerHTML = `
        <button class="payment-button" onclick="proceedToPayment()">
            Proceed to Payment • ₹${total}
        </button>
    `;
    
    ticketPreview.insertAdjacentElement('afterend', paymentSection);
    ticketPreview.style.display = 'block';
    requestAnimationFrame(() => {
        ticketPreview.style.opacity = '1';
        ticketPreview.style.transform = 'translateY(0)';
    });
}

function proceedToPayment() {
    const bookingDetails = {
        movie: JSON.parse(localStorage.getItem('selectedMovie')),
        date: selectedDate,
        time: selectedTime,
        theater: selectedTheater,
        seats: selectedSeats,
        total: calculateTotal()
    };
    
    localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    window.location.href = 'payment.html';
}

function calculateTotal() {
    const premiumCount = selectedSeats.filter(seat => seat.type === 'premium').length;
    const standardCount = selectedSeats.filter(seat => seat.type === 'standard').length;
    return (premiumCount * selectedTheater.price.premium) + 
           (standardCount * selectedTheater.price.standard);
}

// Helper functions
function getNextSevenDays() {
    const days = [];
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: date.getDate(),
            month: months[date.getMonth()],
            full: date.toISOString().split('T')[0]
        });
    }
    
    return days;
}

function hideElements(ids) {
    ids.forEach(id => document.getElementById(id).style.display = 'none');
}

function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'block';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transition = 'opacity 0.3s ease';
        }, 50);
    }
}

window.onload = function() {
    checkAuth();
    initializeBooking();
};
