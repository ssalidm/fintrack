package za.co.pixelly.fintrack.identity.application.google;

public record GoogleIdentity(
    String subject,
    String email,
    boolean emailVerified,
    String givenName,
    String familyName,
    String name,
    String hostedDomain
) {
}
