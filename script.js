const video = document.getElementById("video");
const vidContain = document.getElementById("vidcontain");
//call the face detection/recgnition library
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
]).then(startWebcam).then(detectFacesNOW);

//access the camera
async function startWebcam() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Filter video input devices
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        // Check for external cameras first
        const externalCamera = videoDevices.find(device => device.label.includes('facing back'));

        if (externalCamera) {
            // Use the external camera if available
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: externalCamera.deviceId },
                audio: false
            });
            video.srcObject = stream;
        } else if (videoDevices.length > 0) {
            // If no external camera found, use the first available internal camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: videoDevices[0].deviceId },
                audio: false
            });
            video.srcObject = stream;
        } else {
            // No cameras found
            console.error("No video input devices found.");
        }
    } catch (error) {
        console.error(error);
    }
}
startWebcam();
//detecting a face
async function detectFacesNOW() {
    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        vidContain.appendChild(canvas);

        setInterval(async() => {
            const detections = await faceapi.detectAllFaces(
                video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, detections);
            faceapi.draw.drawFaceLandmarks(canvas, detections);

            // console.log(detections);
        }, 100);

    });
}
detectFacesNOW();