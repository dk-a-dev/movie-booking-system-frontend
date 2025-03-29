const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function displayMovies(section, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;

        const movies = moviesData[section].results;
        container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
    } catch (error) {
        console.error(`Error displaying movies:`, error);
    }
}

function createMovieCard(movie) {
    const releaseDate = new Date(movie.release_date);
    const isUpcoming = releaseDate > new Date();
    
    return `
        <div class="movie-card">
            <div class="movie-poster">
                <img src="${movie.poster_path}" alt="${movie.title}">
                <div class="movie-status ${isUpcoming ? 'upcoming' : 'now-showing'}">
                    ${isUpcoming ? 'Coming Soon' : 'Now Showing'}
                </div>
                <div class="movie-rating">★ ${movie.vote_average.toFixed(1)}</div>
                <div class="movie-description">
                    <h4>Overview</h4>
                    <p>${movie.overview}</p>
                </div>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-genres">
                    ${movie.genres.map(genre => `
                        <span class="genre-tag">${genre}</span>
                    `).join('')}
                </div>
                <p class="release-date">${releaseDate.toLocaleDateString()}</p>
                ${isUpcoming ? 
                    `<button onclick="notifyMe('${movie.id}')" class="notify-btn">Notify Me</button>` : 
                    `<button onclick="bookMovie('${movie.id}', '${movie.title}')" class="book-btn">Book Now</button>`
                }
            </div>
        </div>
    `;
}

function generateShowTimes() {
    const times = ['10:00 AM', '1:30 PM', '4:45 PM', '7:15 PM', '10:00 PM'];
    return times.slice(0, 3).map(time => `<span class="show-time">${time}</span>`).join('');
}

function searchMovies() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) return;
    
    const allMovies = [
        ...moviesData.now_playing.results,
        ...moviesData.upcoming.results,
        ...moviesData.top_rated.results
    ];
    
    const results = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(query)
    );
    
    document.getElementById('nowShowingGrid').innerHTML = results.map(movie => 
        createMovieCard(movie)
    ).join('');
}

function bookMovie(movieId, movieTitle) {
    const movie = moviesData.now_playing.results.find(m => m.id.toString() === movieId) ||
                 moviesData.upcoming.results.find(m => m.id.toString() === movieId) ||
                 moviesData.top_rated.results.find(m => m.id.toString() === movieId);
    
    // Store complete movie data
    localStorage.setItem('selectedMovie', JSON.stringify({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        genres: movie.genres,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        price: 250 // Base price for the movie
    }));
    
    window.location.href = 'booking.html';
}

function notifyMe(movieId) {
    alert('You will be notified when this movie becomes available!');
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

window.onload = function() {
    if (!localStorage.getItem('user')) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('username').textContent = user.name;

    displayMovies('now_playing', 'nowShowingGrid');
    displayMovies('upcoming', 'upcomingGrid');
    displayMovies('top_rated', 'recommendedGrid');
};
