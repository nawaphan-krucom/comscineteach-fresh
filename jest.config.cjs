module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node']
};