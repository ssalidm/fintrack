package za.co.pixelly.fintrack.identity.application.avatar;

import java.util.Optional;
import java.util.UUID;

public interface ProfileImageStorage {

    void store(UUID userId, StoredProfileImage image);

    Optional<StoredProfileImage> load(UUID userId);

    void delete(UUID userId);
}
