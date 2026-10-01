package za.co.pixelly.fintrack.finance.recurring.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.finance.recurring.application.RecurringTransactionService;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringTransactionStatus;

import java.util.List;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Recurring Transactions",
    description = "Manage recurring income and expense schedules"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/recurring-transactions")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;


    @PostMapping
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>>
    create(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        CreateRecurringTransactionRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Recurring.CREATED,
                    recurringTransactionService.create(
                        userId,
                        request
                    )
                )
            );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringTransactionResponse>>>
    getAll(
        @CurrentUserId UUID userId,
        @RequestParam(defaultValue = "ACTIVE")
        RecurringTransactionStatus status
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Recurring.FETCHED_ALL,
                recurringTransactionService
                    .findAll(
                        userId,
                        status
                    )
            )
        );
    }


    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>>
    getById(
        @CurrentUserId UUID userId,
        @PathVariable UUID scheduleId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Recurring.FETCHED,
                recurringTransactionService
                    .findById(
                        userId,
                        scheduleId
                    )
            )
        );
    }


    @PatchMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>>
    update(
        @CurrentUserId UUID userId,
        @PathVariable UUID scheduleId,
        @Valid
        @RequestBody
        UpdateRecurringTransactionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Recurring.UPDATED,
                recurringTransactionService
                    .update(
                        userId,
                        scheduleId,
                        request
                    )
            )
        );
    }


    @PostMapping("/{scheduleId}/pause")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>>
    pause(
        @CurrentUserId UUID userId,
        @PathVariable UUID scheduleId,
        @Valid
        @RequestBody
        RecurringTransactionVersionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Recurring.PAUSED,
                recurringTransactionService
                    .pause(
                        userId,
                        scheduleId,
                        request
                    )
            )
        );
    }


    @PostMapping("/{scheduleId}/resume")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>>
    resume(
        @CurrentUserId UUID userId,
        @PathVariable UUID scheduleId,
        @Valid
        @RequestBody
        RecurringTransactionVersionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Recurring.RESUMED,
                recurringTransactionService
                    .resume(
                        userId,
                        scheduleId,
                        request
                    )
            )
        );
    }


    @PostMapping("/{scheduleId}/archive")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>>
    archive(
        @CurrentUserId UUID userId,
        @PathVariable UUID scheduleId,
        @Valid
        @RequestBody
        RecurringTransactionVersionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Recurring.ARCHIVED,
                recurringTransactionService
                    .archive(
                        userId,
                        scheduleId,
                        request
                    )
            )
        );
    }


    @PostMapping("/{scheduleId}/post-due")
    public ResponseEntity<ApiResponse<RecurringTransactionOccurrenceResponse>>
    postDue(
        @CurrentUserId UUID userId,
        @PathVariable UUID scheduleId,
        @Valid
        @RequestBody
        RecurringTransactionVersionRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResponse.success(
                    HttpStatus.CREATED,
                    ApiMessage.Recurring.OCCURRENCE_POSTED,
                    recurringTransactionService
                        .postDue(
                            userId,
                            scheduleId,
                            request
                        )
                )
            );
    }
}
