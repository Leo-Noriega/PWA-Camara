const openCamera = document.getElementById('openCamera');
const takePhoto = document.getElementById('takePhoto');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let stream;

openCamera.addEventListener('click', async () => {
    if (stream) {
        return;
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        video.srcObject = stream;
    } catch (error) {
        stream = null;
        alert('No se pudo acceder a la cámara');
    }
});

takePhoto.addEventListener('click', () => {
    if (!stream) {
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
});
