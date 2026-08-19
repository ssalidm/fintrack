package za.co.pixelly.fintrack.finance.category.api;

import jakarta.validation.constraints.NotNull;

public record ArchiveCategoryRequest(

    @NotNull
    Long version

) {
}
