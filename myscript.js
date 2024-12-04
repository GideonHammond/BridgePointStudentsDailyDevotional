"use strict;"
function $(id){
    return document.getElementById(id);
}

function checkHeadHeight(){
    var main = $("main");
    var header = $("header");
    var h = window.getComputedStyle(header).getPropertyValue("height");
    main.style.marginTop=h;
}

window.onload = function() {
    checkHeadHeight();
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});
const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));