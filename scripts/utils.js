function formatDate(date) {
  if (!date) return null;
  return date.substring(0, 10);
}

module.exports = {
  formatDate
};