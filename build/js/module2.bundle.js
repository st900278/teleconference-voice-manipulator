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
/******/ 	return __webpack_require__(__webpack_require__.s = 578);
/******/ })
/************************************************************************/
/******/ ({

/***/ 578:
/***/ (function(module, exports) {

$('select').material_select();

document.querySelector("input#self-pitch-shift").value = "50";
document.querySelector("input#self-volume-shift").value = "15";

document.querySelector("input#self-pitch-shift").addEventListener("change", function(){
  document.querySelector("#self-pitch-data").innerHTML = (this.value-50)/50;
});

document.querySelector("input#self-volume-shift").addEventListener("change", function(){
  document.querySelector("#self-volume-data").innerHTML = this.value-15;
});

document.querySelector("input#other-pitch-shift").value = "50";
document.querySelector("input#other-volume-shift").value = "15";

document.querySelector("input#other-pitch-shift").addEventListener("change", function(){
  document.querySelector("#other-pitch-data").innerHTML = (this.value-50)/50;
});

document.querySelector("input#other-volume-shift").addEventListener("change", function(){
  document.querySelector("#other-volume-data").innerHTML = this.value-15;
});



var status_tabs = document.querySelectorAll("div#status-select a");
console.log(status_tabs);

for (var tab of status_tabs){
  tab.addEventListener("click",function(e){
    var target = this.getAttribute("data-target");
    console.log(target);
    document.querySelectorAll("div.control-panel").forEach(function(elem, idx, array){
      elem.classList.add("hide");}
    );
    document.querySelector("div#"+target).classList.remove("hide");

  });
}


/***/ })

/******/ });