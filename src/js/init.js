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
