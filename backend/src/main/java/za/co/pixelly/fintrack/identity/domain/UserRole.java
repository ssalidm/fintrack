package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "user_roles", schema = "identity")
public class UserRole {

    @EmbeddedId
    private UserRoleId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("roleId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private ApplicationRole role;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id")
    private User assignedBy;

    protected UserRole() {
    }

    private UserRole(User user, ApplicationRole role) {
        this.user = user;
        this.role = role;
        this.id = new UserRoleId(user.getId(), role.getId());
        this.assignedAt = Instant.now();
    }

    public static UserRole assign(User user, ApplicationRole role) {
        return new UserRole(user, role);
    }
}
