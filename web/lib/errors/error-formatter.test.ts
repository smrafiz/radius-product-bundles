// Create test file: lib/errors/error-formatter.test.ts
import { ErrorFormatter } from "./error-formatter";
import { ValidationError, BusinessRuleError } from "./error-classes";

describe("ErrorFormatter", () => {
    it("should format ValidationError", () => {
        const error = new ValidationError("Invalid input", [
            { field: "email", message: "Invalid email" },
        ]);
        const result = ErrorFormatter.toApiResponse(error);
        expect(result.status).toBe("error");
        expect(result.code).toBe("VALIDATION_ERROR");
    });
});
