const SPAGHETTI_POSITIONS = [
    '--top:6%;--left:8%;--dur:8.5s;--delay:0.4s;--rot:8deg;',
    '--top:12%;--left:28%;--dur:10.2s;--delay:1.5s;--rot:-12deg;',
    '--top:9%;--left:64%;--dur:9.3s;--delay:0.9s;--rot:18deg;',
    '--top:7%;--left:86%;--dur:11s;--delay:1.9s;--rot:-8deg;',
    '--top:24%;--left:6%;--dur:9.8s;--delay:2.2s;--rot:5deg;',
    '--top:30%;--left:22%;--dur:8.9s;--delay:0.2s;--rot:-16deg;',
    '--top:34%;--left:74%;--dur:10.5s;--delay:1.1s;--rot:12deg;',
    '--top:27%;--left:91%;--dur:9.6s;--delay:2.8s;--rot:-10deg;',
    '--top:46%;--left:5%;--dur:11.2s;--delay:1.4s;--rot:14deg;',
    '--top:52%;--left:15%;--dur:8.7s;--delay:2.6s;--rot:-6deg;',
    '--top:50%;--left:84%;--dur:10.1s;--delay:0.7s;--rot:9deg;',
    '--top:44%;--left:94%;--dur:9.4s;--delay:1.8s;--rot:-18deg;',
    '--top:66%;--left:8%;--dur:10.7s;--delay:2.1s;--rot:4deg;',
    '--top:72%;--left:28%;--dur:8.8s;--delay:0.3s;--rot:-14deg;',
    '--top:75%;--left:66%;--dur:11.3s;--delay:1.6s;--rot:16deg;',
    '--top:69%;--left:89%;--dur:9.1s;--delay:2.4s;--rot:-7deg;',
    '--top:88%;--left:10%;--dur:10.4s;--delay:1.3s;--rot:11deg;',
    '--top:90%;--left:40%;--dur:9.7s;--delay:2.9s;--rot:-9deg;',
    '--top:87%;--left:73%;--dur:8.6s;--delay:0.5s;--rot:6deg;',
    '--top:92%;--left:92%;--dur:10.9s;--delay:1.7s;--rot:-15deg;'
];

const AUTH_KEY = 'is_cin_cin';
const VALID_USERNAME = 'xeens';

function injectSpaghettiBackground() {
    const field = document.createElement('div');
    field.className = 'spaghetti-field';
    field.setAttribute('aria-hidden', 'true');

    SPAGHETTI_POSITIONS.forEach((styleValue) => {
        const sprite = document.createElement('span');
        sprite.className = 'spaghetti';
        sprite.setAttribute('style', styleValue);
        field.appendChild(sprite);
    });

    document.body.prepend(field);
}

function setupAuth() {
    if (document.body.dataset.protected === 'true' && localStorage.getItem(AUTH_KEY) !== 'true') {
        window.location.href = 'index.html';
        return false;
    }

    if (document.body.dataset.page === 'landing') {
        const form = document.getElementById('gateForm');
        const input = document.getElementById('weplay_username');
        const error = document.getElementById('errorMessage');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const answer = (input.value || '').trim().toLowerCase();

            if (answer === VALID_USERNAME) {
                localStorage.setItem(AUTH_KEY, 'true');
                window.location.href = 'slide-intro.html';
                return;
            }

            error.textContent = 'are you really cin cin....? 😢';
        });
    }

    return true;
}

function setupDrawingWidget() {
    const openButton = document.createElement('button');
    openButton.id = 'openDrawWidget';
    openButton.className = 'draw-fab';
    openButton.type = 'button';
    openButton.textContent = 'Draw 💖';

    const modal = document.createElement('section');
    modal.id = 'drawWidgetModal';
    modal.className = 'draw-modal';
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="draw-panel" role="dialog" aria-modal="true" aria-label="Drawing widget">
            <div class="draw-top">
                <h3 class="draw-title">Drawing kaso single player :< 🎨</h3>
                <button id="closeDrawWidget" class="draw-close" type="button">Close</button>
            </div>
            <div class="draw-controls">
                <div class="draw-palette" aria-label="Drawing colors">
                    <button class="draw-dot active" type="button" data-color="#ff5fa7" style="background:#ff5fa7"></button>
                    <button class="draw-dot" type="button" data-color="#8d6bff" style="background:#8d6bff"></button>
                    <button class="draw-dot" type="button" data-color="#39b3ff" style="background:#39b3ff"></button>
                    <button class="draw-dot" type="button" data-color="#ff9c3f" style="background:#ff9c3f"></button>
                    <button class="draw-dot" type="button" data-color="#62c96f" style="background:#62c96f"></button>
                </div>
                <div class="draw-actions">
                    <button id="eraseDrawWidget" class="draw-tool" type="button">Eraser</button>
                    <button id="downloadDrawWidget" class="draw-tool" type="button">Download</button>
                    <button id="clearDrawWidget" class="draw-clear" type="button">Clear 🫧</button>
                </div>
            </div>
            <canvas id="globalDrawingBoard" aria-label="Drawing board popup"></canvas>
        </div>
    `;

    document.body.appendChild(openButton);
    document.body.appendChild(modal);

    const closeButton = document.getElementById('closeDrawWidget');
    const clearButton = document.getElementById('clearDrawWidget');
    const eraseButton = document.getElementById('eraseDrawWidget');
    const downloadButton = document.getElementById('downloadDrawWidget');
    const canvas = document.getElementById('globalDrawingBoard');
    const dots = document.querySelectorAll('.draw-dot');
    const context = canvas.getContext('2d');

    let drawing = false;
    let color = '#ff5fa7';
    let isEraser = false;

    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        canvas.height = Math.max(1, Math.floor(rect.height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 4;
    }

    function pointFromEvent(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function startDraw(event) {
        drawing = true;
        const point = pointFromEvent(event);
        context.beginPath();
        context.moveTo(point.x, point.y);
        event.preventDefault();
    }

    function draw(event) {
        if (!drawing) return;
        const point = pointFromEvent(event);

        if (isEraser) {
            context.globalCompositeOperation = 'destination-out';
            context.lineWidth = 18;
        } else {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = color;
            context.lineWidth = 4;
        }

        context.lineTo(point.x, point.y);
        context.stroke();
        event.preventDefault();
    }

    function endDraw() {
        drawing = false;
        context.closePath();
    }

    function openModal() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        resizeCanvas();
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            color = dot.dataset.color || '#ff5fa7';
            isEraser = false;
            eraseButton.classList.remove('active');
            dots.forEach((item) => item.classList.remove('active'));
            dot.classList.add('active');
        });
    });

    eraseButton.addEventListener('click', () => {
        isEraser = !isEraser;
        eraseButton.classList.toggle('active', isEraser);
        if (isEraser) {
            dots.forEach((item) => item.classList.remove('active'));
        } else if (!document.querySelector('.draw-dot.active')) {
            dots[0].classList.add('active');
            color = dots[0].dataset.color || '#ff5fa7';
        }
    });

    downloadButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'cin-cin-drawing.png';
        link.click();
    });

    clearButton.addEventListener('click', () => {
        const rect = canvas.getBoundingClientRect();
        context.clearRect(0, 0, rect.width, rect.height);
    });

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', endDraw);
    canvas.addEventListener('pointerleave', endDraw);

    window.addEventListener('resize', () => {
        if (modal.classList.contains('open')) resizeCanvas();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    injectSpaghettiBackground();

    if (!setupAuth()) {
        return;
    }

    if (document.body.dataset.page === 'finale') {
        setupDrawingWidget();
    }
});
