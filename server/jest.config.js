module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  testMatch: ['<rootDir>/(server|job)/**/?(*.)(test).{ts,js,jsx,mjs}'],
  testPathIgnorePatterns: ['<rootDir>/server/routes/journeys', 'node_modules'],
  testEnvironment: 'node',
  rootDir: '../',
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
}
