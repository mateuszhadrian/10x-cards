/**
 * Test Fixtures - Reusable Test Data
 *
 * This file contains reusable test data and fixtures for E2E tests.
 */

export const testUsers = {
  validUser: {
    email: "test@example.com",
    password: "SecurePassword123!",
  },
  invalidUser: {
    email: "invalid@example.com",
    password: "wrongpassword",
  },
  newUser: {
    email: "newuser@example.com",
    password: "NewPassword123!",
  },
};

export const testFlashcards = {
  basic: {
    question: "What is TypeScript?",
    answer: "A typed superset of JavaScript that compiles to plain JavaScript.",
    tags: ["programming", "typescript"],
  },
  advanced: {
    question: "What is the difference between interface and type in TypeScript?",
    answer: "Interfaces can be extended and merged, while types are more flexible with unions and intersections.",
    tags: ["typescript", "advanced"],
  },
};

export const testGenerations = {
  sampleInput: `
    TypeScript is a strongly typed programming language that builds on JavaScript,
    giving you better tooling at any scale. It adds optional static typing to JavaScript,
    which can help catch errors early in development.
  `,
  longInput: "Lorem ipsum ".repeat(100),
  validInput: generateValidGenerationText(),
  shortInput: "This text is too short.",
  tooLongInput: "A".repeat(10001),
};

/**
 * Generate valid text for flashcard generation (between 1000-10000 characters)
 */
function generateValidGenerationText(): string {
  const baseText = `
    JavaScript is a versatile programming language that was created in 1995 by Brendan Eich. 
    It was initially developed in just 10 days and has since become one of the most popular 
    programming languages in the world. JavaScript is primarily used for web development, 
    enabling interactive and dynamic web pages.

    One of the key features of JavaScript is its ability to run both on the client-side 
    (in web browsers) and server-side (with Node.js). This versatility has made it an 
    essential tool for full-stack developers. The language supports multiple programming 
    paradigms including object-oriented, imperative, and functional programming styles.

    Modern JavaScript (ES6 and beyond) has introduced many powerful features such as 
    arrow functions, promises, async/await, destructuring, template literals, and modules. 
    These additions have made the language more expressive and easier to work with.

    The JavaScript ecosystem is vast, with numerous frameworks and libraries available. 
    Popular frontend frameworks include React, Vue, and Angular, each offering different 
    approaches to building user interfaces. On the backend, Node.js has revolutionized 
    server-side JavaScript development.

    Understanding JavaScript fundamentals is crucial for web developers. Core concepts 
    include variables, data types, functions, scope, closures, prototypes, and the event loop. 
    Mastering these concepts enables developers to write efficient and maintainable code.

    JavaScript's asynchronous nature is one of its most important characteristics. 
    The language uses an event-driven, non-blocking I/O model that makes it lightweight 
    and efficient. This is particularly important for applications that need to handle 
    multiple operations simultaneously.

    Type coercion in JavaScript can be tricky for beginners. The language performs 
    implicit type conversions, which can lead to unexpected results. Understanding how 
    JavaScript handles different data types and conversions is essential for avoiding bugs.
  `;

  // Repeat the text to reach at least 1000 characters
  let result = baseText;
  while (result.length < 1000) {
    result += baseText;
  }

  // Trim to ensure it's under 10000 characters
  return result.slice(0, 9500).trim();
}

/**
 * Helper to generate random test data
 */
export const generateRandomEmail = () => {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
};

export const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
