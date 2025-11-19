# 🎮 Documento de Diseño de Juego: VALUATION HELL

## 1. Concepto General
**Título:** Valuation Hell
**Género:** Roguelite / Auto-battler (Estilo Vampire Survivors)
**Temática:** Sátira del mundo de las Startups y el Emprendimiento.
**Objetivo:** Sobrevivir el mayor tiempo posible, hacer crecer tu valoración y evitar la quiebra (quedarse sin Cash) mientras escalas desde una fase "Seed" hasta una "IPO" o "Exit".

---

## 2. ¿Cómo se juega? (Gameplay Loop)

El juego consiste en "runs" (partidas) donde intentas llegar lo más lejos posible.

1.  **Inicio:** Comienzas como un fundador solitario en una oficina vacía (el mapa infinito). Tienes poco dinero (Cash) y una idea básica (tu primer ataque).
2.  **Supervivencia:** Los enemigos (problemas del negocio) empiezan a aparecer y te persiguen. Tu personaje ataca automáticamente a los enemigos cercanos. Tu trabajo es **moverte** para esquivarlos y recoger los recursos que sueltan (Usuarios/Ingresos).
3.  **Crecimiento (Level Up):** Al acumular suficientes usuarios o experiencia, entras en una **"Ronda de Inversión" (Pitch Round)**. El juego se pausa y eliges una mejora entre 3 opciones aleatorias (nuevas features, más daño, o inyección de capital).
4.  **Progresión:** A medida que pasa el tiempo, avanzas de etapa (Seed -> Serie A -> Serie B...). Los enemigos se vuelven más fuertes y aparecen Jefes Finales (Bosses) al final de cada etapa.
5.  **Derrota o Victoria:**
    *   **Derrota:** Si tu **Cash** llega a 0, quiebras. Fin de la partida.
    *   **Meta-juego:** Al terminar, usas las ganancias retenidas para desbloquear mejoras permanentes (nuevos fundadores, ventajas iniciales) para la siguiente partida.

---

## 3. Mecánicas Principales

### 🕹️ Controles
*   **Movimiento:** WASD, Flechas o Joystick Virtual.
*   **Ataque:** Automático. El fundador dispara sus "Features" a los enemigos más cercanos o peligrosos.
*   **Interacción:** Automática (recoger items por proximidad).

### 📊 Estadísticas del Jugador
*   **💰 Cash (Vida):** Tu barra de vida. Si los enemigos te tocan, pierdes dinero. Si llega a 0, Game Over.
*   **📊 Equity (Moneda Especial):** Empiezas con el 100%. Puedes "vender" equity a cambio de grandes sumas de dinero o ventajas poderosas, pero tener menos equity puede tener consecuencias finales.
*   **🔥 Hype (Mana/Energía):** Recurso para habilidades especiales o multiplicadores. Los "Trolls" pueden bajar tu hype.
*   **👥 Usuarios (Experiencia):** Lo que sueltan los enemigos al ser derrotados. Recógelos para subir de nivel.

---

## 4. Elementos del Juego

### ⚔️ El Protagonist (El Fundador)
*   **Aspecto:** Estereotipo Tech (Hoodie, Laptop).
*   **Armas (Features):**
    *   *MVP Básico:* Disparo simple.
    *   *Growth Hacking:* Disparo múltiple en abanico.
    *   *Referral Program:* Daño en área (los enemigos explotan contagiando a otros).
    *   *NFT Drop:* Bomba de alto daño con mucho tiempo de recarga.
    *   *Hiring Spree:* Invoca mini-developers que atacan por ti (cuesta Cash mantenerlos).

### 🧟 Enemigos (Los Problemas)
Los enemigos representan obstáculos reales de una startup:

*   **Tier 1 (Básicos):**
    *   *Becarios no pagados:* Lentos y débiles.
    *   *Trolls de Twitter:* Rápidos, bajan tu Hype.
    *   *Clientes molestos:* Disparan quejas ("¿Para cuándo?").
*   **Tier 2 (Avanzados):**
    *   *VCs Tóxicos:* Rápidos. Si te tocan, te roban Equity además de Cash.
    *   *Competidores Chinos:* Copian tu movimiento y hacen mucho daño.
    *   *Reguladores (Hacienda/GDPR):* Muy lentos pero con mucha vida (tanques).
*   **Tier 3 (Ambiental):**
    *   *Burnout:* Una nube oscura que te persigue si te quedas quieto o la partida se alarga mucho. Drena Cash constantemente.

### 👹 Jefes (Hitos)
Aparecen en momentos clave (minuto 5, 10, 15...):
*   **Business Angel Codicioso** (Fin de Seed Stage).
*   **VC que fuerza crecimiento** (Fin de Serie A).
*   **Competencia Unicornio** (Fin de Serie B).
*   **Market Crash** (Jefe Final).

---

## 5. Progresión de la Partida (Timeline)

*   **Min 0-5 (Seed Stage):** Enemigos fáciles. Objetivo: Sobrevivir y conseguir las primeras features.
*   **Min 5-10 (Serie A):** Aumenta la dificultad. Aparecen VCs tóxicos. Necesitas mejorar tu daño (Product Market Fit).
*   **Min 10-15 (Serie B):** El Burnout empieza a acechar. Enemigos tipo tanque.
*   **Min 15+ (Serie C / IPO):** Caos total (Bullet hell). Solo los mejores sobreviven hasta el "Exit".
