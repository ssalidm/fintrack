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
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
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
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>>
    createAccount(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        CreateAccountRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Account.CREATED,
                    accountService.create(userId, request)
                )
            );

    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>>
    getAccounts(
        @CurrentUserId UUID userId,
        @RequestParam(defaultValue = "ACTIVE") AccountStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Account.FETCHED_ALL,
                accountService.findAccounts(userId, status)
            )
        );
    }


    @GetMapping("/{accountId}")
    public ResponseEntity<ApiResponse<AccountResponse>>
    getAccount(
        @CurrentUserId UUID userId,
        @PathVariable UUID accountId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Account.FETCHED,
                accountService.findById(userId, accountId)
            )
        );
    }


    @PatchMapping("/{accountId}")
    public ResponseEntity<ApiResponse<AccountResponse>>
    updateAccount(
        @CurrentUserId UUID userId,
        @PathVariable UUID accountId,
        @Valid
        @RequestBody
        UpdateAccountRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Account.UPDATED,
                accountService.update(
                    userId,
                    accountId,
                    request
                )
            )
        );
    }


    @PostMapping("/{accountId}/archive")
    public ResponseEntity<ApiResponse<AccountResponse>>
    archiveAccount(
        @CurrentUserId UUID userId,
        @PathVariable UUID accountId,
        @Valid
        @RequestBody
        ArchiveAccountRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Account.ARCHIVED,
                accountService.archive(
                    userId,
                    accountId,
                    request
                )
            )
        );
    }
}
