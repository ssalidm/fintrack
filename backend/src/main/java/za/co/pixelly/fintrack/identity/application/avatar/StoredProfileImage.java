package za.co.pixelly.fintrack.identity.application.avatar;

public record StoredProfileImage(
    byte[] bytes,
    String contentType
) {
}
