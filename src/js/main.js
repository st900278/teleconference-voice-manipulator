var PitchShiftNode = require('pitch-shift-node');
var PitchShift = require('soundbank-pitch-shift');
var math = require("mathjs");
var jStat = require('jStat').jStat;

var audioCtx, source, dest;
require("./pitch.js")

var pitchShiftSelf;
var pitchShiftOther;

var gainNodeSelf;
var gainNodeOther;
var isDetecting = false, isDetecting1 = false;

if (location.hash == "") {
  location.hash = Math.random().toString(36).substring(7);
}


if (navigator.mediaDevices) {
  console.log('getUserMedia supported.');
  navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    })
    .then(function(stream) {
      var pitchListSelf = [], pitchListSelfNew = [];

      var pitchAnalyzer = new PitchAnalyzer(44100), pitchAnalyzerNew = new PitchAnalyzer(44100);
      var pitchShiftSelf, gainNodeSelf, scriptNode, scriptNodeNew;
      audioCtx = new AudioContext();
      source = audioCtx.createMediaStreamSource(stream);
      dest = audioCtx.createMediaStreamDestination();




      pitchShiftSelf = PitchShift(audioCtx);

      gainNodeSelf = audioCtx.createGain();
      scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptNodeNew = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptNode.onaudioprocess = function (audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;
        var outputBuffer = audioProcessingEvent.outputBuffer;
        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
          var inputData = inputBuffer.getChannelData(channel);
          var outputData = outputBuffer.getChannelData(channel);

          pitchAnalyzer.input(inputData);
          pitchAnalyzer.process();
          var tone = pitchAnalyzer.findTone(60, 180);
          if (tone !== null) {
            //console.log('Old, frequency:', tone.freq);
            if(pitchListSelf.length >= 5000)pitchListSelf.shift();
            pitchListSelf.push(tone.freq);
            //console.log(pitchListSelf);
            jStat(pitchListSelf).quartiles(function(result){
              if(result[0] !== undefined){
                var IQR = result[2] - result[0];
                var lowerFence = result[0] - IQR * 1.5;
                var upperFence = result[2] + IQR * 1.5;
                var output = [];
                for(var i=0;i<pitchListSelf.length;i++){
                  if(pitchListSelf[i] > lowerFence && pitchListSelf[i] < upperFence)output.push(pitchListSelf[i]);
                }
                document.getElementById("self-pitch-mean").innerHTML = math.mean(output);
                document.getElementById("self-pitch-sd").innerHTML = math.std(output);
              }
            });

            //document.getElementById("self-pitch-mean").innerHTML = math.mean(pitchListSelf);
            //document.getElementById("self-pitch-sd").innerHTML = math.std(pitchListSelf);
          }
          for (var sample = 0; sample < inputBuffer.length; sample++) {
            outputData[sample] = inputData[sample];
          }
        }
      };
      scriptNodeNew.onaudioprocess = function (audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;
        var outputBuffer = audioProcessingEvent.outputBuffer;
        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
          var inputData = inputBuffer.getChannelData(channel);
          var outputData = outputBuffer.getChannelData(channel);

          pitchAnalyzerNew.input(inputData);
          pitchAnalyzerNew.process();
          var tone = pitchAnalyzerNew.findTone(80, 180);
          if (tone !== null) {
            //console.log('Found a tone, frequency:', tone.freq, 'volume:', tone.db);
            if(pitchListSelfNew.length >= 5000)pitchListSelfNew.shift();
            pitchListSelfNew.push(tone.freq);
            jStat(pitchListSelfNew).quartiles(function(result){
              if(result[0] !== undefined){
                var IQR = result[2] - result[0];
                var lowerFence = result[0] - IQR * 1.5;
                var upperFence = result[2] + IQR * 1.5;
                var output = [];
                for(var i=0;i<pitchListSelfNew.length;i++){
                  if(pitchListSelfNew[i] > lowerFence && pitchListSelfNew[i] < upperFence)output.push(pitchListSelfNew[i]);
                }
                document.getElementById("self-pitch-mean-new").innerHTML = math.mean(output);
                document.getElementById("self-pitch-sd-new").innerHTML = math.std(output);
                console.log("max", math.max(output));
                console.log(output);
              }
            });

          }
          for (var sample = 0; sample < inputBuffer.length; sample++) {
            outputData[sample] = inputData[sample];
          }
        }
      };
      gainNodeSelf.gain.value = 1;
      source.connect(gainNodeSelf);
      gainNodeSelf.connect(pitchShiftSelf);
      pitchShiftSelf.connect(dest);

      //dest.stream.addTrack(stream.getVideoTracks()[0]);
      pitchShiftSelf.transpose = 0;
      pitchShiftSelf.wet.value = 1;
      pitchShiftSelf.dry.value = 0;
      //source.connect(dest);
      document.querySelector("button#isDetect").addEventListener("click", function(){
        if(isDetecting){
          this.innerHTML = "Start Detect";
          isDetecting = false;
          source.disconnect();
          scriptNode.disconnect();
          gainNodeSelf.disconnect();
          pitchShiftSelf.disconnect();
          scriptNodeNew.disconnect();
          source.connect(gainNodeSelf);
          gainNodeSelf.connect(pitchShiftSelf);
          pitchShiftSelf.connect(dest);
        }
        else{
          console.log("test");
          this.innerHTML = "Stop Detect";
          isDetecting = true;
          source.disconnect();
          scriptNode.disconnect();
          gainNodeSelf.disconnect();
          pitchShiftSelf.disconnect();
          scriptNodeNew.disconnect();
          source.connect(scriptNode);
          scriptNode.connect(gainNodeSelf);
          gainNodeSelf.connect(pitchShiftSelf);
          pitchShiftSelf.connect(scriptNodeNew);
          scriptNodeNew.connect(dest);
        }
        document.getElementById("self-pitch-mean").innerHTML = "0";
        document.getElementById("self-pitch-sd").innerHTML = "0";
        document.getElementById("self-pitch-mean-new").innerHTML = "0";
        document.getElementById("self-pitch-sd-new").innerHTML = "0";
      });


      document.querySelector("input#self-pitch-shift").addEventListener("change", function() {
        console.log((this.value - 50) / 50);
        pitchShiftSelf.transpose = (this.value - 50) / 5;
        console.log(pitchShiftSelf.transpose);
      });

      document.querySelector("input#self-volume-shift").addEventListener("change", function() {
        gainNodeSelf.gain.value = Math.pow(10, ((this.value-15) / 20));
      });

      document.querySelector("button#clear-self").addEventListener("click", function(){
        pitchListSelf = [];
        pitchListSelfNew = [];
        document.getElementById("self-pitch-mean").innerHTML = "0";
        document.getElementById("self-pitch-sd").innerHTML = "0";
        document.getElementById("self-pitch-mean-new").innerHTML = "0";
        document.getElementById("self-pitch-sd-new").innerHTML = "0";
      });



    });
}


