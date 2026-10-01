package za.co.pixelly.fintrack.reporting.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.reporting.application.ReportingService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Reports",
    description = "Financial reporting and analytics"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;


    @GetMapping("/account-balances")
    public ResponseEntity<ApiResponse<List<AccountBalanceReportResponse>>> getAccountBalances(
        @CurrentUserId UUID userId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.ACCOUNT_BALANCES_FETCHED,
                reportingService.getAccountBalances(userId)
            )
        );
    }


    @GetMapping("/net-worth")
    public ResponseEntity<ApiResponse<List<NetWorthReportResponse>>> getNetWorth(
        @CurrentUserId UUID userId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.NET_WORTH_FETCHED,
                reportingService.getNetWorth(userId)
            )
        );
    }


    @GetMapping("/cash-flow")
    public ResponseEntity<ApiResponse<List<MonthlyCashFlowResponse>>> getMonthlyCashFlow(
        @CurrentUserId UUID userId,
        @RequestParam LocalDate fromMonth,
        @RequestParam LocalDate toMonth
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.CASH_FLOW_FETCHED,
                reportingService.getMonthlyCashFlow(
                    userId,
                    fromMonth,
                    toMonth
                )
            )
        );
    }


    @GetMapping("/category-spending")
    public ResponseEntity<ApiResponse<List<MonthlyCategorySpendingResponse>>> getMonthlyCategorySpending(
        @CurrentUserId UUID userId,
        @RequestParam LocalDate fromMonth,
        @RequestParam LocalDate toMonth
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.CATEGORY_SPENDING_FETCHED,
                reportingService.getMonthlyCategorySpending(
                    userId,
                    fromMonth,
                    toMonth
                )
            )
        );
    }


    @GetMapping("/budgets/{budgetId}/performance")
    public ResponseEntity<ApiResponse<BudgetPerformanceResponse>> getBudgetPerformance(
        @CurrentUserId UUID userId,
        @PathVariable UUID budgetId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.BUDGET_PERFORMANCE_FETCHED,
                reportingService.getBudgetPerformance(userId, budgetId)
            )
        );
    }


    @GetMapping("/goals/{goalId}/progress")
    public ResponseEntity<ApiResponse<SavingsGoalProgressResponse>> getSavingsGoalProgress(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.GOAL_PROGRESS_FETCHED,
                reportingService.getSavingsGoalProgress(userId, goalId)
            )
        );
    }


    @GetMapping("/recurring-due")
    public ResponseEntity<ApiResponse<List<RecurringTransactionDueResponse>>> getRecurringTransactionsDue(
        @CurrentUserId UUID userId,
        @RequestParam(defaultValue = "50")
        @Min(value = 1, message = "limit must be at least 1")
        @Max(value = 200, message = "limit must not exceed 200")
        int limit
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.DUE_RECURRING_FETCHED,
                reportingService
                    .getRecurringTransactionsDue(userId, limit)
            )
        );
    }
}
