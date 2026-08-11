package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.Util;
import za.co.pixelly.fintrack.common.exception.DuplicateEmailException;
import za.co.pixelly.fintrack.identity.api.RegisterRequest;
import za.co.pixelly.fintrack.identity.api.RegisterResponse;
import za.co.pixelly.fintrack.identity.domain.ApplicationRole;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserRole;
import za.co.pixelly.fintrack.identity.persistence.ApplicationRoleRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRoleRepository;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DefaultUserRegistrationService implements UserRegistrationService {

    private static final String DEFAULT_ROLE = "ROLE_USER";

    private final UserRepository userRepository;
    private final ApplicationRoleRepository applicationRoleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = Util.normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException();
        }

        ApplicationRole userRole = applicationRoleRepository.findByCode(DEFAULT_ROLE)
            .orElseThrow(() -> new IllegalStateException("Required role ROLE_USER is not configured"));

        User user = User.register(
            email,
            passwordEncoder.encode(request.password().trim()),
            request.firstName().trim(),
            request.lastName().trim()
        );

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateEmailException();
        }

        userRoleRepository.save(
            UserRole.assign(user, userRole)
        );

        emailVerificationService.issueFor(user);

        return RegisterResponse.from(user);

    }
}
