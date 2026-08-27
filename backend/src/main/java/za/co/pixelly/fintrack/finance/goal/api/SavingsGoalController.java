package za.co.pixelly.fintrack.finance.goal.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.goal.application.SavingsGoalService;
import za.co.pixelly.fintrack.finance.goal.domain.SavingsGoalStatus;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Savings Goals",
    description = "Manage savings goals and their contributions"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;


    @PostMapping
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> createGoal(
        @AuthenticationPrincipal Jwt jwt,
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
                        userId(jwt),
                        request
                    )
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<SavingsGoalResponse>>> getGoals(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(defaultValue = "ACTIVE")
        SavingsGoalStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.FETCHED_ALL,
                savingsGoalService.findGoals(
                    userId(jwt),
                    status
                )
            )
        );
    }


    @GetMapping("/{goalId}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> getGoal(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID goalId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Goal.FETCHED,
                savingsGoalService.findById(
                    userId(jwt),
                    goalId
                )
            )
        );
    }


    @PatchMapping("/{goalId}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> updateGoal(
        @AuthenticationPrincipal Jwt jwt,
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
                    userId(jwt),
                    goalId,
                    request
                )
            )
        );
    }


    @PostMapping("/{goalId}/complete")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> completeGoal(
        @AuthenticationPrincipal Jwt jwt,
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
                    userId(jwt),
                    goalId,
                    request
                )
            )
        );
    }


    @PostMapping("/{goalId}/archive")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> archiveGoal(
        @AuthenticationPrincipal Jwt jwt,
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
                    userId(jwt),
                    goalId,
                    request
                )
            )
        );
    }


    @PostMapping("/{goalId}/contributions")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> addContribution(
        @AuthenticationPrincipal Jwt jwt,
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
                        userId(jwt),
                        goalId,
                        request
                    )
                )
            );
    }


    @GetMapping("/{goalId}/contributions")
    public ResponseEntity<ApiResponse<PageResponse<GoalContributionResponse>>> getContributions(
        @AuthenticationPrincipal Jwt jwt,
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
                        userId(jwt),
                        goalId,
                        query
                    )
            )
        );
    }


    @PatchMapping("/{goalId}/contributions/{contributionId}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> updateContribution(
        @AuthenticationPrincipal Jwt jwt,
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
                        userId(jwt),
                        goalId,
                        contributionId,
                        request
                    )
            )
        );
    }


    @PostMapping("/{goalId}/contributions/{contributionId}/void")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> voidContribution(
        @AuthenticationPrincipal Jwt jwt,
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
                        userId(jwt),
                        goalId,
                        contributionId,
                        request
                    )
            )
        );
    }


    private UUID userId(
        Jwt jwt
    ) {
        return UUID.fromString(
            Objects.requireNonNull(jwt.getSubject())
        );
    }
}
