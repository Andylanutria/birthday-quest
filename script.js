// AUDIO 
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) { console.log(e); }
}

const SFX = {
    click: () => playTone(600, 'square', 0.08),
    hit: () => playTone(150 + Math.random() * 80, 'sawtooth', 0.06),
    ding: () => { playTone(800, 'sine', 0.1); setTimeout(() => playTone(1200, 'sine', 0.3), 100); },
    type: () => playTone(300 + Math.random() * 200, 'triangle', 0.03),
    success: () => { playTone(523, 'square', 0.1); setTimeout(() => playTone(659, 'square', 0.1), 100); setTimeout(() => playTone(783, 'square', 0.2), 200); },
    error: () => { playTone(180, 'sawtooth', 0.15); setTimeout(() => playTone(140, 'sawtooth', 0.2), 150); },
    victory: () => {
        const notes = [440, 554, 659, 880, 659, 880];
        notes.forEach((n, i) => setTimeout(() => playTone(n, 'square', 0.2), i * 150));
    }
};

let isMusicPlaying = false;
function startMusic() {
    if (isMusicPlaying) return;
    isMusicPlaying = true;
    let note = 0;
    const notes = [261, 329, 392, 523, 392, 329];
    setInterval(() => {
        playTone(notes[note % notes.length], 'sine', 0.15);
        note++;
    }, 450);
}

// P
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 20);
    }
}

function unlockAchievement(name) {
    SFX.success();
    const popup = document.getElementById('achievement');
    document.getElementById('achName').innerText = name;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 4000);
}

function triggerConfetti() {
    const box = document.getElementById('confettiBox');
    box.innerHTML = "";
    const colors = ['#ff0055', '#ffcc00', '#00e5ff', '#00ff66', '#ffffff'];
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.left = Math.random() * 100 + '%';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDelay = Math.random() * 3 + 's';
        p.style.animationDuration = (2 + Math.random() * 2) + 's';
        box.appendChild(p);
    }
}

