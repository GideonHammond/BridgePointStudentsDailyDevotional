"use strict"; // Enforce strict mode for safer, cleaner JavaScript

/* ============================================================================
   🧩 Utility Functions
   ========================================================================== */

/**
 * Shortcut for document.getElementById()
 * Example: $("header") instead of document.getElementById("header")
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * Adjusts the <main> element’s top margin so it sits just below the header.
 * Ensures consistent layout when header height changes (responsive design).
 */
function checkHeadHeight() {
    const main = $("main");
    const header = $("header");
    const headerHeight = window.getComputedStyle(header).getPropertyValue("height");
    main.style.marginTop = headerHeight;
}

/* ============================================================================
   📖 Global Variables
   ========================================================================== */

let devoResponse;  // Will hold the fetch() response for devotionals
let devoData;      // Parsed JSON data for devotionals
const translation = "eng_kjv"; // Default Bible translation (can be changed)

/* ============================================================================
   🌐 Fetch Functions
   ========================================================================== */

/**
 * Loads the devotionals JSON data and stores it globally for later use.
 * Only retrieves data; it doesn’t display or render anything.
 */
async function loadDevos() {
    try {
        devoResponse = await fetch('devotionals.json');
        devoData = await devoResponse.json();
    } catch (error) {
        console.error("Error loading devotionals:", error);
    }
}

/**
 * Fetches the list of Bible books for the selected translation.
 * Logs the data for now — can later be expanded to populate a Bible reader.
 */
async function loadBible() {
    try {
        const bibleResponse = await fetch(`https://bible.helloao.org/api/${translation}/books.json`);
        const bibleData = await bibleResponse.json();
        console.log(bibleData);
    } catch (error) {
        console.error("Error loading Bible Translation:", error);
    }
}

/* ============================================================================
   🙏 Run Today’s Devotional
   ========================================================================== */

/**
 * Displays the most recent devotional (latest series and latest day).
 * Automatically ensures data is loaded before running.
 */
async function runToday() {
    await loadDevos(); // Ensure devotional data is available

    const latestSeries = devoData[devoData.length - 1];
    const today = latestSeries.days[latestSeries.days.length - 1];

    $("devotional").innerText = latestSeries.series;
    $("content").innerText = today.content;
    $("verses").innerText = today.verses;

    if (today.extras) {
        $("extras").innerText = today.extras + "\n\n";
    }

    $("prayer").innerText = today.prayer;
}

/* ============================================================================
   📚 List Page Builder
   ========================================================================== */

/**
 * Builds the devotional List accordion dynamically from devoData.
 * Each accordion section represents a series; each link represents a day.
 */
async function listDevos() {
    await loadDevos(); // Make sure data is available

    let string = ""; // HTML builder string

    devoData.forEach((dataPiece) => {
        string += `<div class="accordion-item">
            <div class="accordion-header">${dataPiece.series}</div>
            <div class="accordion-content">`;

        // Generate day links for each devotional series
        for (let i = 1; i <= dataPiece.days.length; i++) {
            const url = `devotional.html?series=${encodeURIComponent(dataPiece.series)}&day=${i}`;
            string += `<a href="${url}">Day ${i}</a><br>`;
        }

        string += `</div></div>`;
    });

    $("main-container").innerHTML = string;

    // Handle accordion toggling
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    const accordionContents = document.querySelectorAll(".accordion-content");

    accordionHeaders.forEach((header) => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const accordionContent = accordionItem.querySelector(".accordion-content");

            // Close all other open accordions
            accordionContents.forEach((content) => {
                if (content !== accordionContent) {
                    content.classList.remove("active");
                }
            });

            // Toggle current accordion open/closed
            accordionContent.classList.toggle("active");
        });
    });
}

/* ============================================================================
   🔍 URL Helpers & Redirects
   ========================================================================== */

/**
 * Extracts a specific query parameter from the URL.
 * Example: getParam("series") → returns value of ?series=...
 */
function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Redirects the user to the devotional list page (after a delay or error).
 */
function redirect() {
    document.location.href = "https://bpsdd.com/list.html";
}

/* ============================================================================
   📖 Load a Specific Devotional (by series & day)
   ========================================================================== */

/**
 * Loads and displays a single devotional entry based on URL query params.
 * Example: devotional.html?series=Faith&day=3
 */
async function loadDevotional() {
    await loadDevos(); // Ensure data is available first

    const seriesName = getParam("series");
    const dayNum = parseInt(getParam("day"));

    const series = devoData.find(s => s.series === seriesName);
    const day = series?.days.find(d => d.day === dayNum);

    if (!series || !day) {
        document.body.innerHTML = "<p style='text-align:center;font-size:20px;padding:49vh;'>Devotional not found. Redirecting in 2s...</p>";
        setTimeout(redirect, 2000);
        return;
    }

    $("hero-text").innerText = seriesName;
    $("devotional").innerText = "Day " + dayNum;
    $("content").innerText = day.content;
    $("verses").innerText = day.verses;

    if (day.extras != null || day.extras != undefined) {
        $("extras").innerText = day.extras + "\n\n";
    }

    $("prayer").innerText = day.prayer;
}

/* ============================================================================
   👀 Intersection Observer Animations
   ========================================================================== */

/**
 * Fades in / animates elements with the class "hidden"
 * when they enter the viewport.
 */
const intersectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => intersectObserver.observe(el));

/* ============================================================================
   📱 Mobile Navigation Controls
   ========================================================================== */

/**
 * Opens the full-screen mobile navigation overlay.
 */
function openNav() {
    $("id-mobile-menu").style.width = "100%";
}

/**
 * Closes the mobile navigation overlay.
 */
function closeNav() {
    $("id-mobile-menu").style.width = "0";
}

/* ============================================================================
   🚀 Page Initialization
   ========================================================================== */

/**
 * Runs when the page finishes loading:
 * - Adjust header spacing
 * - Preload Bible data for reference
 */
window.onload = function() {
    checkHeadHeight();
    loadBible(); // Preload translation info
};
