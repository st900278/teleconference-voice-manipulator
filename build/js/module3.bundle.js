/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 61);
/******/ })
/************************************************************************/
/******/ ({

/***/ 61:
/***/ (function(module, exports, __webpack_require__) {

/*global PitchAnalyzer:true, Float32Array:false, FFT:false */
/*jshint undef:true node:true browser:true */
var FFT = __webpack_require__(7);

PitchAnalyzer = this.PitchAnalyzer = (function () {

var	pi	= Math.PI,
	pi2	= pi * 2,
	cos	= Math.cos,
	pow	= Math.pow,
	log	= Math.log,
	max	= Math.max,
	min	= Math.min,
	abs	= Math.abs,
	LN10	= Math.LN10,
	sqrt	= Math.sqrt,
	atan2	= Math.atan2,
	round	= Math.round,
	inf	= 1/0,
	FFT_P	= 10,
	FFT_N	= 1 << FFT_P,
	BUF_N	= FFT_N * 2;

function remainder (val, div) {
	return val - round(val/div) * div;
}

function extend (obj) {
	var	args	= arguments,
		l	= args.length,
		i, n;


	for (i=1; i<l; i++){
		for (n in args[i]){
			if (args[i].hasOwnProperty(n)){
				obj[n] = args[i][n];
			}
		}
	}

	return obj;
}

/**
 * A class for tones.
 *
 * @class
 * @static PitchAnalyzer
 * @param default:0.0 min:0.0 type:Number freq The frequency of the tone.
 * @param default:-Infinity max:0.0 type:Number db The volume of the tone.
 * @param default:-Infinity max:0.0 type:Number stabledb An average of the volume of the tone.
 * @param default:0 min:0 type:Integer age How many times the tone has been detected in a row.
*/
function Tone () {
	this.harmonics = new Float32Array(Tone.MAX_HARM);
}

Tone.prototype = {
	freq: 0.0,
	db: -inf,
	stabledb: -inf,
	age: 0,

	toString: function () {
		return '{freq: ' + this.freq + ', db: ' + this.db + ', stabledb: ' + this.stabledb + ', age: ' + this.age + '}';
	},

/**
 * Return an approximation of whether the tone has the same frequency as provided.
 *
 * @method Tone
 * @private
 * @arg {Number} freq The frequency to compare to.
 * @return {Boolean} Whether it was a match.
*/
	matches: function (freq) {
		return abs(this.freq / freq - 1.0) < 0.05;
	},

	harmonics: null
};

Tone.MIN_AGE = 2;
Tone.MAX_HARM = 48;

/**
 * An internal class to manage the peak frequencies detected.
 *
 * @private
 * @class
 * @static PitchAnalyzer
 * @arg default:0.0 min:0.0 type:Number !freq The frequency of the peak.
 * @arg default:-Infinity max:0.0 type:Number !db The volume of the peak.
*/
function Peak (freq, db) {
	this.freq = typeof freq === 'undefined' ? this.freq : freq;
	this.db = typeof db === 'undefined' ? this.db : db;

	this.harm = new Array(Tone.MAX_HARM);
}

Peak.prototype = {
	harm: null,

	freq: 0.0,
	db: -inf,

/**
 * Resets the peak to default values.
 *
 * @method Peak
 * @private
*/
	clear: function () {
		this.freq	= Peak.prototype.freq;
		this.db		= Peak.prototype.db;
	}
};

/**
 * Finds the best matching peak from a certain point in the array of peaks.
 *
 * @name match
 * @static Peak
 * @private
 * @arg {Array} peaks The peaks to search from.
 * @arg {Integer} pos The position to find the match for.
 * @return {Peak} The best matching peak.
*/
Peak.match = function (peaks, pos) {
	var best = pos;

	if (peaks[pos - 1].db > peaks[best].db) best = pos - 1;
	if (peaks[pos + 1].db > peaks[best].db) best = pos + 1;

	return peaks[best];
};

/**
 * A class to analyze pitch from input data.
 *
 * @class PitchAnalyzer
 * @arg {Object} !options Options to override default values.
*/
function Analyzer (options) {
	options = extend(this, options);

	this.data = new Float32Array(FFT_N);
	this.buffer = new Float32Array(BUF_N);
	this.fftLastPhase = new Float32Array(BUF_N);
	this.tones = [];

	if (this.wnd === null) this.wnd = Analyzer.calculateWindow();
	this.setupFFT();
}

Analyzer.prototype = {
	wnd: null,
	data: null,
	fft: null,
	tones: null,
	fftLastPhase: null,
	buffer: null,

	offset: 0,
	bufRead: 0,
	bufWrite: 0,

	MIN_FREQ: 45,
	MAX_FREQ: 5000,

	sampleRate: 44100,
	step: 200,
	oldFreq: 0.0,

	peak: 0.0,

/**
 * Gets the current peak level in dB (negative value, 0.0 = clipping).
 *
 * @method PitchAnalyzer
 * @return {Number} The current peak level (db).
*/
	getPeak: function () {
		return 10.0 * log(this.peak) / LN10;
	},

	findTone: function (minFreq, maxFreq) {
		if (!this.tones.length) {
			this.oldFreq = 0.0;
			return null;
		}

		minFreq = typeof minFreq === 'undefined' ? 65.0 : minFreq;
		maxFreq = typeof maxFreq === 'undefined' ? 1000.0 : maxFreq;

		var db = max.apply(null, this.tones.map(Analyzer.mapdb));
		var best = null;
		var bestscore = 0;

		for (var i=0; i<this.tones.length; i++) {
			if (this.tones[i].db < db - 20.0 || this.tones[i].freq < minFreq || this.tones[i].age < Tone.MIN_AGE) continue;
			if (this.tones[i].freq > maxFreq) break;

			var score = this.tones[i].db - max(180.0, abs(this.tones[i].freq - 300)) / 10.0;

			if (this.oldFreq !== 0.0 && abs(this.tones[i].freq / this.oldFreq - 1.0) < 0.05) score += 10.0;
			if (best && bestscore > score) break;

			best = this.tones[i];
			bestscore = score;
		}

		this.oldFreq = (best ? best.freq : 0.0);
		return best;
	},

/**
 * Copies data to the internal buffers for processing and calculates peak.
 * Note that if the buffer overflows, unprocessed data gets discarded.
 *
 * @method PitchAnalyzer
 * @arg {Float32Array} data The input data.
*/
	input: function (data) {
		var buf = this.buffer;
		var r = this.bufRead;
		var w = this.bufWrite;

		var overflow = false;

		for (var i=0; i<data.length; i++) {
			var s = data[i];
			var p = s * s;

			if (p > this.peak) this.peak = p; else this.peak *= 0.999;

			buf[w] = s;

			w = (w + 1) % BUF_N;

			if (w === r) overflow = true;
		}

		this.bufWrite = w;
		if (overflow) this.bufRead = (w + 1) % BUF_N;
	},

/**
 * Processes available data and calculates tones.
 *
 * @method PitchAnalyzer
*/
	process: function () {
		while (this.calcFFT()) this.calcTones();
	},

/**
 * Matches new tones against old ones, merging similar ones.
 *
 * @method PitchAnalyzer
 * @private
*/
	mergeWithOld: function (tones) {
		var i, n;

		tones.sort(function (a, b) { return a.freq < b.freq ? -1 : a.freq > b.freq ? 1 : 0; });

		for (i=0, n=0; i<this.tones.length; i++) {
			while (n < tones.length && tones[n].freq < this.tones[i].freq) n++;

			if (n < tones.length && tones[n].matches(this.tones[i].freq)) {
				tones[n].age = this.tones[i].age + 1;
				tones[n].stabledb = 0.8 * this.tones[i].stabledb + 0.2 * tones[n].db;
				tones[n].freq = 0.5 * (this.tones[i].freq + tones[n].freq);
			} else if (this.tones[i].db > -80.0) {
				tones.splice(n, 0, this.tones[i]);
				tones[n].db -= 5.0;
				tones[n].stabledb -= 0.1;
			}

		}
	},

/**
 * Calculates the tones from the FFT data.
 *
 * @method PitchAnalyzer
 * @private
*/
	calcTones: function () {
		var	freqPerBin	= this.sampleRate / FFT_N,
			phaseStep	= pi2 * this.step / FFT_N,
			normCoeff	= 1.0 / FFT_N,
			minMagnitude	= pow(10, -100.0 / 20.0) / normCoeff,
			kMin		= ~~max(1, this.MIN_FREQ / freqPerBin),
			kMax		= ~~min(FFT_N / 2, this.MAX_FREQ / freqPerBin),
			peaks		= [],
			tones		= [],
			k, k2, p, n, t, count, freq, magnitude, phase, delta, prevdb, db, bestDiv,
			bestScore, div, score;

		for (k=0; k <= kMax; k++) {
			peaks.push(new Peak());
		}

		for (k=1, k2=2; k<=kMax; k++, k2 += 2) {
			/* complex absolute */
			magnitude = sqrt(this.fft[k2] * this.fft[k2] + this.fft[k2+1] * this.fft[k2+1]);
			/* complex arguscosine */
			phase = atan2(this.fft[k2+1], this.fft[k2]);

			delta = phase - this.fftLastPhase[k];
			this.fftLastPhase[k] = phase;

			delta -= k * phaseStep;
			delta = remainder(delta, pi2);
			delta /= phaseStep;

			freq = (k + delta) * freqPerBin;

			if (freq > 1.0 && magnitude > minMagnitude) {
				peaks[k].freq = freq;
				peaks[k].db = 20.0 * log(normCoeff * magnitude) / LN10;
			}
		}

		prevdb = peaks[0].db;

		for (k=1; k<kMax; k++) {
			db = peaks[k].db;
			if (db > prevdb) peaks[k - 1].clear();
			if (db < prevdb) peaks[k].clear();
			prevdb = db;
		}

		for (k=kMax-1; k >= kMin; k--) {
			if (peaks[k].db < -70.0) continue;

			bestDiv = 1;
			bestScore = 0;

			for (div = 2; div <= Tone.MAX_HARM && k / div > 1; div++) {
				freq = peaks[k].freq / div;
				score = 0;

				for (n=1; n<div && n<8; n++) {
					p = Peak.match(peaks, ~~(k * n / div));
					score--;
					if (p.db < -90.0 || abs(p.freq / n / freq - 1.0) > 0.03) continue;
					if (n === 1) score += 4;
					score += 2;
				}

				if (score > bestScore) {
					bestScore = score;
					bestDiv = div;
				}
			}

			t = new Tone();

			count = 0;

			freq = peaks[k].freq / bestDiv;

			t.db = peaks[k].db;

			for (n=1; n<=bestDiv; n++) {
				p = Peak.match(peaks, ~~(k * n / bestDiv));

				if (abs(p.freq / n / freq - 1.0) > 0.03) continue;

				if (p.db > t.db - 10.0) {
					t.db = max(t.db, p.db);
					count++;
					t.freq += p.freq / n;
				}

				t.harmonics[n - 1] = p.db;
				p.clear();
			}

			t.freq /= count;

			if (t.db > -50.0 - 3.0 * count) {
				t.stabledb = t.db;
				tones.push(t);
			}
		}

		this.mergeWithOld(tones);

		this.tones = tones;
	},

/**
 * Calculates the FFT for the input signal, if enough is available.
 *
 * @method PitchAnalyzer
 * @private
 * @return {Boolean} Whether there was enough data to process.
*/
	calcFFT: function () {
		var r = this.bufRead;

		if ((BUF_N + this.bufWrite - r) % BUF_N <= FFT_N) return false;

		for (var i=0; i<FFT_N; i++) {
			this.data[i] = this.buffer[(r + i) % BUF_N];
		}

		this.bufRead = (r + this.step) % BUF_N;

		this.processFFT(this.data, this.wnd);

		return true;
	},

	setupFFT: function () {
		var RFFT = typeof FFT !== 'undefined' && FFT;

		if (!RFFT) {
			try {
				RFFT = __webpack_require__(7);
			} catch (e) {
				throw Error("pitch.js requires fft.js");
			}
		}

		RFFT = RFFT.complex;

		this.rfft = new RFFT(FFT_N, false);
		this.fft = new Float32Array(FFT_N * 2);
		this.fftInput = new Float32Array(FFT_N);
	},

	processFFT: function (data, wnd) {
		var i;

		for (i=0; i<data.length; i++) {
			this.fftInput[i] = data[i] * wnd[i];
		}

		this.rfft.simple(this.fft, this.fftInput, 'real');
	}
};

Analyzer.mapdb = function (e) {
	return e.db;
};

Analyzer.Tone = Tone;

/**
 * Calculates a Hamming window for the size FFT_N, scaled up with FFT_N.
 *
 * @static PitchAnalyzer
 * @return {Float32Array} The hamming window.
*/
Analyzer.calculateWindow = function () {
	var	i,
		w = new Float32Array(FFT_N);

	for (i=0; i<FFT_N; i++) {
		w[i] = 0.53836 - 0.46164 * cos(pi2 * i / (FFT_N - 1));
	}

	return w;
};

return Analyzer;

}());

if (true) {
	module.exports = PitchAnalyzer;
}


/***/ }),

/***/ 7:
/***/ (function(module, exports) {

/* Copyright (c) 2012, Jens Nockert <jens@ofmlabs.org>, Jussi Kalliokoski <jussi@ofmlabs.org>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

if (!FFT) {
	var FFT = {}
}

void function (namespace) {
	"use strict"
	
	function butterfly2(output, outputOffset, outputStride, fStride, state, m) {
		var t = state.twiddle
		
		for (var i = 0; i < m; i++) {
			var s0_r = output[2 * ((outputOffset) + (outputStride) * (i))], s0_i = output[2 * ((outputOffset) + (outputStride) * (i)) + 1]
			var s1_r = output[2 * ((outputOffset) + (outputStride) * (i + m))], s1_i = output[2 * ((outputOffset) + (outputStride) * (i + m)) + 1]
			
			var t1_r = t[2 * ((0) + (fStride) * (i))], t1_i = t[2 * ((0) + (fStride) * (i)) + 1]
			
			var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
			
			var r0_r = s0_r + v1_r, r0_i = s0_i + v1_i
			var r1_r = s0_r - v1_r, r1_i = s0_i - v1_i
			
			output[2 * ((outputOffset) + (outputStride) * (i))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = r0_i
			output[2 * ((outputOffset) + (outputStride) * (i + m))] = r1_r, output[2 * ((outputOffset) + (outputStride) * (i + m)) + 1] = r1_i
		}
	}
	
	function butterfly3(output, outputOffset, outputStride, fStride, state, m) {
		var t = state.twiddle
		var m1 = m, m2 = 2 * m
		var fStride1 = fStride, fStride2 = 2 * fStride
		
		var e = t[2 * ((0) + (fStride) * (m)) + 1]
		
		for (var i = 0; i < m; i++) {
			var s0_r = output[2 * ((outputOffset) + (outputStride) * (i))], s0_i = output[2 * ((outputOffset) + (outputStride) * (i)) + 1]
			
			var s1_r = output[2 * ((outputOffset) + (outputStride) * (i + m1))], s1_i = output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1]
			var t1_r = t[2 * ((0) + (fStride1) * (i))], t1_i = t[2 * ((0) + (fStride1) * (i)) + 1]
			var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
			
			var s2_r = output[2 * ((outputOffset) + (outputStride) * (i + m2))], s2_i = output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1]
			var t2_r = t[2 * ((0) + (fStride2) * (i))], t2_i = t[2 * ((0) + (fStride2) * (i)) + 1]
			var v2_r = s2_r * t2_r - s2_i * t2_i, v2_i = s2_r * t2_i + s2_i * t2_r
			
			var i0_r = v1_r + v2_r, i0_i = v1_i + v2_i
			
			var r0_r = s0_r + i0_r, r0_i = s0_i + i0_i
			output[2 * ((outputOffset) + (outputStride) * (i))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = r0_i
			
			var i1_r = s0_r - i0_r * 0.5
			var i1_i = s0_i - i0_i * 0.5
			
			var i2_r = (v1_r - v2_r) * e
			var i2_i = (v1_i - v2_i) * e
			
			var r1_r = i1_r - i2_i
			var r1_i = i1_i + i2_r
			output[2 * ((outputOffset) + (outputStride) * (i + m1))] = r1_r, output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1] = r1_i
			
			var r2_r = i1_r + i2_i
			var r2_i = i1_i - i2_r
			output[2 * ((outputOffset) + (outputStride) * (i + m2))] = r2_r, output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1] = r2_i
		}
	}
	
	function butterfly4(output, outputOffset, outputStride, fStride, state, m) {
		var t = state.twiddle
		var m1 = m, m2 = 2 * m, m3 = 3 * m
		var fStride1 = fStride, fStride2 = 2 * fStride, fStride3 = 3 * fStride
		
		for (var i = 0; i < m; i++) {
			var s0_r = output[2 * ((outputOffset) + (outputStride) * (i))], s0_i = output[2 * ((outputOffset) + (outputStride) * (i)) + 1]
			
			var s1_r = output[2 * ((outputOffset) + (outputStride) * (i + m1))], s1_i = output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1]
			var t1_r = t[2 * ((0) + (fStride1) * (i))], t1_i = t[2 * ((0) + (fStride1) * (i)) + 1]
			var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
			
			var s2_r = output[2 * ((outputOffset) + (outputStride) * (i + m2))], s2_i = output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1]
			var t2_r = t[2 * ((0) + (fStride2) * (i))], t2_i = t[2 * ((0) + (fStride2) * (i)) + 1]
			var v2_r = s2_r * t2_r - s2_i * t2_i, v2_i = s2_r * t2_i + s2_i * t2_r
			
			var s3_r = output[2 * ((outputOffset) + (outputStride) * (i + m3))], s3_i = output[2 * ((outputOffset) + (outputStride) * (i + m3)) + 1]
			var t3_r = t[2 * ((0) + (fStride3) * (i))], t3_i = t[2 * ((0) + (fStride3) * (i)) + 1]
			var v3_r = s3_r * t3_r - s3_i * t3_i, v3_i = s3_r * t3_i + s3_i * t3_r
			
			var i0_r = s0_r + v2_r, i0_i = s0_i + v2_i
			var i1_r = s0_r - v2_r, i1_i = s0_i - v2_i
			var i2_r = v1_r + v3_r, i2_i = v1_i + v3_i
			var i3_r = v1_r - v3_r, i3_i = v1_i - v3_i
			
			var r0_r = i0_r + i2_r, r0_i = i0_i + i2_i
			
			if (state.inverse) {
				var r1_r = i1_r - i3_i
				var r1_i = i1_i + i3_r
			} else {
				var r1_r = i1_r + i3_i
				var r1_i = i1_i - i3_r
			}
			
			var r2_r = i0_r - i2_r, r2_i = i0_i - i2_i
			
			if (state.inverse) {
				var r3_r = i1_r + i3_i
				var r3_i = i1_i - i3_r
			} else {
				var r3_r = i1_r - i3_i
				var r3_i = i1_i + i3_r
			}
			
			output[2 * ((outputOffset) + (outputStride) * (i))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = r0_i
			output[2 * ((outputOffset) + (outputStride) * (i + m1))] = r1_r, output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1] = r1_i
			output[2 * ((outputOffset) + (outputStride) * (i + m2))] = r2_r, output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1] = r2_i
			output[2 * ((outputOffset) + (outputStride) * (i + m3))] = r3_r, output[2 * ((outputOffset) + (outputStride) * (i + m3)) + 1] = r3_i
		}
	}
	
	function butterfly(output, outputOffset, outputStride, fStride, state, m, p) {
		var t = state.twiddle, n = state.n, scratch = new Float64Array(2 * p)
		
		for (var u = 0; u < m; u++) {
			for (var q1 = 0, k = u; q1 < p; q1++, k += m) {
				var x0_r = output[2 * ((outputOffset) + (outputStride) * (k))], x0_i = output[2 * ((outputOffset) + (outputStride) * (k)) + 1]
				scratch[2 * (q1)] = x0_r, scratch[2 * (q1) + 1] = x0_i
			}
			
			for (var q1 = 0, k = u; q1 < p; q1++, k += m) {
				var tOffset = 0
				
				var x0_r = scratch[2 * (0)], x0_i = scratch[2 * (0) + 1]
				output[2 * ((outputOffset) + (outputStride) * (k))] = x0_r, output[2 * ((outputOffset) + (outputStride) * (k)) + 1] = x0_i
				
				for (var q = 1; q < p; q++) {
					tOffset = (tOffset + fStride * k) % n
					
					var s0_r = output[2 * ((outputOffset) + (outputStride) * (k))], s0_i = output[2 * ((outputOffset) + (outputStride) * (k)) + 1]
					
					var s1_r = scratch[2 * (q)], s1_i = scratch[2 * (q) + 1]
					var t1_r = t[2 * (tOffset)], t1_i = t[2 * (tOffset) + 1]
					var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
					
					var r0_r = s0_r + v1_r, r0_i = s0_i + v1_i
					output[2 * ((outputOffset) + (outputStride) * (k))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (k)) + 1] = r0_i
				}
			}
		}
	}
	
	function work(output, outputOffset, outputStride, f, fOffset, fStride, inputStride, factors, state) {
		var p = factors.shift()
		var m = factors.shift()
		
		if (m == 1) {
			for (var i = 0; i < p * m; i++) {
				var x0_r = f[2 * ((fOffset) + (fStride * inputStride) * (i))], x0_i = f[2 * ((fOffset) + (fStride * inputStride) * (i)) + 1]
				output[2 * ((outputOffset) + (outputStride) * (i))] = x0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = x0_i
			}
		} else {
			for (var i = 0; i < p; i++) {
				work(output, outputOffset + outputStride * i * m, outputStride, f, fOffset + i * fStride * inputStride, fStride * p, inputStride, factors.slice(), state)
			}
		}
		
		switch (p) {
			case 2: butterfly2(output, outputOffset, outputStride, fStride, state, m); break
			case 3: butterfly3(output, outputOffset, outputStride, fStride, state, m); break
			case 4: butterfly4(output, outputOffset, outputStride, fStride, state, m); break
			default: butterfly(output, outputOffset, outputStride, fStride, state, m, p); break
		}
	}
	
	var complex = function (n, inverse) {
		var n = ~~n, inverse = !!inverse
		
		if (n < 1) {
			throw new RangeError("n is outside range, should be positive integer, was `" + n + "'")
		}
		
		var state = {
			n: n,
			inverse: inverse,
			
			factors: [],
			twiddle: new Float64Array(2 * n),
			scratch: new Float64Array(2 * n)
		}
		
		var t = state.twiddle, theta = 2 * Math.PI / n
		
		for (var i = 0; i < n; i++) {
			if (inverse) {
				var phase =  theta * i
			} else {
				var phase = -theta * i
			}
			
			t[2 * (i)] = Math.cos(phase)
			t[2 * (i) + 1] = Math.sin(phase)
		}
		
		var p = 4, v = Math.floor(Math.sqrt(n))
		
		while (n > 1) {
			while (n % p) {
				switch (p) {
					case 4: p = 2; break
					case 2: p = 3; break
					default: p += 2; break
				}
				
				if (p > v) {
					p = n
				}
			}
			
			n /= p
			
			state.factors.push(p)
			state.factors.push(n)
		}
		
		this.state = state
	}
	
	complex.prototype.simple = function (output, input, t) {
		this.process(output, 0, 1, input, 0, 1, t)
	}
	
	complex.prototype.process = function(output, outputOffset, outputStride, input, inputOffset, inputStride, t) {
		var outputStride = ~~outputStride, inputStride = ~~inputStride
		
		var type = t == 'real' ? t : 'complex'
		
		if (outputStride < 1) {
			throw new RangeError("outputStride is outside range, should be positive integer, was `" + outputStride + "'")
		}
		
		if (inputStride < 1) {
			throw new RangeError("inputStride is outside range, should be positive integer, was `" + inputStride + "'")
		}
		
		if (type == 'real') {
			for (var i = 0; i < this.state.n; i++) {
				var x0_r = input[inputOffset + inputStride * i]
				var x0_i = 0.0
				
				this.state.scratch[2 * (i)] = x0_r, this.state.scratch[2 * (i) + 1] = x0_i
			}
			
			work(output, outputOffset, outputStride, this.state.scratch, 0, 1, 1, this.state.factors.slice(), this.state)
		} else {
			if (input == output) {
				work(this.state.scratch, 0, 1, input, inputOffset, 1, inputStride, this.state.factors.slice(), this.state)
				
				for (var i = 0; i < this.state.n; i++) {
					var x0_r = this.state.scratch[2 * (i)], x0_i = this.state.scratch[2 * (i) + 1]
					
					output[2 * ((outputOffset) + (outputStride) * (i))] = x0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = x0_i
				}
			} else {
				work(output, outputOffset, outputStride, input, inputOffset, 1, inputStride, this.state.factors.slice(), this.state)
			}
		}
	}
	
	namespace.complex = complex
}(FFT)

module.exports = FFT

/***/ })

/******/ });