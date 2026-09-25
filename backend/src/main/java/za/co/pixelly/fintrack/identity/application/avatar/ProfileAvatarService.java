package za.co.pixelly.fintrack.identity.application.avatar;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileAvatarService {

    private static final int MAX_FILE_SIZE_BYTES =
        900 * 1024;

    private final ProfileImageStorage profileImageStorage;

    public ProfileAvatarUpdateResult update(
        UUID userId,
        byte[] bytes,
        String declaredContentType
    ) {
        if (
            bytes == null
                || bytes.length == 0
        ) {
            return ProfileAvatarUpdateResult.failure(
                "Choose an image to upload"
            );
        }

        if (
            bytes.length
                > MAX_FILE_SIZE_BYTES
        ) {
            return ProfileAvatarUpdateResult.failure(
                "Profile photos must be smaller than 900 KB"
            );
        }

        String detectedContentType =
            detectContentType(bytes);

        if (detectedContentType == null) {
            return ProfileAvatarUpdateResult.failure(
                "Only JPEG, PNG and WebP images are supported"
            );
        }

        String normalizedDeclaredType =
            normalizeContentType(
                declaredContentType
            );

        if (
            normalizedDeclaredType != null
                && !normalizedDeclaredType.equals(
                detectedContentType
            )
        ) {
            return ProfileAvatarUpdateResult.failure(
                "The uploaded file does not match its image type"
            );
        }

        profileImageStorage.store(
            userId,
            new StoredProfileImage(
                bytes,
                detectedContentType
            )
        );

        return ProfileAvatarUpdateResult.success();
    }

    public Optional<StoredProfileImage> get(
        UUID userId
    ) {
        return profileImageStorage.load(
            userId
        );
    }

    public void delete(
        UUID userId
    ) {
        profileImageStorage.delete(
            userId
        );
    }

    private String normalizeContentType(
        String contentType
    ) {
        if (
            contentType == null
                || contentType.isBlank()
        ) {
            return null;
        }

        String normalized =
            contentType
                .trim()
                .toLowerCase();

        if (
            normalized.equals(
                "image/jpg"
            )
        ) {
            return "image/jpeg";
        }

        return normalized;
    }

    private String detectContentType(
        byte[] bytes
    ) {
        if (isJpeg(bytes)) {
            return "image/jpeg";
        }

        if (isPng(bytes)) {
            return "image/png";
        }

        if (isWebP(bytes)) {
            return "image/webp";
        }

        return null;
    }

    private boolean isJpeg(
        byte[] bytes
    ) {
        return bytes.length >= 3
            && unsigned(bytes[0]) == 0xFF
            && unsigned(bytes[1]) == 0xD8
            && unsigned(bytes[2]) == 0xFF;
    }

    private boolean isPng(
        byte[] bytes
    ) {
        int[] signature = {
            0x89,
            0x50,
            0x4E,
            0x47,
            0x0D,
            0x0A,
            0x1A,
            0x0A
        };

        if (
            bytes.length
                < signature.length
        ) {
            return false;
        }

        for (
            int index = 0;
            index < signature.length;
            index++
        ) {
            if (
                unsigned(
                    bytes[index]
                ) != signature[index]
            ) {
                return false;
            }
        }

        return true;
    }

    private boolean isWebP(
        byte[] bytes
    ) {
        return bytes.length >= 12
            && bytes[0] == 'R'
            && bytes[1] == 'I'
            && bytes[2] == 'F'
            && bytes[3] == 'F'
            && bytes[8] == 'W'
            && bytes[9] == 'E'
            && bytes[10] == 'B'
            && bytes[11] == 'P';
    }

    private int unsigned(
        byte value
    ) {
        return value & 0xFF;
    }
}
