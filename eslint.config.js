import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node, // This includes process, global, Buffer, etc.
        process: 'readonly', // Explicitly declare process to avoid any conflicts
      },
    },
    rules: {
      'no-unused-vars': 'warn', // Warns about unused variables, but won't fail the build
      'no-console': 'warn', // Allow console logs with a warning, useful for debugging
      'eqeqeq': 'error', // Require strict equality (===) over abstract equality (==)
      'curly': 'error', // Force use of curly braces for control statements
      'semi': ['error', 'always'], // Enforce semicolons
      'quotes': ['error', 'single', { avoidEscape: true }], // Use single quotes, but allow escaping double quotes
      'comma-dangle': ['error', 'always-multiline'], // Ensure multi-line arrays/objects end with a comma
      'indent': ['error', 2], // Enforce consistent 2-space indentation
      'no-multi-spaces': 'error', // No multiple spaces where not required
      'key-spacing': ['error', { beforeColon: false, afterColon: true }], // Enforce spacing in object keys
      'object-curly-spacing': ['error', 'always'], // Enforce spaces inside curly braces
      'array-bracket-spacing': ['error', 'never'], // Disallow spaces inside array brackets
      'space-before-function-paren': ['error', 'never'], // No space before function parentheses
      'space-in-parens': ['error', 'never'], // No space inside parentheses
      'no-trailing-spaces': 'error', // No trailing spaces at the end of lines
      'eol-last': ['error', 'always'], // Ensure files end with a newline
    }
  },
  {
    files: ["**/*.test.js", "**/__tests__/**/*.js", "test/*"],
    languageOptions: {
      globals: {
        ...globals.jest, // Jest globals like `describe`, `it`, `expect`, etc.
      },
    },
    rules: {
      'no-console': 'off', // Allow console logs in test files
      'no-unused-vars': 'off', // Disable unused variable warnings in tests
      'no-undef': 'off', // Prevent errors for globals like "describe" in Jest
    }
  },
  {
    files: ["utils/**/*.js"], // Disable console checks only for utils directory
    rules: {
      'no-console': 'off' // Turn off the no-console rule for these file
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Add browser-specific globals (window, document, etc.)
      }
    }
  },
  pluginJs.configs.recommended, // Start with the recommended ESLint rules
];