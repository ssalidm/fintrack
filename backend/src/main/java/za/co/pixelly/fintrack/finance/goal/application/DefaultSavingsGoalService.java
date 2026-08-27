package za.co.pixelly.fintrack.finance.goal.application;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.goal.api.*;
import za.co.pixelly.fintrack.finance.goal.domain.*;
import za.co.pixelly.fintrack.finance.goal.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DefaultSavingsGoalService
    implements SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final GoalContributionRepository contributionRepository;
    private final GoalCurrencyLookupRepository currencyLookupRepository;


    @Override
    @Transactional
    public SavingsGoalResponse create(
        UUID userId,
        CreateSavingsGoalRequest request
    ) {
        String currency = request.currencyCode()
            .trim()
            .toUpperCase(Locale.ROOT);

        if (!currencyLookupRepository.exists(currency)) {
            throw new SavingsGoalValidationException(
                "Unsupported currency code"
            );
        }

        if (savingsGoalRepository.existsOpenGoalWithName(
            userId,
            request.name()
        )) {

            throw new SavingsGoalConflictException(
                "An active or completed savings goal already exists with this name"
            );
        }

        SavingsGoal goal = SavingsGoal.create(
            userId,
            request.name(),
            request.description(),
            currency,
            request.targetAmount(),
            request.targetDate(),
            Instant.now()
        );

        try {
            SavingsGoal saved = savingsGoalRepository
                .saveAndFlush(goal);

            return response(saved);

        } catch (
            DataIntegrityViolationException exception
        ) {
            throw new SavingsGoalConflictException(
                "An active or completed savings goal already exists with this name"
            );
        }
    }


    @Override
    @Transactional(readOnly = true)
    public List<SavingsGoalResponse> findGoals(
        UUID userId,
        SavingsGoalStatus status
    ) {
        List<SavingsGoal> goals = savingsGoalRepository
            .findAllByUserIdAndStatusOrderByTargetDateAscCreatedAtDesc(
                userId,
                status
            );

        if (goals.isEmpty()) {
            return List.of();
        }

        List<UUID> goalIds = goals.stream()
            .map(SavingsGoal::getId)
            .toList();

        Map<UUID, BigDecimal> totals = contributionRepository
            .sumAmountsByGoalIds(
                userId,
                goalIds,
                GoalContributionStatus.POSTED
            )
            .stream()
            .collect(
                Collectors.toMap(
                    GoalContributionTotal::getGoalId,
                    GoalContributionTotal::getCurrentAmount
                )
            );

        return goals.stream()
            .map(goal ->
                SavingsGoalResponse.from(
                    goal,
                    totals.getOrDefault(
                        goal.getId(),
                        BigDecimal.ZERO
                    )
                )
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public SavingsGoalResponse findById(
        UUID userId,
        UUID goalId
    ) {
        return response(
            findOwnedGoal(
                userId,
                goalId
            )
        );
    }


    @Override
    @Transactional
    public SavingsGoalResponse update(
        UUID userId,
        UUID goalId,
        UpdateSavingsGoalRequest request
    ) {
        SavingsGoal goal = savingsGoalRepository
            .findByIdAndUserIdForUpdate(
                goalId,
                userId
            )
            .orElseThrow(SavingsGoalNotFoundException::new);

        ensureActive(goal);

        validateGoalVersion(
            goal,
            request.version()
        );

        if (request.name() != null
            && savingsGoalRepository
            .existsOpenGoalWithNameExcluding(
                userId,
                request.name(),
                goalId
            )) {

            throw new SavingsGoalConflictException(
                "An active or completed savings goal already exists with this name"
            );
        }

        goal.update(
            request.name(),
            request.description(),
            request.targetAmount(),
            request.targetDate(),
            Boolean.TRUE.equals(
                request.clearTargetDate()
            ),
            Instant.now()
        );

        try {
            SavingsGoal saved = savingsGoalRepository
                .saveAndFlush(goal);

            return response(saved);

        } catch (
            DataIntegrityViolationException exception
        ) {
            throw new SavingsGoalConflictException(
                "An active or completed savings goal already exists with this name"
            );
        }
    }


    @Override
    @Transactional
    public SavingsGoalResponse complete(
        UUID userId,
        UUID goalId,
        CompleteSavingsGoalRequest request
    ) {
        SavingsGoal goal = savingsGoalRepository
            .findByIdAndUserIdForUpdate(
                goalId,
                userId
            )
            .orElseThrow(
                SavingsGoalNotFoundException::new
            );

        ensureActive(goal);

        validateGoalVersion(
            goal,
            request.version()
        );

        BigDecimal currentAmount =
            currentAmount(
                userId,
                goalId
            );

        if (currentAmount.compareTo(
            goal.getTargetAmount()
        ) < 0) {

            throw new SavingsGoalConflictException(
                "Savings goal cannot be completed until the target amount has been reached"
            );
        }

        goal.complete(
            Instant.now()
        );

        SavingsGoal saved = savingsGoalRepository
            .saveAndFlush(goal);

        return SavingsGoalResponse.from(
            saved,
            currentAmount
        );
    }


    @Override
    @Transactional
    public SavingsGoalResponse archive(
        UUID userId,
        UUID goalId,
        ArchiveSavingsGoalRequest request
    ) {
        SavingsGoal goal = savingsGoalRepository
            .findByIdAndUserIdForUpdate(
                goalId,
                userId
            )
            .orElseThrow(
                SavingsGoalNotFoundException::new
            );

        if (goal.getStatus() == SavingsGoalStatus.ARCHIVED) {

            throw new SavingsGoalConflictException(
                "Savings goal is already archived"
            );
        }

        validateGoalVersion(
            goal,
            request.version()
        );

        goal.archive(
            Instant.now()
        );

        SavingsGoal saved = savingsGoalRepository
            .saveAndFlush(goal);

        return response(saved);
    }


    @Override
    @Transactional
    public SavingsGoalResponse addContribution(
        UUID userId,
        UUID goalId,
        CreateGoalContributionRequest request
    ) {
        SavingsGoal goal = savingsGoalRepository
            .findByIdAndUserIdForUpdate(
                goalId,
                userId
            )
            .orElseThrow(
                SavingsGoalNotFoundException::new
            );

        ensureActiveForContribution(goal);

        GoalContribution contribution =
            GoalContribution.create(
                goalId,
                userId,
                request.amount(),
                request.contributionDate(),
                request.note(),
                Instant.now()
            );

        contributionRepository
            .saveAndFlush(contribution);

        return response(goal);
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponse<GoalContributionResponse>
    findContributions(
        UUID userId,
        UUID goalId,
        GoalContributionQuery query
    ) {
        /*
         * Establish ownership before returning
         * an empty list for a foreign goal.
         */
        findOwnedGoal(
            userId,
            goalId
        );

        Pageable pageable = PageRequest.of(
            query.getPage(),
            query.getSize(),
            Sort.by(
                Sort.Order.desc(
                    "contributionDate"
                ),
                Sort.Order.desc(
                    "createdAt"
                ),
                Sort.Order.desc(
                    "id"
                )
            )
        );

        Page<GoalContributionResponse> page = contributionRepository
            .findAll(
                GoalContributionSpecifications
                    .from(
                        userId,
                        goalId,
                        query
                    ),
                pageable
            )
            .map(
                GoalContributionResponse::from
            );

        return PageResponse.from(page);
    }


    @Override
    @Transactional
    public SavingsGoalResponse updateContribution(
        UUID userId,
        UUID goalId,
        UUID contributionId,
        UpdateGoalContributionRequest request
    ) {
        SavingsGoal goal = savingsGoalRepository
            .findByIdAndUserIdForUpdate(
                goalId,
                userId
            )
            .orElseThrow(
                SavingsGoalNotFoundException::new
            );

        GoalContribution contribution =
            findContribution(
                userId,
                goalId,
                contributionId
            );

        if (contribution.getStatus() == GoalContributionStatus.VOIDED) {

            throw new SavingsGoalConflictException(
                "Voided contributions cannot be modified"
            );
        }

        validateContributionVersion(
            contribution,
            request.version()
        );

        boolean changesFinancialFields = request.amount() != null
            || request.contributionDate()
            != null;

        /*
         * Exactly mirrors the trigger:
         *
         * amount/date changes require ACTIVE goal.
         * Note-only corrections remain legal after
         * completion/archive.
         */
        if (changesFinancialFields
            && goal.getStatus()
            != SavingsGoalStatus.ACTIVE) {

            throw new SavingsGoalConflictException(
                "Completed or archived goal contributions cannot have their amount or date changed"
            );
        }

        contribution.update(
            request.amount(),
            request.contributionDate(),
            request.note(),
            Instant.now()
        );

        contributionRepository
            .saveAndFlush(contribution);

        return response(goal);
    }


    @Override
    @Transactional
    public SavingsGoalResponse voidContribution(
        UUID userId,
        UUID goalId,
        UUID contributionId,
        VoidGoalContributionRequest request
    ) {
        SavingsGoal goal = savingsGoalRepository
            .findByIdAndUserId(
                goalId,
                userId
            )
            .orElseThrow(
                SavingsGoalNotFoundException::new
            );

        GoalContribution contribution = findContribution(
            userId,
            goalId,
            contributionId
        );

        if (contribution.getStatus() == GoalContributionStatus.VOIDED) {

            throw new SavingsGoalConflictException(
                "Goal contribution is already voided"
            );
        }

        validateContributionVersion(
            contribution,
            request.version()
        );

        /*
         * Intentionally allowed for ACTIVE,
         * COMPLETED and ARCHIVED goals.
         *
         * The database trigger explicitly permits
         * this historical correction.
         */
        contribution.voidContribution(
            request.reason(),
            Instant.now()
        );

        contributionRepository
            .saveAndFlush(contribution);

        return response(goal);
    }


    private SavingsGoal findOwnedGoal(
        UUID userId,
        UUID goalId
    ) {
        return savingsGoalRepository
            .findByIdAndUserId(
                goalId,
                userId
            )
            .orElseThrow(
                SavingsGoalNotFoundException::new
            );
    }


    private GoalContribution findContribution(
        UUID userId,
        UUID goalId,
        UUID contributionId
    ) {
        return contributionRepository
            .findByIdAndGoalIdAndUserId(
                contributionId,
                goalId,
                userId
            )
            .orElseThrow(GoalContributionNotFoundException::new);
    }


    private void ensureActive(
        SavingsGoal goal
    ) {
        if (goal.getStatus() != SavingsGoalStatus.ACTIVE) {

            throw new SavingsGoalConflictException("Only active savings goals can be modified");
        }
    }


    private void ensureActiveForContribution(
        SavingsGoal goal
    ) {
        if (goal.getStatus() != SavingsGoalStatus.ACTIVE) {

            throw new SavingsGoalConflictException("Contributions may only be added to active goals");
        }
    }


    private void validateGoalVersion(
        SavingsGoal goal,
        long requestedVersion
    ) {
        if (goal.getVersion()
            != requestedVersion) {

            throw new SavingsGoalConflictException("The savings goal has changed since it was last retrieved");
        }
    }


    private void validateContributionVersion(
        GoalContribution contribution,
        long requestedVersion
    ) {
        if (contribution.getVersion()
            != requestedVersion) {

            throw new SavingsGoalConflictException("The goal contribution has changed since it was last retrieved");
        }
    }


    private BigDecimal currentAmount(
        UUID userId,
        UUID goalId
    ) {
        BigDecimal amount = contributionRepository
            .sumAmount(
                goalId,
                userId,
                GoalContributionStatus.POSTED
            );

        return amount == null
            ? BigDecimal.ZERO
            : amount;
    }


    private SavingsGoalResponse response(
        SavingsGoal goal
    ) {
        return SavingsGoalResponse.from(
            goal,
            currentAmount(
                goal.getUserId(),
                goal.getId()
            )
        );
    }
}
