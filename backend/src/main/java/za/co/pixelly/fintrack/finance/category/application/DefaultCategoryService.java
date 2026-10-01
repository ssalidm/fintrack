package za.co.pixelly.fintrack.finance.category.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.finance.category.api.ArchiveCategoryRequest;
import za.co.pixelly.fintrack.finance.category.api.CategoryResponse;
import za.co.pixelly.fintrack.finance.category.api.CreateCategoryRequest;
import za.co.pixelly.fintrack.finance.category.api.UpdateCategoryRequest;
import za.co.pixelly.fintrack.finance.category.application.exceptions.ArchivedCategoryModificationException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.CategoryAlreadyArchivedException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.CategoryNotFoundException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.DuplicateCategoryNameException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.StaleCategoryVersionException;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryRepository;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

import static za.co.pixelly.fintrack.common.concurrency.VersionGuard.requireCurrent;

@Service
@RequiredArgsConstructor
public class DefaultCategoryService
    implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final Clock applicationClock;


    @Override
    @Transactional
    public CategoryResponse create(
        UUID userId,
        CreateCategoryRequest request
    ) {
        String name =
            request.name().trim();

        if (
            categoryRepository
                .existsByNormalizedName(
                    userId,
                    request.categoryType(),
                    name,
                    CategoryStatus.ACTIVE
                )
        ) {
            throw new DuplicateCategoryNameException();
        }

        short displayOrder =
            request.displayOrder() == null
                ? 0
                : request.displayOrder();

        Category category =
            Category.create(
                userId,
                name,
                request.categoryType(),
                displayOrder,
                applicationClock.instant()
            );

        Category saved =
            categoryRepository
                .saveAndFlush(
                    category
                );

        return CategoryResponse.from(
            saved
        );
    }


    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findCategories(
        UUID userId,
        CategoryType type,
        CategoryStatus status
    ) {
        List<Category> categories;

        if (type == null) {
            categories =
                categoryRepository
                    .findAllByUserIdAndStatusOrderByDisplayOrderAscNameAsc(
                        userId,
                        status
                    );
        } else {
            categories =
                categoryRepository
                    .findAllByUserIdAndCategoryTypeAndStatusOrderByDisplayOrderAscNameAsc(
                        userId,
                        type,
                        status
                    );
        }

        return categories
            .stream()
            .map(
                CategoryResponse::from
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public CategoryResponse findById(
        UUID userId,
        UUID categoryId
    ) {
        return CategoryResponse.from(
            findOwnedCategory(
                userId,
                categoryId
            )
        );
    }


    @Override
    @Transactional
    public CategoryResponse update(
        UUID userId,
        UUID categoryId,
        UpdateCategoryRequest request
    ) {
        Category category =
            findOwnedCategory(
                userId,
                categoryId
            );

        if (
            category.getStatus()
                == CategoryStatus.ARCHIVED
        ) {
            throw new ArchivedCategoryModificationException();
        }

        requireCurrent(
            category.getVersion(),
            request.version(),
            StaleCategoryVersionException::new
        );

        String targetName =
            request.name() == null
                ? category.getName()
                : request.name().trim();

        CategoryType targetType =
            request.categoryType() == null
                ? category.getCategoryType()
                : request.categoryType();

        if (
            categoryRepository
                .existsByNormalizedNameExcludingCategory(
                    userId,
                    categoryId,
                    targetType,
                    targetName,
                    CategoryStatus.ACTIVE
                )
        ) {
            throw new DuplicateCategoryNameException();
        }

        category.update(
            request.name() == null
                ? null
                : request.name().trim(),
            request.categoryType(),
            request.displayOrder(),
            applicationClock.instant()
        );

        Category saved =
            categoryRepository
                .saveAndFlush(
                    category
                );

        return CategoryResponse.from(
            saved
        );
    }


    @Override
    @Transactional
    public CategoryResponse archive(
        UUID userId,
        UUID categoryId,
        ArchiveCategoryRequest request
    ) {
        Category category =
            findOwnedCategory(
                userId,
                categoryId
            );

        if (
            category.getStatus()
                == CategoryStatus.ARCHIVED
        ) {
            throw new CategoryAlreadyArchivedException();
        }

        requireCurrent(
            category.getVersion(),
            request.version(),
            StaleCategoryVersionException::new
        );

        category.archive(
            applicationClock.instant()
        );

        Category saved =
            categoryRepository
                .saveAndFlush(
                    category
                );

        return CategoryResponse.from(
            saved
        );
    }


    private Category findOwnedCategory(
        UUID userId,
        UUID categoryId
    ) {
        return categoryRepository
            .findByIdAndUserId(
                categoryId,
                userId
            )
            .orElseThrow(
                CategoryNotFoundException::new
            );
    }
}
