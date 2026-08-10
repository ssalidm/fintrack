package za.co.pixelly.fintrack.common.validation.constraints;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})         // Where this can be used
@Retention(RetentionPolicy.RUNTIME)                         // Keep at runtime so the framework can see it
@Constraint(validatedBy = StrongPasswordValidator.class)    // Links to our logic class
public @interface StrongPassword {

    // Default message if validation fails and we don't specify a custom one
    String message() default "Invalid password format";

    // Required by Jakarta Validation for grouping constraints
    Class<?>[] groups() default {};

    // Required by Jakarta Validation for carrying metadata
    Class<? extends Payload>[] payload() default {};
}