document.querySelector("#call").addEventListener("click", function(){
  $.post("/connect", {
      'room': location.hash
    }, function(res) {
      console.log(res);
      startStream(dest.stream, init = res.exist);
    }
    //
  );
});




function startStream(stream, init) {
  var Peer = require('simple-peer');
  var p = new Peer({
    initiator: init === 0,
    trickle: false,
    stream: stream
  });


  p.on('error', function(err) {
    console.log('error', err);
  })

  p.on('signal', function(data) {
    console.log('SIGNAL', JSON.stringify(data));
    console.log(p.initiator);

    $.post("/send", {
      'sdp': JSON.stringify(data),
      'room': location.hash,
      'host': p.initiator
    }, function(res) {
      if (p.initiator) {
        console.log("receive answer");
        var host_receive = function() {
          $.post("/receive", {
            'host': p.initiator,
            'room': location.hash
          }, function(res) {
            if(res == "fail"){
              setTimeout(host_receive, 2000);
            }
            else {
              console.log(res);
              p.signal(JSON.parse(res));
            }
          });
        };

        host_receive();
      }
    });
  })
  if (init !== 0) {
    console.log("test");
    var guest_receive = function() {
      $.post("/receive", {
        'host': p.initiator,
        'room': location.hash
      }, function(res) {
        if(res == "fail"){
          setTimeout(guest_receive, 2000);
        }
        else{
          console.log(res);
          p.signal(JSON.parse(res));
        }
      });
    };

    guest_receive();
  }


  p.on('connect', function() {
    console.log('CONNECT');
    p.send('whatever' + Math.random());
  });

  p.on('data', function(data) {
    console.log('data: ' + data);
  });

  p.on('stream', function(stream) {

    var pitchListOther = [], pitchListOtherNew = [];

    var pitchAnalyzer = new PitchAnalyzer(44100), pitchAnalyzerNew = new PitchAnalyzer(44100);
    var scriptNode, scriptNodeNew;
    var receiveAudioCtx, receiveSource, receiveDest;
    receiveAudioCtx = new AudioContext();
    receiveSource = receiveAudioCtx.createMediaStreamSource(stream);
    receiveDest = receiveAudioCtx.createMediaStreamDestination();

    pitchShiftOther = PitchShift(receiveAudioCtx);
    gainNodeOther = receiveAudioCtx.createGain();

    scriptNode = receiveAudioCtx.createScriptProcessor(4096, 1, 1);
    scriptNodeNew = receiveAudioCtx.createScriptProcessor(4096, 1, 1);

    scriptNode.onaudioprocess = function (audioProcessingEvent) {
      var inputBuffer = audioProcessingEvent.inputBuffer;
      var outputBuffer = audioProcessingEvent.outputBuffer;
      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);

        pitchAnalyzer.input(inputData);
        pitchAnalyzer.process();
        var tone = pitchAnalyzer.findTone(60, 250);
        if (tone !== null) {
          //console.log('Old, frequency:', tone.freq);
          if(pitchListOther.length >= 5000)pitchListOther.shift();
          pitchListOther.push(tone.freq);
          console.log(pitchListOther);
          jStat(pitchListOther).quartiles(function(result){
            if(result[0] !== undefined){
              var IQR = result[2] - result[0];
              var lowerFence = result[0] - IQR * 1.5;
              var upperFence = result[2] + IQR * 1.5;
              var output = [];
              for(var i=0;i<pitchListOther.length;i++){
                if(pitchListOther[i] > lowerFence && pitchListOther[i] < upperFence)output.push(pitchListOther[i]);
              }
              document.getElementById("other-pitch-mean").innerHTML = math.mean(output);
              document.getElementById("other-pitch-sd").innerHTML = math.std(output);
            }
          });

          //document.getElementById("other-pitch-mean").innerHTML = math.mean(pitchListOther);
          //document.getElementById("other-pitch-sd").innerHTML = math.std(pitchListOther);
        }
        for (var sample = 0; sample < inputBuffer.length; sample++) {
          outputData[sample] = inputData[sample];
        }
      }
    };
    scriptNodeNew.onaudioprocess = function (audioProcessingEvent) {
      var inputBuffer = audioProcessingEvent.inputBuffer;
      var outputBuffer = audioProcessingEvent.outputBuffer;
      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);

        pitchAnalyzerNew.input(inputData);
        pitchAnalyzerNew.process();
        var tone = pitchAnalyzerNew.findTone(60, 250);
        if (tone !== null) {
          console.log('Found a tone, frequency:', tone.freq, 'volume:', tone.db);
          if(pitchListOtherNew.length >= 5000)pitchListOtherNew.shift();
          pitchListOtherNew.push(tone.freq);
          jStat(pitchListOtherNew).quartiles(function(result){
            if(result[0] !== undefined){
              var IQR = result[2] - result[0];
              var lowerFence = result[0] - IQR * 1.5;
              var upperFence = result[2] + IQR * 1.5;
              var output = [];
              for(var i=0;i<pitchListOtherNew.length;i++){
                if(pitchListOtherNew[i] > lowerFence && pitchListOtherNew[i] < upperFence)output.push(pitchListOtherNew[i]);
              }
              document.getElementById("other-pitch-mean-new").innerHTML = math.mean(output);
              document.getElementById("other-pitch-sd-new").innerHTML = math.std(output);
            }
          });
        }
        for (var sample = 0; sample < inputBuffer.length; sample++) {
          outputData[sample] = inputData[sample];

        }
      }
    };

    gainNodeOther.gain.value = 1;
    receiveSource.connect(gainNodeOther);
    gainNodeOther.connect(pitchShiftOther);

    pitchShiftOther.connect(receiveAudioCtx.destination);
    //dest.stream.addTrack(stream.getVideoTracks()[0]);
    pitchShiftOther.transpose = 0;
    pitchShiftOther.wet.value = 1;
    pitchShiftOther.dry.value = 0;

    document.querySelector("button#isDetect").addEventListener("click", function(){
      if(isDetecting1){
        isDetecting1 = false;
        receiveSource.disconnect();
        scriptNode.disconnect();
        gainNodeOther.disconnect();
        pitchShiftOther.disconnect();
        scriptNodeNew.disconnect();

        receiveSource.connect(gainNodeOther);
        gainNodeOther.connect(pitchShiftOther);

        pitchShiftOther.connect(receiveAudioCtx.destination);
      }
      else{
        isDetecting1 = true;
        receiveSource.disconnect();
        scriptNode.disconnect();
        gainNodeOther.disconnect();
        pitchShiftOther.disconnect();
        scriptNodeNew.disconnect();

        receiveSource.connect(scriptNode);
        scriptNode.connect(gainNodeOther);
        gainNodeOther.connect(pitchShiftOther);

        pitchShiftOther.connect(scriptNodeNew);
        scriptNodeNew.connect(receiveAudioCtx.destination);
      }
      document.getElementById("other-pitch-mean").innerHTML = "0";
      document.getElementById("other-pitch-sd").innerHTML = "0";
      document.getElementById("other-pitch-mean-new").innerHTML = "0";
      document.getElementById("other-pitch-sd-new").innerHTML = "0";
    });


    //receiveSource.connect(receiveAudioCtx.destination);

    document.querySelector("input#other-pitch-shift").addEventListener("change", function() {
      //console.log((this.value - 50) / 50);
      pitchShiftOther.transpose = (this.value - 50) / 5;
      //console.log(pitchShiftOther.transpose);
    });

    document.querySelector("input#other-volume-shift").addEventListener("change", function() {
      gainNodeOther.gain.value = Math.pow(10, ((this.value-15) / 20));
    });

    document.querySelector("button#clear-other").addEventListener("click", function(){
      pitchListOther = [];
      pitchListOtherNew = [];
      document.getElementById("other-pitch-mean").innerHTML = "0";
      document.getElementById("other-pitch-sd").innerHTML = "0";
      document.getElementById("other-pitch-mean-new").innerHTML = "0";
      document.getElementById("other-pitch-sd-new").innerHTML = "0";
    });


    // got remote video stream, now let's show it in a video tag
    /*
    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(stream);
    video.play();
    */
  });

}
