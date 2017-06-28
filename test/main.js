'use strict';

var PitchShiftNode = require('pitch-shift-node');
var PitchShift2 = require('soundbank-pitch-shift');

// Put variables in global scope to make them available to the browser console.
var audio = document.querySelector('audio');

var constraints = window.constraints = {
  audio: true,
  video: false
};

function handleSuccess(stream) {
  var audioCtx = new AudioContext();
  var source = audioCtx.createMediaStreamSource(stream);
  var pitchShift = PitchShift2(audioCtx);
  var gainNode = audioCtx.createGain();
  //var pitchNode = new PitchShiftNode(audioCtx,4);
  source.connect(gainNode);
  gainNode.connect(pitchShift);
  pitchShift.connect(audioCtx.destination);
  pitchShift.transpose = 0;
  pitchShift.wet.value = 1;
  pitchShift.dry.value = 0;
  gainNode.gain.value = 0.3;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);