document.addEventListener('DOMContentLoaded', () => {

       const studio = document.getElementById('studioScreen');
    let studioPassed = false;
    
    function goToMenu() {
        if (studioPassed) return;
        studioPassed = true;
        initAudio();
        showScreen('menuScreen');
        startMusic();
    }

    studio.addEventListener('click', goToMenu);
    setTimeout(goToMenu, 3000);

    
    document.getElementById('startButton').addEventListener('click', () => {
        initAudio();
        SFX.click();
        showScreen('loadingScreen');
        startLoadingBar();
    });

    function startLoadingBar() {
        let val = 0;
        const progress = document.getElementById('progress');
        const runner = document.getElementById('runner');
        const loadingText = document.getElementById('loadingText');

        const interval = setInterval(() => {
            val++;
            progress.style.width = val + "%";
            runner.style.left = val + "%";

            if (val === 20) loadingText.innerText = "COLLECTING RINGS & WUMPAS...";
            if (val === 50) loadingText.innerText = "SEARCHING PLAYER ONE...";
            if (val === 80) loadingText.innerText = "GENERATING MISSION...";

            if (val >= 100) {
                clearInterval(interval);
                SFX.ding();
                loadingText.innerText = "PLAYER ONE FOUND! ★";
                setTimeout(() => {
                    document.getElementById('loadingText').classList.add('hidden');
                    document.getElementById('loadingBox').classList.add('hidden');
                    document.getElementById('welcomeText').classList.remove('hidden');
                }, 800);
            }
        }, 50);
    }

   
    document.getElementById('welcomeNextBtn').addEventListener('click', () => {
        SFX.click();
        showScreen('storyScreen');
        startTypewriter();
    });

    const storyText = "Hace algunos años...\nExistía un jugador muy especial.\n\nUn día... Conoció a una chica.\nSin darse cuenta... Ella se convirtio en su compañera de aventura.\n\nHoy... Esa chica creó una misión exclusiva para él.\nNo habrá mapa. No habrá pistas.\nSolo tendrás que confiar.\n\n¿Estás listo?";
    
    function startTypewriter() {
        let i = 0;
        const container = document.getElementById('typewriterText');
        container.innerText = "";
        const timer = setInterval(() => {
            container.innerText += storyText.charAt(i);
            SFX.type();
            i++;
            if (i >= storyText.length) {
                clearInterval(timer);
                document.getElementById('acceptMissionBtn').classList.remove('hidden');
            }
        }, 40);
    }

  
    document.getElementById('acceptMissionBtn').addEventListener('click', () => {
        SFX.click();
        showScreen('missionScreen');
    });
    document.getElementById('startLevelsBtn').addEventListener('click', () => {
        SFX.click();
        showScreen('gameplayScreen');
        loadLevel(0);
    });

    const levelsData = [
        { level: "LEVEL 1", password: "AMOR", message: "MESSAGE UNLOCKED\n━━━━━━━━━━━━━━━━━━\nNo todas las aventuras comienzan con un mapa.\nAlgunas comienzan con una persona.\n\nGracias por aceptar esta misión. ❤️", ach: "My Favorite Adventure" },
        { level: "LEVEL 2", password: "LIMERENCIA", message: "MESSAGE UNLOCKED\n━━━━━━━━━━━━━━━━━━\nHay momentos que no pueden guardarse en una fotografía.\nSolo pueden quedarse para siempre en el corazón. ❤️", ach: "Soulmate Unlocked" },
        { level: "LEVEL 3", password: "RAMEN", message: "MESSAGE UNLOCKED\n━━━━━━━━━━━━━━━━━━\nSi llegaste hasta aquí...\nEs porque decidiste confiar en mí.\n\nGracias por hacerlo. ✨", ach: "Best Teammate" },
        { level: "BOSS FINAL", password: "OSITO", message: "MISSION COMPLETE 🎉\n━━━━━━━━━━━━━━━━━━\nHoy termina esta aventura.\nPero espero que nuestra historia todavía tenga muchos niveles más. ❤️\n\n¡FELIZ CUMPLEAÑOS, PLAYER ONE!", ach: "Forever Player 2" }
    ];

    let currentLevel = 0;
    let bossHp = 10;
    const maxBossHp = 10;

    function loadLevel(idx) {
        currentLevel = idx;
        const data = levelsData[idx];
        document.getElementById('levelHeader').innerText = data.level;
        document.getElementById('passInput').value = "";
        document.getElementById('errorMsg').classList.add('hidden');
        document.getElementById('messagePanel').classList.add('hidden');

     
        if (data.level === "BOSS FINAL") {
            bossHp = maxBossHp;
            document.getElementById('bossHpFill').style.width = "100%";
            document.getElementById('bossBattlePanel').classList.remove('hidden');
            document.getElementById('passwordPanel').classList.add('hidden');
        } else {
            document.getElementById('bossBattlePanel').classList.add('hidden');
            document.getElementById('passwordPanel').classList.remove('hidden');
        }
    }

    
    const bossSprite = document.getElementById('bossSprite');
    bossSprite.addEventListener('click', () => {
        if (bossHp > 0) {
            bossHp--;
            SFX.hit();
            
            
            bossSprite.classList.add('hit');
            setTimeout(() => bossSprite.classList.remove('hit'), 100);

            
            const pct = (bossHp / maxBossHp) * 100;
            document.getElementById('bossHpFill').style.width = pct + "%";

            
            if (bossHp <= 0) {
                SFX.success();
                bossSprite.innerText = "💥";
                setTimeout(() => {
                    document.getElementById('bossBattlePanel').classList.add('hidden');
                    document.getElementById('passwordPanel').classList.remove('hidden');
                }, 600);
            }
        }
    });

    document.getElementById('submitPassBtn').addEventListener('click', () => {
        const input = document.getElementById('passInput').value.trim().toUpperCase();
        const data = levelsData[currentLevel];

        if (input === data.password) {
            document.getElementById('passwordPanel').classList.add('hidden');
            document.getElementById('messagePanel').classList.remove('hidden');
            document.getElementById('unlockedMessage').innerText = data.message;
            unlockAchievement(data.ach);
        } else {
            SFX.error();
            document.getElementById('errorMsg').classList.remove('hidden');
        }
    });

 
    document.getElementById('nextLevelBtn').addEventListener('click', () => {
        SFX.click();
        if (currentLevel < levelsData.length - 1) {
            loadLevel(currentLevel + 1);
        } else {
            showScreen('victoryScreen');
            triggerConfetti();
            SFX.victory();
        }
    });


    document.getElementById('toContinueScreenBtn').addEventListener('click', () => {
        SFX.click();
        showScreen('continueScreen');
    });

  
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const loveMsg = document.getElementById('finalLoveMsg');

    yesBtn.addEventListener('click', () => {
        SFX.victory();
        loveMsg.classList.remove('hidden');
        noBtn.style.display = 'none';
    });

    let noBtnEscapes = 0;

    function handleNoBtnEscape() {
        SFX.error();
        noBtnEscapes++;

        if (noBtnEscapes === 1) {
            noBtn.innerText = "ALSO YES! ▶";
            noBtn.style.background = "#ffcc00";
            noBtn.style.color = "#000";
        } else if (noBtnEscapes === 2) {
            noBtn.style.position = "relative";
            noBtn.style.left = (Math.random() * 80 - 40) + "px";
            noBtn.style.top = (Math.random() * 40 - 20) + "px";
        } else {
            noBtn.innerText = "YES ▶";
            noBtn.style.background = "#e60000";
            noBtn.style.color = "#fff";
            noBtn.style.position = "static";
            
            SFX.victory();
            loveMsg.classList.remove('hidden');
        }
    }

    noBtn.addEventListener('mouseover', handleNoBtnEscape);
    noBtn.addEventListener('click', () => {
        SFX.victory();
        loveMsg.classList.remove('hidden');
        noBtn.style.display = 'none';
    });
});
