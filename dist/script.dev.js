"use strict";

var video = document.getElementById("video");
var vidContain = document.getElementById("vidcontain"); //call the face detection/recgnition library

Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri("/models"), faceapi.nets.faceLandmark68Net.loadFromUri("/models"), faceapi.nets.faceRecognitionNet.loadFromUri("/models"), faceapi.nets.ssdMobilenetv1.loadFromUri("/models")]).then(startWebcam).then(detectFacesNOW).then(faceRecognition); //access the camera

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

startWebcam(); //create the canvas on which detection and recognition will be done
//detecting a face

function detectFacesNOW() {
  return regeneratorRuntime.async(function detectFacesNOW$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          video.addEventListener('play', function () {
            var canvas = faceapi.createCanvasFromMedia(video);
            vidContain.appendChild(canvas);
            faceapi.matchDimensions(canvas, {
              height: video.height,
              width: video.width
            });
            setInterval(function _callee() {
              var detections, resizedDetections;
              return regeneratorRuntime.async(function _callee$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return regeneratorRuntime.awrap(faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks());

                    case 2:
                      detections = _context2.sent;
                      //resizing the landmark canvas to fit the size ofthe face
                      resizedDetections = faceapi.resizeResults(detections, {
                        height: video.height,
                        width: video.width
                      });
                      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); //draw canvas

                      faceapi.draw.drawDetections(canvas, resizedDetections);
                      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); // console.log(detections);

                    case 7:
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

detectFacesNOW(); //getting and checking faces in the folders

function getLabelFace() {
  var labels = ["Dickson"];
  return Promise.all(labels.map(function _callee2(label) {
    var descriptions, i, image, seeFace;
    return regeneratorRuntime.async(function _callee2$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            descriptions = [];
            i = 1;

          case 2:
            if (!(i <= 3)) {
              _context4.next = 13;
              break;
            }

            _context4.next = 5;
            return regeneratorRuntime.awrap(faceapi.fetchImage("/imgdata/".concat(label, "/").concat(i, ".jpg")));

          case 5:
            image = _context4.sent;
            _context4.next = 8;
            return regeneratorRuntime.awrap(faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor());

          case 8:
            seeFace = _context4.sent;
            descriptions.push(seeFace.descriptor);

          case 10:
            i++;
            _context4.next = 2;
            break;

          case 13:
            return _context4.abrupt("return", new faceapi.LabeledFaceDescriptors(label, descriptions));

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    });
  }));
}

function faceRecognition() {
  var LabeledFace, faceMatcher;
  return regeneratorRuntime.async(function faceRecognition$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(getLabelFace());

        case 2:
          LabeledFace = _context6.sent;
          faceMatcher = new faceapi.FaceMatcher(LabeledFace);
          video.addEventListener('play', function () {
            var canvas = faceapi.createCanvasFromMedia(video);
            vidContain.appendChild(canvas);
            faceapi.matchDimensions(canvas, {
              height: video.height,
              width: video.width
            });
            setInterval(function _callee3() {
              var detections, resizedDetections, results;
              return regeneratorRuntime.async(function _callee3$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.next = 2;
                      return regeneratorRuntime.awrap(faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptor());

                    case 2:
                      detections = _context5.sent;
                      //resizing the landmark canvas to fit the size ofthe face
                      resizedDetections = faceapi.resizeResults(detections, {
                        height: video.height,
                        width: video.width
                      });
                      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); //match results and recognize faces

                      results = resizedDetections.map(function (d) {
                        return faceMatcher.findBestMatch(d.descriptor);
                      });
                      results.forEach(function (result, i) {
                        var box = resizedDetections[i].detection.box;
                        var drawBox = new faceapi.draw.DrawBox(box, {
                          label: result
                        });
                        drawBox.draw(canvas);
                      });

                    case 7:
                    case "end":
                      return _context5.stop();
                  }
                }
              });
            }, 100);
          });

        case 5:
        case "end":
          return _context6.stop();
      }
    }
  });
}

faceRecognition();