package za.co.pixelly.fintrack.identity.application;

import za.co.pixelly.fintrack.identity.api.ChangePasswordRequest;
import za.co.pixelly.fintrack.identity.api.UpdateUserProfileRequest;
import za.co.pixelly.fintrack.identity.api.UserProfileResponse;
import za.co.pixelly.fintrack.identity.api.UserSessionResponse;

import java.util.List;
import java.util.UUID;

public interface UserProfileService {

    UserProfileResponse getProfile(UUID userid);

    UserProfileResponse updateProfile(UUID userId, UpdateUserProfileRequest request);

    void changePassword(UUID userId, ChangePasswordRequest request);

    List<UserSessionResponse> getSessions(UUID userId, UUID currentSessionId);

    void revokeSession(UUID userId, UUID currentSessionId, UUID sessionId);

    void revokeOtherSessions(UUID userId, UUID currentSessionId);
}
