"use strict";

var video = document.getElementById("video");
var vidContain = document.getElementById("vidcontain");
var loadingOverlay = document.getElementById("loading-overlay");
var recognizingOverlay = document.getElementById("recognizing-overlay"); // Preload models and initialize FaceMatcher once models are loaded.

function initialize() {
  var knownFaces;
  return regeneratorRuntime.async(function initialize$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          loadingOverlay.classList.add("show");
          _context.next = 3;
          return regeneratorRuntime.awrap(loadModels());

        case 3:
          loadingOverlay.classList.remove("show");
          _context.next = 6;
          return regeneratorRuntime.awrap(loadKnownFaces());

        case 6:
          knownFaces = _context.sent;
          console.log("loading face");
          startWebcam(knownFaces);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
}

function loadModels() {
  return regeneratorRuntime.async(function loadModels$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Promise.all([faceapi.nets.ssdMobilenetv1.loadFromUri("/models"), faceapi.nets.faceLandmark68Net.loadFromUri("/models"), faceapi.nets.faceRecognitionNet.loadFromUri("/models"), faceapi.nets.tinyFaceDetector.loadFromUri("/models")]));

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function loadKnownFaces() {
  var labels, labeledFaceDescriptors, _i, _labels, label, descriptions, i, img, detectedFace;

  return regeneratorRuntime.async(function loadKnownFaces$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          labels = ["Dickson", "lati"]; // Add more labels as needed

          labeledFaceDescriptors = [];
          _i = 0, _labels = labels;

        case 3:
          if (!(_i < _labels.length)) {
            _context3.next = 22;
            break;
          }

          label = _labels[_i];
          descriptions = [];
          i = 1;

        case 7:
          if (!(i <= 3)) {
            _context3.next = 18;
            break;
          }

          _context3.next = 10;
          return regeneratorRuntime.awrap(faceapi.fetchImage("/imgdata/".concat(label, "/").concat(i, ".jpg")));

        case 10:
          img = _context3.sent;
          _context3.next = 13;
          return regeneratorRuntime.awrap(faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor());

        case 13:
          detectedFace = _context3.sent;

          if (detectedFace) {
            descriptions.push(detectedFace.descriptor);
          }

        case 15:
          i++;
          _context3.next = 7;
          break;

        case 18:
          if (descriptions.length > 0) {
            labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptions));
          }

        case 19:
          _i++;
          _context3.next = 3;
          break;

        case 22:
          return _context3.abrupt("return", labeledFaceDescriptors);

        case 23:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function startWebcam(knownFaces) {
  var devices, videoDevices, stream;
  return regeneratorRuntime.async(function startWebcam$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          recognizingOverlay.classList.add("show");
          _context5.prev = 1;
          _context5.next = 4;
          return regeneratorRuntime.awrap(navigator.mediaDevices.enumerateDevices());

        case 4:
          devices = _context5.sent;
          videoDevices = devices.filter(function (device) {
            return device.kind === 'videoinput';
          });
          _context5.next = 8;
          return regeneratorRuntime.awrap(getUserMedia(videoDevices));

        case 8:
          stream = _context5.sent;
          video.srcObject = stream;
          video.addEventListener('play', function () {
            var canvas = faceapi.createCanvasFromMedia(video);
            vidContain.appendChild(canvas);
            faceapi.matchDimensions(canvas, {
              height: video.videoHeight,
              width: video.videoWidth
            });
            recognizingOverlay.classList.remove("show");
            setInterval(function _callee() {
              var detections, resizedDetections;
              return regeneratorRuntime.async(function _callee$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      _context4.next = 2;
                      return regeneratorRuntime.awrap(faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors());

                    case 2:
                      detections = _context4.sent;
                      resizedDetections = faceapi.resizeResults(detections, {
                        height: video.videoHeight,
                        width: video.videoWidth
                      });
                      drawResults(resizedDetections, canvas, knownFaces);

                    case 5:
                    case "end":
                      return _context4.stop();
                  }
                }
              });
            }, 1000);
          });
          _context5.next = 16;
          break;

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](1);
          console.error(_context5.t0);

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 13]]);
} // Function to get user media


function getUserMedia(videoDevices) {
  if (videoDevices.length > 0) {
    var preferredCamera = videoDevices.find(function (device) {
      return device.label.includes('facing back');
    }) || videoDevices[0];
    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: preferredCamera.deviceId
      },
      audio: false
    });
  } else {
    console.error("No video input devices found.");
    return Promise.reject("No video input devices found.");
  }
}

function drawResults(detections, canvas, knownFaces) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  var faceMatcher = new faceapi.FaceMatcher(knownFaces);
  detections.forEach(function (detection) {
    var bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    var box = detection.detection.box;
    var drawBox = new faceapi.draw.DrawBox(box, {
      label: bestMatch.toString()
    });
    drawBox.draw(canvas);
  });
}

initialize();