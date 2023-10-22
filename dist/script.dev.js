"use strict";

var video = document.getElementById("video");
var vidContain = document.getElementById("vidcontain"); //call the face detection/recgnition library

Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri("/models"), faceapi.nets.faceLandmark68Net.loadFromUri("/models"), faceapi.nets.faceRecognitionNet.loadFromUri("/models"), faceapi.nets.ssdMobilenetv1.loadFromUri("/models")]).then(startWebcam).then(detectFacesNOW); //access the camera

function startWebcam() {
  var devices, videoDevices, externalCamera, stream, _stream;

  return regeneratorRuntime.async(function startWebcam$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(navigator.mediaDevices.enumerateDevices());

        case 3:
          devices = _context.sent;
          // Filter video input devices
          videoDevices = devices.filter(function (device) {
            return device.kind === 'videoinput';
          }); // Check for external cameras first

          externalCamera = videoDevices.find(function (device) {
            return device.label.includes('facing back');
          });

          if (!externalCamera) {
            _context.next = 13;
            break;
          }

          _context.next = 9;
          return regeneratorRuntime.awrap(navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: externalCamera.deviceId
            },
            audio: false
          }));

        case 9:
          stream = _context.sent;
          video.srcObject = stream;
          _context.next = 21;
          break;

        case 13:
          if (!(videoDevices.length > 0)) {
            _context.next = 20;
            break;
          }

          _context.next = 16;
          return regeneratorRuntime.awrap(navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: videoDevices[0].deviceId
            },
            audio: false
          }));

        case 16:
          _stream = _context.sent;
          video.srcObject = _stream;
          _context.next = 21;
          break;

        case 20:
          // No cameras found
          console.error("No video input devices found.");

        case 21:
          _context.next = 26;
          break;

        case 23:
          _context.prev = 23;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 23]]);
}

startWebcam(); //detecting a face

function detectFacesNOW() {
  return regeneratorRuntime.async(function detectFacesNOW$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          video.addEventListener('play', function () {
            var canvas = faceapi.createCanvasFromMedia(video);
            vidContain.appendChild(canvas);
            setInterval(function _callee() {
              var detections;
              return regeneratorRuntime.async(function _callee$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return regeneratorRuntime.awrap(faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks());

                    case 2:
                      detections = _context2.sent;
                      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                      faceapi.draw.drawDetections(canvas, detections);
                      faceapi.draw.drawFaceLandmarks(canvas, detections); // console.log(detections);

                    case 6:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            }, 100);
          });

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}

detectFacesNOW();