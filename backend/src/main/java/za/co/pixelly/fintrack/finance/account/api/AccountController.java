package za.co.pixelly.fintrack.finance.account.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.finance.account.application.AccountService;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;
import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Tag(
    name = "Accounts",
    description = "Manage user-owned financial accounts"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>>
    createAccount(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        CreateAccountRequest request
    ) {
        UUID userId = UUID.fromString(Objects.requireNonNull(jwt.getSubject()));

        AccountResponse account = accountService.create(userId, request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    "Account Created Successfully",
                    account
                )
            );

    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>>
    getAccounts(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(defaultValue = "ACTIVE") AccountStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Accounts retrieved successfully",
                accountService.findAccounts(userId(jwt), status)
            )
        );
    }


    @GetMapping("/{accountId}")
    public ResponseEntity<ApiResponse<AccountResponse>>
    getAccount(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID accountId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Account retrieved successfully",
                accountService.findById(userId(jwt), accountId)
            )
        );
    }


    @PatchMapping("/{accountId}")
    public ResponseEntity<ApiResponse<AccountResponse>>
    updateAccount(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID accountId,
        @Valid
        @RequestBody
        UpdateAccountRequest request
    ) {
        AccountResponse result =
            accountService.update(
                userId(jwt),
                accountId,
                request
            );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Account updated successfully",
                result
            )
        );
    }


    @PostMapping("/{accountId}/archive")
    public ResponseEntity<ApiResponse<AccountResponse>>
    archiveAccount(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID accountId,
        @Valid
        @RequestBody
        ArchiveAccountRequest request
    ) {
        AccountResponse result =
            accountService.archive(
                userId(jwt),
                accountId,
                request
            );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Account archived successfully",
                result
            )
        );
    }


    private UUID userId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}
