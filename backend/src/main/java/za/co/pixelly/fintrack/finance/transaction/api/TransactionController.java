package za.co.pixelly.fintrack.finance.transaction.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.finance.transaction.application.TransactionService;

import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;


@Tag(
    name = "Transactions",
    description = "Manage and query financial transactions"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;


    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        CreateTransactionRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                HttpStatus.CREATED,
                ApiMessage.Transaction.CREATED,
                transactionService.create(userId, request)
            ));
    }


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getTransactions(
        @CurrentUserId UUID userId,
        @Valid
        @ParameterObject
        @ModelAttribute
        TransactionQuery query
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transaction.FETCHED_ALL,
                transactionService.findTransactions(userId, query)
            )
        );
    }


    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
        @CurrentUserId UUID userId,
        @PathVariable UUID transactionId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transaction.FETCHED,
                transactionService.findById(userId, transactionId)
            )
        );
    }


    @PatchMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
        @CurrentUserId UUID userId,
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
                    userId,
                    transactionId,
                    request
                )
            )
        );
    }


    @PostMapping("/{transactionId}/void")
    public ResponseEntity<ApiResponse<TransactionResponse>> voidTransaction(
        @CurrentUserId UUID userId,
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
                    userId,
                    transactionId,
                    request
                )
            )
        );
    }
}
