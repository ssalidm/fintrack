package za.co.pixelly.fintrack.integration.reporting;

import org.junit.jupiter.api.Test;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ReportingIntegrationTest
    extends AbstractIntegrationTest {

    @Test
    void userCanReadOwnAccountBalances() throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "reporting-balances"
        );

        UUID accountId = createAccount(
            user.userId(),
            "Main Account",
            "CURRENT",
            "ZAR",
            new BigDecimal("1000.0000"),
            true
        );

        createPostedTransaction(
            user.userId(),
            accountId,
            "INCOME",
            new BigDecimal("5000.0000")
        );

        createPostedTransaction(
            user.userId(),
            accountId,
            "EXPENSE",
            new BigDecimal("2000.0000")
        );


        mockMvc.perform(
                get(
                    "/api/v1/reports/account-balances"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result[0].accountName"
                )
                    .value("Main Account")
            )
            .andExpect(
                jsonPath(
                    "$.result[0].openingBalance"
                )
                    .value(1000.0)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].transactionTotal"
                )
                    .value(3000.0)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].currentBalance"
                )
                    .value(4000.0)
            );
    }


    @Test
    void userCannotSeeAnotherUsersAccountBalances()
        throws Exception {

        AuthenticatedUser owner = createAuthenticatedUser(
            "reporting-owner"
        );

        AuthenticatedUser other = createAuthenticatedUser(
            "reporting-other"
        );

        createAccount(
            owner.userId(),
            "Private Account",
            "CURRENT",
            "ZAR",
            new BigDecimal("9000.0000"),
            true
        );


        mockMvc.perform(
                get(
                    "/api/v1/reports/account-balances"
                )
                    .header(
                        "Authorization",
                        bearer(other)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result")
                    .isEmpty()
            );
    }


    @Test
    void netWorthIsGroupedByCurrency()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "reporting-net-worth"
        );

        createAccount(
            user.userId(),
            "ZAR Account",
            "CURRENT",
            "ZAR",
            new BigDecimal("2500.0000"),
            true
        );

        createAccount(
            user.userId(),
            "USD Account",
            "SAVINGS",
            "USD",
            new BigDecimal("100.0000"),
            true
        );


        mockMvc.perform(
                get(
                    "/api/v1/reports/net-worth"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result[?(@.currencyCode == 'ZAR')].netWorth"
                )
                    .value(2500.0)
            )
            .andExpect(
                jsonPath(
                    "$.result[?(@.currencyCode == 'USD')].netWorth"
                )
                    .value(100.0)
            );
    }


    @Test
    void userCanReadMonthlyCashFlow()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "reporting-cash-flow"
            );

        UUID accountId =
            createAccount(
                user.userId(),
                "Cash Flow Account",
                "CURRENT",
                "ZAR",
                new BigDecimal("0.0000"),
                true
            );

        createPostedTransaction(
            user.userId(),
            accountId,
            "INCOME",
            new BigDecimal("10000.0000")
        );

        createPostedTransaction(
            user.userId(),
            accountId,
            "EXPENSE",
            new BigDecimal("3500.0000")
        );


        LocalDate month =
            LocalDate.now()
                .withDayOfMonth(1);


        mockMvc.perform(
                get(
                    "/api/v1/reports/cash-flow"
                )
                    .param(
                        "fromMonth",
                        month.toString()
                    )
                    .param(
                        "toMonth",
                        month.toString()
                    )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result[0].currencyCode"
                )
                    .value("ZAR")
            )
            .andExpect(
                jsonPath(
                    "$.result[0].monthStart"
                )
                    .value(
                        month.toString()
                    )
            )
            .andExpect(
                jsonPath(
                    "$.result[0].totalIncome"
                )
                    .value(10000.0)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].totalExpenses"
                )
                    .value(3500.0)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].netCashFlow"
                )
                    .value(6500.0)
            );
    }


    @Test
    void cashFlowDoesNotExposeAnotherUsersData()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "cash-flow-owner"
            );

        AuthenticatedUser other =
            createAuthenticatedUser(
                "cash-flow-other"
            );

        UUID accountId =
            createAccount(
                owner.userId(),
                "Private Cash Flow Account",
                "CURRENT",
                "ZAR",
                BigDecimal.ZERO,
                true
            );

        createPostedTransaction(
            owner.userId(),
            accountId,
            "INCOME",
            new BigDecimal("12000.0000")
        );


        LocalDate month =
            LocalDate.now()
                .withDayOfMonth(1);


        mockMvc.perform(
                get(
                    "/api/v1/reports/cash-flow"
                )
                    .param(
                        "fromMonth",
                        month.toString()
                    )
                    .param(
                        "toMonth",
                        month.toString()
                    )
                    .header(
                        "Authorization",
                        bearer(other)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result")
                    .isEmpty()
            );
    }


    @Test
    void userCanReadMonthlyCategorySpending()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "reporting-category"
            );

        UUID accountId =
            createAccount(
                user.userId(),
                "Category Account",
                "CURRENT",
                "ZAR",
                BigDecimal.ZERO,
                true
            );

        UUID expenseCategoryId =
            findCategory(
                user.userId(),
                "EXPENSE"
            );

        String categoryName =
            jdbcTemplate.queryForObject(
                """
                    SELECT name
                    FROM finance.categories
                    WHERE id = ?
                    """,
                String.class,
                expenseCategoryId
            );


        LocalDate today =
            LocalDate.now();

        LocalDate month =
            today.withDayOfMonth(1);


        createPostedTransaction(
            user.userId(),
            accountId,
            expenseCategoryId,
            "EXPENSE",
            new BigDecimal("800.0000"),
            today
        );

        createPostedTransaction(
            user.userId(),
            accountId,
            expenseCategoryId,
            "EXPENSE",
            new BigDecimal("450.0000"),
            today
        );


        mockMvc.perform(
                get(
                    "/api/v1/reports/category-spending"
                )
                    .param(
                        "fromMonth",
                        month.toString()
                    )
                    .param(
                        "toMonth",
                        month.toString()
                    )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result[0].currencyCode"
                )
                    .value("ZAR")
            )
            .andExpect(
                jsonPath(
                    "$.result[0].categoryId"
                )
                    .value(
                        expenseCategoryId.toString()
                    )
            )
            .andExpect(
                jsonPath(
                    "$.result[0].categoryName"
                )
                    .value(categoryName)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].spentAmount"
                )
                    .value(1250.0)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].transactionCount"
                )
                    .value(2)
            );
    }


    @Test
    void cashFlowRejectsInvalidMonthRange()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "reporting-range"
            );


        mockMvc.perform(
                get(
                    "/api/v1/reports/cash-flow"
                )
                    .param(
                        "fromMonth",
                        "2026-08-01"
                    )
                    .param(
                        "toMonth",
                        "2026-07-01"
                    )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void reportingRejectsDatesThatAreNotMonthStart()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "reporting-month-start"
            );


        mockMvc.perform(
                get(
                    "/api/v1/reports/cash-flow"
                )
                    .param(
                        "fromMonth",
                        "2026-08-15"
                    )
                    .param(
                        "toMonth",
                        "2026-08-15"
                    )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void userCanReadRecurringDueReport()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "reporting-recurring-due"
            );


        mockMvc.perform(
                get(
                    "/api/v1/reports/recurring-due"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result")
                    .isArray()
            );
    }


    @Test
    void userCanReadDashboardSummary()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "reporting-dashboard"
            );


        mockMvc.perform(
                get(
                    "/api/v1/dashboard/summary"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.asOfDate"
                )
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath(
                    "$.result.totalAccountCount"
                )
                    .value(0)
            )
            .andExpect(
                jsonPath(
                    "$.result.activeAccountCount"
                )
                    .value(0)
            )
            .andExpect(
                jsonPath(
                    "$.result.archivedAccountCount"
                )
                    .value(0)
            )
            .andExpect(
                jsonPath(
                    "$.result.netWorthByCurrency"
                )
                    .isArray()
            )
            .andExpect(
                jsonPath(
                    "$.result.currentMonthCashFlow"
                )
                    .isArray()
            )
            .andExpect(
                jsonPath(
                    "$.result.dueRecurringTransactionCount"
                )
                    .value(0)
            )
            .andExpect(
                jsonPath(
                    "$.result.dueRecurringTransactions"
                )
                    .isArray()
            );
    }


    @Test
    void reportingRequiresAuthentication()
        throws Exception {

        mockMvc.perform(
                get(
                    "/api/v1/reports/recurring-due"
                )
            )
            .andExpect(
                status().isUnauthorized()
            );


        mockMvc.perform(
                get(
                    "/api/v1/dashboard/summary"
                )
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    private UUID findCategory(
        UUID userId,
        String type
    ) {

        UUID categoryId =
            jdbcTemplate.queryForObject(
                """
                    SELECT id
                    FROM finance.categories
                    WHERE user_id = ?
                      AND category_type = ?
                      AND status = 'ACTIVE'
                    ORDER BY name
                    LIMIT 1
                    """,
                UUID.class,
                userId,
                type
            );

        if (categoryId == null) {
            throw new IllegalStateException(
                "No active %s category found"
                    .formatted(type)
            );
        }

        return categoryId;
    }


    private String bearer(
        AuthenticatedUser user
    ) {
        return "Bearer "
            + user.accessToken();
    }


    private UUID createAccount(
        UUID userId,
        String name,
        String accountType,
        String currencyCode,
        BigDecimal openingBalance,
        boolean includeInNetWorth
    ) {

        return jdbcTemplate.queryForObject(
            """
                INSERT INTO finance.accounts (
                    user_id,
                    name,
                    account_type,
                    currency_code,
                    opening_balance,
                    include_in_net_worth
                )
                VALUES (?, ?, ?, ?, ?, ?)
                RETURNING id
                """,
            UUID.class,
            userId,
            name,
            accountType,
            currencyCode,
            openingBalance,
            includeInNetWorth
        );
    }


    private UUID createPostedTransaction(
        UUID userId,
        UUID accountId,
        String type,
        BigDecimal amount
    ) {

        UUID categoryId =
            jdbcTemplate.queryForObject(
                """
                    SELECT id
                    FROM finance.categories
                    WHERE user_id = ?
                      AND category_type = ?
                      AND status = 'ACTIVE'
                    ORDER BY created_at
                    LIMIT 1
                    """,
                UUID.class,
                userId,
                type
            );

        if (categoryId == null) {
            throw new IllegalStateException(
                "No active %s category found for user %s"
                    .formatted(
                        type,
                        userId
                    )
            );
        }

        return jdbcTemplate.queryForObject(
            """
                INSERT INTO finance.transactions (
                    user_id,
                    account_id,
                    category_id,
                    transaction_type,
                    amount,
                    transaction_date,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, 'POSTED')
                RETURNING id
                """,
            UUID.class,
            userId,
            accountId,
            categoryId,
            type,
            amount,
            LocalDate.now()
        );
    }

    private UUID createPostedTransaction(
        UUID userId,
        UUID accountId,
        UUID categoryId,
        String type,
        BigDecimal amount,
        LocalDate transactionDate
    ) {

        return jdbcTemplate.queryForObject(
            """
                INSERT INTO finance.transactions (
                    user_id,
                    account_id,
                    category_id,
                    transaction_type,
                    amount,
                    transaction_date,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, 'POSTED')
                RETURNING id
                """,
            UUID.class,
            userId,
            accountId,
            categoryId,
            type,
            amount,
            transactionDate
        );
    }
}
