package za.co.pixelly.fintrack.finance.category.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;

public record UpdateCategoryRequest(

    @NotNull
    Long version,

    @Size(max = 100)
    @Pattern(
        regexp = ".*\\S.*",
        message = "name must not be blank"
    )
    String name,

    CategoryType categoryType,

    @Min(0)
    @Max(32767)
    Short displayOrder

) {

    @AssertTrue(
        message = "At least one category field must be provided"
    )
    public boolean isUpdateProvided() {
        return name != null
            || categoryType != null
            || displayOrder != null;
    }
}
