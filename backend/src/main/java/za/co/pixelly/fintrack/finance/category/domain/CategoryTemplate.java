package za.co.pixelly.fintrack.finance.category.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "category_templates", schema = "finance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CategoryTemplate {

    @Id
    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "category_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private CategoryType categoryType;

    @Column(name = "display_order", nullable = false)
    private short displayOrder;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
