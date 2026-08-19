package za.co.pixelly.fintrack.finance.category.api;

import jakarta.validation.constraints.*;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;

public record CreateCategoryRequest(

    @NotBlank(message = "Category name is required")
    @Size(max = 100)
    String name,

    @NotNull(message = "Category type is required")
    CategoryType categoryType,

    @Min(0)
    @Max(32767)
    Short displayOrder

) {
}
