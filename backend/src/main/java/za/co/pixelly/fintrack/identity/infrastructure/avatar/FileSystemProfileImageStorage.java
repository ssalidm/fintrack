package za.co.pixelly.fintrack.identity.infrastructure.avatar;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.identity.application.avatar.ProfileImageStorage;
import za.co.pixelly.fintrack.identity.application.avatar.StoredProfileImage;

import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class FileSystemProfileImageStorage
    implements ProfileImageStorage {

    private static final List<ImageFormat>
        SUPPORTED_FORMATS =
        List.of(
            new ImageFormat(
                ".jpg",
                "image/jpeg"
            ),
            new ImageFormat(
                ".png",
                "image/png"
            ),
            new ImageFormat(
                ".webp",
                "image/webp"
            )
        );

    private final Path storageDirectory;

    public FileSystemProfileImageStorage(
        @Value(
            "${fintrack.profile.avatar.directory:./data/profile-avatars}"
        )
        String storageDirectory
    ) {
        this.storageDirectory =
            Path.of(
                    storageDirectory
                )
                .toAbsolutePath()
                .normalize();
    }

    @PostConstruct
    void createStorageDirectory() {
        try {
            Files.createDirectories(
                storageDirectory
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                "Unable to create profile photo storage directory",
                exception
            );
        }
    }

    @Override
    public synchronized void store(
        UUID userId,
        StoredProfileImage image
    ) {
        ImageFormat format =
            formatForContentType(
                image.contentType()
            );

        Path target =
            storageDirectory.resolve(
                userId + format.extension()
            );

        try {
            Path temporary =
                Files.createTempFile(
                    storageDirectory,
                    userId + "-",
                    ".upload"
                );

            try {
                Files.write(
                    temporary,
                    image.bytes()
                );

                delete(userId);

                moveIntoPlace(
                    temporary,
                    target
                );
            } finally {
                Files.deleteIfExists(
                    temporary
                );
            }
        } catch (IOException exception) {
            throw new IllegalStateException(
                "Unable to store profile photo",
                exception
            );
        }
    }

    @Override
    public Optional<StoredProfileImage> load(
        UUID userId
    ) {
        for (
            ImageFormat format
            : SUPPORTED_FORMATS
        ) {
            Path candidate =
                storageDirectory.resolve(
                    userId
                        + format.extension()
                );

            if (
                !Files.isRegularFile(
                    candidate
                )
            ) {
                continue;
            }

            try {
                return Optional.of(
                    new StoredProfileImage(
                        Files.readAllBytes(
                            candidate
                        ),
                        format.contentType()
                    )
                );
            } catch (IOException exception) {
                throw new IllegalStateException(
                    "Unable to read profile photo",
                    exception
                );
            }
        }

        return Optional.empty();
    }

    @Override
    public synchronized void delete(
        UUID userId
    ) {
        try {
            for (
                ImageFormat format
                : SUPPORTED_FORMATS
            ) {
                Files.deleteIfExists(
                    storageDirectory.resolve(
                        userId
                            + format.extension()
                    )
                );
            }
        } catch (IOException exception) {
            throw new IllegalStateException(
                "Unable to delete profile photo",
                exception
            );
        }
    }

    private void moveIntoPlace(
        Path source,
        Path target
    ) throws IOException {
        try {
            Files.move(
                source,
                target,
                StandardCopyOption.ATOMIC_MOVE,
                StandardCopyOption.REPLACE_EXISTING
            );
        } catch (
            AtomicMoveNotSupportedException
                exception
        ) {
            Files.move(
                source,
                target,
                StandardCopyOption.REPLACE_EXISTING
            );
        }
    }

    private ImageFormat formatForContentType(
        String contentType
    ) {
        return SUPPORTED_FORMATS
            .stream()
            .filter(
                format ->
                    format.contentType()
                        .equals(
                            contentType
                        )
            )
            .findFirst()
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        "Unsupported profile photo content type"
                    )
            );
    }

    private record ImageFormat(
        String extension,
        String contentType
    ) {
    }
}
