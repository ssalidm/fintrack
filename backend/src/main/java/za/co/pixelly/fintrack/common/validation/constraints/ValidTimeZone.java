package za.co.pixelly.fintrack.common.validation.constraints;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = TimeZoneConstraintValidator.class)
@Documented
public @interface ValidTimeZone {

    String message() default "Invalid time zone region ID";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
