package za.co.pixelly.fintrack.finance.transfer.api;

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
import za.co.pixelly.fintrack.finance.transfer.application.TransferService;

import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;


@Tag(
    name = "Transfers",
    description = "Manage transfers between financial accounts"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransferResponse>> createTransfer(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        CreateTransferRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Transfer.CREATED,
                    transferService.create(
                        userId,
                        request
                    )
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransferResponse>>> getTransfers(
        @CurrentUserId UUID userId,
        @Valid
        @ParameterObject
        @ModelAttribute
        TransferQuery query
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transfer.FETCHED_ALL,
                transferService.findTransfers(
                    userId,
                    query
                )
            )
        );
    }


    @GetMapping("/{transferId}")
    public ResponseEntity<ApiResponse<TransferResponse>> getTransfer(
        @CurrentUserId UUID userId,
        @PathVariable UUID transferId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transfer.FETCHED,
                transferService.findById(
                    userId,
                    transferId
                )
            )
        );
    }


    @PostMapping("{transferId}/void")
    public ResponseEntity<ApiResponse<TransferResponse>> voidTransfer(
        @CurrentUserId UUID userId,
        @PathVariable UUID transferId,
        @Valid
        @RequestBody
        VoidTransferRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transfer.VOIDED,
                transferService.voidTransfer(
                    userId,
                    transferId,
                    request
                )
            )
        );
    }
}
