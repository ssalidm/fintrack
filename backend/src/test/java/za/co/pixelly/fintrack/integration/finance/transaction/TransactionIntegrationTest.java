package za.co.pixelly.fintrack.integration.finance.transaction;

import org.junit.jupiter.api.Test;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TransactionIntegrationTest
    extends AbstractIntegrationTest {

    private final JsonParser jsonParser =
        new JacksonJsonParser();


    @Test
    void authenticatedUserCanCreateExpenseTransaction()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-create"
            );

        String accountId =
            createAccount(
                user,
                "Main Account"
            );

        UUID groceriesCategoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        mockMvc.perform(
                post("/api/v1/transactions")
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
                          "transactionType": "EXPENSE",
                          "amount": 245.75,
                          "transactionDate": "2026-08-20",
                          "description": "Weekly groceries",
                          "merchantName": "Woolworths"
                        }
                        """.formatted(
                        accountId,
                        groceriesCategoryId
                    ))
            )
            .andExpect(
                status().isCreated()
            )
            .andExpect(
                jsonPath("$.result.id")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath(
                    "$.result.transactionType"
                )
                    .value("EXPENSE")
            )
            .andExpect(
                jsonPath("$.result.amount")
                    .value(245.75)
            )
            .andExpect(
                jsonPath("$.result.status")
                    .value("POSTED")
            );
    }


    @Test
    void categoryTypeMustMatchTransactionType()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-type"
            );

        String accountId =
            createAccount(
                user,
                "Current Account"
            );

        UUID groceriesCategoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        mockMvc.perform(
                post("/api/v1/transactions")
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
                          "transactionType": "INCOME",
                          "amount": 1000,
                          "transactionDate": "2026-08-20"
                        }
                        """.formatted(
                        accountId,
                        groceriesCategoryId
                    ))
            )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void userCannotCreateTransactionAgainstAnotherUsersAccount()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "transaction-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "transaction-attacker"
            );

        String ownerAccountId =
            createAccount(
                owner,
                "Owner Account"
            );

        UUID attackerCategory =
            categoryId(
                attacker.userId(),
                "GROCERIES"
            );

        mockMvc.perform(
                post("/api/v1/transactions")
                    .header(
                        "Authorization",
                        bearer(attacker)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "accountId": "%s",
                          "categoryId": "%s",
                          "transactionType": "EXPENSE",
                          "amount": 50,
                          "transactionDate": "2026-08-20"
                        }
                        """.formatted(
                        ownerAccountId,
                        attackerCategory
                    ))
            )
            .andExpect(
                status().isNotFound()
            );
    }


    @Test
    void transactionsArePaginatedAndOrderedNewestFirst()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-page"
            );

        String accountId =
            createAccount(
                user,
                "Pagination Account"
            );

        UUID categoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        for (int i = 1; i <= 7; i++) {

            createExpense(
                user,
                accountId,
                categoryId,
                "Expense " + i,
                LocalDate.of(
                    2026,
                    8,
                    i
                )
            )
                .andExpect(
                    status().isCreated()
                );
        }

        mockMvc.perform(
                get(
                    "/api/v1/transactions"
                        + "?page=0&size=3"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.items.length()"
                )
                    .value(3)
            )
            .andExpect(
                jsonPath("$.result.page")
                    .value(0)
            )
            .andExpect(
                jsonPath("$.result.size")
                    .value(3)
            )
            .andExpect(
                jsonPath(
                    "$.result.totalElements"
                )
                    .value(7)
            )
            .andExpect(
                jsonPath(
                    "$.result.totalPages"
                )
                    .value(3)
            )
            .andExpect(
                jsonPath(
                    "$.result.hasNext"
                )
                    .value(true)
            )
            .andExpect(
                jsonPath(
                    "$.result.items[0].description"
                )
                    .value("Expense 7")
            );
    }


    @Test
    void pageSizeAboveMaximumIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-size"
            );

        mockMvc.perform(
                get(
                    "/api/v1/transactions"
                        + "?size=101"
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
    void transactionsCanBeFilteredByTypeAndDate()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-filter"
            );

        String accountId =
            createAccount(
                user,
                "Filter Account"
            );

        UUID expenseCategory =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        UUID incomeCategory =
            categoryId(
                user.userId(),
                "SALARY"
            );

        createTransaction(
            user,
            accountId,
            expenseCategory,
            "EXPENSE",
            "Old Expense",
            "2026-07-01"
        );

        createTransaction(
            user,
            accountId,
            expenseCategory,
            "EXPENSE",
            "August Expense",
            "2026-08-10"
        );

        createTransaction(
            user,
            accountId,
            incomeCategory,
            "INCOME",
            "August Salary",
            "2026-08-15"
        );

        mockMvc.perform(
                get(
                    "/api/v1/transactions"
                        + "?type=EXPENSE"
                        + "&fromDate=2026-08-01"
                        + "&toDate=2026-08-31"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.items.length()"
                )
                    .value(1)
            )
            .andExpect(
                jsonPath(
                    "$.result.items[*].description",
                    hasItem(
                        "August Expense"
                    )
                )
            )
            .andExpect(
                jsonPath(
                    "$.result.items[*].description",
                    not(
                        hasItem(
                            "Old Expense"
                        )
                    )
                )
            )
            .andExpect(
                jsonPath(
                    "$.result.items[*].description",
                    not(
                        hasItem(
                            "August Salary"
                        )
                    )
                )
            );
    }


    @Test
    void userCannotReadAnotherUsersTransaction()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "transaction-read-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "transaction-read-attacker"
            );

        String accountId =
            createAccount(
                owner,
                "Private Account"
            );

        UUID categoryId =
            categoryId(
                owner.userId(),
                "GROCERIES"
            );

        MvcResult created =
            createExpense(
                owner,
                accountId,
                categoryId,
                "Private Transaction",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
            resultField(
                created,
                "id"
            );

        mockMvc.perform(
                get(
                    "/api/v1/transactions/{transactionId}",
                    transactionId
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
    void transactionsRequireAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/transactions")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }

    @Test
    void userCanUpdateOwnTransaction()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-update"
            );

        String accountId =
            createAccount(
                user,
                "Update Account"
            );

        UUID categoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        MvcResult created =
            createExpense(
                user,
                accountId,
                categoryId,
                "Original Description",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
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
                patch(
                    "/api/v1/transactions/{transactionId}",
                    transactionId
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
                          "amount": 350.75,
                          "transactionDate": "2026-08-21",
                          "description": "Updated groceries",
                          "merchantName": "Checkers"
                        }
                        """.formatted(
                        version
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.amount")
                    .value(350.75)
            )
            .andExpect(
                jsonPath(
                    "$.result.transactionDate"
                )
                    .value("2026-08-21")
            )
            .andExpect(
                jsonPath(
                    "$.result.description"
                )
                    .value(
                        "Updated groceries"
                    )
            )
            .andExpect(
                jsonPath(
                    "$.result.merchantName"
                )
                    .value("Checkers")
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(1)
            );
    }

    @Test
    void transactionTypeAndCategoryCanBeChangedTogether()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-change-type"
            );

        String accountId =
            createAccount(
                user,
                "Type Account"
            );

        UUID expenseCategory =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        UUID incomeCategory =
            categoryId(
                user.userId(),
                "SALARY"
            );

        MvcResult created =
            createExpense(
                user,
                accountId,
                expenseCategory,
                "Original",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                patch(
                    "/api/v1/transactions/{transactionId}",
                    transactionId
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
                          "categoryId": "%s",
                          "transactionType": "INCOME"
                        }
                        """.formatted(
                        version,
                        incomeCategory
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.transactionType"
                )
                    .value("INCOME")
            )
            .andExpect(
                jsonPath(
                    "$.result.categoryId"
                )
                    .value(
                        incomeCategory.toString()
                    )
            );
    }

    @Test
    void staleTransactionVersionIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-stale"
            );

        String accountId =
            createAccount(
                user,
                "Version Account"
            );

        UUID categoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        MvcResult created =
            createExpense(
                user,
                accountId,
                categoryId,
                "Original",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
            resultField(created, "id");

        String version =
            resultField(created, "version");


        mockMvc.perform(
                patch(
                    "/api/v1/transactions/{transactionId}",
                    transactionId
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
                          "description": "First Update"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk());


        mockMvc.perform(
                patch(
                    "/api/v1/transactions/{transactionId}",
                    transactionId
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
                          "description": "Stale Update"
                        }
                        """.formatted(version))
            )
            .andExpect(
                status().isConflict()
            );
    }

    @Test
    void userCannotUpdateAnotherUsersTransaction()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "transaction-update-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "transaction-update-attacker"
            );

        String accountId =
            createAccount(
                owner,
                "Owner Transaction Account"
            );

        UUID categoryId =
            categoryId(
                owner.userId(),
                "GROCERIES"
            );

        MvcResult created =
            createExpense(
                owner,
                accountId,
                categoryId,
                "Private",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                patch(
                    "/api/v1/transactions/{transactionId}",
                    transactionId
                )
                    .header(
                        "Authorization",
                        bearer(attacker)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %s,
                          "description": "Hacked"
                        }
                        """.formatted(version))
            )
            .andExpect(
                status().isNotFound()
            );
    }

    @Test
    void userCanVoidOwnTransaction()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-void"
            );

        String accountId =
            createAccount(
                user,
                "Void Account"
            );

        UUID categoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        MvcResult created =
            createExpense(
                user,
                accountId,
                categoryId,
                "Wrong purchase",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                post(
                    "/api/v1/transactions/{transactionId}/void",
                    transactionId
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
                          "reason": "Entered by mistake"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("VOIDED")
            )
            .andExpect(
                jsonPath("$.result.voidedAt")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.voidReason")
                    .value(
                        "Entered by mistake"
                    )
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(1)
            );
    }

    @Test
    void defaultTransactionListExcludesVoidedTransactions()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-void-list"
            );

        String accountId =
            createAccount(
                user,
                "Void List Account"
            );

        UUID categoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        MvcResult created =
            createExpense(
                user,
                accountId,
                categoryId,
                "Void Me",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                post(
                    "/api/v1/transactions/{transactionId}/void",
                    transactionId
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
                          "reason": "Test void"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk());


        mockMvc.perform(
                get("/api/v1/transactions")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.totalElements"
                )
                    .value(0)
            );


        mockMvc.perform(
                get(
                    "/api/v1/transactions"
                        + "?status=VOIDED"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.totalElements"
                )
                    .value(1)
            );
    }

    @Test
    void voidedTransactionCannotBeUpdated()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transaction-void-update"
            );

        String accountId =
            createAccount(
                user,
                "Void Update Account"
            );

        UUID categoryId =
            categoryId(
                user.userId(),
                "GROCERIES"
            );

        MvcResult created =
            createExpense(
                user,
                accountId,
                categoryId,
                "Original",
                LocalDate.of(
                    2026,
                    8,
                    20
                )
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transactionId =
            resultField(created, "id");

        String version =
            resultField(created, "version");


        MvcResult voided =
            mockMvc.perform(
                    post(
                        "/api/v1/transactions/{transactionId}/void",
                        transactionId
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
                              "reason": "Incorrect"
                            }
                            """.formatted(version))
                )
                .andExpect(status().isOk())
                .andReturn();


        String voidedVersion =
            resultField(
                voided,
                "version"
            );


        mockMvc.perform(
                patch(
                    "/api/v1/transactions/{transactionId}",
                    transactionId
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
                          "description": "Try modifying"
                        }
                        """.formatted(
                        voidedVersion
                    ))
            )
            .andExpect(
                status().isConflict()
            );
    }


    /*
     ***********************************************************************
     * HELPER METHODS
     ***********************************************************************
     */

    private String createAccount(
        AuthenticatedUser user,
        String name
    ) throws Exception {

        MvcResult result =
            mockMvc.perform(
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


    private ResultActions createExpense(
        AuthenticatedUser user,
        String accountId,
        UUID categoryId,
        String description,
        LocalDate date
    ) throws Exception {

        return createTransaction(
            user,
            accountId,
            categoryId,
            "EXPENSE",
            description,
            date.toString()
        );
    }


    private ResultActions createTransaction(
        AuthenticatedUser user,
        String accountId,
        UUID categoryId,
        String type,
        String description,
        String date
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/transactions")
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
                      "transactionType": "%s",
                      "amount": 100.00,
                      "transactionDate": "%s",
                      "description": "%s"
                    }
                    """.formatted(
                    accountId,
                    categoryId,
                    type,
                    date,
                    description
                ))
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

        return body.get(field)
            .toString();
    }


    private String bearer(
        AuthenticatedUser user
    ) {
        return "Bearer "
            + user.accessToken();
    }
}
