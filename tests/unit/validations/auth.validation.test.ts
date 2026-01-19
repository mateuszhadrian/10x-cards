/**
 * Unit Tests - Auth Validation Schemas
 *
 * Tests validation logic for authentication forms.
 * Priority 1: Critical security validation that protects user accounts.
 */

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth.validation";

describe("Auth Validation", () => {
  describe("loginSchema", () => {
    describe("valid login data", () => {
      it("should accept valid email and password", () => {
        const validLogin = {
          email: "user@example.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });

      it("should accept minimum length password (6 characters)", () => {
        const validLogin = {
          email: "user@example.com",
          password: "123456",
        };

        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });

      it("should accept email with subdomains", () => {
        const validLogin = {
          email: "user@mail.example.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });

      it("should accept email with plus addressing", () => {
        const validLogin = {
          email: "user+test@example.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });

      it("should accept email with dots in local part", () => {
        const validLogin = {
          email: "first.last@example.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid login data", () => {
      it("should reject invalid email format", () => {
        const invalidLogin = {
          email: "not-an-email",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Invalid email");
        }
      });

      it("should reject email without @", () => {
        const invalidLogin = {
          email: "userexample.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });

      it("should reject email without domain", () => {
        const invalidLogin = {
          email: "user@",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });

      it("should reject email without local part", () => {
        const invalidLogin = {
          email: "@example.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });

      it("should reject empty email", () => {
        const invalidLogin = {
          email: "",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });

      it("should reject password shorter than 6 characters", () => {
        const invalidLogin = {
          email: "user@example.com",
          password: "12345",
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("at least 6 characters");
        }
      });

      it("should reject empty password", () => {
        const invalidLogin = {
          email: "user@example.com",
          password: "",
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });

      it("should reject missing fields", () => {
        const invalidLogin = {};

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("registerSchema", () => {
    describe("valid registration data", () => {
      it("should accept valid registration with matching passwords", () => {
        const validRegistration = {
          email: "newuser@example.com",
          password: "password123",
          confirmPassword: "password123",
        };

        const result = registerSchema.safeParse(validRegistration);
        expect(result.success).toBe(true);
      });

      it("should accept minimum length passwords (6 characters)", () => {
        const validRegistration = {
          email: "user@example.com",
          password: "123456",
          confirmPassword: "123456",
        };

        const result = registerSchema.safeParse(validRegistration);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid registration data", () => {
      it("should reject mismatched passwords", () => {
        const invalidRegistration = {
          email: "user@example.com",
          password: "password123",
          confirmPassword: "password456",
        };

        const result = registerSchema.safeParse(invalidRegistration);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("do not match");
        }
      });

      it("should reject invalid email format", () => {
        const invalidRegistration = {
          email: "invalid-email",
          password: "password123",
          confirmPassword: "password123",
        };

        const result = registerSchema.safeParse(invalidRegistration);
        expect(result.success).toBe(false);
      });

      it("should reject password shorter than 6 characters", () => {
        const invalidRegistration = {
          email: "user@example.com",
          password: "12345",
          confirmPassword: "12345",
        };

        const result = registerSchema.safeParse(invalidRegistration);
        expect(result.success).toBe(false);
      });

      it("should reject confirmPassword shorter than 6 characters", () => {
        const invalidRegistration = {
          email: "user@example.com",
          password: "123456",
          confirmPassword: "12345",
        };

        const result = registerSchema.safeParse(invalidRegistration);
        expect(result.success).toBe(false);
      });

      it("should reject empty confirmPassword", () => {
        const invalidRegistration = {
          email: "user@example.com",
          password: "password123",
          confirmPassword: "",
        };

        const result = registerSchema.safeParse(invalidRegistration);
        expect(result.success).toBe(false);
      });

      it("should reject missing fields", () => {
        const invalidRegistration = {
          email: "user@example.com",
        };

        const result = registerSchema.safeParse(invalidRegistration);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("forgotPasswordSchema", () => {
    describe("valid forgot password data", () => {
      it("should accept valid email", () => {
        const validRequest = {
          email: "user@example.com",
        };

        const result = forgotPasswordSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it("should accept email with complex format", () => {
        const validRequest = {
          email: "user.name+tag@subdomain.example.com",
        };

        const result = forgotPasswordSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid forgot password data", () => {
      it("should reject invalid email format", () => {
        const invalidRequest = {
          email: "not-an-email",
        };

        const result = forgotPasswordSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Invalid email");
        }
      });

      it("should reject empty email", () => {
        const invalidRequest = {
          email: "",
        };

        const result = forgotPasswordSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it("should reject missing email field", () => {
        const invalidRequest = {};

        const result = forgotPasswordSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("resetPasswordSchema", () => {
    describe("valid reset password data", () => {
      it("should accept valid passwords that match", () => {
        const validReset = {
          password: "newpassword123",
          confirmPassword: "newpassword123",
        };

        const result = resetPasswordSchema.safeParse(validReset);
        expect(result.success).toBe(true);
      });

      it("should accept minimum length passwords (6 characters)", () => {
        const validReset = {
          password: "123456",
          confirmPassword: "123456",
        };

        const result = resetPasswordSchema.safeParse(validReset);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid reset password data", () => {
      it("should reject mismatched passwords", () => {
        const invalidReset = {
          password: "password123",
          confirmPassword: "password456",
        };

        const result = resetPasswordSchema.safeParse(invalidReset);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("do not match");
        }
      });

      it("should reject password shorter than 6 characters", () => {
        const invalidReset = {
          password: "12345",
          confirmPassword: "12345",
        };

        const result = resetPasswordSchema.safeParse(invalidReset);
        expect(result.success).toBe(false);
      });

      it("should reject empty password", () => {
        const invalidReset = {
          password: "",
          confirmPassword: "",
        };

        const result = resetPasswordSchema.safeParse(invalidReset);
        expect(result.success).toBe(false);
      });

      it("should reject missing fields", () => {
        const invalidReset = {};

        const result = resetPasswordSchema.safeParse(invalidReset);
        expect(result.success).toBe(false);
      });

      it("should reject when only password is provided", () => {
        const invalidReset = {
          password: "password123",
        };

        const result = resetPasswordSchema.safeParse(invalidReset);
        expect(result.success).toBe(false);
      });

      it("should reject when only confirmPassword is provided", () => {
        const invalidReset = {
          confirmPassword: "password123",
        };

        const result = resetPasswordSchema.safeParse(invalidReset);
        expect(result.success).toBe(false);
      });
    });
  });
});
