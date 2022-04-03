$(function () {

  // Create absolutely-positioned element to store toasts
  // also try to isolate bootstrap with .bootstrapiso
  // per https://github.com/cryptoapi/Isolate-Bootstrap-4.1-CSS-Themes
  let toastHolderHTML = `
    <!-- Position it -->
    <div id="toast-wrapper"
      class="bootstrapiso"
      >

      <!-- This is the real content holder (hidden on small screens) -->
      <div class="d-none d-lg-block">
        <!-- Then put toasts within -->
        <div id="toast-holder"></div>
      </div>
    </div>
  `;
  $(toastHolderHTML).appendTo("body");

  // This lets us wait X milliseconds synchronously
  // From https://stackoverflow.com/a/47480429
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // This will be set to false once we've matched, and that
  // will let us break out
  let hasMatched = false;

  // Read FOMO config to figure out what to do
  FOMO_CONFIG.forEach((configObject) => {
    // See if it matches the URL
    if (!hasMatched &&
      configObject.pageRegex.test(window.location.href)) {
      // console.log("MATCHED", configObject);
      // Loop through the toasts
      configObject.toasts.forEach(async (toastInfo) => {
        // Wait until we're ready
        // Cut wait times by 10 if we're not in prod, for easier testing
        // (also cut it on webflow so it's more authentic)
        // let inProd = window.location.href.indexOf(ENGAUTHORITY_DOMAIN) > -1 ||
        //   window.location.href.indexOf(UPLEVEL_DOMAIN) > -1 ||
        //   window.location.href.indexOf("webflow.io") > -1;
        // NEW: you're in prod as long as you're on HTTP(S) (not file://)
        let inProd = window.location.href.indexOf("http") > -1;
        let delayMultiplier = inProd ? 1 : 1 / 10;
        await delay(toastInfo.time * delayMultiplier);

        // Now create and show
        createAndShowToast({
          messageHTML: toastInfo.text,
          ctaURL: toastInfo.ctaURL,
          icon: toastInfo.icon,
          duration: toastInfo.duration,
          timeframe: toastInfo.timeframe || "the last 24 hours",
        });
      });

      // We will only match one, so let's drop out
      // (this lets us have a "fallback" default)
      // console.log(configObject.pageRegex);
      hasMatched = true;
    }
  });
});


/** Constants **/
const CheckoutPages = {
  UPLEVEL: "https://course.productalliance.com/offers/oxK3u8jm/checkout",
  // The normal EA checkout page
  ENGAUTHORITY: "https://course.engauthority.com/offers/6m8pnaBY/checkout",
  // The variant of the EngAuthority checkout page that highlights the
  // iPad offer
  EA_IPAD: "https://course.engauthority.com/offers/LvoqAHBS/checkout",
  // This variant is for the iPhone offer
  EA_IPHONE: "https://course.engauthority.com/offers/WUXbz2HE/checkout",


  // Company-specific EA checkouts
  EA_ORACLE_IPAD: "https://course.engauthority.com/offers/k6djLw3o",
  EA_PAYPAL_IPAD: "https://course.engauthority.com/offers/S3LefkgZ",
  EA_CK_IPAD: "https://course.engauthority.com/offers/u2Cd2tqe",
};

// List of domains we could be on, one per course. We set it up so that
// it short-circuits after it finds the first one that matches, so you can
// put more specific ones up top and more general ones at the bottom.
const DomainRegexes = {
  // Work for productuplevel.com or productuplevel.webflow.io
  // (so that that site is an accurate simulation)
  UPLEVEL: /productuplevel\./i,

  // For EA, we'll have two different setups: one for the iPad promo page, one
  // for everyone else. That promo lives at:
  //  https://www.engauthority.com/promo/20225525
  EA_IPAD: /engauthority\..*\/promo\/20225525/i,
  // Oh and another promo for the iPhone promo
  EA_IPHONE: /engauthority\..*\/promo\/48330318/i,
  ENGAUTHORITY: /engauthority\./i,
}

