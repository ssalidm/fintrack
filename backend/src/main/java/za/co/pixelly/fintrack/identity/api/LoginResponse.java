package za.co.pixelly.fintrack.identity.api;


import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LoginResponse(
    LoginStatus status,
    TokenResponse tokens,
    MfaChallengeResponse mfaChallenge
) {

    public static LoginResponse authenticated(
        TokenResponse tokens
    ) {
        return new LoginResponse(
            LoginStatus.AUTHENTICATED,
            tokens,
            null
        );
    }

    public static LoginResponse mfaRequired(
        MfaChallengeResponse challenge
    ) {
        return new LoginResponse(
            LoginStatus.MFA_REQUIRED,
            null,
            challenge
        );
    }
}
