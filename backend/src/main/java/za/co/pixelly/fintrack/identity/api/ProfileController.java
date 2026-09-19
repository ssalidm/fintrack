package za.co.pixelly.fintrack.identity.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.identity.application.UserProfileService;
import za.co.pixelly.fintrack.identity.application.emailchange.EmailChangeService;

import java.util.UUID;

import static za.co.pixelly.fintrack.config.OpenApiConfig.BEARER_AUTH;

@Tag(
    name = "Profile",
    description = "Manage the authenticated user's profile"
)
@SecurityRequirement(name = BEARER_AUTH)
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileService userProfileService;
    private final EmailChangeService emailChangeService;


    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
        @CurrentUserId UUID userId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.FETCHED,
                userProfileService.getProfile(userId)
            )
        );
    }


    @PatchMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        UpdateUserProfileRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.UPDATED,
                userProfileService.updateProfile(userId, request)
            )
        );
    }


    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        ChangePasswordRequest request
    ) {
        userProfileService.changePassword(userId, request);

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.PASSWORD_UPDATED
            )
        );
    }


    @PostMapping("/change-email")
    public ResponseEntity<ApiResponse<Void>> changeEmail(
        @CurrentUserId UUID userId,
        @Valid
        @RequestBody
        EmailChangeRequestDto request
    ) {
        emailChangeService.initiate(
            userId,
            request.newEmail(),
            request.currentPassword(),
            request.mfaCode()
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.EMAIL_CHANGE_REQUESTED
            )
        );
    }
}
