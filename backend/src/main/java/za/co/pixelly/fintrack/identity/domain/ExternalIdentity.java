package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "external_identities", schema = "identity",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_external_identities_provider_subject",
            columnNames = {
                "provider",
                "provider_subject"
            }
        ),
        @UniqueConstraint(
            name = "uq_external_identities_user_provider",
            columnNames = {
                "user_id",
                "provider"
            }
        )
    }
)
@Getter
public class ExternalIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ExternalIdentityProvider provider;

    @Column(name = "provider_subject", nullable = false, length = 255)
    private String providerSubject;

    @Column(name = "linked_at", nullable = false)
    private Instant linkedAt;


    protected ExternalIdentity() {
    }


    private ExternalIdentity(
        User user,
        ExternalIdentityProvider provider,
        String providerSubject,
        Instant linkedAt
    ) {
        this.user = user;
        this.provider = provider;
        this.providerSubject = providerSubject;
        this.linkedAt = linkedAt;
    }


    public static ExternalIdentity link(
        User user,
        ExternalIdentityProvider provider,
        String providerSubject,
        Instant now
    ) {
        return new ExternalIdentity(
            user,
            provider,
            providerSubject,
            now
        );
    }
}
