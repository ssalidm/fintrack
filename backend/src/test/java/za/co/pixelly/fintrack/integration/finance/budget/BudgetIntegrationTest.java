package za.co.pixelly.fintrack.integration.finance.budget;

import org.junit.jupiter.api.Test;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BudgetIntegrationTest
    extends AbstractIntegrationTest {

    private final JsonParser jsonParser =
        new JacksonJsonParser();


    @Test
    void userCanCreateBudgetAndMonthIsNormalized()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-create"
            );

        createBudget(
            user,
            "August Budget",
            "2026-08-24"
        )
            .andExpect(
                status().isCreated()
            )
            .andExpect(
                jsonPath("$.result.name")
                    .value(
                        "August Budget"
                    )
            )
            .andExpect(
                jsonPath(
                    "$.result.budgetMonth"
                )
                    .value(
                        "2026-08-01"
                    )
            )
            .andExpect(
                jsonPath(
                    "$.result.currencyCode"
                )
                    .value("ZAR")
            )
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(0)
            );
    }


    @Test
    void duplicateActiveBudgetForMonthAndCurrencyIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-duplicate"
            );

        createBudget(
            user,
            "August One",
            "2026-08-05"
        )
            .andExpect(
                status().isCreated()
            );

        createBudget(
            user,
            "August Two",
            "2026-08-25"
        )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void expenseCategoryCanBeAddedToBudget()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-expense"
            );

        MvcResult budget =
            createBudget(
                user,
                "Expense Budget",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                budget,
                "id"
            );

        UUID groceries =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        addLimit(
            user,
            budgetId,
            groceries,
            "3000.00"
        )
            .andExpect(
                status().isCreated()
            )
            .andExpect(
                jsonPath(
                    "$.result.limits.length()"
                )
                    .value(1)
            )
            .andExpect(
                jsonPath(
                    "$.result.limits[0].categoryId"
                )
                    .value(
                        groceries.toString()
                    )
            )
            .andExpect(
                jsonPath(
                    "$.result.limits[0].limitAmount"
                )
                    .value(3000.00)
            );
    }


    @Test
    void incomeCategoryCannotBeBudgeted()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-income"
            );

        MvcResult budget =
            createBudget(
                user,
                "Income Test",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                budget,
                "id"
            );

        UUID salary =
            categoryId(
                user.userId(),
                "SALARY"
            );

        addLimit(
            user,
            budgetId,
            salary,
            "5000"
        )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void sameCategoryCannotBeAddedTwice()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-limit-duplicate"
            );

        MvcResult budget =
            createBudget(
                user,
                "Duplicate Limit Budget",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                budget,
                "id"
            );

        UUID groceries =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        addLimit(
            user,
            budgetId,
            groceries,
            "2000"
        )
            .andExpect(
                status().isCreated()
            );

        addLimit(
            user,
            budgetId,
            groceries,
            "3000"
        )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void existingLimitAmountCanBeChangedAfterCategoryIsArchived()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "archived-category"
            );

        MvcResult budget =
            createBudget(
                user,
                "Archived Category Budget",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                budget,
                "id"
            );

        UUID groceries =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        MvcResult withLimit =
            addLimit(
                user,
                budgetId,
                groceries,
                "2000"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String limitId =
            nestedResultField(
                withLimit,
                "limits",
                0,
                "id"
            );

        String limitVersion =
            nestedResultField(
                withLimit,
                "limits",
                0,
                "version"
            );

        archiveCategory(
            user,
            groceries
        )
            .andExpect(
                status().isOk()
            );

        mockMvc.perform(
                patch(
                    "/api/v1/budgets/{budgetId}/limits/{limitId}",
                    budgetId,
                    limitId
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
                                          "limitAmount": 2500.00
                                        }
                                        """.formatted(
                        limitVersion
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.limits[0].limitAmount"
                )
                    .value(2500.00)
            );
    }


    @Test
    void staleBudgetVersionIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-stale"
            );

        MvcResult created =
            createBudget(
                user,
                "Version Budget",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                created,
                "id"
            );

        String version =
            resultField(
                created,
                "version"
            );

        updateBudget(
            user,
            budgetId,
            version,
            "Updated Once"
        )
            .andExpect(
                status().isOk()
            );

        updateBudget(
            user,
            budgetId,
            version,
            "Stale Update"
        )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void archivedBudgetCannotBeModified()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-archive"
            );

        MvcResult created =
            createBudget(
                user,
                "Archive Budget",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                created,
                "id"
            );

        String version =
            resultField(
                created,
                "version"
            );

        mockMvc.perform(
                post(
                    "/api/v1/budgets/{budgetId}/archive",
                    budgetId
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
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("ARCHIVED")
            );

        UUID groceries =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        addLimit(
            user,
            budgetId,
            groceries,
            "1000"
        )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void userCanDeleteBudgetCategoryLimit()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "budget-delete-limit"
            );

        MvcResult budget =
            createBudget(
                user,
                "Delete Limit Budget",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                budget,
                "id"
            );

        UUID groceries =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        MvcResult created =
            addLimit(
                user,
                budgetId,
                groceries,
                "1000"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String limitId =
            nestedResultField(
                created,
                "limits",
                0,
                "id"
            );

        String limitVersion =
            nestedResultField(
                created,
                "limits",
                0,
                "version"
            );

        mockMvc.perform(
                delete(
                    "/api/v1/budgets/{budgetId}/limits/{limitId}",
                    budgetId,
                    limitId
                )
                    .queryParam(
                        "version",
                        limitVersion
                    )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(
                status().isNoContent()
            );

        mockMvc.perform(
                get(
                    "/api/v1/budgets/{budgetId}",
                    budgetId
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.limits.length()"
                )
                    .value(0)
            );
    }


    @Test
    void userCannotReadAnotherUsersBudget()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "budget-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "budget-attacker"
            );

        MvcResult created =
            createBudget(
                owner,
                "Private Budget",
                "2026-08-01"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String budgetId =
            resultField(
                created,
                "id"
            );

        mockMvc.perform(
                get(
                    "/api/v1/budgets/{budgetId}",
                    budgetId
                )
                    .header(
                        "Authorization",
                        bearer(attacker)
                    )
            )
            .andExpect(
                status().isNotFound()
            );
    }


    @Test
    void budgetsRequireAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/budgets")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    /*
     * Helpers
     */

    private ResultActions createBudget(
        AuthenticatedUser user,
        String name,
        String month
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/budgets")
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
                                  "budgetMonth": "%s",
                                  "currencyCode": "ZAR"
                                }
                                """.formatted(
                    name,
                    month
                ))
        );
    }


    private ResultActions addLimit(
        AuthenticatedUser user,
        String budgetId,
        UUID categoryId,
        String amount
    ) throws Exception {

        return mockMvc.perform(
            post(
                "/api/v1/budgets/{budgetId}/limits",
                budgetId
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
                                  "categoryId": "%s",
                                  "limitAmount": %s
                                }
                                """.formatted(
                    categoryId,
                    amount
                ))
        );
    }


    private ResultActions updateBudget(
        AuthenticatedUser user,
        String budgetId,
        String version,
        String name
    ) throws Exception {

        return mockMvc.perform(
            patch(
                "/api/v1/budgets/{budgetId}",
                budgetId
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


    private ResultActions archiveCategory(
        AuthenticatedUser user,
        UUID categoryId
    ) throws Exception {

        Long version =
            jdbcTemplate.queryForObject(
                """
                SELECT version
                FROM finance.categories
                WHERE id = ?
                  AND user_id = ?
                """,
                Long.class,
                categoryId,
                user.userId()
            );

        return mockMvc.perform(
            post(
                "/api/v1/categories/{categoryId}/archive",
                categoryId
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
                                  "version": %d
                                }
                                """.formatted(
                    version
                ))
        );
    }


    private UUID categoryId(
        UUID userId,
        String templateCode
    ) {
        return jdbcTemplate.queryForObject(
            """
            SELECT id
            FROM finance.categories
            WHERE user_id = ?
              AND template_code = ?
            """,
            UUID.class,
            userId,
            templateCode
        );
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


    @SuppressWarnings("unchecked")
    private String nestedResultField(
        MvcResult result,
        String listField,
        int index,
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

        java.util.List<Map<String, Object>>
            list =
            (java.util.List<Map<String, Object>>)
                body.get(listField);

        return list
            .get(index)
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
