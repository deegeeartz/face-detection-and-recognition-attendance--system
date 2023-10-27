const video = document.getElementById("video");
const vidContain = document.getElementById("vidcontain");

async function setup() {
    await loadModels();
    const knownFaces = await loadKnownFaces();
    startWebcam(knownFaces);
}

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
}

async function loadKnownFaces() {
    const labels = ["Dickson", "lati"]; // Add more labels as needed
    const labeledFaceDescriptors = [];

    for (const label of labels) {
        const descriptions = [];

        for (let i = 1; i <= 3; i++) {
            const img = await faceapi.fetchImage(`/imgdata/${label}/${i}.jpg`);
            const detectedFace = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (detectedFace) {
                descriptions.push(detectedFace.descriptor);
            }
        }

        if (descriptions.length > 0) {
            labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptions));
        }
    }

    return labeledFaceDescriptors;
}

async function startWebcam(knownFaces) {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const stream = await getUserMedia(videoDevices);
        video.srcObject = stream;

        video.addEventListener('play', () => {
            const canvas = faceapi.createCanvasFromMedia(video);
            vidContain.appendChild(canvas);
            faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

            setInterval(async() => {
                const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
                const resizedDetections = faceapi.resizeResults(detections, { height: video.height, width: video.width });
                drawResults(resizedDetections, canvas, knownFaces);
            }, 100);
        });
    } catch (error) {
        console.error(error);
    }
}

function getUserMedia(videoDevices) {
    if (videoDevices.length > 0) {
        const preferredCamera = videoDevices.find(device => device.label.includes('facing back')) || videoDevices[0];
        return navigator.mediaDevices.getUserMedia({ video: { deviceId: preferredCamera.deviceId }, audio: false });
    } else {
        console.error("No video input devices found.");
        return Promise.reject("No video input devices found.");
    }
}

function drawResults(detections, canvas, knownFaces) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    const faceMatcher = new faceapi.FaceMatcher(knownFaces);

    detections.forEach(detection => {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
        drawBox.draw(canvas);
    });
}

setup();