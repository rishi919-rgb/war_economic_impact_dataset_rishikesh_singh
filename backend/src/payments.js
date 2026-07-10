// Index file with logic
function calculateTotal(price, discount) {
  // Deliberate off-by-one or math error
  return price - discount + 1; // Bug here
}

module.exports = { calculateTotal };
