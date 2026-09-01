package za.co.pixelly.fintrack.finance.category.api;

import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
    UUID id,
    String templateCode,
    String name,
    CategoryType categoryType,
    CategoryStatus status,
    short displayOrder,
    Instant archivedAt,
    Instant createdAt,
    Instant updatedAt,
    long version
) {

    public static CategoryResponse from(
        Category category
    ) {
        return new CategoryResponse(
            category.getId(),
            category.getTemplateCode(),
            category.getName(),
            category.getCategoryType(),
            category.getStatus(),
            category.getDisplayOrder(),
            category.getArchivedAt(),
            category.getCreatedAt(),
            category.getUpdatedAt(),
            category.getVersion()
        );
    }
}
