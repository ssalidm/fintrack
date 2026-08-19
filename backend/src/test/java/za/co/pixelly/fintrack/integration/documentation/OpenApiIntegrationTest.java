package za.co.pixelly.fintrack.integration.documentation;

import org.junit.jupiter.api.Test;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OpenApiIntegrationTest
    extends AbstractIntegrationTest {

    @Test
    void openApiSpecificationIsPubliclyAccessible()
        throws Exception {

        mockMvc.perform(
                get("/v3/api-docs")
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.openapi")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.info.title")
                    .value("FinTrack API")
            )
            .andExpect(
                jsonPath(
                    "$.components.securitySchemes.bearerAuth"
                )
                    .exists()
            );
    }


    @Test
    void accountsAreIncludedInOpenApiSpecification()
        throws Exception {

        mockMvc.perform(
                get("/v3/api-docs")
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.paths['/api/v1/accounts']"
                )
                    .exists()
            );
    }


    @Test
    void categoriesAreIncludedInOpenApiSpecification()
        throws Exception {

        mockMvc.perform(
                get("/v3/api-docs")
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.paths['/api/v1/categories']"
                )
                    .exists()
            );
    }


    @Test
    void protectedApiStillRequiresAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/accounts")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }
}
