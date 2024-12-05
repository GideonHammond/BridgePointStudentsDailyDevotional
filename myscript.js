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

const intersectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => intersectObserver.observe(el));

let isVisible = null;
let scrollStart = false;
let isShrunk = false;
let isScrolling = false;
const hero = $("hero-text");
const container = $("main");
setTimeout(enableScroll, 1500);
const options = {
    root:container,
    threshold:1
};
const callBack = (entries) => {
    isVisible = entries[0].isIntersecting;
};
const observer = new IntersectionObserver(callBack,options);
observer.observe(hero);
function enableScroll(){
    scrollStart = true;
}


window.onscroll = function (e) {
    if (isScrolling) {
        return;
    }

    if(!scrollStart){
        scrollTo(0,0);
    }
    if(isVisible && !isShrunk){
        hero.classList.add("shrunk");
        isShrunk = true;
    }else if(isVisible){
        hero.classList.remove("shrunk");
        isShrunk = false;
    }
    isScrolling = true;
    setTimeout(() => {
        isScrolling = false;
      }, 500);
}

