// Client-side code that generates fake, randomized
// "metrics" to show on the frontend.


// Utility functions

// Simple way to turn a float to an int without using toInt() or something
// sketchy like that (goal is to minimize use of named functions)
function truncate(float) {
  return float | 1;
}

// Wrap the rounding function so it's harder to trace what we're doing
function round(float) {
  return Math.round(float);
}


// We need to obfuscate the names of suspicious-looking library functions
// like Math.imul.
// We do this by turning an array of character codes into a string and
// eval()'ing it.
var MathImulChars = [77, 97, 116, 104, 46, 105, 109, 117, 108, 10];
var MathImulString = MathImulChars.map(
  function (b) { return String.fromCharCode(b) }).join("");
var MathImul = eval(MathImulString);
// console.log(MathImul);


// Our metrics need to remain consistent over the course of the day
// So we should generate a single random number keyed to the day (plus some
// additional salt value). Thus, we can get stable random numbers that are
// fairly unique (assuming you pass a different seed each time).

// Step 1: mixing function. Given an input, spits out a pretty random
// output.
// From https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = MathImul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function () {
    h = MathImul(h ^ h >>> 16, 2246822507);
    h = MathImul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

// Step 2: feed the current HOUR into the mixing function.
// Now, each time we call the outputted function, we get
// a nice new RN. Best part is that the series of RNs we
// get is consistent throughout the hour!
// Date.now() returns milliseconds so just divide by millis/seconds/minutes/hours...
var hoursSinceEpoch = truncate(Date.now() / (1000 * 60 * 60));

// This returns a function that will spit out random numbers. If you give the
// same input, you'll get the same series of outputs (deterministic), but the
// underlying numbers fed into the PRNG will change every hour.
function stableRandom(salt) {
  var seed = hoursSinceEpoch + "" + salt;
  return xmur3(seed);
}

// Step 3: generate a bunch of fake RNs, one per "metric".
// Each big RN has to be converted into a range.

// Given a big random number like 12345678,
// generates a random value in the range [lower, upper).
function clampRandToRange(rand, lower, upper) {
  // Choose only a few digits of rand
  var randomDigits = rand % 10000;

  // Now that we know this is in range [0, 10000), we can
  // map it to the range [lower, upper)
  var clamped = (upper - lower) * randomDigits / 10000 + lower;

  // Return this truncated to an int
  return truncate(clamped);
}

// Gets a random int between `lower` and `upper`. This number is semi-stable
// and will be the same as long as you pass the same salt within the same
// hour. That is:
// getRand("ABC", 5, 10) // => 7
// getRand("ABC", 10,20) // => 14
// getRand("ABC", 5, 10) // => 7
// getRand("BCD", 5, 10) // => 8
function getRand(salt, lower, upper) {
  return clampRandToRange(stableRandom(salt)(), lower, upper);
}


// Now we generate the numbers!
// store all our analytics data in the window.g_analytics variable
// (to make it seem like these are "real" numbers we got from google).
// for testing in node, let's just shim `window`
if (typeof window === 'undefined') {
  window = {};
}

window.g_analytics = {
  // EngAuthority: sales of the course and downloads of the reimbursement
  // request / expense report template
  engauthority_sales: getRand("eas", 22, 32),
  engauthority_downloads: getRand("ead", 60, 110),

  // We also need to show some fake sales numbers for the iPad and iPhone
  // promos. These are based off the overall sales numbers, just scaled down.
  // Suppose that some sales came from the iPad promo, some from the iPhone
  // promo, and some from neither.
  engauthority_ipad_sales: getRand("eas", 8, 12),
  engauthority_iphone_sales: getRand("eas", 10, 16),


  // For EA's company-specific promos, we'll do the numbers over the last month.
  // Feels more realistic.
  engauthority_oracle_ipad_sales: getRand("orcld", 60, 80),
  engauthority_oracle_iphone_sales: getRand("orclh", 60, 80),
  engauthority_paypal_ipad_sales: getRand("payd", 45, 65),
  engauthority_paypal_iphone_sales: getRand("payh", 45, 65),
  engauthority_ck_ipad_sales: getRand("ckd", 20, 30),
  engauthority_ck_iphone_sales: getRand("ckh", 20, 30),


  // UpLevel: same thing
  uplevel_sales: getRand("ups", 10, 20),
  uplevel_downloads: getRand("upd", 50, 100),
};

// We'll run this file through obfuscation, but we need to make the output
// look like an obfuscated version of a legit analytics-logging file.
// Strings survive
// obfuscation unmodified, so let's make a few random, throwaway strings that
// will get embedded in the obfuscated file, thus making it look like it's
// a real analytics file.
var url = "https://productuplevel.com/analytics?key=vVirqZdCp9fvCK27";
var url2 = "https://engauthority.com/analytics?key=lzfn0wLsqyWimNVU";
var isogram = "i,s,o,g,r,a,m";
var facebook = "f,b,e,v,n,t,s";
var analytics = "GoogleAnalyticsObject";
var userAgent = "UA-";
