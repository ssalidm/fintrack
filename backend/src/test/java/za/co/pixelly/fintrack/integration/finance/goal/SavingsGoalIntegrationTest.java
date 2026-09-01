package za.co.pixelly.fintrack.integration.finance.goal;

import org.junit.jupiter.api.Test;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SavingsGoalIntegrationTest
    extends AbstractIntegrationTest {

    private final JsonParser jsonParser =
        new JacksonJsonParser();


    @Test
    void userCanCreateSavingsGoal()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-create"
            );

        createGoal(
            user,
            "Emergency Fund",
            "10000"
        )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.result.name")
                    .value("Emergency Fund")
            )
            .andExpect(
                jsonPath("$.result.currencyCode")
                    .value("ZAR")
            )
            .andExpect(
                jsonPath("$.result.targetAmount")
                    .value(10000)
            )
            .andExpect(
                jsonPath("$.result.currentAmount")
                    .value(0)
            )
            .andExpect(
                jsonPath("$.result.remainingAmount")
                    .value(10000)
            )
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            );
    }


    @Test
    void duplicateOpenGoalNameIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-duplicate"
            );

        createGoal(
            user,
            "Emergency Fund",
            "10000"
        )
            .andExpect(status().isCreated());

        createGoal(
            user,
            "  emergency fund  ",
            "20000"
        )
            .andExpect(status().isConflict());
    }


    @Test
    void contributionUpdatesDerivedProgress()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-progress"
            );

        MvcResult created =
            createGoal(
                user,
                "Laptop",
                "20000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        addContribution(
            user,
            goalId,
            "5000",
            "2026-08-10"
        )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.result.currentAmount")
                    .value(5000)
            )
            .andExpect(
                jsonPath("$.result.remainingAmount")
                    .value(15000)
            )
            .andExpect(
                jsonPath(
                    "$.result.progressPercentage"
                )
                    .value(25.00)
            );
    }


    @Test
    void goalCannotBeCompletedBeforeTargetIsReached()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-early-complete"
            );

        MvcResult created =
            createGoal(
                user,
                "Car",
                "100000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        addContribution(
            user,
            goalId,
            "50000",
            "2026-08-10"
        )
            .andExpect(status().isCreated());

        completeGoal(
            user,
            goalId,
            version
        )
            .andExpect(status().isConflict());
    }


    @Test
    void goalCanBeCompletedWhenTargetIsReached()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-complete"
            );

        MvcResult created =
            createGoal(
                user,
                "Laptop",
                "10000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        addContribution(
            user,
            goalId,
            "10000",
            "2026-08-10"
        )
            .andExpect(status().isCreated());

        /*
         * Contributions do not modify the goal row,
         * so goal version remains unchanged.
         */
        completeGoal(
            user,
            goalId,
            version
        )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("COMPLETED")
            )
            .andExpect(
                jsonPath("$.result.completedAt")
                    .isNotEmpty()
            );
    }


    @Test
    void newContributionCannotBeAddedAfterCompletion()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-contribution-completed"
            );

        MvcResult created =
            createGoal(
                user,
                "Phone",
                "1000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        addContribution(
            user,
            goalId,
            "1000",
            "2026-08-10"
        )
            .andExpect(status().isCreated());

        completeGoal(
            user,
            goalId,
            version
        )
            .andExpect(status().isOk());

        addContribution(
            user,
            goalId,
            "100",
            "2026-08-11"
        )
            .andExpect(status().isConflict());
    }


    @Test
    void contributionHistoryIsPaginated()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-page"
            );

        MvcResult created =
            createGoal(
                user,
                "Travel",
                "50000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        for (int i = 1; i <= 7; i++) {
            addContribution(
                user,
                goalId,
                "100",
                "2026-08-%02d"
                    .formatted(i)
            )
                .andExpect(status().isCreated());
        }

        mockMvc.perform(
                get(
                    "/api/v1/goals/{goalId}/contributions",
                    goalId
                )
                    .queryParam("page", "0")
                    .queryParam("size", "3")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.items.length()"
                ).value(3)
            )
            .andExpect(
                jsonPath(
                    "$.result.totalElements"
                ).value(7)
            )
            .andExpect(
                jsonPath(
                    "$.result.totalPages"
                ).value(3)
            )
            .andExpect(
                jsonPath(
                    "$.result.items[0].contributionDate"
                ).value("2026-08-07")
            );
    }


    @Test
    void oversizedContributionPageIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-page-limit"
            );

        MvcResult created =
            createGoal(
                user,
                "Page Goal",
                "1000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        mockMvc.perform(
                get(
                    "/api/v1/goals/{goalId}/contributions",
                    goalId
                )
                    .queryParam(
                        "size",
                        "101"
                    )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isBadRequest());
    }


    @Test
    void financialContributionFieldsCannotBeChangedAfterCompletion()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-completed-edit"
            );

        MvcResult created =
            createGoal(
                user,
                "Completed Goal",
                "1000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        String goalVersion =
            resultField(created, "version");

        MvcResult contribution =
            addContribution(
                user,
                goalId,
                "1000",
                "2026-08-10"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String contributionId =
            contributionId(
                user,
                goalId
            );

        String contributionVersion =
            contributionVersion(
                contributionId
            );

        completeGoal(
            user,
            goalId,
            goalVersion
        )
            .andExpect(status().isOk());

        mockMvc.perform(
                patch(
                    "/api/v1/goals/{goalId}/contributions/{contributionId}",
                    goalId,
                    contributionId
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                                        {
                                          "version": %s,
                                          "amount": 900
                                        }
                                        """.formatted(
                        contributionVersion
                    ))
            )
            .andExpect(status().isConflict());
    }


    @Test
    void contributionCanBeVoidedAfterGoalCompletion()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-completed-void"
            );

        MvcResult created =
            createGoal(
                user,
                "Historical Goal",
                "1000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        String goalVersion =
            resultField(created, "version");

        addContribution(
            user,
            goalId,
            "1000",
            "2026-08-10"
        )
            .andExpect(status().isCreated());

        String contributionId =
            contributionId(
                user,
                goalId
            );

        String contributionVersion =
            contributionVersion(
                contributionId
            );

        completeGoal(
            user,
            goalId,
            goalVersion
        )
            .andExpect(status().isOk());

        mockMvc.perform(
                post(
                    "/api/v1/goals/{goalId}/contributions/{contributionId}/void",
                    goalId,
                    contributionId
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                                        {
                                          "version": %s,
                                          "reason": "Contribution entered incorrectly"
                                        }
                                        """.formatted(
                        contributionVersion
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.currentAmount"
                ).value(0)
            )
            .andExpect(
                jsonPath(
                    "$.result.status"
                ).value("COMPLETED")
            );
    }


    @Test
    void staleGoalVersionIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "goal-stale"
            );

        MvcResult created =
            createGoal(
                user,
                "Version Goal",
                "10000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        updateGoal(
            user,
            goalId,
            version,
            "Updated Goal"
        )
            .andExpect(status().isOk());

        updateGoal(
            user,
            goalId,
            version,
            "Stale Goal"
        )
            .andExpect(status().isConflict());
    }


    @Test
    void userCannotReadAnotherUsersGoal()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "goal-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "goal-attacker"
            );

        MvcResult created =
            createGoal(
                owner,
                "Private Goal",
                "10000"
            )
                .andExpect(status().isCreated())
                .andReturn();

        String goalId =
            resultField(created, "id");

        mockMvc.perform(
                get(
                    "/api/v1/goals/{goalId}",
                    goalId
                )
                    .header(
                        "Authorization",
                        bearer(attacker)
                    )
            )
            .andExpect(status().isNotFound());
    }


    @Test
    void goalsRequireAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/goals")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    /*
     * Helpers
     */

    private ResultActions createGoal(
        AuthenticatedUser user,
        String name,
        String targetAmount
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/goals")
                .header(
                    "Authorization",
                    bearer(user)
                )
                .contentType(
                    "application/json"
                )
                .content("""
                                {
                                  "name": "%s",
                                  "description": "Integration test goal",
                                  "currencyCode": "ZAR",
                                  "targetAmount": %s,
                                  "targetDate": "2027-01-01"
                                }
                                """.formatted(
                    name,
                    targetAmount
                ))
        );
    }


    private ResultActions addContribution(
        AuthenticatedUser user,
        String goalId,
        String amount,
        String date
    ) throws Exception {

        return mockMvc.perform(
            post(
                "/api/v1/goals/{goalId}/contributions",
                goalId
            )
                .header(
                    "Authorization",
                    bearer(user)
                )
                .contentType(
                    "application/json"
                )
                .content("""
                                {
                                  "amount": %s,
                                  "contributionDate": "%s",
                                  "note": "Integration contribution"
                                }
                                """.formatted(
                    amount,
                    date
                ))
        );
    }


    private ResultActions completeGoal(
        AuthenticatedUser user,
        String goalId,
        String version
    ) throws Exception {

        return mockMvc.perform(
            post(
                "/api/v1/goals/{goalId}/complete",
                goalId
            )
                .header(
                    "Authorization",
                    bearer(user)
                )
                .contentType(
                    "application/json"
                )
                .content("""
                                {
                                  "version": %s
                                }
                                """.formatted(
                    version
                ))
        );
    }


    private ResultActions updateGoal(
        AuthenticatedUser user,
        String goalId,
        String version,
        String name
    ) throws Exception {

        return mockMvc.perform(
            patch(
                "/api/v1/goals/{goalId}",
                goalId
            )
                .header(
                    "Authorization",
                    bearer(user)
                )
                .contentType(
                    "application/json"
                )
                .content("""
                                {
                                  "version": %s,
                                  "name": "%s"
                                }
                                """.formatted(
                    version,
                    name
                ))
        );
    }


    private String contributionId(
        AuthenticatedUser user,
        String goalId
    ) {
        return jdbcTemplate.queryForObject(
            """
            SELECT id::text
            FROM finance.goal_contributions
            WHERE goal_id = ?
              AND user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            String.class,
            java.util.UUID.fromString(
                goalId
            ),
            user.userId()
        );
    }


    private String contributionVersion(
        String contributionId
    ) {
        Long version =
            jdbcTemplate.queryForObject(
                """
                SELECT version
                FROM finance.goal_contributions
                WHERE id = ?
                """,
                Long.class,
                java.util.UUID.fromString(
                    contributionId
                )
            );

        return version.toString();
    }


    @SuppressWarnings("unchecked")
    private String resultField(
        MvcResult result,
        String field
    ) throws Exception {

        Map<String, Object> root =
            jsonParser.parseMap(
                result
                    .getResponse()
                    .getContentAsString()
            );

        Map<String, Object> body =
            (Map<String, Object>)
                root.get("result");

        return body
            .get(field)
            .toString();
    }


    private String bearer(
        AuthenticatedUser user
    ) {
        return "Bearer "
            + user.accessToken();
    }
}
