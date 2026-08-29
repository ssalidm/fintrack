package za.co.pixelly.fintrack.identity.api.admin;

import jakarta.validation.constraints.NotNull;

public record AdminUserVersionRequest(

    @NotNull
    Long version

) {
}
