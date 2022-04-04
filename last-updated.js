/*****
  Computes fake promo end dates (always ends at the end of this month) for Eng Authority.

  This file will be obfuscated before being uploaded.
*****/


/**
  Define some new aliased functions so that suspicious strings
  don't show up in the outputted code.
*/

/**
  Rounds a float down to the int just below it; same thing as truncation.
*/
function floor(float) {
  return float | 0;
}

/**
  The obfuscator does a nice job of obfuscating arguments to
  a function, so instead of putting a raw constant in the code,
  wrap it in this function call.
*/
function identity(n) {
  return n;
}


/**
  Putting `new Date()` in so many places in the code looks suspicious, so
  call this instead. Just don't use it for getting the current date,
  since that requires an undefined parameter, and it's easier to understand
  if you just use `new Date()` directly there.
*/
function createDate(parameter) {
  return new Date(parameter);
}

/**
 * Given a Date, returns another Date representing the last day of that month.
 */
function getLastDayOfMonth(date) {
  // From https://stackoverflow.com/a/13773408 
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}



/**
 * Here begins actual business logic. We'll find anything that has the promo end date on it 
 * and insert the end date.
 */

// All the divs that contain the "promotion ends on" date will be of this class 
$(".promo-fine-print").html(function () {
  // Get the current HTML inside this div (not plain text — we sometimes want to 
  // put fancy styling inside this div, and operating on plain text would 
  // destroy it)
  const currentText = $(this).html();

  // If the current text does NOT include the key string, then don't do 
  // anything — just quit
  const promoEndsOnRegex = /at end of month/i;

  // We will need to replace "Offer expires at end of month" with "Offer expires on MM/DD/YY".
  // First we'll need to compute this new date. It's the end of the current month. 
  const today = new Date();
  const lastDayOfMonth = getLastDayOfMonth(today);

  // Format this date as a string: MM/DD/YY
  const stringDate = new Intl.DateTimeFormat('en-US', {
    // Formatting options 
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  }).format(lastDayOfMonth);

  // Now we can replace the text "at end of month" with this 
  const newText = currentText.replace(promoEndsOnRegex, "on " + stringDate);

  // And put it in 
  return newText;
});



// Add some bogus strings to make it look like we are actually
// pulling data from some backend
const strings = ["airtable.com", "fetch", "base", "get", "Airtable", "key5t96F1nrlY7QjG", "shrnifeNiiedSBLpb", "$", "ajax", "jQuery"];
