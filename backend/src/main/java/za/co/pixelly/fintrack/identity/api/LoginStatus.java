package za.co.pixelly.fintrack.identity.api;

public enum LoginStatus {
    AUTHENTICATED,
    MFA_REQUIRED,
    EMAIL_VERIFICATION_REQUIRED,
    ACCOUNT_LINK_REQUIRED
}
