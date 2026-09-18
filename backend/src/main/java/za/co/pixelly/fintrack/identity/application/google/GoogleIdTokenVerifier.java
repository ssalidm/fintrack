package za.co.pixelly.fintrack.identity.application.google;

public interface GoogleIdTokenVerifier {

    GoogleIdentity verify(
        String credential
    );
}
