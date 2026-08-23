package za.co.pixelly.fintrack.finance.transfer.api;

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
import za.co.pixelly.fintrack.finance.transfer.application.TransferService;

import java.util.Objects;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;


@Tag(
    name = "Transfers",
    description = "Manage transfers between financial accounts"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransferResponse>> createTransfer(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        CreateTransferRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Transfer.CREATED,
                    transferService.create(
                        userId(jwt),
                        request
                    )
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransferResponse>>> getTransfers(
        @AuthenticationPrincipal Jwt jwt,
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
                    userId(jwt),
                    query
                )
            )
        );
    }


    @GetMapping("/{transferId}")
    public ResponseEntity<ApiResponse<TransferResponse>> getTransfer(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID transferId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Transfer.FETCHED,
                transferService.findById(
                    userId(jwt),
                    transferId
                )
            )
        );
    }


    @PostMapping("{transferId}/void")
    public ResponseEntity<ApiResponse<TransferResponse>> voidTransfer(
        @AuthenticationPrincipal Jwt jwt,
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
                    userId(jwt),
                    transferId,
                    request
                )
            )
        );
    }


    private UUID userId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}
