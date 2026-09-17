package za.co.pixelly.fintrack.finance.category.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.finance.category.application.CategoryService;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;

import java.util.List;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;


@Tag(
    name = "Categories",
    description = "Manage income and expense categories"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;


    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>>
    createCategory(
        @CurrentUserId UUID userId,
        @Valid @RequestBody CreateCategoryRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Category.CREATED,
                    categoryService.create(
                        userId,
                        request
                    )
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>>
    getCategories(
        @CurrentUserId UUID userId,

        @RequestParam(required = false)
        CategoryType type,

        @RequestParam(
            defaultValue = "ACTIVE"
        )
        CategoryStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Category.FETCHED_ALL,
                categoryService.findCategories(
                    userId,
                    type,
                    status
                )
            )
        );
    }


    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>>
    getCategory(
        @CurrentUserId UUID userId,
        @PathVariable UUID categoryId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Category.FETCHED,
                categoryService.findById(
                    userId,
                    categoryId
                )
            )
        );
    }


    @PatchMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>>
    updateCategory(
        @CurrentUserId UUID userId,
        @PathVariable UUID categoryId,
        @Valid
        @RequestBody
        UpdateCategoryRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Category.UPDATED,
                categoryService.update(
                    userId,
                    categoryId,
                    request
                )
            )
        );
    }


    @PostMapping("/{categoryId}/archive")
    public ResponseEntity<ApiResponse<CategoryResponse>>
    archiveCategory(
        @CurrentUserId UUID userId,
        @PathVariable UUID categoryId,
        @Valid
        @RequestBody
        ArchiveCategoryRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Category.ARCHIVED,
                categoryService.archive(
                    userId,
                    categoryId,
                    request
                )
            )
        );
    }
}
