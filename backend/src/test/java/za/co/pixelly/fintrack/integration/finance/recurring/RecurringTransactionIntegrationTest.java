package za.co.pixelly.fintrack.integration.finance.recurring;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.finance.recurring.application.RecurringTransactionOccurrenceService;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(RecurringTransactionIntegrationTest.TestClockConfiguration.class)
class RecurringTransactionIntegrationTest extends AbstractIntegrationTest {

    private final JsonParser jsonParser = new JacksonJsonParser();

    @Autowired
    private RecurringTransactionOccurrenceService occurrenceService;


    @Test
    void userCanCreateRecurringExpense()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "recurring-create"
        );

        String accountId = createAccount(
            user,
            "Recurring Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        createRecurring(
            user,
            accountId,
            groceries,
            "Weekly Groceries",
            "EXPENSE",
            "500",
            "WEEKLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            )
            .andExpect(
                jsonPath("$.result.nextDueDate")
                    .value("2026-08-20")
            )
            .andExpect(
                jsonPath("$.result.lastGeneratedDate")
                    .doesNotExist()
            );
    }


    @Test
    void categoryTypeMustMatchRecurringTransactionType()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "recurring-type"
        );

        String accountId = createAccount(
            user,
            "Type Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        createRecurring(
            user,
            accountId,
            groceries,
            "Wrong Type",
            "INCOME",
            "1000",
            "MONTHLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void duplicateOpenScheduleNameIsRejected()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "recurring-duplicate"
        );

        String accountId = createAccount(
            user,
            "Duplicate Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        createRecurring(
            user,
            accountId,
            groceries,
            "Groceries",
            "EXPENSE",
            "500",
            "WEEKLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(status().isCreated());

        createRecurring(
            user,
            accountId,
            groceries,
            " groceries ",
            "EXPENSE",
            "700",
            "MONTHLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(status().isConflict());
    }


    @Test
    void userCanPauseAndResumeSchedule()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "recurring-pause"
            );

        String accountId = createAccount(
            user,
            "Pause Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        MvcResult created = createRecurring(
            user,
            accountId,
            groceries,
            "Pause Schedule",
            "EXPENSE",
            "500",
            "MONTHLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(status().isCreated())
            .andReturn();

        String scheduleId = resultField(created, "id");

        String version = resultField(created, "version");


        MvcResult paused = lifecycle(
            user,
            scheduleId,
            "pause",
            version
        )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("PAUSED")
            )
            .andReturn();

        String pausedVersion = resultField(
            paused,
            "version"
        );


        lifecycle(
            user,
            scheduleId,
            "resume",
            pausedVersion
        )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            );
    }


    @Test
    void manualPostingCreatesLinkedTransactionAndAdvancesSchedule()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "recurring-manual"
        );

        String accountId = createAccount(
            user,
            "Manual Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        MvcResult created = createRecurring(
            user,
            accountId,
            groceries,
            "Manual Groceries",
            "EXPENSE",
            "250",
            "WEEKLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(status().isCreated())
            .andReturn();

        String scheduleId = resultField(
            created,
            "id"
        );

        String version = resultField(
            created,
            "version"
        );


        mockMvc.perform(
                post(
                    "/api/v1/recurring-transactions/{scheduleId}/post-due",
                    scheduleId
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
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath(
                    "$.result.transaction.recurringTransactionId"
                )
                    .value(scheduleId)
            )
            .andExpect(
                jsonPath(
                    "$.result.transaction.recurrenceDueDate"
                )
                    .value("2026-08-20")
            )
            .andExpect(
                jsonPath(
                    "$.result.schedule.lastGeneratedDate"
                )
                    .value("2026-08-20")
            )
            .andExpect(
                jsonPath(
                    "$.result.schedule.nextDueDate"
                )
                    .value("2026-08-27")
            );


        Integer generated = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(*)
                FROM finance.transactions
                WHERE recurring_transaction_id = ?
                  AND recurrence_due_date =
                      DATE '2026-08-20'
                """,
            Integer.class,
            UUID.fromString(
                scheduleId
            )
        );

        assertEquals(
            1,
            generated
        );
    }


    @Test
    void finalOccurrenceCompletesSchedule()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "recurring-complete"
        );

        String accountId = createAccount(
            user,
            "Completion Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        MvcResult created = createRecurring(
            user,
            accountId,
            groceries,
            "One Time Recurring",
            "EXPENSE",
            "100",
            "MONTHLY",
            1,
            "2026-08-20",
            "2026-08-20",
            false
        )
            .andExpect(status().isCreated())
            .andReturn();

        String scheduleId = resultField(
            created,
            "id"
        );

        String version = resultField(
            created,
            "version"
        );


        mockMvc.perform(
                post(
                    "/api/v1/recurring-transactions/{scheduleId}/post-due",
                    scheduleId
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
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath(
                    "$.result.schedule.status"
                )
                    .value("COMPLETED")
            )
            .andExpect(
                jsonPath(
                    "$.result.schedule.nextDueDate"
                )
                    .doesNotExist()
            )
            .andExpect(
                jsonPath(
                    "$.result.schedule.completedAt"
                )
                    .isNotEmpty()
            );
    }


    @Test
    void automaticScheduleIsPausedWhenAccountBecomesArchived()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "recurring-archive-account"
        );

        String accountId = createAccount(
            user,
            "Archived Recurring Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        MvcResult created = createRecurring(
            user,
            accountId,
            groceries,
            "Blocked Schedule",
            "EXPENSE",
            "100",
            "DAILY",
            1,
            "2026-08-20",
            null,
            true
        )
            .andExpect(status().isCreated())
            .andReturn();

        UUID scheduleId = UUID.fromString(
            resultField(
                created,
                "id"
            )
        );


        archiveAccount(
            user,
            accountId
        )
            .andExpect(status().isOk());


        int generated = occurrenceService
            .processAutomaticSchedule(
                scheduleId,
                100
            );

        assertEquals(
            0,
            generated
        );


        String status = jdbcTemplate.queryForObject(
            """
                SELECT status
                FROM finance.recurring_transactions
                WHERE id = ?
                """,
            String.class,
            scheduleId
        );

        assertEquals(
            "PAUSED",
            status
        );
    }


    @Test
    void staleScheduleVersionIsRejected()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "recurring-stale"
        );

        String accountId = createAccount(
            user,
            "Version Account"
        );

        UUID groceries = categoryId(
            user.userId(),
            "GROCERIES"
        );

        MvcResult created = createRecurring(
            user,
            accountId,
            groceries,
            "Version Schedule",
            "EXPENSE",
            "100",
            "MONTHLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(status().isCreated())
            .andReturn();

        String scheduleId = resultField(
            created,
            "id"
        );

        String version = resultField(
            created,
            "version"
        );


        updateName(
            user,
            scheduleId,
            version,
            "Updated Schedule"
        )
            .andExpect(status().isOk());


        updateName(
            user,
            scheduleId,
            version,
            "Stale Schedule"
        )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void userCannotReadAnotherUsersSchedule()
        throws Exception {

        AuthenticatedUser owner = createAuthenticatedUser(
            "recurring-owner"
        );

        AuthenticatedUser attacker = createAuthenticatedUser(
            "recurring-attacker"
        );

        String accountId = createAccount(
            owner,
            "Private Recurring Account"
        );

        UUID groceries = categoryId(
            owner.userId(),
            "GROCERIES"
        );

        MvcResult created = createRecurring(
            owner,
            accountId,
            groceries,
            "Private Schedule",
            "EXPENSE",
            "100",
            "MONTHLY",
            1,
            "2026-08-20",
            null,
            false
        )
            .andExpect(status().isCreated())
            .andReturn();

        String scheduleId = resultField(
            created,
            "id"
        );


        mockMvc.perform(
                get(
                    "/api/v1/recurring-transactions/{scheduleId}",
                    scheduleId
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
    void startFromCurrentSkipsHistoricalOccurrences()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "recurring-current"
            );

        String accountId =
            createAccount(
                user,
                "Current Start Account"
            );

        UUID groceries =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        LocalDate today =
            TEST_TODAY;

        LocalDate historicalStartDate =
            today.minusDays(7);


        MvcResult created =
            createRecurringWithCatchUpMode(
                user,
                accountId,
                groceries,
                "Current Daily Expense",
                "EXPENSE",
                "25",
                "DAILY",
                1,
                historicalStartDate.toString(),
                null,
                true,
                "START_FROM_CURRENT"
            )
                .andExpect(status().isCreated())
                .andExpect(
                    jsonPath("$.result.startDate")
                        .value(
                            historicalStartDate.toString()
                        )
                )
                .andExpect(
                    jsonPath("$.result.nextDueDate")
                        .value(
                            today.toString()
                        )
                )
                .andReturn();


        UUID scheduleId =
            UUID.fromString(
                resultField(
                    created,
                    "id"
                )
            );


        int generated =
            occurrenceService
                .processAutomaticSchedule(
                    scheduleId,
                    100
                );


        assertEquals(
            1,
            generated
        );


        Integer transactionCount =
            jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM finance.transactions
                WHERE recurring_transaction_id = ?
                """,
                Integer.class,
                scheduleId
            );

        assertEquals(
            1,
            transactionCount
        );


        LocalDate generatedDueDate =
            jdbcTemplate.queryForObject(
                """
                SELECT recurrence_due_date
                FROM finance.transactions
                WHERE recurring_transaction_id = ?
                """,
                LocalDate.class,
                scheduleId
            );

        assertEquals(
            today,
            generatedDueDate
        );
    }

    @Test
    void startFromCurrentRejectsScheduleWithNoRemainingOccurrences()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "recurring-expired"
            );

        String accountId =
            createAccount(
                user,
                "Expired Schedule Account"
            );

        UUID groceries =
            categoryId(
                user.userId(),
                "GROCERIES"
            );


        createRecurringWithCatchUpMode(
            user,
            accountId,
            groceries,
            "Expired Expense",
            "EXPENSE",
            "100",
            "MONTHLY",
            1,
            "2026-01-01",
            "2026-06-01",
            true,
            "START_FROM_CURRENT"
        )
            .andExpect(
                status().isBadRequest()
            )
            .andExpect(
                jsonPath("$.message")
                    .value(
                        "The recurring schedule has no remaining occurrences"
                    )
            );
    }


    @Test
    void recurringTransactionsRequireAuthentication()
        throws Exception {

        mockMvc.perform(
                get(
                    "/api/v1/recurring-transactions"
                )
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    private static final LocalDate TEST_TODAY = LocalDate.of(2026, 8, 27);

    @TestConfiguration(proxyBeanMethods = false)
    static class TestClockConfiguration {

        @Bean
        @Primary
        Clock recurringTestClock() {
            return Clock.fixed(
                Instant.parse("2026-08-27T10:00:00Z"),
                ZoneId.of("Africa/Johannesburg")
            );
        }
    }


    /*
     * Helpers
     */

    private String createAccount(
        AuthenticatedUser user,
        String name
    ) throws Exception {

        MvcResult result = mockMvc.perform(
                post("/api/v1/accounts")
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
                          "accountType": "CURRENT",
                          "currencyCode": "ZAR",
                          "openingBalance": 0,
                          "includeInNetWorth": true
                        }
                        """.formatted(name))
            )
            .andExpect(
                status().isCreated()
            )
            .andReturn();

        return resultField(
            result,
            "id"
        );
    }

    private ResultActions createRecurringWithCatchUpMode(
        AuthenticatedUser user,
        String accountId,
        UUID categoryId,
        String name,
        String type,
        String amount,
        String frequency,
        int intervalCount,
        String startDate,
        String endDate,
        boolean autoPost,
        String catchUpMode
    ) throws Exception {

        String endDateJson =
            endDate == null
                ? "null"
                : "\""
                + endDate
                + "\"";

        return mockMvc.perform(
            post(
                "/api/v1/recurring-transactions"
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
                      "accountId": "%s",
                      "categoryId": "%s",
                      "name": "%s",
                      "transactionType": "%s",
                      "amount": %s,
                      "description": "Integration recurring transaction",
                      "merchantName": "Integration Merchant",
                      "frequency": "%s",
                      "intervalCount": %d,
                      "startDate": "%s",
                      "endDate": %s,
                      "autoPost": %s,
                      "catchUpMode": "%s"
                    }
                    """.formatted(
                    accountId,
                    categoryId,
                    name,
                    type,
                    amount,
                    frequency,
                    intervalCount,
                    startDate,
                    endDateJson,
                    autoPost,
                    catchUpMode
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


    private ResultActions createRecurring(
        AuthenticatedUser user,
        String accountId,
        UUID categoryId,
        String name,
        String type,
        String amount,
        String frequency,
        int intervalCount,
        String startDate,
        String endDate,
        boolean autoPost
    ) throws Exception {

        String endDateJson = endDate == null
            ? "null"
            : "\""
            + endDate
            + "\"";

        return mockMvc.perform(
            post(
                "/api/v1/recurring-transactions"
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
                      "accountId": "%s",
                      "categoryId": "%s",
                      "name": "%s",
                      "transactionType": "%s",
                      "amount": %s,
                      "description": "Integration recurring transaction",
                      "merchantName": "Integration Merchant",
                      "frequency": "%s",
                      "intervalCount": %d,
                      "startDate": "%s",
                      "endDate": %s,
                      "autoPost": %s,
                      "catchUpMode": "GENERATE_MISSED"
                    }
                    """.formatted(
                    accountId,
                    categoryId,
                    name,
                    type,
                    amount,
                    frequency,
                    intervalCount,
                    startDate,
                    endDateJson,
                    autoPost
                ))
        );
    }


    private ResultActions lifecycle(
        AuthenticatedUser user,
        String scheduleId,
        String operation,
        String version
    ) throws Exception {

        return mockMvc.perform(
            post(
                "/api/v1/recurring-transactions/{scheduleId}/{operation}",
                scheduleId,
                operation
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


    private ResultActions updateName(
        AuthenticatedUser user,
        String scheduleId,
        String version,
        String name
    ) throws Exception {

        return mockMvc.perform(
            patch(
                "/api/v1/recurring-transactions/{scheduleId}",
                scheduleId
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


    private ResultActions archiveAccount(
        AuthenticatedUser user,
        String accountId
    ) throws Exception {

        Long version = jdbcTemplate.queryForObject(
            """
                SELECT version
                FROM finance.accounts
                WHERE id = ?
                  AND user_id = ?
                """,
            Long.class,
            UUID.fromString(
                accountId
            ),
            user.userId()
        );

        return mockMvc.perform(
            post(
                "/api/v1/accounts/{accountId}/archive",
                accountId
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


    @SuppressWarnings("unchecked")
    private String resultField(
        MvcResult result,
        String field
    ) throws Exception {

        Map<String, Object> root = jsonParser.parseMap(
            result
                .getResponse()
                .getContentAsString()
        );

        Map<String, Object> body = (Map<String, Object>)
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
