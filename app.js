const openCamera = document.getElementById('openCamera');
const switchCamera = document.getElementById('switchCamera');
const takePhoto = document.getElementById('takePhoto');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const gallery = document.getElementById('gallery');
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
        return;
    }
    try {
        await startCamera(currentFacing);
    } catch (error) {
        stopStream();
        alert('No se pudo acceder a la cámara');
    }
});

switchCamera.addEventListener('click', async () => {
    const nextFacing = currentFacing === 'environment' ? 'user' : 'environment';
    try {
        await startCamera(nextFacing);
    } catch (error) {
        alert('La cámara solicitada no está disponible');
        if (!stream) {
            try {
                await startCamera(currentFacing);
            } catch (_) {
                stopStream();
            }
        }
    }
});

takePhoto.addEventListener('click', () => {
    if (!stream) {
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    const image = new Image();
    image.src = dataURL;
    image.width = 80;
    image.height = 60;
    gallery.appendChild(image);
});

window.addEventListener('beforeunload', stopStream);
