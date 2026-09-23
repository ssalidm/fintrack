package za.co.pixelly.fintrack.identity.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.common.security.CurrentSessionId;
import za.co.pixelly.fintrack.common.security.CurrentUserId;
import za.co.pixelly.fintrack.identity.application.UserProfileService;
import za.co.pixelly.fintrack.identity.application.avatar.ProfileAvatarService;
import za.co.pixelly.fintrack.identity.application.avatar.ProfileAvatarUpdateResult;
import za.co.pixelly.fintrack.identity.application.avatar.StoredProfileImage;
import za.co.pixelly.fintrack.identity.application.emailchange.EmailChangeService;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
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
    private final ProfileAvatarService profileAvatarService;


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


    @PostMapping(
        value = "/avatar",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> updateAvatar(
        @CurrentUserId UUID userId,
        @RequestPart("file")
        MultipartFile file
    ) throws IOException {
        ProfileAvatarUpdateResult result =
            profileAvatarService.update(
                userId,
                file.getBytes(),
                file.getContentType()
            );

        if (!result.accepted()) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        HttpStatus.BAD_REQUEST,
                        result.message()
                    )
                );
        }

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                result.message()
            )
        );
    }


    @GetMapping("/avatar")
    public ResponseEntity<byte[]> getAvatar(
        @CurrentUserId UUID userId
    ) {
        Optional<StoredProfileImage> image =
            profileAvatarService.get(userId);

        if (image.isEmpty()) {
            return ResponseEntity
                .notFound()
                .build();
        }

        StoredProfileImage storedImage = image.get();

        return ResponseEntity
            .ok()
            .cacheControl(CacheControl.noStore())
            .contentType(
                MediaType.parseMediaType(storedImage.contentType())
            )
            .contentLength(storedImage.bytes().length)
            .body(storedImage.bytes());
    }


    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<Void>> deleteAvatar(
        @CurrentUserId UUID userId
    ) {
        profileAvatarService.delete(
            userId
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Profile photo removed successfully"
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


    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> getSessions(
        @CurrentUserId UUID userId,
        @CurrentSessionId UUID currentSessionId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.SESSIONS_FETCHED,
                userProfileService.getSessions(
                    userId,
                    currentSessionId
                )
            )
        );
    }


    @PostMapping("/sessions/{sessionId}/revoke")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
        @CurrentUserId UUID userId,
        @CurrentSessionId UUID currentSessionId,
        @PathVariable UUID sessionId
    ) {
        userProfileService.revokeSession(
            userId,
            currentSessionId,
            sessionId
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.SESSION_REVOKED
            )
        );
    }


    @PostMapping("/sessions/revoke-others")
    public ResponseEntity<ApiResponse<Void>> revokeOtherSessions(
        @CurrentUserId UUID userId,
        @CurrentSessionId UUID currentSessionId
    ) {
        userProfileService.revokeOtherSessions(
            userId,
            currentSessionId
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Profile.OTHER_SESSIONS_REVOKED
            )
        );
    }
}
