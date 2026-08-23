package za.co.pixelly.fintrack.integration.finance.transfer;

import org.junit.jupiter.api.Test;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TransferIntegrationTest
    extends AbstractIntegrationTest {

    private final JsonParser jsonParser =
        new JacksonJsonParser();


    @Test
    void userCanCreateTransfer()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-create"
            );

        String sourceId =
            createAccount(
                user,
                "Transfer Source",
                "ZAR"
            );

        String destinationId =
            createAccount(
                user,
                "Transfer Destination",
                "ZAR"
            );

        MvcResult result =
            createTransfer(
                user,
                sourceId,
                destinationId,
                "500.00"
            )
                .andExpect(
                    status().isCreated()
                )
                .andExpect(
                    jsonPath("$.result.id")
                        .isNotEmpty()
                )
                .andExpect(
                    jsonPath("$.result.status")
                        .value("POSTED")
                )
                .andExpect(
                    jsonPath("$.result.amount")
                        .value(500.00)
                )
                .andReturn();

        UUID transferId =
            UUID.fromString(
                resultField(
                    result,
                    "id"
                )
            );

        Integer ledgerCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM finance.transactions
                    WHERE transfer_id = ?
                    """,
                Integer.class,
                transferId
            );

        assertEquals(
            2,
            ledgerCount
        );

        Integer transferOutCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM finance.transactions
                    WHERE transfer_id = ?
                      AND transaction_type = 'TRANSFER_OUT'
                      AND account_id = ?
                      AND category_id IS NULL
                    """,
                Integer.class,
                transferId,
                UUID.fromString(sourceId)
            );

        assertEquals(
            1,
            transferOutCount
        );

        Integer transferInCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM finance.transactions
                    WHERE transfer_id = ?
                      AND transaction_type = 'TRANSFER_IN'
                      AND account_id = ?
                      AND category_id IS NULL
                    """,
                Integer.class,
                transferId,
                UUID.fromString(destinationId)
            );

        assertEquals(
            1,
            transferInCount
        );
    }


    @Test
    void sourceAndDestinationMustBeDifferent()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-same"
            );

        String accountId =
            createAccount(
                user,
                "Same Account",
                "ZAR"
            );

        createTransfer(
            user,
            accountId,
            accountId,
            "100.00"
        )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void userCannotTransferFromAnotherUsersAccount()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "transfer-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "transfer-attacker"
            );

        String ownerAccount =
            createAccount(
                owner,
                "Owner Source",
                "ZAR"
            );

        String attackerAccount =
            createAccount(
                attacker,
                "Attacker Destination",
                "ZAR"
            );

        createTransfer(
            attacker,
            ownerAccount,
            attackerAccount,
            "100.00"
        )
            .andExpect(
                status().isNotFound()
            );
    }


    @Test
    void crossCurrencyTransferIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-currency"
            );

        String randAccount =
            createAccount(
                user,
                "Rand Account",
                "ZAR"
            );

        String dollarAccount =
            createAccount(
                user,
                "Dollar Account",
                "USD"
            );

        createTransfer(
            user,
            randAccount,
            dollarAccount,
            "100.00"
        )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void transfersArePaginated()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-page"
            );

        String source =
            createAccount(
                user,
                "Pagination Source",
                "ZAR"
            );

        String destination =
            createAccount(
                user,
                "Pagination Destination",
                "ZAR"
            );

        for (int i = 0; i < 5; i++) {

            createTransfer(
                user,
                source,
                destination,
                String.valueOf(
                    100 + i
                )
            )
                .andExpect(
                    status().isCreated()
                );
        }


        mockMvc.perform(
                get(
                    "/api/v1/transfers"
                        + "?page=0&size=2"
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
                ).value(2)
            )
            .andExpect(
                jsonPath(
                    "$.result.totalElements"
                ).value(5)
            )
            .andExpect(
                jsonPath(
                    "$.result.totalPages"
                ).value(3)
            )
            .andExpect(
                jsonPath(
                    "$.result.hasNext"
                ).value(true)
            );
    }


    @Test
    void userCannotReadAnotherUsersTransfer()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "transfer-read-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "transfer-read-attacker"
            );

        String source =
            createAccount(
                owner,
                "Private Source",
                "ZAR"
            );

        String destination =
            createAccount(
                owner,
                "Private Destination",
                "ZAR"
            );

        MvcResult created =
            createTransfer(
                owner,
                source,
                destination,
                "200.00"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transferId =
            resultField(
                created,
                "id"
            );

        mockMvc.perform(
                get(
                    "/api/v1/transfers/{transferId}",
                    transferId
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
    void userCanVoidTransferAndBothLedgerEntries()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-void"
            );

        String source =
            createAccount(
                user,
                "Void Source",
                "ZAR"
            );

        String destination =
            createAccount(
                user,
                "Void Destination",
                "ZAR"
            );

        MvcResult created =
            createTransfer(
                user,
                source,
                destination,
                "300.00"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transferId =
            resultField(
                created,
                "id"
            );


        mockMvc.perform(
                post(
                    "/api/v1/transfers/{transferId}/void",
                    transferId
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
                          "reason": "Transfer entered incorrectly"
                        }
                        """)
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
                        "Transfer entered incorrectly"
                    )
            );


        Integer voidedLedgerEntries =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM finance.transactions
                    WHERE transfer_id = ?
                      AND status = 'VOIDED'
                    """,
                Integer.class,
                UUID.fromString(
                    transferId
                )
            );

        assertEquals(
            2,
            voidedLedgerEntries
        );
    }


    @Test
    void transferCannotBeVoidedTwice()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-double-void"
            );

        String source =
            createAccount(
                user,
                "Double Void Source",
                "ZAR"
            );

        String destination =
            createAccount(
                user,
                "Double Void Destination",
                "ZAR"
            );

        MvcResult created =
            createTransfer(
                user,
                source,
                destination,
                "250.00"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String transferId =
            resultField(
                created,
                "id"
            );

        voidTransfer(
            user,
            transferId
        )
            .andExpect(
                status().isOk()
            );

        voidTransfer(
            user,
            transferId
        )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void transferTransactionCannotBeUpdatedDirectly()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-leg-update"
            );

        String sourceAccount =
            createAccount(
                user,
                "Leg Source",
                "ZAR"
            );

        String destinationAccount =
            createAccount(
                user,
                "Leg Destination",
                "ZAR"
            );

        MvcResult transfer =
            mockMvc.perform(
                    post("/api/v1/transfers")
                        .header(
                            "Authorization",
                            bearer(user)
                        )
                        .contentType(
                            "application/json"
                        )
                        .content("""
                            {
                              "sourceAccountId": "%s",
                              "destinationAccountId": "%s",
                              "amount": 100.00,
                              "transactionDate": "2026-08-23",
                              "description": "Protected transfer"
                            }
                            """.formatted(
                            sourceAccount,
                            destinationAccount
                        ))
                )
                .andExpect(status().isCreated())
                .andReturn();

        String transferId =
            resultField(
                transfer,
                "id"
            );

        UUID transactionId =
            jdbcTemplate.queryForObject(
                """
                    SELECT id
                    FROM finance.transactions
                    WHERE transfer_id = ?
                      AND transaction_type = 'TRANSFER_OUT'
                    """,
                UUID.class,
                UUID.fromString(transferId)
            );

        Long version =
            jdbcTemplate.queryForObject(
                """
                    SELECT version
                    FROM finance.transactions
                    WHERE id = ?
                    """,
                Long.class,
                transactionId
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
                          "version": %d,
                          "description": "Tampered"
                        }
                        """.formatted(version))
            )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void transferTransactionCannotBeVoidedDirectly()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "transfer-leg-void"
            );

        String sourceAccount =
            createAccount(
                user,
                "Void Leg Source",
                "ZAR"
            );

        String destinationAccount =
            createAccount(
                user,
                "Void Leg Destination",
                "ZAR"
            );

        MvcResult transfer =
            mockMvc.perform(
                    post("/api/v1/transfers")
                        .header(
                            "Authorization",
                            bearer(user)
                        )
                        .contentType(
                            "application/json"
                        )
                        .content("""
                            {
                              "sourceAccountId": "%s",
                              "destinationAccountId": "%s",
                              "amount": 100.00,
                              "transactionDate": "2026-08-23"
                            }
                            """.formatted(
                            sourceAccount,
                            destinationAccount
                        ))
                )
                .andExpect(status().isCreated())
                .andReturn();

        String transferId =
            resultField(
                transfer,
                "id"
            );

        UUID transactionId =
            jdbcTemplate.queryForObject(
                """
                    SELECT id
                    FROM finance.transactions
                    WHERE transfer_id = ?
                      AND transaction_type = 'TRANSFER_OUT'
                    """,
                UUID.class,
                UUID.fromString(transferId)
            );

        Long version =
            jdbcTemplate.queryForObject(
                """
                    SELECT version
                    FROM finance.transactions
                    WHERE id = ?
                    """,
                Long.class,
                transactionId
            );

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
                          "version": %d,
                          "reason": "Trying to bypass transfer API"
                        }
                        """.formatted(version))
            )
            .andExpect(
                status().isConflict()
            );
    }

    @Test
    void transfersRequireAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/transfers")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    /*
     * Helpers
     */

    private String createAccount(
        AuthenticatedUser user,
        String name,
        String currency
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
                              "currencyCode": "%s",
                              "openingBalance": 0,
                              "includeInNetWorth": true
                            }
                            """.formatted(
                            name,
                            currency
                        ))
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


    private org.springframework.test.web.servlet.ResultActions
    createTransfer(
        AuthenticatedUser user,
        String sourceAccountId,
        String destinationAccountId,
        String amount
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/transfers")
                .header(
                    "Authorization",
                    bearer(user)
                )
                .contentType(
                    "application/json"
                )
                .content("""
                    {
                      "sourceAccountId": "%s",
                      "destinationAccountId": "%s",
                      "amount": %s,
                      "transactionDate": "2026-08-20",
                      "description": "Integration transfer"
                    }
                    """.formatted(
                    sourceAccountId,
                    destinationAccountId,
                    amount
                ))
        );
    }


    private ResultActions voidTransfer(
        AuthenticatedUser user,
        String transferId
    ) throws Exception {

        return mockMvc.perform(
            post(
                "/api/v1/transfers/{transferId}/void",
                transferId
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
                      "reason": "Test void"
                    }
                    """)
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


    private String bearer(
        AuthenticatedUser user
    ) {
        return "Bearer "
            + user.accessToken();
    }
}
