function createParticles() {
    const container = document.querySelector('.login-container');
    
    for (let i = 0; i < 500; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(139, 92, 246, 0.3);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
            pointer-events: none;
        `;
        
        container.appendChild(particle);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth > 768) {
        createParticles();
    }
});

const additionalCSS = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
        }
    }
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
