module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', 'index.js'],
  coveragePathIgnorePatterns: ['src/auth0', 'src/html/js/', 'src/html/static'],
  testPathIgnorePatterns: ['/node_modules/', '/.*unnescessary.*/'],
};
