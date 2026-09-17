package za.co.pixelly.fintrack.finance.goal.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.finance.goal.application.SavingsGoalService;
import za.co.pixelly.fintrack.finance.goal.domain.SavingsGoalStatus;

import java.util.List;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Savings Goals",
    description = "Manage savings goals and their contributions"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;


    @PostMapping
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> createGoal(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        CreateSavingsGoalRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Goal.CREATED,
                    savingsGoalService.create(
                        userId,
                        request
                    )
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<SavingsGoalResponse>>> getGoals(
        @CurrentUserId UUID userId,
        @RequestParam(defaultValue = "ACTIVE")
        SavingsGoalStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.FETCHED_ALL,
                savingsGoalService.findGoals(
                    userId,
                    status
                )
            )
        );
    }


    @GetMapping("/{goalId}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> getGoal(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.FETCHED,
                savingsGoalService.findById(
                    userId,
                    goalId
                )
            )
        );
    }


    @PatchMapping("/{goalId}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> updateGoal(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId,
        @Valid
        @RequestBody
        UpdateSavingsGoalRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.UPDATED,
                savingsGoalService.update(
                    userId,
                    goalId,
                    request
                )
            )
        );
    }


    @PostMapping("/{goalId}/complete")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> completeGoal(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId,
        @Valid
        @RequestBody
        CompleteSavingsGoalRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.COMPLETED,
                savingsGoalService.complete(
                    userId,
                    goalId,
                    request
                )
            )
        );
    }


    @PostMapping("/{goalId}/archive")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> archiveGoal(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId,
        @Valid
        @RequestBody
        ArchiveSavingsGoalRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.ARCHIVED,
                savingsGoalService.archive(
                    userId,
                    goalId,
                    request
                )
            )
        );
    }


    @PostMapping("/{goalId}/contributions")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> addContribution(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId,
        @Valid
        @RequestBody
        CreateGoalContributionRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Goal.CONTRIBUTION_CREATED,
                    savingsGoalService.addContribution(
                        userId,
                        goalId,
                        request
                    )
                )
            );
    }


    @GetMapping("/{goalId}/contributions")
    public ResponseEntity<ApiResponse<PageResponse<GoalContributionResponse>>> getContributions(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId,
        @Valid
        @ParameterObject
        @ModelAttribute
        GoalContributionQuery query
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.CONTRIBUTION_FETCHED_ALL,
                savingsGoalService
                    .findContributions(
                        userId,
                        goalId,
                        query
                    )
            )
        );
    }


    @PatchMapping("/{goalId}/contributions/{contributionId}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> updateContribution(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId,
        @PathVariable UUID contributionId,
        @Valid
        @RequestBody
        UpdateGoalContributionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.CONTRIBUTION_FETCHED,
                savingsGoalService
                    .updateContribution(
                        userId,
                        goalId,
                        contributionId,
                        request
                    )
            )
        );
    }


    @PostMapping("/{goalId}/contributions/{contributionId}/void")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> voidContribution(
        @CurrentUserId UUID userId,
        @PathVariable UUID goalId,
        @PathVariable UUID contributionId,
        @Valid
        @RequestBody
        VoidGoalContributionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.CONTRIBUTION_VOIDED,
                savingsGoalService
                    .voidContribution(
                        userId,
                        goalId,
                        contributionId,
                        request
                    )
            )
        );
    }
}
