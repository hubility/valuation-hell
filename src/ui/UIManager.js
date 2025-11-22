export class UIManager {
    constructor(game) {
        this.game = game;

        // Elements
        this.cashDisplay = document.getElementById('cash-display');
        this.equityDisplay = document.getElementById('equity-display');
        this.hypeDisplay = document.getElementById('hype-display');

        // Create Users Display dynamically
        this.usersDisplay = document.createElement('div');
        this.usersDisplay.style.cssText = "font-size: 18px; color: #00ffff;";
        this.usersDisplay.innerText = "👥 0 Users";
        document.getElementById('hud').appendChild(this.usersDisplay);

        // Create Valuation Display
        this.valuationDisplay = document.createElement('div');
        this.valuationDisplay.style.cssText = "font-size: 24px; color: #FFD700; font-weight: bold; text-align: center; margin-top: 10px;";
        this.valuationDisplay.innerText = "$0";
        document.getElementById('hud').appendChild(this.valuationDisplay);

        this.timerDisplay = document.getElementById('timer-display');

        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');

        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');

        // Ability Display
        this.abilityContainer = document.createElement('div');
        this.abilityContainer.style.cssText = "position: absolute; bottom: 20px; right: 20px; width: 60px; height: 60px; background: #333; border: 2px solid #00aaff; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;";
        this.abilityContainer.innerHTML = "E";

        this.abilityOverlay = document.createElement('div');
        this.abilityOverlay.style.cssText = "position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; background: rgba(0, 0, 0, 0.8); transition: height 0.1s;";
        this.abilityContainer.appendChild(this.abilityOverlay);

        document.getElementById('ui-layer').appendChild(this.abilityContainer);

        // Listeners
        this.startBtn.addEventListener('click', () => {
            this.game.startGame();
            this.hideScreen(this.startScreen);
        });

        this.restartBtn.addEventListener('click', () => {
            location.reload(); // Simple restart for now
        });
    }

    updateHUD(player, combat, time) {
        this.cashDisplay.innerText = `💰 $${Math.floor(player.cash)}`;
        this.equityDisplay.innerText = `📊 ${player.equity}%`;
        this.hypeDisplay.innerText = `🔥 ${player.hype} | LVL ${player.level}`;
        this.usersDisplay.innerText = `👥 ${Math.floor(player.xp)} Users`;

        // Update Valuation
        const valuation = player.getValuation();
        let valStr = "";
        if (valuation >= 1000000) {
            valStr = `$${(valuation / 1000000).toFixed(1)}M`;
        } else if (valuation >= 1000) {
            valStr = `$${(valuation / 1000).toFixed(1)}k`;
        } else {
            valStr = `$${Math.floor(valuation)}`;
        }
        this.valuationDisplay.innerText = `VALUATION: ${valStr}`;

        const mode = combat.autoFireEnabled ? "AUTO" : "MANUAL";
        this.hypeDisplay.innerText += ` | ${mode}`;

        // Format Time
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        this.timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update Ability Cooldown
        if (combat.diluteCooldown > 0) {
            const pct = (combat.diluteTimer / combat.diluteCooldown) * 100;
            this.abilityOverlay.style.height = `${pct}%`;

            if (combat.diluteTimer <= 0) {
                this.abilityContainer.style.borderColor = '#00aaff';
                this.abilityContainer.style.color = 'white';
            } else {
                this.abilityContainer.style.borderColor = '#555';
                this.abilityContainer.style.color = '#555';
            }
        }
    }

    showGameOver() {
        this.gameOverScreen.style.display = 'flex';
    }

    showPitchRound(options, onSelect) {
        const screen = document.getElementById('pitch-round-screen');
        const container = document.getElementById('upgrade-options');
        container.innerHTML = ''; // Clear previous

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.style.cssText = "padding: 20px; width: 200px; height: 250px; background: #222; border: 2px solid #00aaff; color: white; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;";

            btn.innerHTML = `
                <div style="font-size: 40px;">${opt.icon}</div>
                <div style="font-size: 20px; font-weight: bold;">${opt.name}</div>
                <div style="font-size: 14px; color: #aaa;">${opt.desc}</div>
            `;

            btn.onclick = () => {
                onSelect(opt);
                this.hideScreen(screen);
            };

            container.appendChild(btn);
        });

        screen.style.display = 'flex';
    }

    hideScreen(screen) {
        screen.style.display = 'none';
    }
}
