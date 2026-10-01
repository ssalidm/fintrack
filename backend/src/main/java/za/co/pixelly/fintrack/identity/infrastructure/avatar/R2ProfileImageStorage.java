package za.co.pixelly.fintrack.identity.infrastructure.avatar;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import za.co.pixelly.fintrack.identity.application.avatar.ProfileImageStorage;
import za.co.pixelly.fintrack.identity.application.avatar.StoredProfileImage;

import java.util.Optional;
import java.util.UUID;

public class R2ProfileImageStorage
    implements ProfileImageStorage {

    private static final String KEY_PREFIX = "profile-avatars/";

    private final S3Client s3Client;
    private final String bucket;

    public R2ProfileImageStorage(
        S3Client s3Client,
        String bucket
    ) {
        this.s3Client = s3Client;
        this.bucket = bucket;
    }

    @Override
    public void store(
        UUID userId,
        StoredProfileImage image
    ) {
        PutObjectRequest request =
            PutObjectRequest
                .builder()
                .bucket(bucket)
                .key(keyFor(userId))
                .contentType(
                    image.contentType()
                )
                .contentLength(
                    (long)
                        image.bytes().length
                )
                .build();

        try {
            s3Client.putObject(
                request,
                RequestBody.fromBytes(
                    image.bytes()
                )
            );
        } catch (S3Exception exception) {
            throw new IllegalStateException(
                "Unable to store profile photo in R2",
                exception
            );
        }
    }

    @Override
    public Optional<StoredProfileImage> load(
        UUID userId
    ) {
        GetObjectRequest request =
            GetObjectRequest
                .builder()
                .bucket(bucket)
                .key(keyFor(userId))
                .build();

        try {
            ResponseBytes<GetObjectResponse> object =
                s3Client.getObjectAsBytes(
                    request
                );

            String contentType =
                object
                    .response()
                    .contentType();

            if (
                contentType == null
                    || contentType.isBlank()
            ) {
                throw new IllegalStateException(
                    "Stored profile photo is missing its content type"
                );
            }

            return Optional.of(
                new StoredProfileImage(
                    object.asByteArray(),
                    contentType
                )
            );
        } catch (S3Exception exception) {
            if (
                exception.statusCode()
                    == 404
            ) {
                return Optional.empty();
            }

            throw new IllegalStateException(
                "Unable to read profile photo from R2",
                exception
            );
        }
    }

    @Override
    public void delete(
        UUID userId
    ) {
        try {
            s3Client.deleteObject(
                request ->
                    request
                        .bucket(bucket)
                        .key(
                            keyFor(userId)
                        )
            );
        } catch (S3Exception exception) {
            throw new IllegalStateException(
                "Unable to delete profile photo from R2",
                exception
            );
        }
    }

    private String keyFor(
        UUID userId
    ) {
        return KEY_PREFIX + userId;
    }
}
