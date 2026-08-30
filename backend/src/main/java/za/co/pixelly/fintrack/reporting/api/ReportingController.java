package za.co.pixelly.fintrack.reporting.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.reporting.application.ReportingService;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Reports",
    description = "Financial reporting and analytics"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;


    @GetMapping("/account-balances")
    public ResponseEntity<ApiResponse<List<AccountBalanceReportResponse>>> getAccountBalances(
        @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.ACCOUNT_BALANCES_FETCHED,
                reportingService.getAccountBalances(userId(jwt))
            )
        );
    }


    @GetMapping("/net-worth")
    public ResponseEntity<ApiResponse<List<NetWorthReportResponse>>> getNetWorth(
        @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.NET_WORTH_FETCHED,
                reportingService.getNetWorth(userId(jwt)
                )
            )
        );
    }


    @GetMapping("/cash-flow")
    public ResponseEntity<ApiResponse<List<MonthlyCashFlowResponse>>> getMonthlyCashFlow(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam LocalDate fromMonth,
        @RequestParam LocalDate toMonth
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.CASH_FLOW_FETCHED,
                reportingService.getMonthlyCashFlow(
                    userId(jwt),
                    fromMonth,
                    toMonth
                )
            )
        );
    }


    @GetMapping("/category-spending")
    public ResponseEntity<ApiResponse<List<MonthlyCategorySpendingResponse>>> getMonthlyCategorySpending(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam LocalDate fromMonth,
        @RequestParam LocalDate toMonth
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.CATEGORY_SPENDING_FETCHED,
                reportingService.getMonthlyCategorySpending(
                    userId(jwt),
                    fromMonth,
                    toMonth
                )
            )
        );
    }


    @GetMapping("/budgets/{budgetId}/performance")
    public ResponseEntity<ApiResponse<BudgetPerformanceResponse>> getBudgetPerformance(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID budgetId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.BUDGET_PERFORMANCE_FETCHED,
                reportingService.getBudgetPerformance(userId(jwt), budgetId)
            )
        );
    }

    @GetMapping("/goals/{goalId}/progress")
    public ResponseEntity<ApiResponse<SavingsGoalProgressResponse>> getSavingsGoalProgress(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID goalId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.GOAL_PROGRESS_FETCHED,
                reportingService.getSavingsGoalProgress(userId(jwt), goalId)
            )
        );
    }


    @GetMapping("/recurring-due")
    public ResponseEntity<ApiResponse<List<RecurringTransactionDueResponse>>> getRecurringTransactionsDue(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Reporting.DUE_RECURRING_FETCHED,
                reportingService
                    .getRecurringTransactionsDue(userId(jwt), limit)
            )
        );
    }





    private UUID userId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}
