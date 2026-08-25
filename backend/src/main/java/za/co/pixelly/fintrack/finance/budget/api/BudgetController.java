package za.co.pixelly.fintrack.finance.budget.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.finance.budget.application.BudgetService;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetStatus;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;


@Tag(
    name = "Budgets",
    description =
        "Manage monthly budgets and category spending limits"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
@Validated
public class BudgetController {

    private final BudgetService budgetService;


    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>>
    createBudget(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        CreateBudgetRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Budget.CREATED,
                    budgetService.create(userId(jwt), request)
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetSummaryResponse>>> getBudgets(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(defaultValue = "ACTIVE")
        BudgetStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.FETCHED_ALL,
                budgetService.findBudgets(userId(jwt), status)
            )
        );
    }


    @GetMapping("/{budgetId}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudget(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID budgetId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.FETCHED,
                budgetService.findById(userId(jwt), budgetId)
            )
        );
    }


    @PatchMapping("/{budgetId}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID budgetId,
        @Valid
        @RequestBody
        UpdateBudgetRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.UPDATED,
                budgetService.update(userId(jwt), budgetId, request)
            )
        );
    }


    @PostMapping("/{budgetId}/archive")
    public ResponseEntity<ApiResponse<BudgetResponse>> archiveBudget(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID budgetId,
        @Valid
        @RequestBody
        ArchiveBudgetRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.ARCHIVED,
                budgetService.archive(userId(jwt), budgetId, request)
            )
        );
    }


    @PostMapping("/{budgetId}/limits")
    public ResponseEntity<ApiResponse<BudgetResponse>> addLimit(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID budgetId,
        @Valid
        @RequestBody
        CreateBudgetLimitRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Budget.LIMIT_CREATED,
                    budgetService.addLimit(userId(jwt), budgetId, request)
                )
            );
    }


    @PatchMapping(
        "/{budgetId}/limits/{limitId}"
    )
    public ResponseEntity<ApiResponse<BudgetResponse>> updateLimit(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID budgetId,
        @PathVariable UUID limitId,
        @Valid
        @RequestBody
        UpdateBudgetLimitRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.LIMIT_UPDATED,
                budgetService.updateLimit(
                    userId(jwt),
                    budgetId,
                    limitId,
                    request
                )
            )
        );
    }


    @DeleteMapping(
        "/{budgetId}/limits/{limitId}"
    )
    public ResponseEntity<Void> deleteLimit(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID budgetId,
        @PathVariable UUID limitId,

        @RequestParam
        @Min(0)
        long version
    ) {
        budgetService.deleteLimit(
            userId(jwt),
            budgetId,
            limitId,
            version
        );

        return ResponseEntity
            .noContent()
            .build();
    }


    private UUID userId(
        Jwt jwt
    ) {
        return UUID.fromString(
            Objects.requireNonNull(jwt.getSubject())
        );
    }
}
