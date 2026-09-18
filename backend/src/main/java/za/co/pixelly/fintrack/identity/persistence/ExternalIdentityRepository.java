package za.co.pixelly.fintrack.identity.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.identity.domain.ExternalIdentity;
import za.co.pixelly.fintrack.identity.domain.ExternalIdentityProvider;

import java.util.Optional;
import java.util.UUID;

public interface ExternalIdentityRepository extends JpaRepository<ExternalIdentity, UUID> {
    Optional<ExternalIdentity>
    findByProviderAndProviderSubject(
        ExternalIdentityProvider provider,
        String providerSubject
    );


    Optional<ExternalIdentity>
    findByUserIdAndProvider(
        UUID userId,
        ExternalIdentityProvider provider
    );
}
