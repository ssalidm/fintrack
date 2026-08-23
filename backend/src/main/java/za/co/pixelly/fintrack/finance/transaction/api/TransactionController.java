package za.co.pixelly.fintrack.finance.transaction.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.transaction.application.TransactionService;

import java.util.Objects;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Transactions",
    description = "Manage and query financial transactions"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;


    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        CreateTransactionRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                HttpStatus.CREATED,
                ApiMessage.Transaction.CREATED,
                transactionService.create(userId(jwt), request)
            ));
    }


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getTransactions(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @ParameterObject
        @ModelAttribute
        TransactionQuery query
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transaction.FETCHED_ALL,
                transactionService.findTransactions(userId(jwt), query)
            )
        );
    }


    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID transactionId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transaction.FETCHED,
                transactionService.findById(userId(jwt), transactionId)
            )
        );
    }

    @PatchMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID transactionId,
        @Valid
        @RequestBody
        UpdateTransactionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transaction.UPDATED,
                transactionService.update(
                    userId(jwt),
                    transactionId,
                    request
                )
            )
        );
    }

    @PostMapping("/{transactionId}/void")
    public ResponseEntity<ApiResponse<TransactionResponse>> voidTransaction(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID transactionId,
        @Valid
        @RequestBody
        VoidTransactionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transaction.VOIDED,
                transactionService.voidTransaction(
                    userId(jwt),
                    transactionId,
                    request
                )
            )
        );
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}
