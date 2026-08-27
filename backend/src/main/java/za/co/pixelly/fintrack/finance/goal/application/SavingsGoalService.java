package za.co.pixelly.fintrack.finance.goal.application;

import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.goal.api.*;
import za.co.pixelly.fintrack.finance.goal.domain.SavingsGoalStatus;

import java.util.List;
import java.util.UUID;

public interface SavingsGoalService {

    SavingsGoalResponse create(
        UUID userId,
        CreateSavingsGoalRequest request
    );

    List<SavingsGoalResponse> findGoals(
        UUID userId,
        SavingsGoalStatus status
    );

    SavingsGoalResponse findById(
        UUID userId,
        UUID goalId
    );

    SavingsGoalResponse update(
        UUID userId,
        UUID goalId,
        UpdateSavingsGoalRequest request
    );

    SavingsGoalResponse complete(
        UUID userId,
        UUID goalId,
        CompleteSavingsGoalRequest request
    );

    SavingsGoalResponse archive(
        UUID userId,
        UUID goalId,
        ArchiveSavingsGoalRequest request
    );

    SavingsGoalResponse addContribution(
        UUID userId,
        UUID goalId,
        CreateGoalContributionRequest request
    );

    PageResponse<GoalContributionResponse>
    findContributions(
        UUID userId,
        UUID goalId,
        GoalContributionQuery query
    );

    SavingsGoalResponse updateContribution(
        UUID userId,
        UUID goalId,
        UUID contributionId,
        UpdateGoalContributionRequest request
    );

    SavingsGoalResponse voidContribution(
        UUID userId,
        UUID goalId,
        UUID contributionId,
        VoidGoalContributionRequest request
    );
}
