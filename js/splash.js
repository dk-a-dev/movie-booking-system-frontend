document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const mainContent = document.querySelector('.container');
    const audio = new Audio('images/netflix.mp3');
    
    // Set audio properties
    audio.volume = 0.5;
    audio.preload = 'auto';

    // Small play button overlay
    const playButton = document.createElement('button');
    playButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        z-index: 10000;
        font-size: 16px;
    `;
    playButton.textContent = '🔊 Play Sound';
    document.body.appendChild(playButton);

    // Start animation immediately
    container.classList.add('visible');

    // Handle audio play
    playButton.addEventListener('click', () => {
        audio.play().then(() => {
            playButton.style.display = 'none';
        }).catch(err => {
            console.error('Audio failed:', err);
        });
    }, { once: true });

    // Continue with animation regardless of audio
    setTimeout(() => {
        container.style.opacity = '0';
        mainContent.style.display = 'block';
        mainContent.style.opacity = '1';
        
        setTimeout(() => {
            container.remove();
            audio.pause();
            audio.currentTime = 0;
        }, 500);
    }, 4200);
});