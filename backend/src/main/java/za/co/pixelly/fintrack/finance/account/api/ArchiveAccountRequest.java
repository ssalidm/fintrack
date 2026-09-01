package za.co.pixelly.fintrack.finance.account.api;

import jakarta.validation.constraints.NotNull;

public record ArchiveAccountRequest(
    @NotNull
    Long version
) {
}
