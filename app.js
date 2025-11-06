const openCamera = document.getElementById('openCamera');
const switchCamera = document.getElementById('switchCamera');
const takePhoto = document.getElementById('takePhoto');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const gallery = document.getElementById('gallery');
const emptyGallery = document.getElementById('emptyGallery');
const statusMessage = document.getElementById('statusMessage');
const toneClasses = ['text-tone-muted', 'text-tone-success', 'text-tone-warning', 'text-tone-error'];

function setStatus(message, tone = 'muted') {
    if (!statusMessage) {
        return;
    }
    const toneMap = {
        muted: 'text-tone-muted',
        success: 'text-tone-success',
        warning: 'text-tone-warning',
        error: 'text-tone-error'
    };
    statusMessage.textContent = message;
    statusMessage.classList.remove(...toneClasses);
    statusMessage.classList.add(toneMap[tone] ?? toneMap.muted);
}

function hideEmptyState() {
    if (emptyGallery && !emptyGallery.classList.contains('hidden')) {
        emptyGallery.classList.add('hidden');
    }
}

let stream;
let currentFacing = 'environment';

function stopStream() {
    if (!stream) {
        return;
    }
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
}

async function startCamera(facing) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Sin soporte');
    }
    const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: facing
        }
    });
    stopStream();
    stream = newStream;
    video.srcObject = stream;
    currentFacing = facing;
}

openCamera.addEventListener('click', async () => {
    if (stream) {
        setStatus('La cámara ya está activa.', 'warning');
        return;
    }
    try {
        await startCamera(currentFacing);
        setStatus('Cámara lista. Puedes tomar una foto.', 'success');
    } catch (error) {
        stopStream();
        setStatus('No se pudo acceder a la cámara. Revisa los permisos.', 'error');
    }
});

switchCamera.addEventListener('click', async () => {
    const nextFacing = currentFacing === 'environment' ? 'user' : 'environment';
    try {
        await startCamera(nextFacing);
        const label = nextFacing === 'environment' ? 'trasera' : 'frontal';
        setStatus(`Cámara ${label} activada.`, 'success');
    } catch (error) {
        setStatus('La cámara solicitada no está disponible.', 'error');
        if (!stream) {
            try {
                await startCamera(currentFacing);
                setStatus('Restauramos la cámara anterior.', 'warning');
            } catch (_) {
                stopStream();
                setStatus('No hay cámaras disponibles en este dispositivo.', 'error');
            }
        }
    }
});

takePhoto.addEventListener('click', () => {
    if (!stream) {
        setStatus('Activa la cámara antes de tomar una foto.', 'warning');
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    const image = new Image();
    image.src = dataURL;
    image.alt = 'Foto capturada';
    image.loading = 'lazy';
    image.className = 'h-20 w-24 rounded-xl border border-ink-200 object-cover';
    gallery.appendChild(image);
    if (typeof gallery.scrollTo === 'function') {
        gallery.scrollTo({ left: gallery.scrollWidth, behavior: 'smooth' });
    } else {
        gallery.scrollLeft = gallery.scrollWidth;
    }
    hideEmptyState();
    setStatus('Foto guardada en la galería.', 'success');
});

window.addEventListener('beforeunload', stopStream);