// Shorthand to check if the page we're on matches a given regex.
function matchUrlWithRegex(regex) {
  return regex.test(window.location.href);
}

// Icon SVG shorthands; drop into HTML.
// These are all from Bootstrap Icons. If you want to add a new one, be sure
// to swap its native width and height for 1em.
const ICONS = {
  "book": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-book" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M1 2.828v9.923c.918-.35 2.107-.692 3.287-.81 1.094-.111 2.278-.039 3.213.492V2.687c-.654-.689-1.782-.886-3.112-.752-1.234.124-2.503.523-3.388.893zm7.5-.141v9.746c.935-.53 2.12-.603 3.213-.493 1.18.12 2.37.461 3.287.811V2.828c-.885-.37-2.154-.769-3.388-.893-1.33-.134-2.458.063-3.112.752zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
</svg>`,
  "book_half": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-book-half" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M8.5 2.687v9.746c.935-.53 2.12-.603 3.213-.493 1.18.12 2.37.461 3.287.811V2.828c-.885-.37-2.154-.769-3.388-.893-1.33-.134-2.458.063-3.112.752zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
</svg>`,
  "video": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-file-play-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM6 5.883v4.234a.5.5 0 0 0 .757.429l3.528-2.117a.5.5 0 0 0 0-.858L6.757 5.454a.5.5 0 0 0-.757.43z"/>
</svg>`,
  "bullseye": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-bullseye" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10zm0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
  <path fill-rule="evenodd" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
  <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
  "cart": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-cart-check-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM4 14a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm7 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm.354-7.646a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"/>
</svg>`,
  "briefcase": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-briefcase-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z"/>
  <path fill-rule="evenodd" d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5v1.384l-7.614 2.03a1.5 1.5 0 0 1-.772 0L0 5.884V4.5zm5-2A1.5 1.5 0 0 1 6.5 1h3A1.5 1.5 0 0 1 11 2.5V3h-1v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V3H5v-.5z"/>
</svg>`,
  "verified": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-patch-check-fll" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984a.5.5 0 0 0-.708-.708L7 8.793 5.854 7.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"/>
                </svg>`,
  "check_circle": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
</svg>`,
  "reels": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-camera-reels-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M0 8a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 7.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 16H2a2 2 0 0 1-2-2V8z"/>
  <circle cx="3" cy="3" r="3"/>
  <circle cx="9" cy="3" r="3"/>
</svg>`,
  "play": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-play-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
</svg>`,
  "right_arrow": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-right-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-11.5.5a.5.5 0 0 1 0-1h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5z"/>
</svg>`,
  "cash":
    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/>
    <path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1h-.003zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195l.054.012z"/>
    <path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083c.058-.344.145-.678.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1H1z"/>
    <path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 5.982 5.982 0 0 1 3.13-1.567z"/></svg>`,
  "file":
    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-file-text-fill" viewBox="0 0 16 16">
    <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z"/></svg>`,
  "mortarboard":
    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-mortarboard-fill" viewBox="0 0 16 16">
    <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
    <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/></svg>`,
  "gift":
    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-gift-fill" viewBox="0 0 16 16">
    <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zm6 4v7.5a1.5 1.5 0 0 1-1.5 1.5H9V7h6zM2.5 16A1.5 1.5 0 0 1 1 14.5V7h6v9H2.5z"/>
    </svg>`,
  "document":
    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-file-text-fill" viewBox="0 0 16 16">
    <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z"/>
    </svg>`,
};


/*
 * Public functions that we can call from anywhere on the page.
 */
// Shows the popup that advertises the reimbursement request letter
// and asks the user to input their email address.
// Note that we reference this function name in a "javascript:" link, so
// be sure to Cmd+F thoroughly to catch all instances of this function name
function showEmailPopup() {
  // Open the modal...
  $('#webinarpopup').css({ "display": "flex", "opacity": 1 });
  $('.main-popup').css({ "display": "flex", "opacity": 1 });
  $('.popup-overlay').css({ "display": "flex", "opacity": 1 });
  // Also get focus on the text field in the popup
  $('#email-2').focus();
}


/**
  Opens the modal that informs the user about the iPad promo and lets them
  enter their email address.
*/
function showiPadPromoPopup() {
  // Open the modal
  $('.popup-container-ipad').css({ "display": "flex", "opacity": 1 });
  $('.popup-overlay-ipad').css({ "display": "flex", "opacity": 1 });
  $('.main-popup-ipad').css({ "display": "flex", "opacity": 1 });
  // Get focus on the text field in the popup.
  // Note that I think this is only allowable on click, so this won't do
  // anything if you just copy-paste it into the console.
  $('#email-ipad').focus();
}

/**
  Like above, but for the iPhone popup.
*/
function showiPhonePromoPopup() {
  // Open the modal
  // $('.popup-container-iphone').css({ "display": "flex", "opacity": 1 });
  // $('.popup-overlay-iphone').css({ "display": "flex", "opacity": 1 });
  // $('.main-popup-iphone').css({ "display": "flex", "opacity": 1 });

  // Note: for webflow reasons we're going to reuse the same selectors as
  // ipad (since all other styling is the same)
  $('.popup-container-ipad').css({ "display": "flex", "opacity": 1 });
  $('.popup-overlay-ipad').css({ "display": "flex", "opacity": 1 });
  $('.main-popup-ipad').css({ "display": "flex", "opacity": 1 });

  // Get focus on the text field in the popup.
  // Note that I think this is only allowable on click, so this won't do
  // anything if you just copy-paste it into the console.
  // $('#email-iphone').focus();

  // Yeah just reuse this naming too so everything stays consistent
  $('#email-ipad').focus();
}


// Creates a toast, puts it on the page, and immediately shows it.
// Pass HTML to put inside as the main message.
// Pass parameters:
// - messageHTML
// - ctaURL
// - icon
// - duration
// - hideLast24Hours
function createAndShowToast(options) {
  // Unbundle options
  let { messageHTML, ctaURL, icon, duration, timeframe } = options;

  // Generate a unique ID
  let toastID = "toast-" + Date.now();

  // If we're going to a different page (i.e. URL doesn't have "#" and isn't
  // a JavaScript pseudo-link), then make
  // it open in `_blank`.
  let isTargetAnotherPage = ctaURL.indexOf("#") === -1 &&
    ctaURL.indexOf("javascript:") === -1;
  let targetString = isTargetAnotherPage ? `target="_blank"` : ``;


  // We're going to alter the styles of some of these elements depending on
  // what site we're on
  let siteStylingClass = "";
  if (matchUrlWithRegex(DomainRegexes.ENGAUTHORITY)) {
    siteStylingClass = "engauthority";
  }
  else {
    siteStylingClass = "uplevel";
  }

  // NEW: use the classic styling for both sites
  siteStylingClass = "classic";


  // The body text. Either an <a> or a plain ol' span if there's no
  // CTA.
  let mainText = `
    <span class="text-dark">
      ${messageHTML}
    </span>
  `;
  if (ctaURL) {
    mainText = `
      <a href="${ctaURL}" ${targetString} data-dismiss="toast">
        <span class="text-dark">
          ${messageHTML}
        </span>
      </a>
    `;
  }

  // Only make the toast dismissable with an X if it lasts forever.
  // If it has a finite duration, don't show the X; make users wait
  let dismissX = "";
  if (duration === undefined || duration === 0) {
    dismissX = `
      <div class="toast-closerOFF clickable text-muted">
        <span data-dismiss="toast">
          &times;
        </span>
      </div>
    `;
  }


  // Wrap the pulsar with a link if there's a cta
  let pulsarWrapStart = "";
  let pulsarWrapEnd = "";
  if (ctaURL) {
    pulsarWrapStart = `<a href="${ctaURL}" ${targetString} class="mx-auto" data-dismiss="toast">`;
    pulsarWrapEnd = `</a>`;
  }

  // make the toast appear clickable if it has a cta
  let toastClass = ctaURL ? "toast-clickable" : "toast-unclickable";

  // Generate toast HTML
  let toastHTML = `
    <div class="toast bg-white ${toastClass}" id="${toastID}">
      <div class="toast-body ${siteStylingClass}">
        <div class="row no-gutters">
          <div class="col-3 rowOFF align-items-centerOFF">
            <div class="row align-items-center full-height">
              ${pulsarWrapStart}
                <div class="pulsar mx-auto row align-items-center ${siteStylingClass}" data-dismiss="toast">
                  <div class="text-white mx-auto toast-icon">
                    ${icon}
                  </div>
                </div>
              ${pulsarWrapEnd}
            </div>
          </div>

          <div class="col-8 rowOFF align-items-centerOFF toast-text">
            <div>
              ${mainText}

              <div class="toast-separator">
                <br>
              </div>

              <span class="small text-info">
                ${ICONS.check_circle}
                Verified
              </span>
              &middot;
              <span class="small text-muted">
                in ${timeframe}
              </span>
            </div>
          </div>

          <div class="col-1 dismiss-x rowOFF align-items-centerOFF">
            ${dismissX}
          </div>
        </div>

      </div>
    </div>
  `;

  // Create element
  $(toastHTML).appendTo($("#toast-holder"));

  // Build the toast. Give it a timeout if one was provided, else
  // make it last forever.
  let toastOptions = duration && duration > 0 ?
    { delay: duration } : { autohide: false };
  $('#' + toastID).toast(toastOptions);

  // Now show it
  $('#' + toastID).toast('show');
}



/**
  TOASTS
**/

// Configuration for where/how to show the toasts.
const FOMO_CONFIG = [
  // For EA, we'll have a more specific one for the ipad offer, and a more
  // generic fallback one for all other pages

  // But before any of that, we'll use the most specific of all: 
  // a company-specific offer 
  {
    // Oracle iPad
    "pageRegex": /engauthority\..*ipad-pro\/oracle/i,
    "toasts": makeCompanyPromoToasts(
      "Oracle",
      "free, latest-gen iPad Pro",
      g_analytics.engauthority_oracle_ipad_sales,
      CheckoutPages.EA_ORACLE_IPAD,
    )
  },

  {
    // PayPal iPad
    "pageRegex": /engauthority\..*ipad-pro\/paypal/i,
    "toasts": makeCompanyPromoToasts(
      "PayPal",
      "free, latest-gen iPad Pro",
      g_analytics.engauthority_paypal_ipad_sales,
      CheckoutPages.EA_PAYPAL_IPAD,
    )
  },

  {
    // Credit Karma iPad
    "pageRegex": /engauthority\..*ipad-pro\/credit-karma/i,
    "toasts": makeCompanyPromoToasts(
      "Credit Karma",
      "free, latest-gen iPad Pro",
      g_analytics.engauthority_ck_ipad_sales,
      CheckoutPages.EA_CK_IPAD,
    )
  },

  {
    // iPad promo
    "pageRegex": DomainRegexes.EA_IPAD,
    "toasts": makePromoToasts(
      g_analytics.engauthority_ipad_sales,
      g_analytics.engauthority_downloads,
      "Eng Authority",
      "SWEs",
      CheckoutPages.EA_IPAD,
      "javascript:showiPadPromoPopup()",
      "free, latest-gen iPad Pro",
    )
  },
  // Oh and another one for the iPhone promo
  {
    // iPhone promo
    "pageRegex": DomainRegexes.EA_IPHONE,
    "toasts": makePromoToasts(
      g_analytics.engauthority_iphone_sales,
      g_analytics.engauthority_downloads,
      "Eng Authority",
      "SWEs",
      CheckoutPages.EA_IPHONE,
      "javascript:showiPhonePromoPopup()",
      "free iPhone 13 Pro",
    )
  },

  {
    // Normal EngAuthority popups
    "pageRegex": DomainRegexes.ENGAUTHORITY,
    "toasts": makeStandardCourseToasts(
      g_analytics.engauthority_sales,
      g_analytics.engauthority_downloads,
      "Eng Authority",
      "software engineers",
      CheckoutPages.ENGAUTHORITY,
    )
  },
  {
    "pageRegex": DomainRegexes.UPLEVEL,
    "toasts": makeStandardCourseToasts(
      g_analytics.uplevel_sales,
      g_analytics.uplevel_downloads,
      "Product Uplevel",
      "product managers",
      CheckoutPages.UPLEVEL,
    )
  },
];


/**
  Generate configurations for toasts.
**/

/**
  Creates toasts advertising how many people purchased a course (EA or Uplevel)
  or just put in their email.
*/
function makeStandardCourseToasts(numSales, numDownloads, courseName, studentTitles, checkoutURL) {
  return [
    // First, upsell the course itself
    {
      "time": 10000,
      "duration": 8000,
      "text": `<strong>${numSales} ${studentTitles} enrolled</strong>
        in ${courseName} today.`,
      "ctaURL": checkoutURL,
      "icon": ICONS.mortarboard,
    },

    // Next, upsell the email-grabber popup that lets people download the
    // reimbursement request template
    {
      "time": 20000,
      "duration": 0, // Make it persistent
      "text": `${numDownloads} ${studentTitles} downloaded our
        corporate <strong>reimbursement letter template</strong> today.`,
      "ctaURL": getWebinarCtaURL(),
      "icon": ICONS.cash,
    },
  ]
}

/**
  An altered function that generates toasts advertising the iPad promo.
*/
function makePromoToasts(numSales, numDownloads, courseName, studentTitles, checkoutURL, popupURL, giftName) {
  return [
    // First, upsell the course itself
    {
      "time": 6000,
      "duration": 20000,
      "text": `${numSales} ${studentTitles} enrolled in ${courseName} today and <strong>got their ${giftName}</strong>.`,
      "ctaURL": checkoutURL,
      "icon": ICONS.gift,
    },
    // Next, upsell the email-grabber popup that lets people download the
    // reimbursement request template
    {
      "time": 20000,
      "duration": 0, // Make it persistent
      "text": `${numDownloads} ${studentTitles} downloaded our
        corporate <strong>reimbursement letter template</strong> today.`,
      "ctaURL": popupURL,
      "icon": ICONS.document,
    },
  ]
}



/**
  Generates toasts advertising a certain gift for a certain company.
*/
function makeCompanyPromoToasts(companyName, giftName, numSales, checkoutURL) {
  return [
    // Keep it simple and just show one annoying toast
    {
      "time": 8000,
      "duration": 0, // Make it persistent
      "text": `${numSales} ${companyName} SWEs enrolled in Eng Authority and got their <strong>${giftName}</strong>.`,
      // "ctaURL": checkoutURL,
      "ctaURL": "javascript:showiPadPromoPopup()",
      "icon": ICONS.gift,
      "timeframe": "the last month",
    },
  ]
}





/**
  Returns a CTA URL for webinar upsells.
*/
function getWebinarCtaURL() {
  // try showing the webinar popup if it exists on the page.
  // that has a really nice email-grabbing UI.
  // otherwise, just go to the footer, where we have a simpler but omnipresent
  // email-grabber.
  let ctaURL = "#footer";
  if ($('#webinarpopup').length > 0) {
    // the popup exists!
    ctaURL = "javascript:showEmailPopup()";
  }

  return ctaURL;
}
