package za.co.pixelly.fintrack.identity.application;

import za.co.pixelly.fintrack.identity.api.RegisterRequest;
import za.co.pixelly.fintrack.identity.api.RegisterResponse;

public interface UserRegistrationService {

    public RegisterResponse register(RegisterRequest request);
}
