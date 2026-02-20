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

/* ============================================================================
   📖 Global Variables
   ========================================================================== */

let devoResponse;  // Will hold the fetch() response for devotionals
let devoData;      // Parsed JSON data for devotionals

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


/* ============================================================================
   🙏 Run Today’s Devotional
   ========================================================================== */

/**
 * Displays the most recent devotional (latest series and latest day).
 * Automatically ensures data is loaded before running.
 */
async function runToday() {
    await loadDevos();

    const now = new Date();

    // Loop backward through series (newest → oldest)
    for (let i = devoData.length - 1; i >= 0; i--) {
        const series = devoData[i];

        // Filter released days
        const releasedDays = series.days
            .filter(day => {
                if (!day.release) return true; // no release date = released
                return new Date(day.release) <= now;
            })
            .sort((a, b) => new Date(a.release || 0) - new Date(b.release || 0));

        if (releasedDays.length === 0) {
            continue; // try previous series
        }

        const today = releasedDays[releasedDays.length - 1];

        $("series-name").innerText = series.series;
        $("day-number").innerText = "Day " + today.day;
        $("content").innerText = today.content;
        $("verses").innerText = (today.verses != undefined? "Verses: " + today.verses: "");

        if (today.extras) {
            $("extras").innerText = today.extras + "\n\n";
        }

        $("prayer").innerText = (today.prayers != undefined? "Prayers: " + today.prayers: "");

        return; // stop once we render
    }

    console.warn("No released devotionals found in any series.");
}

/* ============================================================================
   📚 List Page Builder
   ========================================================================== */

/**
 * Builds the devotional List accordion dynamically from devoData.
 * Each accordion section represents a series; each link represents a day.
 */
async function listDevos() {
    await loadDevos();

    const now = new Date();
    let string = "";

    devoData.forEach((dataPiece) => {
        string += `<div class="accordion-item">
            <div class="accordion-header">${dataPiece.series}</div>
            <div class="accordion-content">`;

        // Filter released days
        const releasedDays = dataPiece.days.filter(day => {
            if (!day.release) return true;
            return new Date(day.release) <= now;
        });

        // Render only released days
        releasedDays.forEach((day) => {
            const url = `devotional.html?series=${encodeURIComponent(dataPiece.series)}&day=${day.day}`;
            string += `<a href="${url}">Day ${day.day}</a><br>`;
        });

        // Optional: show message if none released
        if (releasedDays.length === 0) {
            string += `<div class="no-devos">No devotionals released yet.</div>`;
        }

        string += `</div></div>`;
    });

    $("main-container").innerHTML = string;

    // Accordion behavior
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    const accordionContents = document.querySelectorAll(".accordion-content");

    accordionHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const accordionItem = header.parentElement;
            const accordionContent = accordionItem.querySelector(".accordion-content");

            accordionContents.forEach((content) => {
                if (content !== accordionContent) {
                    content.classList.remove("active");
                }
            });

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

    $("series-name").innerText = seriesName;
    $("day-number").innerText = "Day " + dayNum;
    $("content").innerText = day.content;
    $("verses").innerText = (today.verses != undefined? "Verses: " + today.verses: "");

    if (day.extras != null || day.extras != undefined) {
        $("extras").innerText = day.extras + "\n\n";
    }

    $("prayer").innerText = (today.prayers != undefined? "Prayers: " + today.prayers: "");
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
    loadBible(); // Preload translation info
};
