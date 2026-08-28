package za.co.pixelly.fintrack.identity.api;

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
import za.co.pixelly.fintrack.identity.application.UserProfileService;

import java.util.Objects;
import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Profile",
    description = "Manage the authenticated user's profile"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileService userProfileService;


    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
        @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.FETCHED,
                userProfileService.getProfile(userId(jwt))
            )
        );
    }


    @PatchMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        UpdateUserProfileRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.UPDATED,
                userProfileService.updateProfile(userId(jwt), request)
            )
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        ChangePasswordRequest request
    ) {
        userProfileService.changePassword(userId(jwt), request);

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.PASSWORD_UPDATED,
                null
            )
        );
    }


    private UUID userId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }

}
