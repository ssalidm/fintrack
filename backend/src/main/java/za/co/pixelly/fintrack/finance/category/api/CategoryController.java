package za.co.pixelly.fintrack.finance.category.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.finance.category.application.CategoryService;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;


    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>>
    createCategory(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody CreateCategoryRequest request
    ) {
        CategoryResponse result =
            categoryService.create(
                userId(jwt),
                request
            );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    "Category created successfully",
                    result
                )
            );
    }


    @GetMapping
    public ResponseEntity<
        ApiResponse<List<CategoryResponse>>
        >
    getCategories(
        @AuthenticationPrincipal Jwt jwt,

        @RequestParam(required = false)
        CategoryType type,

        @RequestParam(
            defaultValue = "ACTIVE"
        )
        CategoryStatus status
    ) {
        List<CategoryResponse> result =
            categoryService.findCategories(
                userId(jwt),
                type,
                status
            );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Categories retrieved successfully",
                result
            )
        );
    }


    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>>
    getCategory(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID categoryId
    ) {
        CategoryResponse result =
            categoryService.findById(
                userId(jwt),
                categoryId
            );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Category retrieved successfully",
                result
            )
        );
    }


    @PatchMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>>
    updateCategory(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID categoryId,
        @Valid
        @RequestBody
        UpdateCategoryRequest request
    ) {
        CategoryResponse result =
            categoryService.update(
                userId(jwt),
                categoryId,
                request
            );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Category updated successfully",
                result
            )
        );
    }


    @PostMapping("/{categoryId}/archive")
    public ResponseEntity<ApiResponse<CategoryResponse>>
    archiveCategory(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID categoryId,
        @Valid
        @RequestBody
        ArchiveCategoryRequest request
    ) {
        CategoryResponse result =
            categoryService.archive(
                userId(jwt),
                categoryId,
                request
            );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Category archived successfully",
                result
            )
        );
    }


    private UUID userId(Jwt jwt) {
        return UUID.fromString(
            Objects.requireNonNull(jwt.getSubject())
        );
    }
}
