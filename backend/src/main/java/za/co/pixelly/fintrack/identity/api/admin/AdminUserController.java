package za.co.pixelly.fintrack.identity.api.admin;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.identity.application.admin.AdminUserService;

import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Admin Users",
    description = "Administrative user management"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> findUsers(
        @RequestParam(defaultValue = "0")
        @Min(value = 0, message = "page must be 0 or greater")
        int page,

        @RequestParam(defaultValue = "25")
        @Min(value = 1, message = "size must be at least 1")
        @Max(value = 100, message = "size must not exceed 100")
        int size

    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.FETCHED_ALL,
                adminUserService.findUsers(page, size)
            )
        );
    }


    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> findUserById(
        @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.FETCHED,
                adminUserService.findUserById(userId)
            )
        );
    }


    @PostMapping("/{targetUserId}/deactivate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> deactivateUser(
        @CurrentUserId UUID adminUserId,
        @PathVariable UUID targetUserId,
        @Valid
        @RequestBody
        AdminUserVersionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.DEACTIVATED,
                adminUserService.deactivateUser(
                    adminUserId,
                    targetUserId,
                    request.version()
                )
            )
        );
    }


    @PostMapping("/{targetUserId}/activate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> activateUser(
        @CurrentUserId UUID adminUserId,
        @PathVariable UUID targetUserId,
        @Valid
        @RequestBody
        AdminUserVersionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.ACTIVATED,
                adminUserService.activateUser(
                    adminUserId,
                    targetUserId,
                    request.version()
                )
            )
        );
    }


    @GetMapping("/{targetUserId}/sessions")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserSessionResponse>>> findUserSessions(
        @CurrentUserId UUID adminUserId,
        @PathVariable UUID targetUserId,

        @RequestParam(defaultValue = "0")
        @Min(value = 0, message = "page must be 0 or greater")
        int page,

        @RequestParam(defaultValue = "25")
        @Min(value = 1, message = "size must be at least 1")
        @Max(value = 100, message = "size must not exceed 100")
        int size
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.SESSIONS_FETCHED,
                adminUserService.findUserSessions(
                    adminUserId,
                    targetUserId,
                    page,
                    size
                )
            )
        );
    }


    @PostMapping("/{targetUserId}/revoke-sessions")
    public ResponseEntity<ApiResponse<Void>> revokeUserSessions(
        @CurrentUserId UUID adminUserId,
        @PathVariable UUID targetUserId
    ) {
        adminUserService.revokeUserSessions(adminUserId, targetUserId);

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.SESSIONS_REVOKED,
                null
            )
        );
    }
}
