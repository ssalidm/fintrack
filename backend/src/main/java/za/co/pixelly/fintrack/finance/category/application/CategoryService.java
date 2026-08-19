package za.co.pixelly.fintrack.finance.category.application;

import za.co.pixelly.fintrack.finance.category.api.*;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    CategoryResponse create(
        UUID userId,
        CreateCategoryRequest request
    );

    List<CategoryResponse> findCategories(
        UUID userId,
        CategoryType type,
        CategoryStatus status
    );

    CategoryResponse findById(
        UUID userId,
        UUID categoryId
    );

    CategoryResponse update(
        UUID userId,
        UUID categoryId,
        UpdateCategoryRequest request
    );

    CategoryResponse archive(
        UUID userId,
        UUID categoryId,
        ArchiveCategoryRequest request
    );
}
