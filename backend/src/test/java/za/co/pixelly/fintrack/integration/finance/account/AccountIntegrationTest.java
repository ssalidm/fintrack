package za.co.pixelly.fintrack.integration.finance.account;

import org.junit.jupiter.api.Test;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.util.Map;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AccountIntegrationTest
    extends AbstractIntegrationTest {

    private final JsonParser jsonParser =
        new JacksonJsonParser();


    @Test
    void authenticatedUserCanCreateAccount()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-create"
            );

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
                                          "name": "Main Account",
                                          "accountType": "CURRENT",
                                          "currencyCode": "zar",
                                          "openingBalance": 1500.50,
                                          "includeInNetWorth": true
                                        }
                                        """)
            )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            )
            .andExpect(
                jsonPath("$.result.id")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.name")
                    .value("Main Account")
            )
            .andExpect(
                jsonPath("$.result.accountType")
                    .value("CURRENT")
            )
            .andExpect(
                jsonPath("$.result.currencyCode")
                    .value("ZAR")
            )
            .andExpect(
                jsonPath("$.result.openingBalance")
                    .value(1500.50)
            )
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            )
            .andExpect(
                jsonPath(
                    "$.result.includeInNetWorth"
                )
                    .value(true)
            );
    }


    @Test
    void accountDefaultsOpeningBalanceAndNetWorthFlag()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-defaults"
            );

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
                                          "name": "Cash Wallet",
                                          "accountType": "CASH",
                                          "currencyCode": "ZAR"
                                        }
                                        """)
            )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath(
                    "$.result.openingBalance"
                )
                    .value(0)
            )
            .andExpect(
                jsonPath(
                    "$.result.includeInNetWorth"
                )
                    .value(true)
            );
    }


    @Test
    void unsupportedCurrencyIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-currency"
            );

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
                                          "name": "Crypto Wallet",
                                          "accountType": "OTHER",
                                          "currencyCode": "BTC"
                                        }
                                        """)
            )
            .andExpect(
                status().isBadRequest()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(false)
            );
    }


    @Test
    void duplicateActiveAccountNameIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-duplicate"
            );

        createAccount(
            user.accessToken(),
            "Emergency Fund"
        )
            .andExpect(
                status().isCreated()
            );

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
                                          "name": "  emergency fund  ",
                                          "accountType": "SAVINGS",
                                          "currencyCode": "ZAR"
                                        }
                                        """)
            )
            .andExpect(
                status().isConflict()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(false)
            );
    }


    @Test
    void authenticatedUserCanListOwnAccounts()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-list"
            );

        createAccount(
            user.accessToken(),
            "Main Account"
        );

        createAccount(
            user.accessToken(),
            "Savings Account"
        );

        mockMvc.perform(
                get("/api/v1/accounts")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            )
            .andExpect(
                jsonPath(
                    "$.result.length()"
                )
                    .value(2)
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    hasItems(
                        "Main Account",
                        "Savings Account"
                    )
                )
            );
    }


    @Test
    void usersOnlySeeTheirOwnAccounts()
        throws Exception {

        AuthenticatedUser alice =
            createAuthenticatedUser(
                "account-alice"
            );

        AuthenticatedUser bob =
            createAuthenticatedUser(
                "account-bob"
            );

        createAccount(
            alice.accessToken(),
            "Alice Current"
        );

        createAccount(
            alice.accessToken(),
            "Alice Savings"
        );

        createAccount(
            bob.accessToken(),
            "Bob Account"
        );

        mockMvc.perform(
                get("/api/v1/accounts")
                    .header(
                        "Authorization",
                        bearer(alice)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.length()"
                )
                    .value(2)
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    hasItems(
                        "Alice Current",
                        "Alice Savings"
                    )
                )
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    not(
                        hasItem(
                            "Bob Account"
                        )
                    )
                )
            );
    }


    @Test
    void authenticatedUserCanGetOwnAccountById()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-get"
            );

        MvcResult created =
            createAccount(
                user.accessToken(),
                "My Savings"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(
                created,
                "id"
            );

        assertNotNull(accountId);

        mockMvc.perform(
                get(
                    "/api/v1/accounts/{accountId}",
                    accountId
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.id")
                    .value(accountId)
            )
            .andExpect(
                jsonPath("$.result.name")
                    .value("My Savings")
            );
    }


    @Test
    void userCannotAccessAnotherUsersAccount()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "account-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "account-attacker"
            );

        MvcResult created =
            createAccount(
                owner.accessToken(),
                "Private Account"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(
                created,
                "id"
            );

        mockMvc.perform(
                get(
                    "/api/v1/accounts/{accountId}",
                    accountId
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
    void accountsEndpointRequiresAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/accounts")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }

    @Test
    void userCanUpdateOwnAccount()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-update"
            );

        MvcResult created =
            createAccount(
                user.accessToken(),
                "Old Name"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                patch(
                    "/api/v1/accounts/{accountId}",
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
                                      "version": %s,
                                      "name": "Salary Account",
                                      "accountType": "SAVINGS",
                                      "openingBalance": 2500.00,
                                      "includeInNetWorth": false
                                    }
                                    """.formatted(
                        version
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.name")
                    .value(
                        "Salary Account"
                    )
            )
            .andExpect(
                jsonPath("$.result.accountType")
                    .value("SAVINGS")
            )
            .andExpect(
                jsonPath(
                    "$.result.openingBalance"
                ).value(2500.00)
            )
            .andExpect(
                jsonPath(
                    "$.result.includeInNetWorth"
                ).value(false)
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(1)
            );
    }

    @Test
    void updatingAccountToDuplicateNameIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-update-duplicate"
            );

        createAccount(
            user.accessToken(),
            "Main Account"
        )
            .andExpect(status().isCreated());

        MvcResult savings =
            createAccount(
                user.accessToken(),
                "Savings"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(
                savings,
                "id"
            );

        String version =
            resultField(
                savings,
                "version"
            );

        mockMvc.perform(
                patch(
                    "/api/v1/accounts/{accountId}",
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
                                      "version": %s,
                                      "name": "  main account  "
                                    }
                                    """.formatted(
                        version
                    ))
            )
            .andExpect(
                status().isConflict()
            );
    }

    @Test
    void userCannotUpdateAnotherUsersAccount()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "update-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "update-attacker"
            );

        MvcResult created =
            createAccount(
                owner.accessToken(),
                "Owner Account"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                patch(
                    "/api/v1/accounts/{accountId}",
                    accountId
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
                                      "name": "Hacked"
                                    }
                                    """.formatted(
                        version
                    ))
            )
            .andExpect(
                status().isNotFound()
            );
    }

    @Test
    void staleAccountVersionIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-stale"
            );

        MvcResult created =
            createAccount(
                user.accessToken(),
                "Versioned Account"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(created, "id");

        String originalVersion =
            resultField(created, "version");


        // First update succeeds.
        mockMvc.perform(
                patch(
                    "/api/v1/accounts/{accountId}",
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
                                      "version": %s,
                                      "name": "First Update"
                                    }
                                    """.formatted(
                        originalVersion
                    ))
            )
            .andExpect(status().isOk());


        // Client still thinks version is 0.
        mockMvc.perform(
                patch(
                    "/api/v1/accounts/{accountId}",
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
                                      "version": %s,
                                      "name": "Stale Update"
                                    }
                                    """.formatted(
                        originalVersion
                    ))
            )
            .andExpect(
                status().isConflict()
            );
    }

    @Test
    void userCanArchiveOwnAccount()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "account-archive"
            );

        MvcResult created =
            createAccount(
                user.accessToken(),
                "Old Account"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
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
            )
            .andExpect(
                jsonPath("$.result.archivedAt")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(1)
            );


        // Default listing only returns ACTIVE.
        mockMvc.perform(
                get("/api/v1/accounts")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.length()"
                ).value(0)
            );


        // Archived account is still retrievable.
        mockMvc.perform(
                get(
                    "/api/v1/accounts"
                        + "?status=ARCHIVED"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.length()"
                ).value(1)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].id"
                ).value(accountId)
            );
    }

    @Test
    void userCannotArchiveAnotherUsersAccount()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "archive-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "archive-attacker"
            );

        MvcResult created =
            createAccount(
                owner.accessToken(),
                "Private Archive"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                post(
                    "/api/v1/accounts/{accountId}/archive",
                    accountId
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
                                      "version": %s
                                    }
                                    """.formatted(
                        version
                    ))
            )
            .andExpect(
                status().isNotFound()
            );
    }

    @Test
    void accountCannotBeArchivedTwice()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "archive-twice"
            );

        MvcResult created =
            createAccount(
                user.accessToken(),
                "Archive Me"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String accountId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        MvcResult archived =
            mockMvc.perform(
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
                                              "version": %s
                                            }
                                            """.formatted(
                            version
                        ))
                )
                .andExpect(status().isOk())
                .andReturn();

        String archivedVersion =
            resultField(
                archived,
                "version"
            );

        mockMvc.perform(
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
                                      "version": %s
                                    }
                                    """.formatted(
                        archivedVersion
                    ))
            )
            .andExpect(
                status().isConflict()
            );
    }


    /*
     * -------------------------------------------------------
     * Test helpers
     * -------------------------------------------------------
     */

    private ResultActions createAccount(
        String accessToken,
        String name
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/accounts")
                .header(
                    "Authorization",
                    "Bearer " + accessToken
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

        return body.get(field).toString();
    }


    private String bearer(
        AuthenticatedUser user
    ) {
        return "Bearer " + user.accessToken();
    }
}
