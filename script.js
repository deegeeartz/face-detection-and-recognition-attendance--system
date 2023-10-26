const video = document.getElementById("video");
const vidContain = document.getElementById("vidcontain");
//call the face detection/recgnition library
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
]).then(startWebcam).then(detectFacesNOW).then(faceRecognition);

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
//create the canvas on which detection and recognition will be done

//detecting a face
async function detectFacesNOW() {
    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        vidContain.appendChild(canvas);
        faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

        setInterval(async() => {
            const detections = await faceapi.detectAllFaces(
                video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            //resizing the landmark canvas to fit the size ofthe face
            const resizedDetections = faceapi.resizeResults(detections, { height: video.height, width: video.width });

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            //draw canvas
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

            // console.log(detections);
        }, 100);

    });
}
detectFacesNOW();

//getting and checking faces in the folders
function getLabelFace() {
    const labels = ["Dickson"];
    return Promise.all(
        labels.map(async(label) => {

            const descriptions = []

            for (let i = 1; i <= 3; i++) {
                const image = await faceapi.fetchImage(`/imgdata/${label}/${i}.jpg`);

                const seeFace = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(seeFace.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}

async function faceRecognition() {
    const LabeledFace = await getLabelFace();
    const faceMatcher = new faceapi.FaceMatcher(LabeledFace);

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        vidContain.appendChild(canvas);
        faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

        setInterval(async() => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptor();
            //resizing the landmark canvas to fit the size ofthe face
            const resizedDetections = faceapi.resizeResults(detections, { height: video.height, width: video.width });

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            //match results and recognize faces
            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor);
            });

            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: result });
                drawBox.draw(canvas);
            });


        }, 100);

    });
}
faceRecognition();