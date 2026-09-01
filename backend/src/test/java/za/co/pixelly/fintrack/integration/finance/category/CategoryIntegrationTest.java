package za.co.pixelly.fintrack.integration.finance.category;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.finance.category.application.exceptions.CategoryNotFoundException;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryRepository;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.util.Map;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CategoryIntegrationTest
    extends AbstractIntegrationTest {

    private final JsonParser jsonParser =
        new JacksonJsonParser();

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void verifiedUserReceivesDefaultCategories()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-defaults"
            );

        mockMvc.perform(
                get("/api/v1/categories")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(
                status().isOk()
            )
            .andExpect(
                jsonPath(
                    "$.result.length()"
                )
                    .value(16)
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    hasItems(
                        "Salary",
                        "Freelance",
                        "Groceries",
                        "Rent",
                        "Transport"
                    )
                )
            )
            .andExpect(
                jsonPath(
                    "$.result[?(@.name == 'Salary')].templateCode",
                    hasItem("SALARY")
                )
            );
    }

    @Test
    void authenticatedUserCanCreateCategory()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-create"
            );

        mockMvc.perform(
                post("/api/v1/categories")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "name": "Custom Category",
                          "categoryType": "EXPENSE",
                          "displayOrder": 1
                        }
                        """)
            )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.result.id")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.name")
                    .value("Custom Category")
            )
            .andExpect(
                jsonPath("$.result.categoryType")
                    .value("EXPENSE")
            )
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            )
            .andExpect(
                jsonPath("$.result.displayOrder")
                    .value(1)
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(0)
            );
    }


    @Test
    void displayOrderDefaultsToZero()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-default"
            );

        createCategory(
            user.accessToken(),
            "Custom Category",
            "EXPENSE"
        )
            .andExpect(status().isCreated())
            .andExpect(
                jsonPath("$.result.displayOrder")
                    .value(0)
            );
    }


    @Test
    void duplicateNormalizedNameWithinSameTypeIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-duplicate"
            );

        createCategory(
            user.accessToken(),
            "Custom Category",
            "EXPENSE"
        )
            .andExpect(status().isCreated());

        mockMvc.perform(
                post("/api/v1/categories")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "name": "  Custom Category  ",
                          "categoryType": "EXPENSE"
                        }
                        """)
            )
            .andExpect(status().isConflict());
    }


    @Test
    void sameNameCanExistAcrossDifferentTypes()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-types"
            );

        createCategory(
            user.accessToken(),
            "Other",
            "EXPENSE"
        )
            .andExpect(status().isCreated());

        createCategory(
            user.accessToken(),
            "Other",
            "INCOME"
        )
            .andExpect(status().isCreated());
    }


    @Test
    void usersOnlySeeTheirOwnCategories()
        throws Exception {

        AuthenticatedUser alice =
            createAuthenticatedUser(
                "category-alice"
            );

        AuthenticatedUser bob =
            createAuthenticatedUser(
                "category-bob"
            );

        createCategory(
            alice.accessToken(),
            "Custom Category 1",
            "EXPENSE"
        );

        createCategory(
            alice.accessToken(),
            "Custom Category 2",
            "INCOME"
        );

        createCategory(
            bob.accessToken(),
            "Bob Private",
            "EXPENSE"
        );

        mockMvc.perform(
                get("/api/v1/categories")
                    .header(
                        "Authorization",
                        bearer(alice)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.length()")
                    .value(18)
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    hasItems(
                        "Custom Category 1",
                        "Custom Category 2"
                    )
                )
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    not(
                        hasItem(
                            "Bob Private"
                        )
                    )
                )
            );
    }


    @Test
    void categoriesCanBeFilteredByType()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-filter"
            );

        createCategory(
            user.accessToken(),
            "Custom Category 1",
            "INCOME"
        );

        createCategory(
            user.accessToken(),
            "Custom Category 2",
            "EXPENSE"
        );

        createCategory(
            user.accessToken(),
            "Custom Category 3",
            "EXPENSE"
        );

        mockMvc.perform(
                get(
                    "/api/v1/categories"
                        + "?type=EXPENSE"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.length()")
                    .value(13)
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    hasItems(
                        "Custom Category 2",
                        "Custom Category 3"
                    )
                )
            )
            .andExpect(
                jsonPath(
                    "$.result[*].name",
                    not(
                        hasItem("Custom Category 1")
                    )
                )
            );
    }


    @Test
    void userCannotAccessAnotherUsersCategory()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "category-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "category-attacker"
            );

        MvcResult created =
            createCategory(
                owner.accessToken(),
                "Private Category",
                "EXPENSE"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String categoryId =
            resultField(
                created,
                "id"
            );

        mockMvc.perform(
                get(
                    "/api/v1/categories/{categoryId}",
                    categoryId
                )
                    .header(
                        "Authorization",
                        bearer(attacker)
                    )
            )
            .andExpect(status().isNotFound());
    }


    @Test
    void userCanUpdateOwnCategory()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-update"
            );

        MvcResult created =
            createCategory(
                user.accessToken(),
                "Food",
                "EXPENSE"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String categoryId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                patch(
                    "/api/v1/categories/{categoryId}",
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
                          "version": %s,
                          "name": "Food Updated",
                          "displayOrder": 5
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.name")
                    .value("Food Updated")
            )
            .andExpect(
                jsonPath("$.result.displayOrder")
                    .value(5)
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(1)
            );
    }

    @Test
    void templateCategoryTypeCannotBeUpdated()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-update"
            );

        Category templateCategory = categoryRepository
            .findByTemplateCodeAndUserId(
                "SALARY",
                user.userId()
            ).orElseThrow(CategoryNotFoundException::new);

        String categoryId = templateCategory.getId().toString();

        Long version = templateCategory.getVersion();

        mockMvc.perform(
                patch(
                    "/api/v1/categories/{categoryId}",
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
                          "version": %s,
                          "categoryType": "EXPENSE"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isConflict());
    }


    @Test
    void staleCategoryVersionIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-stale"
            );

        MvcResult created =
            createCategory(
                user.accessToken(),
                "Original",
                "EXPENSE"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String categoryId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                patch(
                    "/api/v1/categories/{categoryId}",
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
                          "version": %s,
                          "name": "First Update"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk());


        mockMvc.perform(
                patch(
                    "/api/v1/categories/{categoryId}",
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
                          "version": %s,
                          "name": "Stale Update"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isConflict());
    }


    @Test
    void userCanArchiveOwnCategory()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "category-archive"
            );

        MvcResult created =
            createCategory(
                user.accessToken(),
                "Old Expense",
                "EXPENSE"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String categoryId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
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
                          "version": %s
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("ARCHIVED")
            )
            .andExpect(
                jsonPath("$.result.archivedAt")
                    .isNotEmpty()
            );


        mockMvc.perform(
                get("/api/v1/categories")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.length()")
                    .value(16)
            );


        mockMvc.perform(
                get(
                    "/api/v1/categories"
                        + "?status=ARCHIVED"
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.length()")
                    .value(1)
            )
            .andExpect(
                jsonPath(
                    "$.result[0].id"
                ).value(categoryId)
            );
    }


    @Test
    void userCannotArchiveAnotherUsersCategory()
        throws Exception {

        AuthenticatedUser owner =
            createAuthenticatedUser(
                "category-archive-owner"
            );

        AuthenticatedUser attacker =
            createAuthenticatedUser(
                "category-archive-attacker"
            );

        MvcResult created =
            createCategory(
                owner.accessToken(),
                "Owner Category",
                "EXPENSE"
            )
                .andExpect(
                    status().isCreated()
                )
                .andReturn();

        String categoryId =
            resultField(created, "id");

        String version =
            resultField(created, "version");

        mockMvc.perform(
                post(
                    "/api/v1/categories/{categoryId}/archive",
                    categoryId
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
                        """.formatted(version))
            )
            .andExpect(status().isNotFound());
    }


    @Test
    void categoriesRequireAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/categories")
            )
            .andExpect(status().isUnauthorized());
    }


    /*
     * Helpers
     */

    private ResultActions createCategory(
        String accessToken,
        String name,
        String type
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/categories")
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
                      "categoryType": "%s"
                    }
                    """.formatted(
                    name,
                    type
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
