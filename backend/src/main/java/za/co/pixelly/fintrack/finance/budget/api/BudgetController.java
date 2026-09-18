package za.co.pixelly.fintrack.finance.budget.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.finance.budget.application.BudgetService;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetStatus;

import java.util.List;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;


@Tag(
    name = "Budgets",
    description =
        "Manage monthly budgets and category spending limits"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;


    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>>
    createBudget(
        @CurrentUserId UUID userId,
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
                    budgetService.create(userId, request)
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetSummaryResponse>>> getBudgets(
        @CurrentUserId UUID userId,
        @RequestParam(defaultValue = "ACTIVE")
        BudgetStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.FETCHED_ALL,
                budgetService.findBudgets(userId, status)
            )
        );
    }


    @GetMapping("/{budgetId}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudget(
        @CurrentUserId UUID userId,
        @PathVariable UUID budgetId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.FETCHED,
                budgetService.findById(userId, budgetId)
            )
        );
    }


    @PatchMapping("/{budgetId}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
        @CurrentUserId UUID userId,
        @PathVariable UUID budgetId,
        @Valid
        @RequestBody
        UpdateBudgetRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.UPDATED,
                budgetService.update(userId, budgetId, request)
            )
        );
    }


    @PostMapping("/{budgetId}/archive")
    public ResponseEntity<ApiResponse<BudgetResponse>> archiveBudget(
        @CurrentUserId UUID userId,
        @PathVariable UUID budgetId,
        @Valid
        @RequestBody
        ArchiveBudgetRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Budget.ARCHIVED,
                budgetService.archive(userId, budgetId, request)
            )
        );
    }


    @PostMapping("/{budgetId}/limits")
    public ResponseEntity<ApiResponse<BudgetResponse>> addLimit(
        @CurrentUserId UUID userId,
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
                    budgetService.addLimit(userId, budgetId, request)
                )
            );
    }


    @PatchMapping("/{budgetId}/limits/{limitId}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateLimit(
        @CurrentUserId UUID userId,
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
                    userId,
                    budgetId,
                    limitId,
                    request
                )
            )
        );
    }


    @DeleteMapping("/{budgetId}/limits/{limitId}")
    public ResponseEntity<Void> deleteLimit(
        @CurrentUserId UUID userId,
        @PathVariable UUID budgetId,
        @PathVariable UUID limitId,

        @RequestParam
        @Min(0)
        long version
    ) {
        budgetService.deleteLimit(
            userId,
            budgetId,
            limitId,
            version
        );

        return ResponseEntity
            .noContent()
            .build();
    }
}
