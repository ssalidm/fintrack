package za.co.pixelly.fintrack.identity.application.avatar;

public record ProfileAvatarUpdateResult(
    boolean accepted,
    String message
) {

    public static ProfileAvatarUpdateResult success() {
        return new ProfileAvatarUpdateResult(
            true,
            "Profile photo updated successfully"
        );
    }

    public static ProfileAvatarUpdateResult failure(
        String message
    ) {
        return new ProfileAvatarUpdateResult(
            false,
            message
        );
    }
}
