package za.co.pixelly.fintrack.common.validation.constraints;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        // If it's null, let @NotBlank handle it (keeps annotations focused)
        if (password == null || password.isBlank()) {
            return true;
        }

        boolean isValid = true;

        // Clear the default message so we can add our own specific ones
        context.disableDefaultConstraintViolation();

        // 1. Length Check
        if (password.length() < 12 || password.length() > 72) {
            addViolation(context, "Password must be between 12 and 72 characters");
            return false;
        }

        // 2. Lowercase Check
        if (!password.matches(".*[a-z].*")) {
            addViolation(context, "Password must contain at least one lowercase letter");
            isValid = false;
        }

        // 3. Uppercase Check
        if (!password.matches(".*[A-Z].*")) {
            addViolation(context, "Password must contain at least one uppercase letter");
            isValid = false;
        }

        // 4. Number Check
        if (!password.matches(".*\\d.*")) {
            addViolation(context, "Password must contain at least one number");
            isValid = false;
        }

        // 5. Special Character Check
        if (!password.matches(".*[\\W_].*")) {
            addViolation(context, "Password must contain at least one special character");
            isValid = false;
        }

        // 6. Whitespace Check
        if (!password.matches("^\\S(.*\\S)?$")) {
            addViolation(context, "Password cannot start or end with a space");
            isValid = false;
        }

        return isValid;
    }

    private void addViolation(ConstraintValidatorContext context, String message) {
        context.buildConstraintViolationWithTemplate(message)
            .addConstraintViolation();
    }
}
