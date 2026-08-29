package za.co.pixelly.fintrack.identity.api.admin;

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
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.identity.application.admin.AdminUserService;

import java.util.Objects;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Admin Users",
    description = "Administrative user management"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> findUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int size
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


    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> deactivateUser(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID userId,
        @Valid
        @RequestBody
        AdminUserVersionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.DEACTIVATED,
                adminUserService.deactivateUser(
                    userId(jwt),
                    userId,
                    request.version()
                )
            )
        );
    }


    @PostMapping("/{userId}/activate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> activateUser(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID userId,
        @Valid
        @RequestBody
        AdminUserVersionRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.ACTIVATED,
                adminUserService.activateUser(
                    userId(jwt),
                    userId,
                    request.version()
                )
            )
        );
    }


    @GetMapping("/{userId}/sessions")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserSessionResponse>>> findUserSessions(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID userId,
        @RequestParam(defaultValue = "0")
        int page,

        @RequestParam(defaultValue = "25")
        int size
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.SESSIONS_FETCHED,
                adminUserService.findUserSessions(
                    userId(jwt),
                    userId,
                    page,
                    size
                )
            )
        );
    }


    @PostMapping("/{userId}/revoke-sessions")
    public ResponseEntity<ApiResponse<Void>> revokeUserSessions(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID userId
    ) {
        adminUserService.revokeUserSessions(userId(jwt), userId);

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Admin.SESSIONS_REVOKED,
                null
            )
        );
    }


    private UUID userId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}
