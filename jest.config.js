module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        "^@config/(.*)$": "<rootDir>/src/config/$1",
        "^@constants/(.*)$": "<rootDir>/src/constants/$1",
        "^@nfl-constants/(.*)$": "<rootDir>/src/constants/nfl/$1",
        "^@database/(.*)$": "<rootDir>/src/database/$1",
        "^@data-services/(.*)$": "<rootDir>/src/data-services/$1",
        "^@nfl-services/(.*)$": "<rootDir>/src/data-services/nfl/$1",
        "^@log/(.*)$": "<rootDir>/src/log/$1",
        "^@utils/(.*)$": "<rootDir>/src/data-services/utils/$1",
        "^@csv/(.*)$": "<rootDir>/src/csv/$1",
        "^@src/(.*)$": "<rootDir>/src/$1",
        "^@test/(.*)$": "<rootDir>/test/$1",
        "^@test-nfl-constants/(.*)$": "<rootDir>/test/data-services/nfl/constants/$1",
    },
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    "rootDir": "./",
    "moduleFileExtensions": [
        "js",
        "json",
        "ts"
    ],
    "collectCoverageFrom": [
        "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "coveragePathIgnorePatterns": [
        "/dist/",
        "/jest.config.js",
        "/node_modules/",
        "/src/csv/",
        "/src/constants/",
        "/src/config/",
        "/src/data/",
        "/src/app.ts",
        "/src/log/",
        '/src/.*\\.d\\.[jt]s$',
        "/test/",
    ]
  };